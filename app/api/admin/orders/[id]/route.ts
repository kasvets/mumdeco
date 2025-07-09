import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const supabase = getServerSupabaseClient();

    // Siparişi getir
    const { data: order, error } = await supabase
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
        ),
        paytr_payments (
          id,
          merchant_oid,
          status,
          callback_data,
          created_at,
          updated_at
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Order query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });

  } catch (error) {
    console.error('Admin order [id] GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = getServerSupabaseClient();

    // Güncellenebilir alanlar
    const allowedFields = [
      'status',
      'payment_status',
      'customer_name',
      'customer_email',
      'customer_phone',
      'customer_address',
      'billing_address',
      'billing_city',
      'billing_district',
      'billing_zip_code',
      'shipping_address',
      'shipping_city',
      'shipping_district',
      'shipping_zip_code',
      'shipping_company',
      'tracking_number',
      'shipping_date'
    ];

    const updateData: any = {};
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    // Siparişi güncelle
    const { data: updatedOrder, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
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
      .single();

    if (error) {
      console.error('Order update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ order: updatedOrder });

  } catch (error) {
    console.error('Admin order [id] PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const supabase = getServerSupabaseClient();

    // Önce siparişin var olup olmadığını kontrol et
    const { data: existingOrder, error: checkError } = await supabase
      .from('orders')
      .select('id, order_id, status')
      .eq('id', id)
      .single();

    if (checkError || !existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Siparişi sil (CASCADE ile order_items ve paytr_payments da silinir)
    const { error: deleteError } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Order delete error:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Order deleted successfully',
      deletedOrderId: id,
      orderNumber: existingOrder.order_id
    });

  } catch (error) {
    console.error('Admin order [id] DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}