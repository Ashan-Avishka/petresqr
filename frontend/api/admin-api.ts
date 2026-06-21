import { API_BASE_URL, getAuthHeaders } from './config';
import { apiClient } from './client';
import type {
  AdminStats,
  AdminUser,
  AdminPet,
  AdminOrder,
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
  status?: string
): Promise<{ data: AdminPet[]; pagination: AdminPagination } | null> {
  const params = new URLSearchParams({ page: String(page), limit: '20' });
  if (status) params.set('status', status);
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

export async function updateAdminOrderStatus(
  id: string,
  status: OrderStatus,
  trackingNumber?: string
): Promise<AdminOrder | null> {
  const body: Record<string, string> = { status };
  if (trackingNumber) body.trackingNumber = trackingNumber;
  const res = await apiClient.put<AdminOrder>(`/admin/orders/${id}/status`, body);
  if (!res.ok) {
    if (AUTH_ERROR_CODES.has(res.error?.code)) window.location.href = '/';
    return null;
  }
  return res.data ?? null;
}

export async function getScanAnalytics(days = 30): Promise<ScanAnalytics | null> {
  const res = await adminFetch<ScanAnalytics>(`/admin/analytics/scans?days=${days}`);
  return res.ok ? (res.data ?? null) : null;
}
