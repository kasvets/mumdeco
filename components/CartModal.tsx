'use client';

import { useEffect } from 'react';
import { CheckCircle, ShoppingCart, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Database } from '@/lib/supabase';

type Product = Database['public']['Tables']['products']['Row'];

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  quantity: number;
}

export default function CartModal({ isOpen, onClose, product, quantity }: CartModalProps) {
  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl transition-all w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-300">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Sepete Eklendi!
                </h3>
              </div>
            </div>
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 p-1"
              onClick={onClose}
            >
              <span className="sr-only">Kapat</span>
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Product Info */}
          <div className="mt-4">
            <div className="flex items-center space-x-4">
              <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                <Image
                  src={product.image_url || '/Model1/Adriatic/m1a1.webp'}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {product.name}
                </h4>
                <p className="text-sm text-gray-500">
                  {quantity} adet
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {new Intl.NumberFormat('tr-TR', {
                    style: 'currency',
                    currency: 'TRY'
                  }).format(product.price * quantity)}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex space-x-3">
            <button
              type="button"
              className="flex-1 justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
              onClick={onClose}
            >
              Alışverişe Devam Et
            </button>
            <Link
              href="/cart"
              className="flex-1 justify-center rounded-md border border-transparent bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 flex items-center transition-colors"
              onClick={onClose}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Sepete Git
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 