import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Veri doğrulaması
    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-posta ve şifre gerekli.' },
        { status: 400 }
      );
    }

    // E-posta formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Geçerli bir e-posta adresi girin.' },
        { status: 400 }
      );
    }

    console.log('🔐 LOGIN: Attempting login for:', email);
    
    const supabase = createServerSupabaseClient();

    // Kullanıcı girişi
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('❌ LOGIN: Auth error:', authError);
      
      // Türkçe hata mesajları
      let errorMessage = 'Giriş sırasında bir hata oluştu.';
      
      if (authError.message.includes('Invalid login credentials')) {
        errorMessage = 'E-posta veya şifre hatalı.';
      } else if (authError.message.includes('Email not confirmed')) {
        errorMessage = 'E-posta adresinizi doğrulamanız gerekiyor.';
      } else if (authError.message.includes('too many requests')) {
        errorMessage = 'Çok fazla giriş denemesi. Lütfen daha sonra tekrar deneyin.';
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    console.log('✅ LOGIN: Auth successful for:', authData.user.email);
    console.log('🔑 LOGIN: Session created:', {
      hasSession: !!authData.session,
      hasAccessToken: !!authData.session?.access_token,
      hasRefreshToken: !!authData.session?.refresh_token
    });

    // Kullanıcı profil bilgilerini al
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('⚠️ LOGIN: Profile fetch error:', profileError);
      // Profil bulunamadığında hata vermek yerine temel bilgileri döndür
    } else {
      console.log('👤 LOGIN: Profile loaded:', {
        email: profileData.email,
        accountStatus: profileData.account_status,
        isAdmin: profileData.account_status === 'admin'
      });
    }

    // Last login tarihini güncelle
    await supabase
      .from('user_profiles')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', authData.user.id);

    // Kullanıcı aktivite logu
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await supabase.from('user_activity_logs').insert({
      user_id: authData.user.id,
      activity_type: 'login',
      activity_description: 'Kullanıcı giriş yaptı',
      ip_address: clientIP,
      user_agent: userAgent,
    });

    // Session çerezlerini set et
    const response = NextResponse.json({
      message: 'Giriş başarılı!',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        fullName: profileData?.full_name || authData.user.user_metadata?.full_name,
        phone: profileData?.phone,
        emailConfirmed: authData.user.email_confirmed_at ? true : false,
        lastLogin: new Date().toISOString(),
        isAdmin: profileData?.account_status === 'admin'
      },
      session: {
        access_token: authData.session?.access_token,
        refresh_token: authData.session?.refresh_token,
        expires_at: authData.session?.expires_at,
      },
    });

    // Supabase session çerezlerini set et
    if (authData.session) {
      const maxAge = 60 * 60 * 24 * 7; // 7 gün
      
      console.log('🍪 LOGIN: Setting session cookies');
      
      response.cookies.set('sb-access-token', authData.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: maxAge,
        path: '/'
      });
      
      response.cookies.set('sb-refresh-token', authData.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: maxAge,
        path: '/'
      });
    }

    console.log('🎉 LOGIN: Login complete, returning response');
    return response;

  } catch (error) {
    console.error('❌ LOGIN: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}

// GET metodu ile endpoint'i test etme
export async function GET() {
  return NextResponse.json({ message: 'User login endpoint is working' });
} 