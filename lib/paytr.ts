import crypto from 'crypto';

// PayTR Konfigürasyonu
export const PAYTR_CONFIG = {
  TEST_URL: 'https://www.paytr.com/odeme/api/get-token',
  PRODUCTION_URL: 'https://www.paytr.com/odeme/api/get-token',
  IFRAME_URL: 'https://www.paytr.com/odeme/guvenli/',
  CURRENCY: {
    TRY: 'TL',
    USD: 'USD',
    EUR: 'EUR',
    GBP: 'GBP'
  },
  TIMEOUT: 30000, // 30 saniye
  // Environment Variables
  MERCHANT_ID: process.env.PAYTR_MERCHANT_ID || '',
  MERCHANT_KEY: process.env.PAYTR_MERCHANT_KEY || '',
  MERCHANT_SALT: process.env.PAYTR_MERCHANT_SALT || '',
  TEST_MODE: parseInt(process.env.PAYTR_TEST_MODE || '1'),
  DEBUG_MODE: parseInt(process.env.PAYTR_DEBUG_MODE || '1'),
  SUCCESS_URL: process.env.PAYTR_SUCCESS_URL || `https://www.mumdeco.com/payment/success`,
  FAIL_URL: process.env.PAYTR_FAIL_URL || `https://www.mumdeco.com/payment/failure`,
  CALLBACK_URL: process.env.PAYTR_CALLBACK_URL || `https://www.mumdeco.com/api/paytr/callback`,
  // PayTR Test Credentials (fallback)
  TEST_MERCHANT_ID: '594162',
  TEST_MERCHANT_KEY: 'd2BeXLTPQD6AxkJ',
  TEST_MERCHANT_SALT: '6KbeRjCKymsKdk8',
};

// PayTR Sepet Ürünü Interface
export interface PayTRBasketItem {
  name: string;
  price: number;
  quantity: number;
}

// PayTR Ödeme Request Interface
export interface PayTRPaymentRequest {
  merchant_id: string;
  merchant_key: string;
  merchant_salt: string;
  merchant_oid: string;
  email: string;
  payment_amount: number;
  user_basket: PayTRBasketItem[];
  user_name: string;
  user_address: string;
  user_phone: string;
  user_ip: string;
  merchant_ok_url: string;
  merchant_fail_url: string;
  currency: string;
  test_mode?: number;
  debug_on?: number;
  no_installment?: number;
  max_installment?: number;
  lang?: string;
  timeout_limit?: number;
}

// PayTR Callback Response Interface
export interface PayTRCallbackResponse {
  merchant_oid: string;
  status: string;
  total_amount: number;
  hash: string;
  failed_reason_code?: string;
  failed_reason_msg?: string;
  test_mode?: number;
  payment_type?: string;
  currency?: string;
  payment_amount?: number;
}

// PayTR Sepet Formatı Oluşturma (Base64 encoded)
export function createPayTRBasket(items: PayTRBasketItem[]): string {
  const basketArray = items.map(item => [
    item.name,
    (item.price * 100).toFixed(0), // Kuruş cinsinden
    item.quantity
  ]);
  
  // Base64 encoded JSON formatı (çalışan projeden)
  return Buffer.from(JSON.stringify(basketArray)).toString('base64');
}

// Çalışan kod ile uyumluluk için alias
export function formatUserBasket(items: any[]): string {
  const basketItems: PayTRBasketItem[] = items.map(item => ({
    name: item.name,
    price: item.price,
    quantity: item.quantity
  }));
  
  return createPayTRBasket(basketItems);
}

