import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const productId = formData.get('productId') as string;

    if (!file) {
      return NextResponse.json({
        error: 'Dosya gereklidir'
      }, { status: 400 });
    }

    // File validation
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({
        error: 'Sadece resim dosyaları kabul edilir'
      }, { status: 400 });
    }

    // Size validation (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({
        error: 'Dosya boyutu 5MB\'dan büyük olamaz'
      }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const fileExtension = file.name.split('.').pop();
    const fileName = `product-${productId || timestamp}-${timestamp}-${randomSuffix}.${fileExtension}`;

    console.log('API Upload - File:', fileName, 'Size:', file.size, 'bytes');

    const supabase = getServerSupabaseClient();

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to storage
    const { data, error } = await supabase.storage
      .from('products')
      .upload(fileName, buffer, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      });

    if (error) {
      console.error('Storage upload error:', error);
      return NextResponse.json({
        error: `Görsel yükleme hatası: ${error.message}`
      }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({
        error: 'Yükleme başarılı ama veri dönmedi'
      }, { status: 500 });
    }

    console.log('API Upload successful:', data);

    // Get public URL
    const { data: publicData } = supabase.storage
      .from('products')
      .getPublicUrl(fileName);

    if (!publicData?.publicUrl) {
      return NextResponse.json({
        error: 'Public URL alınamadı'
      }, { status: 500 });
    }

    console.log('API Upload - Public URL generated:', publicData.publicUrl);

    return NextResponse.json({
      success: true,
      url: publicData.publicUrl,
      fileName: fileName,
      message: 'Görsel başarıyla yüklendi'
    });

  } catch (error) {
    console.error('API Upload error:', error);
    return NextResponse.json({
      error: 'Sunucu hatası oluştu'
    }, { status: 500 });
  }
} 