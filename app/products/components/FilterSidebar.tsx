'use client';

import { useState } from 'react';
import { X, Filter, ChevronDown, ChevronUp } from 'lucide-react';

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
}

const categories = [
  { id: 'all', label: 'Tümü' },
  { id: 'model-1', label: 'Model-1 Serisi' },
  { id: 'model-2', label: 'Model-2 Serisi' },
  { id: 'model-3', label: 'Model-3 Serisi' },
  { id: 'model-4', label: 'Model-4 Serisi' },
  { id: 'model-5', label: 'Model-5 Serisi' },
  { id: 'model-6', label: 'Model-6 Serisi' },
  { id: 'model-7', label: 'Model-7 Serisi' },
  { id: 'model-8', label: 'Model-8 Serisi' },
  { id: 'model-9', label: 'Model-9 Serisi' },
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
  productsCount 
}: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: false,
    sort: false,
    other: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
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

  return (
    <div className="w-full lg:w-72 xl:w-80 lg:sticky lg:top-4 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto h-full bg-white p-4 border-r border-gray-200 lg:border-r-0 lg:bg-white lg:rounded-xl lg:shadow-sm lg:border lg:border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <Filter className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Filtreler</h2>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Results Count */}
      <div className="mb-6 p-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-primary">{productsCount}</span> ürün bulundu
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        {/* Category Filter */}
        <div className="bg-gray-50/50 rounded-lg p-3 border border-gray-100">
          <button
            onClick={() => toggleSection('category')}
            className="flex items-center justify-between w-full mb-2 p-2 hover:bg-white rounded-lg transition-colors"
          >
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              Kategori
            </h3>
            <div className={`p-1 rounded-full transition-transform duration-200 ${
              expandedSections.category ? 'rotate-180' : ''
            }`}>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
          </button>
          
          {expandedSections.category && (
            <div className="space-y-1 animate-in slide-in-from-top-1 duration-200">
              {categories.map(category => (
                <label 
                  key={category.id} 
                  className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-white transition-all duration-200 group"
                >
                  <input
                    type="radio"
                    name="category"
                    value={category.id}
                    checked={filters.category === category.id || (category.id === 'all' && !filters.category)}
                    onChange={(e) => updateFilters({ 
                      category: e.target.value === 'all' ? '' : e.target.value 
                    })}
                    className="mr-2 w-3.5 h-3.5 text-primary focus:ring-primary focus:ring-2 transition-all"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium transition-colors">
                    {category.label}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Price Range Filter */}
        <div className="bg-gray-50/50 rounded-lg p-3 border border-gray-100">
          <button
            onClick={() => toggleSection('price')}
            className="flex items-center justify-between w-full mb-2 p-2 hover:bg-white rounded-lg transition-colors"
          >
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              Fiyat Aralığı
            </h3>
            <div className={`p-1 rounded-full transition-transform duration-200 ${
              expandedSections.price ? 'rotate-180' : ''
            }`}>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
          </button>
          
          {expandedSections.price && (
            <div className="space-y-3 animate-in slide-in-from-top-1 duration-200">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    value={filters.priceRange[0]}
                    onChange={(e) => updateFilters({ 
                      priceRange: [Number(e.target.value), filters.priceRange[1]] 
                    })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white text-sm"
                    placeholder="Min"
                  />
                </div>
                <div className="w-2 h-0.5 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <input
                    type="number"
                    value={filters.priceRange[1]}
                    onChange={(e) => updateFilters({ 
                      priceRange: [filters.priceRange[0], Number(e.target.value)] 
                    })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white text-sm"
                    placeholder="Max"
                  />
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg font-medium text-sm">
                  ₺{filters.priceRange[0]} - ₺{filters.priceRange[1]}
                </div>
              </div>
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
            <div className="animate-in slide-in-from-top-1 duration-200">
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilters({ sortBy: e.target.value as ProductFilters['sortBy'] })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white font-medium text-sm"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
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
                  className="mr-2 w-3.5 h-3.5 text-primary focus:ring-primary focus:ring-2 transition-all"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium transition-colors">
                  Sadece Stokta Olanlar
                </span>
              </label>
              
              <label className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-white transition-all duration-200 group">
                <input
                  type="checkbox"
                  checked={filters.onSale}
                  onChange={(e) => updateFilters({ onSale: e.target.checked })}
                  className="mr-2 w-3.5 h-3.5 text-primary focus:ring-primary focus:ring-2 transition-all"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium transition-colors">
                  İndirimli Ürünler
                </span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Clear Filters Button */}
      <button
        onClick={clearFilters}
        className="w-full mt-6 px-4 py-2.5 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-700 rounded-lg hover:from-red-100 hover:to-red-200 hover:border-red-300 transition-all duration-200 font-medium flex items-center justify-center gap-2 group text-sm"
      >
        <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
        Filtreleri Temizle
      </button>
    </div>
  );
} 