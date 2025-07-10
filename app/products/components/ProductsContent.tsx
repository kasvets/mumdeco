'use client';

import React, { useState, useEffect, memo } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductGrid from './ProductGrid';
import FilterSidebar from './FilterSidebar';
import { supabase } from '@/lib/supabase-client';
import { Database } from '@/lib/supabase';
import { Filter, Search } from 'lucide-react';

type Product = Database['public']['Tables']['products']['Row'];

interface ProductFilters {
  category: string;
  priceRange: [number, number];
  sortBy: 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest';
  inStock: boolean;
  onSale: boolean;
}

export default function ProductsContent() {

  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const searchParams = useSearchParams();
  
  // HER RENDER'DA STATE'İ GÖSTER
  console.log('🎯 RENDER STATE:', {
    productsLength: products.length,
    loading,
    error,
    hasProducts: products.length > 0,
    searchTerm
  });
  
  const [filters, setFilters] = useState<ProductFilters>({
    category: '',
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
        setLoading(true);
        console.log('🔄 Loading from API route...');
        
        // Get search parameter from URL
        const searchParam = searchParams.get('search');
        const categoryParam = searchParams.get('category');
        
        // Build API URL with parameters
        const apiUrl = new URL('/api/debug/products', window.location.origin);
        if (searchParam) {
          apiUrl.searchParams.set('search', searchParam);
          setSearchTerm(searchParam);
        }
        if (categoryParam) {
          apiUrl.searchParams.set('category', categoryParam);
        }

        console.log('🔍 API URL:', apiUrl.toString());
        
        const response = await fetch(apiUrl.toString());
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
          if (searchParam) {
            setError(`"${searchParam}" için ürün bulunamadı`);
          } else {
            setError('API\'den ürün bulunamadı');
          }
        }
      } catch (err) {
        console.error('❌ Exception:', err);
        setError('Hata: ' + (err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [searchParams]); // Depend on searchParams to reload when search changes

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
          <p className="text-gray-600">
            {searchTerm ? `"${searchTerm}" araması yapılıyor...` : 'Ürünler yükleniyor...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-gray-100 rounded-full">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-2">{error}</p>
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
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-gray-100 rounded-full">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-2">
            {searchTerm ? `"${searchTerm}" için ürün bulunamadı` : 'Ürün bulunamadı'}
          </p>
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

  const filteredProducts = products.filter(product => {
    const matchesCategory = filters.category ? product.category.toLowerCase().includes(filters.category.toLowerCase()) : true;
    const matchesPrice = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1];
    const matchesSortBy = true; // Placeholder for sort logic
    const matchesInStock = filters.inStock ? product.in_stock : true;
    const matchesOnSale = filters.onSale ? product.is_new : true; // Using is_new instead of on_sale

    return matchesCategory && matchesPrice && matchesSortBy && matchesInStock && matchesOnSale;
  });

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const closeFilters = () => {
    setShowFilters(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden">
          <button
            onClick={toggleFilters}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white border-2 border-gray-200 rounded-xl hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
          >
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-700">Filtreler</span>
            <div className="ml-auto bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
              {filteredProducts.length}
            </div>
          </button>
        </div>

        {/* Filter Sidebar */}
        <div className={`
          lg:block lg:w-auto
          ${showFilters ? 'block' : 'hidden'}
        `}>
          <FilterSidebar 
            filters={filters} 
            onFiltersChange={setFilters}
            onClose={closeFilters}
            productsCount={filteredProducts.length}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {searchTerm ? `"${searchTerm}" Arama Sonuçları` : 'Ürünler'}
              </h1>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {filteredProducts.length} ürün
              </span>
            </div>
            
            {/* Search Results Info */}
            {searchTerm && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Search className="w-4 h-4" />
                <span>Arama: "{searchTerm}"</span>
              </div>
            )}


          </div>

          {/* Products Grid */}
          <ProductGrid 
            products={filteredProducts}
          />
        </div>
      </div>
    </div>
  );
} 