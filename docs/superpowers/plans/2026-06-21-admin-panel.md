# Admin Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a full admin panel as a fifth "Admin" tab inside the existing `/dashboard` for users with `role === 'admin'`, backed by the already-complete `AdminController` endpoints.

**Architecture:** The backend gains an audit logging middleware and rate limiter on `/api/admin/*` routes. The frontend gains typed API client functions and five panel components (`OverviewPanel`, `UsersPanel`, `PetsPanel`, `OrdersPanel`, `AnalyticsPanel`) rendered inside an `AdminTab` shell. Each panel fetches its own data independently. The Admin tab is conditionally shown in the dashboard sidebar only when `user?.role === 'admin'`.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS v4, Framer Motion, Lucide React, Express, Winston (existing), express-rate-limit (already installed).

## Global Constraints

- All frontend files must include `'use client'` directive (interactive components)
- Primary color token: `#FABC3F` — reference via `text-primary`, `bg-primary`, `border-primary`, `from-primary`, `shadow-primary`
- Button style: `bg-gradient-to-br from-primary via-black to-black text-white rounded-full`
- Active tab style: `bg-gradient-to-br from-primary via-black via-60% to-black text-white shadow-md shadow-primary/40 scale-110`
- Card style: `bg-black/40 backdrop-blur-md rounded-xl border border-primary/20`
- Entry animation: `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}`
- Status badge colors: green = delivered/paid/active, amber = pending/processing/shipped, red = cancelled/inactive
- API client: `apiClient` from `frontend/api/client.ts` — returns `{ ok: boolean; data?: T; error?: any }`
- On 401/403 from admin API: `window.location.href = '/'`
- Font: Clash Display (set globally in `globals.css`)
- Icons: `lucide-react` only — no other icon libraries
- No new npm packages on the frontend

---

## File Map

### New files
| File | Responsibility |
|------|---------------|
| `backend/middleware/adminAudit.ts` | Log every admin request to `logs/admin-audit.log` |
| `frontend/api/admin-types.ts` | TypeScript interfaces for all admin API responses |
| `frontend/api/admin-api.ts` | Typed fetch functions for all 7 admin endpoints |
| `frontend/components/Dashboard/AdminTab.tsx` | Shell with horizontal sub-tab bar; renders the active panel; guards access |
| `frontend/components/Dashboard/Admin/OverviewPanel.tsx` | Stat cards + recent orders list |
| `frontend/components/Dashboard/Admin/UsersPanel.tsx` | Paginated users table with debounced search |
| `frontend/components/Dashboard/Admin/PetsPanel.tsx` | Paginated pets table with status filter |
| `frontend/components/Dashboard/Admin/OrdersPanel.tsx` | Paginated orders table with update-status modal |
| `frontend/components/Dashboard/Admin/AnalyticsPanel.tsx` | Scan stat cards + top pets table + day selector |

### Modified files
| File | Change |
|------|--------|
| `backend/routes/admin.ts` | Add `adminRateLimit` (first) and `adminAudit` (after `requireAdmin`) |
| `frontend/src/app/dashboard/page.tsx` | Add `Shield` Admin tab conditionally for `user?.role === 'admin'`; import `AdminTab` |

---

## Task 1: Backend — Audit middleware + rate limiting

**Files:**
- Create: `backend/middleware/adminAudit.ts`
- Modify: `backend/routes/admin.ts`

**Interfaces:**
- Produces: `adminAudit` Express middleware; `adminRateLimit` rate limiter applied to admin router

- [ ] **Step 1: Create audit middleware**

Create `backend/middleware/adminAudit.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { createLogger, format, transports } from 'winston';

const auditLogger = createLogger({
  level: 'info',
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.File({ filename: 'logs/admin-audit.log' }),
  ],
});

export const adminAudit = (req: Request, res: Response, next: NextFunction): void => {
  const user = (req as any).user;
  const entry: Record<string, any> = {
    adminId: user?._id?.toString() ?? 'unknown',
    adminEmail: user?.email ?? 'unknown',
    method: req.method,
    path: req.path,
    ip: req.ip ?? req.socket?.remoteAddress ?? 'unknown',
    resourceId: req.params.id ?? null,
  };

  if (['PUT', 'POST', 'DELETE'].includes(req.method)) {
    entry.body = req.body;
  }

  auditLogger.info('Admin action', entry);
  next();
};
```

