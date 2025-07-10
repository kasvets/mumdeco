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