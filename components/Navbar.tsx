'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useCart } from '@/lib/cart-context'
import UserProfileModal from './UserProfileModal'

const Navbar = () => {
  const { user, userProfile, loading } = useAuth();
  const { getTotalItems, getTotal } = useCart();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');

  // Debug: Auth state'i kontrol et
  useEffect(() => {
    console.log('🔍 NAVBAR: Auth state:', {
      loading,
      hasUser: !!user,
      userEmail: user?.email,
      hasUserProfile: !!userProfile,
      userProfileName: userProfile?.full_name,
      userMetadataName: user?.user_metadata?.full_name
    });
  }, [loading, user, userProfile]);
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle search submission
  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      setShowMobileSearch(false);
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback((query: string) => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length > 0) {
        handleSearch(query);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [router]);

  // Auto-search effect for desktop
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const cleanup = debouncedSearch(searchQuery);
      return cleanup;
    }
  }, [searchQuery, debouncedSearch]);

  // Auto-search effect for mobile
  useEffect(() => {
    if (mobileSearchQuery.trim().length > 0) {
      const cleanup = debouncedSearch(mobileSearchQuery);
      return cleanup;
    }
  }, [mobileSearchQuery, debouncedSearch]);

  // Handle search input submission
  const handleSearchSubmit = (e: React.FormEvent, isMobile: boolean = false) => {
    e.preventDefault();
    const query = isMobile ? mobileSearchQuery : searchQuery;
    handleSearch(query);
  };

  // Handle search input key press
  const handleSearchKeyPress = (e: React.KeyboardEvent, isMobile: boolean = false) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const query = isMobile ? mobileSearchQuery : searchQuery;
      handleSearch(query);
    }
  };

  // Handle search input changes
  const handleSearchChange = (value: string, isMobile: boolean = false) => {
    if (isMobile) {
      setMobileSearchQuery(value);
    } else {
      setSearchQuery(value);
    }
  };

  return (
    <div className={`fixed w-full top-0 z-50 transition-all duration-300 ${isScrolled ? 'translate-y-0' : ''}`}>
      {/* Top Banner - Enhanced mobile responsiveness */}
      <div className={`bg-black text-white transition-all duration-300 ${isScrolled ? 'h-0 overflow-hidden' : 'py-1.5 sm:py-2.5'}`}>
        <div className="container flex items-center justify-between max-w-[98%] mx-auto px-2 sm:px-4">
          {/* Left - Contact Info - Hidden on small mobile */}
          <div className="hidden sm:flex items-center space-x-3 lg:space-x-6">
            <Link href="tel:+905313552271" className="text-xs sm:text-sm hover:text-white/80 transition-colors flex items-center space-x-1 sm:space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="hidden md:inline">+90 531 355 22 71</span>
            </Link>
            <Link href="mailto:info@mumdeco.com" className="text-xs sm:text-sm hover:text-white/80 transition-colors flex items-center space-x-1 sm:space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="hidden lg:inline">info@mumdeco.com</span>
            </Link>
          </div>
          
          {/* Center - Scrolling Banner */}
          <div className="flex-1 flex items-center justify-center pl-32 pr-8 overflow-hidden relative" style={{
            maskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)'
          }}>
            <div className="animate-marquee whitespace-nowrap text-white flex" style={{
              animation: 'marquee 25s linear infinite'
            }}>
              <div className="flex items-center pr-96">
                <span className="mr-32">🔥 Mumdeco - Light The Way</span>
                <span className="mr-32">📦 24 saat içinde kargo</span>
                <span className="mr-32">🏷️ Çok yakında indirim kuponlarımızı buradan takip edebilirsiniz</span>
              </div>
              <div className="flex items-center pr-96">
                <span className="mr-32">🔥 Mumdeco - Light The Way</span>
                <span className="mr-32">📦 24 saat içinde kargo</span>
                <span className="mr-32">🏷️ Çok yakında indirim kuponlarımızı buradan takip edebilirsiniz</span>
              </div>
            </div>
          </div>

          {/* Right - Social Media - Simplified on mobile */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <a href="https://www.instagram.com/mumdecostudio/" target="_blank" rel="noopener noreferrer" className="hover:text-white/80 transition-colors p-1">
              <span className="sr-only">Instagram</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="https://wa.me/+905313552271" target="_blank" rel="noopener noreferrer" className="hover:text-white/80 transition-colors p-1">
              <span className="sr-only">WhatsApp</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className={`bg-white border-b border-gray-200 transition-all duration-300 ${isScrolled ? 'shadow-lg' : ''}`}>
        <div className={`container max-w-[98%] mx-auto px-2 sm:px-4 transition-all duration-300 ${isScrolled ? 'py-2 sm:py-3' : 'py-3 sm:py-6'}`}>
          <div className="flex items-center justify-between">
            {/* Logo - Responsive sizing */}
            <Link href="/" className="transition-all duration-300 ml-4 sm:ml-0">
              <Image
                src="/mumdeco_logo.png"
                alt="MUMDECO Logo"
                width={isScrolled ? 200 : 280}
                height={isScrolled ? 67 : 93}
                className={`transition-all duration-300 ${isScrolled ? 'w-40 h-auto sm:w-40 md:w-44' : 'w-44 h-auto sm:w-44 md:w-48'}`}
                priority
              />
            </Link>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-5xl mx-8 ml-16">
              <form onSubmit={(e) => handleSearchSubmit(e, false)} className="relative w-full group">
                <input
                  type="text"
                  placeholder="Ürün veya kategori ara..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value, false)}
                  onKeyPress={(e) => handleSearchKeyPress(e, false)}
                  className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-100 rounded-full focus:outline-none focus:border-primary/20 transition-all duration-200 text-base group-hover:border-primary/20"
                />
                <button
                  type="submit"
                  className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-auto cursor-pointer"
                >
                  <svg className="h-5 w-5 text-gray-400 group-hover:text-primary/60 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>
            </div>

            {/* Account & Cart - Mobile optimized */}
            <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6">
              {/* Mobile Search Button */}
              <button
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Account Button - Mobile responsive */}
              <button 
                onClick={() => setIsUserModalOpen(true)}
                className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 py-2 sm:py-3 px-2 sm:px-4 bg-white border border-black rounded-full hover:border-primary/20 hover:bg-primary/5 transition-all duration-200 group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" 
                  className="w-4 h-4 sm:w-5 sm:h-5 text-black group-hover:scale-110 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-xs sm:text-sm md:text-base hidden sm:inline">
                  {loading ? 'Yükleniyor...' : user ? (
                    userProfile?.full_name || 
                    user.user_metadata?.full_name || 
                    user.email?.split('@')[0] || 
                    'Hesabım'
                  ) : 'Hesabım'}
                </span>
              </button>

              {/* Cart Button - Mobile responsive */}
              <Link href="/cart" className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 py-2 sm:py-3 px-2 sm:px-4 bg-white border border-black rounded-full hover:border-primary/20 hover:bg-primary/5 transition-all duration-200 group">
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" 
                    className="w-4 h-4 sm:w-5 sm:h-5 text-black group-hover:scale-110 transition-transform">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-3 h-3 sm:w-4 sm:h-4 bg-primary text-white text-xs flex items-center justify-center rounded-full">
                      {getTotalItems()}
                    </span>
                  )}
                </div>
                <span className="text-xs sm:text-sm md:text-base font-medium hidden sm:inline">
                  {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(getTotal())}
                </span>
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="sr-only">Menü</span>
                {!isOpen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {showMobileSearch && (
            <div className="md:hidden mt-4 animate-in slide-in-from-top-1 duration-200">
              <form onSubmit={(e) => handleSearchSubmit(e, true)} className="relative">
                <input
                  type="text"
                  placeholder="Ürün ara..."
                  value={mobileSearchQuery}
                  onChange={(e) => handleSearchChange(e.target.value, true)}
                  onKeyPress={(e) => handleSearchKeyPress(e, true)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-full focus:outline-none focus:border-primary/20 focus:bg-white transition-all duration-200 text-base"
                />
                <button
                  type="submit"
                  className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-auto cursor-pointer"
                >
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>
            </div>
          )}

          {/* Separator Line */}
          <div className={`hidden md:block h-[1px] bg-gray-100 transition-all duration-300 ${isScrolled ? 'my-2' : 'my-6'}`}></div>

          {/* Desktop Categories Navigation */}
          <div className="hidden md:flex items-center justify-center">
            <div className="flex items-center space-x-16">
              <Link href="/" className="text-xl font-serif font-medium hover:text-primary transition-colors relative group">
                Anasayfa
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </Link>
              <Link href="/products" className="text-xl font-serif font-medium hover:text-primary transition-colors relative group">
                Ürünler
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </Link>
              <Link href="/about" className="text-xl font-serif font-medium hover:text-primary transition-colors relative group">
                Hakkımızda
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </Link>
              <Link href="/blog" className="text-xl font-serif font-medium hover:text-primary transition-colors relative group">
                Blog
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </Link>
            </div>
          </div>

          {/* Mobile Menu */}
          <div className={`md:hidden transition-all duration-300 overflow-hidden ${
            isOpen ? 'max-h-screen opacity-100 visible mt-4' : 'max-h-0 opacity-0 invisible'
          }`}>
            <div className="py-4 space-y-4 bg-gray-50 rounded-lg border border-gray-200">
              {/* Mobile Navigation Links */}
              <div className="space-y-2 px-4">
                <Link href="/" className="block text-lg font-serif font-medium hover:text-primary py-3 px-3 rounded-lg hover:bg-white transition-all">
                  Anasayfa
                </Link>
                <Link href="/products" className="block text-lg font-serif font-medium hover:text-primary py-3 px-3 rounded-lg hover:bg-white transition-all">
                  Ürünler
                </Link>
                <Link href="/about" className="block text-lg font-serif font-medium hover:text-primary py-3 px-3 rounded-lg hover:bg-white transition-all">
                  Hakkımızda
                </Link>
                <Link href="/blog" className="block text-lg font-serif font-medium hover:text-primary py-3 px-3 rounded-lg hover:bg-white transition-all">
                  Blog
                </Link>
              </div>

              {/* Mobile Contact Info */}
              <div className="pt-4 pb-2 px-4 border-t border-gray-200 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>+90 531 355 22 71</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>info@mumdeco.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      {/* User Profile Modal */}
      <UserProfileModal 
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
      />
    </div>
  )
}

export default Navbar
