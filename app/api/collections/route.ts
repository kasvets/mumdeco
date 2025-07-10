import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/supabase-server';

const collections = [
  { id: 'model-6', name: 'Adriatic Serisi', description: 'Özel koleksiyon ve sınırlı üretim mumlar' },
  { id: 'model-5', name: 'Aegean Serisi', description: 'Yenilikçi form ve çağdaş stil mumlar' },
  { id: 'model-4', name: 'London Serisi', description: 'Premium kalite ve lüks tasarım mumlar' },
  { id: 'model-3', name: 'Petra Serisi', description: 'Sanatsal form ve zarif görünüm mumlar' },
  { id: 'model-2', name: 'Provence Serisi', description: 'Modern estetik ve şık tasarım mumlar' },
  { id: 'model-1', name: 'Toscana Serisi', description: 'Özel tasarım ve benzersiz form mumlar' },
];

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Collections API: Starting query...');
    
    const supabase = getServerSupabaseClient();
    
    // Fetch collections with random product images
    const collectionsWithImages = await Promise.all(
      collections.map(async (collection) => {
        try {
          // Get products for this collection
          const { data: products, error } = await supabase
            .from('products')
            .select('id, name, image_url')
            .eq('category', collection.id)
            .eq('in_stock', true)
            .limit(10);

          if (error) {
            console.error(`Error fetching products for ${collection.id}:`, error);
            return {
              ...collection,
              productCount: 0,
              image: null,
              link: `/products?category=${collection.id}`
            };
          }

          // Select random product image if available
          let randomImage = null;
          if (products && products.length > 0) {
            const randomIndex = Math.floor(Math.random() * products.length);
            randomImage = products[randomIndex].image_url;
          }

          return {
            ...collection,
            productCount: products?.length || 0,
            image: randomImage,
            link: `/products?category=${collection.id}`
          };
        } catch (error) {
          console.error(`Exception for collection ${collection.id}:`, error);
          return {
            ...collection,
            productCount: 0,
            image: null,
            link: `/products?category=${collection.id}`
          };
        }
      })
    );

    console.log('🔍 Collections API: Query completed');
    console.log('🔍 Collections API: Collections with images:', collectionsWithImages.length);

    return NextResponse.json({
      status: 'success',
      message: 'Collections fetched successfully',
      collections: collectionsWithImages
    });
  } catch (error) {
    console.error('🔍 Collections API: Exception:', error);
    return NextResponse.json({
      status: 'error',
      error: (error as Error).message,
      type: 'exception'
    }, { status: 500 });
  }
} 