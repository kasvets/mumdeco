import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/supabase-server';

// Get single product by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({
        error: 'Ürün ID gereklidir'
      }, { status: 400 });
    }

    const supabase = getServerSupabaseClient();
    
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      return NextResponse.json({
        error: 'Ürün bulunamadı'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      product: product
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({
      error: 'Sunucu hatası oluştu'
    }, { status: 500 });
  }
}

// Update single product by ID
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
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

// Delete single product by ID
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
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