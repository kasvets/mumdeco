'use client';

import Image from "next/image";
import Link from "next/link";
import HeroSlider from "./components/HeroSlider";
import CollectionSlider from "./components/CollectionSlider";
import BestSellersSlider from "./components/BestSellersSlider";
import { Flower2, Heart, Sparkles, Leaf, Crown } from "lucide-react";
import { fetchFeaturedProducts } from "./products/data/products";
import { useState, useEffect } from "react";
import { Product } from "@/lib/supabase";

interface Collection {
  id: string;
  name: string;
  description: string;
  image: string | null;
  link: string;
  productCount: number;
}

export default function Home() {
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔍 Loading featured products and collections...');
        
        // Load featured products
        const products = await fetchFeaturedProducts(10);
        console.log('🔍 Featured products loaded:', products);
        setBestSellers(products);
        
        // Load collections
        const collectionsResponse = await fetch('/api/collections');
        const collectionsData = await collectionsResponse.json();
        console.log('🔍 Collections loaded:', collectionsData);
        
        if (collectionsData.status === 'success') {
          setCollections(collectionsData.collections);
        }
      } catch (error) {
        console.error('🔍 Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Ürünler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex flex-col min-h-screen mt-[140px] sm:mt-[160px] md:mt-[180px] lg:mt-[200px]">
      {/* Hero Section */}
      <section className="relative h-[70vh] sm:h-[80vh] md:h-[85vh] w-full">
        <HeroSlider />

        {/* Content */}
        <div className="max-w-[98%] 2xl:max-w-[96rem] mx-auto relative z-10 h-full flex items-center px-2 sm:px-4">
          <div className="max-w-3xl mx-auto text-center space-y-3 md:space-y-4 lg:space-y-6 text-white">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-serif font-normal leading-tight">
              Doğal El Yapımı Mumlar
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 leading-relaxed max-w-2xl mx-auto px-4 sm:px-0">
              Özel tasarım handmade mumlarla evinizi dönüştürün. Hemen sipariş verin, benzersiz anlar yaratın.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-3 md:pt-4 lg:pt-6">
              <Link 
                href="/products" 
                className="btn-primary min-w-[160px] sm:min-w-[180px] text-center"
              >
                Ürünleri Keşfet
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="pt-12 pb-8 sm:pt-16 sm:pb-12 md:pt-20 md:pb-16">
        <div className="max-w-[98%] 2xl:max-w-[96rem] mx-auto px-2 sm:px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-12 gap-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-center sm:text-left">Çok Satan Ürünler</h2>
            <Link 
              href="/products" 
              className="group inline-flex items-center justify-center sm:justify-start gap-2 px-4 sm:px-6 py-2 sm:py-3 text-gray-700 hover:text-gray-900 border border-gray-300 hover:border-gray-400 rounded-full transition-all duration-300 hover:shadow-sm text-sm sm:text-base"
            >
              <span>Tüm ürünleri gör</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={1.5} 
                stroke="currentColor" 
                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          <BestSellersSlider products={bestSellers} />
        </div>
      </section>

      {/* Collections Section */}
      <section className="pt-2 pb-12 sm:pt-4 sm:pb-16 md:pt-6 md:pb-20">
        <div className="max-w-[98%] 2xl:max-w-[96rem] mx-auto px-2 sm:px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif mb-4">Özel Koleksiyonlarımız</h2>
            <p className="text-gray-600 max-w-2xl mx-auto px-4 sm:px-0 text-sm sm:text-base">
              Her anınızı özel kılmak için tasarlanmış, doğal içerikli mum koleksiyonlarımızı keşfedin
            </p>
          </div>

          <div className="relative pb-12 sm:pb-16">
            <CollectionSlider collections={collections} />
          </div>
        </div>
      </section>
    </main>
  );
}
