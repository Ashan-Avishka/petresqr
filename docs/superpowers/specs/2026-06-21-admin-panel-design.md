# Admin Panel Design Spec
**Date:** 2026-06-21  
**Project:** PetResQR  
**Status:** Approved

---

## Overview

Add a full admin panel to the existing customer dashboard at `/dashboard`. Admin users (role: `'admin'`) see a fifth "Admin" tab with a `Shield` icon in the sidebar. Inside it, a horizontal sub-tab bar switches between five panels: Overview, Users, Pets, Orders, and Analytics. Customer tabs (Pets, Tags, Orders, Profile) remain fully visible and usable for admin users.

Scope: frontend UI + API client + backend security hardening. No new backend controller methods — all 5 existing `AdminController` endpoints are already complete.

---

## Backend

### Existing endpoints (no changes needed)

| Method | Route | Controller method |
|--------|-------|------------------|
| GET | `/api/admin/stats` | `getDashboardStats` |
| GET | `/api/admin/users` | `getUsers` |
| GET | `/api/admin/users/:id` | `getUserById` |
| GET | `/api/admin/pets` | `getPets` |
| GET | `/api/admin/orders` | `getOrders` |
| PUT | `/api/admin/orders/:id/status` | `updateOrderStatus` |
| GET | `/api/admin/analytics/scans` | `getScanAnalytics` |

All routes already apply `authenticateToken` + `requireAdmin` middleware globally.

### New: Audit logging middleware

**File:** `backend/middleware/adminAudit.ts`

Logs every admin action to `logs/admin-audit.log` via the existing Winston logger.

Log entry shape:
```json
{
  "timestamp": "ISO string",
  "adminId": "mongodb user id",
  "adminEmail": "admin@example.com",
  "method": "PUT",
  "path": "/api/admin/orders/abc123/status",
  "resourceId": "abc123",
  "ip": "request IP",
  "body": { "status": "shipped", "trackingNumber": "TRK123" }
}
```

Applied per-route in `backend/routes/admin.ts` after `requireAdmin`. Body is only logged for mutating methods (PUT, POST, DELETE).

### New: Rate limiting

**Package:** `express-rate-limit` (already installed in `package.json`)

Config: 60 requests per 15 minutes per IP, applied to the entire `/api/admin` router. Returns `429 Too Many Requests` with `{ success: false, error: { code: 'RATE_LIMITED', message: '...' } }`.

---

## Frontend

### API client

**File:** `frontend/api/admin-api.ts`

Functions:
- `getAdminStats(): Promise<AdminStats>`
- `getAdminUsers(page: number, search?: string): Promise<PaginatedResponse<AdminUser>>`
- `getAdminUserById(id: string): Promise<AdminUserDetail>`
- `getAdminPets(page: number, status?: string): Promise<PaginatedResponse<AdminPet>>`
- `getAdminOrders(page: number, status?: string): Promise<PaginatedResponse<AdminOrder>>`
- `updateAdminOrderStatus(id: string, status: string, trackingNumber?: string): Promise<AdminOrder>`
- `getScanAnalytics(days: number): Promise<ScanAnalytics>`

All functions use the existing `client.ts` fetch wrapper. On 401/403 response, redirect to `/` using `window.location.href = '/'` — no modal, just a clean redirect. The unauthenticated home page already handles the login flow.

**File:** `frontend/api/admin-types.ts`

TypeScript interfaces for all admin API response shapes.

### Component tree

```
dashboard/page.tsx                        ← adds "Admin" tab for role === 'admin'
└── AdminTab.tsx                          ← horizontal sub-tab shell
    ├── OverviewPanel.tsx                 ← stat cards + recent orders list
    ├── UsersPanel.tsx                    ← paginated table + search input
    ├── PetsPanel.tsx                     ← paginated table + status filter dropdown
    ├── OrdersPanel.tsx                   ← paginated table + update status modal
    └── AnalyticsPanel.tsx                ← scan stat cards + top pets table
```

Each panel manages its own fetch state (loading, error, data) independently — no shared context.

### Modified files

- `frontend/src/app/dashboard/page.tsx` — add `{ id: 'admin', label: 'Admin', icon: Shield }` tab entry, conditionally rendered only when `user?.role === 'admin'`

### UI patterns (matching existing design system)

**Colors / tokens:**
- Primary: `#FABC3F`
- Background gradient: `bg-gradient-to-br from-primary/60 via-black to-black` (matches dashboard page)
- Card: `bg-black/40 backdrop-blur-md rounded-xl border border-primary/20`
- Active tab: `bg-gradient-to-br from-primary via-black via-60% to-black text-white shadow-md shadow-primary/40 scale-110`

