import { Suspense } from 'react';
import ProductsContent from './components/ProductsContent';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ürünler - MumDeco',
  description: 'Doğal ve afrodizyak etkili mum koleksiyonumuzu keşfedin',
};

export default function ProductsPage() {
  return (
    <main className="min-h-screen mt-[140px] sm:mt-[160px] md:mt-[180px] lg:mt-[200px] bg-gray-50">
      <div className="max-w-[98%] 2xl:max-w-[96rem] mx-auto px-2 sm:px-4 py-4 sm:py-6">
        {/* Page Header - Modern & Concise */}
        <div className="mb-6 sm:mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-primary/10 to-primary/5 text-primary rounded-full text-xs sm:text-sm font-medium mb-3">
            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
            Premium Koleksiyon
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-gray-900 mb-3">
            Mum Ürünleri
          </h1>
          <p className="text-gray-600 max-w-lg mx-auto px-4 sm:px-0 text-sm sm:text-base">
            Özel aromalar ve doğal içeriklerle hazırlanmış premium mum koleksiyonu
          </p>
        </div>

        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        }>
          <ProductsContent key="products-content-stable" />
        </Suspense>
      </div>
    </main>
  );
} 