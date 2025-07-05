-- Adriatic ürününü Model-1 kategorisine ekle
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
) VALUES (
    'Adriatic - Model-1 Serisi',
    'Adriatic koleksiyonu, denizin sakinleştirici gücünü evinize getirir. Premium kalite soya wax ve özel harman kokular ile üretilmiştir. Uzun süre yanan bu mum, deniz esintisinin ferahlığını yaşam alanınıza taşır. Özel tasarım cam kapta sunulan bu ürün, hem aromaterapi hem de dekorasyon amaçlı kullanılabilir.',
    299.90,
    399.90,
    'model-1',
    '/Model1/Adriatic/m1a1.webp',
    true,
    true,
    4.8,
    156
); 