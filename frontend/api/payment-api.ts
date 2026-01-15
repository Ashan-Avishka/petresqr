// src/api/payment-api.ts
import { apiClient } from './client';
import type { Order } from './order-types';

export interface CreatePaymentRequest {
  sourceId: string; // Payment token from Square
  items: Array<{
    productId: string;
    quantity: number;
    size?: string;
    color?: string;
  }>;
  shippingAddress: {
    fullName?: string;
    email?: string;
    phone?: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  };
  billingDetails?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  petId?: string;
  tagId?: string;
}

export interface PaymentResponse {
  order: Order;
  payment: {
    id: string;
    status: string;
    receiptUrl?: string;
    receiptNumber?: string;
  };
}

export interface RefundRequest {
  reason?: string;
}

export interface RefundResponse {
  message: string;
  refund: {
    id: string;
    status: string;
    amountMoney: {
      amount: number;
      currency: string;
    };
  };
  order: Order;
}

export const paymentAPI = {
  /**
   * Create a payment with Square
   */
  createPayment: async (
    paymentData: CreatePaymentRequest
  ): Promise<{ ok: boolean; data?: PaymentResponse; error?: any }> => {
    return apiClient.post('/payments/create', paymentData);
  },

  /**
   * Get payment details
   */
  getPayment: async (
    paymentId: string
  ): Promise<{ ok: boolean; data?: any; error?: any }> => {
    return apiClient.get(`/payments/${paymentId}`);
  },

  /**
   * Refund a payment
   */
  refundPayment: async (
    orderId: string,
    refundData?: RefundRequest
  ): Promise<{ ok: boolean; data?: RefundResponse; error?: any }> => {
    return apiClient.post(`/payments/${orderId}/refund`, refundData || {});
  },
};