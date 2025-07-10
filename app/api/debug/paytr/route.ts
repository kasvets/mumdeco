import { NextRequest, NextResponse } from 'next/server';
import { getPayTRConfigInfo, isPayTRTestMode, PAYTR_CONFIG } from '@/lib/paytr';

export async function GET(request: NextRequest) {
  try {
    // PayTR konfigürasyon bilgilerini al
    const configInfo = getPayTRConfigInfo();
    
    // Debug bilgileri
    const debugInfo = {
      // Environment Variables
      environment: {
        PAYTR_TEST_MODE: process.env.PAYTR_TEST_MODE,
        NODE_ENV: process.env.NODE_ENV,
        PAYTR_MERCHANT_ID: process.env.PAYTR_MERCHANT_ID,
        PAYTR_DEBUG_MODE: process.env.PAYTR_DEBUG_MODE,
      },
      
      // PayTR Config
      paytr_config: {
        merchant_id: PAYTR_CONFIG.MERCHANT_ID,
        test_mode: PAYTR_CONFIG.TEST_MODE,
        debug_mode: PAYTR_CONFIG.DEBUG_MODE,
        success_url: PAYTR_CONFIG.SUCCESS_URL,
        fail_url: PAYTR_CONFIG.FAIL_URL,
        callback_url: PAYTR_CONFIG.CALLBACK_URL,
      },
      
      // Fonksiyon sonuçları
      functions: {
        isPayTRTestMode: isPayTRTestMode(),
        getPayTRConfigInfo: configInfo,
      },
      
      // Çözüm önerileri
      recommendations: [] as string[]
    };
    
    // Sorun analizi ve öneriler
    if (PAYTR_CONFIG.TEST_MODE === 1) {
      debugInfo.recommendations.push('⚠️ PAYTR_TEST_MODE=1 - Test modu aktif');
    } else {
      debugInfo.recommendations.push('✅ PAYTR_TEST_MODE=0 - Canlı mod ayarlanmış');
    }
    
    if (process.env.NODE_ENV === 'development') {
      debugInfo.recommendations.push('⚠️ NODE_ENV=development - Geliştirme modunda');
    } else {
      debugInfo.recommendations.push('✅ NODE_ENV=production - Production modunda');
    }
    
    if (isPayTRTestMode()) {
      debugInfo.recommendations.push('🔴 isPayTRTestMode() = true - Test modu fonksiyonu aktif');
    } else {
      debugInfo.recommendations.push('🟢 isPayTRTestMode() = false - Test modu fonksiyonu deaktif');
    }
    
    // PayTR merchant ID kontrolü
    if (PAYTR_CONFIG.MERCHANT_ID === '594162') {
      debugInfo.recommendations.push('⚠️ Test merchant ID kullanılıyor - Canlı merchant ID gerekli');
    } else {
      debugInfo.recommendations.push('✅ Canlı merchant ID kullanılıyor');
    }
    
    return NextResponse.json(debugInfo);
    
  } catch (error) {
    console.error('PayTR debug error:', error);
    return NextResponse.json(
      { error: 'Failed to get PayTR debug info' },
      { status: 500 }
    );
  }
} 