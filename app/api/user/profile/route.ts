import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/supabase-server';

// Token'dan kullanıcı ID'sini al
async function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    const supabase = getServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return null;
    }
    return user;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// Kullanıcı profil bilgilerini getir
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim. Lütfen giriş yapın.' },
        { status: 401 }
      );
    }

    const supabase = getServerSupabaseClient();

    // Profil bilgilerini al
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select(`
        *,
        user_addresses (
          id,
          address_title,
          full_name,
          phone,
          address_line1,
          address_line2,
          city,
          district,
          postal_code,
          country,
          is_default,
          is_billing_default
        ),
        user_preferences (
          theme,
          language,
          currency,
          favorite_categories,
          price_range_min,
          price_range_max,
          email_order_updates,
          email_promotions,
          email_newsletter,
          sms_order_updates,
          sms_promotions,
          push_order_updates,
          push_promotions
        )
      `)
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return NextResponse.json(
        { error: 'Profil bilgileri alınamadı.' },
        { status: 500 }
      );
    }

    // Son aktivite bilgilerini al
    const { data: lastActivityData } = await supabase
      .from('user_activity_logs')
      .select('activity_type, activity_description, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      user: {
        id: profileData.id,
        email: profileData.email,
        fullName: profileData.full_name,
        phone: profileData.phone,
        avatarUrl: profileData.avatar_url,
        birthDate: profileData.birth_date,
        gender: profileData.gender,
        emailVerified: profileData.email_verified,
        phoneVerified: profileData.phone_verified,
        accountStatus: profileData.account_status,
        createdAt: profileData.created_at,
        lastLoginAt: profileData.last_login_at,
        referralCode: profileData.referral_code,
      },
      addresses: profileData.user_addresses || [],
      preferences: profileData.user_preferences?.[0] || {},
      recentActivity: lastActivityData || [],
    });

  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}

// Kullanıcı profil bilgilerini güncelle
export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim. Lütfen giriş yapın.' },
        { status: 401 }
      );
    }

    const supabase = getServerSupabaseClient();
    const { fullName, phone, email, birthDate, gender } = await request.json();

    // Veri doğrulaması
    if (fullName && fullName.trim().length < 2) {
      return NextResponse.json(
        { error: 'Ad soyad en az 2 karakter olmalıdır.' },
        { status: 400 }
      );
    }

    // Email formatı kontrolü (opsiyonel)
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Geçerli bir e-posta adresi girin.' },
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

    // Profil bilgilerini güncelle
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (fullName) updateData.full_name = fullName.trim();
    if (phone !== undefined) updateData.phone = phone || null;
    if (email) updateData.email = email.trim();
    if (birthDate !== undefined) updateData.birth_date = birthDate || null;
    if (gender !== undefined) updateData.gender = gender || null;

    const { data: updatedProfile, error: updateError } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Profile update error:', updateError);
      return NextResponse.json(
        { error: 'Profil güncellenemedi.' },
        { status: 500 }
      );
    }

    // Aktivite logu
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    await supabase.from('user_activity_logs').insert({
      user_id: user.id,
      activity_type: 'profile_update',
      activity_description: 'Profil bilgileri güncellendi',
      ip_address: clientIP,
      user_agent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      message: 'Profil başarıyla güncellendi.',
      user: {
        id: updatedProfile.id,
        email: updatedProfile.email,
        fullName: updatedProfile.full_name,
        phone: updatedProfile.phone,
        birthDate: updatedProfile.birth_date,
        gender: updatedProfile.gender,
        updatedAt: updatedProfile.updated_at,
      },
    });

  } catch (error) {
    console.error('Profile PUT error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
} 