'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeftIcon, ChevronRightIcon, HeartIcon, ShoppingCartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import Image from 'next/image'
import { Product } from '@/lib/supabase'
import { useCart } from '@/lib/cart-context'
import CartModal from '@/components/CartModal'

// Category mapping for display names
const categoryMap: { [key: string]: string } = {
  'model-1': 'Toscana',
  'model-2': 'Provence',
  'model-3': 'Petra',
  'model-4': 'London',
  'model-5': 'Aegean',
  'model-6': 'Adriatic',
};

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addToCart } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [productImages, setProductImages] = useState<string[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [showCartModal, setShowCartModal] = useState(false)
  const [addedProduct, setAddedProduct] = useState<Product | null>(null)
  const [addedQuantity, setAddedQuantity] = useState(1)

  // Storage'dan tüm görselleri yükle
  const loadProductImages = async (productId: number, mainImageUrl: string | null) => {
    try {
      console.log('🖼️ Loading all images for product:', productId);
      
      // Storage'dan bu ürüne ait tüm görselleri çek
      const response = await fetch(`/api/admin/products/${productId}/images`);
      const result = await response.json();
      
      const allImages: string[] = [];
      
      // Ana görseli ilk sıraya koy (varsa)
      if (mainImageUrl) {
        console.log('🎯 Adding main image first:', mainImageUrl);
        allImages.push(mainImageUrl);
      }
      
      // Storage'dan gelen diğer görselleri ekle (ana görsel değilse)
      if (result.success && result.images && result.images.length > 0) {
        console.log('📦 Adding storage images:', result.images.length);
        result.images.forEach((imageUrl: string) => {
          // Ana görseli tekrar eklememek için kontrol et
          if (imageUrl !== mainImageUrl && !allImages.includes(imageUrl)) {
            allImages.push(imageUrl);
          }
        });
      }
      
      // Hiç görsel yoksa fallback görseller kullan
      if (allImages.length === 0) {
        console.log('🎨 No images found, using fallback static images');
        allImages.push(
          `/Model1/Adriatic/m1a1.webp`,
          `/Model1/Adriatic/m1a2.webp`,
          `/Model1/Adriatic/m1a3.webp`,
          `/Model1/Adriatic/m1a4.webp`,
          `/Model1/Adriatic/m1a5.webp`
        );
      }
      
      console.log('🎯 Final images array:', allImages);
      setProductImages(allImages);
      
    } catch (error) {
      console.error('❌ Error loading product images:', error);
      // Hata durumunda fallback görseller
      setProductImages([
        `/Model1/Adriatic/m1a1.webp`,
        `/Model1/Adriatic/m1a2.webp`,
        `/Model1/Adriatic/m1a3.webp`,
        `/Model1/Adriatic/m1a4.webp`,
        `/Model1/Adriatic/m1a5.webp`
      ]);
    }
  };

  useEffect(() => {
    const loadProduct = async () => {
      try {
        console.log('🏷️ Loading product with ID:', params.id);
        
        // API route'dan ürün bilgisini çek
        const response = await fetch(`/api/products/${params.id}`);
        const result = await response.json();
        
        console.log('📦 API response:', { status: response.status, data: result });
        
        if (!response.ok) {
          console.error('❌ API Error:', result);
          return;
        }
        
        const productData = result.product;
        console.log('✅ Product data loaded:', productData);
        setProduct(productData);
        
        if (productData) {
          // Storage'dan bu ürüne ait tüm görselleri çek
          await loadProductImages(productData.id, productData.image_url);
        }
      } catch (error) {
        console.error('❌ Error loading product:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      loadProduct();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ürün Bulunamadı</h2>
          <button
            onClick={() => router.push('/products')}
            className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors"
          >
            Ürünlere Dön
          </button>
        </div>
      </div>
    )
  }

  const nextImage = () => {
    if (productImages.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % productImages.length)
    }
  }

  const prevImage = () => {
    if (productImages.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length)
    }
  }

  const goToImage = (index: number) => {
    setCurrentImageIndex(index)
  }

  const handleAddToCart = async () => {
    if (!product) return
    
    setAddingToCart(true)
    try {
      addToCart(product, quantity)
      
      // Show modal instead of alert
      setAddedProduct(product)
      setAddedQuantity(quantity)
      setShowCartModal(true)
      
      // Optional: Reset quantity to 1 after adding to cart
      setQuantity(1)
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Sepete eklenirken bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setAddingToCart(false)
    }
  }

  const handleOrderNow = async () => {
    if (!product) return
    
    // Add to cart first
    addToCart(product, quantity)
    
    // Navigate to cart page
    router.push('/cart')
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-[140px] sm:pt-[160px] md:pt-[180px] lg:pt-[200px] pb-20 sm:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4 sm:mb-6 md:mb-8">
          <button onClick={() => router.push('/')} className="hover:text-amber-600">
            Anasayfa
          </button>
          <span>/</span>
          <button onClick={() => router.push('/products')} className="hover:text-amber-600">
            Ürünler
          </button>
          <span>/</span>
          <button 
            onClick={() => router.push(`/products?category=${product.category}`)} 
            className="hover:text-amber-600"
          >
            {categoryMap[product.category] || product.category}
          </button>
          <span>/</span>
          <span className="text-gray-900">
            {product.name.includes(' - ') ? product.name.split(' - ')[0] : product.name}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* Left Side - Image Slider */}
          <div className="space-y-2 sm:space-y-4">
            {/* Main Image */}
            <div className="relative bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="aspect-square relative">
                {productImages.length > 0 ? (
                  <>
                    <Image
                      src={productImages[currentImageIndex]}
                      alt={product.name}
                      fill
                      className="object-cover"
                      priority
                    />
                    
                    {/* Navigation Arrows - only show if more than 1 image */}
                    {productImages.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all"
                        >
                          <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all"
                        >
                          <ChevronRightIcon className="h-6 w-6 text-gray-600" />
                        </button>

                        {/* Image Counter */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
                          {currentImageIndex + 1} / {productImages.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <div className="text-gray-500 text-center">
                      <div className="text-4xl mb-2">📷</div>
                      <div>Görsel yükleniyor...</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Images - only show if more than 1 image */}
            {productImages.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      currentImageIndex === index
                        ? 'border-amber-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Side - Product Details */}
          <div className="space-y-4 sm:space-y-6">
            {/* Product Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">{product.name}</h1>
              <div className="inline-flex items-center space-x-2">
                <span className="bg-amber-100 text-amber-800 text-sm px-3 py-1 rounded-full">
                  {categoryMap[product.category] || product.category}
                </span>
                {product.is_new && (
                  <span className="bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full">
                    Yeni
                  </span>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-gray-900">{product.price}₺</span>
              {product.old_price && (
                <span className="text-xl text-gray-500 line-through">{product.old_price}₺</span>
              )}
              {product.old_price && (
                <span className="bg-red-100 text-red-800 text-sm px-2 py-1 rounded-md">
                  %{Math.round((1 - product.price / product.old_price) * 100)} İndirim
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${product.in_stock ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={`text-sm ${product.in_stock ? 'text-green-600' : 'text-red-600'}`}>
                {product.in_stock ? 'Stokta Var' : 'Stokta Yok'}
              </span>
            </div>

            {/* Description */}
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Quantity and Add to Cart */}
            {product.in_stock && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">Adet:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 text-gray-900 font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Desktop Buttons */}
                <div className="hidden sm:flex space-x-4">
                  <button 
                    onClick={handleAddToCart}
                    disabled={!product.in_stock || addingToCart}
                    className="flex-1 bg-amber-600 text-white py-3 px-6 rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addingToCart ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Ekleniyor...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCartIcon className="h-5 w-5" />
                        <span>Sepete Ekle</span>
                      </>
                    )}
                  </button>
                  <button 
                    onClick={handleOrderNow}
                    disabled={!product.in_stock}
                    className="flex-1 bg-gray-900 text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119.007z" />
                    </svg>
                    <span>Sipariş Ver</span>
                  </button>
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {isWishlisted ? (
                      <HeartIconSolid className="h-6 w-6 text-red-500" />
                    ) : (
                      <HeartIcon className="h-6 w-6 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Product Features */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ürün Özellikleri</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Kategori:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {categoryMap[product.category] || product.category}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Stok Durumu:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {product.in_stock ? 'Stokta Var' : 'Stokta Yok'}
                  </span>
                </div>
                {product.is_new && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Durum:</span>
                    <span className="text-sm font-medium text-red-600">Yeni Ürün</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Buttons */}
      {product.in_stock && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 mobile-sticky-buttons">
          <div className="flex items-center gap-3">
            {/* Quantity Controls */}
            <div className="flex flex-col items-start min-w-0">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-white rounded-md transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="px-3 py-1 text-sm font-semibold text-gray-900 min-w-[2rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-white rounded-md transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">Adet</span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs font-semibold text-gray-900">
                  {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(product.price * quantity)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 flex-1">
              <button 
                onClick={handleAddToCart}
                disabled={!product.in_stock || addingToCart}
                className="flex-1 bg-amber-600 text-white py-3 px-4 rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
              >
                {addingToCart ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span className="text-sm font-medium">Ekleniyor...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCartIcon className="h-4 w-4" />
                    <span className="text-sm font-medium">Sepete Ekle</span>
                  </>
                )}
              </button>
              <button 
                onClick={handleOrderNow}
                disabled={!product.in_stock}
                className="flex-1 bg-gray-900 text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119.007z" />
                </svg>
                <span className="text-sm font-medium">Sipariş Ver</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      <CartModal
        isOpen={showCartModal}
        onClose={() => setShowCartModal(false)}
        product={addedProduct}
        quantity={addedQuantity}
      />
    </div>
  )
} 