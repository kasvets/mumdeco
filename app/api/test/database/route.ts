import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // Environment variables kontrolü
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        error: 'Environment variables missing',
        details: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseKey,
        }
      }, { status: 500 });
    }

    // Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test database connection
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);

    if (error) {
      return NextResponse.json({
        error: 'Database connection failed',
        details: error.message,
        suggestion: 'Please run the fix-user-setup.sql file in Supabase SQL Editor'
      }, { status: 500 });
    }

    // Test auth
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    
    return NextResponse.json({
      message: 'Database connection successful',
      database: {
        status: 'connected',
        userProfiles: 'accessible'
      },
      auth: {
        status: authError ? 'error' : 'connected',
        userCount: authData?.users?.length || 0
      },
      environment: {
        supabaseUrl: supabaseUrl.substring(0, 20) + '...',
        hasServiceKey: !!supabaseKey
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      error: 'Test failed',
      details: error.message
    }, { status: 500 });
  }
} 