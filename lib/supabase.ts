import { createClient } from '@supabase/supabase-js'
import { supabaseConfig, canUseSupabase } from './env'

// Create Supabase client with strict validation
export const supabase = (() => {
  try {
    // Validate configuration
    if (!canUseSupabase()) {
      throw new Error('Invalid Supabase configuration. Please check your environment variables.');
    }
    
    // Create client with validated config
    const client = createClient(supabaseConfig.url, supabaseConfig.anonKey);
    console.log('✅ Supabase client initialized successfully');
    return client;
    
  } catch (error) {
    console.error('❌ Supabase initialization failed:', error);
    throw error; // Let the application handle the error
  }
})();

// Test connection function
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('products').select('count', { count: 'exact', head: true });
    return !error;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
};

// Database types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: number
          name: string
          description: string | null
          price: number
          old_price: number | null
          category: string
          image_url: string | null
          is_new: boolean
          in_stock: boolean
          active: boolean
          rating: number | null
          reviews: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          price: number
          old_price?: number | null
          category: string
          image_url?: string | null
          is_new?: boolean
          in_stock?: boolean
          active?: boolean
          rating?: number | null
          reviews?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          price?: number
          old_price?: number | null
          category?: string
          image_url?: string | null
          is_new?: boolean
          in_stock?: boolean
          active?: boolean
          rating?: number | null
          reviews?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: number
          name: string
          slug: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          slug: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          description?: string | null
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: number
          order_id: string
          user_id: string | null
          status: string
          total_amount: number
          currency: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          customer_address: string | null
          customer_ip: string | null
          payment_method: string
          payment_status: string
          billing_address: string | null
          billing_city: string | null
          billing_district: string | null
          billing_zip_code: string | null
          shipping_address: string | null
          shipping_city: string | null
          shipping_district: string | null
          shipping_zip_code: string | null
          shipping_company: string | null
          tracking_number: string | null
          shipping_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          order_id: string
          user_id?: string | null
          status?: string
          total_amount: number
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          customer_address?: string | null
          customer_ip?: string | null
          payment_method?: string
          payment_status?: string
          billing_address?: string | null
          billing_city?: string | null
          billing_district?: string | null
          billing_zip_code?: string | null
          shipping_address?: string | null
          shipping_city?: string | null
          shipping_district?: string | null
          shipping_zip_code?: string | null
          shipping_company?: string | null
          tracking_number?: string | null
          shipping_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          order_id?: string
          user_id?: string | null
          status?: string
          total_amount?: number
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          customer_address?: string | null
          customer_ip?: string | null
          payment_method?: string
          payment_status?: string
          billing_address?: string | null
          billing_city?: string | null
          billing_district?: string | null
          billing_zip_code?: string | null
          shipping_address?: string | null
          shipping_city?: string | null
          shipping_district?: string | null
          shipping_zip_code?: string | null
          shipping_company?: string | null
          tracking_number?: string | null
          shipping_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: number
          order_id: number
          product_id: number | null
          product_name: string
          product_price: number
          unit_price: number
          quantity: number
          total_price: number
          created_at: string
        }
        Insert: {
          id?: number
          order_id: number
          product_id?: number | null
          product_name: string
          product_price: number
          unit_price: number
          quantity?: number
          total_price: number
          created_at?: string
        }
        Update: {
          id?: number
          order_id?: number
          product_id?: number | null
          product_name?: string
          product_price?: number
          unit_price?: number
          quantity?: number
          total_price?: number
          created_at?: string
        }
      }
      paytr_payments: {
        Row: {
          id: number
          merchant_oid: string
          order_id: number
          user_token: string | null
          paytr_token: string | null
          total_amount: number
          currency: string
          status: string
          callback_data: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          merchant_oid: string
          order_id: number
          user_token?: string | null
          paytr_token?: string | null
          total_amount: number
          currency?: string
          status?: string
          callback_data?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          merchant_oid?: string
          order_id?: number
          user_token?: string | null
          paytr_token?: string | null
          total_amount?: number
          currency?: string
          status?: string
          callback_data?: any | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Product = Database['public']['Tables']['products']['Row']
export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type ProductUpdate = Database['public']['Tables']['products']['Update']
export type Category = Database['public']['Tables']['categories']['Row']

// Fetch functions with error handling
export async function fetchProducts(): Promise<Product[]> {
  try {
    console.log('🔄 lib/supabase: fetchProducts started');
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ lib/supabase: Error fetching products:', error)
      throw error // Re-throw instead of returning empty array
    }

    console.log('✅ lib/supabase: fetchProducts success:', data?.length || 0, 'products');
    return data || []
  } catch (error) {
    console.error('❌ lib/supabase: fetchProducts error:', error)
    throw error // Re-throw instead of returning empty array
  }
}

export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching product:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in fetchProductById:', error)
    return null
  }
}

export async function fetchProductsByCategory(category: string): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching products by category:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in fetchProductsByCategory:', error)
    return []
  }
}

export async function fetchNewProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_new', true)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching new products:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in fetchNewProducts:', error)
    return []
  }
}

export async function fetchFeaturedProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('in_stock', true)
      .order('rating', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching featured products:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in fetchFeaturedProducts:', error)
    return []
  }
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching categories:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in fetchCategories:', error)
    return []
  }
}

