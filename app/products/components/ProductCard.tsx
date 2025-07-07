'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { useState } from 'react';
import { Product } from '@/lib/supabase';
import { useCart } from '@/lib/cart-context';
import CartModal from '@/components/CartModal';

interface ProductCardProps {
  product: Product;
  viewMode: 'grid' | 'list';
}

export default function ProductCard({ product, viewMode }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);

  const discount = product.old_price 
    ? Math.round((1 - product.price / product.old_price) * 100)
    : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!product.in_stock || addingToCart) return;
    
    setAddingToCart(true);
    try {
      addToCart(product, 1);
      
      // Show modal instead of alert
      setShowCartModal(true);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Sepete eklenirken bir hata oluştu.');
    } finally {
      setAddingToCart(false);
    }
  };

  if (viewMode === 'list') {
    return (
      <>
        <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-300 p-4">
          <div className="flex gap-4 items-center">
            {/* Product Image */}
            <Link href={`/products/${product.id}`} className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
              <Image
                src={product.image_url || '/Model1/Adriatic/m1a1.webp'}
                alt={product.name}
                fill
                className={`object-cover transition-opacity duration-300 ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onLoad={() => setImageLoading(false)}
                sizes="80px"
              />
              {imageLoading && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
              )}
            </Link>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <Link href={`/products/${product.id}`}>
                    <h3 className="font-semibold text-gray-900 truncate text-base hover:text-amber-600 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-1">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">
                        ₺{product.price.toFixed(2)}
                      </span>
                      {product.old_price && (
                        <span className="text-sm text-gray-500 line-through">
                          ₺{product.old_price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-gray-50"
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>
                  
                  <button 
                    onClick={handleAddToCart}
                    disabled={!product.in_stock || addingToCart}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addingToCart ? 'Ekleniyor...' : product.in_stock ? 'Sepete Ekle' : 'Stokta Yok'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cart Modal */}
        <CartModal
          isOpen={showCartModal}
          onClose={() => setShowCartModal(false)}
          product={product}
          quantity={1}
        />
      </>
    );
  }

  // Grid View - Absolute Button Positioning
  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group relative" style={{ height: '420px' }}>
        {/* Product Image Container - Fixed Height */}
        <Link href={`/products/${product.id}`} className="relative h-56 bg-gray-50 overflow-hidden block">
          <Image
            src={product.image_url || '/Model1/Adriatic/m1a1.webp'}
            alt={product.name}
            fill
            className={`object-cover group-hover:scale-105 transition-transform duration-500 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => setImageLoading(false)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
          {imageLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
          
          {/* Top Badge */}
          <div className="absolute top-3 left-3 z-10">
            {product.is_new ? (
              <span className="bg-green-500 text-white text-xs px-2.5 py-1 rounded-md font-medium">
                Yeni
              </span>
            ) : discount > 0 ? (
              <span className="bg-red-500 text-white text-xs px-2.5 py-1 rounded-md font-medium">
                %{discount}
              </span>
            ) : null}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsWishlisted(!isWishlisted);
            }}
            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all duration-300 z-10"
          >
            <Heart className={`w-4 h-4 ${
              isWishlisted 
                ? 'fill-red-500 text-red-500' 
                : 'text-gray-600 hover:text-red-500'
            }`} />
          </button>
        </Link>

        {/* Product Info - Content Area */}
        <div className="p-4 pb-20">
          {/* Product Name */}
          <Link href={`/products/${product.id}`}>
            <h3 className="font-semibold text-gray-900 text-base leading-tight line-clamp-2 mb-4 hover:text-amber-600 transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Price */}
          <div className="mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">
                ₺{product.price.toFixed(2)}
              </span>
              {product.old_price && (
                <span className="text-sm text-gray-500 line-through">
                  ₺{product.old_price.toFixed(2)}
                </span>
              )}
            </div>
            {discount > 0 && (
              <span className="text-xs text-green-600 font-medium">
                %{discount} indirim
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button - Absolutely Positioned */}
        <div className="absolute bottom-4 left-4 right-4">
          <button 
            onClick={handleAddToCart}
            className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
              product.in_stock && !addingToCart
                ? 'bg-gray-900 text-white hover:bg-gray-800'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!product.in_stock || addingToCart}
          >
            {addingToCart ? 'Ekleniyor...' : product.in_stock ? 'Sepete Ekle' : 'Stokta Yok'}
          </button>
        </div>
      </div>

      {/* Cart Modal */}
      <CartModal
        isOpen={showCartModal}
        onClose={() => setShowCartModal(false)}
        product={product}
        quantity={1}
      />
    </>
  );
} 