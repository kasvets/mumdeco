'use client';

import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, MapPin, Package, LogOut, Edit2, Loader2, ArrowLeft, Calendar, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase-client';

interface OrderItem {
  id: number;
  product_id: number | null;
  product_name: string;
  product_price: number;
  unit_price: number;
  quantity: number;
  total_price: number;
  products?: {
    image_url: string;
  } | null;
}

interface Order {
  id: number;
  order_id: string;
  user_id: string | null;
  status: string;
  total_amount: number;
  currency: string;
  customer_email: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  payment_method: string;
  payment_status: string;
  shipping_company: string | null;
  tracking_number: string | null;
  shipping_date: string | null;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
}

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, userProfile, loading: authLoading, signInWithGoogle, signOut, refreshProfile, checkAndUpdateSession, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [forceRender, setForceRender] = useState(0);
  const [showOrders, setShowOrders] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

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

  const getValidAuthToken = async () => {
    try {
      console.log('🔑 Getting auth token...');
      
      // Use auth context user directly instead of getSession
      if (!user) {
        console.log('❌ No user in auth context');
        throw new Error('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
      }

      console.log('🔑 User found in context:', {
        hasUser: !!user,
        userEmail: user?.email,
        provider: user?.app_metadata?.provider || 'email'
      });

      // Try multiple token sources
      console.log('🔑 Trying multiple token sources...');
      
      // Method 1: Try localStorage first (fastest)
      const authKeys = ['supabase.auth.token', 'sb-auth-token'];
      for (const key of authKeys) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const parsed = JSON.parse(stored);
            const token = parsed.access_token || parsed.accessToken;
            if (token) {
              console.log('✅ Using localStorage token from:', key);
              return token;
            }
          }
        } catch (e) {
          console.log('🔑 localStorage key failed:', key);
        }
      }

      // Method 2: Try session storage
      try {
        const sessionStored = sessionStorage.getItem('supabase.auth.token');
        if (sessionStored) {
          const parsed = JSON.parse(sessionStored);
          if (parsed.access_token) {
            console.log('✅ Using sessionStorage token');
            return parsed.access_token;
          }
        }
      } catch (e) {
        console.log('🔑 sessionStorage failed');
      }

      // Method 3: Try to get from current auth state (with timeout)
      console.log('🔑 Trying getSession with timeout...');
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Session timeout')), 2000)
      );
      
      try {
        const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        
        if (!error && session?.access_token) {
          console.log('✅ Using session token');
          return session.access_token;
        }
      } catch (sessionError) {
        console.log('🔑 Session call failed:', sessionError);
      }

      // Method 4: Return user ID as fallback (for server-side auth)
      console.log('🔑 Using user ID as fallback auth');
      return user.id;
      
    } catch (error: any) {
      console.error('🔑 Token retrieval error:', error);
      throw error;
    }
  };
  
  const fetchUserAddress = async () => {
    if (!user) return;
    
    try {
      console.log('📍 Fetching user address/profile...');
      const token = await getValidAuthToken();

      const response = await fetch('/api/user/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📍 Profile fetch response:', {
        status: response.status,
        ok: response.ok
      });

      if (response.status === 401) {
        console.log('📍 Token expired or invalid, skipping address fetch');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        console.log('📍 Profile data received:', data);
        
        // Check if profile has address data
        if (data.address_line1 || data.city || data.district) {
          console.log('📍 Setting user address from profile data');
          setUserAddress({
            address_line1: data.address_line1 || '',
            city: data.city || '',
            district: data.district || '',
            updated_at: data.updated_at
          });
        } else {
          console.log('📍 No address data found in profile');
          setUserAddress(null);
        }
      } else {
        console.log('📍 Profile fetch failed:', response.status);
      }
    } catch (error: any) {
      console.log('📍 Address fetch error:', error.message);
    }
  };

  const fetchUserOrders = async () => {
    if (!user) return;
    
    setOrdersLoading(true);
    try {
      console.log('📦 Fetching user orders...');
      const token = await getValidAuthToken();

      const response = await fetch('/api/user/orders', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📦 Orders fetch response:', {
        status: response.status,
        ok: response.ok
      });

      if (response.status === 401) {
        console.log('📦 Token expired or invalid, skipping orders fetch');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        console.log('📦 Orders data received:', data);
        setOrders(data.orders || []);
      } else {
        console.log('📦 Orders fetch failed:', response.status);
      }
    } catch (error: any) {
      console.log('📦 Orders fetch error:', error.message);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleShowOrders = () => {
    setShowOrders(true);
    fetchUserOrders();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Yeni Sipariş';
      case 'processing': return 'Hazırlanıyor';
      case 'shipped': return 'Kargoya Verildi';
      case 'delivered': return 'Teslim Edildi';
      case 'cancelled': return 'İptal Edildi';
      default: return status;
    }
  };

  useEffect(() => {
    console.log('AUTH STATE EFFECT - User:', !!user, 'Tab:', activeTab, 'Success:', success);
    
    if (user) {
      setActiveTab('profile');
      setIsLoading(false);
      setError(null);
      fetchUserAddress();
      
      if (success && (success.includes('Giriş başarılı!') || success.includes('Google ile giriş başarılı'))) {
        setTimeout(() => {
          setSuccess(null);
        }, 2000);
      }
    } else {
      setActiveTab('login');
      setIsLoading(false);
      
      if (success && success.includes('Başarıyla çıkış yapıldı')) {
        setTimeout(() => setSuccess(null), 3000);
      }
    }
  }, [user, userProfile]);

  useEffect(() => {
    if (isLoggingOut && !user) {
      console.log('LOGOUT COMPLETE - Setting success message');
      setSuccess('Başarıyla çıkış yapıldı.');
      setActiveTab('login');
      setIsLoggingOut(false);
      setIsLoading(false);
      setForceRender(prev => prev + 1);
      
      setTimeout(() => {
        setSuccess(null);
      }, 4000);
    }
  }, [isLoggingOut, user]);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (user) {
        setIsLoading(false);
      }
    }
  }, [isOpen, user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_return_url', window.location.pathname + window.location.search);
        console.log('Saved return URL for manual login:', window.location.pathname + window.location.search);
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
      });

      if (authError) {
        console.error('Login error:', authError);
        
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

      console.log('Login successful:', authData.user.email);
      setSuccess('Giriş başarılı!');
      
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

    if (registerForm.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      setIsLoading(false);
      return;
    }

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_return_url', window.location.pathname + window.location.search);
        console.log('Saved return URL for register:', window.location.pathname + window.location.search);
      }
      
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

      console.log('Registration successful:', authData.user?.email);
      setSuccess('Kayıt başarılı! E-posta adresinize doğrulama linki gönderildi.');
      
      setRegisterForm({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false,
      });

      setTimeout(() => {
        setActiveTab('login');
      }, 2000);

    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_return_url', window.location.pathname + window.location.search);
        console.log('Saved return URL:', window.location.pathname + window.location.search);
      }
      
      await signInWithGoogle();
    } catch (error: any) {
      setError(error.message || 'Google ile giriş yapılamadı.');
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (isLoading) {
      console.log('🚪 LOGOUT: Already in progress, ignoring...');
      return;
    }
    
    console.log('🚪 LOGOUT: handleLogout called');
    setIsLoading(true);
    setIsLoggingOut(true);
    setError(null);
    
    const forceLogoutTimeout = setTimeout(() => {
      console.log('🚪 LOGOUT: Force completing logout due to timeout');
      onClose();
      console.log('🚪 LOGOUT: Redirecting to home due to timeout...');
      window.location.href = '/';
    }, 3000);
    
    try {
      console.log('🚪 LOGOUT: Starting logout process...');
      console.log('🚪 LOGOUT: Current user before logout:', user ? user.email : 'No user');
      
      console.log('🚪 LOGOUT: Starting nuclear session cleanup...');
      
      onClose();
      
      if (typeof window !== 'undefined') {
        localStorage.clear();
        
        sessionStorage.clear();
        
        document.cookie.split(";").forEach((c) => {
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        
        console.log('🚪 LOGOUT: All storage cleared');
      }
      
      signOut().catch(error => {
        console.log('🚪 LOGOUT: Supabase signOut error (ignoring):', error);
      });
      
      console.log('🚪 LOGOUT: Redirecting to home page...');
      window.location.href = '/';
      
      clearTimeout(forceLogoutTimeout);
      
    } catch (error: any) {
      console.error('🚪 LOGOUT: Logout error:', error);
      clearTimeout(forceLogoutTimeout);
      
      onClose();
      console.log('🚪 LOGOUT: Redirecting to home after error...');
      window.location.href = '/';
    } finally {
      console.log('🚪 LOGOUT: Logout process completed');
    }
  };

  const handleEditName = () => {
    setIsEditingName(true);
    setEditedName(userProfile?.full_name || user?.user_metadata?.full_name || '');
    setError(null);
    setSuccess(null);
  };

  const handleSaveName = async () => {
    if (!editedName.trim() || editedName.trim().length < 2) {
      setError('Ad soyad en az 2 karakter olmalıdır.');
      return;
    }

    console.log('💾 Starting name save process...');
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('💾 Getting auth token for name update...');
      const token = await getValidAuthToken();
      console.log('💾 Token obtained:', token ? 'YES' : 'NO');

      // Test API connection first
      console.log('🧪 Testing API connection...');
      try {
        const testResponse = await fetch('/api/test', { method: 'GET' });
        console.log('🧪 Test API response:', testResponse.status);
      } catch (testError) {
        console.log('🧪 Test API failed:', testError);
      }

      console.log('💾 Making main API request...');
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

      console.log('💾 API response received:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (response.status === 401) {
        throw new Error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
      }

      let data;
      try {
        const responseText = await response.text();
        console.log('💾 Raw response text:', responseText);
        
        if (responseText) {
          data = JSON.parse(responseText);
        } else {
          data = {};
        }
      } catch (parseError) {
        console.error('💾 JSON parse error:', parseError);
        throw new Error('Sunucu yanıtı geçersiz. Lütfen tekrar deneyin.');
      }
      
      console.log('💾 API response data:', data);

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('✅ Name update successful');
      setSuccess('İsminiz başarıyla güncellendi.');
      setIsEditingName(false);
      
      // Update local user profile state immediately
      console.log('🔄 Updating local userProfile state...');
      updateUserProfile({
        full_name: editedName.trim(),
        updated_at: new Date().toISOString()
      });
      
      console.log('🔄 Refreshing profile...');
      await refreshProfile();
      
    } catch (error: any) {
      console.error('❌ Name save error:', error);
      setError(error.message || 'Beklenmeyen bir hata oluştu.');
    } finally {
      console.log('💾 Name save process completed');
      setIsLoading(false);
    }
  };

  const handleCancelEditName = () => {
    setIsEditingName(false);
    setEditedName('');
    setError(null);
    setSuccess(null);
  };

  const handleEditEmail = () => {
    setIsEditingEmail(true);
    setEditedEmail(user?.email || '');
    setError(null);
    setSuccess(null);
  };

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

  const handleCancelEditEmail = () => {
    setIsEditingEmail(false);
    setEditedEmail('');
    setError(null);
    setSuccess(null);
  };

  const handleEditPhone = () => {
    setIsEditingPhone(true);
    setEditedPhone(userProfile?.phone || '');
    setError(null);
    setSuccess(null);
  };

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
      
      // Update local user profile state immediately
      console.log('🔄 Updating local userProfile state for phone...');
      updateUserProfile({
        phone: editedPhone.trim(),
        updated_at: new Date().toISOString()
      });
      
      await refreshProfile();
      
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEditPhone = () => {
    setIsEditingPhone(false);
    setEditedPhone('');
    setError(null);
    setSuccess(null);
  };

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

      const response = await fetch('/api/user/profile', {
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
      
      // Update local address state immediately
      console.log('🔄 Updating local userAddress state...');
      setUserAddress({
        ...userAddress,
        address_line1: editedAddress.address_line1.trim(),
        city: editedAddress.city.trim(),
        district: editedAddress.district.trim(),
        updated_at: new Date().toISOString()
      });
      
      await fetchUserAddress();
      
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleClose = () => {
    setError(null);
    setSuccess(null);
    setIsLoading(false);
    setIsLoggingOut(false);
    
    setIsEditingName(false);
    setIsEditingEmail(false);
    setIsEditingPhone(false);
    setIsEditingAddress(false);
    
    setShowOrders(false);
    setOrders([]);
    
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
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-2xl font-serif font-medium">
            {user ? (showOrders ? 'Siparişlerim' : 'Hesabım') : 'Giriş Yap'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
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
                <form onSubmit={handleLogin} className="space-y-4">
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
                <form onSubmit={handleRegister} className="space-y-4">
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
          ) : showOrders ? (
            <div>
              {/* Orders Header */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setShowOrders(false)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="text-sm font-medium">Geri Dön</span>
                </button>
                <h2 className="text-xl font-bold text-gray-800">Siparişlerim</h2>
                <div className="w-16"></div> {/* Spacer */}
              </div>

              {/* Orders Content */}
              {ordersLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                  <span className="ml-2 text-gray-600">Siparişler yükleniyor...</span>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">Henüz siparişiniz yok</p>
                  <p className="text-gray-400 text-sm mt-2">İlk siparişinizi vermek için alışverişe başlayın!</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      {/* Order Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-mono text-sm font-medium text-gray-900">#{order.order_id}</h3>
                          <p className="text-xs text-gray-500 flex items-center mt-1">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                          <p className="text-sm font-bold text-gray-900 mt-1">{formatPrice(order.total_amount)}</p>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="space-y-2">
                        {order.order_items.slice(0, 2).map((item) => (
                          <div key={item.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-md">
                            {item.products?.image_url ? (
                              <img
                                src={item.products.image_url}
                                alt={item.product_name}
                                className="w-10 h-10 rounded-md object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
                                <Package className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{item.product_name}</p>
                              <p className="text-xs text-gray-500">{item.quantity} adet × {formatPrice(item.unit_price)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">{formatPrice(item.total_price)}</p>
                            </div>
                          </div>
                        ))}
                        {order.order_items.length > 2 && (
                          <div className="text-center py-1">
                            <p className="text-xs text-gray-500">+{order.order_items.length - 2} daha fazla ürün</p>
                          </div>
                        )}
                      </div>

                      {/* Shipping Info */}
                      {order.status === 'shipped' && (order.shipping_company || order.tracking_number) && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center justify-between text-sm">
                            {order.shipping_company && (
                              <span className="text-gray-600">
                                <strong>Kargo:</strong> {order.shipping_company}
                              </span>
                            )}
                            {order.tracking_number && (
                              <span className="text-gray-600 font-mono">
                                <strong>Takip:</strong> {order.tracking_number}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-start space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                  {(userProfile?.avatar_url || user?.user_metadata?.avatar_url) ? (
                    <img 
                      src={userProfile?.avatar_url || user?.user_metadata?.avatar_url} 
                      alt="Profil resmi"
                      className="w-full h-full object-cover"
                      onError={(e) => {
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

              <div className="flex justify-center mb-6">
                <button 
                  onClick={handleShowOrders}
                  className="flex items-center space-x-3 px-6 py-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-md"
                >
                  <Package className="w-6 h-6 text-white" />
                  <span className="text-base font-medium">Siparişlerim</span>
                </button>
              </div>

              <div className="space-y-4 mb-6">
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