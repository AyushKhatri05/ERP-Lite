# ERP Lite – Complete Backend ↔ Frontend Integration

This package makes **every button, action, and UI interaction** in ERP Lite fully
functional by wiring them to real PostgreSQL-backed API endpoints.

---

## What's Included

| File | Purpose |
|------|---------|
| `backend/src/routes/inventoryRoutes.js` | Full CRUD + stock inward/outward routes with auth |
| `backend/src/routes/salesRoutes.js` | All sales routes in correct order (no route collision) |
| `backend/src/controllers/salesController.js` | Transaction-safe checkout, refund, invoice, reports |
| `backend/src/routes/userRoutes.js` | Users + profile + audit routes |
| `backend/src/controllers/userController.js` | Toggle status, update role, audit logs |
| `backend/src/routes/authRoutes.js` | Login, register, logout, 2FA setup/enable/disable |
| `backend/src/routes/analyticsRoutes.js` | All analytics endpoints |
| `backend/src/services/analyticsService.js` | KPIs, charts, ABC, velocity, trends (real DB) |
| `backend/database/migrations/002_integration_fixes.sql` | Missing columns + indexes |
| `frontend/src/utils/api.js` | Complete `apiService` – every button mapped |
| `frontend/src/hooks/useAuth.js` | Full Zustand store: login, 2FA, change-pw, profile |
| `frontend/src/hooks/useInventory.js` | All inventory hooks with optimistic updates |
| `frontend/src/hooks/useSales.js` | All sales hooks |
| `frontend/src/pages/dashboard.jsx` | Real KPIs + low stock from API |
| `frontend/src/pages/sales/index.jsx` | Real stat cards, search, refund, invoice link |
| `frontend/src/pages/sales/new.jsx` | Debounced product search, cart, checkout |
| `frontend/src/pages/sales/[id]/invoice.jsx` | Real invoice data + print button |
| `frontend/src/pages/analytics/index.jsx` | 4 tabs: Overview, Inventory, Alerts, ABC |
| `frontend/src/pages/users/index.jsx` | Real user list, toggle, edit role, audit log |
| `frontend/src/pages/settings/index.jsx` | Profile, password, 2FA setup/disable |

---

## Step 1 – Apply Files

Copy every file from this package into the matching path in your project,
**replacing** the existing files:

```bash
# From the root of your erp-lite project:
cp -r erp-lite-integration/backend/src  ./backend/src
cp -r erp-lite-integration/backend/database ./backend/database
cp -r erp-lite-integration/frontend/src ./frontend/src
```

---

## Step 2 – Run the New Migration

```bash
cd backend
psql -U your_db_user -d your_db_name -f database/migrations/002_integration_fixes.sql
```

Or if you use the migrate script:

```bash
npm run migrate
```

---

## Step 3 – Verify Backend Dependencies

The auth routes use `qrcode` for 2FA QR generation. Install it if missing:

```bash
cd backend
npm install qrcode
```

All other packages (`bcrypt`, `speakeasy`, `jsonwebtoken`, `express-validator`,
`uuid`) are already in `package.json`.

---

## Step 4 – Start the Application

```bash
# Terminal 1 – Backend
cd backend
npm run dev

# Terminal 2 – Frontend
cd frontend
npm run dev
```

Open http://localhost:3000 and log in with:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@erplite.com | Password123! |
| Manager | manager@erplite.com | Password123! |
| Staff | staff@erplite.com | Password123! |

---

## Button → API Mapping (Complete Reference)

### Auth
| Button | Method | Endpoint |
|--------|--------|----------|
| Login | POST | `/api/auth/login` |
| Register | POST | `/api/auth/register` |
| Logout | POST | `/api/auth/logout` |
| Forgot Password | POST | `/api/auth/forgot-password` |
| Reset Password | POST | `/api/auth/reset-password` |
| Change Password | POST | `/api/auth/change-password` |
| Enable 2FA (get QR) | POST | `/api/auth/2fa/setup` |
| Verify & Enable 2FA | POST | `/api/auth/2fa/enable` |
| Disable 2FA | POST | `/api/auth/2fa/disable` |
| 2FA code at login | POST | `/api/auth/2fa/verify` |

