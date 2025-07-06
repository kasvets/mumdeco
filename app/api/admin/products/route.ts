import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/supabase-server';

// Create a new product
export async function POST(request: NextRequest) {
  try {
    const productData = await request.json();
    const supabase = getServerSupabaseClient();
    
    const { data: newProduct, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      return NextResponse.json({
        error: 'Ürün oluşturulurken hata oluştu'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      product: newProduct,
      message: 'Ürün başarıyla oluşturuldu'
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({
      error: 'Sunucu hatası oluştu'
    }, { status: 500 });
  }
}

// Get all products
export async function GET() {
  try {
    const supabase = getServerSupabaseClient();
    
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json({
        error: 'Ürünler yüklenirken hata oluştu'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      products: products || []
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({
      error: 'Sunucu hatası oluştu'
    }, { status: 500 });
  }
}

// Delete a product
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        error: 'Ürün ID gereklidir'
      }, { status: 400 });
    }

    const supabase = getServerSupabaseClient();
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      return NextResponse.json({
        error: 'Ürün silinirken hata oluştu'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Ürün başarıyla silindi'
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({
      error: 'Sunucu hatası oluştu'
    }, { status: 500 });
  }
}

// Update a product
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        error: 'Ürün ID gereklidir'
      }, { status: 400 });
    }

    const updates = await request.json();
    const supabase = getServerSupabaseClient();
    
    const { data: updatedProduct, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      return NextResponse.json({
        error: 'Ürün güncellenirken hata oluştu'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      message: 'Ürün başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({
      error: 'Sunucu hatası oluştu'
    }, { status: 500 });
  }
} 