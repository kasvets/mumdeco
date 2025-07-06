'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function AuthCallbackContent() {
  const searchParams = useSearchParams()

  useEffect(() => {
    console.log('🚀 Auth callback started')
    
    // Auth code var mı kontrol et
    const code = searchParams.get('code')
    
    if (code) {
      console.log('✅ Auth code found, redirecting immediately')
      
      // Direkt redirect yap - auth exchange'i bekleme
      const returnUrl = localStorage.getItem('auth_return_url') || '/'
      localStorage.removeItem('auth_return_url')
      
      console.log('🔄 Redirecting to:', returnUrl)
      
      // Anında redirect
      window.location.replace(returnUrl)
    } else {
      console.log('❌ No auth code, redirecting to home')
      window.location.replace('/')
    }
  }, [searchParams])

  // Manuel redirect butonu - eğer otomatik çalışmazsa
  const handleManualRedirect = () => {
    const returnUrl = localStorage.getItem('auth_return_url') || '/'
    localStorage.removeItem('auth_return_url')
    window.location.replace(returnUrl)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center bg-white p-8 rounded-2xl shadow-lg border border-gray-100 max-w-md w-full mx-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Giriş Başarılı!
        </h2>
        <p className="text-gray-600 mb-6">
          Yönlendiriliyor...
        </p>
        
        <button
          onClick={handleManualRedirect}
          className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          Ana Sayfaya Git
        </button>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center bg-white p-8 rounded-2xl shadow-lg border border-gray-100 max-w-md w-full mx-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Yükleniyor...
        </h2>
        <p className="text-gray-600">
          Lütfen bekleyin...
        </p>
      </div>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthCallbackContent />
    </Suspense>
  )
} 