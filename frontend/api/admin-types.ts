export interface AdminRecentOrder {
  _id: string;
  userId: { firstName: string; lastName: string; email: string } | null;
  petId: { name: string; breed: string } | null;
  status: string;
  total: number;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalPets: number;
  totalOrders: number;
  totalScans: number;
  revenueThisMonth: number;
  activeUsers: number;
  activePets: number;
  recentOrders: AdminRecentOrder[];
}

export interface AdminUser {
  _id: string;
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  authProvider: 'email' | 'google';
  isActive: boolean;
  emailVerified?: boolean;
  createdAt: string;
}

export interface AdminUserDetail {
  user: AdminUser;
  pets: AdminPet[];
  orders: AdminOrder[];
}

export interface AdminPet {
  _id: string;
  id: string;
  name: string;
  breed: string;
  type: string;
  status: string;
  isActive: boolean;
  photoUrl?: string;
  ownerId: { _id?: string; firstName: string; lastName: string; email: string } | null;
  tagId: { _id?: string; qrCode: string; status: string } | null;
  createdAt: string;
}

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface AdminOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  sku?: string;
  size?: string;
  color?: string;
}

export interface AdminOrder {
  _id: string;
  id: string;
  userId: { firstName: string; lastName: string; email: string; phone?: string } | null;
  petId: { name: string; breed: string; photoUrl?: string } | null;
  tagId: { qrCode: string; status: string } | null;
  status: OrderStatus;
  total: number;
  subtotal?: number;
  tax?: number;
  shipping?: number;
  items?: AdminOrderItem[];
  shippingAddress?: { street: string; city: string; state: string; zipCode: string; country: string };
  paymentMethod?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ScansByDay {
  _id: string;
  count: number;
}

export interface TopScannedPet {
  _id: string;
  count: number;
  pet: Array<{
    name: string;
    breed: string;
    ownerId?: { firstName: string; lastName: string };
  }>;
}

export interface AdminTag {
  _id: string;
  qrCode?: string;
  status: 'active' | 'inactive' | 'pending';
  isActive: boolean;
  productImage?: string | null;
  userId: { _id: string; firstName: string; lastName: string; email: string } | null;
  petId: { _id: string; name: string; breed: string } | null;
  createdAt: string;
  updatedAt: string;
  activatedAt?: string;
  purchaseDate?: string;
}

export interface AdminProduct {
  _id: string;
  name: string;
  slug: string;
  category: 'tag' | 'accessory' | 'bundle' | 'merchandise';
  petCategory?: 'dogs' | 'cats' | 'others';
  description: string;
  price: number;
  compareAtPrice?: number;
  availability: 'in_stock' | 'out_of_stock' | 'pre_order' | 'discontinued';
  stock: number;
  availableColors: Array<{ name: string; hexCode: string }>;
  availableSizes: string[];
  keyFeatures: string[];
  images: Array<{ url: string; alt: string; isPrimary: boolean }>;
  specifications: Record<string, any>;
  weight?: number;
  sku: string;
  isActive: boolean;
  isFeatured: boolean;
  badge?: 'bestseller' | 'new' | 'sale' | 'limited';
  rating?: number;
  reviews?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ScanAnalytics {
  totalScans: number;
  uniquePets: number;
  scansByDay: ScansByDay[];
  topScannedPets: TopScannedPet[];
  scansByLocation: Array<{ _id: string; count: number }>;
  period: string;
}
