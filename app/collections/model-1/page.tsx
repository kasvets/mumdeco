'use client';

import { useEffect, useState } from 'react';
import { fetchProductsByCategory } from '@/app/products/data/products';
import { Product as SupabaseProduct } from '@/lib/supabase';
import ProductCard from '@/app/products/components/ProductCard';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';

// Supabase Product'ı ProductCard'ın beklediği formata dönüştür
const convertSupabaseProduct = (product: SupabaseProduct) => ({
  id: product.id,
  name: product.name,
  description: product.description || '',
  price: product.price,
  oldPrice: product.old_price || undefined,
  rating: product.rating || 0,
  reviews: product.reviews || 0,
  image: product.image_url || '',
  isNew: product.is_new,
  inStock: product.in_stock,
  category: product.category,
  discount: product.old_price ? Math.round(((product.old_price - product.price) / product.old_price) * 100) : undefined
});

export default function Model1CollectionPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const categoryProducts = await fetchProductsByCategory('model-1');
        const convertedProducts = categoryProducts.map(convertSupabaseProduct);
        setProducts(convertedProducts);
      } catch (error) {
        console.error('Model-1 ürünleri yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Toscana koleksiyonu yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Ana Sayfaya Dön
          </Link>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Toscana</h1>
              <p className="text-gray-600 mt-2">
                Toscana koleksiyonu - İtalyan esintileri taşıyan özel tasarım mumlar
              </p>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} viewMode="grid" />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Henüz ürün bulunmuyor
            </h3>
            <p className="text-gray-600 mb-8">
              Toscana koleksiyonu ürünleri yakında eklenecek. Diğer koleksiyonlarımızı inceleyebilirsiniz.
            </p>
            <Link 
              href="/products" 
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors"
            >
              <span>Tüm Ürünleri Gör</span>
            </Link>
          </div>
        )}

        {/* Collection Info */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Toscana Hakkında</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Toscana Tasarımı</h3>
              <p className="text-gray-600">
                Toscana koleksiyonu, İtalyan Toscana bölgesinin doğal güzelliklerinden ilham alıyor. 
                Sıcak toprak tonları ve organik formlarla mekanınıza Akdeniz esintileri katıyor.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Premium Kalite</h3>
              <p className="text-gray-600">
                Sadece en kaliteli malzemelerden üretilen Toscana koleksiyonu mumlar, 
                uzun yanma süresi ve temiz alev özelliği ile günlük kullanımda mükemmel performans sunar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 