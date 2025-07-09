'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, RefreshCw, Home, MessageCircle } from 'lucide-react';

// Suspense ile sarmalanan SearchParams component
function SearchParamsWrapper({ setFailureReason, setMerchantOid, setIsLoading }: {
  setFailureReason: (reason: string) => void;
  setMerchantOid: (oid: string) => void;
  setIsLoading: (loading: boolean) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    // URL parametrelerini al
    const reason = searchParams.get('reason') || '';
    const oid = searchParams.get('merchant_oid') || '';
    
    setFailureReason(reason);
    setMerchantOid(oid);
    setIsLoading(false);
  }, [searchParams, setFailureReason, setMerchantOid, setIsLoading]);

  return null;
}

export default function PaymentFailurePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [failureReason, setFailureReason] = useState('');
  const [merchantOid, setMerchantOid] = useState('');

  const handleRetryPayment = () => {
    // Sepet sayfasına yönlendir
    router.push('/cart');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 pt-44 md:pt-60">
      <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div></div>}>
        <SearchParamsWrapper 
          setFailureReason={setFailureReason}
          setMerchantOid={setMerchantOid}
          setIsLoading={setIsLoading}
        />
      </Suspense>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Failure Icon */}
          <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-8">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ödeme Başarısız
            </h1>
            
            <p className="text-gray-600 mb-6 text-lg">
              Maalesef ödeme işleminiz tamamlanamadı. Lütfen tekrar deneyin.
            </p>

            {/* Failure Details */}
            {failureReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-red-800 mb-2">Hata Detayı:</h3>
                <p className="text-red-700">{failureReason}</p>
              </div>
            )}

            {/* Order ID */}
            {merchantOid && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Sipariş Numarası:</h3>
                <p className="text-gray-700 font-mono text-sm">{merchantOid}</p>
              </div>
            )}

            {/* Common Failure Reasons */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <h3 className="font-semibold text-blue-800 mb-3">Olası Nedenler:</h3>
              <ul className="text-blue-700 text-sm space-y-1 text-left">
                <li>• Kart bilgileri hatalı girildi</li>
                <li>• Kartınızda yeterli bakiye bulunmuyor</li>
                <li>• Kartınız online alışverişe kapalı</li>
                <li>• Bankanız tarafından işlem reddedildi</li>
                <li>• Ağ bağlantısı sorunu yaşandı</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleRetryPayment}
                className="w-full bg-amber-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-amber-700 transition-colors flex items-center justify-center"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Tekrar Dene
              </button>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/"
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Ana Sayfa
                </Link>
                
                <Link
                  href="/contact"
                  className="flex-1 bg-blue-100 text-blue-700 py-3 px-6 rounded-lg font-semibold hover:bg-blue-200 transition-colors flex items-center justify-center"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Destek
                </Link>
              </div>
            </div>

            {/* Help Text */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-gray-500 text-sm">
                Sorun devam ederse lütfen <Link href="/contact" className="text-amber-600 hover:text-amber-700">iletişim</Link> sayfasından bizimle iletişime geçin.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 