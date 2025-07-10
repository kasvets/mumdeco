import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    // Session çerezlerini al
    const accessToken = request.cookies.get('sb-access-token')?.value;
    const refreshToken = request.cookies.get('sb-refresh-token')?.value;

    console.log('🔍 ADMIN VERIFY: Checking admin status');
    
    if (!accessToken || !refreshToken) {
      console.log('❌ ADMIN VERIFY: No session cookies found');
      return NextResponse.json({
        isAdmin: false,
        error: 'No session found'
      }, { status: 401 });
    }

    const supabase = createServerSupabaseClient();

    // Session'ı kurup kontrol et
    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });

    if (sessionError) {
      console.log('❌ ADMIN VERIFY: Session error:', sessionError.message);
      return NextResponse.json({
        isAdmin: false,
        error: 'Invalid session'
      }, { status: 401 });
    }

    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user) {
      console.log('❌ ADMIN VERIFY: No valid session');
      return NextResponse.json({
        isAdmin: false,
        error: 'No valid session'
      }, { status: 401 });
    }

    // Session süresi kontrolü
    if (session.expires_at && new Date(session.expires_at * 1000) <= new Date()) {
      console.log('❌ ADMIN VERIFY: Session expired');
      return NextResponse.json({
        isAdmin: false,
        error: 'Session expired'
      }, { status: 401 });
    }

    // Session user bilgilerini kontrol et
    if (!session.user.id || !session.user.email) {
      console.log('❌ ADMIN VERIFY: Invalid session user data');
      return NextResponse.json({
        isAdmin: false,
        error: 'Invalid user data'
      }, { status: 401 });
    }

    // Admin yetkisi kontrolü
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('account_status, email')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile) {
      console.log('❌ ADMIN VERIFY: Profile not found:', profileError?.message);
      return NextResponse.json({
        isAdmin: false,
        error: 'Profile not found'
      }, { status: 401 });
    }

    const isAdmin = profile.account_status === 'admin';

    // Email kontrolü
    if (profile.email !== session.user.email) {
      console.log('❌ ADMIN VERIFY: Email mismatch');
      return NextResponse.json({
        isAdmin: false,
        error: 'Email mismatch'
      }, { status: 401 });
    }

    // Sadece whitelist'teki email'leri kabul et
    const ADMIN_EMAILS = ['mumdeco.admin@mumdeco.com'];
    if (!session.user.email || !ADMIN_EMAILS.includes(session.user.email)) {
      console.log('❌ ADMIN VERIFY: Email not in whitelist');
      return NextResponse.json({
        isAdmin: false,
        error: 'Email not authorized'
      }, { status: 403 });
    }

    console.log('✅ ADMIN VERIFY: Admin access verified for:', session.user.email);
    
    return NextResponse.json({
      isAdmin: isAdmin,
      user: {
        id: session.user.id,
        email: session.user.email,
        accountStatus: profile.account_status
      }
    });

  } catch (error) {
    console.error('❌ ADMIN VERIFY: Unexpected error:', error);
    return NextResponse.json({
      isAdmin: false,
      error: 'Server error'
    }, { status: 500 });
  }
} 