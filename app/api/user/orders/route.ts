import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase-server';

// Simplified user authentication from header
async function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    console.log('❌ No Bearer token in Authorization header');
    return null;
  }

  const tokenOrUserId = authHeader.substring(7);
  console.log('🔑 Processing auth token/ID:', tokenOrUserId.substring(0, 20) + '...');
  
  try {
    const adminSupabase = createAdminSupabaseClient();
    
    // First try as JWT token
    try {
      const { data: { user }, error } = await adminSupabase.auth.getUser(tokenOrUserId);
      if (!error && user) {
        console.log('✅ User verified with JWT token:', user.email);
        return user;
      }
    } catch (tokenError) {
      console.log('🔑 JWT token failed, trying as user ID');
    }
    
    // Fallback: try as user ID (UUID format check)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (uuidRegex.test(tokenOrUserId)) {
      console.log('🔑 Trying as user ID:', tokenOrUserId);
      
      const { data: authUser, error: authError } = await adminSupabase.auth.admin.getUserById(tokenOrUserId);
      
      if (!authError && authUser.user) {
        console.log('✅ User verified with user ID:', authUser.user.email);
        return authUser.user;
      } else {
        console.error('❌ Admin getUserById failed:', authError);
      }
    }
    
    console.error('❌ User verification failed for:', tokenOrUserId);
    return null;
  } catch (error) {
    console.error('🔑 Token/ID verification error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get user from token
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('📦 Getting orders for user:', user.email);

    // Use admin client to fetch orders
    const adminSupabase = createAdminSupabaseClient();
    
    // Fetch orders for current user (both by user_id and email)
    // Only show orders with successful payment
    const { data: orders, error } = await adminSupabase
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
      .or(`user_id.eq.${user.id},customer_email.eq.${user.email}`)
      .eq('payment_status', 'success')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('User orders query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      orders: orders || []
    });

  } catch (error) {
    console.error('User orders API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 