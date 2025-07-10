'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/lib/cart-context';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, CreditCard, X, User, Phone, MapPin, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { User as AuthUser } from '@supabase/supabase-js';

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, clearCart, getSubtotal, getVAT, getTotal } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        setCustomerInfo({
          name: user.user_metadata?.full_name || '',
          email: user.email || '',
          phone: user.user_metadata?.phone || '',
          address: user.user_metadata?.address || ''
        });
      }
      setLoading(false);
    };
    
    getUser();
  }, []);

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
  };

  const handleCheckout = async () => {
    setShowCustomerModal(true);
  };

  const processPayment = async () => {
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone || !customerInfo.address) {
      alert('Lütfen tüm bilgileri eksiksiz doldurun.');
      return;
    }

    setIsCheckingOut(true);
    
    // Sepeti backup al (hata durumunda geri yüklemek için)
    const cartBackup = JSON.stringify(items);
    localStorage.setItem('mumdeco-cart-backup', cartBackup);
    
    try {
      // Sepet ürünlerini PayTR formatına çevir
      const paymentItems = items.map(item => ({
        product_id: item.product.id.toString(),
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      }));

      const paymentData = {
        items: paymentItems,
        customer: {
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
          address: customerInfo.address
        }
      };

      const response = await fetch('/api/paytr/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });

      const result = await response.json();
      
      // Debug bilgisi
      console.log('PayTR Response:', result);
      console.log('Response status:', response.status);
      console.log('Response success:', result.success);
      console.log('Response data:', result.data);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (result.success && result.data && result.data.iframeUrl) {
        console.log('Opening PayTR iframe:', result.data.iframeUrl);
        
        // Ödeme işlemi başlatıldığında sepeti temizle
        console.log('🛒 Payment process started - clearing cart');
        clearCart();
        
        // Backup'ı temizle (artık gerekli değil)
        localStorage.removeItem('mumdeco-cart-backup');
        
        // Mevcut sayfada PayTR iframe'ini aç
        window.location.href = result.data.iframeUrl;
        
        // Modal'ı kapat
        setShowCustomerModal(false);
      } else {
        console.error('PayTR Response Error:', result);
        throw new Error(result.error || result.message || 'Ödeme işlemi başlatılamadı');
      }
    } catch (error) {
      console.error('Ödeme hatası:', error);
      alert(`Ödeme işlemi sırasında hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
      
      // Hata durumunda cart backup'ı geri yükle
      const cartBackup = localStorage.getItem('mumdeco-cart-backup');
      if (cartBackup) {
        try {
          const backupItems = JSON.parse(cartBackup);
          localStorage.setItem('mumdeco-cart', cartBackup);
          localStorage.removeItem('mumdeco-cart-backup');
          window.location.reload(); // Sayfayı yenile ki cart context güncellensin
        } catch (backupError) {
          console.error('Cart backup restore error:', backupError);
        }
      }
    } finally {
      setIsCheckingOut(false);
    }
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-8">        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Empty cart illustration */}
            <div className="mx-auto w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mb-6 sm:mb-8 shadow-lg">
              <ShoppingBag className="w-16 h-16 sm:w-20 sm:h-20 text-amber-600" />
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 md:p-12 max-w-2xl mx-auto">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">Sepetiniz Boş</h1>
              <p className="text-gray-600 mb-6 sm:mb-8 text-base sm:text-lg leading-relaxed px-2 sm:px-0">
                Henüz sepetinizde ürün bulunmamaktadır. Özel tasarım mumlarımızı keşfetmek için ürünlerimize göz atın.
              </p>
              
              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 sm:mb-8">
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 sm:py-12 pt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 pt-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Sepetim</h1>
          <p className="text-gray-600 text-sm sm:text-base">{items.length} ürün sepetinizde</p>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Ürünler</h2>
                  <button
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-700 font-medium text-xs sm:text-sm"
                  >
                    Sepeti Temizle
                  </button>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 p-3 sm:p-4 border border-gray-200 rounded-lg">
                      {/* Product Image & Details */}
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                          <Image
                            src={item.product.image_url || '/Model1/Adriatic/m1a1.webp'}
                            alt={item.product.name}
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate text-sm sm:text-base">
                            {item.product.name}
                          </h3>
                          <div className="flex items-center mt-2 space-x-4">
                            <span className="text-base sm:text-lg font-semibold text-gray-900">
                              {formatPrice(item.product.price)}
                            </span>
                            {item.product.old_price && (
                              <span className="text-xs sm:text-sm text-gray-500 line-through">
                                {formatPrice(item.product.old_price)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quantity Controls & Actions */}
                      <div className="flex items-center justify-between sm:justify-start sm:space-x-6">
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                          >
                            <Minus className="w-4 h-4 text-gray-600" />
                          </button>
                          <span className="w-8 text-center font-medium text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                          >
                            <Plus className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>

                        {/* Item Total & Remove */}
                        <div className="text-right">
                          <div className="font-semibold text-gray-900 text-sm sm:text-base">
                            {formatPrice(item.product.price * item.quantity)}
                          </div>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-red-600 hover:text-red-700 text-xs sm:text-sm mt-1 flex items-center"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            Kaldır
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 mt-6 sm:mt-8 lg:mt-0">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:sticky lg:top-8">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Sipariş Özeti</h2>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm sm:text-base">Ara Toplam</span>
                  <span className="font-medium text-gray-900 text-sm sm:text-base">{formatPrice(getSubtotal())}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm sm:text-base">KDV (%20)</span>
                  <span className="font-medium text-gray-900 text-sm sm:text-base">{formatPrice(getVAT())}</span>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-base sm:text-lg font-semibold text-gray-900">Toplam</span>
                    <span className="text-base sm:text-lg font-bold text-gray-900">{formatPrice(getTotal())}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
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
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center text-sm sm:text-base"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Alışverişe Devam Et
                </Link>
              </div>

              {/* Trust Signals */}
              <div className="mt-6 pt-6 border-t">
                <div className="text-xs sm:text-sm text-gray-600 space-y-2">
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

      {/* Customer Information Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Müşteri Bilgileri</h2>
                <button
                  onClick={() => setShowCustomerModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {!user && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Misafir Sipariş:</strong> Hesabınız yoksa da sipariş verebilirsiniz. 
                    Sipariş takibi için e-posta adresinizi kaydedin.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Ad Soyad *
                  </label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Adınızı ve soyadınızı girin"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    E-posta Adresi *
                  </label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="E-posta adresinizi girin"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Sipariş durumu bu e-posta adresine gönderilecektir.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Telefon Numarası *
                  </label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="0532 123 45 67"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Teslimat Adresi *
                  </label>
                  <textarea
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Mahalle, sokak, kapı no, daire no gibi detayları eksiksiz yazın"
                    rows={3}
                    required
                  />
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Toplam Tutar:</span>
                    <span className="text-lg font-bold text-gray-900">{formatPrice(getTotal())}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {items.length} ürün • KDV dahil
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowCustomerModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    İptal
                  </button>
                  <button
                    onClick={processPayment}
                    disabled={isCheckingOut}
                    className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isCheckingOut ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        İşleniyor...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Ödeme Yap
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 