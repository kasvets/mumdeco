import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase client (server-side için)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Service key kullanıyoruz
);

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, phone } = await request.json();

    // Veri doğrulaması
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'E-posta, şifre ve ad soyad gerekli.' },
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

    // Şifre uzunluğu kontrolü
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Şifre en az 6 karakter olmalıdır.' },
        { status: 400 }
      );
    }

    // Telefon formatı kontrolü (opsiyonel)
    if (phone && phone.length < 10) {
      return NextResponse.json(
        { error: 'Geçerli bir telefon numarası girin.' },
        { status: 400 }
      );
    }

    // Kullanıcı kaydı
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone || null,
        },
      },
    });

    if (authError) {
      console.error('Auth error:', authError);
      
      // Türkçe hata mesajları
      let errorMessage = 'Kayıt sırasında bir hata oluştu.';
      
      if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
        errorMessage = 'Bu e-posta adresi zaten kayıtlı.';
      } else if (authError.message.includes('invalid email')) {
        errorMessage = 'Geçersiz e-posta adresi.';
      } else if (authError.message.includes('password')) {
        errorMessage = 'Şifre çok zayıf.';
      } else if (authError.message.includes('Database error')) {
        errorMessage = 'Veritabanı hatası. Lütfen daha sonra tekrar deneyin.';
      }
      
      return NextResponse.json(
        { error: errorMessage, details: authError.message },
        { status: 400 }
      );
    }

    // Eğer trigger çalışmazsa manuel profil oluştur
    if (authData.user && !authError) {
      try {
        // Kullanıcı profilini manuel oluştur
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            email: authData.user.email,
            full_name: fullName,
            phone: phone || null,
            email_verified: false,
          });

        if (profileError) {
          console.log('Profile creation error (might be normal if trigger worked):', profileError);
        }

        // Kullanıcı tercihlerini manuel oluştur
        const { error: preferencesError } = await supabase
          .from('user_preferences')
          .insert({
            user_id: authData.user.id,
          });

        if (preferencesError) {
          console.log('Preferences creation error (might be normal if trigger worked):', preferencesError);
        }
      } catch (error) {
        console.log('Manual profile creation error:', error);
        // Hata olsa bile kayıt işlemini durdurma
      }
    }

    // Kayıt başarılı
    return NextResponse.json({
      message: 'Kayıt başarılı! E-posta adresinize doğrulama linki gönderildi.',
      user: {
        id: authData.user?.id,
        email: authData.user?.email,
        fullName: authData.user?.user_metadata?.full_name,
        emailConfirmed: authData.user?.email_confirmed_at ? true : false,
      },
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}

// GET metodu ile endpoint'i test etme
export async function GET() {
  return NextResponse.json({ message: 'User registration endpoint is working' });
} 