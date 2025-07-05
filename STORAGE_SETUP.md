# 🗂️ Supabase Storage Kurulumu

## Adım 1: Storage Bucket Oluşturma

1. **Supabase Dashboard'a gidin**: https://supabase.com/dashboard
2. **Storage** menüsüne tıklayın (sol menüden)
3. **"New bucket"** butonuna tıklayın
4. Bucket bilgilerini doldurun:
   - **Name**: `products`
   - **Public bucket**: ✅ İşaretleyin (önemli!)
   - **Allowed MIME types**: `image/*` (tüm resim formatları)
   - **File size limit**: `5MB`
5. **"Create bucket"** butonuna tıklayın

## Adım 2: Storage Policies Kurulumu

Bucket oluşturduktan sonra, SQL Editor'e gidin ve şu kodları çalıştırın:

```sql
-- Storage policies
CREATE POLICY "Allow public read access" ON storage.objects 
FOR SELECT USING (bucket_id = 'products');

CREATE POLICY "Allow authenticated uploads" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'products');

CREATE POLICY "Allow authenticated updates" ON storage.objects 
FOR UPDATE WITH CHECK (bucket_id = 'products');

CREATE POLICY "Allow authenticated deletes" ON storage.objects 
FOR DELETE USING (bucket_id = 'products');
```

## Adım 3: Test Etme

1. Admin panele gidin: http://localhost:3000/admin/products/new
2. Yeni ürün oluşturmayı deneyin
3. Görsel upload artık çalışmalı

## Sorun Giderme

**Hata: "Storage bucket bulunamadı"**
- Bucket isminin tam olarak `products` olduğundan emin olun
- Bucket'ın **public** olarak işaretlendiğinden emin olun

**Hata: "Upload permission denied"**
- Yukarıdaki SQL policy'lerini çalıştırdığınızdan emin olun
- `.env.local` dosyasında SUPABASE_SERVICE_ROLE_KEY'in doğru olduğundan emin olun

**Hata: "Image not loading"**
- Bucket'ın public olduğundan emin olun
- URL formatının doğru olduğundan emin olun: `https://[project-id].supabase.co/storage/v1/object/public/products/[filename]`

## 📁 Dosya Yapısı

Başarıyla yüklenen dosyalar şu formatta isimlendirilir:
```
product-{productId}-{timestamp}.{extension}
```

Örnek: `product-123-1703123456789.jpg`

---

**Not:** Bu kurulum bir kerelik yapılır. Sonrasında tüm görsel yüklemeleri otomatik olarak çalışacaktır. 