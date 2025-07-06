import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('🔍 Debug Products: Starting query...');
    
    // Test the exact same query as in products.ts
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    console.log('🔍 Debug Products: Query completed');
    console.log('🔍 Debug Products: Error:', error);
    console.log('🔍 Debug Products: Data length:', data?.length);

    if (error) {
      return NextResponse.json({
        status: 'error',
        error: error.message,
        details: error
      }, { status: 500 });
    }

    return NextResponse.json({
      status: 'success',
      message: 'Products fetched successfully',
      productCount: data?.length || 0,
      products: data?.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        in_stock: p.in_stock,
        created_at: p.created_at
      })) || []
    });
  } catch (error) {
    console.error('🔍 Debug Products: Exception:', error);
    return NextResponse.json({
      status: 'error',
      error: (error as Error).message,
      type: 'exception'
    }, { status: 500 });
  }
} 