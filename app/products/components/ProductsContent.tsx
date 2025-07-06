'use client';

import React, { useState, useEffect, memo } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductGrid from './ProductGrid';
import FilterSidebar from './FilterSidebar';
import { supabase } from '@/lib/supabase-client';
import { Database } from '@/lib/supabase';

type Product = Database['public']['Tables']['products']['Row'];

interface ProductFilters {
  category: string;
  priceRange: [number, number];
  sortBy: 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest';
  inStock: boolean;
  onSale: boolean;
}

const ProductsContent = memo(function ProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  
  // HER RENDER'DA STATE'İ GÖSTER
  console.log('🎯 RENDER STATE:', {
    productsLength: products.length,
    loading,
    error,
    hasProducts: products.length > 0
  });
  
  const [filters, setFilters] = useState<ProductFilters>({
    category: searchParams.get('category') || '',
    priceRange: [0, 1000],
    sortBy: 'featured',
    inStock: false,
    onSale: false,
  });

  // SADECE BİR KEZ VERİ YÜKLE - EN BASIT HALİ
  useEffect(() => {
    console.log('🏗️ Component mounted - loading products...');
    
    async function loadProducts() {
      try {
        console.log('🔄 Loading from API route...');
        
        const response = await fetch('/api/debug/products');
        const result = await response.json();

        console.log('📊 API response:', { status: response.status, data: result });
        
        if (!response.ok) {
          console.error('❌ API Error:', result);
          setError(`API Error: ${result.error || 'Unknown error'}`);
        } else if (result.products && result.products.length > 0) {
          console.log('✅ Setting API products:', result.products.length);
          console.log('🔍 First product:', result.products[0]);
          console.log('🖼️ Image URLs check:', result.products.map((p: any) => ({ 
            name: p.name, 
            image_url: p.image_url,
            hasImage: !!p.image_url 
          })));
          setProducts(result.products);
        } else {
          console.log('⚠️ No products found via API');
          setError('API\'den ürün bulunamadı');
        }
      } catch (err) {
        console.error('❌ Exception:', err);
        setError('Hata: ' + (err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []); // BOŞ DEPENDENCY - SADECE BİR KEZ ÇALIŞ

  // URL parametresi değiştiğinde filtreleri güncelle
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      category: searchParams.get('category') || ''
    }));
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-gray-600">Ürünler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-2">Hata: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Sayfayı Yenile
          </button>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600 mb-2">Ürün bulunamadı</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Sayfayı Yenile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
      <FilterSidebar
        filters={filters}
        onFiltersChange={setFilters}
        onClose={() => setSidebarOpen(false)}
        productsCount={products.length}
      />
      <ProductGrid
        products={products}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />
    </div>
  );
});

export default ProductsContent; 