-- muscle-studio: private compressed photo storage.
-- Run once in this app's Supabase SQL Editor. Existing table data is unchanged.
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
VALUES('muscle-photos','muscle-photos',false,5242880,ARRAY['image/jpeg'])
ON CONFLICT(id) DO UPDATE SET public=false,file_size_limit=5242880,allowed_mime_types=EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "muscle-photos select own" ON storage.objects;
DROP POLICY IF EXISTS "muscle-photos insert own" ON storage.objects;
DROP POLICY IF EXISTS "muscle-photos delete own" ON storage.objects;

CREATE POLICY "muscle-photos select own" ON storage.objects
FOR SELECT TO authenticated USING(
bucket_id='muscle-photos' AND (storage.foldername(name))[1]=(SELECT auth.uid())::text);

CREATE POLICY "muscle-photos insert own" ON storage.objects
FOR INSERT TO authenticated WITH CHECK(
bucket_id='muscle-photos' AND (storage.foldername(name))[1]=(SELECT auth.uid())::text);

CREATE POLICY "muscle-photos delete own" ON storage.objects
FOR DELETE TO authenticated USING(
bucket_id='muscle-photos' AND (storage.foldername(name))[1]=(SELECT auth.uid())::text);
