import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { 
  getPayTRToken, 
  getPayTRIFrameUrl, 
  generateOrderId, 
  getClientIP, 
  validatePayTRConfig,
  logPayTRTransaction,
  PayTRBasketItem,
  PAYTR_CONFIG
} from '@/lib/paytr';

interface CreatePaymentRequest {
  items: {
    product_id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  customer: {
    email: string;
    name: string;
    phone: string;
    address: string;
  };
  billing?: {
    address: string;
    city: string;
    district: string;
    zip_code: string;
  };
  shipping?: {
    address: string;
    city: string;
    district: string;
    zip_code: string;
  };
  return_urls?: {
    success: string;
    failure: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    // PayTR konfigürasyon kontrolü
    const configValidation = validatePayTRConfig();
    if (!configValidation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'PayTR configuration error',
          details: configValidation.errors 
        },
        { status: 500 }
      );
    }

    // Kullanıcı kontrolü (isteğe bağlı - misafir kullanıcılar da sipariş verebilir)
    const { data: { user } } = await supabase.auth.getUser();

    // İstek verisini parse et
    const body: CreatePaymentRequest = await request.json();
    
    // Veri doğrulama
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Items are required' },
        { status: 400 }
      );
    }

    if (!body.customer || !body.customer.email || !body.customer.name || !body.customer.phone) {
      return NextResponse.json(
        { success: false, error: 'Customer information is required' },
        { status: 400 }
      );
    }

    // Sipariş ID oluştur
    const orderId = generateOrderId();
    
    // Toplam tutar hesapla
    const totalAmount = body.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    // Client IP al
    const clientIP = getClientIP(request);
    
    // PayTR sepet formatı oluştur
    const basketItems: PayTRBasketItem[] = body.items.map(item => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity
    }));

    // Base URL
    const baseUrl = request.nextUrl.origin;
    
    // Return URL'leri (Ngrok test domain)
    const returnUrls = {
      success: body.return_urls?.success || `https://13b4b402f72b.ngrok.app/payment/success`,
      failure: body.return_urls?.failure || `https://13b4b402f72b.ngrok.app/payment/failure`
    };

    // Veritabanına sipariş kaydet
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_id: orderId,
        user_id: user?.id || null,
        total_amount: totalAmount,
        currency: 'TRY',
        customer_email: body.customer.email,
        customer_name: body.customer.name,
        customer_phone: body.customer.phone,
        customer_address: body.customer.address,
        customer_ip: clientIP,
        payment_method: 'paytr',
        payment_status: 'waiting',
        status: 'pending',
        billing_address: body.billing?.address,
        billing_city: body.billing?.city,
        billing_district: body.billing?.district,
        billing_zip_code: body.billing?.zip_code,
        shipping_address: body.shipping?.address,
        shipping_city: body.shipping?.city,
        shipping_district: body.shipping?.district,
        shipping_zip_code: body.shipping?.zip_code,
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      return NextResponse.json(
        { success: false, error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Sipariş ürünlerini kaydet
    const orderItems = body.items.map(item => ({
      order_id: orderData.id,
      product_id: item.product_id,
      product_name: item.name,
      product_price: item.price,
      quantity: item.quantity,
      total_price: item.price * item.quantity
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Order items creation error:', itemsError);
      // Sipariş oluşturuldu ama ürünler eklenemedi, siparişi sil
      await supabase.from('orders').delete().eq('id', orderData.id);
      return NextResponse.json(
        { success: false, error: 'Failed to create order items' },
        { status: 500 }
      );
    }

    // PayTR ödeme isteği hazırla
    const paymentRequest = {
      merchant_id: PAYTR_CONFIG.MERCHANT_ID,
      merchant_key: PAYTR_CONFIG.MERCHANT_KEY,
      merchant_salt: PAYTR_CONFIG.MERCHANT_SALT,
      merchant_oid: orderId,
      email: body.customer.email,
      payment_amount: totalAmount,
      user_basket: basketItems,
      user_name: body.customer.name,
      user_address: body.customer.address,
      user_phone: body.customer.phone,
      user_ip: clientIP,
      merchant_ok_url: returnUrls.success,
      merchant_fail_url: returnUrls.failure,
      currency: 'TL',
      test_mode: PAYTR_CONFIG.TEST_MODE,
      debug_on: PAYTR_CONFIG.DEBUG_MODE,
      no_installment: 0,
      max_installment: 0,
      lang: 'tr',
      timeout_limit: 30
    };

    logPayTRTransaction('REQUEST', paymentRequest, 'Create Payment');

    // PayTR token al
    const tokenResponse = await getPayTRToken(paymentRequest);
    
    if (tokenResponse.status !== 'success' || !tokenResponse.token) {
      logPayTRTransaction('ERROR', tokenResponse, 'Token Request Failed');
      
      // Sipariş durumunu güncelle
      await supabase
        .from('orders')
        .update({ 
          status: 'failed',
          payment_status: 'failed'
        })
        .eq('id', orderData.id);

      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to create payment token',
          details: tokenResponse.reason 
        },
        { status: 500 }
      );
    }

    // PayTR ödeme kaydı oluştur
    const { error: paymentError } = await supabase
      .from('paytr_payments')
      .insert({
        order_id: orderData.id,
        merchant_oid: orderId,
        paytr_token: tokenResponse.token,
        payment_amount: totalAmount,
        user_basket: JSON.stringify(basketItems),
        status: 'pending'
      });

    if (paymentError) {
      console.error('Payment record creation error:', paymentError);
      return NextResponse.json(
        { success: false, error: 'Failed to create payment record' },
        { status: 500 }
      );
    }

    // iFrame URL oluştur
    const iframeUrl = getPayTRIFrameUrl(tokenResponse.token);

    logPayTRTransaction('RESPONSE', { 
      token: tokenResponse.token,
      iframeUrl,
      orderId 
    }, 'Payment Created Successfully');

    return NextResponse.json({
      success: true,
      data: {
        orderId,
        token: tokenResponse.token,
        iframeUrl,
        amount: totalAmount,
        currency: 'TRY'
      }
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    logPayTRTransaction('ERROR', error, 'Payment Creation Failed');
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint - Sipariş durumu sorgulama
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Kullanıcı kontrolü (isteğe bağlı)
    const { data: { user } } = await supabase.auth.getUser();

    // Sipariş ve ödeme bilgilerini getir
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (*),
        paytr_payments (*)
      `)
      .eq('order_id', orderId);

    // Eğer kullanıcı giriş yapmışsa, sadece o kullanıcının siparişlerini getir
    if (user) {
      query = query.eq('user_id', user.id);
    }

    const { data: orderData, error: orderError } = await query.single();

    if (orderError || !orderData) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        order: orderData,
        items: orderData.order_items,
        payments: orderData.paytr_payments
      }
    });

  } catch (error) {
    console.error('Order query error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 