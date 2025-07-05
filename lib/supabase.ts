import { createClient } from '@supabase/supabase-js'
import { supabaseConfig, canUseSupabase, handleEnvError } from './env'

// Create Supabase client with error handling
export const supabase = (() => {
  try {
    if (!canUseSupabase()) {
      console.warn('Supabase not properly configured, using fallback');
      return createClient(supabaseConfig.url, supabaseConfig.anonKey);
    }
    return createClient(supabaseConfig.url, supabaseConfig.anonKey);
  } catch (error) {
    handleEnvError(error, 'Supabase initialization');
    // Return a mock client for build compatibility
    return createClient('https://example.supabase.co', 'dummy-key');
  }
})();

// Database types
export type Database = {
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
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching products:', error)
      handleEnvError(error, 'fetchProducts')
      return []
    }

    return data || []
  } catch (error) {
    handleEnvError(error, 'fetchProducts')
    return []
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
      handleEnvError(error, 'fetchProductById')
      return null
    }

    return data
  } catch (error) {
    handleEnvError(error, 'fetchProductById')
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
      handleEnvError(error, 'fetchProductsByCategory')
      return []
    }

    return data || []
  } catch (error) {
    handleEnvError(error, 'fetchProductsByCategory')
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
      handleEnvError(error, 'fetchNewProducts')
      return []
    }

    return data || []
  } catch (error) {
    handleEnvError(error, 'fetchNewProducts')
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
      handleEnvError(error, 'fetchFeaturedProducts')
      return []
    }

    return data || []
  } catch (error) {
    handleEnvError(error, 'fetchFeaturedProducts')
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
      handleEnvError(error, 'fetchCategories')
      return []
    }

    return data || []
  } catch (error) {
    handleEnvError(error, 'fetchCategories')
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
    // Unique filename oluştur
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `product-${productId || timestamp}-${timestamp}.${fileExtension}`;
    
    console.log('Uploading file:', fileName, 'Size:', file.size, 'bytes');
    
    // Upload to storage
    const { data, error } = await supabase.storage
      .from('products')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
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