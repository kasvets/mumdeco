-- MumDeco Admin Panel Database Schema
-- Bu SQL komutlarını Supabase SQL editöründe çalıştırın

-- Products tablosu
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    old_price DECIMAL(10, 2),
    category TEXT NOT NULL,
    image_url TEXT,
    is_new BOOLEAN DEFAULT false,
    in_stock BOOLEAN DEFAULT true,
    rating DECIMAL(2, 1) CHECK (rating >= 1 AND rating <= 5),
    reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories tablosu
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Eski kategorileri sil (eğer varsa)
DELETE FROM categories WHERE slug IN ('afrodisiac', 'aromatherapy', 'romantic', 'decorative', 'premium', 'zen', 'seasonal');

-- Model serisi kategorilerini ekle
INSERT INTO categories (name, slug, description) VALUES 
('Model-1', 'model-1', 'Model-1 serisi özel tasarım mumlar'),
('Model-2', 'model-2', 'Model-2 serisi özel tasarım mumlar'),
('Model-3', 'model-3', 'Model-3 serisi özel tasarım mumlar'),
('Model-4', 'model-4', 'Model-4 serisi özel tasarım mumlar'),
('Model-5', 'model-5', 'Model-5 serisi özel tasarım mumlar'),
('Model-6', 'model-6', 'Model-6 serisi özel tasarım mumlar'),
('Model-7', 'model-7', 'Model-7 serisi özel tasarım mumlar'),
('Model-8', 'model-8', 'Model-8 serisi özel tasarım mumlar'),
('Model-9', 'model-9', 'Model-9 serisi özel tasarım mumlar');

-- Updated_at otomatik güncellemesi için trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) politikaları
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Herkese okuma izni ver
CREATE POLICY "Allow public read access on products" ON products
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access on categories" ON categories
    FOR SELECT USING (true);

-- Admin kullanıcılar için tam erişim (authenticated users)
CREATE POLICY "Allow admin full access on products" ON products
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin full access on categories" ON categories
    FOR ALL USING (auth.role() = 'authenticated');

-- Indexes for better performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_in_stock ON products(in_stock);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_products_rating ON products(rating DESC);

-- Storage bucket for product images (Supabase Storage)
-- Bu komutu Supabase Storage kısmında çalıştırın:
-- 
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
--
-- Storage policy:
-- CREATE POLICY "Allow public access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
-- CREATE POLICY "Allow authenticated uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated'); 