- [ ] **Step 2: Add rate limiter and audit middleware to admin routes**

Open `backend/routes/admin.ts`. Add these imports at the top (after existing imports):

```typescript
import rateLimit from 'express-rate-limit';
import { adminAudit } from '../middleware/adminAudit';
```

Then replace the existing middleware block:
```typescript
// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);
```

With:
```typescript
const adminRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later.' },
  },
});

router.use(adminRateLimit);
router.use(authenticateToken);
router.use(requireAdmin);
router.use(adminAudit);
```

- [ ] **Step 3: Verify backend starts without errors**

```bash
npm run dev
```

Expected: Server starts. No TypeScript or import errors. Make a test request to `GET /api/admin/stats` — check `logs/admin-audit.log` exists and contains a JSON entry.

- [ ] **Step 4: Commit**

```bash
git add backend/middleware/adminAudit.ts backend/routes/admin.ts
git commit -m "feat: add audit logging and rate limiting to admin routes"
```

---

## Task 2: Frontend — Admin TypeScript types

**Files:**
- Create: `frontend/api/admin-types.ts`

**Interfaces:**
- Produces: All types consumed by `admin-api.ts` and every admin panel component

- [ ] **Step 1: Create types file**

Create `frontend/api/admin-types.ts`:

```typescript
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
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
cd frontend && npx tsc --noEmit
```

Expected: No errors in `admin-types.ts`.

- [ ] **Step 3: Commit**

```bash
git add frontend/api/admin-types.ts
git commit -m "feat: add admin API TypeScript types"
```

---

## Task 3: Frontend — Admin API client

**Files:**
- Create: `frontend/api/admin-api.ts`

**Interfaces:**
- Consumes: `apiClient` from `./client`; all types from `./admin-types`
- Produces:
  - `getAdminStats(): Promise<AdminStats | null>`
  - `getAdminUsers(page: number, search?: string): Promise<{ data: AdminUser[]; pagination: AdminPagination } | null>`
  - `getAdminPets(page: number, status?: string): Promise<{ data: AdminPet[]; pagination: AdminPagination } | null>`
  - `getAdminOrders(page: number, status?: string): Promise<{ data: AdminOrder[]; pagination: AdminPagination } | null>`
  - `updateAdminOrderStatus(id: string, status: string, trackingNumber?: string): Promise<AdminOrder | null>`
  - `getScanAnalytics(days: number): Promise<ScanAnalytics | null>`

- [ ] **Step 1: Create API client**

> **Note:** The server response shape is `{ success, data, pagination }` — pagination is at the **top level** of the JSON body, not inside `data`. The existing `apiClient` only captures `result.data` and silently drops `result.pagination`. So this file uses a local `adminFetch` helper that captures both fields.

Create `frontend/api/admin-api.ts`:

```typescript
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
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd frontend && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/api/admin-api.ts
git commit -m "feat: add admin API client functions"
```

---

## Task 4: Dashboard integration + AdminTab shell

**Files:**
- Create: `frontend/components/Dashboard/AdminTab.tsx`
- Modify: `frontend/src/app/dashboard/page.tsx`

**Interfaces:**
- Consumes: `useAuthContext` from `../../contexts/AuthContext`; panel components from `./Admin/*`
- Produces: `<AdminTab />` component rendered by `dashboard/page.tsx` when `activeTab === 'admin'`

- [ ] **Step 1: Create AdminTab shell**

Create `frontend/components/Dashboard/AdminTab.tsx`:

