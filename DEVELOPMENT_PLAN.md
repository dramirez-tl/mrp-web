# Plan de Desarrollo Frontend - Sistema MRP Tonic Life

## Resumen General
Frontend del Sistema MRP desarrollado con Next.js 16, React 19, Tailwind CSS 4, con diseño moderno y profesional usando los colores corporativos de Tonic Life (Azul marino #1e3a6f y Verde #7cb342).

## Stack Tecnológico
- **Framework**: Next.js 16 con App Router
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Icons**: Heroicons (NO emojis)
- **State Management**: Zustand / Context API
- **Forms**: React Hook Form + Zod
- **Tables**: TanStack Table
- **Charts**: Recharts
- **HTTP Client**: Axios
- **WebSocket**: Socket.io-client
- **Date**: date-fns

## Estándares de Diseño UI

### Modales (IMPORTANTE)
- **SIEMPRE** usar `backdrop-blur-md` en el overlay del modal
- **NO** usar background transparente
- Ejemplo de clase para overlay: `fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50`
- Esto proporciona mejor jerarquía visual y mantiene el foco del usuario en el contenido del modal

---

## Configuración de Colores Corporativos

```css
/* tailwind.config.js extend colors */
{
  primary: {
    blue: '#1e3a6f',
    'blue-dark': '#152a54',
    'blue-light': '#2d4d8a',
  },
  secondary: {
    green: '#7cb342',
    'green-dark': '#5a9216',
    'green-light': '#9ccc65',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  status: {
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
  }
}
```

---

## FASE 1: BASE (Semana 1-2) ✅ COMPLETADO

### 1. Autenticación y Layout Base ✅

#### Páginas a crear:

##### `/app/(auth)/login/page.tsx`
- Formulario de login centrado
- Logo de Tonic Life
- Campos: email y contraseña
- Checkbox "Recordarme"
- Link "Olvidé mi contraseña"
- Validación en tiempo real
- Loading state durante autenticación
- Redirección a dashboard tras login exitoso

##### `/app/(auth)/forgot-password/page.tsx`
- Formulario para recuperar contraseña
- Campo de email
- Mensaje de confirmación tras envío

##### `/app/(auth)/reset-password/page.tsx`
- Formulario para nueva contraseña
- Validación de token
- Campos: nueva contraseña y confirmación
- Requisitos de contraseña visibles

##### `/app/(auth)/layout.tsx`
```tsx
// Layout sin sidebar para páginas de auth
export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-blue to-primary-blue-dark flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
```

#### Componentes necesarios:

##### `/components/auth/LoginForm.tsx`
```tsx
interface LoginFormProps {
  onSubmit: (data: LoginData) => Promise<void>;
}

// Campos con validación
- Email (required, email format)
- Password (required, min 8 chars)
- RememberMe checkbox
```

##### `/components/ui/Logo.tsx`
- Logo de Tonic Life
- Versiones para sidebar y login

##### `/components/ui/LoadingSpinner.tsx`
- Spinner con colores corporativos
- Tamaños: sm, md, lg, xl

#### Hooks personalizados:

##### `/hooks/useAuth.ts`
```typescript
export function useAuth() {
  const login = async (credentials: LoginData) => {};
  const logout = async () => {};
  const refreshToken = async () => {};
  const user = useAuthStore(state => state.user);

  return { login, logout, refreshToken, user };
}
```

##### `/hooks/useAuthGuard.ts`
```typescript
export function useAuthGuard(requiredRole?: UserRole) {
  // Verificar autenticación
  // Verificar rol si se especifica
  // Redireccionar si no autorizado
}
```

---

### 2. Layout Principal y Navegación

#### Layout Principal:

##### `/app/(dashboard)/layout.tsx`
```tsx
export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64">
        <TopBar />
        <main className="p-8">
          <Breadcrumbs />
          {children}
        </main>
      </div>
    </div>
  );
}
```

#### Componentes de Layout:

##### `/components/layout/Sidebar.tsx`
- Fondo azul marino (#1e3a6f)
- Logo en la parte superior
- Menú con iconos de Heroicons
- Item activo con fondo verde (#7cb342)
- Hover con opacity
- Footer con usuario actual

```tsx
const menuItems = [
  { icon: HomeIcon, label: 'Dashboard', path: '/dashboard' },
  { icon: CubeIcon, label: 'Productos', path: '/products' },
  { icon: TruckIcon, label: 'Proveedores', path: '/suppliers' },
  { icon: ClipboardDocumentListIcon, label: 'Fórmulas', path: '/boms' },
  { icon: CalculatorIcon, label: 'MRP', path: '/mrp' },
  { icon: ShoppingCartIcon, label: 'Compras', path: '/purchase-orders' },
  { icon: Cog6ToothIcon, label: 'Producción', path: '/production' },
  { icon: ArchiveBoxIcon, label: 'Inventario', path: '/inventory' },
  { icon: BeakerIcon, label: 'Calidad', path: '/quality' },
  { icon: UsersIcon, label: 'Usuarios', path: '/users' },
];
```

##### `/components/layout/TopBar.tsx`
- Barra superior blanca con sombra
- Título de página actual
- Notificaciones (BellIcon)
- Perfil de usuario con dropdown
- Botón de logout

##### `/components/layout/Breadcrumbs.tsx`
- Navegación tipo breadcrumb
- Separador con ChevronRightIcon
- Links navegables excepto el actual

---

### 3. Dashboard Principal

#### Página:

##### `/app/(dashboard)/dashboard/page.tsx`
- Grid de KPI cards
- Gráficos de producción
- Tabla de órdenes pendientes
- Alertas activas
- WebSocket para actualizaciones real-time

#### Componentes:

##### `/components/dashboard/KpiCard.tsx`
```tsx
interface KpiCardProps {
  title: string;
  value: number | string;
  unit?: string;
  icon: React.ComponentType;
  trend?: 'up' | 'down' | 'stable';
  changePercent?: number;
  color?: 'blue' | 'green' | 'yellow' | 'red';
}
```

##### `/components/dashboard/ProductionChart.tsx`
- Gráfico de líneas con producción diaria
- Usando Recharts
- Colores corporativos

##### `/components/dashboard/PendingOrdersTable.tsx`
- Tabla con órdenes pendientes
- Columnas: Orden, Producto, Cantidad, Fecha, Estado
- Badge de estado con colores

##### `/components/dashboard/AlertsList.tsx`
- Lista de alertas activas
- Iconos según severidad
- Acción de dismiss

---

### 4. Gestión de Usuarios

#### Páginas:

##### `/app/(dashboard)/users/page.tsx`
- Tabla de usuarios con paginación
- Búsqueda y filtros
- Botón "Nuevo Usuario"
- Acciones: editar, activar/desactivar

##### `/app/(dashboard)/users/new/page.tsx`
- Formulario de creación de usuario
- Campos: nombre, email, rol, departamento
- Validación en tiempo real

##### `/app/(dashboard)/users/[id]/edit/page.tsx`
- Formulario de edición
- No permite cambiar email
- Historial de actividad

#### Componentes:

##### `/components/users/UsersTable.tsx`
- Usa TanStack Table
- Columnas ordenables
- Filtros por rol y estado
- Acciones con iconos

##### `/components/users/UserForm.tsx`
- Formulario reutilizable
- React Hook Form + Zod
- Select de roles con descripciones

##### `/components/users/RoleBadge.tsx`
- Badge con color según rol
- Tooltip con permisos

---

## FASE 2: CATÁLOGOS (Semana 3-4)

### 5. Gestión de Productos ✅ PARCIALMENTE COMPLETADO

#### Estado Actual:
| Módulo | Estado | Pendiente |
|--------|--------|-----------|
| **Categorías de Productos** | ✅ Completado | - |
| **CRUD de Productos** | ⏳ Pendiente | Implementar todas las páginas y componentes |
| **Especificaciones** | ⏳ Pendiente | Frontend completo |
| **Importación/Exportación** | ⏳ Pendiente | Componente de importación Excel |

#### ✅ Módulos Implementados:
- **Categorías de Productos**:
  - CRUD completo con interfaz visual
  - Jerarquía de categorías con selector padre
  - Personalización con colores e íconos
  - Vista en grid con cards visuales
  - Modal avanzado con preview en tiempo real
  - Integración completa con backend

#### ⏳ Pendiente de Implementar:

**5.1 CRUD Principal de Productos**:
- `/app/(dashboard)/products/page.tsx` - Lista/grid de productos
- `/app/(dashboard)/products/new/page.tsx` - Creación de producto
- `/app/(dashboard)/products/[id]/page.tsx` - Vista detallada
- `/app/(dashboard)/products/[id]/edit/page.tsx` - Edición
- Componentes: ProductCard, ProductsTable, ProductForm, ProductFilters

**5.2 Especificaciones de Productos**:
- Integración con API de especificaciones
- CRUD de especificaciones por producto
- Manejo de plantillas de especificaciones
- Copia de especificaciones entre productos

**5.3 Importación/Exportación**:
- Componente ImportModal para Excel
- Validación y preview de datos
- Mapeo de columnas
- Exportación a Excel

---

### 6. Gestión de Proveedores ⏳ PENDIENTE

#### Estado Actual:
| Módulo | Estado | Pendiente |
|--------|--------|-----------|
| **CRUD de Proveedores** | ⏳ Pendiente | Todas las páginas y componentes |
| **Catálogo de Productos** | ⏳ Pendiente | Gestión de productos por proveedor |
| **Evaluación** | ⏳ Pendiente | Frontend completo |
| **Métricas de Desempeño** | ⏳ Pendiente | Dashboards y gráficos |

#### ⏳ Pendiente de Implementar:

#### Páginas:

##### `/app/(dashboard)/suppliers/page.tsx`
- Lista de proveedores
- Métricas de desempeño
- Filtros y búsqueda

##### `/app/(dashboard)/suppliers/new/page.tsx`
- Formulario de registro
- Validación de RFC
- Datos de contacto

##### `/app/(dashboard)/suppliers/[id]/page.tsx`
- Perfil del proveedor
- Tabs: Info, Productos, Órdenes, Desempeño

##### `/app/(dashboard)/suppliers/[id]/products/page.tsx`
- Catálogo de productos del proveedor
- Precios y lead times
- Histórico de precios

#### Componentes:

##### `/components/suppliers/SupplierCard.tsx`
- Card con info resumida
- Rating con estrellas
- Métricas clave

##### `/components/suppliers/SupplierForm.tsx`
- Formulario completo
- Secciones colapsables
- Validación de campos mexicanos

##### `/components/suppliers/ProductPricingTable.tsx`
- Tabla de productos-precio
- Edición inline
- Histórico de cambios

##### `/components/suppliers/PerformanceMetrics.tsx`
- Gráficos de desempeño
- KPIs del proveedor
- Tendencias

---

### 7. Gestión de BOMs/Fórmulas ⏳ PENDIENTE

#### Estado Actual:
| Módulo | Estado | Pendiente |
|--------|--------|-----------|
| **CRUD de BOMs** | ⏳ Pendiente | Todas las páginas y componentes |
| **Árbol Jerárquico** | ⏳ Pendiente | Visualización de componentes |
| **Control de Versiones** | ⏳ Pendiente | Comparación y aprobación |
| **Cálculo de Costos** | ⏳ Pendiente | Componente de análisis |

#### ⏳ Pendiente de Implementar:

##### `/app/(dashboard)/boms/page.tsx`
- Lista de BOMs/fórmulas
- Filtros por producto y estado
- Versiones activas destacadas

##### `/app/(dashboard)/boms/new/page.tsx`
- Creación con selector de producto
- Tabla de componentes drag & drop
- Cálculo de costos en tiempo real

##### `/app/(dashboard)/boms/[id]/page.tsx`
- Vista detallada
- Árbol de componentes expandible
- Diagrama de proceso

##### `/app/(dashboard)/boms/[id]/edit/page.tsx`
- Edición con control de versiones
- Comparación con versión anterior
- Solicitud de aprobación

#### Componentes:

##### `/components/boms/BomTree.tsx`
- Vista jerárquica expandible
- Iconos según tipo de material
- Cantidades y unidades

##### `/components/boms/ComponentsTable.tsx`
- Tabla editable de componentes
- Drag & drop para reordenar
- Cálculo automático de totales

##### `/components/boms/BomVersionCompare.tsx`
- Comparación lado a lado
- Highlighting de diferencias
- Changelog

##### `/components/boms/CostCalculation.tsx`
- Desglose de costos
- Gráfico de pie
- Costo por unidad

---

## FASE 3: PLANIFICACIÓN (Semana 5-6) ⏳ PENDIENTE

### 8. MRP - Planificación de Materiales ⏳ PENDIENTE

#### Estado Actual:
| Módulo | Estado | Pendiente |
|--------|--------|-----------|
| **Gestión de Demandas** | ⏳ Pendiente | Páginas y componentes |
| **Ejecución MRP** | ⏳ Pendiente | Interfaz de configuración |
| **Resultados y Análisis** | ⏳ Pendiente | Visualización de requerimientos |
| **Timeline y Gantt** | ⏳ Pendiente | Visualización temporal |

#### ⏳ Pendiente de Implementar:

##### `/app/(dashboard)/mrp/demands/page.tsx`
- Lista de demandas
- Crear nueva demanda
- Estado de demandas

##### `/app/(dashboard)/mrp/demands/new/page.tsx`
- Formulario de demanda
- Selector de productos múltiple
- Calendario para fechas

##### `/app/(dashboard)/mrp/run/page.tsx`
- Configuración de ejecución MRP
- Parámetros ajustables
- Preview de impacto

##### `/app/(dashboard)/mrp/results/[id]/page.tsx`
- Resultados del MRP
- Tabla de requerimientos
- Acciones: aprobar, generar órdenes

#### Componentes:

##### `/components/mrp/DemandForm.tsx`
- Formulario de demanda
- Tabla de productos demandados
- Validación de fechas

##### `/components/mrp/MrpParameters.tsx`
- Configuración de parámetros
- Switches y sliders
- Tooltips explicativos

##### `/components/mrp/MrpProgress.tsx`
- Barra de progreso en tiempo real
- WebSocket updates
- Mensajes de estado

##### `/components/mrp/RequirementsTable.tsx`
- Tabla de materiales requeridos
- Agrupación por proveedor
- Semáforo de disponibilidad

##### `/components/mrp/MrpTimeline.tsx`
- Timeline visual de requerimientos
- Gantt chart simplificado
- Drag para ajustar fechas

---

### 9. Órdenes de Compra ⏳ PENDIENTE

#### Estado Actual:
| Módulo | Estado | Pendiente |
|--------|--------|-----------|
| **CRUD de Órdenes** | ⏳ Pendiente | Todas las páginas |
| **Flujo de Aprobación** | ⏳ Pendiente | Visualización y acciones |
| **Recepción** | ⏳ Pendiente | Interfaz de recepción |
| **Vista Kanban** | ⏳ Pendiente | Tablero de estados |

#### ⏳ Pendiente de Implementar:

##### `/app/(dashboard)/purchase-orders/page.tsx`
- Lista de órdenes
- Filtros por estado y proveedor
- Kanban view opcional

##### `/app/(dashboard)/purchase-orders/new/page.tsx`
- Creación desde cero o requisición
- Selector de proveedor
- Líneas de orden editables

##### `/app/(dashboard)/purchase-orders/[id]/page.tsx`
- Detalle de orden
- Timeline de estados
- Documentos adjuntos

##### `/app/(dashboard)/purchase-orders/[id]/receive/page.tsx`
- Recepción de materiales
- Captura por línea
- Discrepancias y rechazos

#### Componentes:

##### `/components/purchase-orders/OrderCard.tsx`
- Card para vista kanban
- Info del proveedor
- Progress de recepción

##### `/components/purchase-orders/OrderLinesTable.tsx`
- Líneas de orden editables
- Cálculo automático de totales
- Validación de cantidades

##### `/components/purchase-orders/ApprovalFlow.tsx`
- Visualización del flujo
- Estados y aprobadores
- Botones de acción según rol

##### `/components/purchase-orders/ReceiptForm.tsx`
- Formulario de recepción
- Captura de lotes
- Upload de documentos

---

## FASE 4: EJECUCIÓN (Semana 7-8) ⏳ PENDIENTE

### 10. Órdenes de Producción ⏳ PENDIENTE

#### Estado Actual:
| Módulo | Estado | Pendiente |
|--------|--------|-----------|
| **CRUD de Órdenes** | ⏳ Pendiente | Todas las páginas |
| **Control de Producción** | ⏳ Pendiente | Interfaz de seguimiento |
| **Consumo de Materiales** | ⏳ Pendiente | Formularios y scanner |
| **Vista Calendario** | ⏳ Pendiente | Calendario de producción |

#### ⏳ Pendiente de Implementar:

##### `/app/(dashboard)/production/orders/page.tsx`
- Lista de órdenes de producción
- Vista calendario opcional
- Filtros por estado y prioridad

##### `/app/(dashboard)/production/orders/new/page.tsx`
- Creación de orden
- Selector de producto y BOM
- Programación en calendario

##### `/app/(dashboard)/production/orders/[id]/page.tsx`
- Control de producción
- Tabs: General, Consumos, Output, Tracking

##### `/app/(dashboard)/production/orders/[id]/consume/page.tsx`
- Registro de consumo de materiales
- Scanner de códigos
- Ajustes vs planeado

#### Componentes:

##### `/components/production/ProductionCalendar.tsx`
- Vista calendario de órdenes
- Drag & drop para reprogramar
- Colores por prioridad

##### `/components/production/OrderStatusCard.tsx`
- Card con estado actual
- Progress bar
- Quick actions

##### `/components/production/MaterialConsumptionForm.tsx`
- Formulario de consumo
- Tabla de materiales planeados
- Captura de lotes

##### `/components/production/ProductionOutput.tsx`
- Registro de producción
- Generación de lote
- Cálculo de eficiencia

##### `/components/production/WasteReportModal.tsx`
- Modal para reportar mermas
- Categorización de desperdicios
- Acciones correctivas

---

### 11. Control de Inventarios ⏳ PENDIENTE

#### Estado Actual:
| Módulo | Estado | Pendiente |
|--------|--------|-----------|
| **Dashboard Inventario** | ⏳ Pendiente | Vista general y métricas |
| **Kardex** | ⏳ Pendiente | Historial de movimientos |
| **Conteos Cíclicos** | ⏳ Pendiente | Programación y captura |
| **Ajustes** | ⏳ Pendiente | Formularios de ajuste |
| **Mapa de Ubicaciones** | ⏳ Pendiente | Visualización de almacén |

#### ⏳ Pendiente de Implementar:

##### `/app/(dashboard)/inventory/page.tsx`
- Dashboard de inventario
- Métricas globales
- Productos críticos

##### `/app/(dashboard)/inventory/products/[id]/page.tsx`
- Inventario por producto
- Kardex detallado
- Lotes disponibles

##### `/app/(dashboard)/inventory/movements/page.tsx`
- Historial de movimientos
- Filtros avanzados
- Exportación

##### `/app/(dashboard)/inventory/counts/page.tsx`
- Conteos cíclicos
- Programación
- Discrepancias

##### `/app/(dashboard)/inventory/adjustments/page.tsx`
- Ajustes de inventario
- Formulario con justificación
- Aprobación requerida

#### Componentes:

##### `/components/inventory/StockCard.tsx`
- Card de stock por producto
- Indicador visual de nivel
- Semáforo de estado

##### `/components/inventory/KardexTable.tsx`
- Tabla de movimientos
- Balance running
- Detalles expandibles

##### `/components/inventory/LotTrackingTable.tsx`
- Tabla de lotes
- Estados y caducidades
- Acciones por lote

##### `/components/inventory/LocationMap.tsx`
- Mapa visual de almacén
- Heat map de ocupación
- Click para detalles

##### `/components/inventory/CycleCountForm.tsx`
- Formulario de conteo
- Comparación sistema vs físico
- Cálculo de accuracy

---

## FASE 5: CONTROL Y REPORTES (Semana 9-10) ⏳ PENDIENTE

### 12. Control de Calidad ⏳ PENDIENTE

#### Estado Actual:
| Módulo | Estado | Pendiente |
|--------|--------|-----------|
| **Inspecciones** | ⏳ Pendiente | CRUD y formularios dinámicos |
| **Especificaciones** | ⏳ Pendiente | Gestión de especificaciones |
| **No Conformidades** | ⏳ Pendiente | Registro y seguimiento |
| **Métricas de Calidad** | ⏳ Pendiente | Dashboards y reportes |

#### ⏳ Pendiente de Implementar:

##### `/app/(dashboard)/quality/inspections/page.tsx`
- Lista de inspecciones
- Filtros por tipo y estado
- Calendario de inspecciones

##### `/app/(dashboard)/quality/inspections/new/page.tsx`
- Nueva inspección
- Formulario dinámico según tipo
- Checklist de parámetros

##### `/app/(dashboard)/quality/specifications/page.tsx`
- Especificaciones por producto
- Gestión de versiones
- Parámetros y límites

##### `/app/(dashboard)/quality/non-conformities/page.tsx`
- Registro de no conformidades
- Workflow de resolución
- Métricas de calidad

#### Componentes:

##### `/components/quality/InspectionForm.tsx`
- Formulario dinámico
- Campos según especificación
- Validación de rangos

##### `/components/quality/SpecificationTable.tsx`
- Tabla de parámetros
- Límites min/max
- Métodos de prueba

##### `/components/quality/NonConformityCard.tsx`
- Card de NC
- Severidad con colores
- Timeline de acciones

##### `/components/quality/QualityMetrics.tsx`
- Dashboard de métricas
- Gráficos de tendencia
- Pareto de defectos

---

### 13. Reportes y Analytics ⏳ PENDIENTE

#### Estado Actual:
| Módulo | Estado | Pendiente |
|--------|--------|-----------|
| **Centro de Reportes** | ⏳ Pendiente | Hub de reportes |
| **Reportes Producción** | ⏳ Pendiente | Reportes de producción |
| **Reportes Inventario** | ⏳ Pendiente | Valorización y rotación |
| **Constructor Personalizado** | ⏳ Pendiente | Reportes a medida |
| **Exportación** | ⏳ Pendiente | Excel, PDF, CSV |

#### ⏳ Pendiente de Implementar:

##### `/app/(dashboard)/reports/page.tsx`
- Centro de reportes
- Reportes predefinidos
- Reportes personalizados

##### `/app/(dashboard)/reports/production/page.tsx`
- Reportes de producción
- Filtros de período
- Exportación

##### `/app/(dashboard)/reports/inventory/page.tsx`
- Reportes de inventario
- Valorización
- Rotación

##### `/app/(dashboard)/reports/custom/page.tsx`
- Constructor de reportes
- Drag & drop de campos
- Preview y exportación

#### Componentes:

##### `/components/reports/ReportBuilder.tsx`
- Constructor visual
- Selección de campos
- Filtros y agrupación

##### `/components/reports/ChartWidget.tsx`
- Widget configurable
- Tipos de gráfico
- Interactividad

##### `/components/reports/ExportOptions.tsx`
- Opciones de exportación
- Formatos: Excel, PDF, CSV
- Programación de envío

---

## 📊 RESUMEN GENERAL DEL PROYECTO FRONTEND

### Estado por Fase:

| Fase | Módulo | Estado | Progreso |
|------|--------|--------|----------|
| **FASE 1** | Autenticación y Layout | ✅ | 100% |
| **FASE 1** | Dashboard Principal | ✅ | 100% |
| **FASE 1** | Gestión de Usuarios | ✅ | 100% |
| **FASE 2** | Productos - Categorías | ✅ | 100% |
| **FASE 2** | Productos - CRUD | ⏳ | 0% |
| **FASE 2** | Productos - Especificaciones | ⏳ | 0% |
| **FASE 2** | Proveedores | ⏳ | 0% |
| **FASE 2** | BOMs/Fórmulas | ⏳ | 0% |
| **FASE 3** | MRP | ⏳ | 0% |
| **FASE 3** | Órdenes de Compra | ⏳ | 0% |
| **FASE 4** | Órdenes de Producción | ⏳ | 0% |
| **FASE 4** | Control de Inventarios | ⏳ | 0% |
| **FASE 5** | Control de Calidad | ⏳ | 0% |
| **FASE 5** | Reportes y Analytics | ⏳ | 0% |

### Prioridades de Implementación:

#### 🔴 ALTA PRIORIDAD (Próximos pasos):
1. **CRUD de Productos** - Esencial para operación básica
2. **Especificaciones de Productos** - Backend ya implementado
3. **Gestión de Proveedores** - Necesario para compras
4. **BOMs/Fórmulas** - Core del sistema MRP

#### 🟡 MEDIA PRIORIDAD:
1. **MRP** - Planificación de materiales
2. **Órdenes de Compra** - Gestión de compras
3. **Órdenes de Producción** - Control de producción
4. **Control de Inventarios** - Gestión de stock

#### 🟢 BAJA PRIORIDAD:
1. **Control de Calidad** - Optimización
2. **Reportes y Analytics** - Análisis avanzado

### Componentes Compartidos Necesarios:

✅ **Completados:**
- Layout y navegación
- Sistema de autenticación
- Componentes base de UI

⏳ **Pendientes de Implementar:**
- Tablas avanzadas con TanStack Table
- Gráficos con Recharts
- Formularios dinámicos complejos
- Sistema de notificaciones real-time (WebSocket)
- Componentes de drag & drop
- Virtualizacion para listas largas

### Integraciones Backend Disponibles:

✅ **APIs Backend Listas:**
- Autenticación y usuarios
- Productos (CRUD básico)
- Categorías de productos
- Especificaciones de productos
- Proveedores
- Evaluación de proveedores
- Notificaciones en tiempo real

⏳ **APIs Pendientes:**
- BOMs/Fórmulas
- MRP
- Órdenes de compra
- Órdenes de producción
- Inventario
- Calidad
- Reportes

---

## Componentes UI Reutilizables

### Componentes Base:

##### `/components/ui/Button.tsx`
```tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'danger';
  size: 'sm' | 'md' | 'lg';
  icon?: React.ComponentType;
  loading?: boolean;
  disabled?: boolean;
}
```

##### `/components/ui/Card.tsx`
- Container con shadow
- Header opcional
- Footer opcional

##### `/components/ui/Modal.tsx`
- **Overlay con `backdrop-blur-md`** (NO transparent background)
- Fondo oscuro semitransparente con efecto blur
- Animación de entrada
- Close con X o ESC
- Mejor jerarquía visual y enfoque del usuario

##### `/components/ui/Table.tsx`
- Wrapper de TanStack Table
- Estilos consistentes
- Loading y empty states

##### `/components/ui/Form.tsx`
- Componentes de formulario
- Input, Select, Textarea
- Checkbox, Radio, Switch
- DatePicker, TimePicker

##### `/components/ui/Badge.tsx`
- Diferentes colores
- Tamaños
- Con o sin icono

##### `/components/ui/Alert.tsx`
- Tipos: info, success, warning, error
- Dismissible opcional
- Con acciones

##### `/components/ui/Tabs.tsx`
- Navegación horizontal
- Lazy loading de contenido
- Indicador activo

##### `/components/ui/Dropdown.tsx`
- Menu desplegable
- Posicionamiento automático
- Keyboard navigation

##### `/components/ui/SearchInput.tsx`
- Input con icono de búsqueda
- Debounce configurable
- Clear button

##### `/components/ui/Pagination.tsx`
- Números de página
- Previous/Next
- Jump to page

##### `/components/ui/EmptyState.tsx`
- Ilustración o icono
- Mensaje descriptivo
- Acción principal

##### `/components/ui/LoadingState.tsx`
- Skeleton screens
- Spinners
- Progress bars

##### `/components/ui/Toast.tsx`
- Notificaciones temporales
- Stack de toasts
- Auto dismiss

---

## Servicios y API Client

### Configuración Base:

##### `/services/api.ts`
```typescript
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
});

// Request interceptor para JWT
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor para errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
    }
    return Promise.reject(error);
  }
);
```

### Servicios por Módulo:

##### `/services/auth.service.ts`
```typescript
export const authService = {
  login: (credentials: LoginData) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
  me: () => api.get('/auth/me'),
};
```

##### `/services/products.service.ts`
```typescript
export const productsService = {
  getAll: (params: ProductFilters) => api.get('/products', { params }),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (data: CreateProductDto) => api.post('/products', data),
  update: (id: string, data: UpdateProductDto) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  import: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/products/import', formData);
  },
};
```

---

## WebSocket Integration

### Configuración:

##### `/services/websocket.ts`
```typescript
import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    this.socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
      auth: { token },
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });
  }

  subscribe(event: string, callback: (data: any) => void) {
    this.socket?.on(event, callback);
  }

  unsubscribe(event: string) {
    this.socket?.off(event);
  }

  emit(event: string, data: any) {
    this.socket?.emit(event, data);
  }

  disconnect() {
    this.socket?.disconnect();
  }
}

export const wsService = new WebSocketService();
```

### Hooks para WebSocket:

##### `/hooks/useWebSocket.ts`
```typescript
export function useWebSocket(events: { [key: string]: (data: any) => void }) {
  useEffect(() => {
    Object.entries(events).forEach(([event, callback]) => {
      wsService.subscribe(event, callback);
    });

    return () => {
      Object.keys(events).forEach((event) => {
        wsService.unsubscribe(event);
      });
    };
  }, [events]);
}
```

---

## State Management

### Zustand Stores:

##### `/store/auth.store.ts`
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: (token) => set({ token }),
  logout: () => set({ user: null, token: null, isAuthenticated: false }),
}));
```

##### `/store/ui.store.ts`
```typescript
interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
  toggleSidebar: () => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
}
```

---

## Validación de Formularios

### Schemas con Zod:

##### `/schemas/product.schema.ts`
```typescript
import { z } from 'zod';

