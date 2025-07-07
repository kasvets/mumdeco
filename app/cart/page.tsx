'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cart-context';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, clearCart, getSubtotal, getVAT, getTotal } = useCart();
  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    // Simulate checkout process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Here you would typically integrate with a payment processor
    // For now, we'll just show a success message
    alert('Sipariş işleminiz başarıyla alındı! Teşekkür ederiz.');
    clearCart();
    router.push('/');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(price);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-44 md:pt-60">        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Empty cart illustration */}
            <div className="mx-auto w-40 h-40 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mb-8 shadow-lg">
              <ShoppingBag className="w-20 h-20 text-amber-600" />
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 max-w-2xl mx-auto">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Sepetiniz Boş</h1>
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                Henüz sepetinizde ürün bulunmamaktadır. Özel tasarım mumlarımızı keşfetmek için ürünlerimize göz atın.
              </p>
              
              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Güvenli Alışveriş</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Hızlı Teslimat</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Premium Kalite</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <Link 
                  href="/products"
                  className="inline-flex items-center justify-center w-full px-8 py-4 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Ürünleri Keşfet
                </Link>
                
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                  <Link href="/" className="hover:text-amber-600 transition-colors">
                    Anasayfa
                  </Link>
                  <span>•</span>
                  <Link href="/about" className="hover:text-amber-600 transition-colors">
                    Hakkımızda
                  </Link>
                  <span>•</span>
                  <Link href="/contact" className="hover:text-amber-600 transition-colors">
                    İletişim
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom spacing */}
        <div className="h-16"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 pt-44 md:pt-60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sepetim</h1>
          <p className="text-gray-600">{items.length} ürün sepetinizde</p>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Ürünler</h2>
                  <button
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-700 font-medium text-sm"
                  >
                    Sepeti Temizle
                  </button>
                </div>

                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      {/* Product Image */}
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <Image
                          src={item.product.image_url || '/Model1/Adriatic/m1a1.webp'}
                          alt={item.product.name}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {item.product.description}
                        </p>
                        <div className="flex items-center mt-2 space-x-4">
                          <span className="text-lg font-semibold text-gray-900">
                            {formatPrice(item.product.price)}
                          </span>
                          {item.product.old_price && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(item.product.old_price)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                          className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                        >
                          <Minus className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="w-8 text-center font-medium text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                          className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                        >
                          <Plus className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          {formatPrice(item.product.price * item.quantity)}
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-red-600 hover:text-red-700 text-sm mt-1 flex items-center"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Kaldır
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Sipariş Özeti</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ara Toplam</span>
                  <span className="font-medium text-gray-900">{formatPrice(getSubtotal())}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">KDV (%10)</span>
                  <span className="font-medium text-gray-900">{formatPrice(getVAT())}</span>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Toplam</span>
                    <span className="text-lg font-bold text-gray-900">{formatPrice(getTotal())}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full bg-amber-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isCheckingOut ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      İşleniyor...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      Sipariş Ver
                    </>
                  )}
                </button>
                
                <Link
                  href="/products"
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Alışverişe Devam Et
                </Link>
              </div>

              {/* Trust Signals */}
              <div className="mt-6 pt-6 border-t">
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Güvenli ödeme
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Ücretsiz kargo (500₺ üzeri)
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    30 gün iade garantisi
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 