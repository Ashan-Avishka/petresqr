import { API_BASE_URL, getAuthHeaders } from './config';
import type {
  AdminStats,
  AdminUser,
  AdminPet,
  AdminOrder,
  AdminTag,
  AdminProduct,
  AdminPagination,
  ScanAnalytics,
  OrderStatus,
} from './admin-types';

const AUTH_ERROR_CODES = new Set(['INVALID_TOKEN', 'NO_TOKEN', 'FORBIDDEN', 'USER_NOT_FOUND']);

interface AdminFetchResult<T> {
  ok: boolean;
  data?: T;
  pagination?: AdminPagination;
  error?: { code: string; message: string };
}

async function adminFetch<T>(path: string): Promise<AdminFetchResult<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: getAuthHeaders() as HeadersInit,
    });
    const result = await response.json();
    if (!response.ok && AUTH_ERROR_CODES.has(result.error?.code)) {
      window.location.href = '/';
    }
    return { ok: response.ok, data: result.data, pagination: result.pagination, error: result.error };
  } catch {
    return { ok: false, error: { code: 'NETWORK_ERROR', message: 'Network error occurred' } };
  }
}

export async function getAdminStats(): Promise<AdminStats | null> {
  const res = await adminFetch<AdminStats>('/admin/stats');
  return res.ok ? (res.data ?? null) : null;
}

export async function getAdminUsers(
  page = 1,
  search?: string
): Promise<{ data: AdminUser[]; pagination: AdminPagination } | null> {
  const params = new URLSearchParams({ page: String(page), limit: '20' });
  if (search) params.set('search', search);
  const res = await adminFetch<AdminUser[]>(`/admin/users?${params}`);
  if (!res.ok || !res.data || !res.pagination) return null;
  return { data: res.data, pagination: res.pagination };
}

export async function getAdminPets(
  page = 1,
  status?: string,
  name?: string
): Promise<{ data: AdminPet[]; pagination: AdminPagination } | null> {
  const params = new URLSearchParams({ page: String(page), limit: '20' });
  if (status) params.set('status', status);
  if (name) params.set('name', name);
  const res = await adminFetch<AdminPet[]>(`/admin/pets?${params}`);
  if (!res.ok || !res.data || !res.pagination) return null;
  return { data: res.data, pagination: res.pagination };
}

export async function getAdminOrders(
  page = 1,
  status?: string
): Promise<{ data: AdminOrder[]; pagination: AdminPagination } | null> {
  const params = new URLSearchParams({ page: String(page), limit: '20' });
  if (status) params.set('status', status);
  const res = await adminFetch<AdminOrder[]>(`/admin/orders?${params}`);
  if (!res.ok || !res.data || !res.pagination) return null;
  return { data: res.data, pagination: res.pagination };
}

export async function getAdminOrderById(id: string): Promise<AdminOrder | null> {
  const res = await adminFetch<AdminOrder>(`/admin/orders/${id}`);
  return res.ok ? (res.data ?? null) : null;
}

async function adminMutate<T>(
  path: string,
  body: Record<string, any>,
  method: 'PUT' | 'PATCH' | 'DELETE' = 'PUT'
): Promise<{ ok: boolean; data?: T; error?: any }> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: { ...getAuthHeaders() as Record<string, string>, 'Content-Type': 'application/json' },
      body: method !== 'DELETE' ? JSON.stringify(body) : undefined,
    });
    let result: any;
    try {
      const text = await response.text();
      result = text ? JSON.parse(text) : {};
    } catch {
      result = { error: { code: 'NETWORK_ERROR', message: 'Invalid response' } };
    }
    if (!response.ok && AUTH_ERROR_CODES.has(result?.error?.code)) {
      window.location.href = '/';
    }
    return { ok: response.ok, data: result.data, error: result.error };
  } catch {
    return { ok: false, error: { code: 'NETWORK_ERROR', message: 'Network error occurred' } };
  }
}

export async function updateAdminOrderStatus(
  id: string,
  status: OrderStatus,
  trackingNumber?: string
): Promise<AdminOrder | null> {
  const body: Record<string, string> = { status };
  if (trackingNumber) body.trackingNumber = trackingNumber;
  const res = await adminMutate<AdminOrder>(`/admin/orders/${id}/status`, body);
  if (!res.ok) return null;
  return res.data ?? null;
}