export const createProductSchema = z.object({
  code: z.string().min(1, 'Código requerido').max(20),
  name: z.string().min(1, 'Nombre requerido').max(100),
  type: z.enum(['PT', 'MP', 'ME']),
  category: z.string().min(1, 'Categoría requerida'),
  minStock: z.number().min(0, 'Stock mínimo debe ser >= 0'),
  maxStock: z.number().min(0, 'Stock máximo debe ser >= 0'),
  reorderPoint: z.number().min(0),
}).refine(data => data.maxStock >= data.minStock, {
  message: 'Stock máximo debe ser mayor o igual al mínimo',
  path: ['maxStock'],
});

export type CreateProductData = z.infer<typeof createProductSchema>;
```

---

## Tipos TypeScript

### Definiciones base:

##### `/types/common.ts`
```typescript
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}
```

##### `/types/user.ts`
```typescript
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  GERENTE_PRODUCCION = 'GERENTE_PRODUCCION',
  PLANEADOR = 'PLANEADOR',
  SUPERVISOR_PRODUCCION = 'SUPERVISOR_PRODUCCION',
  ALMACENISTA = 'ALMACENISTA',
  COMPRADOR = 'COMPRADOR',
  CALIDAD = 'CALIDAD',
  CONSULTA = 'CONSULTA',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}
