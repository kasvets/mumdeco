'use client';

import { Filter, Grid, List } from 'lucide-react';
import { useState } from 'react';
import ProductCard from './ProductCard';
import { Product } from '@/lib/supabase';

interface ProductGridProps {
  products: Product[];
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export default function ProductGrid({ products, onToggleSidebar, sidebarOpen }: ProductGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-8 p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden flex items-center gap-2 px-4 py-3 text-gray-600 hover:text-white bg-gray-100 hover:bg-primary border border-gray-200 hover:border-primary rounded-xl transition-all duration-200 font-medium"
          >
            <Filter className="w-4 h-4" />
            Filtreler
          </button>
          
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-xl">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-primary">
                {products.length} ürün bulundu
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-3 rounded-lg transition-all duration-200 ${
              viewMode === 'grid' 
                ? 'bg-white text-primary shadow-sm' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-3 rounded-lg transition-all duration-200 ${
              viewMode === 'list' 
                ? 'bg-white text-primary shadow-sm' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Products Grid/List */}
      {products.length > 0 ? (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        }>
          {products.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              viewMode={viewMode}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Filter className="w-12 h-12 text-gray-400" />
            </div>
            <div className="w-16 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto mb-6"></div>
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">
            Hiç ürün bulunamadı
          </h3>
          <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
            Aradığınız kriterlere uygun ürün bulunamadı. 
            Filtreleme seçeneklerinizi değiştirmeyi deneyin.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium">
              Filtreleri Temizle
            </button>
            <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium">
              Tüm Ürünleri Gör
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 