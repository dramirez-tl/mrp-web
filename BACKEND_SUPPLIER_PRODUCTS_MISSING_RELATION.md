# Falta Relación `product` en GET /suppliers/:id/products

**Fecha**: 21 de Noviembre de 2025
**Endpoint**: `GET /suppliers/{supplierId}/products`
**Problema**: La respuesta no incluye los datos del producto relacionado

---

## 🔴 Problema Actual

Al obtener los productos de un proveedor, la respuesta del backend **NO incluye** los datos del producto relacionado (`product`). Solo devuelve el `product_id` pero no el objeto completo.

### Respuesta Actual (lo que recibimos):
```json
[
  {
    "id": "cm3xu...",
    "supplier_id": "cm3xu...",
    "product_id": "cm3xu...",  // ❌ Solo el ID, no el objeto completo
    "supplier_sku": "SKU123",
    "unit_price": 10.00,
    "currency": "MXN",
    "lead_time_days": 15,
    "min_order_qty": 1,
    "order_multiple": 1,
    "pack_size": 1,
    "is_preferred": false,
    "is_active": true,
    "created_at": "2025-11-21T...",
    "updated_at": "2025-11-21T..."
  }
]
```

---

## ✅ Respuesta Esperada (lo que necesitamos):

```json
[
  {
    "id": "cm3xu...",
    "supplier_id": "cm3xu...",
    "product_id": "cm3xu...",
    "supplier_sku": "SKU123",
    "unit_price": 10.00,
    "currency": "MXN",
    "lead_time_days": 15,
    "min_order_qty": 1,
    "order_multiple": 1,
    "pack_size": 1,
    "is_preferred": false,
    "is_active": true,
    "created_at": "2025-11-21T...",
    "updated_at": "2025-11-21T...",

    // ✅ AGREGAR ESTA RELACIÓN
    "product": {
      "id": "cm3xu...",
      "code": "MP694",
      "name": "CAFÉ SOLUBLE, POLVO",
      "type": "MATERIA_PRIMA",
      "unit_measure": "KG",
      "category": {
        "id": "cm3xu...",
        "name": "Materia Prima",
        "icon": "📦",
        "color": "#1e3a6f"
      }
    }
  }
]
```

---

## 📋 Campos del Producto que Necesitamos

Para mostrar correctamente la información en la tabla del frontend, necesitamos los siguientes campos del producto relacionado:

### Obligatorios:
- `product.id` - ID del producto
- `product.code` - Código del producto (ej: "MP694")
- `product.name` - Nombre del producto (ej: "CAFÉ SOLUBLE, POLVO")
- `product.type` - Tipo de producto (MATERIA_PRIMA, PRODUCTO_TERMINADO, etc.)
- `product.unit_measure` - Unidad de medida (KG, LT, PZ, etc.)

### Opcionales (pero muy útiles):
- `product.category` - Información de la categoría:
  - `product.category.id`
  - `product.category.name`
  - `product.category.icon`
  - `product.category.color`

---

## 🛠️ Implementación en Backend (Sugerencia)

En Prisma, esto se resuelve agregando un `include` en el query:

```typescript
// En el controlador o servicio de supplier-products

async getSupplierProducts(supplierId: string) {
  return this.prisma.supplierProduct.findMany({
    where: {
      supplier_id: supplierId,
      deleted_at: null,
    },
    include: {
      product: {
        include: {
          category: true,
        },
      },
    },
    orderBy: {
      created_at: 'desc',
    },
  });
}
```

---

## 🎯 ¿Por Qué lo Necesitamos?

En el frontend, la tabla de "Productos del Proveedor" necesita mostrar:

| Columna | Datos Requeridos |
|---------|------------------|
| **Producto** | `product.code` + `product.name` + `product.category` |
| **SKU Prov.** | `supplier_sku` |
| **Precio** | `unit_price` + `currency` |
| **Condiciones** | `lead_time_days` + `min_order_qty` (con `product.unit_measure`) + `order_multiple` + `pack_size` |
| **Preferido** | `is_preferred` |
| **Estado** | `is_active` |

Sin la relación `product`, **NO podemos mostrar**:
- ❌ El código del producto
- ❌ El nombre del producto
- ❌ La unidad de medida (necesaria para "Min: 100 **KG**")
- ❌ La categoría del producto (badge con color e icono)

---

## 🚨 Impacto Actual

Actualmente, la tabla se ve así:

```
Producto: (VACÍO - no se muestra nada)
SKU Prov.: SKU123
Precio: $10.00 MXN
Condiciones: Min: 1 (sin unidad de medida)
```

Debería verse así:

```
Producto: MP694
          CAFÉ SOLUBLE, POLVO
          📦 Materia Prima
SKU Prov.: SKU123
Precio: $10.00 MXN
Condiciones: Lead: 15d
             Min: 1 KG
             Múlt: 1
             Pack: 1
```

---

## ✅ Solicitud

Por favor, actualizar el endpoint `GET /suppliers/:id/products` para que incluya:

1. ✅ Relación `product` con sus campos básicos
2. ✅ Relación `product.category` (anidada)

Esto nos permitirá mostrar correctamente toda la información en la tabla del frontend.

---

**Nota**: Este mismo patrón probablemente se necesite en otros endpoints que devuelvan `SupplierProduct[]`, como:
- `GET /products/:id/suppliers` (si existe)
- Cualquier otro endpoint que liste relaciones supplier-product
