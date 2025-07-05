-- Test ürünleri oluşturmak için SQL komutları
-- Bu komutları Supabase SQL Editor'da çalıştırın
-- NOT: Önce database-schema.sql dosyasını çalıştırın

-- Test ürünleri ekle
INSERT INTO products (
    name, 
    description, 
    price, 
    old_price, 
    category, 
    image_url, 
    is_new, 
    in_stock, 
    rating, 
    reviews
) VALUES 
-- Model-1 Adriatic
(
    'Adriatic - Model-1 Serisi',
    'Adriatic koleksiyonundan özel tasarım dekoratif mum. Benzersiz formu ve zarif görünümü ile mekanınıza şıklık katacak premium kalite mum. Uzun süre yanan özel fitil teknolojisi ile hem dekoratif hem de fonksiyonel kullanım sunar.',
    299.90,
    399.90,
    'model-1',
    '/Model1/Adriatic/m1a1.webp',
    true,
    true,
    4.8,
    12
),
-- Model-2 Test Ürünü
(
    'Crystal - Model-2 Serisi',
    'Model-2 serisinin öne çıkan ürünü Crystal. Modern tasarım ve şık görünüm ile dekorasyonunuza değer katacak premium mum.',
    349.90,
    449.90,
    'model-2',
    '/Model1/Adriatic/m1a2.webp',
    true,
    true,
    4.9,
    8
),
-- Model-3 Test Ürünü
(
    'Elegant - Model-3 Serisi',
    'Model-3 serisinin zarif temsilcisi Elegant. Sanatsal formu ve özel tasarımı ile mekanınıza sofistike bir hava katacak.',
    279.90,
    329.90,
    'model-3',
    '/Model1/Adriatic/m1a3.webp',
    false,
    true,
    4.7,
    15
),
-- Model-4 Test Ürünü
(
    'Luxury - Model-4 Serisi',
    'Model-4 serisinin lüks ürünü Luxury. Premium malzemeler ve özel üretim teknikleri ile hazırlanmış özel koleksiyon mumu.',
    449.90,
    549.90,
    'model-4',
    '/Model1/Adriatic/m1a4.webp',
    true,
    true,
    5.0,
    6
),
-- Model-5 Test Ürünü
(
    'Contemporary - Model-5 Serisi',
    'Model-5 serisinin çağdaş tasarımı Contemporary. Yenilikçi form ve modern estetik anlayışı ile geleceğin mum tasarımı.',
    329.90,
    null,
    'model-5',
    '/Model1/Adriatic/m1a5.webp',
    true,
    true,
    4.6,
    10
);

-- Test verilerini kontrol etmek için:
-- SELECT * FROM categories ORDER BY name;
-- SELECT * FROM products ORDER BY category, name; 