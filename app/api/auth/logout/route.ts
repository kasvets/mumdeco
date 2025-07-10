import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    console.log('🚪 LOGOUT: Starting logout process');
    
    // Supabase client ile çıkış yap
    const supabase = createServerSupabaseClient();
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('🚪 LOGOUT: Supabase logout error:', error);
    } else {
      console.log('✅ LOGOUT: Supabase logout successful');
    }

    // Response oluştur
    const response = NextResponse.json({
      message: 'Çıkış başarılı'
    });

    // Tüm session çerezlerini agresif şekilde temizle
    const cookiesToDelete = [
      'sb-access-token',
      'sb-refresh-token',
      'supabase-auth-token',
      'supabase.auth.token'
    ];

    cookiesToDelete.forEach(cookieName => {
      response.cookies.set(cookieName, '', {
        path: '/',
        expires: new Date(0),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    });

    console.log('🧹 LOGOUT: All cookies cleared');
    return response;

  } catch (error) {
    console.error('❌ LOGOUT: Unexpected error:', error);
    
    // Hata olsa bile çerezleri temizle
    const response = NextResponse.json({
      message: 'Çıkış yapıldı',
      error: 'Partial logout due to error'
    });

    const cookiesToDelete = [
      'sb-access-token',
      'sb-refresh-token',
      'supabase-auth-token',
      'supabase.auth.token'
    ];

    cookiesToDelete.forEach(cookieName => {
      response.cookies.set(cookieName, '', {
        path: '/',
        expires: new Date(0),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    });

    return response;
  }
} 