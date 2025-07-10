'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { XCircleIcon, ArrowRightIcon, HomeIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

// Suspense ile sarmalanan SearchParams component
function SearchParamsWrapper({ setOrderInfo, setLoading }: {
  setOrderInfo: (info: any) => void;
  setLoading: (loading: boolean) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    // URL parametrelerinden bilgileri al
    const merchant_oid = searchParams.get('merchant_oid') || searchParams.get('orderId');
    const status = searchParams.get('status');
    const failed_reason_msg = searchParams.get('failed_reason_msg');
    const failed_reason_code = searchParams.get('failed_reason_code');
    const total_amount = searchParams.get('total_amount');
    
    setOrderInfo({
      merchant_oid,
      status,
      failed_reason_msg,
      failed_reason_code,
      total_amount: total_amount ? (parseFloat(total_amount) / 100).toFixed(2) : null // PayTR kuruş cinsinden gönderir
    });
    
    setLoading(false);
  }, [searchParams, setOrderInfo, setLoading]);

  return null;
}

export default function PaymentFailurePage() {
  const [orderInfo, setOrderInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ödeme bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 py-8">
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
        </div>
      }>
        <SearchParamsWrapper 
          setOrderInfo={setOrderInfo}
          setLoading={setLoading}
        />
      </Suspense>
      
      <div className="max-w-2xl mx-auto px-4">
        {/* Failure Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="text-center">
            <XCircleIcon className="h-20 w-20 text-red-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              ❌ Ödeme Başarısız
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Üzgünüz, ödeme işleminiz tamamlanamadı.
            </p>
            
            {orderInfo?.merchant_oid && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-red-800 mb-3">İşlem Detayları</h3>
                <div className="space-y-2 text-left">
                  <p className="text-red-700">
                    <span className="font-medium">Sipariş No:</span> {orderInfo.merchant_oid}
                  </p>
                  {orderInfo.total_amount && (
                    <p className="text-red-700">
                      <span className="font-medium">Tutar:</span> ₺{orderInfo.total_amount}
                    </p>
                  )}
                  <p className="text-red-700">
                    <span className="font-medium">Tarih:</span> {new Date().toLocaleString('tr-TR')}
                  </p>
                  <p className="text-red-700">
                    <span className="font-medium">Durum:</span> Ödeme Başarısız ❌
                  </p>
                  {orderInfo.failed_reason_msg && (
                    <p className="text-red-700">
                      <span className="font-medium">Hata:</span> {orderInfo.failed_reason_msg}
                    </p>
                  )}
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mr-3 mt-1 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-yellow-800 text-sm font-medium mb-2">
                      Olası Nedenler:
                    </p>
                    <ul className="text-yellow-700 text-sm space-y-1">
                      <li>• Kartınızda yeterli limit bulunmuyor</li>
                      <li>• Kart bilgileriniz hatalı girildi</li>
                      <li>• 3D Secure doğrulaması başarısız</li>
                      <li>• Bankanız işlemi güvenlik nedeniyle bloke etti</li>
                      <li>• İnternet bağlantısı sorunu yaşandı</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  <strong>Öneriler:</strong><br/>
                  • Kart bilgilerinizi kontrol ederek tekrar deneyiniz<br/>
                  • Farklı bir kart ile ödeme yapmayı deneyiniz<br/>
                  • Bankanızla iletişime geçiniz<br/>
                  • Daha sonra tekrar deneyiniz
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              href="/cart"
              className="bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-medium"
            >
              <ArrowRightIcon className="h-5 w-5 mr-2" />
              Tekrar Dene
            </Link>
            <Link 
              href="/"
              className="bg-gray-600 text-white px-6 py-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center font-medium"
            >
              <HomeIcon className="h-5 w-5 mr-2" />
              Ana Sayfaya Dön
            </Link>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 mb-2">
              Yardıma mı ihtiyacınız var?
            </p>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">
                📧 E-posta: 
                <a href="mailto:info@mumdeco.com" className="text-blue-600 hover:text-blue-800 ml-1">
                  info@mumdeco.com
                </a>
              </p>
              <p className="text-sm text-gray-500">
                📞 Telefon: 
                            <a href="tel:+905313552271" className="text-blue-600 hover:text-blue-800 ml-1">
              +90 531 355 22 71
            </a>
              </p>
              <p className="text-sm text-gray-500">
                💬 WhatsApp: 
                            <a href="https://wa.me/905313552271" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 ml-1">
              +90 531 355 22 71
            </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 