import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/supabase-server';

export async function DELETE(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({
        success: false,
        error: 'Image URL gereklidir'
      }, { status: 400 });
    }

    const supabase = getServerSupabaseClient();

    // URL'den dosya adını çıkar
    // URL formatı: https://.../storage/v1/object/public/products/filename
    const urlParts = imageUrl.split('/');
    const filename = urlParts[urlParts.length - 1];

    if (!filename) {
      return NextResponse.json({
        success: false,
        error: 'Geçersiz görsel URL\'si'
      }, { status: 400 });
    }

    // Storage'dan dosyayı sil
    const { error } = await supabase.storage
      .from('products')
      .remove([filename]);

    if (error) {
      console.error('Storage delete error:', error);
      return NextResponse.json({
        success: false,
        error: 'Görsel silinirken hata oluştu: ' + error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Görsel başarıyla silindi'
    });

  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json({
      success: false,
      error: 'Sunucu hatası oluştu'
    }, { status: 500 });
  }
} 