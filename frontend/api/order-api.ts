// src/api/order-api.ts
import { apiClient } from './client';
import type { 
  Order, 
  OrdersResponse, 
  GetOrdersParams, 
  CreateOrderRequest,
  CancelOrderResponse 
} from './order-types';

export const orderAPI = {
  /**
   * Get all orders for the authenticated user
   */
  getOrders: async (params?: GetOrdersParams): Promise<{ ok: boolean; data?: OrdersResponse; error?: any }> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const query = queryParams.toString();
    return apiClient.get(`/orders${query ? `?${query}` : ''}`);
  },

  /**
   * Get a specific order by ID
   */
  getOrderById: async (orderId: string): Promise<{ ok: boolean; data?: Order; error?: any }> => {
    return apiClient.get(`/orders/${orderId}`);
  },

  /**
   * Create a new order
   */
  createOrder: async (orderData: CreateOrderRequest): Promise<{ ok: boolean; data?: Order; error?: any }> => {
    return apiClient.post('/orders', orderData);
  },

  /**
   * Cancel an order (only if status is pending or paid)
   */
  cancelOrder: async (orderId: string): Promise<{ ok: boolean; data?: CancelOrderResponse; error?: any }> => {
    return apiClient.post(`/orders/${orderId}/cancel`, {});
  },

  /**
   * Get order statistics for the user
   */
  getOrderStats: async (): Promise<{ ok: boolean; data?: any; error?: any }> => {
    return apiClient.get('/orders/stats');
  },
};