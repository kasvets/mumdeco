# 🚀 MumDeco Admin Panel Kurulum Rehberi

Bu rehber, admin panelini ve Supabase entegrasyonunu adım adım kurmanız için hazırlanmıştır.

## 📋 Gereksinimler

- Supabase hesabı (ücretsiz tier yeterli)
- Node.js (v18+)
- NPM/Yarn

## 🔧 1. Supabase Projesi Oluşturma

1. [Supabase](https://supabase.com) hesabınıza giriş yapın
2. "New Project" butonuna tıklayın
3. Proje adı: `mumdeco-admin`
4. Database password oluşturun (güvenli tutun!)
5. Region seçin (Türkiye için Frankfurt önerilidir)

## 🗄️ 2. Database Schema Kurulumu

1. Supabase Dashboard → SQL Editor'e gidin
2. `database-schema.sql` dosyasındaki tüm SQL kodunu kopyalayın
3. SQL Editor'de çalıştırın
4. Tablolar ve politikalar otomatik olarak oluşacak

## 🔑 3. Environment Variables Kurulumu

Proje kök dizininde `.env.local` dosyası oluşturun:

```bash
# Supabase Konfigürasyonu
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Admin paneli için (opsiyonel)
ADMIN_EMAIL=admin@mumdeco.com
ADMIN_PASSWORD=your-admin-password
```

### Bilgileri Nereden Alırsınız?

1. Supabase Dashboard → Settings → API
2. Project URL = `NEXT_PUBLIC_SUPABASE_URL`
3. anon/public key = `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. service_role key = `SUPABASE_SERVICE_ROLE_KEY`

## 📁 4. Storage Bucket Oluşturma (Görseller için)

1. Supabase Dashboard → Storage'e gidin
2. "New bucket" → `product-images`
3. Public bucket olarak işaretleyin
4. SQL Editor'de şu komutu çalıştırın:

```sql
-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Storage policies
CREATE POLICY "Allow public access" ON storage.objects 
FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Allow authenticated uploads" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
```

## 🎯 5. Admin Panel Sayfaları

Aşağıdaki sayfalar otomatik olarak oluşturuldu:

- `/admin/dashboard` - Ana dashboard
- `/admin/products` - Ürün listesi
- `/admin/products/new` - Yeni ürün ekleme
- `/admin/products/[id]/edit` - Ürün düzenleme

## 🔐 6. Admin Authentication (Güvenlik)

**Basit Yöntem:**
- Şimdilik authentication yok, direkt erişim var
- Production'da mutlaka authentication ekleyin

**Gelişmiş Yöntem:**
```typescript
// middleware.ts (opsiyonel)
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }
  
  return NextResponse.next()
}
```

## 🚀 7. İlk Ürün Ekleme

1. Projeyi çalıştırın: `npm run dev`
2. `http://localhost:3000/admin/dashboard` adresine gidin
3. "Yeni Ürün Ekle" butonuna tıklayın
4. Formu doldurun ve "Ürün Ekle" deyin
5. Ürün Supabase'e kaydedilecek

## 📊 8. Frontend'de Kullanım

Products sayfanızda artık Supabase'den veri çekilir:

```typescript
// Örnek kullanım
import { fetchProducts } from '@/app/products/data/products'

const ProductsPage = async () => {
  const products = await fetchProducts()
  
  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

## 🛠️ 9. Mevcut Fonksiyonlar

### Ürün İşlemleri:
- `fetchProducts()` - Tüm aktif ürünler
- `fetchProductsByCategory(category)` - Kategoriye göre ürünler
- `fetchProductById(id)` - Tek ürün
- `fetchNewProducts(limit)` - Yeni ürünler
- `fetchFeaturedProducts(limit)` - Öne çıkan ürünler

### Kategori İşlemleri:
- `fetchCategories()` - Tüm kategoriler

## 🔄 10. Gerçek Zamanlı Güncellemeler (Opsiyonel)

```typescript
// Real-time updates
useEffect(() => {
  const channel = supabase
    .channel('products')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'products' },
      (payload) => {
        console.log('Change received!', payload)
        // Ürün listesini yenile
      }
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}, [])
```

## 🎨 11. Görsel Upload (Gelişmiş)

Gerçek Supabase Storage entegrasyonu için:

```typescript
const uploadImage = async (file: File) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random()}.${fileExt}`
  const filePath = `products/${fileName}`

  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file)

  if (error) throw error
  
  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath)

  return publicUrl
}
```

## 🐛 12. Troubleshooting

### Yaygın Hatalar:

**"Invalid API key"**
- `.env.local` dosyanızı kontrol edin
- API key'lerin doğru kopyalandığından emin olun

**"Table 'products' doesn't exist"**
- `database-schema.sql` dosyasını çalıştırdığınızdan emin olun

**"Permission denied"**
- RLS politikalarının doğru kurulduğunu kontrol edin

### Log Kontrolü:
- Browser console'unu açık tutun
- Network tab'da Supabase isteklerini kontrol edin

## 📈 13. Production'a Çıkarken

1. Environment variables'ları production server'da ayarlayın
2. Authentication sistemi ekleyin
3. Rate limiting uygulayın
4. Error handling iyileştirin
5. Loading states iyileştirin

## 🎉 Tebrikler!

Admin paneliniz hazır! Artık `/admin/dashboard` üzerinden ürünlerinizi yönetebilirsiniz.

### 📞 Destek

Herhangi bir sorun yaşarsanız:
1. Console log'larını kontrol edin
2. Supabase Dashboard → Logs bölümünü inceleyin
3. Bu rehberi tekrar gözden geçirin

---

**Not:** Bu kurulum geliştirme ortamı içindir. Production'da ek güvenlik önlemleri alınmalıdır. 