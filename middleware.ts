import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    // Admin sayfası kontrolü - güvenli approach
    if (request.nextUrl.pathname.startsWith('/admin')) {
      console.log('🛡️ MIDDLEWARE: Admin page access attempt:', request.nextUrl.pathname);
      
      // Session çerezlerini kontrol et
      const accessToken = request.cookies.get('sb-access-token')?.value;
      const refreshToken = request.cookies.get('sb-refresh-token')?.value;
      
      console.log('🍪 MIDDLEWARE: Session cookies:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        accessTokenPreview: accessToken?.substring(0, 20) + '...' || 'none'
      });
      
      if (!accessToken || !refreshToken) {
        console.log('❌ MIDDLEWARE: No session cookies found, redirecting to login');
        const response = NextResponse.redirect(new URL('/auth/login', request.url));
        // Çerezleri temizle
        response.cookies.delete('sb-access-token');
        response.cookies.delete('sb-refresh-token');
        return response;
      }
      
      try {
        const supabase = createMiddlewareClient({ req: request, res: NextResponse.next() });
        
        console.log('🔑 MIDDLEWARE: Setting session with tokens');
        
        // Session'ı token ile set et
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (sessionError) {
          console.log('❌ MIDDLEWARE: Session set error:', sessionError.message);
          const response = NextResponse.redirect(new URL('/auth/login', request.url));
          response.cookies.delete('sb-access-token');
          response.cookies.delete('sb-refresh-token');
          return response;
        }
        
        const {
          data: { session },
        } = await supabase.auth.getSession();

        console.log('📋 MIDDLEWARE: Session check result:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          userEmail: session?.user?.email || 'none',
          sessionExpired: session ? new Date(session.expires_at! * 1000) < new Date() : 'no-session'
        });

        // Session süresi kontrolü
        if (!session || !session.user) {
          console.log('❌ MIDDLEWARE: No valid session found, redirecting to login');
          const response = NextResponse.redirect(new URL('/auth/login', request.url));
          response.cookies.delete('sb-access-token');
          response.cookies.delete('sb-refresh-token');
          return response;
        }

        // Session süresi dolmuş mu kontrol et
        if (session.expires_at && new Date(session.expires_at * 1000) <= new Date()) {
          console.log('❌ MIDDLEWARE: Session expired, redirecting to login');
          const response = NextResponse.redirect(new URL('/auth/login', request.url));
          response.cookies.delete('sb-access-token');
          response.cookies.delete('sb-refresh-token');
          return response;
        }

        // Session'ın user bilgilerini kontrol et - admin client yerine session validation kullan
        if (!session.user.id || !session.user.email) {
          console.log('❌ MIDDLEWARE: Invalid session user data');
          const response = NextResponse.redirect(new URL('/auth/login', request.url));
          response.cookies.delete('sb-access-token');
          response.cookies.delete('sb-refresh-token');
          return response;
        }

        // Admin yetkisi kontrolü - her zaman veritabanından kontrol et
        console.log('👤 MIDDLEWARE: Checking admin status for:', session.user.email);
        
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('account_status, email, last_login_at')
          .eq('id', session.user.id)
          .single();

        console.log('🔍 MIDDLEWARE: Profile check result:', {
          hasProfile: !!profile,
          accountStatus: profile?.account_status || 'none',
          isAdmin: profile?.account_status === 'admin',
          profileError: profileError?.message || 'none',
          email: profile?.email || 'none'
        });

        if (profileError || !profile || profile.account_status !== 'admin') {
          console.log('❌ MIDDLEWARE: Not admin or profile error, redirecting to home');
          const response = NextResponse.redirect(new URL('/', request.url));
          return response;
        }

        // Email doğrulaması - profildeki email ile session'daki email eşleşmeli
        if (profile.email !== session.user.email) {
          console.log('❌ MIDDLEWARE: Email mismatch between profile and session');
          const response = NextResponse.redirect(new URL('/auth/login', request.url));
          response.cookies.delete('sb-access-token');
          response.cookies.delete('sb-refresh-token');
          return response;
        }

        // Admin yetkisi doğrulandı - güvenli response
        console.log('✅ MIDDLEWARE: Admin access granted for:', session.user.email);
        return NextResponse.next();

      } catch (sessionError) {
        console.error('❌ MIDDLEWARE: Session error:', sessionError);
        const response = NextResponse.redirect(new URL('/auth/login', request.url));
        response.cookies.delete('sb-access-token');
        response.cookies.delete('sb-refresh-token');
        return response;
      }
    }

    return NextResponse.next()
  } catch (error) {
    console.error('❌ MIDDLEWARE: Unexpected error:', error)
    // Admin sayfasına gidiyorsa login'e yönlendir
    if (request.nextUrl.pathname.startsWith('/admin')) {
      const response = NextResponse.redirect(new URL('/auth/login', request.url));
      response.cookies.delete('sb-access-token');
      response.cookies.delete('sb-refresh-token');
      return response;
    }
    // Diğer sayfalarda devam et
    return NextResponse.next()
  }
}

// Hangi sayfalarda middleware çalışacak
export const config = {
  matcher: [
    '/admin/:path*'
  ]
} 