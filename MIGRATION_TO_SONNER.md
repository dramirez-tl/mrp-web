# Migración de react-hot-toast a Sonner

**Fecha:** 20 de Noviembre de 2025
**Estado:** 📋 Planificado
**Prioridad:** Media

---

## 🎯 Objetivo

Migrar todas las notificaciones de `react-hot-toast` a `sonner` para tener un sistema de toasts más moderno, mejor mantenido y con mejores características.

---

## 📦 Instalación de Sonner

```bash
npm install sonner
```

---

## 🔄 Cambios Necesarios

### 1. Actualizar Root Layout

**Archivo:** `app/layout.tsx`

**ANTES (react-hot-toast):**
```typescript
import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              success: {
                duration: 3000,
                style: {
                  background: '#7cb342',
                  color: '#fff',
                },
              },
              error: {
                duration: 4000,
                style: {
                  background: '#ef4444',
                  color: '#fff',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
```

**DESPUÉS (Sonner):**
```typescript
import { Toaster } from 'sonner';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="bottom-right"
            richColors
            closeButton
            duration={4000}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
```

---

### 2. Actualizar Imports en Componentes

En TODOS los archivos que usan toast, cambiar:

**ANTES:**
```typescript
import toast from 'react-hot-toast';
```

**DESPUÉS:**
```typescript
import { toast } from 'sonner';
```

---

### 3. Actualizar Uso de Toast

La mayoría de los usos son compatibles, pero hay algunos cambios:

#### ✅ Casos que NO cambian:

```typescript
// Estos funcionan igual en ambas librerías
toast.success('Mensaje de éxito');
toast.error('Mensaje de error');
toast('Mensaje básico');
```

#### ⚠️ Casos que CAMBIAN:

**Loading Toast:**

**ANTES (react-hot-toast):**
```typescript
const toastId = toast.loading('Cargando...');
// ... operación async
toast.success('Completado', { id: toastId });
```

**DESPUÉS (Sonner):**
```typescript
const toastId = toast.loading('Cargando...');
// ... operación async
toast.success('Completado', { id: toastId });
// O simplemente:
toast.dismiss(toastId);
```

**Custom Styles:**

**ANTES (react-hot-toast):**
```typescript
toast.success('Mensaje', {
  style: {
    background: '#7cb342',
    color: '#fff',
  },
  duration: 3000,
});
```

**DESPUÉS (Sonner):**
```typescript
// Sonner usa richColors por defecto, no se necesita styling manual
toast.success('Mensaje', {
  duration: 3000,
});

// Si necesitas custom styles:
toast.success('Mensaje', {
  duration: 3000,
  className: 'my-custom-toast',
});
```

---

## 📁 Archivos a Actualizar

### Archivos Críticos (Actualizar primero):
1. ✅ `CLAUDE.md` - Documentación actualizada
2. ⏳ `app/layout.tsx` - Cambiar Toaster component
3. ⏳ `lib/services/api.ts` - Interceptores de errores HTTP

### Componentes de Productos:
4. ⏳ `components/products/CategoryModal.tsx`
5. ⏳ `components/products/CategoriesManagementModal.tsx`
6. ⏳ `app/products/page.tsx`
7. ⏳ `app/products/categories/page.tsx`

### Componentes de Proveedores:
8. ⏳ `components/suppliers/SupplierProductsModal.tsx`
9. ⏳ `app/suppliers/page.tsx`

### Componentes de BOMs:
10. ⏳ `components/boms/BomModal.tsx`
11. ⏳ `components/boms/BomViewModal.tsx`
12. ⏳ `app/boms/page.tsx`

### Componentes de Órdenes de Producción:
13. ⏳ `components/production/ProductionOrderModal.tsx`
14. ⏳ `components/production/MaterialConsumptionModal.tsx`
15. ⏳ `components/production/ProductionOutputModal.tsx`
16. ⏳ `app/production-orders/page.tsx`

### Componentes de Órdenes de Compra:
17. ⏳ `components/purchase-orders/PurchaseOrderModal.tsx`
18. ⏳ `components/purchase-orders/ReceiveItemsModal.tsx`
19. ⏳ `app/purchase-orders/page.tsx`

### Componentes de Inventario:
20. ⏳ `components/inventory/MovementModal.tsx`
21. ⏳ `components/inventory/AdjustmentModal.tsx`
22. ⏳ `app/inventory/page.tsx`

