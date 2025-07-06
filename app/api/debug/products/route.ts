import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug Products: Starting query...');
    
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isNew = searchParams.get('new') === 'true';
    const isFeatured = searchParams.get('featured') === 'true';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    console.log('🔍 Debug Products: Query params:', { category, isNew, isFeatured, limit });

    const supabase = getServerSupabaseClient();
    
    // Start building the query
    let query = supabase
      .from('products')
      .select('*');

    // Apply filters based on query parameters
    if (category) {
      query = query.eq('category', category);
    }

    if (isNew) {
      query = query.eq('is_new', true);
    }

    if (isFeatured || (!category && !isNew)) {
      // For featured or default requests, only show in-stock items
      query = query.eq('in_stock', true);
    }

    // Apply ordering
    query = query.order('created_at', { ascending: false });

    // Apply limit if specified
    if (limit && limit > 0) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

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
      queryParams: { category, isNew, isFeatured, limit },
      products: data?.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        old_price: p.old_price,
        category: p.category,
        image_url: p.image_url,
        is_new: p.is_new,
        in_stock: p.in_stock,
        rating: p.rating,
        reviews: p.reviews,
        created_at: p.created_at,
        updated_at: p.updated_at
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