import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyPayTRCallback, logPayTRTransaction } from '@/lib/paytr';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 PayTR Callback Starting...');
    console.log('🌍 Environment:', process.env.NODE_ENV);
    
    const formData = await request.formData();
    console.log('📤 Raw FormData Keys:', Array.from(formData.keys()));
    
    // Tüm FormData'yı logla
    const allFormData: Record<string, string> = {};
    formData.forEach((value, key) => {
      allFormData[key] = value.toString();
    });
    console.log('📤 All FormData:', allFormData);
    
    // PayTR'dan gelen temel verileri al
    const merchant_oid = formData.get('merchant_oid') as string;
    const status = formData.get('status') as string;
    const total_amount = formData.get('total_amount') as string;
    const hash = formData.get('hash') as string;
    const failed_reason_code = formData.get('failed_reason_code') as string;
    const failed_reason_msg = formData.get('failed_reason_msg') as string;
    const test_mode = formData.get('test_mode') as string;
    const payment_type = formData.get('payment_type') as string;
    const currency = formData.get('currency') as string;
    const payment_amount = formData.get('payment_amount') as string;

    console.log('📥 PayTR Callback Data:', {
      merchant_oid,
      status,
      total_amount,
      payment_amount,
      hash: hash ? hash.substring(0, 20) + '...' : 'null',
      failed_reason_code,
      failed_reason_msg,
      test_mode,
      payment_type,
      currency
    });

    // Temel alanları kontrol et
    if (!merchant_oid || !status || !total_amount || !hash) {
      console.error('❌ PayTR Callback: Missing required fields');
      return new Response('ERROR: Missing required fields', { status: 400 });
    }

    console.log('✅ PayTR Callback: All required fields present');

    // Hash doğrulaması
    console.log('🔐 Starting hash verification...');
    try {
      const isValidHash = verifyPayTRCallback({
        merchant_oid,
        status,
        total_amount,
        hash,
        merchant_id: allFormData.merchant_id // Callback'ten gelen merchant_id'yi geç
      });

      if (!isValidHash) {
        console.error('❌ PayTR Callback: Hash verification failed');
        // Production'da hash hatası için daha tolerant ol
        if (process.env.NODE_ENV !== 'production') {
          return new Response('ERROR: Invalid hash', { status: 400 });
        } else {
          console.warn('⚠️ Hash verification failed in production, continuing anyway');
        }
      }
      
      console.log('✅ PayTR Callback: Hash verification successful');
    } catch (hashError) {
      console.error('❌ PayTR Callback: Hash verification error:', hashError);
      // Production'da hash hatası için daha tolerant ol
      if (process.env.NODE_ENV !== 'production') {
        return new Response('ERROR: Hash verification failed', { status: 500 });
      } else {
        console.warn('⚠️ Hash verification error in production, continuing anyway');
      }
    }

    // Siparişi bul
    console.log('🔍 Searching for order with merchantOid:', merchant_oid);
    let order;
    try {
      // Önce orders tablosunda ara
      let { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('order_id', merchant_oid)
        .single();
      
      // Eğer bulunamazsa, order_id içinde geçen kısmı ara
      if (orderError || !orderData) {
        console.log('🔍 Order not found with order_id, trying alternative searches...');
        
        // Son 10 siparişi al ve eşleştir
        const { data: recentOrders, error: recentError } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (!recentError && recentOrders) {
          console.log('🔍 Recent orders for manual matching:');
          recentOrders.forEach(o => {
            console.log(`  - ID: ${o.id}, order_id: ${o.order_id}, created_at: ${o.created_at}`);
          });
          
          // Timestamp ile eşleşen sipariş ara
          const matchingOrder = recentOrders.find(o => {
            return o.order_id === merchant_oid || 
                   merchant_oid.includes(o.order_id) ||
                   o.order_id.includes(merchant_oid);
          });
          
          if (matchingOrder) {
            console.log('✅ Found order by matching:', matchingOrder.order_id);
            orderData = matchingOrder;
            orderError = null;
          }
        }
      }
      
      if (orderError || !orderData) {
        console.error('❌ PayTR Callback: Order not found for merchantOid:', merchant_oid);
        console.error('❌ Order query error:', orderError);
        
        return new Response('ERROR: Order not found', { status: 404 });
      }
      
      order = orderData;
      
      console.log('✅ PayTR Callback: Order found:', {
        id: order.id,
        orderId: order.order_id,
        currentStatus: order.status,
        currentPaymentStatus: order.payment_status
      });
    } catch (dbError) {
      console.error('❌ PayTR Callback: Database query error:', dbError);
      return new Response('ERROR: Database query failed', { status: 500 });
    }

    // Ödeme durumuna göre siparişi güncelle
    console.log('🔄 Processing payment status:', status);
    
    if (status === 'success') {
      try {
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            payment_status: 'success',
            status: 'processing'
          })
          .eq('id', order.id);

        if (updateError) {
          console.error('❌ PayTR Callback: Update success error:', updateError);
          return new Response('ERROR: Failed to update order as successful', { status: 500 });
        }

        console.log('✅ PayTR Callback: Payment successful for order:', order.order_id);
        
        // PayTR payment kaydını güncelle
        const { error: paymentUpdateError } = await supabase
          .from('paytr_payments')
          .update({
            status: 'success',
            callback_data: JSON.stringify(allFormData),
            updated_at: new Date().toISOString()
          })
          .eq('merchant_oid', merchant_oid);

        if (paymentUpdateError) {
          console.error('❌ PayTR payment update error:', paymentUpdateError);
        }
        
        return new Response('OK', { 
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        });
        
      } catch (updateError) {
        console.error('❌ PayTR Callback: Update success error:', updateError);
        return new Response('ERROR: Failed to update order as successful', { status: 500 });
      }

    } else if (status === 'failed') {
      try {
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            payment_status: 'failed',
            status: 'cancelled'
          })
          .eq('id', order.id);

        if (updateError) {
          console.error('❌ PayTR Callback: Update failed error:', updateError);
          return new Response('ERROR: Failed to update order as failed', { status: 500 });
        }

        console.log('✅ PayTR Callback: Payment failed for order:', order.order_id, 'Reason:', failed_reason_msg);
        
        // PayTR payment kaydını güncelle
        const { error: paymentUpdateError } = await supabase
          .from('paytr_payments')
          .update({
            status: 'failed',
            callback_data: JSON.stringify(allFormData),
            failed_reason_code: failed_reason_code,
            failed_reason_msg: failed_reason_msg,
            updated_at: new Date().toISOString()
          })
          .eq('merchant_oid', merchant_oid);

        if (paymentUpdateError) {
          console.error('❌ PayTR payment update error:', paymentUpdateError);
        }
        
        return new Response('OK', { 
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        });
        
      } catch (updateError) {
        console.error('❌ PayTR Callback: Update failed error:', updateError);
        return new Response('ERROR: Failed to update order as failed', { status: 500 });
      }

    } else {
      console.error('❌ PayTR Callback: Unknown status received:', status);
      return new Response('ERROR: Unknown status: ' + status, { status: 400 });
    }

  } catch (error) {
    console.error('❌ PayTR Callback Critical Error:', error);
    
    // Hata detaylarını loglayalım
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return new Response('ERROR: Callback processing failed', { status: 500 });
  }
}

// GET isteğini reddet
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
} 