### Componentes de MRP:
23. ⏳ `components/mrp/DemandModal.tsx`
24. ⏳ `components/mrp/MrpExecutionModal.tsx`
25. ⏳ `app/mrp/page.tsx`

### Autenticación:
26. ⏳ `app/login/page.tsx`
27. ⏳ `contexts/AuthContext.tsx`

---

## 🧪 Testing Checklist

Después de la migración, probar:

- [ ] Login exitoso muestra toast
- [ ] Login fallido muestra error
- [ ] Crear categoría muestra success/error
- [ ] Editar categoría muestra success/error
- [ ] Eliminar elementos muestra confirmación
- [ ] Errores de API se muestran correctamente
- [ ] Toasts tienen el estilo correcto (richColors)
- [ ] Toasts desaparecen después de 4 segundos
- [ ] Close button funciona
- [ ] Múltiples toasts se apilan correctamente

---

## 📝 Script de Migración Automática

Puedes usar este script bash para actualizar todos los imports:

```bash
# Encontrar y reemplazar imports
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" ! -path "*/.next/*" -exec sed -i 's/import toast from '\''react-hot-toast'\''/import { toast } from '\''sonner'\''/g' {} +

# Verificar archivos actualizados
grep -r "from 'sonner'" --include="*.tsx" --include="*.ts" --exclude-dir=node_modules --exclude-dir=.next
```

**Nota:** Revisa manualmente después del script para asegurar que todo esté correcto.

---

## 🗑️ Desinstalación de react-hot-toast

**SOLO después** de completar y probar la migración:

```bash
npm uninstall react-hot-toast
```

---

## ⚡ Ventajas de Sonner

1. **Mejor Performance** - Más ligero y optimizado
2. **Mejor UX** - Animaciones más suaves
3. **Más Moderno** - Mantenimiento activo
4. **Rich Colors** - Colores semánticos built-in
5. **Close Button** - UX mejorada para usuarios
6. **Promise Support** - Mejor manejo de operaciones async
7. **Stacking** - Mejor gestión de múltiples toasts
8. **TypeScript** - Mejor tipado y autocompletado

---

## 📊 Estado de la Migración

| Categoría | Archivos | Migrados | Pendientes |
|-----------|----------|----------|------------|
| Layout | 1 | 0 | 1 |
| API Services | 1 | 0 | 1 |
| Productos | 4 | 0 | 4 |
| Proveedores | 2 | 0 | 2 |
| BOMs | 3 | 0 | 3 |
| Producción | 4 | 0 | 4 |
| Compras | 3 | 0 | 3 |
| Inventario | 3 | 0 | 3 |
| MRP | 3 | 0 | 3 |
| Auth | 2 | 0 | 2 |
| **TOTAL** | **26** | **0** | **26** |

---

## ⏰ Timeline Sugerido

- **Día 1:** Instalar Sonner, actualizar layout y documentación
- **Día 2:** Migrar módulos de Productos y Proveedores
- **Día 3:** Migrar módulos de BOMs y Producción
- **Día 4:** Migrar módulos de Compras, Inventario y MRP
- **Día 5:** Migrar Auth, testing completo
- **Día 6:** Desinstalar react-hot-toast

---

## 🆘 Resolución de Problemas

### Toast no se muestra:
- Verificar que `<Toaster />` esté en `app/layout.tsx`
- Verificar que el import sea `import { toast } from 'sonner'`

### Estilos incorrectos:
- Asegurar que `richColors` esté habilitado en el Toaster
- Verificar que no haya CSS custom sobrescribiendo los estilos

### TypeScript Errors:
- Verificar que los tipos estén correctos: `import { toast } from 'sonner'`
- Reinstalar dependencias si es necesario: `npm install`

---

**Última actualización:** 20 de Noviembre de 2025
**Próxima revisión:** Cuando se inicie la migración

---

## 📌 IMPORTANTE PARA CLAUDE CODE

**Cuando implementes CUALQUIER nueva funcionalidad:**

1. ✅ **USA:** `import { toast } from 'sonner'`
2. ❌ **NO USES:** `import toast from 'react-hot-toast'`
3. ❌ **NO USES:** `alert()` o `window.alert()`

**Todo código nuevo DEBE usar Sonner desde el principio.**
