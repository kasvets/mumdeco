-- Mevcut policy'leri sil ve yeniden oluştur
-- Bu SQL'i Supabase SQL Editor'da çalıştırın

-- Mevcut policy'leri sil
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;

-- Yeni policy'leri oluştur
CREATE POLICY "Allow public read access" ON storage.objects 
FOR SELECT USING (bucket_id = 'products');

CREATE POLICY "Allow authenticated uploads" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'products');

CREATE POLICY "Allow authenticated updates" ON storage.objects 
FOR UPDATE WITH CHECK (bucket_id = 'products');

CREATE POLICY "Allow authenticated deletes" ON storage.objects 
FOR DELETE USING (bucket_id = 'products');

-- Policy'lerin başarıyla oluşturulduğunu kontrol et
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'; 