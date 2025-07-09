import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Product Detail API: Starting query for ID:', params.id);
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', params.id)
      // .eq('active', true) // Temporarily disabled until migration
      .single();

    console.log('🔍 Product Detail API: Query completed');
    console.log('🔍 Product Detail API: Error:', error);
    console.log('🔍 Product Detail API: Data:', data);

    if (error) {
      return NextResponse.json({
        status: 'error',
        error: error.message,
        details: error
      }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({
        status: 'error',
        error: 'Product not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      status: 'success',
      message: 'Product fetched successfully',
      product: data
    });
  } catch (error) {
    console.error('🔍 Product Detail API: Exception:', error);
    return NextResponse.json({
      status: 'error',
      error: (error as Error).message,
      type: 'exception'
    }, { status: 500 });
  }
} 