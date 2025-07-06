'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabase-client'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // URL'den auth code'u al ve session'a çevir
        const { data, error } = await supabaseClient.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          router.push('/?error=auth_failed')
          return
        }

        if (data.session) {
          // Kullanıcı başarıyla giriş yaptı
          console.log('Auth successful:', data.session.user.email)
          
          // Ana sayfaya yönlendir
          router.push('/')
        } else {
          // Session bulunamadı
          router.push('/?error=no_session')
        }
      } catch (error) {
        console.error('Callback error:', error)
        router.push('/?error=callback_failed')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
        <h2 className="text-xl font-medium">Giriş işlemi tamamlanıyor...</h2>
        <p className="text-gray-600 mt-2">Lütfen bekleyin</p>
      </div>
    </div>
  )
} 