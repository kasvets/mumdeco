import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase client (server-side için)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

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

    // Kullanıcı girişi
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('Login error:', authError);
      
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

    // Kullanıcı profil bilgilerini al
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      // Profil bulunamadığında hata vermek yerine temel bilgileri döndür
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

    // Giriş başarılı
    return NextResponse.json({
      message: 'Giriş başarılı!',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        fullName: profileData?.full_name || authData.user.user_metadata?.full_name,
        phone: profileData?.phone,
        emailConfirmed: authData.user.email_confirmed_at ? true : false,
        lastLogin: new Date().toISOString(),
      },
      session: {
        access_token: authData.session?.access_token,
        refresh_token: authData.session?.refresh_token,
        expires_at: authData.session?.expires_at,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
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