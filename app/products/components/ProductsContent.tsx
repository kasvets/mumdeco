'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductGrid from './ProductGrid';
import FilterSidebar from './FilterSidebar';
import { fetchProducts } from '../data/products';
import { Product } from '@/lib/supabase';

interface ProductFilters {
  category: string;
  priceRange: [number, number];
  sortBy: 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest';
  inStock: boolean;
  onSale: boolean;
}

export default function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ProductFilters>({
    category: searchParams.get('category') || '',
    priceRange: [0, 1000],
    sortBy: 'featured',
    inStock: false,
    onSale: false,
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Supabase'den ürünleri yükle
  useEffect(() => {
    const loadProducts = async () => {
      try {
        console.log('🔄 Loading products...');
        setLoading(true);
        const data = await fetchProducts();
        console.log('✅ Products loaded:', data.length, 'products');
        console.log('📦 Sample products:', data.slice(0, 2));
        setProducts(data);
      } catch (error) {
        console.error('❌ Error loading products:', error);
        setProducts([]); // Set empty array on error
      } finally {
        console.log('✨ Loading finished');
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // URL parametresi değiştiğinde filtreleri güncelle
  useEffect(() => {
    const category = searchParams.get('category') || '';
    setFilters(prev => ({
      ...prev,
      category
    }));
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Kategori filtresi
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Fiyat aralığı filtresi
    filtered = filtered.filter(product => 
      product.price >= filters.priceRange[0] && 
      product.price <= filters.priceRange[1]
    );

    // Stok durumu filtresi
    if (filters.inStock) {
      filtered = filtered.filter(product => product.in_stock);
    }

    // İndirim filtresi
    if (filters.onSale) {
      filtered = filtered.filter(product => product.old_price && product.old_price > product.price);
    }

    // Sıralama
    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => (b.is_new ? 1 : 0) - (a.is_new ? 1 : 0));
        break;
      default:
        // featured - varsayılan sıralama
        break;
    }

    return filtered;
  }, [products, filters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ürünler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Henüz ürün bulunmamaktadır.</p>
          <p className="text-sm text-gray-500">Lütfen daha sonra tekrar deneyiniz.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-8">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-full lg:h-auto
        w-80 lg:w-72 bg-white lg:bg-transparent
        z-50 lg:z-auto
        transform lg:transform-none transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:flex-shrink-0
      `}>
        <FilterSidebar
          filters={filters}
          onFiltersChange={setFilters}
          onClose={() => setSidebarOpen(false)}
          productsCount={filteredProducts.length}
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <ProductGrid
          products={filteredProducts}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />
      </main>
    </div>
  );
} 