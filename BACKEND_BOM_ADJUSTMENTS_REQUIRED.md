# 🔧 Ajustes Necesarios en API de BOMs - Nombres de Campos

**Fecha:** 20 de Noviembre de 2025
**Prioridad:** 🔴 ALTA - Requiere ajuste inmediato
**Razón:** Incompatibilidad de nombres de campos entre frontend y backend

---

## 🎯 Resumen

Excelente trabajo en la implementación! 🎉 Sin embargo, hay **diferencias en los nombres de campos** entre lo que el backend está retornando y lo que el frontend espera. Estos ajustes son críticos para que el frontend funcione sin cambios adicionales.

---

## ⚠️ Ajustes CRÍTICOS Requeridos

### 1. Campo del Producto Principal

#### ❌ Backend está retornando:
```json
{
  "products": {
    "id": "uuid",
    "code": "PT-JIMMY-270",
    "name": "Jimmy Coffee 270g"
  }
}
```

#### ✅ Debe retornar:
```json
{
  "product": {
    "id": "uuid",
    "code": "PT-JIMMY-270",
    "name": "Jimmy Coffee 270g"
  }
}
```

**Campo:** `products` → `product` (singular)

---

### 2. Campo de Categoría del Producto

#### ❌ Backend está retornando:
```json
{
  "product": {
    "product_categories": {
      "id": "uuid-cat",
      "code": "PT",
      "name": "Productos Terminados"
    }
  }
}
```

#### ✅ Debe retornar:
```json
{
  "product": {
    "category": {
      "id": "uuid-cat",
      "code": "PT",
      "name": "Productos Terminados"
    }
  }
}
```

**Campo:** `product_categories` → `category`

---

### 3. Campos en Items (BomItem)

#### ❌ Backend está retornando:
```json
{
  "items": [
    {
      "id": "uuid-item-1",
      "bom_id": "uuid",
      "material_id": "uuid-comp-1",
      "products": {
        "id": "uuid-comp-1",
        "code": "MP694",
        "name": "CAFÉ SOLUBLE",
        "product_categories": {
          "id": "uuid-cat-mp",
          "code": "MP",
          "name": "Materia Prima"
        }
      },
      "quantity": 250,
      "scrap_percentage": 2.0,
      "instructions": "Café USP grado alimenticio",
      "sequence_number": 1
    }
  ]
}
```

#### ✅ Debe retornar:
```json
{
  "items": [
    {
      "id": "uuid-item-1",
      "bom_id": "uuid",
      "component_id": "uuid-comp-1",
      "component": {
        "id": "uuid-comp-1",
        "code": "MP694",
        "name": "CAFÉ SOLUBLE",
        "type": "MP",
        "unit_measure": "G",
        "standard_cost": 0.50,
        "category": {
          "id": "uuid-cat-mp",
          "code": "MP",
          "name": "Materia Prima"
        }
      },
      "quantity": 250,
      "scrap_rate": 2.0,
      "notes": "Café USP grado alimenticio"
    }
  ]
}
```

**Cambios en Items:**
- `material_id` → `component_id`
- `products` → `component`
- `product_categories` → `category` (dentro de component)
- `scrap_percentage` → `scrap_rate`
- `instructions` → `notes`

---

## 📋 Tabla de Mapeo Completo

| Nivel | Campo Backend (❌ Actual) | Campo Frontend (✅ Esperado) |
|-------|--------------------------|----------------------------|
| BOM | `products` | `product` |
| BOM.product | `product_categories` | `category` |
| BOM.items | `material_id` | `component_id` |
| BOM.items | `products` | `component` |
| BOM.items.component | `product_categories` | `category` |
| BOM.items | `scrap_percentage` | `scrap_rate` |
| BOM.items | `instructions` | `notes` |

---

## 🔍 Endpoints Afectados

### Todos estos endpoints necesitan los ajustes:

1. ✅ `GET /boms` - Lista de BOMs
2. ✅ `GET /boms/:id` - Detalle de BOM
3. ✅ `POST /boms` - Crear BOM (response)
4. ✅ `PATCH /boms/:id` - Actualizar BOM (response)
5. ✅ `POST /boms/:id/activate` - Activar BOM (response)
6. ✅ `POST /boms/:id/duplicate` - Duplicar BOM (response)

---

## 📝 Ejemplo Completo Corregido

### Response de `GET /boms/:id` CORRECTO:

