'use client';

import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, MapPin, Heart, Package, CreditCard, Settings, LogOut, Edit2, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabaseClient } from '@/lib/supabase-client';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, userProfile, loading: authLoading, signInWithGoogle, signOut, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
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
  
  // Kullanıcı adres bilgilerini çek
  const fetchUserAddress = async () => {
    if (!user) return;
    
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      const token = session?.access_token || localStorage.getItem('auth_token');
      
      if (!token) return;

      const response = await fetch('/api/user/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.addresses && data.addresses.length > 0) {
          setUserAddress(data.addresses[0]); // İlk adresi al
        }
      }
    } catch (error) {
      console.error('Address fetch error:', error);
    }
  };

  // Auth state'e göre modal durumunu ayarla
  useEffect(() => {
    if (user && userProfile) {
      // Kullanıcı giriş yapmış - direkt profil sekmesine geç
      setActiveTab('profile');
      setIsLoading(false);
      fetchUserAddress(); // Adres bilgisini çek
    } else {
      // Kullanıcı giriş yapmamış
      setActiveTab('login');
      setIsLoading(false);
    }
  }, [user, userProfile]);

  // API çağrıları
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginForm.email,
          password: loginForm.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Giriş yapılamadı');
      }

      // Başarılı giriş
      setSuccess(data.message);
      
      // Token'ı localStorage'a kaydet
      if (data.session.access_token) {
        localStorage.setItem('auth_token', data.session.access_token);
      }
      
      // Formu temizle
      setLoginForm({
        email: '',
        password: '',
        rememberMe: false,
      });

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

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: registerForm.fullName,
          email: registerForm.email,
          phone: registerForm.phone,
          password: registerForm.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Kayıt yapılamadı');
      }

      // Başarılı kayıt
      setSuccess(data.message);
      
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
      await signInWithGoogle();
      // Success mesajını burada gösterme - auth state change'de gösterilecek
    } catch (error: any) {
      setError(error.message || 'Google ile giriş yapılamadı.');
      setIsLoading(false);
    }
    // Loading'i burada bitirme - auth tamamlandığında bitecek
  };

  const handleLogout = async () => {
    setIsLoading(true);
    
    try {
      await signOut();
      setSuccess('Çıkış yapıldı.');
    } catch (error: any) {
      setError('Çıkış yapılırken hata oluştu.');
    } finally {
      setIsLoading(false);
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
      // Supabase session'ından token'ı al
      const { data: { session } } = await supabaseClient.auth.getSession();
      const token = session?.access_token || localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
      }

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
      const { data: { session } } = await supabaseClient.auth.getSession();
      const token = session?.access_token || localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
      }

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
      const { data: { session } } = await supabaseClient.auth.getSession();
      const token = session?.access_token || localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
      }

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
      const { data: { session } } = await supabaseClient.auth.getSession();
      const token = session?.access_token || localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
      }

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
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
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
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">{success}</p>
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
                className="w-full flex items-center justify-center space-x-2 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Çıkış Yap</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal; 