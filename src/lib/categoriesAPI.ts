// Categories API service for database operations
import { supabase } from './supabase';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconUrl?: string;
  imageUrl?: string;
  sortOrder: number;
  productCount: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price?: number;
  imageUrl?: string;
  sortOrder: number;
  categoryName: string;
}

class CategoriesAPI {
  // Get all active categories with product counts
  async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase.rpc('get_categories_with_counts');
      
      if (error) {
        console.error('Error fetching categories:', error);
        throw new Error(`Failed to fetch categories: ${error.message}`);
      }

      return (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        description: item.description || '',
        iconUrl: item.icon_url,
        imageUrl: item.image_url,
        sortOrder: item.sort_order || 0,
        productCount: parseInt(item.product_count) || 0
      }));
    } catch (error) {
      console.error('Categories API error:', error);
      throw error;
    }
  }

  // Get category by slug
  async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      const { data, error } = await supabase.rpc('get_category_by_slug', {
        category_slug: slug
      });
      
      if (error) {
        console.error('Error fetching category:', error);
        throw new Error(`Failed to fetch category: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return null;
      }

      const item = data[0];
      return {
        id: item.id,
        name: item.name,
        slug: item.slug,
        description: item.description || '',
        iconUrl: item.icon_url,
        imageUrl: item.image_url,
        sortOrder: 0,
        productCount: 0 // Will be fetched separately if needed
      };
    } catch (error) {
      console.error('Category API error:', error);
      throw error;
    }
  }

  // Get products by category slug
  async getProductsByCategory(categorySlug: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase.rpc('get_products_by_category_slug', {
        category_slug: categorySlug
      });
      
      if (error) {
        console.error('Error fetching products:', error);
        throw new Error(`Failed to fetch products: ${error.message}`);
      }

      return (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        description: item.description || '',
        shortDescription: item.short_description,
        price: item.price ? parseFloat(item.price) : undefined,
        imageUrl: item.image_url,
        sortOrder: item.sort_order || 0,
        categoryName: item.category_name || ''
      }));
    } catch (error) {
      console.error('Products API error:', error);
      throw error;
    }
  }

  // Check if category exists and has products
  async getCategoryInfo(categorySlug: string): Promise<{
    category: Category | null;
    products: Product[];
    hasProducts: boolean;
  }> {
    try {
      const [category, products] = await Promise.all([
        this.getCategoryBySlug(categorySlug),
        this.getProductsByCategory(categorySlug)
      ]);

      return {
        category,
        products,
        hasProducts: products.length > 0
      };
    } catch (error) {
      console.error('Category info API error:', error);
      throw error;
    }
  }

  // Search categories
  async searchCategories(query: string): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .eq('is_active', true)
        .order('sort_order');

      if (error) {
        console.error('Error searching categories:', error);
        throw new Error(`Failed to search categories: ${error.message}`);
      }

      return (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        description: item.description || '',
        iconUrl: item.icon_url,
        imageUrl: item.image_url,
        sortOrder: item.sort_order || 0,
        productCount: 0 // Not calculated in search
      }));
    } catch (error) {
      console.error('Search categories API error:', error);
      throw error;
    }
  }

  // Get statistics
  async getStatistics() {
    try {
      const [categoriesResult, productsResult] = await Promise.all([
        supabase.from('categories').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('products').select('id', { count: 'exact' }).eq('is_active', true)
      ]);

      return {
        totalCategories: categoriesResult.count || 0,
        totalProducts: productsResult.count || 0
      };
    } catch (error) {
      console.error('Statistics API error:', error);
      return {
        totalCategories: 0,
        totalProducts: 0
      };
    }
  }
}

export const categoriesAPI = new CategoriesAPI();