**Typography:** Clash Display (body font via globals.css)

**Animations:** All panels animate in with:
```tsx
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} />
```

**Buttons:** `bg-gradient-to-br from-primary via-black to-black text-white rounded-full`

**Status badges:** Inline `<span>` pill
- green (`text-green-400 bg-green-400/10`) — active, delivered, paid
- amber (`text-amber-400 bg-amber-400/10`) — pending, processing
- red (`text-red-400 bg-red-400/10`) — cancelled, inactive

**Tables:** `bg-black/40 rounded-xl` container, `hover:bg-white/5` rows, `border-b border-white/5` row separators

**Sub-tabs (inside AdminTab):** Horizontal button row, same button class as existing sidebar tabs. Active item has amber glow underline.

**Pagination:** Prev/Next buttons with current page indicator, applied to Users, Pets, Orders panels.

**Update order status:** Inline modal (same pattern as `MessageModal`) — status dropdown + optional tracking number text input + confirm button.

**Loading state:** Spinning amber border circle, same as existing `authLoading` spinner in dashboard.

**Empty state:** Lucide icon centered + white heading + gray subtext, same as existing "No pets yet" empty state in `PetsTab`.

---

## Security

### Backend (complete)
- Firebase JWT verified on every request via `authenticateToken`
- `requireAdmin` checks `user.role === 'admin'`, returns 403 otherwise
- `isActive: true` check in `authenticateToken` — deactivated users cannot authenticate
- Rate limiting: 60 req / 15 min per IP on all `/api/admin/*` routes
- Audit log: every admin request logged with adminId, email, method, path, IP, body

### Frontend (two layers)
1. **Sidebar guard:** Admin tab rendered only when `user?.role === 'admin'`. Regular users never see it.
2. **Component guard:** `AdminTab.tsx` re-checks `user?.role === 'admin'` at render time. If not admin, renders a "Not Authorized" screen (Lock icon + message, same style as existing unauthenticated screen).
3. **API 401/403 handler:** Admin API client redirects to `/` and shows session-expired notification on auth failure.

### Out of scope
- Promoting/demoting users to admin (database-only operation for now)
- MFA, IP allowlisting, session invalidation on role change

---

## Panel Specifications

### OverviewPanel
Data: `GET /api/admin/stats`

Displays:
- 6 stat cards in a 3-column grid: Total Users, Total Pets, Total Orders, Total Scans, Revenue This Month, Active Users (30d)
- Recent orders list (last 5): order ID, user name, pet name, status badge, created date

### UsersPanel
Data: `GET /api/admin/users?page=N&search=X`

Displays:
- Search input (debounced 300ms)
- Table: Name, Email, Role badge, Auth Provider, Status (active/inactive), Join Date
- Pagination controls

### PetsPanel
Data: `GET /api/admin/pets?page=N&status=X`

Displays:
- Status filter dropdown (All / Active / Inactive / Pending)
- Table: Pet Name, Breed, Owner Name, Tag QR Code, Status badge, Created Date
- Pagination controls

### OrdersPanel
Data: `GET /api/admin/orders?page=N&status=X`  
Mutation: `PUT /api/admin/orders/:id/status`

Displays:
- Status filter dropdown (All / Pending / Paid / Processing / Shipped / Delivered / Cancelled)
- Table: Order ID (truncated), User Name, Pet Name, Status badge, Total, Created Date, Action button
- "Update Status" button opens inline modal with status dropdown + optional tracking number field

### AnalyticsPanel
Data: `GET /api/admin/analytics/scans?days=N`

Displays:
- Days selector: 7 / 30 / 90 days
- 3 stat cards: Total Scans, Unique Pets Scanned, Top Location
- Top 10 scanned pets table: Pet Name, Scan Count, Owner

---

## File Checklist

### New files
- [ ] `backend/middleware/adminAudit.ts`
- [ ] `frontend/api/admin-types.ts`
- [ ] `frontend/api/admin-api.ts`
- [ ] `frontend/components/Dashboard/AdminTab.tsx`
- [ ] `frontend/components/Dashboard/Admin/OverviewPanel.tsx`
- [ ] `frontend/components/Dashboard/Admin/UsersPanel.tsx`
- [ ] `frontend/components/Dashboard/Admin/PetsPanel.tsx`
- [ ] `frontend/components/Dashboard/Admin/OrdersPanel.tsx`
- [ ] `frontend/components/Dashboard/Admin/AnalyticsPanel.tsx`

### Modified files
- [ ] `backend/routes/admin.ts` — add rate limiter + audit middleware
- [ ] `frontend/src/app/dashboard/page.tsx` — add conditional Admin tab
