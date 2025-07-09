import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { 
  PAYTR_CONFIG, 
  PayTRCallbackResponse, 
  verifyPayTRCallback, 
  logPayTRTransaction 
} from '@/lib/paytr';

// PayTR Callback Handler
export async function POST(request: NextRequest) {
  try {
    // PayTR callback data'sını al
    const body = await request.formData();
    
    const callbackData: PayTRCallbackResponse = {
      merchant_oid: body.get('merchant_oid') as string,
      status: body.get('status') as string,
      total_amount: parseFloat(body.get('total_amount') as string),
      hash: body.get('hash') as string,
      failed_reason_code: body.get('failed_reason_code') as string,
      failed_reason_msg: body.get('failed_reason_msg') as string,
      test_mode: parseInt(body.get('test_mode') as string || '0'),
      payment_type: body.get('payment_type') as string,
      currency: body.get('currency') as string,
      payment_amount: parseFloat(body.get('payment_amount') as string || '0')
    };

    logPayTRTransaction('CALLBACK', callbackData, 'PayTR Callback Received');

    // Hash doğrulaması
    const isValidHash = verifyPayTRCallback(
      callbackData.merchant_oid,
      PAYTR_CONFIG.MERCHANT_SALT,
      callbackData.status,
      callbackData.total_amount,
      callbackData.hash
    );

    if (!isValidHash) {
      logPayTRTransaction('ERROR', { 
        error: 'Invalid hash',
        received: callbackData.hash,
        merchant_oid: callbackData.merchant_oid
      }, 'Hash Verification Failed');
      
      return NextResponse.json({ error: 'Invalid hash' }, { status: 400 });
    }

    // Supabase client
    const supabase = createServerComponentClient({ cookies });

    // Siparişi merchant_oid ile bul
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', callbackData.merchant_oid)
      .single();

    if (orderError || !order) {
      logPayTRTransaction('ERROR', { 
        error: 'Order not found',
        merchant_oid: callbackData.merchant_oid,
        orderError
      }, 'Order Lookup Failed');
      
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Sipariş durumunu güncelle
    const paymentStatus = callbackData.status === 'success' ? 'completed' : 'failed';
    const orderStatus = callbackData.status === 'success' ? 'completed' : 'failed';

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: paymentStatus,
        status: orderStatus,
        paid_amount: callbackData.status === 'success' ? callbackData.total_amount : 0,
        payment_completed_at: callbackData.status === 'success' ? new Date().toISOString() : null,
        failure_reason: callbackData.status === 'failed' ? callbackData.failed_reason_msg : null
      })
      .eq('id', order.id);

    if (updateError) {
      logPayTRTransaction('ERROR', { 
        error: 'Order update failed',
        updateError,
        order_id: order.id
      }, 'Order Update Failed');
      
      return NextResponse.json({ error: 'Order update failed' }, { status: 500 });
    }

    // PayTR payment kaydını güncelle
    const { error: paymentUpdateError } = await supabase
      .from('paytr_payments')
      .update({
        status: callbackData.status,
        callback_data: JSON.stringify(callbackData),
        failed_reason_code: callbackData.failed_reason_code,
        failed_reason_msg: callbackData.failed_reason_msg,
        updated_at: new Date().toISOString()
      })
      .eq('merchant_oid', callbackData.merchant_oid);

    if (paymentUpdateError) {
      logPayTRTransaction('ERROR', { 
        error: 'Payment update failed',
        paymentUpdateError,
        merchant_oid: callbackData.merchant_oid
      }, 'Payment Update Failed');
    }

    logPayTRTransaction('CALLBACK', { 
      merchant_oid: callbackData.merchant_oid,
      status: callbackData.status,
      order_id: order.id,
      payment_status: paymentStatus,
      order_status: orderStatus
    }, 'Callback Processed Successfully');

    // PayTR'ye OK response gönder
    return new NextResponse('OK', { status: 200 });

  } catch (error) {
    console.error('PayTR Callback Error:', error);
    logPayTRTransaction('ERROR', error, 'Callback Processing Error');
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET isteğini reddet
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
} 