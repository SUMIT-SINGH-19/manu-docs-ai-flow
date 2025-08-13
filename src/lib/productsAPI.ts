// Products API service for database operations
import { supabase } from './supabase';

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  iconName: string;
  imageUrl?: string;
  productCount: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  hsCode: string;
  popularity: number;
  trending: boolean;
  documentsRequired: number;
  thumbnailUrl?: string;
  regions: string[];
}

export interface DocumentRequirement {
  id: string;
  name: string;
  description: string;
  isRequired: boolean;
  canAutoFill: boolean;
  estimatedTime: string;
}

export interface ProductDetails {
  id: string;
  name: string;
  description: string;
  hsCode: string;
  categoryName: string;
  regions: string[];
  documents: DocumentRequirement[];
}

class ProductsAPI {
  // Get all categories with product counts
  async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase.rpc('get_categories');
      
      if (error) {
        console.error('Error fetching categories:', error);
        throw new Error(`Failed to fetch categories: ${error.message}`);
      }

      return (data || []).map((item: any) => ({
        id: item.id,
        slug: item.slug,
        name: item.name,
        description: item.description || '',
        iconName: item.icon_name || 'Package',
        imageUrl: item.image_url,
        productCount: parseInt(item.product_count) || 0
      }));
    } catch (error) {
      console.error('Categories API error:', error);
      throw error;
    }
  }

  // Get products by category
  async getProductsByCategory(categorySlug: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase.rpc('get_products_by_category', {
        category_slug: categorySlug
      });
      
      if (error) {
        console.error('Error fetching products:', error);
        throw new Error(`Failed to fetch products: ${error.message}`);
      }

      return (data || []).map((item: any) => ({
        id: item.id,
        slug: item.slug,
        name: item.name,
        description: item.description || '',
        hsCode: item.hs_code || '',
        popularity: item.popularity || 0,
        trending: item.is_trending || false,
        documentsRequired: item.documents_required || 0,
        thumbnailUrl: item.thumbnail_url,
        regions: item.regions || []
      }));
    } catch (error) {
      console.error('Products API error:', error);
      throw error;
    }
  }

  // Get product details with documents
  async getProductDetails(categorySlug: string, productSlug: string): Promise<ProductDetails | null> {
    try {
      const { data, error } = await supabase.rpc('get_product_details', {
        category_slug: categorySlug,
        product_slug: productSlug
      });
      
      if (error) {
        console.error('Error fetching product details:', error);
        throw new Error(`Failed to fetch product details: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return null;
      }

      const item = data[0];
      return {
        id: item.id,
        name: item.name,
        description: item.description || '',
        hsCode: item.hs_code || '',
        categoryName: item.category_name || '',
        regions: item.regions || [],
        documents: (item.documents || []).map((doc: any) => ({
          id: doc.id,
          name: doc.name,
          description: doc.description || '',
          isRequired: doc.isRequired || false,
          canAutoFill: doc.canAutoFill || false,
          estimatedTime: doc.estimatedTime || 'Unknown'
        }))
      };
    } catch (error) {
      console.error('Product details API error:', error);
      throw error;
    }
  }

  // Search products across all categories
  async searchProducts(query: string, limit: number = 20): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          slug,
          name,
          description,
          hs_code,
          popularity,
          is_trending,
          documents_required,
          thumbnail_url,
          categories!inner(slug, name),
          product_regions(region_name)
        `)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,hs_code.ilike.%${query}%`)
        .eq('is_active', true)
        .order('popularity', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error searching products:', error);
        throw new Error(`Failed to search products: ${error.message}`);
      }

      return (data || []).map((item: any) => ({
        id: item.id,
        slug: item.slug,
        name: item.name,
        description: item.description || '',
        hsCode: item.hs_code || '',
        popularity: item.popularity || 0,
        trending: item.is_trending || false,
        documentsRequired: item.documents_required || 0,
        thumbnailUrl: item.thumbnail_url,
        regions: (item.product_regions || []).map((r: any) => r.region_name)
      }));
    } catch (error) {
      console.error('Search products API error:', error);
      throw error;
    }
  }

  // Get trending products across all categories
  async getTrendingProducts(limit: number = 10): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          slug,
          name,
          description,
          hs_code,
          popularity,
          is_trending,
          documents_required,
          thumbnail_url,
          categories!inner(slug, name),
          product_regions(region_name)
        `)
        .eq('is_trending', true)
        .eq('is_active', true)
        .order('popularity', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching trending products:', error);
        throw new Error(`Failed to fetch trending products: ${error.message}`);
      }

      return (data || []).map((item: any) => ({
        id: item.id,
        slug: item.slug,
        name: item.name,
        description: item.description || '',
        hsCode: item.hs_code || '',
        popularity: item.popularity || 0,
        trending: item.is_trending || false,
        documentsRequired: item.documents_required || 0,
        thumbnailUrl: item.thumbnail_url,
        regions: (item.product_regions || []).map((r: any) => r.region_name)
      }));
    } catch (error) {
      console.error('Trending products API error:', error);
      throw error;
    }
  }

  // Get category by slug
  async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        console.error('Error fetching category:', error);
        throw new Error(`Failed to fetch category: ${error.message}`);
      }

      return {
        id: data.id,
        slug: data.slug,
        name: data.name,
        description: data.description || '',
        iconName: data.icon_name || 'Package',
        imageUrl: data.image_url,
        productCount: 0 // Will be populated separately if needed
      };
    } catch (error) {
      console.error('Category API error:', error);
      throw error;
    }
  }

  // Get statistics
  async getStatistics() {
    try {
      const [categoriesResult, productsResult, trendingResult] = await Promise.all([
        supabase.from('categories').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('products').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('products').select('id', { count: 'exact' }).eq('is_trending', true).eq('is_active', true)
      ]);

      return {
        totalCategories: categoriesResult.count || 0,
        totalProducts: productsResult.count || 0,
        trendingProducts: trendingResult.count || 0
      };
    } catch (error) {
      console.error('Statistics API error:', error);
      return {
        totalCategories: 0,
        totalProducts: 0,
        trendingProducts: 0
      };
    }
  }
}

export const productsAPI = new ProductsAPI();