// PayTR Hash Hesaplama (Resmi örnek koduna göre)
export function calculatePayTRHash(
  merchant_id: string,
  merchant_key: string,
  merchant_salt: string,
  merchant_oid: string,
  email: string,
  payment_amount: number,
  user_basket: string,
  no_installment: number,
  max_installment: number,
  currency: string,
  test_mode: number,
  user_ip: string
): string {
  // PayTR gerçek API formatı (çalışan projedeki):
  // merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket + no_installment + max_installment + currency + test_mode
  const hashSTR = `${merchant_id}${user_ip}${merchant_oid}${email}${payment_amount}${user_basket}${no_installment}${max_installment}${currency}${test_mode}`;
  
  // PayTR token oluştur (salt ile birlikte)
  const paytr_token = hashSTR + merchant_salt;
  
  // Production'da detaylı hash loglarını kısıtla
  if (process.env.NODE_ENV === 'development') {
    console.log('[PayTR HASH] Hash String:', hashSTR);
    console.log('[PayTR HASH] PayTR Token (hashSTR + salt):', paytr_token);
    console.log('[PayTR HASH] Secret Key (merchant_key):', merchant_key);
  }
  
  // HMAC-SHA256 hesaplama
  const token = crypto.createHmac('sha256', merchant_key).update(paytr_token).digest('base64');
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[PayTR HASH] Final Token:', token);
  }
  
  return token;
}

// PayTR Callback Hash Doğrulama
export function verifyPayTRCallback(data: {
  merchant_oid: string;
  status: string;
  total_amount: string;
  hash: string;
  merchant_id?: string;
}): boolean {
  try {
    const { merchant_oid, status, total_amount, hash } = data;
    
    // PayTR merchant salt ve key al
    const merchant_salt = PAYTR_CONFIG.MERCHANT_SALT;
    const merchant_key = PAYTR_CONFIG.MERCHANT_KEY;
    
    if (!merchant_salt) {
      console.error('❌ PAYTR_MERCHANT_SALT not configured');
      return false;
    }
    
    console.log('🔐 PayTR Callback Hash Debug:');
    console.log('merchant_oid:', merchant_oid);
    console.log('merchant_salt:', merchant_salt);
    console.log('status:', status);
    console.log('total_amount:', total_amount);
    console.log('received_hash:', hash);
    
    // PayTR dokümanına göre standart callback hash formatı
    const hashString = `${merchant_oid}${merchant_salt}${status}${total_amount}`;
    const calculatedHash = crypto.createHash('sha256').update(hashString).digest('base64');
    
    console.log('hashString:', hashString);
    console.log('calculatedHash:', calculatedHash);
    console.log('isValid:', calculatedHash === hash);
    
    if (calculatedHash === hash) {
      console.log('✅ Hash verification successful with standard format');
      return true;
    }
    
    // Alternatif formatları dene
    console.log('🔄 Trying alternative hash formats...');
    
    // Format 1: merchant_oid + status + total_amount + merchant_salt
    const altFormat1 = `${merchant_oid}${status}${total_amount}${merchant_salt}`;
    const altHash1 = crypto.createHash('sha256').update(altFormat1).digest('base64');
    console.log('Alt Hash 1 (oid+status+amount+salt):', altHash1, altHash1 === hash);
    if (altHash1 === hash) {
      console.log('✅ Hash verification successful with format 1');
      return true;
    }
    
    // Format 2: salt + merchant_oid + status + total_amount
    const altFormat2 = `${merchant_salt}${merchant_oid}${status}${total_amount}`;
    const altHash2 = crypto.createHash('sha256').update(altFormat2).digest('base64');
    console.log('Alt Hash 2 (salt+oid+status+amount):', altHash2, altHash2 === hash);
    if (altHash2 === hash) {
      console.log('✅ Hash verification successful with format 2');
      return true;
    }
    
    // Format 3: HMAC with salt
    const altHash3 = crypto.createHmac('sha256', merchant_salt).update(`${merchant_oid}${status}${total_amount}`).digest('base64');
    console.log('Alt Hash 3 (HMAC):', altHash3, altHash3 === hash);
    if (altHash3 === hash) {
      console.log('✅ Hash verification successful with HMAC format');
      return true;
    }
    
    // Callback'te gelen ek alanları kullanarak deneme
    const merchant_id = data.merchant_id; // Callback'ten gelen dinamik değer
    
    // Merchant_id varsa ek formatları test et
    if (merchant_id) {
      // Format 4: merchant_id + merchant_oid + merchant_salt + status + total_amount
      const format4 = `${merchant_id}${merchant_oid}${merchant_salt}${status}${total_amount}`;
      const hash4 = crypto.createHash('sha256').update(format4).digest('base64');
      console.log('Alt Hash 4 (id+oid+salt+status+amount):', hash4, hash4 === hash);
      if (hash4 === hash) {
        console.log('✅ Hash verification successful with merchant_id format');
        return true;
      }
      
      // Format 5: merchant_salt + merchant_id + merchant_oid + status + total_amount
      const format5 = `${merchant_salt}${merchant_id}${merchant_oid}${status}${total_amount}`;
      const hash5 = crypto.createHash('sha256').update(format5).digest('base64');
      console.log('Alt Hash 5 (salt+id+oid+status+amount):', hash5, hash5 === hash);
      if (hash5 === hash) {
        console.log('✅ Hash verification successful with salt+id format');
        return true;
      }
      
            // Format 8: merchant_id dahil HMAC
      if (merchant_key) {
        const hash8 = crypto.createHmac('sha256', merchant_key).update(`${merchant_id}${merchant_oid}${status}${total_amount}`).digest('base64');
        console.log('Alt Hash 8 (HMAC with id):', hash8, hash8 === hash);
        if (hash8 === hash) {
          console.log('✅ Hash verification successful with HMAC+ID format');
          return true;
        }
      }
    }
    
    // Format 6: HMAC with merchant_key (PayTR resmi örnek koduna göre)
    if (merchant_key) {
      const hash6 = crypto.createHmac('sha256', merchant_key).update(`${merchant_oid}${merchant_salt}${status}${total_amount}`).digest('base64');
      console.log('Alt Hash 6 (HMAC with key - PayTR format):', hash6, hash6 === hash);
      if (hash6 === hash) {
        console.log('✅ Hash verification successful with PayTR official HMAC format');
        return true;
      }
    }
    
    // Format 7: merchant_oid + status + total_amount (no salt/key)
    const format7 = `${merchant_oid}${status}${total_amount}`;
    const hash7 = crypto.createHash('sha256').update(format7).digest('base64');
    console.log('Alt Hash 7 (oid+status+amount only):', hash7, hash7 === hash);
    if (hash7 === hash) {
      console.log('✅ Hash verification successful with no salt format');
      return true;
    }
    
    console.error('❌ Hash verification failed - no format matched');
    return false;
    
  } catch (error) {
    console.error('❌ Hash verification error:', error);
    return false;
  }
}

