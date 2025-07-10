'use client';

import { Filter, Grid, List } from 'lucide-react';
import { useState } from 'react';
import ProductCard from './ProductCard';
import { Database } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { useToast } from '@/components/Toast';

type Product = Database['public']['Tables']['products']['Row'];

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { addToCart } = useCart();
  const { showToast } = useToast();

  if (!products || products.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
        <p className="text-gray-500 text-sm sm:text-base">Henüz ürün bulunmuyor</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-primary">
              {products.length} ürün
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* View Mode Toggle - Hidden on mobile */}
          <div className="hidden sm:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === 'grid'
                  ? 'bg-white shadow-sm text-primary'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-white shadow-sm text-primary'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Sort Dropdown - Simplified on mobile */}
          <select className="text-xs sm:text-sm text-gray-600 bg-white border border-gray-200 rounded-lg px-2 sm:px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/20">
            <option value="featured">Öne Çıkanlar</option>
            <option value="price-low">Fiyat: Düşük → Yüksek</option>
            <option value="price-high">Fiyat: Yüksek → Düşük</option>
            <option value="newest">En Yeni</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className={
        viewMode === 'grid'
          ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6'
          : 'space-y-4'
      }>
        {products.map((product) => (
          <Link 
            key={product.id} 
            href={`/products/${product.id}`}
            className={`group relative bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-primary/20 transition-all duration-200 ${
              viewMode === 'list' ? 'flex flex-row' : ''
            }`}
          >
            {viewMode === 'grid' ? (
              // Grid View Layout
              <>
                <div className="aspect-square relative overflow-hidden">
                  <Image
                    src={product.image_url || '/mum2.jpeg'}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                  />
                  {product.is_new && (
                    <div className="absolute top-2 sm:top-3 left-2 sm:left-3 px-2 py-1 text-xs font-semibold text-white bg-primary rounded-full">
                      Yeni
                    </div>
                  )}
                </div>
                
                <div className="p-3 sm:p-4">
                  <h3 className="font-medium text-gray-900 mb-1 sm:mb-2 line-clamp-2 text-sm sm:text-base">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg sm:text-xl font-bold text-gray-900">
                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(product.price)}
                      </span>
                      {product.old_price && (
                        <span className="text-sm text-gray-500 line-through">
                          {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(product.old_price)}
                        </span>
                      )}
                    </div>
                    
                    {/* Add to Cart Button - Mobile optimized */}
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart(product);
                        showToast(`${product.name} sepete eklendi!`, 'success');
                      }}
                      className="p-2 sm:p-2.5 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all duration-200 group/btn"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </button>
                  </div>
                  

                </div>
              </>
            ) : (
              // List View Layout
              <>
                <div className="w-32 h-32 sm:w-40 sm:h-40 relative flex-shrink-0">
                  <Image
                    src={product.image_url || '/mum2.jpeg'}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 128px, 160px"
                  />
                  {product.is_new && (
                    <div className="absolute top-2 left-2 px-2 py-1 text-xs font-semibold text-white bg-primary rounded-full">
                      Yeni
                    </div>
                  )}
                </div>
                
                <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-2 text-base sm:text-lg">
                      {product.name}
                    </h3>
                    

                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl sm:text-2xl font-bold text-gray-900">
                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(product.price)}
                      </span>
                      {product.old_price && (
                        <span className="text-base text-gray-500 line-through">
                          {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(product.old_price)}
                        </span>
                      )}
                    </div>
                    
                                         {/* Add to Cart Button */}
                     <button 
                       onClick={(e) => {
                         e.preventDefault();
                         addToCart(product);
                         showToast(`${product.name} sepete eklendi!`, 'success');
                       }}
                       className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all duration-200 text-sm font-medium"
                     >
                       Sepete Ekle
                     </button>
                  </div>
                </div>
              </>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
} 