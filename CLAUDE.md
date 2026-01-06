# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **MRP Tonic Life** - a Manufacturing Resource Planning (MRP) system for Tonic Life, built as a Next.js 16 frontend application with TypeScript. The system manages products, suppliers, bills of materials (BOMs), production orders, inventory, and material requirement planning for a manufacturing company.

## Development Commands

### Running the Application
```bash
npm run dev          # Start development server on http://localhost:3000
npm run build        # Build production bundle
npm start            # Start production server
npm run lint         # Run ESLint
```

### Environment Setup
The backend API URL is configured via environment variables in `.env.local`:
- `NEXT_PUBLIC_API_URL` - Backend API base URL (default: http://localhost:3001)

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **State Management**: React Context API (AuthContext)
- **HTTP Client**: Axios with interceptors
- **Authentication**: JWT tokens stored in cookies (js-cookie)
- **Forms**: Native React + validation
- **Icons**: Heroicons v2
- **Charts**: Recharts
- **Date Handling**: date-fns
- **Notifications**: **Sonner ONLY** - ⚠️ **CRITICAL: NEVER use `alert()`, `window.alert()`, or `react-hot-toast`**
- **Real-time**: Socket.io-client (WebSocket support)

### Corporate Design System
The application uses Tonic Life corporate colors:
- **Primary Blue**: `#1e3a6f` (navy blue)
- **Secondary Green**: `#7cb342`
- Active navigation items use green, sidebar uses blue background
- **NO EMOJIS** - use Heroicons instead

### Project Structure

```
mrp-web/
├── app/                    # Next.js App Router pages
│   ├── login/             # Authentication pages
│   ├── dashboard/         # Main dashboard
│   ├── products/          # Product management (including categories)
│   ├── suppliers/         # Supplier management
│   ├── boms/              # Bill of Materials
│   ├── production/        # Production orders
│   ├── mrp/               # MRP execution and demands
│   ├── inventory/         # Inventory control
│   ├── purchase-orders/   # Purchase order management
│   ├── layout.tsx         # Root layout with AuthProvider and Toaster
│   └── page.tsx           # Root redirect (login or dashboard)
│
├── components/            # React components organized by feature
│   ├── auth/             # ProtectedRoute
│   ├── layout/           # Sidebar, Header, DashboardLayout
│   ├── products/         # ProductsList, ProductModal, CategoryModal, CategoriesModal, ProductsFilters
│   ├── suppliers/        # SuppliersList, SupplierModal, SupplierProductsModal, SuppliersFilters
│   ├── boms/             # BomsList, BomModal, BomViewModal, BomsFilters
│   ├── production/       # ProductionOrdersList, ProductionOrderModal, MaterialConsumptionModal, ProductionOutputModal
│   ├── mrp/              # DemandsList, DemandModal, MrpExecutionModal
│   ├── inventory/        # InventoryTable, MovementModal, AdjustmentModal, KardexModal
│   └── purchase-orders/  # PurchaseOrdersList, PurchaseOrderModal, ReceiveItemsModal
│
├── contexts/
│   └── AuthContext.tsx   # Global authentication state and methods
│
├── lib/
│   ├── services/         # API service layer
│   │   ├── api.ts       # Axios instance with auth interceptors
│   │   ├── auth.service.ts
│   │   ├── products.service.ts
│   │   ├── suppliers.service.ts
│   │   ├── boms.service.ts
│   │   └── production-orders.service.ts
│   └── types/           # TypeScript type definitions
│       ├── index.ts     # Common types (User, Product, Supplier, Bom, enums)
│       ├── category.ts
│       ├── products.ts
│       ├── suppliers.ts
│       ├── boms.ts
│       ├── production-orders.ts
│       ├── mrp.ts
│       ├── inventory.ts
│       ├── purchase-order.ts
│       └── specifications.ts
│
└── DEVELOPMENT_PLAN.md  # Detailed Spanish development plan with component specifications
```

### Key Architectural Patterns

#### 1. Authentication Flow
- JWT tokens stored in cookies via `js-cookie`
- `AuthContext` provides global auth state: `user`, `login()`, `logout()`, `checkAuth()`, `hasRole()`
- `ProtectedRoute` component wraps protected pages
- API interceptors in `lib/services/api.ts`:
  - Automatically attach `Authorization: Bearer <token>` to requests
  - Auto-refresh expired tokens on 401 responses
  - Redirect to `/login` if refresh fails

#### 2. API Service Layer Pattern
All API calls go through service modules in `lib/services/`:
```typescript
// Example pattern from services
import api from './api';

export const productsService = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};
```

#### 3. Component Organization
- **Pages** (`app/*/page.tsx`): Handle routing, data fetching, and orchestration
- **Feature Components** (`components/*/`): Reusable feature-specific UI components
- **Layout Components** (`components/layout/`): Sidebar, Header, DashboardLayout
- Components typically receive data as props and emit events via callbacks

#### 4. Type System
- Centralized TypeScript definitions in `lib/types/`
- Enums for constants: `UserRole`, `ProductType`, `SupplierType`, `BomStatus`, `UnitMeasure`
- Standard API response types: `ApiResponse<T>`, `PaginatedResponse<T>`
- Domain models: `User`, `Product`, `Supplier`, `Bom`, `ProductCategory`

#### 5. Error Handling
- Global error interceptor in `lib/services/api.ts` shows toast notifications
- HTTP error codes mapped to user-friendly messages (401, 403, 404, 500)
- Toast notifications via `react-hot-toast` (configured in root layout)

## Backend API Integration

The backend API base URL is at `http://localhost:3001` (configurable via `NEXT_PUBLIC_API_URL`).

### Available API Endpoints
Based on the service files, the following backend APIs are integrated:

- **Auth**: `/auth/login`, `/auth/logout`, `/auth/refresh`, `/auth/me`
- **Products**: `/products` (CRUD)
- **Product Categories**: `/product-categories` (CRUD with hierarchy support)
- **Suppliers**: `/suppliers` (CRUD)
- **Supplier Products**: Relationship between suppliers and products with pricing
- **BOMs**: `/boms` (CRUD for bills of materials)
- **Production Orders**: `/production-orders` (CRUD)
- **MRP**: Material requirement planning execution
- **Inventory**: Stock management and movements
- **Purchase Orders**: Purchase order management

### WebSocket Support
The application has Socket.io-client installed for real-time updates. WebSocket connection should use the backend URL configured in `NEXT_PUBLIC_API_URL`.

## User Roles & Permissions

The system supports role-based access control with the following roles (defined in `lib/types/index.ts`):

- `SUPER_ADMIN` - Full system access
- `GERENTE_PRODUCCION` - Production manager
- `PLANEADOR` - Planning specialist
- `SUPERVISOR` - Production supervisor
- `COMPRADOR` - Purchasing
- `ALMACENISTA` - Warehouse manager
- `CALIDAD` - Quality control
- `CONSULTA` - Read-only access

Use `useAuth().hasRole([...roles])` to check permissions.

## Key Implementation Details

### Path Aliasing
The project uses `@/*` for absolute imports (configured in `tsconfig.json`):
```typescript
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/services/api';
import { Product } from '@/lib/types';
```

### Protected Routes
Wrap pages that require authentication with `ProtectedRoute`:
```typescript
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function SomePage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'PLANEADOR']}>
      {/* page content */}
    </ProtectedRoute>
  );
}
```

### Toast Notifications with Sonner

⚠️ **CRITICAL RULE:** This project uses **ONLY Sonner** for toast notifications.

#### ✅ CORRECT Import (ALWAYS use this):
```typescript
import { toast } from 'sonner';
```

#### ❌ NEVER USE THESE:
```typescript
// ❌ ABSOLUTELY FORBIDDEN
alert('message');                      // NO - Browser alerts
window.alert('message');               // NO - Browser alerts
confirm('message');                    // NO - Browser confirms
import toast from 'react-hot-toast';  // NO - Old library (REMOVED)
import { Toaster } from 'react-hot-toast';  // NO - Old library (REMOVED)
```

#### Toast Methods Available:
```typescript
// Success notifications
toast.success('Categoría creada exitosamente');

// Error notifications
toast.error('Error al guardar los datos');

// Info notifications
toast.info('Recuerda completar todos los campos');

// Warning notifications
toast.warning('Esta acción no se puede deshacer');

// Loading notifications
const loadingId = toast.loading('Procesando...');
// ... async operation
toast.dismiss(loadingId);
toast.success('Completado');

// Promise-based (automatic loading → success/error)
toast.promise(
  fetchData(),
  {
    loading: 'Cargando...',
    success: 'Datos cargados',
    error: 'Error al cargar',
  }
);
```

#### Toaster Configuration (app/layout.tsx):
```typescript
import { Toaster } from 'sonner';

<Toaster
  position="bottom-right"
  richColors
  closeButton
  duration={4000}
/>
```

Configuration details:
- **Position**: bottom-right (no obstaculiza el contenido principal)
- **Rich Colors**: Enabled (colores semánticos automáticos)
- **Close Button**: Enabled (mejor UX para usuarios)
- **Duration**: 4000ms (4 segundos)

#### Best Practices:
1. **Always use Spanish** for user-facing messages
2. **Be concise** - Keep messages under 50 characters when possible
3. **Be specific** - "Categoría creada" instead of "Éxito"
4. **Avoid technical jargon** - No stack traces or technical error codes
5. **Use appropriate types**:
   - `success` - For completed actions (created, updated, deleted)
   - `error` - For failures and validation errors
   - `warning` - For cautions and confirmations needed
   - `info` - For informational messages
   - `loading` - For async operations

#### Examples from the Project:
```typescript
// Creating a category
toast.success('Categoría creada exitosamente');

// Validation error
toast.error('Error: El código es requerido');

// Network error
toast.error('Error de conexión. Verifica tu conexión a internet');

// Loading operation
const toastId = toast.loading('Guardando categoría...');
try {
  await api.post('/categories', data);
  toast.success('Categoría guardada', { id: toastId });
} catch (error) {
  toast.error('Error al guardar', { id: toastId });
}
```

#### Why Sonner Over react-hot-toast:
- ✅ Better performance and smaller bundle size
- ✅ Smoother animations and better UX
- ✅ Built-in rich colors (semantic styling)
- ✅ Better TypeScript support
- ✅ Promise support for async operations
- ✅ Better stacking and queueing of multiple toasts
- ✅ Active maintenance and modern codebase

**Migration Status:** ✅ Complete - All 24 components migrated to Sonner (20 Nov 2025)

### Layout Structure
Most pages use `DashboardLayout` which includes:
- `Sidebar` - Navigation menu with corporate colors
- `Header` - Top bar with user info and notifications
- Main content area with appropriate spacing

## Development Status

### Completed Modules (as per DEVELOPMENT_PLAN.md)
- ✅ Authentication (login, logout, token refresh)
- ✅ Base layout and navigation
- ✅ Dashboard page
- ✅ User management
- ✅ Product categories (with hierarchy, icons, colors)

### Partially Completed
- Products module (categories done, main CRUD in progress)
- Suppliers module (structure ready)
- BOMs module (structure ready)
- Production orders (structure ready)
- MRP (structure ready)
- Inventory (structure ready)
- Purchase orders (structure ready)

### Module File Organization
Each module follows a consistent pattern:
- `app/{module}/page.tsx` - Main page
- `components/{module}/{Module}List.tsx` - List view
- `components/{module}/{Module}Modal.tsx` - Create/Edit modal
- `components/{module}/{Module}Filters.tsx` - Filter controls
- `lib/services/{module}.service.ts` - API calls
- `lib/types/{module}.ts` - TypeScript types

## Common Patterns

### Creating a New Feature Module
1. Define types in `lib/types/{feature}.ts`
2. Create API service in `lib/services/{feature}.service.ts`
3. Build components in `components/{feature}/`
4. Create page in `app/{feature}/page.tsx`
5. Add navigation link to `components/layout/Sidebar.tsx`
6. Use ProtectedRoute with appropriate roles

### Styling Guidelines
- Use Tailwind CSS classes
- Follow corporate color scheme (blue/green)
- Use Heroicons for all icons (NOT emojis)
- Maintain consistent spacing and component sizing
- Responsive design with mobile-first approach
- **Modal overlays**: ALWAYS use `backdrop-blur-md` instead of transparent background for better visual hierarchy and user focus
- **Modal closing behavior**: ⚠️ **CRITICAL** - Modals should ONLY close when clicking the X button (close icon). NEVER allow modals to close by clicking on the backdrop/overlay. Remove `onClick={onClose}` from backdrop elements.

### Form Handling Pattern
While no specific form library is mandated, forms typically:
1. Use controlled components with React state
2. Validate on submit or onChange
3. Show loading states during submission
4. Display toast notifications for success/error
5. Close modals and refresh data on success

### Input Field Guidelines
All input fields must follow these standards for consistency and better UX:

1. **Padding**: All inputs, selects, and textareas MUST include `px-3 py-2` for internal padding
   ```tsx
   // ✅ CORRECT
   <input className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2" />
   <select className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2" />
   <textarea className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2" />

   // ❌ INCORRECT (missing padding)
   <input className="mt-1 block w-full rounded-md border-gray-300" />
   ```

2. **Helper Text**: Each field should have a descriptive helper text below it
   ```tsx
   <input type="text" name="code" placeholder="MP694" />
   <p className="mt-1 text-xs text-gray-500">Identificador único del producto</p>
   ```

3. **Placeholders**: Use realistic examples in placeholders to guide users
   - Product Code: `MP694`
   - Name: `CAFÉ SOLUBLE, POLVO`
   - Description: `Café soluble en polvo para fórmulas`
   - Conversion Factor: `1000`
   - Lead Time: `15`

4. **Helper Text Examples**:
   - Code: "Identificador único del producto"
   - Purchase Unit: "Unidad en la que compras el producto al proveedor"
   - Inventory Unit: "Unidad en la que controlas el inventario interno"
   - Conversion Factor: "Cuántas unidades de inventario hay en 1 unidad de compra. Ejemplo: 1 KG = 1000 G, el factor es 1000"
   - Lead Time: "Días desde pedido hasta recepción"
   - Min Stock: "Nivel mínimo permitido en inventario"
   - Reorder Point: "Nivel que activa una nueva compra"

5. **Validation Errors**: Display below helper text in red
   ```tsx
   <p className="mt-1 text-xs text-gray-500">Helper text</p>
   {errors.field && (
     <p className="mt-1 text-sm text-red-600">{errors.field}</p>
   )}
   ```