```typescript
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, BarChart2, Users, Dog, ShoppingBag, Activity } from 'lucide-react';
import { useAuthContext } from '../../contexts/AuthContext';
import OverviewPanel from './Admin/OverviewPanel';
import UsersPanel from './Admin/UsersPanel';
import PetsPanel from './Admin/PetsPanel';
import OrdersPanel from './Admin/OrdersPanel';
import AnalyticsPanel from './Admin/AnalyticsPanel';

const SUB_TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart2 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'pets', label: 'Pets', icon: Dog },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'analytics', label: 'Analytics', icon: Activity },
] as const;

type SubTabId = (typeof SUB_TABS)[number]['id'];

export default function AdminTab() {
  const { user } = useAuthContext();
  const [activeSubTab, setActiveSubTab] = useState<SubTabId>('overview');

  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-20 h-20 bg-amber-400/10 rounded-full flex items-center justify-center mb-6">
          <Lock className="w-10 h-10 text-amber-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Not Authorized</h2>
        <p className="text-gray-400">You do not have admin access.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-white mb-1">Admin</h2>
        <p className="text-gray-400">Platform management</p>
      </div>

      {/* Horizontal sub-tab bar */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {SUB_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all border-b border-primary ${
                active
                  ? 'bg-gradient-to-br from-primary via-black via-60% to-black text-white shadow-md shadow-primary/40 scale-105'
                  : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Panel */}
      <motion.div
        key={activeSubTab}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {activeSubTab === 'overview' && <OverviewPanel />}
        {activeSubTab === 'users' && <UsersPanel />}
        {activeSubTab === 'pets' && <PetsPanel />}
        {activeSubTab === 'orders' && <OrdersPanel />}
        {activeSubTab === 'analytics' && <AnalyticsPanel />}
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 2: Add Admin tab to dashboard page**

Open `frontend/src/app/dashboard/page.tsx`. Add `Shield` to the import from `lucide-react`:

```typescript
import { Dog, Tag, User, Truck, Lock, Shield } from 'lucide-react';
```

Add `AdminTab` import after the existing tab imports:

```typescript
import AdminTab from '../../../components/Dashboard/AdminTab';
```

In the `tabs` array, add the admin entry conditionally. Replace the `tabs` constant:

```typescript
const isAdmin = user?.role === 'admin';

const tabs = [
    { id: 'pets', label: 'My Pets', icon: Dog },
    { id: 'tags', label: 'Tags', icon: Tag },
    { id: 'orders', label: 'Orders', icon: Truck },
    { id: 'profile', label: 'Profile', icon: User },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: Shield }] : []),
];
```

Add the `user` destructure to the existing auth context line:
```typescript
const { isAuthenticated, isLoading: authLoading, user } = useAuthContext();
```

Add render case for admin tab after the last existing tab render:
```typescript
{activeTab === 'admin' && <AdminTab />}
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd frontend && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Visual check**

Start the dev server (`npm run dev` in the frontend folder). Log in as an admin user. Confirm:
- The Admin tab with Shield icon appears in the sidebar
- Clicking it renders the AdminTab shell with 5 horizontal sub-tabs
- A non-admin user sees no Admin tab

- [ ] **Step 5: Commit**

```bash
git add frontend/components/Dashboard/AdminTab.tsx frontend/src/app/dashboard/page.tsx
git commit -m "feat: add Admin tab shell and dashboard integration"
```

---

## Task 5: OverviewPanel

**Files:**
- Create: `frontend/components/Dashboard/Admin/OverviewPanel.tsx`

**Interfaces:**
- Consumes: `getAdminStats()` from `../../../api/admin-api`; `AdminStats`, `AdminRecentOrder` from `../../../api/admin-types`

- [ ] **Step 1: Create OverviewPanel**

Create `frontend/components/Dashboard/Admin/OverviewPanel.tsx`:

```typescript
'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Dog, ShoppingBag, QrCode, DollarSign, TrendingUp } from 'lucide-react';
import { getAdminStats } from '../../../api/admin-api';
import type { AdminStats } from '../../../api/admin-types';

const STATUS_COLORS: Record<string, string> = {
  delivered: 'text-green-400 bg-green-400/10',
  paid: 'text-green-400 bg-green-400/10',
  active: 'text-green-400 bg-green-400/10',
  processing: 'text-amber-400 bg-amber-400/10',
  pending: 'text-amber-400 bg-amber-400/10',
  shipped: 'text-amber-400 bg-amber-400/10',
  cancelled: 'text-red-400 bg-red-400/10',
  inactive: 'text-red-400 bg-red-400/10',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[status] ?? 'text-gray-400 bg-gray-400/10'}`}>
      {status}
    </span>
  );
}

