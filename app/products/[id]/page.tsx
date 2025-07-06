'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeftIcon, ChevronRightIcon, StarIcon, HeartIcon, ShoppingCartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import Image from 'next/image'
import { fetchProductById, fetchProductImages, Product } from '@/lib/supabase'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [productImages, setProductImages] = useState<string[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    const loadProduct = async () => {
      try {
        console.log('🏷️ Loading product with ID:', params.id);
        const productData = await fetchProductById(params.id as string)
        console.log('📦 Product data:', productData);
        setProduct(productData)
        
        if (productData) {
          console.log('🖼️ Starting to fetch images for product:', params.id);
          // Fetch images from storage
          const images = await fetchProductImages(params.id as string)
          console.log('📸 Images from storage:', images);
          
          // Combine storage images with database image_url (if exists)
          const allImages: string[] = []
          
          if (productData.image_url) {
            console.log('💾 Adding database image_url:', productData.image_url);
            allImages.push(productData.image_url)
          }
          
          // Add storage images that are different from main image_url
          images.forEach(img => {
            if (!allImages.includes(img)) {
              console.log('➕ Adding storage image:', img);
              allImages.push(img)
            } else {
              console.log('⏭️ Skipping duplicate image:', img);
            }
          })
          
          // If no images found, use fallback static images
          if (allImages.length === 0) {
            console.log('🎨 No images found, using fallback static images');
            allImages.push(
              `/Model1/Adriatic/m1a1.webp`,
              `/Model1/Adriatic/m1a2.webp`,
              `/Model1/Adriatic/m1a3.webp`,
              `/Model1/Adriatic/m1a4.webp`,
              `/Model1/Adriatic/m1a5.webp`
            )
          }
          
          console.log('🎯 Final combined images array:', allImages);
          setProductImages(allImages)
        }
      } catch (error) {
        console.error('❌ Error loading product:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      loadProduct()
    }
  }, [params.id])

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

  return (
    <div className="min-h-screen bg-gray-50 pt-[220px] md:pt-[240px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
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
            {product.category.replace('model-', 'Model-')}
          </button>
          <span>/</span>
          <span className="text-gray-900">
            {product.name.includes(' - ') ? product.name.split(' - ')[0] : product.name}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Side - Image Slider */}
          <div className="space-y-4">
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
          <div className="space-y-6">
            {/* Product Title and Rating */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating || 0)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {product.rating || 0} ({product.reviews || 0} değerlendirme)
                </span>
              </div>
              <div className="inline-flex items-center space-x-2">
                <span className="bg-amber-100 text-amber-800 text-sm px-3 py-1 rounded-full">
                  {product.category.replace('model-', 'Model-')}
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

                <div className="flex space-x-4">
                  <button className="flex-1 bg-amber-600 text-white py-3 px-6 rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center space-x-2">
                    <ShoppingCartIcon className="h-5 w-5" />
                    <span>Sepete Ekle</span>
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
                    {product.category.replace('model-', 'Model-')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Stok Durumu:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {product.in_stock ? 'Stokta Var' : 'Stokta Yok'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Değerlendirme:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {product.rating || 0}/5 ({product.reviews || 0} değerlendirme)
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
    </div>
  )
} 