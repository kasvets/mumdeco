import { createBrowserClient } from '@supabase/ssr';
import { Database } from './supabase';

// Create Supabase client with environment variables and proper storage configuration
export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: {
        getItem: (key: string) => {
          if (typeof window !== 'undefined') {
            return localStorage.getItem(key);
          }
          return null;
        },
        setItem: (key: string, value: string) => {
          if (typeof window !== 'undefined') {
            localStorage.setItem(key, value);
          }
        },
        removeItem: (key: string) => {
          if (typeof window !== 'undefined') {
            localStorage.removeItem(key);
          }
        }
      },
      storageKey: 'supabase.auth.token',
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
); 