'use client';

import Image from 'next/image';
import { useState } from 'react';

interface SafeImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export default function SafeImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  priority = false,
  sizes,
  quality = 75,
  fallbackSrc = '/Model1/Adriatic/m1a1.webp',
  onLoad,
  onError,
}: SafeImageProps) {
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleLoad = () => {
    setLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setImageError(true);
    setLoading(false);
    onError?.();
  };

  const currentSrc = imageError ? fallbackSrc : src;

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      <Image
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        priority={priority}
        sizes={sizes}
        quality={quality}
        onLoad={handleLoad}
        onError={handleError}
        unoptimized={imageError} // Use unoptimized for fallback images
      />
      
      {imageError && (
        <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
          Fallback
        </div>
      )}
    </div>
  );
} 