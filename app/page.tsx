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

const collections = [
  {
    id: 1,
    name: "Model-1 Serisi",
    description: "Özel tasarım ve benzersiz form mumlar",
    image: "/Model1/Adriatic/m1a1.webp",
    link: "/collections/model-1"
  },
  {
    id: 2,
    name: "Model-2 Serisi",
    description: "Modern estetik ve şık tasarım mumlar",
    image: "/Model1/Adriatic/m1a2.webp",
    link: "/collections/model-2"
  },
  {
    id: 3,
    name: "Model-3 Serisi",
    description: "Sanatsal form ve zarif görünüm mumlar",
    image: "/Model1/Adriatic/m1a3.webp",
    link: "/collections/model-3"
  },
  {
    id: 4,
    name: "Model-4 Serisi",
    description: "Premium kalite ve lüks tasarım mumlar",
    image: "/Model1/Adriatic/m1a4.webp",
    link: "/collections/model-4"
  },
  {
    id: 5,
    name: "Model-5 Serisi",
    description: "Yenilikçi form ve çağdaş stil mumlar",
    image: "/Model1/Adriatic/m1a5.webp",
    link: "/collections/model-5"
  },
  {
    id: 6,
    name: "Model-6 Serisi",
    description: "Özel koleksiyon ve sınırlı üretim mumlar",
    image: "/Model1/Adriatic/m1a1.webp",
    link: "/collections/model-6"
  }
];

export default function Home() {
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        console.log('🔍 Loading featured products...');
        const products = await fetchFeaturedProducts(10);
        console.log('🔍 Featured products loaded:', products);
        setBestSellers(products);
      } catch (error) {
        console.error('🔍 Error loading featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
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
    <main className="flex flex-col min-h-screen mt-[180px] md:mt-[200px]">
      {/* Hero Section */}
      <section className="relative h-[85vh] w-full">
        <HeroSlider />

        {/* Content */}
        <div className="max-w-[98%] 2xl:max-w-[96rem] mx-auto relative z-10 h-full flex items-center px-2">
          <div className="max-w-3xl mx-auto text-center space-y-3 md:space-y-4 lg:space-y-6 text-white">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-normal leading-tight">
              Yaşam Alanlarınızı Işıkla Donatın
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mx-auto">
              Doğal içeriklerle özenle üretilen afrodizyak etkili mumlarımızla romantik 
              anlarınıza tutku katın.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-3 md:pt-4 lg:pt-6">
              <Link 
                href="/products" 
                className="btn-primary min-w-[180px] text-center"
              >
                Ürünleri Keşfet
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="pt-16 pb-12 md:pt-20 md:pb-16">
        <div className="max-w-[98%] 2xl:max-w-[96rem] mx-auto px-2">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl md:text-4xl font-serif">Çok Satan Ürünler</h2>
            <Link 
              href="/products" 
              className="group inline-flex items-center gap-2 px-6 py-3 text-gray-700 hover:text-gray-900 border border-gray-300 hover:border-gray-400 rounded-full transition-all duration-300 hover:shadow-sm"
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
      <section className="pt-4 pb-16 md:pt-6 md:pb-20">
        <div className="max-w-[98%] 2xl:max-w-[96rem] mx-auto px-2">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif mb-4">Özel Koleksiyonlarımız</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Her anınızı özel kılmak için tasarlanmış, doğal içerikli mum koleksiyonlarımızı keşfedin
            </p>
          </div>

          <div className="relative pb-16">
            <CollectionSlider collections={collections} />
          </div>
        </div>
      </section>
    </main>
  );
}
