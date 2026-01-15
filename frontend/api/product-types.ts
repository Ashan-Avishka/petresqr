// src/api/product-types.ts

export interface ProductColor {
  name: string;
  hexCode: string;
}

export interface ProductImage {
  url: string;
  alt?: string;
  isPrimary?: boolean;
}

export interface ProductDimensions {
  length?: number;
  width?: number;
  height?: number;
}

// export type ProductCategory = 'tag' | 'accessory' | 'bundle' | 'merchandise';
export type PetCategory = 'dogs' | 'cats' | 'others';
export type ProductAvailability = 'in_stock' | 'out_of_stock' | 'pre_order' | 'discontinued';
export type ProductBadge = 'bestseller' | 'new' | 'sale' | 'limited';

export interface Product {
  _id: string;
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  petCategory: PetCategory;
  description?: string;
  price: number;
  compareAtPrice?: number;
  availability: ProductAvailability;
  stock?: number;
  availableColors?: ProductColor[];
  availableSizes?: string[];
  keyFeatures?: string[];
  images?: ProductImage[];
  specifications?: Record<string, any>;
  weight?: number;
  dimensions?: ProductDimensions;
  sku?: string;
  isActive: boolean;
  isFeatured: boolean;
  tags?: string[];
  rating?: number;
  reviews?: number;
  badge?: ProductBadge;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  data: Product[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetProductsParams {
  page?: number;
  limit?: number;
  category?: ProductCategory;
  petCategory?: PetCategory;
  availability?: ProductAvailability;
  featured?: boolean;
  badge?: ProductBadge;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProductCategory {
  _id: string;
  count: number;
  avgPrice: number;
  avgRating?: number;
}

export interface PetCategoryInfo {
  _id: PetCategory;
  count: number;
  avgPrice: number;
}

export interface StockCheckResponse {
  available: boolean;
  stock: number;
  availability: string;
}

// Cart Item interface for shopping cart
export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

// Order Item for checkout
export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  selectedColor?: string;
  selectedSize?: string;
  image?: string;
}

// Filter options for UI
export interface ProductFilters {
  categories: ProductCategory[];
  petCategories: PetCategory[];
  priceRange: {
    min: number;
    max: number;
  };
  badges: ProductBadge[];
  availability: ProductAvailability[];
}