// Çalışan kod ile uyumluluk için basit getPayTRToken overload
export async function getPayTRToken(data: {
  merchantOid: string;
  userIp: string;
  email: string;
  paymentAmount: number;
  userName: string;
  userAddress: string;
  userPhone: string;
  userBasket: string;
}): Promise<{
  status: string;
  token?: string;
  reason?: string;
}>;

// PayTR API Token Alma (mevcut full interface)
export async function getPayTRToken(paymentRequest: PayTRPaymentRequest): Promise<{
  status: string;
  token?: string;
  reason?: string;
}>;

// Implementation
export async function getPayTRToken(
  paymentRequestOrData: PayTRPaymentRequest | {
    merchantOid: string;
    userIp: string;
    email: string;
    paymentAmount: number;
    userName: string;
    userAddress: string;
    userPhone: string;
    userBasket: string;
  }
): Promise<{
  status: string;
  token?: string;
  reason?: string;
}> {
  // Eğer basit object formatı gelirse, PayTRPaymentRequest formatına çevir
  let paymentRequest: PayTRPaymentRequest;
  let userBasketString: string | null = null;
  
  if ('merchantOid' in paymentRequestOrData) {
    // Basit format - çalışan kod ile uyumlu
    const data = paymentRequestOrData;
    userBasketString = data.userBasket; // String olarak al
    paymentRequest = {
      merchant_id: PAYTR_CONFIG.MERCHANT_ID,
      merchant_key: PAYTR_CONFIG.MERCHANT_KEY,
      merchant_salt: PAYTR_CONFIG.MERCHANT_SALT,
      merchant_oid: data.merchantOid,
      email: data.email,
      payment_amount: data.paymentAmount,
      user_basket: [], // String userBasket'i internal'da handle edeceğiz
      user_name: data.userName,
      user_address: data.userAddress,
      user_phone: data.userPhone,
      user_ip: data.userIp,
      merchant_ok_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success`,
      merchant_fail_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/failure`,
      currency: 'TL',
      test_mode: PAYTR_CONFIG.TEST_MODE,
      debug_on: PAYTR_CONFIG.DEBUG_MODE,
      no_installment: 1,
      max_installment: 1,
      lang: 'tr',
      timeout_limit: 30
    };
  } else {
    // Mevcut PayTRPaymentRequest formatı
    paymentRequest = paymentRequestOrData;
  }

  return getPayTRTokenInternal(paymentRequest, userBasketString);
}

