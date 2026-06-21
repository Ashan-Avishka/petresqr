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
  ownerId: { firstName: string; lastName: string; email: string } | null;
  tagId: { qrCode: string; status: string } | null;
  createdAt: string;
}

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface AdminOrder {
  _id: string;
  id: string;
  userId: { firstName: string; lastName: string; email: string; phone?: string } | null;
  petId: { name: string; breed: string; photoUrl?: string } | null;
  tagId: { qrCode: string; status: string } | null;
  status: OrderStatus;
  total: number;
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

export interface ScanAnalytics {
  totalScans: number;
  uniquePets: number;
  scansByDay: ScansByDay[];
  topScannedPets: TopScannedPet[];
  scansByLocation: Array<{ _id: string; count: number }>;
  period: string;
}
