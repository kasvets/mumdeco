'use client';

import { Filter, Grid, List } from 'lucide-react';
import { useState } from 'react';
import ProductCard from './ProductCard';
import { Database } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';

type Product = Database['public']['Tables']['products']['Row'];

interface ProductGridProps {
  products: Product[];
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export default function ProductGrid({ products, onToggleSidebar, sidebarOpen }: ProductGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  if (!products || products.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Henüz ürün bulunmuyor</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-white bg-gray-100 hover:bg-primary border border-gray-200 hover:border-primary rounded-lg transition-all duration-200 font-medium text-sm"
          >
            <Filter className="w-4 h-4" />
            Filtreler
          </button>
          
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-primary">
                {products.length} ürün bulundu
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-all duration-200 ${
              viewMode === 'grid' 
                ? 'bg-white text-primary shadow-sm' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-all duration-200 ${
              viewMode === 'list' 
                ? 'bg-white text-primary shadow-sm' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Products Grid/List */}
      <div className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-6'
          : 'space-y-4'
      }>
        {products.map((product) => (
          <Link 
            key={product.id} 
            href={`/products/${product.id}`}
            className="group relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-primary/20 transition-all duration-200"
          >
            <div className="aspect-square relative overflow-hidden">
              <Image
                src={product.image_url || '/mum2.jpeg'}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              />
              {product.is_new && (
                <div className="absolute top-3 left-3 px-2 py-1 text-xs font-semibold text-white bg-primary rounded-full">
                  Yeni
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-1">{product.name}</h3>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-primary">
                    {product.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </span>
                  {product.old_price && product.old_price > product.price && (
                    <span className="text-sm text-gray-500 line-through">
                      {product.old_price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </span>
                  )}
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="px-2 py-1 text-xs font-medium text-primary bg-primary/10 rounded-full">
                    Görüntüle
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 