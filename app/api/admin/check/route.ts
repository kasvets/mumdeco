import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        error: 'userId parametresi gereklidir'
      }, { status: 400 });
    }

    const supabase = getServerSupabaseClient();

    // Kullanıcı profilini kontrol et
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('id, email, full_name, account_status, created_at')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return NextResponse.json({
        found: false,
        error: 'Kullanıcı bulunamadı',
        userId: userId
      }, { status: 404 });
    }

    const isAdmin = profile.account_status === 'admin';

    return NextResponse.json({
      found: true,
      userId: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      accountStatus: profile.account_status,
      isAdmin: isAdmin,
      createdAt: profile.created_at
    });

  } catch (error) {
    console.error('Admin check error:', error);
    return NextResponse.json({
      error: 'Sunucu hatası oluştu'
    }, { status: 500 });
  }
}

// Kullanıcıyı admin yapma endpoint'i - GÜVENLİ VERSİYON
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({
        error: 'userId gereklidir'
      }, { status: 400 });
    }

    const supabase = getServerSupabaseClient();

    // Önce mevcut kullanıcının admin yetkisi olup olmadığını kontrol et
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({
        error: 'Oturum bulunamadı'
      }, { status: 401 });
    }

    // İstek yapan kullanıcının admin olup olmadığını kontrol et
    const { data: currentUserProfile, error: currentUserError } = await supabase
      .from('user_profiles')
      .select('account_status')
      .eq('id', session.user.id)
      .single();

    if (currentUserError || !currentUserProfile || currentUserProfile.account_status !== 'admin') {
      return NextResponse.json({
        error: 'Bu işlem için admin yetkisi gereklidir'
      }, { status: 403 });
    }

    // Admin yetkisi doğrulandı, artık kullanıcıyı admin yapabilir
    const { data: updatedProfile, error } = await supabase
      .from('user_profiles')
      .update({ 
        account_status: 'admin',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Admin update error:', error);
      return NextResponse.json({
        error: 'Kullanıcı admin yapılamadı'
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Kullanıcı başarıyla admin yapıldı',
      user: {
        id: updatedProfile.id,
        email: updatedProfile.email,
        fullName: updatedProfile.full_name,
        accountStatus: updatedProfile.account_status,
        updatedAt: updatedProfile.updated_at
      }
    });

  } catch (error) {
    console.error('Admin creation error:', error);
    return NextResponse.json({
      error: 'Sunucu hatası oluştu'
    }, { status: 500 });
  }
} 