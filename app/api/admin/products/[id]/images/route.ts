import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    const supabase = getServerSupabaseClient();

    // Storage'dan bu ürüne ait görselleri getir
    const { data: files, error } = await supabase.storage
      .from('products')
      .list('', {
        limit: 100,
        offset: 0,
      });

    if (error) {
      console.error('Storage list error:', error);
      return NextResponse.json({
        success: false,
        error: 'Storage dosyaları listelenirken hata oluştu'
      }, { status: 500 });
    }

    // Bu ürüne ait dosyaları filtrele (product-{id}- ile başlayanlar)
    const productFiles = files?.filter(file => 
      file.name.startsWith(`product-${productId}-`)
    ) || [];

    // Public URL'leri oluştur
    const imageUrls = productFiles.map(file => {
      const { data } = supabase.storage
        .from('products')
        .getPublicUrl(file.name);
      return data.publicUrl;
    });

    return NextResponse.json({
      success: true,
      images: imageUrls,
      count: imageUrls.length
    });

  } catch (error) {
    console.error('Error fetching product images:', error);
    return NextResponse.json({
      success: false,
      error: 'Sunucu hatası oluştu'
    }, { status: 500 });
  }
} 