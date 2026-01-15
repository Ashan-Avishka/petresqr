// src/api/product-api.ts
import { apiClient } from './client';
import type { 
  Product, 
  ProductsResponse, 
  GetProductsParams,
  StockCheckResponse,
  ProductCategory as ProductCategoryInfo,
  PetCategoryInfo,
  ProductCategory,
  PetCategory
} from './product-types';

export const productAPI = {
  /**
   * Get all products with optional filters
   */
  getProducts: async (params?: GetProductsParams): Promise<{ ok: boolean; data?: ProductsResponse; error?: any }> => {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.petCategory) queryParams.append('petCategory', params.petCategory);
    if (params?.availability) queryParams.append('availability', params.availability);
    if (params?.featured !== undefined) queryParams.append('featured', params.featured.toString());
    if (params?.badge) queryParams.append('badge', params.badge);
    if (params?.minPrice) queryParams.append('minPrice', params.minPrice.toString());
    if (params?.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params?.minRating) queryParams.append('minRating', params.minRating.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const query = queryParams.toString();
    return apiClient.get(`/products${query ? `?${query}` : ''}`);
  },

  /**
   * Get a specific product by ID
   */
  getProductById: async (productId: string): Promise<{ ok: boolean; data?: Product; error?: any }> => {
    return apiClient.get(`/products/${productId}`);
  },

  /**
   * Get a specific product by slug
   */
  getProductBySlug: async (slug: string): Promise<{ ok: boolean; data?: Product; error?: any }> => {
    return apiClient.get(`/products/slug/${slug}`);
  },

  /**
   * Get featured products
   */
  getFeaturedProducts: async (limit: number = 4): Promise<{ ok: boolean; data?: Product[]; error?: any }> => {
    return apiClient.get(`/products/featured?limit=${limit}`);
  },

  /**
   * Get bestselling products
   */
  getBestSellers: async (limit: number = 8): Promise<{ ok: boolean; data?: Product[]; error?: any }> => {
    return apiClient.get(`/products/bestsellers?limit=${limit}`);
  },

  /**
   * Get products by category
   */
  getProductsByCategory: async (
    category: ProductCategory, 
    params?: Omit<GetProductsParams, 'category'>
  ): Promise<{ ok: boolean; data?: ProductsResponse; error?: any }> => {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const query = queryParams.toString();
    return apiClient.get(`/products/category/${category}${query ? `?${query}` : ''}`);
  },

  /**
   * Get products by pet category
   */
  getProductsByPetCategory: async (
    petCategory: PetCategory, 
    params?: Omit<GetProductsParams, 'petCategory'>
  ): Promise<{ ok: boolean; data?: ProductsResponse; error?: any }> => {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const query = queryParams.toString();
    return apiClient.get(`/products/pet-category/${petCategory}${query ? `?${query}` : ''}`);
  },

  /**
   * Search products
   */
  searchProducts: async (
    searchTerm: string, 
    params?: Omit<GetProductsParams, 'search'>
  ): Promise<{ ok: boolean; data?: ProductsResponse; error?: any }> => {
    return productAPI.getProducts({ ...params, search: searchTerm });
  },

  /**
   * Check product stock availability
   */
  checkStock: async (
    productId: string, 
    quantity?: number
  ): Promise<{ ok: boolean; data?: StockCheckResponse; error?: any }> => {
    const query = quantity ? `?quantity=${quantity}` : '';
    return apiClient.get(`/products/${productId}/stock${query}`);
  },

  /**
   * Get all product categories with counts
   */
  getCategories: async (): Promise<{ ok: boolean; data?: ProductCategoryInfo[]; error?: any }> => {
    return apiClient.get('/products/categories');
  },

  /**
   * Get all pet categories with counts
   */
  getPetCategories: async (): Promise<{ ok: boolean; data?: PetCategoryInfo[]; error?: any }> => {
    return apiClient.get('/products/pet-categories');
  },

  /**
   * Get related products (products in the same category)
   */
  getRelatedProducts: async (
    productId: string, 
    limit: number = 4
  ): Promise<{ ok: boolean; data?: Product[]; error?: any }> => {
    return apiClient.get(`/products/${productId}/related?limit=${limit}`);
  },

  /**
   * Get products with a specific badge
   */
  getProductsByBadge: async (
    badge: 'bestseller' | 'new' | 'sale' | 'limited',
    params?: Omit<GetProductsParams, 'badge'>
  ): Promise<{ ok: boolean; data?: ProductsResponse; error?: any }> => {
    return productAPI.getProducts({ ...params, badge });
  },

  /**
   * Get new arrivals (products with 'new' badge)
   */
  getNewArrivals: async (limit: number = 8): Promise<{ ok: boolean; data?: Product[]; error?: any }> => {
    const result = await productAPI.getProducts({ 
      badge: 'new', 
      limit,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    
    return {
      ok: result.ok,
      data: result.data?.data,
      error: result.error
    };
  },

  /**
   * Get products on sale
   */
  getSaleProducts: async (
    params?: Omit<GetProductsParams, 'badge'>
  ): Promise<{ ok: boolean; data?: ProductsResponse; error?: any }> => {
    return productAPI.getProducts({ ...params, badge: 'sale' });
  },

  /**
   * Get top rated products
   */
  getTopRatedProducts: async (limit: number = 8): Promise<{ ok: boolean; data?: Product[]; error?: any }> => {
    const result = await productAPI.getProducts({ 
      minRating: 4.5,
      limit,
      sortBy: 'rating',
      sortOrder: 'desc'
    });
    
    return {
      ok: result.ok,
      data: result.data?.data,
      error: result.error
    };
  },
};