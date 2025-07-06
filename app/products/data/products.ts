import { Product } from '@/lib/supabase';

// Base URL'i al (server-side ve client-side uyumlu)
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side
    return window.location.origin;
  }
  
  // Server-side
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Development fallback
  return 'http://localhost:3000';
};

// API route'ları kullanarak ürünleri getir (client-side uyumlu)
export async function fetchProducts(): Promise<Product[]> {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/debug/products`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    const data = await response.json();
    return data.products || [];

  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

// Kategoriye göre ürünleri getir
export const fetchProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/debug/products?category=${encodeURIComponent(category)}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch products by category');
    }

    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error('Kategoriye göre ürünler yüklenirken hata:', error);
    return [];
  }
};

// Tek ürün getir
export const fetchProductById = async (id: number): Promise<Product | null> => {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/debug/products/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }

    const data = await response.json();
    return data.product || null;
  } catch (error) {
    console.error('Ürün yüklenirken hata:', error);
    return null;
  }
};

// Yeni ürünleri getir
export const fetchNewProducts = async (limit: number = 10): Promise<Product[]> => {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/debug/products?new=true&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch new products');
    }

    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error('Yeni ürünler yüklenirken hata:', error);
    return [];
  }
};

// Öne çıkan ürünleri getir (popüler/yeni olanlar)
export const fetchFeaturedProducts = async (limit: number = 10): Promise<Product[]> => {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/debug/products?featured=true&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch featured products');
    }

    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error('Öne çıkan ürünler yüklenirken hata:', error);
    return [];
  }
};

// Kategorileri getir
export const fetchCategories = async () => {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/debug/categories`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    const data = await response.json();
    return data.categories || [];
  } catch (error) {
    console.error('Kategoriler yüklenirken hata:', error);
    return [];
  }
};

// Eski statik array'i kaldırdık - artık API route'lardan çekiyoruz
export const products: Product[] = []; 