// ── Users ─────────────────────────────────────────────────────────────────────

export async function updateAdminUser(
  id: string,
  data: { role?: 'user' | 'admin'; isActive?: boolean }
): Promise<AdminUser | null> {
  const res = await adminMutate<AdminUser>(`/admin/users/${id}`, data);
  return res.ok ? (res.data ?? null) : null;
}

export async function deleteAdminUser(id: string): Promise<boolean> {
  const res = await adminMutate(`/admin/users/${id}`, {}, 'DELETE');
  return res.ok;
}

// ── Pets ──────────────────────────────────────────────────────────────────────

export async function getAdminPetById(id: string): Promise<AdminPet | null> {
  const res = await adminFetch<AdminPet>(`/admin/pets/${id}`);
  return res.ok ? (res.data ?? null) : null;
}

export async function updateAdminPet(
  id: string,
  data: { name?: string; breed?: string; type?: string; status?: string }
): Promise<AdminPet | null> {
  const res = await adminMutate<AdminPet>(`/admin/pets/${id}`, data);
  return res.ok ? (res.data ?? null) : null;
}

export async function deleteAdminPet(id: string): Promise<boolean> {
  const res = await adminMutate(`/admin/pets/${id}`, {}, 'DELETE');
  return res.ok;
}

// ── Tags ──────────────────────────────────────────────────────────────────────

export async function getAdminTags(
  page = 1,
  status?: string,
  search?: string
): Promise<{ data: AdminTag[]; pagination: AdminPagination } | null> {
  const params = new URLSearchParams({ page: String(page), limit: '20' });
  if (status) params.set('status', status);
  if (search) params.set('search', search);
  const res = await adminFetch<AdminTag[]>(`/admin/tags?${params}`);
  if (!res.ok || !res.data || !res.pagination) return null;
  return { data: res.data, pagination: res.pagination };
}

export async function updateAdminTag(
  id: string,
  data: { status?: 'active' | 'inactive' | 'pending'; isActive?: boolean }
): Promise<AdminTag | null> {
  const res = await adminMutate<AdminTag>(`/admin/tags/${id}`, data);
  return res.ok ? (res.data ?? null) : null;
}

export async function deleteAdminTag(id: string): Promise<boolean> {
  const res = await adminMutate(`/admin/tags/${id}`, {}, 'DELETE');
  return res.ok;
}

export async function getAdminUserPets(userId: string): Promise<{ pets: AdminPet[]; error?: string }> {
  const res = await adminFetch<{ user: unknown; pets: AdminPet[]; orders: unknown[] }>(`/admin/users/${userId}`);
  if (!res.ok) return { pets: [], error: res.error?.message ?? 'Failed to load pets' };
  return { pets: res.data?.pets ?? [] };
}

export async function getScanAnalytics(days = 30): Promise<ScanAnalytics | null> {
  const res = await adminFetch<ScanAnalytics>(`/admin/analytics/scans?days=${days}`);
  return res.ok ? (res.data ?? null) : null;
}

export async function getAdminProducts(
  page = 1,
  search?: string,
  category?: string
): Promise<{ data: AdminProduct[]; pagination: AdminPagination } | null> {
  const params = new URLSearchParams({ page: String(page), limit: '20' });
  if (search) params.set('search', search);
  if (category) params.set('category', category);
  const res = await adminFetch<AdminProduct[]>(`/admin/products?${params}`);
  if (!res.ok || !res.data || !res.pagination) return null;
  return { data: res.data, pagination: res.pagination };
}

export async function updateAdminProduct(
  id: string,
  data: Partial<Pick<AdminProduct, 'name' | 'description' | 'price' | 'compareAtPrice' | 'availability' | 'stock' | 'availableColors' | 'availableSizes' | 'keyFeatures' | 'badge' | 'isFeatured' | 'isActive' | 'petCategory' | 'weight'>>
): Promise<AdminProduct | null> {
  const res = await adminMutate<AdminProduct>(`/admin/products/${id}`, data);
  return res.ok ? (res.data ?? null) : null;
}