```

---

## Utilidades

### Funciones helper:

##### `/utils/format.ts`
```typescript
export const formatCurrency = (amount: number, currency = 'MXN') => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatDate = (date: string | Date) => {
  return format(new Date(date), 'dd/MM/yyyy');
};

export const formatDateTime = (date: string | Date) => {
  return format(new Date(date), 'dd/MM/yyyy HH:mm');
};

export const formatNumber = (num: number, decimals = 2) => {
  return new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};
```

##### `/utils/validation.ts`
```typescript
export const isValidRFC = (rfc: string): boolean => {
  const pattern = /^[A-ZÑ&]{3,4}\d{6}[A-Z\d]{3}$/;
  return pattern.test(rfc);
};

export const isValidEmail = (email: string): boolean => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
};
```

---

## Performance y Optimización

### Estrategias:

1. **Code Splitting**:
   - Lazy loading de páginas
   - Dynamic imports para componentes pesados
   - Chunking por módulo

2. **Caching**:
   - React Query para cache de API
   - Stale-while-revalidate
   - Optimistic updates

3. **Optimización de imágenes**:
   - Next.js Image component
   - Lazy loading
   - WebP format

4. **Memoización**:
   - useMemo para cálculos costosos
   - useCallback para funciones
   - React.memo para componentes

5. **Virtualización**:
   - Virtual scrolling para listas largas
   - react-window para tablas grandes

---

## Variables de Entorno

##### `/.env.local`
```env
# API
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=http://localhost:3001

