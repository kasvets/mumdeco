import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    // Admin sayfası kontrolü - daha esnek approach
    if (request.nextUrl.pathname.startsWith('/admin')) {
      
      // Önce basit bir admin check yapalım - eğer kullanıcı daha önce login olduysa
      const adminCookie = request.cookies.get('admin-authenticated');
      
      if (adminCookie?.value === 'true') {
        // Admin cookie'si varsa devam et
        return NextResponse.next();
      }

      // Cookie yoksa middleware ile session kontrolü yap
      try {
        const supabase = createMiddlewareClient({ req: request, res: NextResponse.next() })
        
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          console.log('No session found, redirecting to login');
          return NextResponse.redirect(new URL('/auth/login', request.url))
        }

        // Admin yetkisi kontrolü
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('account_status')
          .eq('id', session.user.id)
          .single()

        if (profileError || !profile || profile.account_status !== 'admin') {
          console.log('Not admin or profile error, redirecting to home');
          return NextResponse.redirect(new URL('/', request.url))
        }

        // Başarılı admin girişi - cookie set et
        const response = NextResponse.next();
        response.cookies.set('admin-authenticated', 'true', {
          maxAge: 60 * 60 * 24, // 24 saat
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
        
        return response;

      } catch (sessionError) {
        console.warn('Session error in middleware:', sessionError);
        return NextResponse.redirect(new URL('/auth/login', request.url))
      }
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    // Admin sayfasına gidiyorsa login'e yönlendir
    if (request.nextUrl.pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
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