export default function OverviewPanel() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats().then((data) => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary" />
      </div>
    );
  }

  if (!stats) {
    return <p className="text-red-400 text-center py-10">Failed to load stats.</p>;
  }

  const statCards = [
    { icon: Users, label: 'Total Users', value: stats.totalUsers, color: 'bg-blue-500/20' },
    { icon: Dog, label: 'Total Pets', value: stats.totalPets, color: 'bg-green-500/20' },
    { icon: ShoppingBag, label: 'Total Orders', value: stats.totalOrders, color: 'bg-purple-500/20' },
    { icon: QrCode, label: 'Total Scans', value: stats.totalScans, color: 'bg-cyan-500/20' },
    { icon: DollarSign, label: 'Revenue This Month', value: `$${stats.revenueThisMonth.toFixed(2)}`, color: 'bg-amber-500/20' },
    { icon: TrendingUp, label: 'New Users (30d)', value: stats.activeUsers, color: 'bg-pink-500/20' },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-black/40 backdrop-blur-md rounded-xl border border-primary/20 p-6 flex items-center gap-4"
            >
              <div className={`p-3 rounded-lg ${card.color}`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">{card.label}</p>
                <p className="text-white text-2xl font-bold">{card.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-black/40 backdrop-blur-md rounded-xl border border-primary/20 p-6"
      >
        <h3 className="text-white font-semibold text-lg mb-4">Recent Orders</h3>
        <div className="space-y-1">
          {stats.recentOrders.map((order) => (
            <div
              key={order._id}
              className="flex items-center justify-between py-3 border-b border-white/5 hover:bg-white/5 px-2 rounded-lg transition-colors"
            >
              <div>
                <p className="text-white text-sm font-medium">
                  {order.userId
                    ? `${order.userId.firstName} ${order.userId.lastName}`
                    : 'Unknown User'}
                </p>
                <p className="text-gray-400 text-xs">
                  {order.petId?.name ?? '—'} · {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={order.status} />
                <span className="text-white text-sm font-medium">${order.total.toFixed(2)}</span>
              </div>
            </div>
          ))}
          {stats.recentOrders.length === 0 && (
            <p className="text-gray-400 text-center py-4">No recent orders</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 2: Visual check**

Open the Admin → Overview sub-tab. Confirm:
- 6 stat cards render with correct numbers
- Recent orders list appears below
- Spinner shows during load
- No console errors

- [ ] **Step 3: Commit**

```bash
git add frontend/components/Dashboard/Admin/OverviewPanel.tsx
git commit -m "feat: add admin OverviewPanel with stats and recent orders"
```

---

## Task 6: UsersPanel

**Files:**
- Create: `frontend/components/Dashboard/Admin/UsersPanel.tsx`

**Interfaces:**
- Consumes: `getAdminUsers(page, search)` from `../../../api/admin-api`; `AdminUser`, `AdminPagination` from `../../../api/admin-types`

- [ ] **Step 1: Create UsersPanel**

Create `frontend/components/Dashboard/Admin/UsersPanel.tsx`:

```typescript
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, Users } from 'lucide-react';
import { getAdminUsers } from '../../../api/admin-api';
import type { AdminUser, AdminPagination } from '../../../api/admin-types';

const STATUS_COLORS: Record<string, string> = {
  active: 'text-green-400 bg-green-400/10',
  inactive: 'text-red-400 bg-red-400/10',
};

function StatusBadge({ active }: { active: boolean }) {
  const label = active ? 'active' : 'inactive';
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[label]}`}>
      {label}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  const color = role === 'admin' ? 'text-amber-400 bg-amber-400/10' : 'text-gray-400 bg-gray-400/10';
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>{role}</span>;
}

function Pagination({
  page,
  totalPages,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between mt-4">
      <button
        onClick={onPrev}
        disabled={page === 1}
        className="px-4 py-2 bg-black/40 text-white rounded-lg disabled:opacity-40 hover:bg-white/10 transition-colors text-sm"
      >
        Previous
      </button>
      <span className="text-gray-400 text-sm">Page {page} of {totalPages}</span>
      <button
        onClick={onNext}
        disabled={page >= totalPages}
        className="px-4 py-2 bg-black/40 text-white rounded-lg disabled:opacity-40 hover:bg-white/10 transition-colors text-sm"
      >
        Next
      </button>
    </div>
  );
}

export default function UsersPanel() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<AdminPagination | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchUsers = (p: number, s: string) => {
    setLoading(true);
    getAdminUsers(p, s || undefined).then((result) => {
      if (result) {
        setUsers(result.data);
        setPagination(result.pagination);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchUsers(page, search);
  }, [page]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchUsers(1, val);
    }, 300);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white">Users</h3>
          <p className="text-gray-400 text-sm mt-1">
            {pagination ? `${pagination.total} total` : ''}
          </p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search users..."
            className="bg-black/40 border border-primary/20 text-white rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary/60 w-56"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-white font-semibold">No users found</p>
          <p className="text-gray-400 text-sm">Try a different search term</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 backdrop-blur-md rounded-xl border border-primary/20 overflow-hidden"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-gray-400 font-medium px-4 py-3">Name</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Email</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Role</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Provider</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Status</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="px-4 py-3 text-gray-300">{u.email}</td>
                  <td className="px-4 py-3">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="px-4 py-3 text-gray-300 capitalize">{u.authProvider}</td>
                  <td className="px-4 py-3">
                    <StatusBadge active={u.isActive} />
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pagination && pagination.pages > 1 && (
            <div className="px-4 pb-4">
              <Pagination
                page={page}
                totalPages={pagination.pages}
                onPrev={() => setPage((p) => Math.max(1, p - 1))}
                onNext={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              />
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Visual check**

Open Admin → Users. Confirm:
- Table renders with all columns
- Typing in search debounces and filters results
- Pagination controls appear when there are multiple pages
- Empty state shows when search returns nothing

- [ ] **Step 3: Commit**

```bash
git add frontend/components/Dashboard/Admin/UsersPanel.tsx
git commit -m "feat: add admin UsersPanel with search and pagination"
```

---

## Task 7: PetsPanel

**Files:**
- Create: `frontend/components/Dashboard/Admin/PetsPanel.tsx`

**Interfaces:**
- Consumes: `getAdminPets(page, status)` from `../../../api/admin-api`; `AdminPet`, `AdminPagination` from `../../../api/admin-types`

- [ ] **Step 1: Create PetsPanel**

Create `frontend/components/Dashboard/Admin/PetsPanel.tsx`:

```typescript
'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Dog } from 'lucide-react';
import { getAdminPets } from '../../../api/admin-api';
import type { AdminPet, AdminPagination } from '../../../api/admin-types';

const STATUS_COLORS: Record<string, string> = {
  active: 'text-green-400 bg-green-400/10',
  inactive: 'text-red-400 bg-red-400/10',
  pending: 'text-amber-400 bg-amber-400/10',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[status] ?? 'text-gray-400 bg-gray-400/10'}`}>
      {status}
    </span>
  );
}

function Pagination({
  page,
  totalPages,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between mt-4">
      <button onClick={onPrev} disabled={page === 1} className="px-4 py-2 bg-black/40 text-white rounded-lg disabled:opacity-40 hover:bg-white/10 transition-colors text-sm">
        Previous
      </button>
      <span className="text-gray-400 text-sm">Page {page} of {totalPages}</span>
      <button onClick={onNext} disabled={page >= totalPages} className="px-4 py-2 bg-black/40 text-white rounded-lg disabled:opacity-40 hover:bg-white/10 transition-colors text-sm">
        Next
      </button>
    </div>
  );
}

const STATUS_OPTIONS = ['', 'active', 'inactive', 'pending'];

export default function PetsPanel() {
  const [pets, setPets] = useState<AdminPet[]>([]);
  const [pagination, setPagination] = useState<AdminPagination | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPets = (p: number, s: string) => {
    setLoading(true);
    getAdminPets(p, s || undefined).then((result) => {
      if (result) {
        setPets(result.data);
        setPagination(result.pagination);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchPets(page, statusFilter);
  }, [page, statusFilter]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white">Pets</h3>
          <p className="text-gray-400 text-sm mt-1">
            {pagination ? `${pagination.total} total` : ''}
          </p>
        </div>
        <select
          value={statusFilter}
          onChange={handleStatusChange}
          className="bg-black/40 border border-primary/20 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/60"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.filter(Boolean).map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary" />
        </div>
      ) : pets.length === 0 ? (
        <div className="text-center py-16">
          <Dog className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-white font-semibold">No pets found</p>
          <p className="text-gray-400 text-sm">Try a different filter</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 backdrop-blur-md rounded-xl border border-primary/20 overflow-hidden"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-gray-400 font-medium px-4 py-3">Name</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Breed</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Owner</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Tag QR</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Status</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {pets.map((pet) => (
                <tr key={pet._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{pet.name}</td>
                  <td className="px-4 py-3 text-gray-300">{pet.breed}</td>
                  <td className="px-4 py-3 text-gray-300">
                    {pet.ownerId
                      ? `${pet.ownerId.firstName} ${pet.ownerId.lastName}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                    {pet.tagId?.qrCode ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={pet.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(pet.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pagination && pagination.pages > 1 && (
            <div className="px-4 pb-4">
              <Pagination
                page={page}
                totalPages={pagination.pages}
                onPrev={() => setPage((p) => Math.max(1, p - 1))}
                onNext={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              />
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Visual check**

Open Admin → Pets. Confirm:
- Table renders with all columns
- Status dropdown filters results and resets to page 1
- Pagination works

- [ ] **Step 3: Commit**

```bash
git add frontend/components/Dashboard/Admin/PetsPanel.tsx
git commit -m "feat: add admin PetsPanel with status filter and pagination"
```

---

## Task 8: OrdersPanel

**Files:**
- Create: `frontend/components/Dashboard/Admin/OrdersPanel.tsx`

**Interfaces:**
- Consumes: `getAdminOrders(page, status)`, `updateAdminOrderStatus(id, status, trackingNumber)` from `../../../api/admin-api`; `AdminOrder`, `AdminPagination`, `OrderStatus` from `../../../api/admin-types`

- [ ] **Step 1: Create OrdersPanel**

Create `frontend/components/Dashboard/Admin/OrdersPanel.tsx`:

```typescript
'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X } from 'lucide-react';
import { getAdminOrders, updateAdminOrderStatus } from '../../../api/admin-api';
import type { AdminOrder, AdminPagination, OrderStatus } from '../../../api/admin-types';

const STATUS_COLORS: Record<string, string> = {
  delivered: 'text-green-400 bg-green-400/10',
  paid: 'text-green-400 bg-green-400/10',
  processing: 'text-amber-400 bg-amber-400/10',
  pending: 'text-amber-400 bg-amber-400/10',
  shipped: 'text-amber-400 bg-amber-400/10',
  cancelled: 'text-red-400 bg-red-400/10',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[status] ?? 'text-gray-400 bg-gray-400/10'}`}>
      {status}
    </span>
  );
}

function Pagination({
  page,
  totalPages,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between mt-4">
      <button onClick={onPrev} disabled={page === 1} className="px-4 py-2 bg-black/40 text-white rounded-lg disabled:opacity-40 hover:bg-white/10 transition-colors text-sm">
        Previous
      </button>
      <span className="text-gray-400 text-sm">Page {page} of {totalPages}</span>
      <button onClick={onNext} disabled={page >= totalPages} className="px-4 py-2 bg-black/40 text-white rounded-lg disabled:opacity-40 hover:bg-white/10 transition-colors text-sm">
        Next
      </button>
    </div>
  );
}

const ALL_STATUSES: OrderStatus[] = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];

interface UpdateModalProps {
  order: AdminOrder;
  onClose: () => void;
  onSuccess: (updated: AdminOrder) => void;
}

function UpdateStatusModal({ order, onClose, onSuccess }: UpdateModalProps) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    const updated = await updateAdminOrderStatus(order._id, status, trackingNumber || undefined);
    setSaving(false);
    if (updated) {
      onSuccess(updated);
    } else {
      setError('Failed to update order status. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-black/90 border border-primary/20 rounded-2xl p-6 w-full max-w-md"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-white font-bold text-xl mb-1">Update Order Status</h3>
        <p className="text-gray-400 text-sm mb-6">
          Order #{order._id.slice(-8).toUpperCase()} ·{' '}
          {order.userId ? `${order.userId.firstName} ${order.userId.lastName}` : 'Unknown'}
        </p>

        <label className="block text-gray-400 text-sm mb-1">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
          className="w-full bg-black/60 border border-primary/20 text-white rounded-lg px-4 py-2 text-sm mb-4 focus:outline-none focus:border-primary/60"
        >
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>

        <label className="block text-gray-400 text-sm mb-1">Tracking Number (optional)</label>
        <input
          type="text"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder="e.g. 1Z999AA10123456784"
          className="w-full bg-black/60 border border-primary/20 text-white rounded-lg px-4 py-2 text-sm mb-6 focus:outline-none focus:border-primary/60"
        />

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-white/20 text-white rounded-full text-sm hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-gradient-to-br from-primary via-black to-black text-white rounded-full text-sm font-medium disabled:opacity-50 hover:shadow-primary/30 hover:shadow-lg transition-all"
          >
            {saving ? 'Saving...' : 'Update Status'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function OrdersPanel() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [pagination, setPagination] = useState<AdminPagination | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  const fetchOrders = (p: number, s: string) => {
    setLoading(true);
    getAdminOrders(p, s || undefined).then((result) => {
      if (result) {
        setOrders(result.data);
        setPagination(result.pagination);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchOrders(page, statusFilter);
  }, [page, statusFilter]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleUpdateSuccess = (updated: AdminOrder) => {
    setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
    setSelectedOrder(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white">Orders</h3>
          <p className="text-gray-400 text-sm mt-1">
            {pagination ? `${pagination.total} total` : ''}
          </p>
        </div>
        <select
          value={statusFilter}
          onChange={handleStatusChange}
          className="bg-black/40 border border-primary/20 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/60"
        >
          <option value="">All Statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-white font-semibold">No orders found</p>
          <p className="text-gray-400 text-sm">Try a different filter</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 backdrop-blur-md rounded-xl border border-primary/20 overflow-hidden"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-gray-400 font-medium px-4 py-3">Order ID</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Customer</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Pet</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Status</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Total</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Date</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                    #{order._id.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-4 py-3 text-white">
                    {order.userId
                      ? `${order.userId.firstName} ${order.userId.lastName}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-300">{order.petId?.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-white font-medium">${order.total.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-3 py-1 bg-gradient-to-br from-primary via-black to-black text-white rounded-full text-xs hover:shadow-primary/30 hover:shadow-md transition-all"
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pagination && pagination.pages > 1 && (
            <div className="px-4 pb-4">
              <Pagination
                page={page}
                totalPages={pagination.pages}
                onPrev={() => setPage((p) => Math.max(1, p - 1))}
                onNext={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              />
            </div>
          )}
        </motion.div>
      )}

      <AnimatePresence>
        {selectedOrder && (
          <UpdateStatusModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onSuccess={handleUpdateSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: Visual check**

Open Admin → Orders. Confirm:
- Table renders all columns
- "Update" button opens modal with current status pre-selected
- Saving a new status closes modal and updates the row in-place (no full reload)
- Tracking number field is optional
- Status filter and pagination work

- [ ] **Step 3: Commit**

```bash
git add frontend/components/Dashboard/Admin/OrdersPanel.tsx
git commit -m "feat: add admin OrdersPanel with update-status modal"
```

---

## Task 9: AnalyticsPanel

**Files:**
- Create: `frontend/components/Dashboard/Admin/AnalyticsPanel.tsx`

**Interfaces:**
- Consumes: `getScanAnalytics(days)` from `../../../api/admin-api`; `ScanAnalytics` from `../../../api/admin-types`

- [ ] **Step 1: Create AnalyticsPanel**

Create `frontend/components/Dashboard/Admin/AnalyticsPanel.tsx`:

```typescript
'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Dog, MapPin, Activity } from 'lucide-react';
import { getScanAnalytics } from '../../../api/admin-api';
import type { ScanAnalytics } from '../../../api/admin-types';

const DAY_OPTIONS = [7, 30, 90] as const;
type Days = (typeof DAY_OPTIONS)[number];

export default function AnalyticsPanel() {
  const [analytics, setAnalytics] = useState<ScanAnalytics | null>(null);
  const [days, setDays] = useState<Days>(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getScanAnalytics(days).then((data) => {
      setAnalytics(data);
      setLoading(false);
    });
  }, [days]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white">Scan Analytics</h3>
          <p className="text-gray-400 text-sm mt-1">QR code scan activity</p>
        </div>
        <div className="flex gap-2">
          {DAY_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 rounded-lg text-sm transition-all border-b border-primary ${
                days === d
                  ? 'bg-gradient-to-br from-primary via-black via-60% to-black text-white shadow-md shadow-primary/40'
                  : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary" />
        </div>
      ) : !analytics ? (
        <p className="text-red-400 text-center py-10">Failed to load analytics.</p>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { icon: QrCode, label: 'Total Scans', value: analytics.totalScans, color: 'bg-cyan-500/20' },
              { icon: Dog, label: 'Unique Pets Scanned', value: analytics.uniquePets, color: 'bg-green-500/20' },
              {
                icon: MapPin,
                label: 'Top Location',
                value: analytics.scansByLocation[0]?._id ?? 'N/A',
                color: 'bg-purple-500/20',
              },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-black/40 backdrop-blur-md rounded-xl border border-primary/20 p-6 flex items-center gap-4"
                >
                  <div className={`p-3 rounded-lg ${card.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">{card.label}</p>
                    <p className="text-white text-2xl font-bold">{card.value}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Top scanned pets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-black/40 backdrop-blur-md rounded-xl border border-primary/20 p-6"
          >
            <h4 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Top Scanned Pets
            </h4>

            {analytics.topScannedPets.length === 0 ? (
              <p className="text-gray-400 text-center py-6">No scan data for this period.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-gray-400 font-medium px-2 py-3">#</th>
                    <th className="text-left text-gray-400 font-medium px-2 py-3">Pet Name</th>
                    <th className="text-left text-gray-400 font-medium px-2 py-3">Owner</th>
                    <th className="text-left text-gray-400 font-medium px-2 py-3">Scans</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topScannedPets.map((entry, idx) => {
                    const pet = entry.pet[0];
                    return (
                      <tr key={entry._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-2 py-3 text-gray-400">{idx + 1}</td>
                        <td className="px-2 py-3 text-white font-medium">{pet?.name ?? '—'}</td>
                        <td className="px-2 py-3 text-gray-300">
                          {pet?.ownerId
                            ? `${pet.ownerId.firstName} ${pet.ownerId.lastName}`
                            : '—'}
                        </td>
                        <td className="px-2 py-3">
                          <span className="text-primary font-bold">{entry.count}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Visual check**

Open Admin → Analytics. Confirm:
- 7d / 30d / 90d day selector refetches and updates all stats
- 3 stat cards render correctly
- Top scanned pets table renders with rank, pet name, owner, scan count
- Empty state shows when no data

- [ ] **Step 3: Final TypeScript check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: Zero errors across all new files.

- [ ] **Step 4: Commit**

```bash
git add frontend/components/Dashboard/Admin/AnalyticsPanel.tsx
git commit -m "feat: add admin AnalyticsPanel with scan stats and top pets"
```

---

## End-to-End Verification

- [ ] Log in as admin → see 5 tabs (Pets, Tags, Orders, Profile, Admin)
- [ ] Log in as regular user → see 4 tabs, no Admin tab
- [ ] Admin → Overview: all 6 stat cards load, recent orders show
- [ ] Admin → Users: search filters live, pagination works
- [ ] Admin → Pets: status dropdown filters, pagination works
- [ ] Admin → Orders: Update button opens modal, saving updates row in place
- [ ] Admin → Analytics: day selector switches between 7/30/90d data
- [ ] Check `logs/admin-audit.log` — every admin request is logged with adminId, email, path, IP
- [ ] Send 61 rapid requests to `/api/admin/stats` — 61st returns 429 with `RATE_LIMITED` code
- [ ] Manually expire/remove `authToken` from localStorage mid-session, then trigger any admin API call — redirects to `/`