// Storage helper functions
// Check if storage bucket exists
export const checkStorageBucket = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.storage.getBucket('products');
    return !error && data !== null;
  } catch (error) {
    console.error('Error checking bucket:', error);
    return false;
  }
};

export const uploadProductImage = async (file: File, productId?: number): Promise<string | null> => {
  try {
    // Benzersiz filename oluştur - timestamp + random string
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const fileExtension = file.name.split('.').pop();
    const fileName = `product-${productId || timestamp}-${timestamp}-${randomSuffix}.${fileExtension}`;
    
    console.log('Uploading file:', fileName, 'Size:', file.size, 'bytes');
    
    // Upload to storage with upsert true to handle conflicts
    const { data, error } = await supabase.storage
      .from('products')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Storage upload error details:', {
        message: error.message,
        error: error,
        fileName: fileName,
        fileSize: file.size,
        fileType: file.type
      });
      throw new Error(`Storage upload failed: ${error.message || 'Unknown error'}`);
    }

    if (!data) {
      throw new Error('Upload successful but no data returned');
    }

    console.log('Upload successful:', data);

    // Get public URL
    const { data: publicData } = supabase.storage
      .from('products')
      .getPublicUrl(fileName);

    if (!publicData?.publicUrl) {
      throw new Error('Failed to get public URL');
    }

    console.log('Public URL generated:', publicData.publicUrl);
    return publicData.publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    throw error; // Re-throw to handle in component
  }
};

export const deleteProductImage = async (imageUrl: string): Promise<boolean> => {
  try {
    // URL'den filename'i çıkar
    const filename = imageUrl.split('/').pop();
    if (!filename) return false;

    const { error } = await supabase.storage
      .from('products')
      .remove([filename]);

    if (error) {
      console.error('Storage delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
};

// Fetch all images for a specific product from storage
export const fetchProductImages = async (productId: string): Promise<string[]> => {
  try {
    console.log('🔍 Fetching images for product ID:', productId);
    
    const { data, error } = await supabase.storage
      .from('products')
      .list('', {
        limit: 100,
        offset: 0,
      });

    if (error) {
      console.error('❌ Error fetching product images:', error);
      return [];
    }

    if (!data) {
      console.log('⚠️ No data returned from storage');
      return [];
    }

    console.log('📁 All files in storage:', data.map(f => f.name));

    // Filter files that start with "product-{productId}-"
    // New pattern: product-{productId}-{timestamp}-{randomSuffix}.{extension}
    const filteredFiles = data.filter(file => {
      const matches = file.name.startsWith(`product-${productId}-`) && file.name.includes('-');
      if (matches) {
        console.log('✅ Found matching file:', file.name);
      }
      return matches;
    });

    console.log('🎯 Filtered files for product', productId, ':', filteredFiles.map(f => f.name));

    if (filteredFiles.length === 0) {
      console.log('⚠️ No images found for product', productId);
      return [];
    }

    const productImages = filteredFiles
      .map(file => {
        const { data: publicData } = supabase.storage
          .from('products')
          .getPublicUrl(file.name);
        console.log('🔗 Generated URL for', file.name, ':', publicData.publicUrl);
        return publicData.publicUrl;
      })
      .filter(url => url); // Remove any null/undefined URLs

    console.log('✅ Final product images:', productImages);
    return productImages;
  } catch (error) {
    console.error('❌ Error fetching product images:', error);
    return [];
  }
};

// Fetch orphaned images (images that don't follow the product-{id}- pattern)
export const fetchOrphanedImages = async (): Promise<{url: string, filename: string}[]> => {
  try {
    const { data, error } = await supabase.storage
      .from('products')
      .list('', {
        limit: 100,
        offset: 0,
      });

    if (error) {
      console.error('Error fetching orphaned images:', error);
      return [];
    }

    if (!data) {
      return [];
    }

    // Find files that start with "product-" but don't match the product-{id}-{timestamp}-{randomSuffix} pattern
    const orphanedFiles = data.filter(file => {
      const name = file.name;
      if (!name.startsWith('product-')) return false;
      
      // Check if it matches product-{id}-{timestamp}-{randomSuffix} pattern where {id} is a number
      const match = name.match(/^product-(\d+)-(\d+)-([a-z0-9]+)\./);
      if (match) {
        const [, id, timestamp] = match;
        // If the ID and timestamp are the same, it's likely an orphaned file (old pattern)
        return id === timestamp;
      }
      
      // Also check for old pattern: product-{timestamp}-{timestamp}
      const oldMatch = name.match(/^product-(\d+)-(\d+)\./);
      if (oldMatch) {
        const [, id, timestamp] = oldMatch;
        return id === timestamp;
      }
      
      return false;
    });

    console.log('🔍 Orphaned files found:', orphanedFiles.map(f => f.name));

    const orphanedImages = orphanedFiles
      .map(file => {
        const { data: publicData } = supabase.storage
          .from('products')
          .getPublicUrl(file.name);
        return {
          url: publicData.publicUrl,
          filename: file.name
        };
      })
      .filter(item => item.url);

    return orphanedImages;
  } catch (error) {
    console.error('Error fetching orphaned images:', error);
    return [];
  }
}; 