'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'

export default function AuthCallback() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // URL'den auth code'u al ve session'a çevir
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          setError('Giriş işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.')
          
          // 3 saniye sonra yönlendir
          setTimeout(() => {
            const returnUrl = localStorage.getItem('auth_return_url') || '/'
            localStorage.removeItem('auth_return_url')
            router.push(`${returnUrl}?error=auth_failed`)
          }, 3000)
          return
        }

        if (data.session) {
          // Kullanıcı başarıyla giriş yaptı
          console.log('Auth successful:', data.session.user.email)
          
          // Session'ı yenile
          const { error: refreshError } = await supabase.auth.refreshSession()
          if (refreshError) {
            console.error('Session refresh error:', refreshError)
          }
          
          // Kullanıcının nereden geldiğini kontrol et
          const returnUrl = localStorage.getItem('auth_return_url') || '/'
          localStorage.removeItem('auth_return_url') // Temizle
          
          // Başarılı mesajı göster ve yönlendir
          setError(null)
          console.log('Redirecting to:', returnUrl)
          router.push(returnUrl)
        } else {
          // Session bulunamadı
          setError('Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.')
          setTimeout(() => {
            const returnUrl = localStorage.getItem('auth_return_url') || '/'
            localStorage.removeItem('auth_return_url')
            router.push(`${returnUrl}?error=no_session`)
          }, 3000)
        }
      } catch (error) {
        console.error('Callback error:', error)
        setError('Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.')
        setTimeout(() => {
          const returnUrl = localStorage.getItem('auth_return_url') || '/'
          localStorage.removeItem('auth_return_url')
          router.push(`${returnUrl}?error=callback_failed`)
        }, 3000)
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {!error ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <h2 className="text-xl font-medium">Giriş işlemi tamamlanıyor...</h2>
            <p className="text-gray-600 mt-2">Lütfen bekleyin</p>
          </>
        ) : (
          <>
            <div className="text-red-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-medium text-red-600">Hata</h2>
            <p className="text-gray-600 mt-2">{error}</p>
            <p className="text-sm text-gray-500 mt-4">Yönlendiriliyorsunuz...</p>
          </>
        )}
      </div>
    </div>
  )
} 