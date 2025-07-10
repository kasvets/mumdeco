import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase-server';

// Sadece belirli admin email'lerin admin olabileceği whitelist
const ADMIN_EMAILS = [
  'mumdeco.admin@mumdeco.com'
];

export async function POST(request: NextRequest) {
  try {
    const { email, action } = await request.json();

    if (!email || !action) {
      return NextResponse.json({
        error: 'Email ve action gereklidir'
      }, { status: 400 });
    }

    // Sadece whitelist'teki email'lere izin ver
    if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
      return NextResponse.json({
        error: 'Bu email adresi admin yetkisi alamaz'
      }, { status: 403 });
    }

    const adminSupabase = createAdminSupabaseClient();

    if (action === 'check') {
      // Kullanıcının varlığını kontrol et
      const { data: authUsers, error: authError } = await adminSupabase.auth.admin.listUsers();
      
      if (authError) {
        return NextResponse.json({
          error: 'Auth kullanıcıları kontrol edilemedi'
        }, { status: 500 });
      }

      const authUser = authUsers.users.find(u => u.email === email);
      
      if (!authUser) {
        return NextResponse.json({
          found: false,
          message: 'Kullanıcı auth tablosunda bulunamadı'
        });
      }

      // Profil kontrolü
      const { data: profile, error: profileError } = await adminSupabase
        .from('user_profiles')
        .select('*')
        .eq('email', email)
        .single();

      return NextResponse.json({
        found: true,
        authUser: {
          id: authUser.id,
          email: authUser.email,
          emailConfirmed: authUser.email_confirmed_at ? true : false,
          createdAt: authUser.created_at
        },
        profile: profile || null,
        profileError: profileError ? profileError.message : null
      });
    }

    if (action === 'create-admin') {
      // Admin kullanıcı oluştur/güncelle
      const { data: authUsers, error: authError } = await adminSupabase.auth.admin.listUsers();
      
      if (authError) {
        return NextResponse.json({
          error: 'Auth kullanıcıları kontrol edilemedi'
        }, { status: 500 });
      }

      const authUser = authUsers.users.find(u => u.email === email);
      
      if (!authUser) {
        return NextResponse.json({
          error: 'Kullanıcı önce sisteme kayıt olmalı'
        }, { status: 404 });
      }

      // Profil oluştur/güncelle
      const { data: profile, error: profileError } = await adminSupabase
        .from('user_profiles')
        .upsert({
          id: authUser.id,
          email: authUser.email,
          full_name: authUser.user_metadata?.full_name || 'MumDeco Admin',
          account_status: 'admin',
          email_verified: authUser.email_confirmed_at ? true : false,
          created_at: authUser.created_at,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (profileError) {
        return NextResponse.json({
          error: 'Profil oluşturulamadı: ' + profileError.message
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Admin hesabı başarıyla oluşturuldu/güncellendi',
        profile: profile
      });
    }

    return NextResponse.json({
      error: 'Geçersiz action'
    }, { status: 400 });

  } catch (error) {
    console.error('Admin setup error:', error);
    return NextResponse.json({
      error: 'Sunucu hatası oluştu'
    }, { status: 500 });
  }
}

// GET endpoint - admin durumunu kontrol et
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({
        error: 'Email parametresi gereklidir'
      }, { status: 400 });
    }

    // Sadece whitelist'teki email'lere izin ver
    if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
      return NextResponse.json({
        error: 'Bu email adresi admin yetkisi alamaz'
      }, { status: 403 });
    }

    const adminSupabase = createAdminSupabaseClient();

    // Auth kullanıcısını kontrol et
    const { data: authUsers, error: authError } = await adminSupabase.auth.admin.listUsers();
    
    if (authError) {
      return NextResponse.json({
        error: 'Auth kullanıcıları kontrol edilemedi'
      }, { status: 500 });
    }

    const authUser = authUsers.users.find(u => u.email === email);
    
    if (!authUser) {
      return NextResponse.json({
        found: false,
        message: 'Kullanıcı sisteme kayıt olmamış'
      });
    }

    // Profil kontrolü
    const { data: profile, error: profileError } = await adminSupabase
      .from('user_profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    const isAdmin = profile?.account_status === 'admin';

    return NextResponse.json({
      found: true,
      isAdmin: isAdmin,
      authUser: {
        id: authUser.id,
        email: authUser.email,
        emailConfirmed: authUser.email_confirmed_at ? true : false,
        createdAt: authUser.created_at
      },
      profile: profile || null,
      needsProfileUpdate: !profile || profile.account_status !== 'admin'
    });

  } catch (error) {
    console.error('Admin check error:', error);
    return NextResponse.json({
      error: 'Sunucu hatası oluştu'
    }, { status: 500 });
  }
} 