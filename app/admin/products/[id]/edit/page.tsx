'use client';

import { useState, useEffect } from 'react';
import { supabase, Product, ProductUpdate, uploadProductImage, fetchProductImages, deleteProductImage, fetchOrphanedImages } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

const categories = [
  'model-1',
  'model-2',
  'model-3',
  'model-4',
  'model-5',
  'model-6',
  'model-7',
  'model-8',
  'model-9'
];

export default function EditProduct() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  // selectedFiles ve previewUrls artık gereksiz - direkt storage'a yükleme yapıyoruz
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [deletingImages, setDeletingImages] = useState<string[]>([]);
  const [orphanedImages, setOrphanedImages] = useState<{url: string, filename: string}[]>([]);
  const [assigningImages, setAssigningImages] = useState<string[]>([]);
  
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

  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [formData, setFormData] = useState<ProductUpdate>({
    name: '',
    description: '',
    price: 0,
    old_price: null,
    category: 'model-1',
    image_url: '',
    is_new: false,
    in_stock: true
  });

  useEffect(() => {
    if (productId) {
      fetchProduct();
      fetchExistingImages();
      fetchOrphanedImagesData();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          name: data.name,
          description: data.description,
          price: data.price,
          old_price: data.old_price,
          category: data.category,
          image_url: data.image_url,
          is_new: data.is_new,
          in_stock: data.in_stock
        });
      }
    } catch (error) {
      console.error('Ürün yüklenirken hata:', error);
      showModal('error', 'Hata!', 'Ürün bulunamadı! Ana sayfaya yönlendiriliyorsunuz...');
      setTimeout(() => {
        router.push('/admin/products');
      }, 2000);
    } finally {
      setFetching(false);
    }
  };

  const fetchExistingImages = async () => {
    try {
      const images = await fetchProductImages(productId);
      setExistingImages(images);
    } catch (error) {
      console.error('Mevcut görseller yüklenirken hata:', error);
    }
  };

  const fetchOrphanedImagesData = async () => {
    try {
      const images = await fetchOrphanedImages();
      setOrphanedImages(images);
    } catch (error) {
      console.error('Sahipsiz görseller yüklenirken hata:', error);
    }
  };

  const handleDeleteExistingImage = async (imageUrl: string) => {
    const deleteAction = async () => {
      setDeletingImages(prev => [...prev, imageUrl]);
      await performDeleteImage(imageUrl);
    };

    showConfirmModal(
      'Görseli Sil',
      'Bu görseli silmek istediğinizden emin misiniz?',
      deleteAction,
      { 
        confirmText: 'Sil', 
        cancelText: 'İptal', 
        isDangerous: true,
        showNegativeImage: true
      }
    );
  };

  const performDeleteImage = async (imageUrl: string) => {

    try {
      const success = await deleteProductImage(imageUrl);
      if (success) {
        setExistingImages(prev => prev.filter(url => url !== imageUrl));
        
        // Eğer silinen görsel ana görsel ise, mevcut görseller arasından yeni bir ana görsel seç
        if (formData.image_url === imageUrl) {
          const remainingImages = existingImages.filter(url => url !== imageUrl);
          if (remainingImages.length > 0) {
            setFormData(prev => ({ 
              ...prev, 
              image_url: remainingImages[0] 
            }));
          } else {
            // Hiç görsel kalmadıysa database'deki image_url'i de temizle
            setFormData(prev => ({ 
              ...prev, 
              image_url: '' 
            }));
            // Database'i de güncelle
            await supabase
              .from('products')
              .update({ image_url: '' })
              .eq('id', productId);
          }
        }
        
        showModal('success', 'Başarılı!', 'Görsel başarıyla silindi!', true);
      } else {
        showModal('error', 'Hata!', 'Görsel silinirken hata oluştu!');
      }
    } catch (error) {
      console.error('Görsel silinirken hata:', error);
      showModal('error', 'Hata!', 'Görsel silinirken hata oluştu!');
    } finally {
      setDeletingImages(prev => prev.filter(url => url !== imageUrl));
    }
  };

  const clearMainImage = async () => {
    const clearAction = async () => {
      await performClearMainImage();
    };

    showConfirmModal(
      'Ana Görseli Temizle',
      'Ana görseli temizlemek istediğinizden emin misiniz? Bu işlem sadece database\'deki ana görsel referansını temizler.',
      clearAction,
      { 
        confirmText: 'Temizle', 
        cancelText: 'İptal', 
        isDangerous: true,
        showNegativeImage: true
      }
    );
  };

  const performClearMainImage = async () => {
    try {
      // Database'deki image_url'i temizle
      const { error } = await supabase
        .from('products')
        .update({ image_url: '' })
        .eq('id', productId);
      
      if (error) throw error;
      
      // Form state'ini güncelle
      setFormData(prev => ({ ...prev, image_url: '' }));
      
      showModal('success', 'Başarılı!', 'Ana görsel başarıyla temizlendi!', true);
    } catch (error) {
      console.error('Ana görsel temizlenirken hata:', error);
      showModal('error', 'Hata!', 'Ana görsel temizlenirken hata oluştu!');
    }
  };

  const setAsMainImage = async (imageUrl: string) => {
    try {
      setFormData(prev => ({ ...prev, image_url: imageUrl }));
      showModal('success', 'Başarılı!', 'Ana görsel olarak ayarlandı!', true);
    } catch (error) {
      console.error('Ana görsel ayarlanırken hata:', error);
      showModal('error', 'Hata!', 'Ana görsel ayarlanırken hata oluştu!');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('products')
        .update(formData)
        .eq('id', productId)
        .select()
        .single();

      if (error) throw error;

      showModal('success', 'Başarılı!', 'Ürün başarıyla güncellendi! Ürün listesine yönlendiriliyorsunuz...', true);
      
      // 2 saniye sonra yönlendir
      setTimeout(() => {
        router.push('/admin/products');
      }, 2000);
    } catch (error) {
      console.error('Ürün güncellenirken hata:', error);
      showModal('error', 'Hata!', 'Ürün güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      showModal('warning', 'Uyarı!', 'Lütfen sadece resim dosyalarını seçin!');
      return;
    }

    // Dosya boyut kontrolü (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024;
    const oversizedFiles = imageFiles.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      showModal('warning', 'Dosya Boyutu Uyarısı!', `Şu dosyalar 5MB'dan büyük: ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }

    setImageUploading(true);
    
    // Görseller direkt storage'a yüklenecek, preview gerek yok

    try {
      // Tüm dosyaları gerçek storage'a yükle
      const uploadPromises = imageFiles.map(file => 
        uploadProductImage(file, parseInt(productId))
      );
      
      const uploadedUrls = await Promise.all(uploadPromises);
      const successfulUploads = uploadedUrls.filter(url => url !== null);
      
      if (successfulUploads.length > 0) {
        // İlk görseli ana görsel olarak ayarla (eğer henüz ana görsel yoksa)
        if (!formData.image_url) {
          setFormData(prev => ({ ...prev, image_url: successfulUploads[0] }));
        }
        
        // Mevcut görselleri güncelle
        setExistingImages(prev => [...prev, ...successfulUploads]);
        
        showModal('success', 'Başarılı!', `${successfulUploads.length} görsel başarıyla yüklendi ve depolandı!`, true);
      }
    } catch (error: any) {
      console.error('Görsel yükleme hatası:', error);
      const errorMessage = error?.message || 'Bilinmeyen hata';
      
      if (errorMessage.includes('bucket') || errorMessage.includes('not found')) {
        // Storage bucket hatası için özel mesaj
        const bucketNotFoundMessage = `Storage Bucket bulunamadı!

ÇÖZÜM:
1. Supabase Dashboard'a gidin: https://supabase.com/dashboard
2. Sol menüden "Storage" sekmesine tıklayın
3. "New bucket" butonuna tıklayın
4. Bucket adını "products" yazın
5. "Public bucket" seçeneğini işaretleyin ✅
6. "Create bucket" butonuna tıklayın

Detaylı rehber için STORAGE_SETUP.md dosyasını inceleyin.`;
        showModal('error', 'Storage Bucket Bulunamadı!', bucketNotFoundMessage);
      } else if (errorMessage.includes('permission') || errorMessage.includes('authorized')) {
        showModal('error', 'Yetki Hatası!', 'Storage bucket\'ının public olduğundan emin olun ve RLS policy\'lerini kontrol edin.');
      } else {
        showModal('error', 'Yükleme Hatası!', `Görsel yükleme hatası: ${errorMessage}`);
      }
    } finally {
      setImageUploading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(files);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // removeFile fonksiyonu artık gereksiz çünkü preview sistemi yok
  // Görseller direkt storage'a yükleniyor ve mevcut görseller bölümünde yönetiliyor

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked 
             : type === 'number' ? (value === '' ? null : Number(value))
             : value
    });
  };

  const assignImageToProduct = async (filename: string, imageUrl: string) => {
    setAssigningImages(prev => [...prev, filename]);
    
    try {
      // Create new filename with proper product ID
      const fileExtension = filename.split('.').pop();
      const timestamp = Date.now();
      const newFilename = `product-${productId}-${timestamp}.${fileExtension}`;
      
      // First, download the image
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Upload with new filename
      const { data, error } = await supabase.storage
        .from('products')
        .upload(newFilename, blob, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) throw error;
      
      // Delete the old file
      await supabase.storage
        .from('products')
        .remove([filename]);
      
      // Get new public URL
      const { data: publicData } = supabase.storage
        .from('products')
        .getPublicUrl(newFilename);
      
      // Update existing images
      setExistingImages(prev => [...prev, publicData.publicUrl]);
      
      // Remove from orphaned images
      setOrphanedImages(prev => prev.filter(img => img.filename !== filename));
      
      // If no main image set, set this as main image
      if (!formData.image_url) {
        setFormData(prev => ({ ...prev, image_url: publicData.publicUrl }));
      }
      
      showModal('success', 'Başarılı!', 'Görsel başarıyla bu ürüne atandı!', true);
    } catch (error) {
      console.error('Görsel atanırken hata:', error);
      showModal('error', 'Hata!', 'Görsel atanırken hata oluştu!');
    } finally {
      setAssigningImages(prev => prev.filter(f => f !== filename));
    }
  };

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

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Ürün yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ürün Düzenle</h1>
            <p className="text-gray-600 mt-2">Ürün bilgilerini güncelleyin</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Ürün Adı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Örn: Romantik Lavanta Mumu"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category || 'model-1'}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ürün açıklaması..."
              />
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Fiyat (₺) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="299.90"
                />
              </div>

              <div>
                <label htmlFor="old_price" className="block text-sm font-medium text-gray-700 mb-2">
                  Eski Fiyat (₺) <span className="text-gray-400">(opsiyonel)</span>
                </label>
                <input
                  type="number"
                  id="old_price"
                  name="old_price"
                  min="0"
                  step="0.01"
                  value={formData.old_price || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="399.90"
                />
              </div>
            </div>

            {/* Existing Images Gallery */}
            {existingImages.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mevcut Ürün Görselleri ({existingImages.length})
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {existingImages.map((url, index) => (
                    <div key={index} className="relative group">
                      <div 
                        className="aspect-square bg-gray-100 rounded-lg overflow-hidden border cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setAsMainImage(url)}
                      >
                        <img
                          src={url}
                          alt={`Mevcut görsel ${index + 1}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      
                      {/* Ana görsel işareti */}
                      {formData.image_url === url && (
                        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                          Ana Görsel
                        </div>
                      )}
                      
                      {/* Silme butonu */}
                      <button
                        type="button"
                        onClick={() => handleDeleteExistingImage(url)}
                        disabled={deletingImages.includes(url)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 disabled:opacity-50 shadow-md"
                        title="Görseli sil"
                      >
                        {deletingImages.includes(url) ? '...' : '×'}
                      </button>
                      
                      {/* Ana görsel yapma butonu */}
                      {formData.image_url !== url && (
                        <button
                          type="button"
                          onClick={() => setAsMainImage(url)}
                          className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded hover:bg-blue-600"
                          title="Ana görsel yap"
                        >
                          Ana Yap
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-2 text-sm text-gray-600">
                  💡 Ana görsel yapmak için görsele tıklayın
                </div>
              </div>
            )}

            {/* Database Image URL as fallback */}
            {existingImages.length === 0 && formData.image_url && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                <label className="block text-sm font-medium text-amber-800 mb-2">
                  ⚠️ Database'den Kalan Ana Görsel
                </label>
                <div className="flex items-start space-x-4">
                  <div className="relative">
                    <div className="aspect-square w-32 bg-gray-100 rounded-lg overflow-hidden border">
                      <img
                        src={formData.image_url}
                        alt="Database'den mevcut görsel"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                      Ana Görsel
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-amber-700 mb-3">
                      <p className="font-medium mb-1">Bu görsel database'de kayıtlı ancak storage'da bulunamadı.</p>
                      <p>Muhtemelen görsel dosyası silinmiş ama database referansı kalmış.</p>
                    </div>
                    <button
                      type="button"
                      onClick={clearMainImage}
                      className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-2 rounded-md transition-colors"
                    >
                      Ana Görseli Temizle
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Orphaned Images - Images that can be assigned to this product */}
            {orphanedImages.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <label className="block text-sm font-medium text-blue-800 mb-2">
                  🔗 Storage'da Bu Ürüne Atanabilecek Görseller ({orphanedImages.length})
                </label>
                <p className="text-sm text-blue-700 mb-4">
                  Bu görseller daha önce yüklenmiş ancak henüz hiçbir ürüne atanmamış. Bu ürüne atamak için "Ata" butonuna tıklayın.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {orphanedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                        <img
                          src={image.url}
                          alt={`Sahipsiz görsel ${index + 1}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      
                      {/* Assign button */}
                      <button
                        type="button"
                        onClick={() => assignImageToProduct(image.filename, image.url)}
                        disabled={assigningImages.includes(image.filename)}
                        className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
                        title="Bu ürüne ata"
                      >
                        {assigningImages.includes(image.filename) ? 'Atanıyor...' : 'Ata'}
                      </button>
                      
                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => {
                          const deleteOrphanedAction = async () => {
                            const success = await deleteProductImage(image.url);
                            if (success) {
                              setOrphanedImages(prev => prev.filter(img => img.filename !== image.filename));
                              showModal('success', 'Başarılı!', 'Görsel başarıyla silindi!', true);
                            } else {
                              showModal('error', 'Hata!', 'Görsel silinirken hata oluştu!');
                            }
                          };

                          showConfirmModal(
                            'Görseli Kalıcı Olarak Sil',
                            'Bu görseli kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
                            deleteOrphanedAction,
                            { 
                              confirmText: 'Sil', 
                              cancelText: 'İptal', 
                              isDangerous: true,
                              showNegativeImage: true
                            }
                          );
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 shadow-md"
                        title="Görseli sil"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yeni Ürün Görselleri
              </label>
              
              {/* Drag & Drop Zone */}
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="space-y-2">
                  <div className="text-gray-600">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-blue-600">Dosya seçmek için tıklayın</span> veya sürükleyip bırakın
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, JPEG, WEBP (Maks. 5MB)</p>
                </div>
                
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              {/* Upload Progress */}
              {imageUploading && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                    <span className="text-blue-700 text-sm">Yeni görsel yükleniyor...</span>
                  </div>
                </div>
              )}

              {/* Upload completed message will be shown via alert */}
            </div>

            {/* Checkboxes */}
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_new"
                  name="is_new"
                  checked={formData.is_new || false}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_new" className="ml-2 block text-sm text-gray-900">
                  Yeni ürün olarak işaretle
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="in_stock"
                  name="in_stock"
                  checked={formData.in_stock || false}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="in_stock" className="ml-2 block text-sm text-gray-900">
                  Stokta mevcut
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex justify-end space-x-4">
                <Link href="/admin/products" className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors">
                  İptal
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Güncelleniyor...
                    </div>
                  ) : (
                    'Ürünü Güncelle'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <Modal />
      <ConfirmModal />
    </div>
  );
} 