### Inventory
| Button | Method | Endpoint |
|--------|--------|----------|
| Load products list | GET | `/api/inventory/products?page=1&search=` |
| Search products (typeahead) | GET | `/api/inventory/products/search?q=` |
| Add Product | POST | `/api/inventory/products` |
| Edit Product (save) | PUT | `/api/inventory/products/:id` |
| Delete Product | DELETE | `/api/inventory/products/:id` |
| Load low-stock alerts | GET | `/api/inventory/stock/low` |
| Stock value report | GET | `/api/inventory/stock/value` |
| Stock Inward (Add Stock) | POST | `/api/inventory/transactions/inward` |
| Stock Outward (Remove Stock) | POST | `/api/inventory/transactions/outward` |
| Load transactions | GET | `/api/inventory/transactions` |
| Category dropdown | GET | `/api/inventory/categories` |

### Sales
| Button | Method | Endpoint |
|--------|--------|----------|
| Load sales list | GET | `/api/sales?page=1` |
| Search sales | GET | `/api/sales/search?q=` |
| Checkout (create sale) | POST | `/api/sales` |
| View Invoice | GET | `/api/sales/:id/invoice` |
| Refund | POST | `/api/sales/:id/refund` |
| Daily stats (stat cards) | GET | `/api/sales/reports/daily` |
| Top products | GET | `/api/sales/reports/top-products` |

### Analytics
| Button | Method | Endpoint |
|--------|--------|----------|
| Dashboard KPIs | GET | `/api/analytics/dashboard/kpis` |
| Dashboard charts | GET | `/api/analytics/dashboard/charts` |
| Sales trends (period filter) | GET | `/api/analytics/sales/trends?period=month` |
| Inventory velocity | GET | `/api/analytics/inventory/velocity` |
| ABC analysis | GET | `/api/analytics/inventory/abc-analysis` |
| Reorder alerts | GET | `/api/analytics/reorder-alerts` |
| Acknowledge alert | POST | `/api/analytics/reorder-alerts/:id/acknowledge` |
| Per-product forecast | GET | `/api/analytics/forecast/:productId` |

### Users
| Button | Method | Endpoint |
|--------|--------|----------|
| Load users list | GET | `/api/users` |
| Edit User (save) | PUT | `/api/users/:id` |
| Delete User | DELETE | `/api/users/:id` |
| Enable/Disable toggle | POST | `/api/users/:id/toggle-status` |
| My profile | GET | `/api/users/profile/me` |
| Update profile | PUT | `/api/users/profile/me` |
| Audit logs | GET | `/api/users/audit/logs` |

---

## Key Design Decisions

### Transactions for Safety
`POST /api/sales` and `POST /api/sales/:id/refund` both use PostgreSQL
transactions (`BEGIN / COMMIT / ROLLBACK`). If any item has insufficient stock,
the entire sale is rolled back atomically – no partial inventory deductions.

### Reorder Alerts Auto-Trigger
Any stock outward operation (sale or manual) that brings stock ≤ `minimum_stock`
automatically upserts a reorder alert via `ON CONFLICT DO UPDATE`.

### Route Ordering (Critical)
In `salesRoutes.js`, `/search` and `/reports/*` routes are registered **before**
`/:id` to prevent Express matching `search` and `reports` as UUID IDs.

### 2FA Flow
1. `POST /2fa/setup` → returns QR code PNG (base64) + secret
2. User scans QR in their app
3. `POST /2fa/enable` with 6-digit code → verifies and sets `two_factor_enabled = true`
4. On next login, backend returns `{ requiresTwoFactor: true, userId }`
5. Frontend calls `POST /2fa/verify` → gets full JWT token

### RBAC
All protected routes check role permissions via `rbacMiddleware(resource, action)`.
Frontend `useAuth.hasPermission(resource, action)` mirrors the same table to
conditionally show/hide UI elements.
