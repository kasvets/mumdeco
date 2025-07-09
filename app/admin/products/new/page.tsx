'use client';

import { useState } from 'react';
import { supabase, ProductInsert, uploadProductImage } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const categories = [
  { value: 'model-6', label: 'Adriatic' },
  { value: 'model-5', label: 'Aegean' },
  { value: 'model-4', label: 'London' },
  { value: 'model-3', label: 'Petra' },
  { value: 'model-2', label: 'Provence' },
  { value: 'model-1', label: 'Toscana' },
];

export default function NewProduct() {
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [deletingImages, setDeletingImages] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
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

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    old_price: null,
    category: 'model-1',
    image_url: '',
    is_new: false,
    in_stock: true,
    active: true,
    rating: null as number | null,
    reviews: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Eğer görsel upload işlemi devam ediyorsa bekle
      if (imageUploading) {
        showModal('warning', 'Uyarı!', 'Görsel yükleme işlemi devam ediyor, lütfen bekleyin...');
        setLoading(false);
        return;
      }

      // Gerekli alanları kontrol et
      if (!formData.name || !formData.category || !formData.price) {
        showModal('warning', 'Uyarı!', 'Lütfen tüm gerekli alanları doldurun.');
        setLoading(false);
        return;
      }

      console.log('Form data being sent:', formData);
      
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Server response:', result);
      
      if (result.error) {
        throw new Error(result.error);
      }

      showModal('success', 'Başarılı!', 'Ürün başarıyla eklendi! Ürün listesine yönlendiriliyorsunuz...', true);
      
      // State'leri temizle
      setExistingImages([]);
      setFormData({
        name: '',
        description: '',
        price: 0,
        old_price: null,
        category: 'model-1',
        image_url: '',
        is_new: false,
        in_stock: true,
        active: true,
        rating: null,
        reviews: 0
      });
      
      // 2 saniye sonra yönlendir
      setTimeout(() => {
        router.push('/admin/products');
      }, 2000);
      
    } catch (error) {
      console.error('Ürün eklenirken hata:', error);
      showModal('error', 'Hata!', 'Ürün eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
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

    try {
      // Tüm dosyaları API üzerinden yükle
      const uploadPromises = imageFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('productId', 'new'); // For new products

        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Upload failed');
        }

        const result = await response.json();
        return result.url;
      });
      
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
      // Input'u temizle ki aynı dosyalar tekrar seçilebilsin
      e.target.value = '';
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
      // API üzerinden görseli sil
      const response = await fetch(`/api/admin/images/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageUrl })
      });

      if (response.ok) {
        // Görseli listeden çıkar
        setExistingImages(prev => prev.filter(url => url !== imageUrl));
        
        // Ana görselse formData'dan da çıkar
        if (formData.image_url === imageUrl) {
          // Başka görsel varsa ilkini ana görsel yap
          const remainingImages = existingImages.filter(url => url !== imageUrl);
          setFormData(prev => ({ ...prev, image_url: remainingImages[0] || '' }));
        }
        
        showModal('success', 'Başarılı!', 'Görsel başarıyla silindi!', true);
      } else {
        throw new Error('Silme işlemi başarısız');
      }
    } catch (error) {
      console.error('Görsel silme hatası:', error);
      showModal('error', 'Hata!', 'Görsel silinirken bir hata oluştu.');
    } finally {
      setDeletingImages(prev => prev.filter(url => url !== imageUrl));
    }
  };

  const setAsMainImage = async (imageUrl: string) => {
    setFormData(prev => ({ ...prev, image_url: imageUrl }));
    showModal('success', 'Başarılı!', 'Ana görsel başarıyla güncellendi!', true);
  };

  // Drag & Drop functions for image reordering
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleImageReorder = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newImages = [...existingImages];
    const draggedImage = newImages[draggedIndex];
    
    // Remove the dragged image from its current position
    newImages.splice(draggedIndex, 1);
    
    // Insert it at the new position
    newImages.splice(dropIndex, 0, draggedImage);
    
    setExistingImages(newImages);
    setDraggedIndex(null);
    setDragOverIndex(null);
    
    // Ana görsel değişmişse güncelle
    if (draggedIndex === 0) {
      // Ana görsel sürükleniyorsa, yeni ilk görsel ana görsel olsun
      setFormData(prev => ({ ...prev, image_url: newImages[0] || '' }));
    } else if (dropIndex === 0) {
      // Bir görsel ana görsel pozisyonuna sürükleniyorsa, onu ana görsel yap
      setFormData(prev => ({ ...prev, image_url: draggedImage }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked 
             : type === 'number' ? (value === '' ? null : Number(value))
             : value
    });
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

            {/* Content */}
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                {modal.showPositiveImage && (
                  <img 
                    src="/miro_positive.webp" 
                    alt="Success" 
                    className="w-16 h-16 object-contain"
                  />
                )}
                {!modal.showPositiveImage && (
                  <div className="text-4xl">
                    {getModalIcon()}
                  </div>
                )}
              </div>
              
              <h3 className={`text-xl font-bold text-center mb-4 ${colors.title}`}>
                {modal.title}
              </h3>
              
              <p className={`text-center mb-6 ${colors.message} whitespace-pre-line`}>
                {modal.message}
              </p>
              
              <div className="flex justify-center">
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

    const colors = confirmModal.isDangerous 
      ? {
          bg: 'bg-red-50',
          border: 'border-red-200',
          title: 'text-red-800',
          message: 'text-red-700',
          confirmButton: 'bg-red-600 hover:bg-red-700',
          cancelButton: 'bg-gray-500 hover:bg-gray-600'
        }
      : {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          title: 'text-blue-800',
          message: 'text-blue-700',
          confirmButton: 'bg-blue-600 hover:bg-blue-700',
          cancelButton: 'bg-gray-500 hover:bg-gray-600'
        };

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
          onClick={confirmModal.onCancel}
        />
        
        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <div className={`relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 ${colors.bg} ${colors.border} border-2`}>
            {/* Close button */}
            <button
              onClick={confirmModal.onCancel}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                {confirmModal.showNegativeImage && (
                  <img 
                    src="/miro_negative.webp" 
                    alt="Warning" 
                    className="w-16 h-16 object-contain"
                  />
                )}
                {!confirmModal.showNegativeImage && (
                  <div className="text-4xl">
                    {confirmModal.isDangerous ? '⚠️' : '❓'}
                  </div>
                )}
              </div>
              
              <h3 className={`text-xl font-bold text-center mb-4 ${colors.title}`}>
                {confirmModal.title}
              </h3>
              
              <p className={`text-center mb-6 ${colors.message}`}>
                {confirmModal.message}
              </p>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={confirmModal.onCancel}
                  className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${colors.cancelButton}`}
                >
                  {confirmModal.cancelText}
                </button>
                <button
                  onClick={() => {
                    confirmModal.onConfirm();
                    closeConfirmModal();
                  }}
                  className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${colors.confirmButton}`}
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

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Yeni Ürün Ekle</h1>
            <p className="text-gray-600 mt-2">Mağazanıza yeni ürün ekleyin</p>
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
                  value={formData.name}
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
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
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

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ürün Görselleri
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
                    <span className="text-blue-700 text-sm">Görseller yükleniyor...</span>
                  </div>
                </div>
              )}

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Yüklenen Görseller</h4>
                    <div className="flex items-center text-xs text-gray-500">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                      Sıralamak için sürükleyip bırakın
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {existingImages.map((imageUrl, index) => (
                      <div 
                        key={index} 
                        className={`relative group cursor-move transition-all duration-200 ${
                          draggedIndex === index ? 'opacity-50 scale-95' : ''
                        } ${
                          dragOverIndex === index ? 'ring-2 ring-blue-400 scale-105' : ''
                        }`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDragEnd={handleDragEnd}
                        onDrop={(e) => handleImageReorder(e, index)}
                      >
                        <img
                          src={imageUrl}
                          alt={`Görsel ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        
                        {/* Sıra numarası */}
                        <div className="absolute top-1 right-1 bg-gray-800 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                          {index + 1}
                        </div>
                        
                        {/* Ana görsel işareti */}
                        {formData.image_url === imageUrl && (
                          <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                            Ana Görsel
                          </div>
                        )}
                        
                        {/* Drag handle */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-6 h-6 text-white drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                        </div>
                        
                        {/* Silme durumu */}
                        {deletingImages.includes(imageUrl) && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                        
                        {/* Hover butonları */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100">
                          {formData.image_url !== imageUrl && (
                            <button
                              type="button"
                              onClick={() => setAsMainImage(imageUrl)}
                              className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
                              title="Ana görsel yap"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteExistingImage(imageUrl)}
                            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                            title="Görseli sil"
                            disabled={deletingImages.includes(imageUrl)}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Bilgilendirme metni */}
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-700 text-sm">
                      💡 <strong>İpucu:</strong> Görselleri sürükleyip bırakarak sıralayabilirsiniz. İlk görsel ana kapak görseli olarak kullanılır. Ürün sayfasında görseller bu sırayla görüntülenir.
                    </p>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {formData.image_url && !imageUploading && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 text-sm">✓ Ana görsel belirlendi</p>
                </div>
              )}
            </div>

            {/* Checkboxes */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_new"
                    checked={formData.is_new}
                    onChange={(e) => setFormData({ ...formData, is_new: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="is_new" className="ml-2 block text-sm text-gray-900">
                    Yeni Ürün
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="in_stock"
                    checked={formData.in_stock}
                    onChange={(e) => setFormData({ ...formData, in_stock: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="in_stock" className="ml-2 block text-sm text-gray-900">
                    Stokta Var
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                    Aktif
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Link
                href="/admin/products"
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                İptal
              </Link>
              <button
                type="submit"
                disabled={loading || imageUploading}
                className={`px-6 py-2 rounded-md text-white font-medium transition-colors ${
                  loading || imageUploading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Ekleniyor...' : 'Ürün Ekle'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modals */}
      <Modal />
      <ConfirmModal />
    </div>
  );
} 