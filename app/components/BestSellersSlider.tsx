'use client';

import Link from "next/link";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { useState } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import { Product } from '@/lib/supabase';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

const SLIDE_DELAY = 5000;

interface BestSellersSliderProps {
  products: Product[];
}

export default function BestSellersSlider({ products }: BestSellersSliderProps) {
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Debug: Sadece gerekli olan image_url bilgisini göster
  console.log('BestSellersSlider - Total products:', products.length);
  products.forEach((product, index) => {
    console.log(`Product ${index + 1}: ${product.name} - Image URL: ${product.image_url ? 'EXISTS' : 'MISSING'}`);
  });

  // Grup ürünleri 4'lü gruplara ayır
  const productGroups = [];
  for (let i = 0; i < products.length; i += 4) {
    productGroups.push(products.slice(i, i + 4));
  }

  return (
    <div>
      <Swiper
        modules={[Navigation]}
        onSwiper={setSwiper}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        slidesPerView={1}
        spaceBetween={32}
        loop={true}
      >
        {productGroups.map((group, groupIndex) => (
          <SwiperSlide key={groupIndex}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {group.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 hover:border-gray-200"
                >
                  {/* Product Image */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          console.error('Database image failed to load:', product.image_url, 'for product:', product.name);
                        }}
                        onLoad={() => {
                          console.log('Database image loaded successfully:', product.image_url, 'for product:', product.name);
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <p className="text-gray-500 text-sm">Görsel yükleniyor...</p>
                      </div>
                    )}
                    {/* Modern overlay efekti */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
                    
                    {/* Sadece rating varsa göster */}
                    {product.rating && (
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-800 text-sm px-3 py-1.5 rounded-full shadow-sm">
                        ★ {product.rating.toFixed(1)}
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-gray-700 transition-colors">
                      {product.name}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                      {product.description || 'Bu ürün için açıklama bulunmamaktadır.'}
                    </p>

                    {/* Price */}
                    <div className="mb-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900">₺{product.price.toFixed(2)}</span>
                        {product.old_price && (
                          <span className="text-sm text-gray-400 line-through">₺{product.old_price.toFixed(2)}</span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // Sepete ekle fonksiyonu burada çağrılacak
                          console.log('Sepete eklendi:', product.name);
                        }}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2.5 px-4 rounded-full text-sm font-medium transition-colors duration-200"
                      >
                        Sepete Ekle
                      </button>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // Satın al fonksiyonu burada çağrılacak
                          console.log('Satın alındı:', product.name);
                        }}
                        className="flex-1 bg-gray-800 hover:bg-gray-900 text-white py-2.5 px-4 rounded-full text-sm font-medium transition-colors duration-200"
                      >
                        Satın Al
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation */}
      <div className="flex items-center justify-center gap-8 mt-12">
        <button 
          onClick={() => swiper?.slidePrev()}
          className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-gray-800 transition-colors duration-300 rounded-full hover:bg-gray-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        {/* Custom Pagination */}
        <div className="flex items-center gap-3">
          {productGroups.map((_, index) => (
            <button
              key={index}
              onClick={() => swiper?.slideTo(index)}
              className={`h-2 transition-all duration-300 rounded-full ${
                activeIndex === index 
                  ? 'w-8 bg-gray-800' 
                  : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        <button 
          onClick={() => swiper?.slideNext()}
          className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-gray-800 transition-colors duration-300 rounded-full hover:bg-gray-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
} 