'use client';

import Image from "next/image";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules';
import { useState, useEffect } from 'react';
import type { Swiper as SwiperType } from 'swiper';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const SLIDE_DELAY = 5000; // Match this with autoplay delay
const images = [
  {
    src: '/mumdeco_2.png',
    alt: 'Mumdeco Romantik Mum 1'
  },
  {
    src: '/mumdeco2.jpg',
    alt: 'Mumdeco Romantik Mum 2'
  }
];

export default function HeroSlider() {
  const [imagesLoaded, setImagesLoaded] = useState<{[key: string]: boolean}>({});
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);

  const handleImageLoad = (src: string) => {
    setImagesLoaded(prev => ({ ...prev, [src]: true }));
  };

  const handleImageError = (src: string) => {
    console.error(`Error loading image: ${src}`);
  };

  // Reset autoplay state when slide changes
  useEffect(() => {
    setIsAutoplayPaused(false);
  }, [activeIndex]);

  return (
    <div className="absolute inset-0 w-full h-full">
      <div className="relative h-full">
        <Swiper
          modules={[Autoplay, EffectFade, Navigation, Pagination]}
          effect="fade"
          onSwiper={setSwiper}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          onAutoplayPause={() => setIsAutoplayPaused(true)}
          onAutoplayResume={() => setIsAutoplayPaused(false)}
          autoplay={{
            delay: SLIDE_DELAY,
            disableOnInteraction: false,
          }}
          loop={true}
          className="w-full h-full"
        >
          {images.map((image, index) => (
            <SwiperSlide key={image.src} className="w-full h-full">
              <div className="relative w-full h-full">
                {!imagesLoaded[image.src] && (
                  <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                )}
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  className={`object-cover object-center w-full h-full ${
                    !imagesLoaded[image.src] ? 'opacity-0' : 'opacity-100'
                  } transition-opacity duration-500`}
                  quality={90}
                  onLoad={() => handleImageLoad(image.src)}
                  onError={() => handleImageError(image.src)}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/20" />
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
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => swiper?.slideTo(index)}
                className={`h-2 rounded-full relative overflow-hidden ${
                  index === activeIndex 
                    ? 'w-8 bg-gray-200' 
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
              >
                {index === activeIndex && !isAutoplayPaused && (
                  <div 
                    className="absolute left-0 top-0 h-full bg-gray-800 w-full origin-left"
                    style={{
                      animation: `progress ${SLIDE_DELAY}ms linear`
                    }}
                  />
                )}
              </button>
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

      {/* Add animation keyframes */}
      <style jsx>{`
        @keyframes progress {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }
      `}</style>
    </div>
  );
} 