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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    old_price: null,
    category: 'model-1',
    image_url: '',
    is_new: false,
    in_stock: true,
    rating: null as number | null,
    reviews: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Eğer görsel upload işlemi devam ediyorsa bekle
      if (imageUploading) {
        alert('Görsel yükleme işlemi devam ediyor, lütfen bekleyin...');
        setLoading(false);
        return;
      }

      // Gerekli alanları kontrol et
      if (!formData.name || !formData.category || !formData.price) {
        alert('Lütfen tüm gerekli alanları doldurun.');
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

      alert('Ürün başarıyla eklendi!');
      setSelectedFiles([]);
      setPreviewUrls([]);
      
      // Kısa bir gecikme ile redirect et
      setTimeout(() => {
        router.push('/admin/products');
      }, 1000);
      
    } catch (error) {
      console.error('Ürün eklenirken hata:', error);
      alert('Ürün eklenirken hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      alert('Lütfen sadece resim dosyalarını seçin!');
      return;
    }

    // Dosya boyut kontrolü (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024;
    const oversizedFiles = imageFiles.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      alert(`Şu dosyalar 5MB'dan büyük: ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }

    setImageUploading(true);
    setSelectedFiles(prev => [...prev, ...imageFiles]);
    
    // Preview URL'leri oluştur
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrls(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    try {
      // İlk dosyayı API üzerinden yükle ve ana görsel olarak ayarla
      if (imageFiles.length > 0) {
        const firstFile = imageFiles[0];
        const formData = new FormData();
        formData.append('file', firstFile);
        formData.append('productId', 'new'); // For new products

        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          const result = await response.json();
          if (result.url) {
            setFormData(prev => ({ ...prev, image_url: result.url }));
          }
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Upload failed');
        }
      }
    } catch (error: any) {
      console.error('Görsel yükleme hatası:', error);
      const errorMessage = error?.message || 'Bilinmeyen hata';
      
      if (errorMessage.includes('bucket') || errorMessage.includes('not found')) {
        // Storage bucket hatası için özel mesaj
        const bucketNotFoundAlert = `
🚨 Storage Bucket Bulunamadı!

ÇÖZÜM:
1. Supabase Dashboard'a gidin: https://supabase.com/dashboard
2. Sol menüden "Storage" sekmesine tıklayın
3. "New bucket" butonuna tıklayın
4. Bucket adını "products" yazın
5. "Public bucket" seçeneğini işaretleyin ✅
6. "Create bucket" butonuna tıklayın

Detaylı rehber için STORAGE_SETUP.md dosyasını inceleyin.
        `;
        alert(bucketNotFoundAlert);
      } else if (errorMessage.includes('permission') || errorMessage.includes('authorized')) {
        alert('Yetki hatası! Storage bucket\'ının public olduğundan emin olun ve RLS policy\'lerini kontrol edin.');
      } else {
        alert(`Görsel yükleme hatası: ${errorMessage}`);
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

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    
    // Eğer ilk dosyayı siliyorsak ve başka dosya varsa, yeni ilk dosyayı ana görsel yap
    if (index === 0 && selectedFiles.length > 1) {
      const fakeUrl = `/uploads/${selectedFiles[1].name}`;
      setFormData({ ...formData, image_url: fakeUrl });
    } else if (selectedFiles.length === 1) {
      setFormData({ ...formData, image_url: '' });
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
                    <span className="text-blue-700 text-sm">Görsel yükleniyor...</span>
                  </div>
                </div>
              )}

              {/* File Preview */}
              {previewUrls.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Seçilen Görseller</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        {index === 0 && (
                          <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                            Ana Görsel
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Success Message */}
              {formData.image_url && !imageUploading && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 text-sm">✓ Ana görsel başarıyla yüklendi</p>
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
                      Ekleniyor...
                    </div>
                  ) : (
                    'Ürün Ekle'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 