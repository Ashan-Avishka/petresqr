// src/context/CartContext.tsx
'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { 
  Cart, 
  CartItem, 
  AddToCartPayload, 
  UpdateCartItemPayload,
  TAX_RATE,
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING_COST
} from '../types/cart';

const TAX_RATE = 0.08;
const FREE_SHIPPING_THRESHOLD = 50;
const STANDARD_SHIPPING_COST = 5.99;

type CartAction =
  | { type: 'ADD_ITEM'; payload: AddToCartPayload }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_ITEM'; payload: UpdateCartItemPayload }
  | { type: 'CLEAR_CART' }
  | { type: 'APPLY_DISCOUNT'; payload: number }
  | { type: 'LOAD_CART'; payload: CartItem[] };

interface CartContextType extends Cart {
  addItem: (item: AddToCartPayload) => void;
  removeItem: (id: string) => void;
  updateItem: (payload: UpdateCartItemPayload) => void;
  clearCart: () => void;
  applyDiscount: (amount: number) => void;
  isInCart: (productId: string) => boolean;
  getCartItem: (productId: string) => CartItem | undefined;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'pettracker_cart';

// Calculate cart totals
const calculateTotals = (items: CartItem[], discount: number = 0): Omit<Cart, 'items' | 'discount'> => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shipping + tax - discount;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return { itemCount, subtotal, tax, shipping, total };
};

// Cart reducer
const cartReducer = (state: Cart, action: CartAction): Cart => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { quantity = 1, ...itemData } = action.payload;
      const existingItemIndex = state.items.findIndex(
        item => item.productId === itemData.productId && 
                item.color === itemData.color && 
                item.size === itemData.size
      );

      let newItems: CartItem[];

      if (existingItemIndex > -1) {
        // Update existing item quantity
        newItems = state.items.map((item, index) => {
          if (index === existingItemIndex) {
            const newQuantity = Math.min(item.quantity + quantity, item.stock);
            return { ...item, quantity: newQuantity };
          }
          return item;
        });
      } else {
        // Add new item
        const newItem: CartItem = {
          id: `${itemData.productId}-${Date.now()}`,
          ...itemData,
          quantity: Math.min(quantity, itemData.stock),
          maxQuantity: itemData.stock,
        };
        newItems = [...state.items, newItem];
      }

      const totals = calculateTotals(newItems, state.discount);
      return { ...state, items: newItems, ...totals };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload);
      const totals = calculateTotals(newItems, state.discount);
      return { ...state, items: newItems, ...totals };
    }

    case 'UPDATE_ITEM': {
      const newItems = state.items.map(item => {
        if (item.id === action.payload.id) {
          const updates: Partial<CartItem> = {};
          
          if (action.payload.quantity !== undefined) {
            updates.quantity = Math.max(1, Math.min(action.payload.quantity, item.stock));
          }
          if (action.payload.color !== undefined) updates.color = action.payload.color;
          if (action.payload.size !== undefined) updates.size = action.payload.size;
          if (action.payload.engraving !== undefined) updates.engraving = action.payload.engraving;
          
          return { ...item, ...updates };
        }
        return item;
      });

      const totals = calculateTotals(newItems, state.discount);
      return { ...state, items: newItems, ...totals };
    }

    case 'CLEAR_CART': {
      return {
        items: [],
        itemCount: 0,
        subtotal: 0,
        tax: 0,
        shipping: 0,
        discount: 0,
        total: 0,
      };
    }

    case 'APPLY_DISCOUNT': {
      const totals = calculateTotals(state.items, action.payload);
      return { ...state, discount: action.payload, ...totals };
    }

    case 'LOAD_CART': {
      const totals = calculateTotals(action.payload, state.discount);
      return { ...state, items: action.payload, ...totals };
    }

    default:
      return state;
  }
};

const initialState: Cart = {
  items: [],
  itemCount: 0,
  subtotal: 0,
  tax: 0,
  shipping: 0,
  discount: 0,
  total: 0,
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const items = JSON.parse(savedCart) as CartItem[];
        dispatch({ type: 'LOAD_CART', payload: items });
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [state.items]);

  const addItem = (item: AddToCartPayload) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateItem = (payload: UpdateCartItemPayload) => {
    dispatch({ type: 'UPDATE_ITEM', payload });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const applyDiscount = (amount: number) => {
    dispatch({ type: 'APPLY_DISCOUNT', payload: amount });
  };

  const isInCart = (productId: string): boolean => {
    return state.items.some(item => item.productId === productId);
  };

  const getCartItem = (productId: string): CartItem | undefined => {
    return state.items.find(item => item.productId === productId);
  };

  const value: CartContextType = {
    ...state,
    addItem,
    removeItem,
    updateItem,
    clearCart,
    applyDiscount,
    isInCart,
    getCartItem,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};