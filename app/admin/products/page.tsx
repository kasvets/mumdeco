'use client';

import { useEffect, useState } from 'react';
import { supabase, Product } from '@/lib/supabase';
import { checkEnvironmentVariables } from '@/lib/env';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);
  const router = useRouter();

  // Modal state
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    showPositiveImage?: boolean;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    showPositiveImage: false
  });

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    isDangerous?: boolean;
    showNegativeImage?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    onCancel: () => {},
    confirmText: 'Evet',
    cancelText: 'Hayır',
    isDangerous: false,
    showNegativeImage: false
  });

  // Modal functions
  const showModal = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string, showPositiveImage = false) => {
    setModal({
      isOpen: true,
      type,
      title,
      message,
      showPositiveImage: type === 'success' ? showPositiveImage : false
    });
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  // Confirmation modal functions
  const showConfirmModal = (
    title: string, 
    message: string, 
    onConfirm: () => void, 
    options: {
      confirmText?: string;
      cancelText?: string;
      isDangerous?: boolean;
      showNegativeImage?: boolean;
    } = {}
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      onCancel: () => setConfirmModal(prev => ({ ...prev, isOpen: false })),
      confirmText: options.confirmText || 'Evet',
      cancelText: options.cancelText || 'Hayır',
      isDangerous: options.isDangerous || false,
      showNegativeImage: options.showNegativeImage || false
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  // ESC key handler
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmModal.isOpen) {
          closeConfirmModal();
        } else if (modal.isOpen) {
          closeModal();
        }
      }
    };
    
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [modal.isOpen, confirmModal.isOpen]);

  // Modal Component
  const Modal = () => {
    if (!modal.isOpen) return null;

    const getModalIcon = () => {
      switch (modal.type) {
        case 'success':
          return '✅';
        case 'error':
          return '❌';
        case 'warning':
          return '⚠️';
        case 'info':
          return 'ℹ️';
        default:
          return 'ℹ️';
      }
    };

    const getModalColors = () => {
      switch (modal.type) {
        case 'success':
          return {
            bg: 'bg-green-50',
            border: 'border-green-200',
            title: 'text-green-800',
            message: 'text-green-700',
            button: 'bg-green-600 hover:bg-green-700'
          };
        case 'error':
          return {
            bg: 'bg-red-50',
            border: 'border-red-200',
            title: 'text-red-800',
            message: 'text-red-700',
            button: 'bg-red-600 hover:bg-red-700'
          };
        case 'warning':
          return {
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            title: 'text-amber-800',
            message: 'text-amber-700',
            button: 'bg-amber-600 hover:bg-amber-700'
          };
        case 'info':
          return {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            title: 'text-blue-800',
            message: 'text-blue-700',
            button: 'bg-blue-600 hover:bg-blue-700'
          };
        default:
          return {
            bg: 'bg-gray-50',
            border: 'border-gray-200',
            title: 'text-gray-800',
            message: 'text-gray-700',
            button: 'bg-gray-600 hover:bg-gray-700'
          };
      }
    };

    const colors = getModalColors();

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
          onClick={closeModal}
        />
        
        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <div className={`relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 ${colors.bg} ${colors.border} border-2`}>
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-6">
              {/* Icon and Title */}
              <div className="flex items-center mb-4">
                <div className="text-4xl mr-3">
                  {getModalIcon()}
                </div>
                <h3 className={`text-lg font-semibold ${colors.title}`}>
                  {modal.title}
                </h3>
              </div>

              {/* Positive Image for Success */}
              {modal.showPositiveImage && modal.type === 'success' && (
                <div className="mb-4 flex justify-center">
                  <img 
                    src="/miro_positive.webp" 
                    alt="Success" 
                    className="w-24 h-24 object-contain rounded-lg"
                  />
                </div>
              )}

              {/* Message */}
              <p className={`text-sm mb-6 ${colors.message} leading-relaxed`}>
                {modal.message}
              </p>

              {/* Button */}
              <div className="flex justify-end">
                <button
                  onClick={closeModal}
                  className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${colors.button}`}
                >
                  Tamam
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Confirmation Modal Component
  const ConfirmModal = () => {
    if (!confirmModal.isOpen) return null;

    return (
      <div className="fixed inset-0 z-60 overflow-y-auto">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300" />
        
        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300">
            <div className="p-6">
              {/* Icon and Title */}
              <div className="flex items-center mb-4">
                <div className="text-4xl mr-3">
                  {confirmModal.isDangerous ? '⚠️' : '❓'}
                </div>
                <h3 className={`text-lg font-semibold ${confirmModal.isDangerous ? 'text-red-800' : 'text-gray-800'}`}>
                  {confirmModal.title}
                </h3>
              </div>

              {/* Negative Image for Dangerous Actions */}
              {confirmModal.showNegativeImage && confirmModal.isDangerous && (
                <div className="mb-4 flex justify-center">
                  <img 
                    src="/miro_negative.webp" 
                    alt="Warning" 
                    className="w-24 h-24 object-contain rounded-lg"
                  />
                </div>
              )}

              {/* Message */}
              <p className="text-sm mb-6 text-gray-700 leading-relaxed">
                {confirmModal.message}
              </p>

              {/* Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={confirmModal.onCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {confirmModal.cancelText}
                </button>
                <button
                  onClick={() => {
                    confirmModal.onConfirm();
                    closeConfirmModal();
                  }}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                    confirmModal.isDangerous 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {confirmModal.confirmText}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    // Debug information
    console.log('Admin Products Page Loading...');
    
    // Skip environment check since Supabase client is working
    // Just load the products directly
    console.log('Loading products...');
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setError(null); // Reset error state
      console.log('Fetching products from Supabase...');
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      console.log('Products fetched successfully:', data?.length || 0, 'products');
      setProducts(data || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      console.error('Ürünler yüklenirken hata:', {
        message: errorMessage,
        error: error,
        stack: error instanceof Error ? error.stack : undefined
      });
      // Kullanıcıya daha anlamlı hata mesajı göster
      setError(`Ürünler yüklenirken hata oluştu: ${errorMessage}`);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .order('category');

      if (error) {
        console.error('Supabase error details (categories):', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      if (data) {
        const uniqueCategories = [...new Set(data.map(item => item.category))];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', {
        message: error instanceof Error ? error.message : 'Bilinmeyen hata',
        error: error,
        stack: error instanceof Error ? error.stack : undefined
      });
      setCategories([]);
    }
  };

  const handleDelete = async (id: number) => {
    const deleteAction = async () => {
      await performDeleteProduct(id);
    };

    showConfirmModal(
      'Ürünü Sil',
      'Bu ürünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      deleteAction,
      { 
        confirmText: 'Sil', 
        cancelText: 'İptal', 
        isDangerous: true,
        showNegativeImage: true
      }
    );
  };

  const performDeleteProduct = async (id: number) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error details (delete):', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      setProducts(products.filter(p => p.id !== id));
      showModal('success', 'Başarılı!', 'Ürün başarıyla silindi!', true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      console.error('Ürün silinirken hata:', {
        message: errorMessage,
        error: error,
        stack: error instanceof Error ? error.stack : undefined
      });
      showModal('error', 'Hata!', `Ürün silinirken hata oluştu: ${errorMessage}`);
    }
  };

  const toggleStock = async (id: number, currentStock: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ in_stock: !currentStock })
        .eq('id', id);

      if (error) {
        console.error('Supabase error details (toggle stock):', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      setProducts(products.map(p => 
        p.id === id ? { ...p, in_stock: !currentStock } : p
      ));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      console.error('Stok durumu güncellenirken hata:', {
        message: errorMessage,
        error: error,
        stack: error instanceof Error ? error.stack : undefined
      });
      showModal('error', 'Hata!', `Stok durumu güncellenirken hata oluştu: ${errorMessage}`);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Ürünler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const isEnvError = error.includes('Environment değişkenleri eksik');
    
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-2xl mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {isEnvError ? 'Supabase Konfigürasyonu Eksik' : 'Bir Hata Oluştu'}
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          
          {isEnvError && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
              <h3 className="font-medium text-gray-900 mb-2">Çözüm:</h3>
              <p className="text-sm text-gray-600 mb-2">
                Proje kök dizininde <code className="bg-gray-200 px-1 rounded">.env.local</code> dosyası oluşturun:
              </p>
              <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
                {`NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key`}
              </pre>
              <p className="text-xs text-gray-500 mt-2">
                Supabase project settings → API bölümünden bu değerleri alabilirsiniz.
              </p>
            </div>
          )}
          
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Yeniden Yükle
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ürün Yönetimi</h1>
              <p className="text-gray-600 mt-2">Toplam {products.length} ürün</p>
            </div>
            <div className="flex space-x-4">
              <Link href="/admin/products/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Yeni Ürün Ekle
              </Link>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ürün Ara</label>
              <input
                type="text"
                placeholder="Ürün adı..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tüm Kategoriler</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-gray-500 text-lg">Henüz ürün eklenmemiş</p>
              <Link href="/admin/products/new" className="text-blue-600 hover:text-blue-800 font-medium">
                İlk ürünü ekle
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürün</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fiyat</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            {product.image_url ? (
                              <img src={product.image_url} alt={product.name} className="h-12 w-12 rounded-lg object-cover" />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.description?.substring(0, 50)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <span className="font-medium">{product.price}₺</span>
                          {product.old_price && (
                            <span className="text-gray-500 line-through ml-2">{product.old_price}₺</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleStock(product.id, product.in_stock)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            product.in_stock
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {product.in_stock ? 'Stokta' : 'Tükendi'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {product.is_new && (
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full mr-2">
                              Yeni
                            </span>
                          )}
                          {product.rating && (
                            <div className="flex items-center">
                              <span className="text-yellow-400">★</span>
                              <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Düzenle
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal Components */}
      <Modal />
      <ConfirmModal />
    </div>
  );
} 