# App
NEXT_PUBLIC_APP_NAME=Tonic Life MRP
NEXT_PUBLIC_APP_VERSION=1.0.0

# Features
NEXT_PUBLIC_ENABLE_WEBSOCKET=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false

# External Services
NEXT_PUBLIC_SENTRY_DSN=
```

---

## Scripts y Comandos

##### `/package.json scripts`
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

---

## Estructura de Carpetas Final

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── forgot-password/
│   │   ├── reset-password/
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── suppliers/
│   │   ├── boms/
│   │   ├── mrp/
│   │   ├── purchase-orders/
│   │   ├── production/
│   │   ├── inventory/
│   │   ├── quality/
│   │   ├── users/
│   │   ├── reports/
│   │   └── layout.tsx
│   ├── api/          # API routes si necesario
│   ├── layout.tsx
│   ├── page.tsx      # Redirect a login o dashboard
│   └── globals.css
├── components/
│   ├── auth/
│   ├── layout/
│   ├── dashboard/
│   ├── products/
│   ├── suppliers/
│   ├── boms/
│   ├── mrp/
│   ├── purchase-orders/
│   ├── production/
│   ├── inventory/
│   ├── quality/
│   ├── users/
│   ├── reports/
│   ├── forms/
│   ├── tables/
│   ├── charts/
│   └── ui/
├── hooks/
├── services/
├── store/
├── types/
├── utils/
├── schemas/
├── public/
│   ├── images/
│   └── icons/
├── .env.local
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```