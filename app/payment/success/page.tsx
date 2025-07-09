'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircleIcon, ArrowRightIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface OrderDetails {
  order: {
    id: string;
    order_id: string;
    total_amount: number;
    currency: string;
    customer_name: string;
    customer_email: string;
    status: string;
    payment_status: string;
    created_at: string;
  };
  items: Array<{
    id: string;
    product_name: string;
    quantity: number;
    product_price: number;
    total_price: number;
  }>;
  payments: Array<{
    id: string;
    status: string;
    auth_code: string;
    response_code: string;
    masked_pan: string;
    callback_received_at: string;
  }>;
}

// Suspense ile sarmalanan SearchParams component
function SearchParamsWrapper({ setOrderDetails, setLoading, setError }: {
  setOrderDetails: (details: OrderDetails | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const orderId = searchParams.get('merchant_oid');
        if (!orderId) {
          throw new Error('Sipariş ID bulunamadı');
        }

        const response = await fetch(`/api/paytr/create-payment?orderId=${orderId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Sipariş bilgileri alınamadı');
        }

        setOrderDetails(data.data);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [searchParams, setOrderDetails, setLoading, setError]);

  return null;
}

export default function PaymentSuccessPage() {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Sipariş bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <Link 
            href="/" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Sipariş bilgileri bulunamadı</p>
          <Link 
            href="/" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    );
  }

  const { order, items, payments } = orderDetails;
  const latestPayment = payments && payments.length > 0 ? payments[0] : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div></div>}>
        <SearchParamsWrapper 
          setOrderDetails={setOrderDetails}
          setLoading={setLoading}
          setError={setError}
        />
      </Suspense>
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="text-center">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Ödeme Başarılı!
            </h1>
            <p className="text-gray-600 mb-4">
              Siparişiniz başarıyla alındı ve ödemeniz onaylandı.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-green-800 font-semibold">
                Sipariş No: {order.order_id}
              </p>
              <p className="text-green-600 text-sm">
                Sipariş Tarihi: {new Date(order.created_at).toLocaleString('tr-TR')}
              </p>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <DocumentTextIcon className="h-6 w-6 mr-2" />
            Sipariş Detayları
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Müşteri Bilgileri</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Ad:</span> {order.customer_name}</p>
                <p><span className="font-medium">E-posta:</span> {order.customer_email}</p>
                <p><span className="font-medium">Durum:</span> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    order.status === 'processing' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : order.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status === 'processing' ? 'İşleniyor' : 
                     order.status === 'completed' ? 'Tamamlandı' : 
                     order.status}
                  </span>
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Ödeme Bilgileri</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Toplam Tutar:</span> ₺{order.total_amount.toFixed(2)}</p>
                <p><span className="font-medium">Para Birimi:</span> {order.currency}</p>
                <p><span className="font-medium">Ödeme Durumu:</span> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    order.payment_status === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {order.payment_status === 'paid' ? 'Ödendi' : 'Ödenmedi'}
                  </span>
                </p>
                {latestPayment && latestPayment.masked_pan && (
                  <p><span className="font-medium">Kart:</span> {latestPayment.masked_pan}</p>
                )}
                {latestPayment && latestPayment.auth_code && (
                  <p><span className="font-medium">Onay Kodu:</span> {latestPayment.auth_code}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Sipariş Ürünleri</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Ürün</th>
                  <th className="text-right py-3 px-4">Fiyat</th>
                  <th className="text-right py-3 px-4">Adet</th>
                  <th className="text-right py-3 px-4">Toplam</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-3 px-4">{item.product_name}</td>
                    <td className="text-right py-3 px-4">₺{item.product_price.toFixed(2)}</td>
                    <td className="text-right py-3 px-4">{item.quantity}</td>
                    <td className="text-right py-3 px-4">₺{item.total_price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-b font-semibold">
                  <td colSpan={3} className="py-3 px-4 text-right">Toplam:</td>
                  <td className="text-right py-3 px-4">₺{order.total_amount.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Sonraki Adımlar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              href="/"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <ArrowRightIcon className="h-5 w-5 mr-2" />
              Alışverişe Devam Et
            </Link>
            <Link 
              href={`/orders/${order.order_id}`}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Sipariş Takibi
            </Link>
          </div>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Önemli:</strong> Sipariş durumunuz hakkında e-posta adresinize bilgi gönderilecektir. 
              Sipariş takibi için yukarıdaki "Sipariş Takibi" bağlantısını kullanabilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 