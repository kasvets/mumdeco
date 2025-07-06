import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { Database } from './supabase';

// Server-side Supabase client with auth context
export function createServerSupabaseClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return undefined;
        },
        set(name: string, value: string, options: any) {
          // Cookie handling is done in middleware
        },
        remove(name: string, options: any) {
          // Cookie handling is done in middleware
        },
      },
    }
  );
}

// For admin operations that require service role
export function createAdminSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables for server-side client');
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey);
}

// Singleton instance for admin operations
let _adminSupabase: SupabaseClient<Database> | null = null;

export function getServerSupabaseClient() {
  if (!_adminSupabase) {
    _adminSupabase = createAdminSupabaseClient();
  }
  return _adminSupabase;
}

// For build-time safety, only create client when actually needed
export function createServerSupabaseClientSafe() {
  try {
    return createServerSupabaseClient();
  } catch (error) {
    // During build time, return a mock client that will fail gracefully
    console.warn('Supabase server client not available during build time');
    return null;
  }
} 