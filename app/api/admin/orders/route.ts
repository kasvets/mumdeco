import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const supabase = getServerSupabaseClient();

    // Base query
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_id,
          product_name,
          product_price,
          unit_price,
          quantity,
          total_price,
          products (
            image_url
          )
        )
      `)
      .order('created_at', { ascending: false });

    // Status filtresi
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Arama filtresi
    if (search) {
      query = query.or(`
        order_id.ilike.%${search}%,
        customer_name.ilike.%${search}%,
        customer_email.ilike.%${search}%,
        customer_phone.ilike.%${search}%
      `);
    }

    // Sayfalama
    query = query.range(offset, offset + limit - 1);

    const { data: orders, error } = await query;

    if (error) {
      console.error('Orders query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Toplam sayıyı al
    let countQuery = supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (status && status !== 'all') {
      countQuery = countQuery.eq('status', status);
    }

    if (search) {
      countQuery = countQuery.or(`
        order_id.ilike.%${search}%,
        customer_name.ilike.%${search}%,
        customer_email.ilike.%${search}%,
        customer_phone.ilike.%${search}%
      `);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('Count query error:', countError);
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Admin orders API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 