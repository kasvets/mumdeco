'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface OrderItem {
  id: number;
  product_id: number | null;
  product_name: string;
  product_price: number;
  unit_price: number;
  quantity: number;
  total_price: number;
  products?: {
    image_url: string;
  } | null;
}

interface Order {
  id: number;
  order_id: string;
  user_id: string | null;
  status: string;
  total_amount: number;
  currency: string;
  customer_email: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  payment_method: string;
  payment_status: string;
  shipping_company: string | null;
  tracking_number: string | null;
  shipping_date: string | null;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
}

interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updating, setUpdating] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{orderId: number, orderNumber: string} | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [shippingModal, setShippingModal] = useState<{open: boolean, orderId: number | null}>({open: false, orderId: null});
  const [shippingForm, setShippingForm] = useState({
    shipping_company: '',
    tracking_number: ''
  });
  const [shippingLoading, setShippingLoading] = useState(false);
  const router = useRouter();

  const shippingCompanies = [
    'Aras Kargo',
    'Yurtiçi Kargo', 
    'Ptt Kargo',
    'Kolay Gelsin',
    'HepsiJet',
    'Trendyol Express',
    'MNG Kargo',
    'Sürat Kargo',
    'UPS Kargo',
    'Fedex'
  ];

  const statusOptions = [
    { value: 'all', label: 'Tümü' },
    { value: 'pending', label: 'Yeni Sipariş' },
    { value: 'processing', label: 'Hazırlanıyor' },
    { value: 'shipped', label: 'Kargoya Verildi' },
    { value: 'delivered', label: 'Teslim Edildi' },
    { value: 'cancelled', label: 'İptal Edildi' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const fetchOrderStats = async () => {
    setStatsLoading(true);
    try {
      const response = await fetch('/api/admin/orders/stats');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'İstatistikler yüklenemedi');
      }

      setOrderStats(data);
    } catch (err) {
      console.error('Error fetching order stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/admin/orders?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Siparişler yüklenemedi');
      }

      setOrders(data.orders);
      setTotalPages(data.pagination.pages);
      setCurrentPage(data.pagination.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    // Eğer kargoya verildi durumuna geçiş yapılıyorsa kargo modal'ını aç
    if (newStatus === 'shipped') {
      setShippingModal({open: true, orderId});
      setShippingForm({shipping_company: '', tracking_number: ''});
      return;
    }

    setUpdating(orderId);
    
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Sipariş güncellenemedi');
      }

      // Siparişi güncelle
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus }
          : order
      ));
      
      // İstatistikleri güncelle
      fetchOrderStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Güncelleme hatası');
    } finally {
      setUpdating(null);
    }
  };

  const saveShippingInfo = async () => {
    if (!shippingModal.orderId || !shippingForm.shipping_company || !shippingForm.tracking_number) {
      setError('Kargo firması ve takip numarası zorunludur');
      return;
    }

    setShippingLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/orders/${shippingModal.orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'shipped',
          shipping_company: shippingForm.shipping_company,
          tracking_number: shippingForm.tracking_number,
          shipping_date: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Kargo bilgileri kaydedilemedi');
      }

      // Siparişi güncelle
      setOrders(orders.map(order => 
        order.id === shippingModal.orderId
          ? { 
              ...order, 
              status: 'shipped',
              shipping_company: shippingForm.shipping_company,
              tracking_number: shippingForm.tracking_number,
              shipping_date: new Date().toISOString()
            }
          : order
      ));
      
      // İstatistikleri güncelle
      fetchOrderStats();
      
      // Modal'ı kapat
      setShippingModal({open: false, orderId: null});
      setShippingForm({shipping_company: '', tracking_number: ''});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kargo bilgileri kaydedilemedi');
    } finally {
      setShippingLoading(false);
    }
  };

  const deleteOrder = async (orderId: number) => {
    setDeleting(orderId);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Sipariş silinemedi');
      }

      // Siparişi listeden kaldır
      setOrders(orders.filter(order => order.id !== orderId));
      setDeleteConfirm(null);
      
      // İstatistikleri güncelle
      fetchOrderStats();
      
      // Eğer sayfa boşaldıysa önceki sayfaya git
      if (orders.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Silme hatası');
    } finally {
      setDeleting(null);
    }
  };

  const confirmDelete = (orderId: number, orderNumber: string) => {
    setDeleteConfirm({ orderId, orderNumber });
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const openOrderModal = (order: Order) => {
    setSelectedOrder(order);
  };

  const closeOrderModal = () => {
    setSelectedOrder(null);
  };

  useEffect(() => {
    fetchOrders(currentPage);
    fetchOrderStats();
  }, [currentPage, statusFilter, searchTerm]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeOrderModal();
      }
    };

    if (selectedOrder) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [selectedOrder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchOrders(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Siparişler</h1>
            <p className="text-gray-600 text-lg">Tüm siparişleri görüntüle ve yönet</p>
          </div>
        
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-100 animate-pulse overflow-hidden relative">
              {/* Payment Status Badge Skeleton */}
              <div className="absolute top-3 right-3 z-10">
                <div className="h-5 w-14 bg-gray-200 rounded-full"></div>
              </div>

              {/* Products Section Skeleton */}
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-gray-200 rounded-full mr-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="h-4 w-12 bg-gray-200 rounded-full"></div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200 rounded w-32 mb-1"></div>
                      <div className="flex justify-between">
                        <div className="h-3 bg-gray-200 rounded w-8"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200 rounded w-28 mb-1"></div>
                      <div className="flex justify-between">
                        <div className="h-3 bg-gray-200 rounded w-8"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Order Header Skeleton */}
              <div className="p-4 border-b border-gray-200">
                <div className="mb-3">
                  <div className="h-5 bg-gray-200 rounded w-32 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-9 bg-gray-200 rounded-lg"></div>
              </div>
              
              {/* Customer Info Skeleton */}
              <div className="p-4">
                <div className="flex items-center mb-3">
                  <div className="w-2 h-2 bg-gray-200 rounded-full mr-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200 rounded w-32 mb-1"></div>
                      <div className="h-2 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200 rounded w-40 mb-1"></div>
                      <div className="h-2 bg-gray-200 rounded w-12"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200 rounded w-28 mb-1"></div>
                      <div className="h-2 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                      <div className="h-2 bg-gray-200 rounded w-12"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-4 py-3 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex justify-between items-center">
                  <div className="h-8 bg-gray-200 rounded-lg w-20"></div>
                  <div className="h-8 bg-gray-200 rounded-lg w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Siparişler</h1>
          <p className="text-gray-600 text-lg">Tüm siparişleri görüntüle ve yönet</p>
        </div>

        {/* Sipariş Adımları */}
        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Toplam Sipariş */}
            <div 
              className="bg-white border border-gray-200 hover:border-gray-300 p-4 rounded-lg transition-all duration-200 cursor-pointer hover:shadow-md group"
              onClick={() => setStatusFilter('all')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 group-hover:text-gray-700">Toplam</p>
                  <p className="text-xs font-medium text-gray-600 group-hover:text-gray-700">Sipariş</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {statsLoading ? '...' : orderStats?.total || 0}
                  </p>
                </div>
                <div className="text-gray-400 group-hover:text-blue-500 transition-colors duration-200">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                </div>
              </div>
              <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full w-full transition-all duration-300"></div>
              </div>
            </div>

            {/* Yeni Sipariş */}
            <div 
              className="bg-white border border-gray-200 hover:border-orange-200 p-4 rounded-lg transition-all duration-200 cursor-pointer hover:shadow-md group"
              onClick={() => setStatusFilter('pending')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 group-hover:text-gray-700">Yeni</p>
                  <p className="text-xs font-medium text-gray-600 group-hover:text-gray-700">Sipariş</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {statsLoading ? '...' : orderStats?.pending || 0}
                  </p>
                </div>
                <div className="text-gray-400 group-hover:text-orange-500 transition-colors duration-200">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6l4 2"/>
                  </svg>
                </div>
              </div>
              <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full transition-all duration-300" style={{width: orderStats?.total ? `${(orderStats.pending / orderStats.total) * 100}%` : '0%'}}></div>
              </div>
            </div>

            {/* Hazırlanıyor */}
            <div 
              className="bg-white border border-gray-200 hover:border-amber-200 p-4 rounded-lg transition-all duration-200 cursor-pointer hover:shadow-md group"
              onClick={() => setStatusFilter('processing')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 group-hover:text-gray-700">Hazırlanıyor</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {statsLoading ? '...' : orderStats?.processing || 0}
                  </p>
                </div>
                <div className="text-gray-400 group-hover:text-amber-500 transition-colors duration-200">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
              <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full transition-all duration-300" style={{width: orderStats?.total ? `${(orderStats.processing / orderStats.total) * 100}%` : '0%'}}></div>
              </div>
            </div>

            {/* Kargoda */}
            <div 
              className="bg-white border border-gray-200 hover:border-purple-200 p-4 rounded-lg transition-all duration-200 cursor-pointer hover:shadow-md group"
              onClick={() => setStatusFilter('shipped')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 group-hover:text-gray-700">Kargoda</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {statsLoading ? '...' : orderStats?.shipped || 0}
                  </p>
                </div>
                <div className="text-gray-400 group-hover:text-purple-500 transition-colors duration-200">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
              <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full transition-all duration-300" style={{width: orderStats?.total ? `${(orderStats.shipped / orderStats.total) * 100}%` : '0%'}}></div>
              </div>
            </div>

            {/* Tamamlandı */}
            <div 
              className="bg-white border border-gray-200 hover:border-green-200 p-4 rounded-lg transition-all duration-200 cursor-pointer hover:shadow-md group"
              onClick={() => setStatusFilter('delivered')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 group-hover:text-gray-700">Tamamlandı</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {statsLoading ? '...' : orderStats?.delivered || 0}
                  </p>
                </div>
                <div className="text-gray-400 group-hover:text-green-500 transition-colors duration-200">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
              <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all duration-300" style={{width: orderStats?.total ? `${(orderStats.delivered / orderStats.total) * 100}%` : '0%'}}></div>
              </div>
            </div>

            {/* İptal Edildi */}
            <div 
              className="bg-white border border-gray-200 hover:border-red-200 p-4 rounded-lg transition-all duration-200 cursor-pointer hover:shadow-md group"
              onClick={() => setStatusFilter('cancelled')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 group-hover:text-gray-700">İptal Edildi</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {statsLoading ? '...' : orderStats?.cancelled || 0}
                  </p>
                </div>
                <div className="text-gray-400 group-hover:text-red-500 transition-colors duration-200">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </div>
              </div>
              <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full transition-all duration-300" style={{width: orderStats?.total ? `${(orderStats.cancelled / orderStats.total) * 100}%` : '0%'}}></div>
              </div>
            </div>
          </div>
        </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Arama ve Filtreleme */}
      <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Sipariş ID, müşteri adı, e-posta veya telefon..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
              />
              <svg className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>

          <div className="flex items-center gap-3">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Active filters display */}
        {(searchTerm || statusFilter !== 'all') && (
          <div className="mt-4 flex flex-wrap gap-2">
            {searchTerm && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchTerm}
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-2 text-amber-600 hover:text-amber-900"
                >
                  ×
                </button>
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
                {statusOptions.find(opt => opt.value === statusFilter)?.label}
                <button
                  onClick={() => setStatusFilter('all')}
                  className="ml-2 text-blue-600 hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Siparişler Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:border-amber-200 overflow-hidden relative group cursor-pointer"
            onClick={() => openOrderModal(order)}
          >
            {/* Payment Status Badge - Floating */}
            <div className="absolute top-3 right-3 z-10">
              <span className={`px-2 py-1 text-xs font-semibold rounded-full shadow-md ${getPaymentStatusColor(order.payment_status)} border border-white`}>
                {order.payment_status === 'success' ? '✅ Ödendi' : 
                 order.payment_status === 'waiting' ? '⏳ Bekliyor' : 
                 order.payment_status === 'failed' ? '❌ Başarısız' : order.payment_status}
              </span>
            </div>

            {/* Products Section - Enhanced */}
            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <div className="mb-3">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-base font-bold text-gray-800 flex items-center">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                    Ürünler
                  </h4>
                  <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded-full">
                    {order.order_items.length} adet
                  </span>
                </div>
                <div className="space-y-2">
                  {order.order_items.slice(0, 2).map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-2 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                      {/* Product Image - Smaller */}
                      <div className="flex-shrink-0 relative">
                        {item.products?.image_url ? (
                          <div className="relative group">
                            <img
                              src={item.products.image_url}
                              alt={item.product_name}
                              className="w-12 h-12 rounded-lg object-cover border border-gray-200 shadow-sm group-hover:border-amber-300 transition-all duration-200"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200"></div>
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate mb-1">
                          {item.product_name}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
                              {item.quantity}x
                            </span>
                          </div>
                          <span className="text-sm font-bold text-gray-900">
                            {formatPrice(item.unit_price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {order.order_items.length > 2 && (
                    <div className="pt-2 border-t border-gray-200">
                      <div className="text-center py-1 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 font-medium">
                          +{order.order_items.length - 2} daha fazla ürün
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Header - Simplified */}
            <div className="p-4 border-b border-gray-200">
              <div className="mb-3">
                <h3 className="text-lg font-mono font-normal text-gray-900 tracking-wider mb-1">
                  #{order.order_id}
                </h3>
                <p className="text-xs text-gray-500 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatDate(order.created_at)}
                </p>
              </div>
              
              {/* Order Status - Enhanced */}
              <div className="relative">
                <select
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  disabled={updating === order.id}
                  className={`w-full px-3 py-2 text-sm font-semibold rounded-lg border-2 ${getStatusColor(order.status)} ${
                    updating === order.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-90 hover:shadow-md'
                  } transition-all duration-200 focus:ring-2 focus:ring-amber-500`}
                >
                  {statusOptions.slice(1).map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {updating === order.id && (
                  <div className="absolute right-2 top-2">
                    <svg className="w-4 h-4 animate-spin text-gray-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Info - Enhanced */}
            <div className="p-4">
              <div className="mb-3">
                <h4 className="text-base font-bold text-gray-800 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Müşteri Bilgileri
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900">
                        {order.customer_name || 'Bilinmiyor'}
                      </p>
                      <p className="text-xs text-gray-500">Ad Soyad</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900">
                        {order.customer_email}
                      </p>
                      <p className="text-xs text-gray-500">E-posta</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900">
                        {order.customer_phone}
                      </p>
                      <p className="text-xs text-gray-500">Telefon</p>
                    </div>
                  </div>
                  
                  {order.customer_address && (
                    <div className="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900 leading-relaxed">
                          {order.customer_address}
                        </p>
                        <p className="text-xs text-gray-500">Adres</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Kargo Bilgileri - Sadece kargoya verilmiş siparişler için */}
            {order.status === 'shipped' && (order.shipping_company || order.tracking_number) && (
              <div className="p-4 border-t border-gray-200">
                <div className="mb-3">
                  <h4 className="text-base font-bold text-gray-800 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                    Kargo Bilgileri
                  </h4>
                  <div className="space-y-2">
                    {order.shipping_company && (
                      <div className="flex items-center space-x-2 p-2 bg-purple-50 rounded-lg">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 8h-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h1a3 3 0 006 0h2a3 3 0 006 0h1a2 2 0 002-2v-4a2 2 0 00-2-2zM8 17a1 1 0 111-1 1 1 0 01-1 1zm8 0a1 1 0 111-1 1 1 0 01-1 1zM4 6h12v2H4z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-900">
                            {order.shipping_company}
                          </p>
                          <p className="text-xs text-gray-500">Kargo Şirketi</p>
                        </div>
                      </div>
                    )}
                    
                    {order.tracking_number && (
                      <div className="flex items-center space-x-2 p-2 bg-purple-50 rounded-lg">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-900 font-mono">
                            {order.tracking_number}
                          </p>
                          <p className="text-xs text-gray-500">Takip Numarası</p>
                        </div>
                      </div>
                    )}
                    
                    {order.shipping_date && (
                      <div className="flex items-center space-x-2 p-2 bg-purple-50 rounded-lg">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-3 3v6m-8 0a2 2 0 01-2-2V7a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2H4z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-900">
                            {formatDate(order.shipping_date)}
                          </p>
                          <p className="text-xs text-gray-500">Kargoya Verilme Tarihi</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Card Footer - Enhanced */}
            <div className="px-4 py-3 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex justify-between items-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openOrderModal(order);
                  }}
                  className="inline-flex items-center px-4 py-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 hover:border-amber-300 hover:shadow-md transition-all duration-200 group"
                >
                  <svg className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Detaylar
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmDelete(order.id, order.order_id);
                  }}
                  disabled={deleting === order.id}
                  className={`inline-flex items-center px-4 py-2 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 hover:shadow-md transition-all duration-200 group ${
                    deleting === order.id ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {deleting === order.id ? (
                    <>
                      <svg className="w-4 h-4 mr-1 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Siliniyor...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Sil
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {orders.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sipariş bulunamadı</h3>
          <p className="text-gray-500">Henüz hiç sipariş yok veya arama kriterlerinize uygun sipariş bulunamadı.</p>
        </div>
      )}

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 flex items-center space-x-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h4z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8v12a1 1 0 001 1h12a1 1 0 001-1V8" />
              </svg>
              <span>Sayfa {currentPage} / {totalPages}</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Önceki
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Sonraki
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeOrderModal}
        >
          <div 
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h2 className="text-2xl font-bold text-gray-900">Sipariş Detayları</h2>
                  <span className={`px-4 py-2 text-sm font-semibold rounded-full ${getPaymentStatusColor(selectedOrder.payment_status)}`}>
                    {selectedOrder.payment_status === 'success' ? '✅ Ödendi' : 
                     selectedOrder.payment_status === 'waiting' ? '⏳ Bekliyor' : 
                     selectedOrder.payment_status === 'failed' ? '❌ Başarısız' : selectedOrder.payment_status}
                  </span>
                </div>
                <button
                  onClick={closeOrderModal}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Bilgileri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Sipariş Numarası</p>
                    <p className="text-lg font-mono font-semibold text-gray-900">#{selectedOrder.order_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Sipariş Tarihi</p>
                    <p className="text-lg font-medium text-gray-900">{formatDate(selectedOrder.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Sipariş Durumu</p>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedOrder.status)}`}>
                      {statusOptions.find(opt => opt.value === selectedOrder.status)?.label}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Toplam Tutar</p>
                    <p className="text-2xl font-bold text-green-600">{formatPrice(selectedOrder.total_amount)}</p>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ürünler ({selectedOrder.order_items.length} adet)</h3>
                <div className="space-y-4">
                  {selectedOrder.order_items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        {item.products?.image_url ? (
                          <img
                            src={item.products.image_url}
                            alt={item.product_name}
                            className="w-16 h-16 rounded-lg object-cover border border-gray-300"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gray-200 border border-gray-300 flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.product_name}</h4>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-gray-500">
                            {item.quantity} adet × {formatPrice(item.unit_price)}
                          </span>
                          <span className="font-semibold text-gray-900">
                            {formatPrice(item.total_price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Müşteri Bilgileri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Ad Soyad</p>
                        <p className="font-medium text-gray-900">{selectedOrder.customer_name || 'Bilinmiyor'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">E-posta</p>
                        <p className="font-medium text-gray-900">{selectedOrder.customer_email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Telefon</p>
                        <p className="font-medium text-gray-900">{selectedOrder.customer_phone}</p>
                      </div>
                    </div>
                  </div>
                  {selectedOrder.customer_address && (
                    <div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Adres</p>
                          <p className="font-medium text-gray-900 leading-relaxed">{selectedOrder.customer_address}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Info */}
              {selectedOrder.status === 'shipped' && selectedOrder.shipping_company && (
                <div className="bg-purple-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Kargo Bilgileri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 8h-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h1a3 3 0 006 0h2a3 3 0 006 0h1a2 2 0 002-2v-4a2 2 0 00-2-2zM8 17a1 1 0 111-1 1 1 0 01-1 1zm8 0a1 1 0 111-1 1 1 0 01-1 1zM4 6h12v2H4z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Kargo Firması</p>
                        <p className="font-medium text-gray-900">{selectedOrder.shipping_company}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Takip Numarası</p>
                        <p className="font-mono font-medium text-gray-900">{selectedOrder.tracking_number}</p>
                      </div>
                    </div>
                    {selectedOrder.shipping_date && (
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Kargo Tarihi</p>
                          <p className="font-medium text-gray-900">{formatDate(selectedOrder.shipping_date)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Order Actions */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sipariş İşlemleri</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm text-gray-500 mb-2">Sipariş Durumu</label>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => {
                        updateOrderStatus(selectedOrder.id, e.target.value);
                        setSelectedOrder({...selectedOrder, status: e.target.value});
                      }}
                      disabled={updating === selectedOrder.id}
                      className={`w-full px-4 py-3 text-sm font-semibold rounded-xl border-2 ${getStatusColor(selectedOrder.status)} ${
                        updating === selectedOrder.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-90'
                      } transition-all duration-200`}
                    >
                      {statusOptions.slice(1).map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => router.push(`/admin/orders/${selectedOrder.id}`)}
                      className="px-6 py-3 text-sm font-semibold text-amber-700 bg-amber-50 border-2 border-amber-200 rounded-xl hover:bg-amber-100 hover:border-amber-300 transition-all duration-200"
                    >
                      Tam Sayfa
                    </button>
                    <button
                      onClick={() => {
                        confirmDelete(selectedOrder.id, selectedOrder.order_id);
                        closeOrderModal();
                      }}
                      className="px-6 py-3 text-sm font-semibold text-red-700 bg-red-50 border-2 border-red-200 rounded-xl hover:bg-red-100 hover:border-red-300 transition-all duration-200"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Siparişi Sil
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              <strong>#{deleteConfirm.orderNumber}</strong> numaralı siparişi silmek istediğinizden emin misiniz? 
              Bu işlem geri alınamaz ve sipariş ile ilgili tüm veriler kalıcı olarak silinecektir.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                disabled={deleting === deleteConfirm.orderId}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                İptal
              </button>
              <button
                onClick={() => deleteOrder(deleteConfirm.orderId)}
                disabled={deleting === deleteConfirm.orderId}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting === deleteConfirm.orderId ? 'Siliniyor...' : 'Sil'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shipping Info Modal */}
      {shippingModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 8h-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h1a3 3 0 006 0h2a3 3 0 006 0h1a2 2 0 002-2v-4a2 2 0 00-2-2zM8 17a1 1 0 111-1 1 1 0 01-1 1zm8 0a1 1 0 111-1 1 1 0 01-1 1zM4 6h12v2H4z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Kargo Bilgileri</h2>
                  <p className="text-sm text-gray-500">#{orders.find(o => o.id === shippingModal.orderId)?.order_id}</p>
                </div>
              </div>
              <button
                onClick={() => setShippingModal({open: false, orderId: null})}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Müşterinin siparişi kargoya verilmek üzere. Lütfen kargo firması ve takip numarasını giriniz.
              </p>

              {/* Kargo Firması */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kargo Firması <span className="text-red-500">*</span>
                </label>
                <select
                  value={shippingForm.shipping_company}
                  onChange={(e) => setShippingForm({...shippingForm, shipping_company: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                >
                  <option value="">Kargo firması seçiniz</option>
                  {shippingCompanies.map(company => (
                    <option key={company} value={company}>
                      {company}
                    </option>
                  ))}
                </select>
              </div>

              {/* Takip Numarası */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kargo Takip Numarası <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={shippingForm.tracking_number}
                  onChange={(e) => setShippingForm({...shippingForm, tracking_number: e.target.value})}
                  placeholder="Takip numarasını giriniz"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                />
              </div>

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p className="text-sm text-blue-700">
                    Bu bilgiler kaydedildikten sonra sipariş durumu "Kargoda" olarak güncellenecek ve müşteri bilgilendirilecektir.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShippingModal({open: false, orderId: null})}
                disabled={shippingLoading}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                İptal
              </button>
              <button
                onClick={saveShippingInfo}
                disabled={shippingLoading || !shippingForm.shipping_company || !shippingForm.tracking_number}
                className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {shippingLoading ? (
                  <>
                    <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Kargoya Veriliyor...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 8h-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h1a3 3 0 006 0h2a3 3 0 006 0h1a2 2 0 002-2v-4a2 2 0 00-2-2zM8 17a1 1 0 111-1 1 1 0 01-1 1zm8 0a1 1 0 111-1 1 1 0 01-1 1zM4 6h12v2H4z"/>
                    </svg>
                    Kargoya Ver
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
} 