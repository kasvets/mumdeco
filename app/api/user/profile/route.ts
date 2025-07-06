import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase-server';

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

// Kullanıcı profil bilgilerini getir
export async function GET(request: NextRequest) {
  try {
    // Get user from token
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔍 Getting user profile for:', user.email);

    // Use ADMIN client to bypass RLS
    const adminSupabase = createAdminSupabaseClient();
    const { data: profile, error: profileError } = await adminSupabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      console.error('Profile error details:', {
        code: profileError.code,
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint,
        userId: user.id
      });
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    console.log('✅ Profile fetched successfully:', profile.full_name);
    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error in user profile GET route:', error);
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
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing environment variables for PUT:', {
        SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
        SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING'
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

    const { fullName, phone, email, birthDate, gender, address_line1, city, district } = await request.json();

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

    // Profil bilgilerini güncelle (UPDATE)
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (fullName) updateData.full_name = fullName.trim();
    if (phone !== undefined) updateData.phone = phone || null;
    if (email) updateData.email = email.trim();
    if (birthDate !== undefined) updateData.birth_date = birthDate || null;
    if (gender !== undefined) updateData.gender = gender || null;
    if (address_line1 !== undefined) updateData.address_line1 = address_line1 || null;
    if (city !== undefined) updateData.city = city || null;
    if (district !== undefined) updateData.district = district || null;

    console.log('Attempting update with data:', updateData);

    // Use ADMIN client to bypass RLS
    const adminSupabase = createAdminSupabaseClient();
    
    // First check if profile exists
    const { data: existingProfile, error: checkError } = await adminSupabase
      .from('user_profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    let updatedProfile;
    let updateError;

    if (checkError || !existingProfile) {
      console.log('Profile does not exist, creating new one...');
      // Create new profile if it doesn't exist
      const newProfileData = {
        id: user.id,
        email: user.email,
        full_name: fullName?.trim() || user.email?.split('@')[0] || 'Kullanıcı',
        ...updateData
      };
      
      const result = await adminSupabase
        .from('user_profiles')
        .insert(newProfileData)
        .select()
        .single();
      
      updatedProfile = result.data;
      updateError = result.error;
    } else {
      console.log('Profile exists, updating...');
      // Update existing profile
      const result = await adminSupabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();
      
      updatedProfile = result.data;
      updateError = result.error;
    }

    if (updateError) {
      console.error('Profile update error:', updateError);
      console.error('Update error details:', {
        code: updateError.code,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
        userId: user.id,
        updateData: updateData
      });
      return NextResponse.json(
        { error: `Profil güncellenemedi: ${updateError.message}` },
        { status: 500 }
      );
    }

    // Aktivite logu
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    try {
      await adminSupabase.from('user_activity_logs').insert({
        user_id: user.id,
        activity_type: 'profile_update',
        activity_description: 'Profil bilgileri güncellendi',
        ip_address: clientIP,
        user_agent: request.headers.get('user-agent') || 'unknown',
      });
    } catch (logError) {
      // Log error shouldn't break the main flow
      console.error('Activity log error:', logError);
    }

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