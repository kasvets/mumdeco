import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('🔍 RLS Test: Starting...');
    
    // 1. Mevcut politikaları kontrol et
    const { data: policies, error: policiesError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT 
            tablename,
            policyname,
            permissive,
            roles,
            cmd,
            qual,
            with_check 
          FROM pg_policies 
          WHERE tablename IN ('products', 'categories')
          ORDER BY tablename, policyname;
        `
      });

    console.log('🔍 RLS Test: Current policies:', policies);

    // 2. Products tablosunu test et
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('id, name, price')
      .limit(3);

    console.log('🔍 RLS Test: Products query result:', { 
      data: productsData?.length, 
      error: productsError 
    });

    // 3. Auth durumu kontrol et
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    console.log('🔍 RLS Test: Auth session:', { 
      user: !!session?.user, 
      error: authError 
    });

    return NextResponse.json({
      status: 'success',
      message: 'RLS test completed',
      results: {
        policies: policies || [],
        products: {
          count: productsData?.length || 0,
          data: productsData || [],
          error: productsError?.message || null
        },
        auth: {
          hasSession: !!session,
          user: session?.user?.email || null,
          error: authError?.message || null
        }
      }
    });

  } catch (error) {
    console.error('🔍 RLS Test: Exception:', error);
    return NextResponse.json({
      status: 'error',
      error: (error as Error).message,
      type: 'exception'
    }, { status: 500 });
  }
} 