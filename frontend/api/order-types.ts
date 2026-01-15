// src/api/order-types.ts

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  sku?: string;
  size?: string;
  color?: string;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Order {
  _id: string;
  id: string;
  userId: string;
  petId?: {
    _id: string;
    name: string;
    breed: string;
    photoUrl?: string;
  };
  tagId?: {
    _id: string;
    qrCode: string;
    status: string;
    activatedAt?: Date;
  };
  items: OrderItem[];
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  shippingAddress: ShippingAddress;
  trackingNumber?: string;
  squareOrderId?: string;
  squarePaymentId?: string;
  paymentMethod?: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersResponse {
  data: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetOrdersParams {
  page?: number;
  limit?: number;
  status?: Order['status'];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateOrderRequest {
  items: Array<{
    productId: string;
    quantity: number;
    size?: string;
    color?: string;
  }>;
  shippingAddress: ShippingAddress;
  paymentMethod?: string;
  petId?: string;
  tagId?: string;
}

export interface CancelOrderResponse {
  message: string;
  order: Order;
}