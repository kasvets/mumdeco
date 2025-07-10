'use client';

import { useState, useEffect } from 'react';
import { X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  old_price?: number;
  image_url?: string;
  is_new?: boolean;
  in_stock?: boolean;
  rating?: number;
  reviews?: number;
}

interface ProductFilters {
  category: string;
  priceRange: [number, number];
  sortBy: 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest';
  inStock: boolean;
  onSale: boolean;
}

interface FilterSidebarProps {
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  onClose: () => void;
  productsCount: number;
  isVisible: boolean;
}

const categories = [
  { id: 'all', label: 'Tümü' },
  { id: 'model-6', label: 'Adriatic' },
  { id: 'model-5', label: 'Aegean' },
  { id: 'model-4', label: 'London' },
  { id: 'model-3', label: 'Petra' },
  { id: 'model-2', label: 'Provence' },
  { id: 'model-1', label: 'Toscana' },
];

const sortOptions = [
  { value: 'featured', label: 'Öne Çıkanlar' },
  { value: 'price-low', label: 'Fiyat: Düşükten Yükseğe' },
  { value: 'price-high', label: 'Fiyat: Yüksekten Düşüğe' },
  { value: 'rating', label: 'En Yüksek Puanlı' },
  { value: 'newest', label: 'En Yeni' },
];

export default function FilterSidebar({ 
  filters, 
  onFiltersChange, 
  onClose, 
  productsCount,
  isVisible 
}: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    sort: false,
    other: false,
  });

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch products for category display
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/debug/products');
        const result = await response.json();
        
        if (result.products) {
          setProducts(result.products);
        }
      } catch (error) {
        console.error('Error fetching products for filter:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProducts();
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    const isMobile = window.innerWidth < 1024;
    if (isMobile && isVisible) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isVisible]);

  // Group products by category
  const productsByCategory = products.reduce((acc: Record<string, Product[]>, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {});

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const updateFilters = (updates: Partial<ProductFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const clearFilters = () => {
    onFiltersChange({
      category: '',
      priceRange: [0, 1000],
      sortBy: 'featured',
      inStock: false,
      onSale: false,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleProductClick = (productId: number) => {
    router.push(`/products/${productId}`);
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Filter Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
        w-80 lg:w-72 xl:w-80 
        bg-white 
        transform transition-transform duration-300 ease-in-out
        lg:transform-none lg:transition-none
        lg:sticky lg:top-4 lg:max-h-[calc(100vh-6rem)] 
        overflow-y-auto lg:overflow-y-auto
        lg:rounded-xl lg:shadow-sm lg:border lg:border-gray-100
        shadow-2xl lg:shadow-sm
      `}>
        <div className="h-full p-4">
          {/* Mobile Header */}
          <div className="flex items-center justify-between mb-6 lg:mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Filter className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-lg lg:text-base font-semibold text-gray-900">Filtreler</h2>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Results Count */}
          <div className="mb-6 lg:mb-4 p-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-primary">{productsCount}</span> ürün bulundu
              </p>
            </div>
          </div>

          {/* Mobile Quick Actions */}
          <div className="lg:hidden mb-6 flex gap-2">
            <button
              onClick={clearFilters}
              className="flex-1 py-2 px-3 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Temizle
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2 px-3 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors"
            >
              Uygula
            </button>
          </div>

          {/* Filters */}
          <div className="space-y-4">
            {/* Category Filter with Products */}
            <div className="bg-gray-50/50 rounded-lg p-3 border border-gray-100">
              <button
                onClick={() => toggleSection('category')}
                className="flex items-center justify-between w-full mb-2 p-2 hover:bg-white rounded-lg transition-colors"
              >
                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Kategoriler
                </h3>
                <div className={`p-1 rounded-full transition-transform duration-200 ${
                  expandedSections.category ? 'rotate-180' : ''
                }`}>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </div>
              </button>
              
              {expandedSections.category && (
                <div className="space-y-2 animate-in slide-in-from-top-1 duration-200">
                  {/* All Products Option */}
                  <label className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-white transition-all duration-200 group">
                    <input
                      type="radio"
                      name="category"
                      value="all"
                      checked={!filters.category}
                      onChange={() => updateFilters({ category: '' })}
                      className="mr-3 w-4 h-4 text-primary focus:ring-primary focus:ring-2 transition-all"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium transition-colors">
                      Tüm Ürünler
                    </span>
                    <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {products.length}
                    </span>
                  </label>

                  {/* Categories */}
                  {categories.slice(1).map((category) => {
                    const categoryProducts = productsByCategory[category.id] || [];
                    return (
                      <div key={category.id} className="space-y-1">
                        <label className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-white transition-all duration-200 group">
                          <input
                            type="radio"
                            name="category"
                            value={category.id}
                            checked={filters.category === category.id}
                            onChange={() => updateFilters({ category: category.id })}
                            className="mr-3 w-4 h-4 text-primary focus:ring-primary focus:ring-2 transition-all"
                          />
                          <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium transition-colors">
                            {category.label}
                          </span>
                          <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {categoryProducts.length}
                          </span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>



            {/* Sort Options */}
            <div className="bg-gray-50/50 rounded-lg p-3 border border-gray-100">
              <button
                onClick={() => toggleSection('sort')}
                className="flex items-center justify-between w-full mb-2 p-2 hover:bg-white rounded-lg transition-colors"
              >
                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  Sıralama
                </h3>
                <div className={`p-1 rounded-full transition-transform duration-200 ${
                  expandedSections.sort ? 'rotate-180' : ''
                }`}>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </div>
              </button>
              
              {expandedSections.sort && (
                <div className="space-y-2 animate-in slide-in-from-top-1 duration-200">
                  {sortOptions.map((option) => (
                    <label key={option.value} className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-white transition-all duration-200 group">
                      <input
                        type="radio"
                        name="sort"
                        value={option.value}
                        checked={filters.sortBy === option.value}
                        onChange={() => updateFilters({ sortBy: option.value as any })}
                        className="mr-3 w-4 h-4 text-primary focus:ring-primary focus:ring-2 transition-all"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Other Filters */}
            <div className="bg-gray-50/50 rounded-lg p-3 border border-gray-100">
              <button
                onClick={() => toggleSection('other')}
                className="flex items-center justify-between w-full mb-2 p-2 hover:bg-white rounded-lg transition-colors"
              >
                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                  Diğer Filtreler
                </h3>
                <div className={`p-1 rounded-full transition-transform duration-200 ${
                  expandedSections.other ? 'rotate-180' : ''
                }`}>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </div>
              </button>
              
              {expandedSections.other && (
                <div className="space-y-2 animate-in slide-in-from-top-1 duration-200">
                  <label className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-white transition-all duration-200 group">
                    <input
                      type="checkbox"
                      checked={filters.inStock}
                      onChange={(e) => updateFilters({ inStock: e.target.checked })}
                      className="mr-3 w-4 h-4 text-primary focus:ring-primary focus:ring-2 rounded transition-all"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                      Sadece Stokta Olanlar
                    </span>
                  </label>
                  
                  <label className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-white transition-all duration-200 group">
                    <input
                      type="checkbox"
                      checked={filters.onSale}
                      onChange={(e) => updateFilters({ onSale: e.target.checked })}
                      className="mr-3 w-4 h-4 text-primary focus:ring-primary focus:ring-2 rounded transition-all"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                      İndirimli Ürünler
                    </span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Clear Filters Button */}
          <div className="hidden lg:block mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={clearFilters}
              className="w-full py-2 px-4 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Filtreleri Temizle
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 