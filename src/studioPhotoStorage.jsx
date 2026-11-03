import React,{useEffect,useState}from'react';
import{createClient}from'@supabase/supabase-js';
const url=import.meta.env.VITE_SUPABASE_URL;
const key=import.meta.env.VITE_SUPABASE_ANON_KEY;
const client=url&&key?createClient(url,key):null;
const prefix='studio-storage:';
const cache=new Map();
export const storedImage=x=>typeof x==='string'&&x.startsWith(prefix);
export async function uploadStudioPhoto(file,bucket,quality,maxWidth){
 if(!client)throw Error('사진 업로드에는 Supabase 연결이 필요해.');
 const{data:{user},error:userError}=await client.auth.getUser();
 if(userError||!user)throw Error('사진 업로드 전에 로그인해 줘.');
 if(!file?.type?.startsWith('image/'))throw Error('이미지 파일만 등록할 수 있어.');
 if(file.size>10*1024*1024)throw Error('사진은 10MB 이하로 선택해 줘.');
 const blob=await new Promise((resolve,reject)=>{
   const image=new Image(),objectUrl=URL.createObjectURL(file);
   image.onload=()=>{const canvas=document.createElement('canvas'),scale=Math.min(1,maxWidth/Math.max(image.width,image.height));canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);URL.revokeObjectURL(objectUrl);canvas.toBlob(b=>b?resolve(b):reject(Error('사진 압축 실패')),'image/jpeg',quality)};
   image.onerror=()=>{URL.revokeObjectURL(objectUrl);reject(Error('사진을 불러오지 못했어.'))};image.src=objectUrl;
 });
 const path=user.id+'/'+crypto.randomUUID()+'.jpg';
 const {error}=await client.storage.from(bucket).upload(path,blob,{contentType:'image/jpeg',upsert:false});
 if(error)throw Error('Storage 업로드 실패: '+error.message+' · 먼저 사진 저장소 SQL을 실행해 줘.');
 return prefix+path;
}
export async function photoDisplayUrl(value,bucket){
 if(!storedImage(value))return value||'';
 const key=bucket+':'+value,entry=cache.get(key);
 if(entry&&entry.expire>Date.now())return entry.url;
 if(!client)return '';
 const{data,error}=await client.storage.from(bucket).createSignedUrl(value.slice(prefix.length),3600);
 if(error)throw error;
 cache.set(key,{url:data.signedUrl,expire:Date.now()+50*60*1000});
 return data.signedUrl;
}
export function StudioImage({value,bucket,alt='',...props}){
 const[src,setSrc]=useState(storedImage(value)?'':value||'');
 useEffect(()=>{let active=true;photoDisplayUrl(value,bucket).then(src=>{if(active)setSrc(src)}).catch(()=>{if(active)setSrc('')});return()=>{active=false}},[value,bucket]);
 return <img {...props} src={src||undefined} alt={alt}/>;
}
export function StorageUsage({bucket}){
 const[count,setCount]=useState(null),[size,setSize]=useState(0);
 useEffect(()=>{let active=true;(async()=>{if(!client)return;const{data:{user}}=await client.auth.getUser();if(!user)return;let offset=0,n=0,bytes=0;while(offset<10000){const{data,error}=await client.storage.from(bucket).list(user.id,{limit:1000,offset});if(error)throw error;for(const file of data||[]){if(file.name){n++;bytes+=Number(file.metadata?.size||0)}}if((data||[]).length<1000)break;offset+=1000;}if(active){setCount(n);setSize(bytes)}})().catch(()=>{if(active)setCount(null)});return()=>{active=false}},[bucket]);
 return <div className="studio-storage-usage"><strong>사진 저장 공간</strong><small>{count===null?'Storage 설정 후 표시':count.toLocaleString()+'장 · '+(size/1048576).toFixed(1)+' MB'}</small><small>이 앱에서 새로 올린 사진 기준</small></div>
}
