'use client';

import { useEffect, useState, useCallback, memo } from 'react';
import { supabase, Product } from '@/lib/supabase';
import { checkEnvironmentVariables } from '@/lib/env';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Category mapping for display names
const categoryMap: { [key: string]: string } = {
  'model-1': 'Toscana',
  'model-2': 'Provence',
  'model-3': 'Petra',
  'model-4': 'London',
  'model-5': 'Aegean',
  'model-6': 'Adriatic',
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all'); // all, active, inactive
  const [categories, setCategories] = useState<string[]>([]);
  const router = useRouter();

  // Price editing state
  const [editingPrice, setEditingPrice] = useState<{
    productId: number;
    price: string;
    oldPrice: string;
  } | null>(null);

  // Bulk price update state
  const [bulkPriceModal, setBulkPriceModal] = useState<{
    isOpen: boolean;
    selectedProducts: number[];
  }>({
    isOpen: false,
    selectedProducts: []
  });

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
      console.log('🔄 AdminProducts: Fetching products from API...');
      
      const response = await fetch('/api/admin/products');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      console.log('✅ AdminProducts: Products fetched successfully:', result.products?.length || 0, 'products');
      console.log('📦 AdminProducts: Sample products:', result.products?.slice(0, 2));
      setProducts(result.products || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      console.error('❌ AdminProducts: Error details:', {
        message: errorMessage,
        error: error,
        stack: error instanceof Error ? error.stack : undefined
      });
      // Kullanıcıya daha anlamlı hata mesajı göster
      setError(`Ürünler yüklenirken hata oluştu: ${errorMessage}`);
      setProducts([]);
    } finally {
      console.log('✨ AdminProducts: Loading finished');
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/debug/products');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      if (result.products) {
        const uniqueCategories = [...new Set(result.products.map((item: any) => item.category).filter((cat: any) => typeof cat === 'string'))];
        setCategories(uniqueCategories as string[]);
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
      const response = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
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
      const response = await fetch(`/api/admin/products?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ in_stock: !currentStock })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
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

  const toggleActive = async (id: number, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/products?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ active: !currentActive })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setProducts(products.map(p => 
        p.id === id ? { ...p, active: !currentActive } : p
      ));
      
      showModal('success', 'Başarılı!', `Ürün ${!currentActive ? 'aktif' : 'deaktif'} edildi!`, true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      console.error('Ürün durumu güncellenirken hata:', {
        message: errorMessage,
        error: error,
        stack: error instanceof Error ? error.stack : undefined
      });
      showModal('error', 'Hata!', `Ürün durumu güncellenirken hata oluştu: ${errorMessage}`);
    }
  };

  // Price editing functions
  const startPriceEdit = (product: Product) => {
    setEditingPrice({
      productId: product.id,
      price: product.price.toString(),
      oldPrice: product.old_price?.toString() || ''
    });
  };

  const cancelPriceEdit = () => {
    setEditingPrice(null);
  };

  const savePriceEdit = async () => {
    if (!editingPrice) return;

    try {
      const updateData: any = {
        price: parseFloat(editingPrice.price) || 0
      };

      // Only update old_price if it's different from the current old_price
      if (editingPrice.oldPrice !== '') {
        updateData.old_price = parseFloat(editingPrice.oldPrice) || null;
      }

      const response = await fetch(`/api/admin/products/${editingPrice.productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Update the product in the local state
      setProducts(products.map(p => 
        p.id === editingPrice.productId 
          ? { 
              ...p, 
              price: parseFloat(editingPrice.price) || 0,
              old_price: editingPrice.oldPrice ? parseFloat(editingPrice.oldPrice) : null
            } 
          : p
      ));
      
      setEditingPrice(null);
      showModal('success', 'Başarılı!', 'Fiyat başarıyla güncellendi!', true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      console.error('Fiyat güncellenirken hata:', {
        message: errorMessage,
        error: error,
        stack: error instanceof Error ? error.stack : undefined
      });
      showModal('error', 'Hata!', `Fiyat güncellenirken hata oluştu: ${errorMessage}`);
    }
  };

  const handlePriceKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      savePriceEdit();
    } else if (e.key === 'Escape') {
      cancelPriceEdit();
    }
  };

  // Bulk price update functions
  const openBulkPriceModal = useCallback(() => {
    setBulkPriceModal({
      isOpen: true,
      selectedProducts: []
    });
  }, []);

  const closeBulkPriceModal = useCallback(() => {
    setBulkPriceModal({
      isOpen: false,
      selectedProducts: []
    });
  }, []);



  const saveBulkPriceUpdate = async (data: { bulkPrice: string; bulkOldPrice: string; selectedProducts: number[] }) => {
    if (data.selectedProducts.length === 0) {
      showModal('warning', 'Uyarı!', 'Lütfen en az bir ürün seçin.');
      return;
    }

    if (!data.bulkPrice || parseFloat(data.bulkPrice) <= 0) {
      showModal('warning', 'Uyarı!', 'Lütfen geçerli bir fiyat girin.');
      return;
    }

    try {
      const updatePromises = data.selectedProducts.map(productId => {
        const updateData: any = {
          price: parseFloat(data.bulkPrice)
        };

        if (data.bulkOldPrice !== '') {
          updateData.old_price = parseFloat(data.bulkOldPrice) || null;
        }

        return fetch(`/api/admin/products/${productId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });
      });

      const responses = await Promise.all(updatePromises);
      
      // Check if all requests were successful
      const failedUpdates = responses.filter(response => !response.ok);
      
      if (failedUpdates.length > 0) {
        throw new Error(`${failedUpdates.length} ürün güncellenirken hata oluştu`);
      }

      // Update local state for all selected products
      setProducts(products.map(p => 
        data.selectedProducts.includes(p.id)
          ? { 
              ...p, 
              price: parseFloat(data.bulkPrice),
              old_price: data.bulkOldPrice ? parseFloat(data.bulkOldPrice) : p.old_price
            }
          : p
      ));

      closeBulkPriceModal();
      showModal('success', 'Başarılı!', `${data.selectedProducts.length} ürün fiyatı başarıyla güncellendi!`, true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      console.error('Toplu fiyat güncellenirken hata:', error);
      showModal('error', 'Hata!', `Toplu fiyat güncellenirken hata oluştu: ${errorMessage}`);
    }
  };

  // Price cell component
  const PriceCell = ({ product }: { product: Product }) => {
    const isEditing = editingPrice?.productId === product.id;

    if (isEditing) {
      return (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={editingPrice.price}
              onChange={(e) => setEditingPrice(prev => prev ? { ...prev, price: e.target.value } : null)}
              onKeyDown={handlePriceKeyDown}
              onBlur={savePriceEdit}
              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Fiyat"
              autoFocus
            />
            <span className="text-sm text-gray-500">₺</span>
          </div>
          {/* Old price input */}
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={editingPrice.oldPrice}
              onChange={(e) => setEditingPrice(prev => prev ? { ...prev, oldPrice: e.target.value } : null)}
              onKeyDown={handlePriceKeyDown}
              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Eski fiyat"
            />
            <span className="text-sm text-gray-400">₺</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={savePriceEdit}
              className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
            >
              Kaydet
            </button>
            <button
              onClick={cancelPriceEdit}
              className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              İptal
            </button>
          </div>
        </div>
      );
    }

    return (
      <div 
        className="cursor-pointer hover:bg-green-50 p-3 rounded-lg transition-all duration-200 border border-transparent hover:border-green-200 group"
        onClick={() => startPriceEdit(product)}
        title="Fiyatı düzenlemek için tıklayın"
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium text-lg">{product.price}₺</span>
            {product.old_price && (
              <span className="text-gray-500 line-through ml-2">{product.old_price}₺</span>
            )}
          </div>
          <div className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium group-hover:bg-green-200 transition-colors">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            Fiyat Düzenle
          </div>
        </div>
      </div>
    );
  };

  // Simple component render
  const BulkPriceModal = () => {
    if (!bulkPriceModal.isOpen) return null;
    
    return (
      <BulkPriceModalComponent
        bulkPriceModal={bulkPriceModal}
        onClose={closeBulkPriceModal}
        onSave={saveBulkPriceUpdate}
        categories={categories}
        categoryMap={categoryMap}
        filteredProducts={filteredProducts}
      />
    );
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'active' && product.active !== false) ||
                         (selectedStatus === 'inactive' && product.active === false) ||
                         selectedStatus === 'price-edit';
    return matchesSearch && matchesCategory && matchesStatus;
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
              <button
                onClick={openBulkPriceModal}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span>Toplu Fiyat Güncelle</span>
              </button>
              <Link href="/admin/products/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Yeni Ürün Ekle
              </Link>
            </div>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'all', label: 'Tümü', count: products.length },
                { key: 'active', label: 'Aktif', count: products.filter(p => p.active !== false).length },
                { key: 'inactive', label: 'Deaktif', count: products.filter(p => p.active === false).length },
                { key: 'price-edit', label: 'Hızlı Fiyat Düzenle', count: products.length }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedStatus(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    selectedStatus === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} {tab.key !== 'price-edit' && `(${tab.count})`}
                </button>
              ))}
            </nav>
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
                  <option key={category} value={category}>{categoryMap[category] || category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Table or Price Edit View */}
        {selectedStatus === 'price-edit' ? (
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
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Hızlı Fiyat Düzenle</h3>
                  <p className="text-sm text-gray-600">Ürün fiyatlarını tıklayarak direkt düzenleyebilirsiniz.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                      <div className="flex items-center mb-3">
                        <div className="flex-shrink-0 h-16 w-16 mr-3">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="h-16 w-16 rounded-lg object-cover" />
                          ) : (
                            <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                              <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">{product.name}</h4>
                          <p className="text-xs text-gray-500 mt-1">{categoryMap[product.category] || product.category}</p>
                        </div>
                      </div>
                      <div className="border-t pt-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Fiyat</label>
                        <PriceCell product={product} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
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
                          {categoryMap[product.category] || product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <PriceCell product={product} />
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
                          <button
                            onClick={() => toggleActive(product.id, product.active !== false)}
                            className={`px-3 py-1 rounded-full text-xs font-medium ml-2 ${
                              product.active !== false
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {product.active !== false ? 'Aktif' : 'Deaktif'}
                          </button>
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
        )}
      </div>
      
      {/* Modal Components */}
      <Modal />
      <ConfirmModal />
      <BulkPriceModal />
    </div>
  );
}

// Separate Bulk Price Modal Component with Internal State
const BulkPriceModalComponent = memo(({
  bulkPriceModal,
  onClose,
  onSave,
  categories,
  categoryMap,
  filteredProducts
}: {
  bulkPriceModal: {
    isOpen: boolean;
    selectedProducts: number[];
  };
  onClose: () => void;
  onSave: (data: { bulkPrice: string; bulkOldPrice: string; selectedProducts: number[] }) => void;
  categories: string[];
  categoryMap: { [key: string]: string };
  filteredProducts: Product[];
}) => {
  // Internal state for inputs to prevent re-renders
  const [bulkPrice, setBulkPrice] = useState('');
  const [bulkOldPrice, setBulkOldPrice] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

  // Reset state when modal opens
  useEffect(() => {
    if (bulkPriceModal.isOpen) {
      setBulkPrice('');
      setBulkOldPrice('');
      setSelectedProducts([]);
    }
  }, [bulkPriceModal.isOpen]);

  const handleBulkPriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setBulkPrice(e.target.value);
  }, []);

  const handleBulkOldPriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setBulkOldPrice(e.target.value);
  }, []);

  const toggleProductSelection = useCallback((productId: number) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  }, []);

  const selectAllProducts = useCallback(() => {
    setSelectedProducts(filteredProducts.map(p => p.id));
  }, [filteredProducts]);

  const clearAllSelection = useCallback(() => {
    setSelectedProducts([]);
  }, []);

  const handleSave = useCallback(() => {
    onSave({
      bulkPrice,
      bulkOldPrice,
      selectedProducts
    });
  }, [bulkPrice, bulkOldPrice, selectedProducts, onSave]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Toplu Fiyat Güncelleme</h3>
                <p className="text-sm text-gray-600">Seçilen ürünlerin fiyatlarını topluca güncelleyin</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {/* Price Inputs */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-4">Yeni Fiyat Bilgileri</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Yeni Fiyat</label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      step="0.01"
                      value={bulkPrice}
                      onChange={handleBulkPriceChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Örn: 299.99"
                      autoComplete="off"
                    />
                    <span className="ml-2 text-gray-500">₺</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Eski Fiyat (İsteğe Bağlı)</label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      step="0.01"
                      value={bulkOldPrice}
                      onChange={handleBulkOldPriceChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Örn: 499.99"
                      autoComplete="off"
                    />
                    <span className="ml-2 text-gray-500">₺</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Selection */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">Ürün Seçimi ({selectedProducts.length} seçili)</h4>
                <div className="flex space-x-2">
                  <button
                    onClick={selectAllProducts}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    Tümünü Seç
                  </button>
                  <button
                    onClick={clearAllSelection}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    Seçimi Temizle
                  </button>
                </div>
              </div>

              {/* Product List by Category */}
              <div className="space-y-4">
                {categories.map(category => {
                  const categoryProducts = filteredProducts.filter(p => p.category === category);
                  if (categoryProducts.length === 0) return null;

                  return (
                    <div key={category} className="border border-gray-200 rounded-lg">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                        <h5 className="font-medium text-gray-900">{categoryMap[category] || category}</h5>
                      </div>
                      <div className="p-4 space-y-2">
                        {categoryProducts.map(product => (
                          <label key={product.id} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedProducts.includes(product.id)}
                              onChange={() => toggleProductSelection(product.id)}
                              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                            />
                            <div className="flex items-center space-x-3 flex-1">
                              <div className="w-10 h-10 rounded bg-gray-200">
                                {product.image_url ? (
                                  <img src={product.image_url} alt={product.name} className="w-10 h-10 rounded object-cover" />
                                ) : (
                                  <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{product.name}</div>
                                <div className="text-sm text-gray-500">Mevcut fiyat: {product.price}₺</div>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              {selectedProducts.length > 0 && (
                <span>{selectedProducts.length} ürün seçili</span>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleSave}
                disabled={selectedProducts.length === 0 || !bulkPrice}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Fiyatları Güncelle
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

BulkPriceModalComponent.displayName = 'BulkPriceModalComponent'; 