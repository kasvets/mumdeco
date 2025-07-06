import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { canUseSupabase, checkEnvironmentVariables } from '@/lib/env';

export async function GET() {
  try {
    // Environment kontrolleri
    const envCheck = checkEnvironmentVariables();
    const canUse = canUseSupabase();
    
    console.log('🔍 Debug Supabase Connection:');
    console.log('Environment check:', envCheck);
    console.log('Can use Supabase:', canUse);
    
    // Supabase bağlantısını test et
    const { data, error } = await supabase
      .from('products')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Supabase connection error:', error);
      return NextResponse.json({
        status: 'error',
        message: 'Supabase bağlantı hatası',
        error: error.message,
        envCheck,
        canUse
      }, { status: 500 });
    }
    
    console.log('✅ Supabase connection successful');
    
    // Gerçek veri testi
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(3);
      
    if (productsError) {
      console.error('❌ Products fetch error:', productsError);
      return NextResponse.json({
        status: 'error',
        message: 'Ürünler getirilemedi',
        error: productsError.message,
        envCheck,
        canUse
      }, { status: 500 });
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'Supabase bağlantısı başarılı',
      productCount: products?.length || 0,
      sampleProducts: products?.map(p => ({ id: p.id, name: p.name })) || [],
      envCheck,
      canUse
    });
    
  } catch (error: any) {
    console.error('❌ Debug endpoint error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Debug testi başarısız',
      error: error.message
    }, { status: 500 });
  }
} 