```json
{
  "id": "uuid-123",
  "code": "BOM-9019",
  "name": "BOM Jimmy Coffee 270g",
  "description": "Lista de materiales para Jimmy Coffee 270g",
  "product_id": "uuid-product-456",

  "product": {
    "id": "uuid-product-456",
    "code": "PT-JIMMY-270",
    "name": "Jimmy Coffee 270g",
    "type": "PT",
    "unit_measure": "PZ",
    "category": {
      "id": "uuid-cat-789",
      "code": "PT",
      "name": "Productos Terminados"
    }
  },

  "status": "ACTIVE",
  "version": "1.0",
  "batch_size": 1000,
  "batch_unit": "PZ",

  "material_cost": 12500.00,
  "labor_cost": 2000.00,
  "overhead_cost": 1500.00,
  "total_cost": 16000.00,

  "effective_date": "2025-01-01",
  "expiration_date": null,
  "notes": "BOM aprobado por calidad",

  "_count": {
    "items": 2
  },

  "items": [
    {
      "id": "uuid-item-1",
      "bom_id": "uuid-123",
      "component_id": "uuid-comp-1",
      "component": {
        "id": "uuid-comp-1",
        "code": "MP694",
        "name": "CAFÉ SOLUBLE, POLVO",
        "type": "MP",
        "unit_measure": "G",
        "standard_cost": 0.50,
        "average_cost": 0.48,
        "category": {
          "id": "uuid-cat-mp",
          "code": "MP",
          "name": "Materia Prima"
        }
      },
      "quantity": 250,
      "scrap_rate": 2.0,
      "notes": "Café USP grado alimenticio"
    },
    {
      "id": "uuid-item-2",
      "bom_id": "uuid-123",
      "component_id": "uuid-comp-2",
      "component": {
        "id": "uuid-comp-2",
        "code": "ENV-DOYPACK-270",
        "name": "Doypack 270g",
        "type": "ENV",
        "unit_measure": "PZ",
        "standard_cost": 2.50,
        "category": {
          "id": "uuid-cat-env",
          "code": "ENV",
          "name": "Envases"
        }
      },
      "quantity": 1,
      "scrap_rate": 0,
      "notes": "Envase laminado"
    }
  ],

  "created_at": "2025-11-01T10:00:00Z",
  "updated_at": "2025-11-15T14:30:00Z"
}
```

---

## 🔧 Cambios Necesarios en el Código Backend

### Opción 1: Usar Alias en Prisma Select (RECOMENDADO)

```typescript
// En boms.service.ts

const bomSelect = {
  id: true,
  code: true,
  name: true,
  description: true,
  product_id: true,

  // ✅ Usar alias para cambiar nombre
  product: {
    select: {
      id: true,
      code: true,
      name: true,
      type: true,
      unit_measure: true,
      standard_cost: true,
      // ✅ Cambiar nombre de relación
      category: {  // alias para product_categories
        select: {
          id: true,
          code: true,
          name: true
        }
      }
    }
  },

  status: true,
  version: true,
  batch_size: true,
  batch_unit: true,
  material_cost: true,
  labor_cost: true,
  overhead_cost: true,
  total_cost: true,
  effective_date: true,
  expiration_date: true,
  notes: true,

  _count: {
    select: {
      items: true
    }
  },

  // Para GET /boms/:id incluir items
  items: {
    select: {
      id: true,
      bom_id: true,
      component_id: true,  // ✅ Cambiar de material_id

      // ✅ Usar alias
      component: {  // alias para products
        select: {
          id: true,
          code: true,
          name: true,
          type: true,
          unit_measure: true,
          standard_cost: true,
          average_cost: true,
          category: {  // alias para product_categories
            select: {
              id: true,
              code: true,
              name: true
            }
          }
        }
      },

      quantity: true,
      scrap_rate: true,  // ✅ Cambiar de scrap_percentage
      notes: true,       // ✅ Cambiar de instructions
    },
    orderBy: {
      sequence_number: 'asc'
    }
  },

  created_at: true,
  updated_at: true
};
```

### Opción 2: Transformar el Response (ALTERNATIVA)

Si no es posible cambiar los alias en Prisma, transformar el objeto antes de retornarlo:

```typescript
function transformBomResponse(bom: any) {
  return {
    ...bom,
    product: bom.products,  // Singular
    products: undefined,    // Eliminar
    items: bom.items?.map((item: any) => ({
      ...item,
      component_id: item.material_id,
      component: {
        ...item.products,
        category: item.products?.product_categories,
        product_categories: undefined
      },
      material_id: undefined,
      products: undefined,
      scrap_rate: item.scrap_percentage,
      scrap_percentage: undefined,
      notes: item.instructions,
      instructions: undefined
    }))
  };
}
```

---

## 🧪 Testing Después de los Ajustes

### Test 1: Verificar nombres de campos
```bash
GET /boms/:id

# Verificar en response:
✅ bom.product (no bom.products)
✅ bom.product.category (no bom.product.product_categories)
✅ bom.items[0].component_id (no material_id)
✅ bom.items[0].component (no products)
✅ bom.items[0].scrap_rate (no scrap_percentage)
✅ bom.items[0].notes (no instructions)
```

### Test 2: Verificar lista de BOMs
```bash
GET /boms

# Verificar en response:
✅ data[0].product
✅ data[0].product.category
✅ data[0]._count.items
```

---

## ⏰ Estimación de Tiempo

- **Ajustes en Prisma select:** 1-2 horas
- **Testing completo:** 1 hora

**Total estimado:** 2-3 horas

---

## 📞 Contacto

Para cualquier duda sobre estos ajustes, contactar al equipo de frontend.

**Importante:** Estos son solo ajustes de nombres de campos. La lógica y cálculos ya implementados están perfectos! 🎉

---

**Última actualización:** 20 de Noviembre de 2025
