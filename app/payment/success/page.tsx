'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircleIcon, ArrowRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

// Suspense ile sarmalanan SearchParams component
function SearchParamsWrapper({ setOrderInfo }: {
  setOrderInfo: (info: any) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    // URL parametrelerinden bilgileri al
    const merchant_oid = searchParams.get('merchant_oid') || searchParams.get('orderId');
    const status = searchParams.get('status');
    const total_amount = searchParams.get('total_amount');
    
    setOrderInfo({
      merchant_oid,
      status,
      total_amount: total_amount ? (parseFloat(total_amount) / 100).toFixed(2) : null // PayTR kuruş cinsinden gönderir
    });
  }, [searchParams, setOrderInfo]);

  return null;
}

export default function PaymentSuccessPage() {
  const [orderInfo, setOrderInfo] = useState<any>(null);
  const [countdown, setCountdown] = useState(5);
  const router = useRouter();

  // Otomatik yönlendirme için countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Suspense fallback={null}>
        <SearchParamsWrapper 
          setOrderInfo={setOrderInfo}
        />
      </Suspense>
      
      <div className="max-w-2xl mx-auto px-4">
        {/* Success Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="text-center">
            <CheckCircleIcon className="h-20 w-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🎉 Siparişiniz Oluşturuldu!
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Siparişiniz başarıyla alındı ve ödemeniz onaylandı.
            </p>
            
            {orderInfo?.merchant_oid && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-green-800 mb-3">Sipariş Detayları</h3>
                <div className="space-y-2 text-left">
                  <p className="text-green-700">
                    <span className="font-medium">Sipariş No:</span> {orderInfo.merchant_oid}
                  </p>
                  {orderInfo.total_amount && (
                    <p className="text-green-700">
                      <span className="font-medium">Tutar:</span> ₺{orderInfo.total_amount}
                    </p>
                  )}
                  <p className="text-green-700">
                    <span className="font-medium">Tarih:</span> {new Date().toLocaleString('tr-TR')}
                  </p>
                  <p className="text-green-700">
                    <span className="font-medium">Durum:</span> Ödeme Tamamlandı ✅
                  </p>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  <strong>Sonraki Adımlar:</strong><br/>
                  • Siparişiniz hazırlanmaya başlandı<br/>
                  • E-posta adresinize onay bildirimi gönderilecek<br/>
                  • Kargo takip bilgileri paylaşılacak
                </p>
              </div>
              
              {/* Countdown */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm text-center">
                  <strong>{countdown} saniye</strong> sonra anasayfaya yönlendirileceksiniz...
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              href="/"
              className="bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-medium"
            >
              <HomeIcon className="h-5 w-5 mr-2" />
              Ana Sayfaya Dön
            </Link>
            <Link 
              href="/products"
              className="bg-gray-600 text-white px-6 py-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center font-medium"
            >
              <ArrowRightIcon className="h-5 w-5 mr-2" />
              Alışverişe Devam Et
            </Link>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Sipariş ile ilgili sorularınız için: 
              <a href="mailto:info@mumdeco.com" className="text-blue-600 hover:text-blue-800 ml-1">
                info@mumdeco.com
              </a> | 
              <a href="tel:+905324672418" className="text-blue-600 hover:text-blue-800 ml-1">
                +90 532 467 24 18
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 