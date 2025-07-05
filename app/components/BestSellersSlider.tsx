'use client';

import Image from "next/image";
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
              {group.map((product) => {
                // İndirim yüzdesini hesapla
                const discountPercentage = product.old_price 
                  ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
                  : 0;

                return (
                  <div key={product.id} className="group relative bg-white rounded-xl overflow-hidden flex flex-col h-full border border-gray-100">
                    {/* Product Image */}
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <Image
                        src={product.image_url || '/Model1/Adriatic/m1a1.webp'}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {discountPercentage > 0 && (
                        <div className="absolute top-4 left-4 bg-red-500 text-white text-sm px-3 py-1 rounded-full">
                          İNDİRİM -{discountPercentage}%
                        </div>
                      )}
                      {product.is_new && (
                        <div className="absolute top-4 right-4 bg-green-600 text-white text-sm px-3 py-1 rounded-full">
                          YENİ
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-6 flex flex-col flex-grow">
                      {/* Price */}
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-xl font-medium">₺{product.price.toFixed(2)}</span>
                        {product.old_price && (
                          <span className="text-sm text-gray-400 line-through">₺{product.old_price.toFixed(2)}</span>
                        )}
                      </div>

                      {/* Title with fixed height */}
                      <div className="min-h-[3.5rem] mb-2">
                        <h3 className="text-lg font-medium line-clamp-2">{product.name}</h3>
                      </div>
                      
                      {/* Description */}
                      <div className="flex-grow">
                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                          {product.description || 'Bu ürün için açıklama bulunmamaktadır.'}
                        </p>
                      </div>

                      {/* Buy Button - Now consistently at bottom */}
                      <div className="pt-6">
                        <button className="w-full text-center py-3 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition-colors duration-300">
                          Satın Al
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation */}
      <div className="flex items-center justify-center gap-8 mt-12">
        <button 
          onClick={() => swiper?.slidePrev()}
          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-800 transition-colors duration-300"
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
          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-800 transition-colors duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
} 