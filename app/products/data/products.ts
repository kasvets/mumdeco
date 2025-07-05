import { supabase, Product } from '@/lib/supabase';

// Supabase'den ürünleri getir
export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('in_stock', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Ürünler yüklenirken hata:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Ürünler yüklenirken hata:', error);
    return [];
  }
};

// Kategoriye göre ürünleri getir
export const fetchProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .eq('in_stock', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Kategoriye göre ürünler yüklenirken hata:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Kategoriye göre ürünler yüklenirken hata:', error);
    return [];
  }
};

// Tek ürün getir
export const fetchProductById = async (id: number): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Ürün yüklenirken hata:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Ürün yüklenirken hata:', error);
    return null;
  }
};

// Yeni ürünleri getir
export const fetchNewProducts = async (limit: number = 10): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_new', true)
      .eq('in_stock', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Yeni ürünler yüklenirken hata:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Yeni ürünler yüklenirken hata:', error);
    return [];
  }
};

// Öne çıkan ürünleri getir (popüler/yeni olanlar)
export const fetchFeaturedProducts = async (limit: number = 10): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('in_stock', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Öne çıkan ürünler yüklenirken hata:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Öne çıkan ürünler yüklenirken hata:', error);
    return [];
  }
};

// Kategorileri getir
export const fetchCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Kategoriler yüklenirken hata:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Kategoriler yüklenirken hata:', error);
    return [];
  }
};

// Eski statik array'i kaldırdık - artık Supabase'den çekiyoruz
export const products: Product[] = []; 