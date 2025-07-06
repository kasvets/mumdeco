'use client';

import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, MapPin, Heart, Package, CreditCard, Settings, LogOut, Edit2, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase-client';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

  const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, userProfile, loading: authLoading, signInWithGoogle, signOut, refreshProfile, checkAndUpdateSession } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [forceRender, setForceRender] = useState(0);


  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [editedEmail, setEditedEmail] = useState('');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [editedPhone, setEditedPhone] = useState('');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editedAddress, setEditedAddress] = useState({
    address_line1: '',
    city: '',
    district: '',
  });
  const [userAddress, setUserAddress] = useState<any>(null);
  
  // Form state'leri
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  
  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  // Helper function to get valid authentication token
  const getValidAuthToken = async () => {
    try {
      // First try to get token from current Supabase session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session error:', error);
        throw new Error('Oturum hatası. Lütfen tekrar giriş yapın.');
      }

      if (session?.access_token) {
        // Verify token is still valid
        const now = Math.floor(Date.now() / 1000);
        const tokenExp = session.expires_at || 0;
        
        if (tokenExp > now) {
          // Token is valid
          return session.access_token;
        } else {
          // Token expired, try to refresh
          const { data: refreshedSession, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError || !refreshedSession.session?.access_token) {
            throw new Error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
          }
          
          return refreshedSession.session.access_token;
        }
      }

      // Fallback to localStorage session (for email/password login)
      const storedSession = localStorage.getItem('auth_session');
      if (storedSession) {
        try {
          const sessionData = JSON.parse(storedSession);
          if (sessionData.access_token) {
            return sessionData.access_token;
          }
        } catch (error) {
          console.error('Session parse error:', error);
          // Let Supabase handle session cleanup
        }
      }

      throw new Error('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
    } catch (error: any) {
      console.error('Token retrieval error:', error);
      throw error;
    }
  };
  
  // Kullanıcı adres bilgilerini çek
  const fetchUserAddress = async () => {
    if (!user) return;
    
    try {
      // Sadece Google auth için adres bilgisi çek
      // Manuel login için skip et
      if (!user.app_metadata?.provider || user.app_metadata.provider !== 'google') {
        console.log('Manual login detected, skipping address fetch');
        return;
      }

      const token = await getValidAuthToken();

      const response = await fetch('/api/user/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        // Token expired or invalid - sadece log et, hata atma
        console.log('Token expired or invalid, skipping address fetch');
        return; // Hata atmak yerine sessizce çık
      }

      if (response.ok) {
        const data = await response.json();
        if (data.addresses && data.addresses.length > 0) {
          setUserAddress(data.addresses[0]); // İlk adresi al
        }
      }
    } catch (error: any) {
      // Tüm hataları sessizce yakala
      console.log('Address fetch skipped:', error.message);
      // Hata state'ini set etme - sadece log et
    }
  };

  // Auth state'e göre modal durumunu ayarla
  useEffect(() => {
    console.log('AUTH STATE EFFECT - User:', !!user, 'Tab:', activeTab, 'Success:', success);
    
    if (user) {
      // Kullanıcı giriş yapmış - profil sekmesine geç
      setActiveTab('profile');
      setIsLoading(false);
      fetchUserAddress();
      
      // Başarılı giriş sonrası success mesajını temizle
      if (success && (success.includes('Giriş başarılı!') || success.includes('Google ile giriş başarılı'))) {
        setTimeout(() => setSuccess(null), 3000);
      }
    } else {
      // Kullanıcı giriş yapmamış - login sekmesine geç
      setActiveTab('login');
      setIsLoading(false);
      
      // Logout success mesajını kontrol et
      if (success && success.includes('Başarıyla çıkış yapıldı')) {
        setTimeout(() => setSuccess(null), 3000);
      }
    }
  }, [user, userProfile, success, isLoggingOut]);

  // Logout tamamlandığında özel handling
  useEffect(() => {
    if (isLoggingOut && !user) {
      console.log('LOGOUT COMPLETE - Setting success message');
      setSuccess('Başarıyla çıkış yapıldı.');
      setActiveTab('login');
      setIsLoggingOut(false);
      setForceRender(prev => prev + 1);
      
      // Success mesajını 4 saniye sonra temizle
      setTimeout(() => {
        setSuccess(null);
      }, 4000);
    }
  }, [isLoggingOut, user]);

  // Modal açıldığında sadece error'ı temizle (success mesajını koruyalım)
  useEffect(() => {
    if (isOpen) {
      setError(null);
      // setSuccess(null); - Logout mesajı gösterilmesi için success'i temizlemeyelim
    }
  }, [isOpen]);

  // API çağrıları
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      // Mevcut sayfayı kaydet (modal kapatıldığında geri dönmek için)
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_return_url', window.location.pathname + window.location.search);
        console.log('Saved return URL for manual login:', window.location.pathname + window.location.search);
      }

      // Sadece client-side Supabase auth kullan
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
      });

      if (authError) {
        console.error('Login error:', authError);
        
        // Türkçe hata mesajları
        let errorMessage = 'Giriş sırasında bir hata oluştu.';
        
        if (authError.message.includes('Invalid login credentials')) {
          errorMessage = 'E-posta veya şifre hatalı.';
        } else if (authError.message.includes('Email not confirmed')) {
          errorMessage = 'E-posta adresinizi doğrulamanız gerekiyor.';
        } else if (authError.message.includes('too many requests')) {
          errorMessage = 'Çok fazla giriş denemesi. Lütfen daha sonra tekrar deneyin.';
        }
        
        throw new Error(errorMessage);
      }

      if (!authData.user) {
        throw new Error('Giriş yapılamadı. Lütfen tekrar deneyin.');
      }

      // Başarılı giriş
      console.log('Login successful:', authData.user.email);
      setSuccess('Giriş başarılı!');
      
      // Formu temizle
      setLoginForm({
        email: '',
        password: '',
        rememberMe: false,
      });

      // Auth state değişikliği useEffect'te yakalanacak ve otomatik olarak profil sekmesine geçecek

    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    // Form validasyonu
    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      setIsLoading(false);
      return;
    }

    if (!registerForm.acceptTerms) {
      setError('Kullanım koşullarını kabul etmelisiniz.');
      setIsLoading(false);
      return;
    }

    // Şifre uzunluğu kontrolü
    if (registerForm.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      setIsLoading(false);
      return;
    }

    try {
      // Mevcut sayfayı kaydet (kayıt sonrası geri dönmek için)
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_return_url', window.location.pathname + window.location.search);
        console.log('Saved return URL for register:', window.location.pathname + window.location.search);
      }
      
      // Sadece client-side Supabase auth kullan
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: registerForm.email,
        password: registerForm.password,
        options: {
          data: {
            full_name: registerForm.fullName,
            phone: registerForm.phone || null,
          },
        },
      });

      if (authError) {
        console.error('Register error:', authError);
        
        // Türkçe hata mesajları
        let errorMessage = 'Kayıt sırasında bir hata oluştu.';
        
        if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
          errorMessage = 'Bu e-posta adresi zaten kayıtlı.';
        } else if (authError.message.includes('invalid email')) {
          errorMessage = 'Geçersiz e-posta adresi.';
        } else if (authError.message.includes('password')) {
          errorMessage = 'Şifre çok zayıf. Lütfen daha güçlü bir şifre seçin.';
        }
        
        throw new Error(errorMessage);
      }

      // Başarılı kayıt
      console.log('Registration successful:', authData.user?.email);
      setSuccess('Kayıt başarılı! E-posta adresinize doğrulama linki gönderildi.');
      
      // Formu temizle
      setRegisterForm({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false,
      });

      // Giriş sekmesine geç
      setTimeout(() => {
        setActiveTab('login');
      }, 2000);

    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Google ile giriş
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Mevcut sayfayı kaydet (redirect için)
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_return_url', window.location.pathname + window.location.search);
        console.log('Saved return URL:', window.location.pathname + window.location.search);
      }
      
      await signInWithGoogle();
      setSuccess('Google ile giriş başarılı!');
    } catch (error: any) {
      setError(error.message || 'Google ile giriş yapılamadı.');
      setIsLoading(false);
    }
    // Loading'i burada bitirme - auth tamamlandığında bitecek
  };

  const handleLogout = async () => {
    // Prevent multiple clicks
    if (isLoading) {
      console.log('🚪 LOGOUT: Already in progress, ignoring...');
      return;
    }
    
    console.log('🚪 LOGOUT: handleLogout called');
    setIsLoading(true);
    setIsLoggingOut(true);
    setError(null);
    
    // Set a timeout to force logout completion
    const forceLogoutTimeout = setTimeout(() => {
      console.log('🚪 LOGOUT: Force completing logout due to timeout');
      onClose();
      console.log('🚪 LOGOUT: Redirecting to home due to timeout...');
      window.location.href = '/';
    }, 3000); // 3 seconds timeout
    
    try {
      console.log('🚪 LOGOUT: Starting logout process...');
      console.log('🚪 LOGOUT: Current user before logout:', user ? user.email : 'No user');
      
             // NUCLEAR OPTION: Complete session destruction
       console.log('🚪 LOGOUT: Starting nuclear session cleanup...');
       
       // 1. Close modal immediately
       onClose();
       
       // 2. Clear ALL storage types
       if (typeof window !== 'undefined') {
         // Clear localStorage completely
         localStorage.clear();
         
         // Clear sessionStorage
         sessionStorage.clear();
         
         // Clear all cookies
         document.cookie.split(";").forEach((c) => {
           document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
         });
         
         console.log('🚪 LOGOUT: All storage cleared');
       }
       
       // 3. Try Supabase signOut (but don't wait for it)
       signOut().catch(error => {
         console.log('🚪 LOGOUT: Supabase signOut error (ignoring):', error);
       });
       
       // 4. Force redirect to home page instead of reload
       console.log('🚪 LOGOUT: Redirecting to home page...');
       window.location.href = '/';
       
       // Clear timeout since we completed successfully
       clearTimeout(forceLogoutTimeout);
       
       // No need for other logic, we're reloading the page
      
    } catch (error: any) {
      console.error('🚪 LOGOUT: Logout error:', error);
      clearTimeout(forceLogoutTimeout);
      
      // Close modal and redirect on error too
      onClose();
      console.log('🚪 LOGOUT: Redirecting to home after error...');
      window.location.href = '/';
    } finally {
      // Page will reload, no need to set loading state
      console.log('🚪 LOGOUT: Logout process completed');
    }
  };

  // İsim düzenleme işlemini başlat
  const handleEditName = () => {
    setIsEditingName(true);
    setEditedName(userProfile?.full_name || user?.user_metadata?.full_name || '');
    setError(null);
    setSuccess(null);
  };

  // İsim güncelleme işlemini kaydet
  const handleSaveName = async () => {
    if (!editedName.trim() || editedName.trim().length < 2) {
      setError('Ad soyad en az 2 karakter olmalıdır.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const token = await getValidAuthToken();

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: editedName.trim(),
        }),
      });

      if (response.status === 401) {
        throw new Error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Profil güncellenemedi');
      }

      setSuccess('İsminiz başarıyla güncellendi.');
      setIsEditingName(false);
      
      // Profil bilgilerini yenile
      await refreshProfile();
      
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // İsim düzenlemeyi iptal et
  const handleCancelEditName = () => {
    setIsEditingName(false);
    setEditedName('');
    setError(null);
    setSuccess(null);
  };

  // E-posta düzenleme işlemini başlat
  const handleEditEmail = () => {
    setIsEditingEmail(true);
    setEditedEmail(user?.email || '');
    setError(null);
    setSuccess(null);
  };

  // E-posta güncelleme işlemini kaydet
  const handleSaveEmail = async () => {
    if (!editedEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editedEmail)) {
      setError('Geçerli bir e-posta adresi girin.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const token = await getValidAuthToken();

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: editedEmail.trim(),
        }),
      });

      if (response.status === 401) {
        throw new Error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'E-posta güncellenemedi');
      }

      setSuccess('E-postanız başarıyla güncellendi.');
      setIsEditingEmail(false);
      
      await refreshProfile();
      
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // E-posta düzenlemeyi iptal et
  const handleCancelEditEmail = () => {
    setIsEditingEmail(false);
    setEditedEmail('');
    setError(null);
    setSuccess(null);
  };

  // Telefon düzenleme işlemini başlat
  const handleEditPhone = () => {
    setIsEditingPhone(true);
    setEditedPhone(userProfile?.phone || '');
    setError(null);
    setSuccess(null);
  };

  // Telefon güncelleme işlemini kaydet
  const handleSavePhone = async () => {
    if (editedPhone.trim() && editedPhone.trim().length < 10) {
      setError('Geçerli bir telefon numarası girin.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const token = await getValidAuthToken();

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone: editedPhone.trim(),
        }),
      });

      if (response.status === 401) {
        throw new Error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Telefon güncellenemedi');
      }

      setSuccess('Telefon numaranız başarıyla güncellendi.');
      setIsEditingPhone(false);
      
      await refreshProfile();
      
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Telefon düzenlemeyi iptal et
  const handleCancelEditPhone = () => {
    setIsEditingPhone(false);
    setEditedPhone('');
    setError(null);
    setSuccess(null);
  };

  // Adres düzenleme işlemini başlat
  const handleEditAddress = () => {
    setIsEditingAddress(true);
    setEditedAddress({
      address_line1: userAddress?.address_line1 || '',
      city: userAddress?.city || '',
      district: userAddress?.district || '',
    });
    setError(null);
    setSuccess(null);
  };

  // Adres güncelleme işlemini kaydet
  const handleSaveAddress = async () => {
    if (!editedAddress.address_line1.trim() || editedAddress.address_line1.trim().length < 10) {
      setError('Adres en az 10 karakter olmalıdır.');
      return;
    }

    if (!editedAddress.city.trim()) {
      setError('Şehir bilgisi gereklidir.');
      return;
    }

    if (!editedAddress.district.trim()) {
      setError('İlçe bilgisi gereklidir.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const token = await getValidAuthToken();

      const response = await fetch('/api/user/address', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          address_line1: editedAddress.address_line1.trim(),
          city: editedAddress.city.trim(),
          district: editedAddress.district.trim(),
        }),
      });

      if (response.status === 401) {
        throw new Error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Adres güncellenemedi');
      }

      setSuccess('Adresiniz başarıyla güncellendi.');
      setIsEditingAddress(false);
      
      // Adres bilgisini yeniden çek
      await fetchUserAddress();
      
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Adres düzenlemeyi iptal et
  const handleCancelEditAddress = () => {
    setIsEditingAddress(false);
    setEditedAddress({
      address_line1: '',
      city: '',
      district: '',
    });
    setError(null);
    setSuccess(null);
  };

  // Geçici kullanıcı verisi (kullanıcı giriş yapmışsa gerçek veri kullanılacak)
  const mockUser = {
    name: 'Ahmet Yılmaz',
    email: 'ahmet@example.com',
    phone: '+90 532 123 45 67',
    address: 'Atatürk Cad. No:123, Kadıköy/İstanbul',
    memberSince: '2023'
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Modal kapatırken mesajları temizle
  const handleClose = () => {
    setError(null);
    setSuccess(null);
    setIsLoading(false);
    setIsLoggingOut(false);
    
    // Editing state'lerini temizle
    setIsEditingName(false);
    setIsEditingEmail(false);
    setIsEditingPhone(false);
    setIsEditingAddress(false);
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div 
        key={`modal-${forceRender}-${user?.id || 'nouser'}-${activeTab}`}
        className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-2xl font-serif font-medium">
            {user ? 'Hesabım' : 'Giriş Yap'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className={`mb-4 p-4 rounded-lg border-2 ${
              success.includes('Başarıyla çıkış yapıldı') 
                ? 'bg-blue-50 border-blue-300 shadow-lg' 
                : 'bg-green-50 border-green-200'
            }`}>
              <p className={`text-sm font-bold ${
                success.includes('Başarıyla çıkış yapıldı') 
                  ? 'text-blue-800' 
                  : 'text-green-800'
              }`}>
                {success}
              </p>
            </div>
          )}

          {!user ? (
            /* Login/Register Tabs */
            <div>
              <div className="flex mb-6 bg-gray-50 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('login')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'login' 
                      ? 'bg-white text-black shadow-sm' 
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  Giriş Yap
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'register' 
                      ? 'bg-white text-black shadow-sm' 
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  Kayıt Ol
                </button>
              </div>

              {activeTab === 'login' ? (
                /* Login Form */
                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Google Login Button */}
                  <button 
                    type="button" 
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center space-x-3 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-sm font-medium text-gray-700">
                      {isLoading ? 'Google\'a yönlendiriliyor...' : 'Google ile giriş yap'}
                    </span>
                  </button>
                  
                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">veya</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      E-posta
                    </label>
                    <input
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="ornek@email.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Şifre
                    </label>
                    <input
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        className="mr-2"
                        checked={loginForm.rememberMe}
                        onChange={(e) => setLoginForm({...loginForm, rememberMe: e.target.checked})}
                      />
                      <span className="text-sm text-gray-600">Beni hatırla</span>
                    </label>
                    <button type="button" className="text-sm text-black hover:underline">
                      Şifremi unuttum
                    </button>
                  </div>
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Giriş yapılıyor...
                      </>
                    ) : (
                      'Giriş Yap'
                    )}
                  </button>
                </form>
              ) : (
                /* Register Form */
                <form onSubmit={handleRegister} className="space-y-4">
                  {/* Google Register Button */}
                  <button 
                    type="button" 
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center space-x-3 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-sm font-medium text-gray-700">
                      {isLoading ? 'Google\'a yönlendiriliyor...' : 'Google ile kayıt ol'}
                    </span>
                  </button>
                  
                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">veya</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ad Soyad
                    </label>
                    <input
                      type="text"
                      value={registerForm.fullName}
                      onChange={(e) => setRegisterForm({...registerForm, fullName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Adınız Soyadınız"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      E-posta
                    </label>
                    <input
                      type="email"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="ornek@email.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      value={registerForm.phone}
                      onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="+90 5XX XXX XX XX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Şifre
                    </label>
                    <input
                      type="password"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Şifre Tekrar
                    </label>
                    <input
                      type="password"
                      value={registerForm.confirmPassword}
                      onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="mr-2"
                      checked={registerForm.acceptTerms}
                      onChange={(e) => setRegisterForm({...registerForm, acceptTerms: e.target.checked})}
                      required
                    />
                    <span className="text-sm text-gray-600">
                      <a href="#" className="text-black hover:underline">Kullanım koşulları</a>nı kabul ediyorum
                    </span>
                  </label>
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Kayıt yapılıyor...
                      </>
                    ) : (
                      'Kayıt Ol'
                    )}
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* User Profile */
            <div>
              {/* User Info */}
              <div className="flex items-start space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                  {(userProfile?.avatar_url || user?.user_metadata?.avatar_url) ? (
                    <img 
                      src={userProfile?.avatar_url || user?.user_metadata?.avatar_url} 
                      alt="Profil resmi"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Resim yüklenemezse fallback'e geç
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML = '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>';
                        }
                      }}
                    />
                  ) : (
                    <User className="w-8 h-8 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {isEditingName ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="w-full text-lg font-medium border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="Ad Soyad"
                        autoFocus
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSaveName}
                          disabled={isLoading}
                          className="bg-black text-white px-3 py-1 rounded text-sm hover:bg-gray-800 disabled:opacity-50"
                        >
                          {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                        <button
                          onClick={handleCancelEditName}
                          className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300"
                        >
                          İptal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-lg truncate">{userProfile?.full_name || user?.user_metadata?.full_name || mockUser.name}</h3>
                        <p className="text-gray-600 text-sm truncate">{user?.email || mockUser.email}</p>
                      </div>
                      <button
                        onClick={handleEditName}
                        className="text-gray-400 hover:text-gray-600 ml-2 flex-shrink-0"
                        title="İsmi düzenle"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <Package className="w-5 h-5 text-gray-600" />
                  <span className="text-sm">Siparişlerim</span>
                </button>
                <button className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <Heart className="w-5 h-5 text-gray-600" />
                  <span className="text-sm">Favorilerim</span>
                </button>
                <button className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                  <span className="text-sm">Ödeme</span>
                </button>
                <button className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <Settings className="w-5 h-5 text-gray-600" />
                  <span className="text-sm">Ayarlar</span>
                </button>
              </div>

              {/* User Details */}
              <div className="space-y-4 mb-6">
                {/* E-posta */}
                <div className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <div className="flex-1">
                      {isEditingEmail ? (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">E-posta</p>
                          <input
                            type="email"
                            value={editedEmail}
                            onChange={(e) => setEditedEmail(e.target.value)}
                            className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                            placeholder="ornek@email.com"
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={handleSaveEmail}
                              disabled={isLoading}
                              className="bg-black text-white px-2 py-1 rounded text-xs hover:bg-gray-800 disabled:opacity-50"
                            >
                              {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
                            </button>
                            <button
                              onClick={handleCancelEditEmail}
                              className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-300"
                            >
                              İptal
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">E-posta</p>
                            <p className="text-xs text-gray-600">{user?.email || mockUser.email}</p>
                          </div>
                          <button
                            onClick={handleEditEmail}
                            className="text-gray-400 hover:text-gray-600"
                            title="E-postayı düzenle"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Telefon */}
                <div className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <div className="flex-1">
                      {isEditingPhone ? (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Telefon</p>
                          <input
                            type="tel"
                            value={editedPhone}
                            onChange={(e) => setEditedPhone(e.target.value)}
                            className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                            placeholder="+90 5XX XXX XX XX"
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={handleSavePhone}
                              disabled={isLoading}
                              className="bg-black text-white px-2 py-1 rounded text-xs hover:bg-gray-800 disabled:opacity-50"
                            >
                              {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
                            </button>
                            <button
                              onClick={handleCancelEditPhone}
                              className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-300"
                            >
                              İptal
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">Telefon</p>
                            <p className="text-xs text-gray-600">{userProfile?.phone || mockUser.phone}</p>
                          </div>
                          <button
                            onClick={handleEditPhone}
                            className="text-gray-400 hover:text-gray-600"
                            title="Telefonu düzenle"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Adres */}
                <div className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <div className="flex-1">
                      {isEditingAddress ? (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Adres</p>
                          <input
                            type="text"
                            value={editedAddress.address_line1}
                            onChange={(e) => setEditedAddress({
                              ...editedAddress,
                              address_line1: e.target.value
                            })}
                            className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                            placeholder="Adres bilgilerinizi girin..."
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={editedAddress.city}
                              onChange={(e) => setEditedAddress({
                                ...editedAddress,
                                city: e.target.value
                              })}
                              className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                              placeholder="Şehir"
                            />
                            <input
                              type="text"
                              value={editedAddress.district}
                              onChange={(e) => setEditedAddress({
                                ...editedAddress,
                                district: e.target.value
                              })}
                              className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                              placeholder="İlçe"
                            />
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={handleSaveAddress}
                              disabled={isLoading}
                              className="bg-black text-white px-2 py-1 rounded text-xs hover:bg-gray-800 disabled:opacity-50"
                            >
                              {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
                            </button>
                            <button
                              onClick={handleCancelEditAddress}
                              className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-300"
                            >
                              İptal
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">Adres</p>
                            <p className="text-xs text-gray-600">
                              {userAddress 
                                ? `${userAddress.address_line1}, ${userAddress.district}/${userAddress.city}`
                                : 'Adres bilgisi yok'
                              }
                            </p>
                          </div>
                          <button
                            onClick={handleEditAddress}
                            className="text-gray-400 hover:text-gray-600"
                            title="Adresi düzenle"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Logout */}
              <button 
                onClick={handleLogout}
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <LogOut className="w-5 h-5" />
                )}
                <span>{isLoading ? 'Çıkış yapılıyor...' : 'Çıkış Yap'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal; 