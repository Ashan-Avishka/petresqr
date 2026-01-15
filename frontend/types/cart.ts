// src/types/cart.ts

export interface CartItem {
  id: string; // Unique cart item ID
  productId: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  image: string;
  color?: string;
  size?: string;
  engraving?: string;
  category: 'tag' | 'accessory' | 'bundle' | 'merchandise';
  stock: number;
  maxQuantity?: number;
}

export interface Cart {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
}

export interface AddToCartPayload {
  productId: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  color?: string;
  size?: string;
  engraving?: string;
  category: 'tag' | 'accessory' | 'bundle' | 'merchandise';
  stock: number;
  quantity?: number;
}

export interface UpdateCartItemPayload {
  id: string;
  quantity?: number;
  color?: string;
  size?: string;
  engraving?: string;
}

export const TAX_RATE = 0.08; // 8% tax
export const FREE_SHIPPING_THRESHOLD = 50;
export const STANDARD_SHIPPING_COST = 5.99;