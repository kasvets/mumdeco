'use client';

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { useState } from 'react';
import type { Swiper as SwiperType } from 'swiper';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

const SLIDE_DELAY = 5000;

type Collection = {
  id: string;
  name: string;
  description: string;
  image: string | null;
  link: string;
  productCount: number;
}

interface CollectionSliderProps {
  collections: Collection[];
}

export default function CollectionSlider({ collections }: CollectionSliderProps) {
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Calculate total number of slides
  const totalSlides = Math.ceil(collections.length / 4);

  return (
    <div className="relative">
      <Swiper
        modules={[Navigation]}
        onSwiper={setSwiper}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        slidesPerView={1}
        loop={true}
        className="pb-16"
      >
        {Array.from({ length: totalSlides }).map((_, slideIndex) => (
          <SwiperSlide key={slideIndex}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {collections.slice(slideIndex * 4, (slideIndex + 1) * 4).map((collection) => (
                <Link 
                  key={collection.id} 
                  href={collection.link}
                  className="group relative overflow-hidden"
                >
                  <div className="aspect-[4/5] relative overflow-hidden rounded-lg">
                    <Image
                      src={collection.image || '/mumdeco2.jpg'}
                      alt={collection.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                      <h3 className="text-xl font-serif mb-2 text-white">{collection.name}</h3>
                      <p className="text-sm text-white/90">
                        {collection.description}
                        {collection.productCount > 0 && (
                          <span className="block mt-1 text-xs text-white/70">
                            {collection.productCount} ürün
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation and Pagination */}
      <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-8">
        <button 
          onClick={() => swiper?.slidePrev()}
          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-800 transition-colors duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        {/* Custom Pagination */}
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => swiper?.slideTo(index)}
              className={`h-2 transition-all duration-300 rounded-full ${
                index === activeIndex 
                  ? 'w-8 bg-gray-800' 
                  : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        <button 
          onClick={() => swiper?.slideNext()}
          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-800 transition-colors duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
} 