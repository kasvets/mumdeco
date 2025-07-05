-- Bucket'ı kontrol et
-- Bu SQL'i Supabase SQL Editor'da çalıştırın

-- Mevcut bucket'ları listele
SELECT * FROM storage.buckets;

-- Products bucket'ını özel olarak kontrol et
SELECT * FROM storage.buckets WHERE id = 'products';

-- Eğer bucket yoksa oluştur
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('products', 'products', true, 52428800, ARRAY['image/*'])
ON CONFLICT (id) DO NOTHING;

-- Tekrar kontrol et
SELECT * FROM storage.buckets WHERE id = 'products'; 