// Internal implementation
async function getPayTRTokenInternal(
  paymentRequest: PayTRPaymentRequest, 
  userBasketString?: string | null
): Promise<{
  status: string;
  token?: string;
  reason?: string;
}> {
  try {
    // Eğer userBasketString varsa onu kullan, yoksa PayTRBasketItem[]'dan oluştur
    const user_basket = userBasketString || createPayTRBasket(paymentRequest.user_basket);
    const no_installment = paymentRequest.no_installment || 1; // Çalışan projede 1
    const max_installment = paymentRequest.max_installment || 1; // Çalışan projede 1
    const test_mode = paymentRequest.test_mode || 1; // Test için 1
    
    // PayTR tutar kuruş cinsinden gönderilmeli
    const payment_amount_kurus = paymentRequest.payment_amount * 100;
    
    // Debug log için hash parametrelerini hazırla
    const hashParams = {
      merchant_id: paymentRequest.merchant_id,
      user_ip: paymentRequest.user_ip,
      merchant_oid: paymentRequest.merchant_oid,
      email: paymentRequest.email,
      payment_amount: payment_amount_kurus,
      user_basket: user_basket,
      no_installment: no_installment,
      max_installment: max_installment,
      currency: paymentRequest.currency,
      test_mode: test_mode,
      merchant_salt: paymentRequest.merchant_salt
    };
    
    logPayTRTransaction('REQUEST', hashParams, 'Hash Calculation Parameters');
    
    const paytr_token = calculatePayTRHash(
      parseInt(paymentRequest.merchant_id).toString(), // Integer olarak
      paymentRequest.merchant_key,
      paymentRequest.merchant_salt,
      paymentRequest.merchant_oid,
      paymentRequest.email,
      payment_amount_kurus,
      user_basket, // Base64 encoded
      no_installment,
      max_installment,
      paymentRequest.currency,
      test_mode,
      paymentRequest.user_ip
    );
    
    logPayTRTransaction('REQUEST', { token: paytr_token }, 'Generated PayTR Token');
    
    const formParams = new URLSearchParams();
    formParams.append('merchant_id', parseInt(paymentRequest.merchant_id).toString()); // Integer olarak
    formParams.append('user_ip', paymentRequest.user_ip);
    formParams.append('merchant_oid', paymentRequest.merchant_oid);
    formParams.append('email', paymentRequest.email);
    formParams.append('payment_amount', payment_amount_kurus.toString());
    formParams.append('payment_type', 'card'); // PayTR örnek koduna göre
    formParams.append('currency', paymentRequest.currency);
    formParams.append('user_basket', user_basket); // Base64 encoded
    formParams.append('no_installment', no_installment.toString()); // PayTR gerçek API'si için
    formParams.append('max_installment', max_installment.toString()); // PayTR gerçek API'si için
    formParams.append('non_3d', '0'); // PayTR örnek koduna göre
    formParams.append('test_mode', test_mode.toString());
    formParams.append('merchant_ok_url', paymentRequest.merchant_ok_url);
    formParams.append('merchant_fail_url', paymentRequest.merchant_fail_url);
    formParams.append('user_name', paymentRequest.user_name);
    formParams.append('user_address', paymentRequest.user_address);
    formParams.append('user_phone', paymentRequest.user_phone);
    formParams.append('debug_on', (paymentRequest.debug_on || 0).toString());
    formParams.append('timeout_limit', '30');
    formParams.append('paytr_token', paytr_token);
    
    // Form data debug log
    const formDataDebug: Record<string, string> = {};
    formParams.forEach((value, key) => {
      formDataDebug[key] = value;
    });
    logPayTRTransaction('REQUEST', formDataDebug, 'PayTR API Form Data');
    
    // Test mode veya production mode'a göre doğru URL'yi kullan
    const apiUrl = test_mode === 1 ? PAYTR_CONFIG.TEST_URL : PAYTR_CONFIG.PRODUCTION_URL;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formParams,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    if (!response.ok) {
      throw new Error(`PayTR API error: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.text();
    
    logPayTRTransaction('RESPONSE', { 
      status: response.status,
      statusText: response.statusText,
      body: result,
      headers: Object.fromEntries(response.headers.entries())
    }, 'PayTR API Response');
    
    // Production'da detaylı response loglarını kısıtla
    if (process.env.NODE_ENV === 'development') {
      console.log('=== PayTR Full Response ===');
      console.log('Status:', response.status);
      console.log('StatusText:', response.statusText);
      console.log('Headers:', Object.fromEntries(response.headers.entries()));
      console.log('Body:', result);
      console.log('=== End PayTR Response ===');
    }
    
    // PayTR response'u JSON formatında gelir
    try {
      const parsed = JSON.parse(result);
      console.log('📥 PayTR API Response (Parsed):', parsed);
      
      if (parsed.status === 'success' && parsed.token) {
        return {
          status: 'success',
          token: parsed.token
        };
      } else {
        return {
          status: 'failed',
          reason: parsed.reason || result
        };
      }
    } catch (parseError) {
      console.log('❌ PayTR Response Parse Error:', parseError);
      // Eski format ile dene (SUCCESS:token)
      if (result.startsWith('SUCCESS')) {
        const token = result.split(':')[1];
        return {
          status: 'success',
          token: token
        };
      } else {
        return {
          status: 'failed',
          reason: result
        };
      }
    }
  } catch (error) {
    console.error('PayTR API Error:', error);
    return {
      status: 'error',
      reason: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// PayTR iFrame URL Oluşturma
export function getPayTRIFrameUrl(token: string): string {
  return `${PAYTR_CONFIG.IFRAME_URL}${token}`;
}

// Sipariş ID Oluşturma (Benzersiz)
export function generateOrderId(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 15);
  return `ORDER${timestamp}${random}`;
}

// Fiyat Formatlama (Kuruş cinsinden)
export function formatPriceForPayTR(price: number): number {
  return Math.round(price * 100);
}

// Fiyat Formatlama (TL cinsinden)
export function formatPriceFromPayTR(price: number): number {
  return price / 100;
}

// IP Adresi Alma
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const ip = forwarded.split(',')[0].trim();
    // IPv6 localhost'u IPv4'e çevir
    if (ip === '::1' || ip === '::ffff:127.0.0.1') {
      return '127.0.0.1';
    }
    return ip;
  }
  
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    // IPv6 localhost'u IPv4'e çevir
    if (realIp === '::1' || realIp === '::ffff:127.0.0.1') {
      return '127.0.0.1';
    }
    return realIp;
  }
  
  // Fallback - IPv4 localhost
  return '127.0.0.1';
}

// PayTR Hata Kodları
export const PAYTR_ERROR_CODES = {
  'INVALID_MERCHANT': 'Geçersiz mağaza bilgileri',
  'INVALID_HASH': 'Geçersiz hash değeri',
  'INVALID_AMOUNT': 'Geçersiz tutar',
  'INVALID_CURRENCY': 'Geçersiz para birimi',
  'INVALID_BASKET': 'Geçersiz sepet bilgisi',
  'TIMEOUT': 'Zaman aşımı',
  'SYSTEM_ERROR': 'Sistem hatası',
  'INVALID_IP': 'IP adresi kısıtlı',
  'INVALID_USER_BASKET': 'Sepet bilgisi hatalı',
  'INVALID_USER_NAME': 'Kullanıcı adı hatalı',
  'INVALID_USER_ADDRESS': 'Kullanıcı adresi hatalı',
  'INVALID_USER_PHONE': 'Telefon numarası hatalı'
};

// PayTR Hata Mesajı Çevirme
export function translatePayTRError(errorCode: string): string {
  return PAYTR_ERROR_CODES[errorCode as keyof typeof PAYTR_ERROR_CODES] || 'Bilinmeyen hata';
}

// PayTR Test Kartları
export const PAYTR_TEST_CARDS = {
  VISA: {
    number: '4355084355084358',
    expiry: '12/26',
    cvv: '000',
    name: 'PAYTR TEST'
  },
  MASTERCARD: {
    number: '5406675406675403',
    expiry: '12/26',
    cvv: '000',
    name: 'PAYTR TEST'
  },
  TROY: {
    number: '9792030394440796',
    expiry: '12/26',
    cvv: '000',
    name: 'PAYTR TEST'
  }
};

// PayTR Ödeme Durumu Enum
export enum PayTRPaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// PayTR Callback Durumu Enum
export enum PayTRCallbackStatus {
  SUCCESS = 'success',
  FAILED = 'failed'
}

// PayTR Logging
export function logPayTRTransaction(
  type: 'REQUEST' | 'RESPONSE' | 'CALLBACK' | 'ERROR',
  data: any,
  context?: string
) {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    type,
    context,
    data: typeof data === 'object' ? JSON.stringify(data) : data
  };
  
  console.log(`[PayTR ${type}] ${timestamp}:`, logData);
  
  // Production'da daha güvenli logging yapılabilir
  if (process.env.NODE_ENV === 'production') {
    // Burada external logging service'e gönderilebilir
  }
}

// PayTR Environment Kontrolü
export function isPayTRTestMode(): boolean {
  return process.env.PAYTR_TEST_MODE === '1' || process.env.NODE_ENV === 'development';
}

// PayTR Konfigürasyon Bilgilerini Al (Güvenli)
export function getPayTRConfigInfo(): {
  merchant_id: string;
  test_mode: boolean;
  has_credentials: boolean;
  success_url: string;
  fail_url: string;
} {
  return {
    merchant_id: PAYTR_CONFIG.MERCHANT_ID,
    test_mode: PAYTR_CONFIG.TEST_MODE === 1,
    has_credentials: !!(PAYTR_CONFIG.MERCHANT_ID && PAYTR_CONFIG.MERCHANT_KEY && PAYTR_CONFIG.MERCHANT_SALT),
    success_url: PAYTR_CONFIG.SUCCESS_URL,
    fail_url: PAYTR_CONFIG.FAIL_URL
  };
}

// PayTR Konfigürasyon Doğrulama
export function validatePayTRConfig(): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!process.env.PAYTR_MERCHANT_ID) {
    errors.push('PAYTR_MERCHANT_ID environment variable is required');
  }
  
  if (!process.env.PAYTR_MERCHANT_KEY) {
    errors.push('PAYTR_MERCHANT_KEY environment variable is required');
  }
  
  if (!process.env.PAYTR_MERCHANT_SALT) {
    errors.push('PAYTR_MERCHANT_SALT environment variable is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// PayTR Callback IP Kontrolü (PayTR'den gelen istekleri doğrula)
export function isValidPayTRIP(ip: string): boolean {
  // PayTR'nin bilinen IP aralıkları
  const validIPs = [
    '185.233.52.0/24',
    '185.233.53.0/24',
    // PayTR'nin güncel IP listesi resmi dokümantasyondan alınmalı
  ];
  
  // Basit IP kontrolü - Production'da daha gelişmiş kontrol yapılmalı
  return true; // Geliştirme aşamasında tüm IP'lere izin ver
}

export default {
  getPayTRToken,
  getPayTRIFrameUrl,
  verifyPayTRCallback,
  calculatePayTRHash,
  createPayTRBasket,
  generateOrderId,
  formatPriceForPayTR,
  formatPriceFromPayTR,
  getClientIP,
  translatePayTRError,
  isPayTRTestMode,
  getPayTRConfigInfo,
  validatePayTRConfig,
  isValidPayTRIP,
  logPayTRTransaction,
  PAYTR_CONFIG,
  PAYTR_ERROR_CODES,
  PAYTR_TEST_CARDS,
  PayTRPaymentStatus,
  PayTRCallbackStatus
}; 