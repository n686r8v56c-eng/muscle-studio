import React,{useMemo,useState} from 'react';
import './LearningNotes.css';
export default function LearningNotes({skills=[],bookmarks=[],evaluations=[],kind='skill'}){
 const [major,setMajor]=useState('전체'),[minor,setMinor]=useState('전체'),[skillId,setSkillId]=useState('전체'),[noteType,setNoteType]=useState('전체'),[query,setQuery]=useState('');
 const majors=[...new Set(skills.map(s=>s.category).filter(Boolean))];
 const minorOptions=[...new Set(skills.filter(s=>major==='전체'||s.category===major).map(s=>s.subcategory).filter(Boolean))];
 const matching=skills.filter(s=>(major==='전체'||s.category===major)&&(minor==='전체'||s.subcategory===minor)&&(skillId==='전체'||s.id===skillId));
 const entries=useMemo(()=>matching.flatMap(skill=>{
   const photo=skill.photo||skill.images?.[0]?.url||skill.images?.[0]?.src||skill.photos?.find(p=>p.primary)?.url||skill.photos?.[0]?.url||skill.photos?.[0]?.src||null;
   const basic={skillId:skill.id,skill:skill.name,category:skill.category||'',subcategory:skill.subcategory||'',representativePhoto:photo};
   const caution=bookmarks.flatMap(b=>(b.segments||b.clips||[]).filter(c=>(c.skillId||c.moveId)===skill.id&&c.caution?.trim()).map(c=>({...basic,type:'주의할 점',content:c.caution,bookmarkTitle:b.title||'',bookmarkId:b.id,start:c.start,end:c.end,at:null})));
   const reviews=evaluations.filter(h=>h.skillId===skill.id&&h.memo?.trim()||h.skillId===skill.id&&h.note?.trim()).map(h=>({...basic,type:'연습 메모',content:h.memo||h.note,at:h.at||null,status:h.status||'',source:h.source||'',bookmarkId:h.bookmarkId||null}));
   return [...caution,...reviews]
 }),[matching,bookmarks,evaluations]);
 const shown=entries.filter(x=>(noteType==='전체'||x.type===noteType)&&[x.skill,x.category,x.subcategory,x.content,x.bookmarkTitle].join(' ').toLowerCase().includes(query.toLowerCase()));
 const [copied,setCopied]=useState('');
 const copyNote=async (note,key)=>{try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(note)}else{const el=document.createElement('textarea');el.value=note;el.style.position='fixed';el.style.opacity='0';document.body.appendChild(el);el.select();const ok=document.execCommand('copy');el.remove();if(!ok)throw Error('copy');}setCopied(key)}catch{setCopied('error')}};
 const download=()=>{const output={schemaVersion:1,app:kind,exportedAt:new Date().toISOString(),filters:{category:major,subcategory:minor,skillId,type:noteType,search:query},count:shown.length,notes:shown};const blob=new Blob([JSON.stringify(output,null,2)],{type:'application/json;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=kind+'-learning-notes-'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)};
 return <div className="learning-notes">
  <div className="learning-notes-filters">
  <select aria-label="대분류" value={major} onChange={e=>{setMajor(e.target.value);setMinor('전체');setSkillId('전체')}}><option value="전체">전체 대분류</option>{majors.map(x=><option key={x} value={x}>{x}</option>)}</select>
  <select aria-label="소분류" value={minor} onChange={e=>{setMinor(e.target.value);setSkillId('전체')}}><option value="전체">전체 소분류</option>{minorOptions.map(x=><option key={x} value={x}>{x}</option>)}</select>
  <select aria-label="기술" value={skillId} onChange={e=>setSkillId(e.target.value)}><option value="전체">전체 기술</option>{skills.filter(s=>(major==='전체'||s.category===major)&&(minor==='전체'||s.subcategory===minor)).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>
  <select aria-label="메모 종류" value={noteType} onChange={e=>setNoteType(e.target.value)}><option>전체</option><option>주의할 점</option><option>연습 메모</option></select>
  </div>
  <input className="learning-notes-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="기술·메모 내용 검색"/>
  <div className="learning-notes-header"><b>학습 노트 {shown.length}개</b><button type="button" onClick={download}>JSON 다운로드</button></div>
  {shown.map((n,i)=><div className="learning-notes-entry" key={n.type+'-'+n.skillId+'-'+i}>{n.representativePhoto&&<img src={n.representativePhoto} alt="" loading="lazy"/>}<div><b>{n.skill}</b><small>{n.category} · {n.subcategory} · {n.type}</small>{n.bookmarkTitle&&<small>{n.bookmarkTitle} · {n.start}–{n.end}</small>}{n.at&&<small>{new Date(n.at).toLocaleDateString('ko-KR')} · {n.status||''}</small>}<div className="learning-notes-copyrow"><p>{n.content}</p><button type="button" aria-label="메모 복사" onClick={()=>copyNote(n.content,n.type+'-'+n.skillId+'-'+i)}>{copied===n.type+'-'+n.skillId+'-'+i?'복사됨':'복사'}</button></div></div></div>)}
  {!shown.length&&<p className="learning-notes-empty">선택한 조건에 해당하는 메모가 없어.</p>}
 </div>
}