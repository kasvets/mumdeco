import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/supabase-server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

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
    console.error('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING');
    console.error('Service Key:', process.env.SUPABASE_SERVICE_KEY ? 'SET' : 'MISSING');
    return null;
  }
}

// Kullanıcı profil bilgilerini getir
export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    
    // Get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error in user profile route:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// Kullanıcı profil bilgilerini güncelle
export async function PUT(request: NextRequest) {
  try {
    // Environment variables kontrolü
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      console.error('Missing environment variables for PUT:', {
        SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
        SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY ? 'SET' : 'MISSING'
      });
      return NextResponse.json(
        { error: 'Sunucu yapılandırma hatası.' },
        { status: 500 }
      );
    }

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