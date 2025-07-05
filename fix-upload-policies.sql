-- INSERT ve UPDATE policy'lerini düzelt
-- Bu SQL'i Supabase SQL Editor'da çalıştırın

-- Upload policy'sini düzelt
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
CREATE POLICY "Allow authenticated uploads" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'products');

-- Update policy'sini düzelt  
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
CREATE POLICY "Allow authenticated updates" ON storage.objects 
FOR UPDATE WITH CHECK (bucket_id = 'products');

-- Kontrol et
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage' 
ORDER BY policyname; 