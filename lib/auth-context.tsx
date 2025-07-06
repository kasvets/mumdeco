'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from './supabase-client'
import { supabaseConfig } from './env'

// Debug import
console.log('🔑 Auth Context: Imports loaded:', { 
  supabase: !!supabase, 
  supabaseConfig: !!supabaseConfig,
  React: !!React,
  useEffect: !!useEffect
})

interface AuthContextType {
  user: User | null
  userProfile: any | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  checkAndUpdateSession: () => Promise<void>
  updateUserProfile: (updates: any) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  // Kullanıcı profil bilgilerini al
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('📍 AUTH CONTEXT: Fetching profile for user:', userId)
      
      // Try to get session with timeout, fallback to user ID
      let authToken = userId; // Default fallback to user ID
      
      try {
        console.log('📍 AUTH CONTEXT: Trying to get session with timeout...')
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 1000)
        );
        
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        
        if (session?.access_token) {
          console.log('📍 AUTH CONTEXT: Got session token, using it')
          authToken = session.access_token;
        } else {
          console.log('📍 AUTH CONTEXT: No session token, using user ID')
        }
      } catch (sessionError: any) {
        console.log('📍 AUTH CONTEXT: Session failed/timeout, using user ID:', sessionError.message)
      }
      
      console.log('📍 AUTH CONTEXT: Making API call with token/ID...')
      const response = await fetch('/api/user/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('📍 AUTH CONTEXT: Profile fetched successfully via API:', data.full_name)
        setUserProfile(data)
      } else {
        console.error('📍 AUTH CONTEXT: API profile fetch failed:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('📍 AUTH CONTEXT: Profile fetch error:', error)
    }
  }

  // Google ile giriş
  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${supabaseConfig.siteUrl}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          scopes: 'openid email profile'
        }
      })
      
      if (error) {
        console.error('Google sign in error:', error)
        throw error
      }
    } catch (error) {
      console.error('Google auth error:', error)
      throw error
    }
  }

  // Çıkış yap
  const signOut = async () => {
    try {
      console.log('🔑 AUTH CONTEXT: Starting signOut...')
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('🔑 AUTH CONTEXT: Supabase signOut error:', error)
        throw error
      }
      
      console.log('🔑 AUTH CONTEXT: Supabase signOut successful, clearing state...')
      setUser(null)
      setUserProfile(null)
      console.log('🔑 AUTH CONTEXT: Auth state cleared')
      
    } catch (error) {
      console.error('🔑 AUTH CONTEXT: Sign out error:', error)
      throw error
    }
  }

  // Profil bilgilerini yenile
  const refreshProfile = async () => {
    console.log('🔄 AUTH CONTEXT: refreshProfile called, user:', user ? 'EXISTS' : 'NULL')
    if (user) {
      console.log('🔄 AUTH CONTEXT: Calling fetchUserProfile for user:', user.id)
      await fetchUserProfile(user.id)
    } else {
      console.log('❌ AUTH CONTEXT: Cannot refresh profile, user is null')
    }
  }

  // Local profil state'ini güncelle
  const updateUserProfile = (updates: any) => {
    console.log('🔄 AUTH CONTEXT: updateUserProfile called with:', updates)
    console.log('🔄 AUTH CONTEXT: Current userProfile:', userProfile)
    
    if (userProfile) {
      const newProfile = {
        ...userProfile,
        ...updates
      }
      console.log('🔄 AUTH CONTEXT: Setting new profile:', newProfile)
      setUserProfile(newProfile)
    } else {
      console.log('❌ AUTH CONTEXT: userProfile is null, cannot update')
    }
  }

  // Session'ı manuel olarak kontrol et ve state'i güncelle
  const checkAndUpdateSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Session check error:', error)
        return
      }
      
      if (session?.user) {
        setUser(session.user)
        await fetchUserProfile(session.user.id)
      } else {
        setUser(null)
        setUserProfile(null)
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Session check error:', error)
    }
  }

  // Auth state değişikliklerini dinle
  useEffect(() => {
    console.log('🔑 AUTH PROVIDER: useEffect RUNNING!')
    
    let mounted = true
    
    // Başlangıç session kontrolü
    const initializeAuth = async () => {
      try {
        console.log('🔑 AUTH PROVIDER: Getting initial session...')
        
        // Retry logic for session initialization
        let session = null;
        let error = null;
        
        for (let i = 0; i < 3; i++) {
          const result = await supabase.auth.getSession();
          session = result.data.session;
          error = result.error;
          
          if (session || error) break;
          
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        if (!mounted) return
        
        console.log('🔑 AUTH PROVIDER: Initial session result:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          userEmail: session?.user?.email,
          error: error
        })
        
        if (session?.user) {
          setUser(session.user)
          await fetchUserProfile(session.user.id)
        } else {
          setUser(null)
          setUserProfile(null)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('🔑 AUTH PROVIDER: Session init error:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }
    
    initializeAuth()

    // Auth state değişikliklerini dinle
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔑 AUTH PROVIDER: Auth state changed:', {
        event,
        user: session?.user ? 'Present' : 'Null',
        userId: session?.user?.id
      })
      
      if (!mounted) return
      
      setUser(session?.user ?? null)
      
      // Set loading to false immediately if we have a user
      if (session?.user) {
        setLoading(false)
        await fetchUserProfile(session.user.id)
      } else {
        setUserProfile(null)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const value = {
    user,
    userProfile,
    loading,
    signInWithGoogle,
    signOut,
    refreshProfile,
    checkAndUpdateSession,
    updateUserProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 