# 📋 Solicitud al Equipo Backend - BOMs Endpoints

**Fecha:** 20 de Noviembre de 2025
**Solicitado por:** Frontend Team
**Prioridad:** 🔴 ALTA

---

## 🎯 Resumen

El frontend de BOMs necesita información adicional en las respuestas de varios endpoints para poder mostrar correctamente todos los detalles de los BOMs. Actualmente falta información relacionada con:

1. **Información de productos relacionados** (en items de BOM)
2. **Costos calculados** (material_cost, total_cost)
3. **Contadores de relaciones** (_count)
4. **Información completa de componentes**

---

## 📍 Endpoints Afectados

### 1. `GET /boms` - Listar BOMs

**Estado Actual:** ⚠️ Información incompleta
**Prioridad:** 🔴 ALTA

#### Campos que DEBEN incluirse en cada BOM:

```typescript
{
  id: string;
  code: string;
  name: string;
  description?: string;
  product_id: string;

  // ✅ IMPORTANTE: Incluir información del producto relacionado
  product?: {
    id: string;
    code: string;
    name: string;
    type: string;
    unit_measure: string;
    category?: {
      id: string;
      name: string;
      code: string;
    };
  };

  status: BomStatus;
  version: string;

  // ✅ Campos nuevos (obligatorios)
  batch_size: number;
  batch_unit: string;

  // ✅ Costos calculados (IMPORTANTE para Tab de Costos)
  material_cost?: number;      // Suma de costos de todos los items
  labor_cost?: number;          // Costo de mano de obra
  overhead_cost?: number;       // Gastos generales
  total_cost?: number;          // material_cost + labor_cost + overhead_cost

  effective_date?: string;
  expiration_date?: string;
  notes?: string;

  // ✅ Contador de items (IMPORTANTE para mostrar en lista)
  _count?: {
    items: number;
  };

  created_at: string;
  updated_at: string;
}
```

**Ejemplo de respuesta esperada:**

```json
{
  "data": [
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
          "name": "Productos Terminados",
          "code": "PT"
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
        "items": 8
      },
      "created_at": "2025-11-01T10:00:00Z",
      "updated_at": "2025-11-15T14:30:00Z"
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

---

### 2. `GET /boms/:id` - Obtener BOM por ID

**Estado Actual:** ⚠️ Información incompleta
**Prioridad:** 🔴 ALTA

#### Campos adicionales requeridos:

Además de todos los campos del endpoint `GET /boms`, este endpoint **DEBE incluir la lista completa de items con información de componentes:**

```typescript
{
  // ... todos los campos de arriba ...

  // ✅ CRÍTICO: Items con información completa de componentes
  items?: Array<{
    id: string;
    bom_id: string;
    component_id: string;

    // ✅ IMPORTANTE: Información completa del componente
    component: {
      id: string;
      code: string;
      name: string;
      type: string;
      unit_measure: string;

      // ✅ CRÍTICO: Costos necesarios para cálculos
      standard_cost?: number;
      average_cost?: number;

      category?: {
        id: string;
        name: string;
        code: string;
      };
    };

    quantity: number;
    scrap_rate?: number;
    notes?: string;
    created_at: string;
    updated_at: string;
  }>;
}
```

**Ejemplo de respuesta esperada:**

```json
{
  "id": "uuid-123",
  "code": "BOM-9019",
  "name": "BOM Jimmy Coffee 270g",
  "product": {
    "id": "uuid-product-456",
    "code": "PT-JIMMY-270",
    "name": "Jimmy Coffee 270g"
  },
  "batch_size": 1000,
  "batch_unit": "PZ",
  "material_cost": 12500.00,
  "labor_cost": 2000.00,
  "overhead_cost": 1500.00,
  "total_cost": 16000.00,
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
          "name": "Materia Prima",
          "code": "MP"
        }
      },
      "quantity": 250,
      "scrap_rate": 2.0,
      "notes": "Café USP grado alimenticio"
    },
    {
      "id": "uuid-item-2",
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
          "name": "Envases",
          "code": "ENV"
        }
      },
      "quantity": 1,
      "scrap_rate": 0,
      "notes": "Envase laminado"
    }
  ]
}
```

---

### 3. `POST /boms/:id/explode` - Explosión de BOM

**Estado Actual:** ⚠️ Verificar estructura
**Prioridad:** 🟡 MEDIA

#### Request esperado:

```json
{
  "quantity": 1000
}
```

#### Response esperado:

```typescript
{
  bom_code: string;
  product_code: string;
  product_name: string;
  requested_quantity: number;
  batch_size: number;
  batch_unit: string;

  // ✅ Lista de requerimientos calculados
  requirements: Array<{
    component_id: string;
    component_code: string;
    component_name: string;
    required_quantity: number;    // Cantidad total considerando scrap_rate
    unit_measure: string;
    unit_cost: number;
    total_cost: number;           // required_quantity * unit_cost
  }>;

  // ✅ Resumen de costos totales
  total_material_cost: number;
  total_labor_cost: number;
  total_overhead_cost: number;
}
```

**Ejemplo:**

```json
{
  "bom_code": "BOM-9019",
  "product_code": "PT-JIMMY-270",
  "product_name": "Jimmy Coffee 270g",
  "requested_quantity": 1000,
  "batch_size": 1000,
  "batch_unit": "PZ",
  "requirements": [
    {
      "component_id": "uuid-comp-1",
      "component_code": "MP694",
      "component_name": "CAFÉ SOLUBLE, POLVO",
      "required_quantity": 255000,
      "unit_measure": "G",
      "unit_cost": 0.50,
      "total_cost": 127500.00
    },
    {
      "component_id": "uuid-comp-2",
      "component_code": "ENV-DOYPACK-270",
      "component_name": "Doypack 270g",
      "required_quantity": 1000,
      "unit_measure": "PZ",
      "unit_cost": 2.50,
      "total_cost": 2500.00
    }
  ],
  "total_material_cost": 130000.00,
  "total_labor_cost": 2000.00,
  "total_overhead_cost": 1500.00
}
```

**Cálculo de `required_quantity`:**
```
required_quantity = quantity_per_unit * requested_quantity * (1 + scrap_rate/100)

Ejemplo:
- Cantidad por unidad: 255 g
- Cantidad solicitada: 1000 unidades
- Scrap rate: 2%
- required_quantity = 255 * 1000 * (1 + 2/100) = 255 * 1000 * 1.02 = 260,100 g
```

---

### 4. `POST /boms/:id/activate` - Activar BOM

**Estado Actual:** ✅ OK
**Prioridad:** 🟢 BAJA

Este endpoint parece estar funcionando correctamente. Solo verificar que:

1. Retorne el BOM completo actualizado con `status: "ACTIVE"`
2. Incluya todos los campos mencionados en el endpoint `GET /boms/:id`
3. Desactive automáticamente otros BOMs activos del mismo producto (business logic)

---

### 5. `POST /boms/:id/duplicate` - Duplicar BOM

**Estado Actual:** ⚠️ Verificar estructura
**Prioridad:** 🟡 MEDIA

#### Request esperado:

```json
{
  "newCode": "BOM-9019-V2"
}
```

#### Response esperado:

Debe retornar el BOM duplicado con:
- Nuevo `id`
- Nuevo `code` (el proporcionado)
- Mismo `product_id`
- `status: "DRAFT"` (por defecto)
- `version` incrementada (ej: si original es "1.0", nuevo es "1.1" o "2.0")
- Todos los `items` duplicados con nuevos IDs pero mismos datos
- Todos los demás campos iguales al original

---

## 🔍 Validaciones Importantes

### En `POST /boms` (Crear BOM):

1. ✅ Validar que `batch_size` sea mayor a 0
2. ✅ Validar que `batch_unit` sea un valor válido del enum
3. ✅ Validar que `product_id` exista y sea de tipo `PT` (Producto Terminado)
4. ✅ Validar que todos los `component_id` en items existan
5. ✅ Validar que `effective_date` sea <= `expiration_date` (si ambos están presentes)
6. ✅ Si se crea con `status: "ACTIVE"`, desactivar otros BOMs activos del mismo producto

### En `PATCH /boms/:id` (Actualizar BOM):

1. ✅ Validar que no se pueda cambiar `product_id` si el BOM ya tiene órdenes de producción asociadas
2. ✅ Recalcular `material_cost` y `total_cost` si se modifican items
3. ✅ Validar las mismas reglas de negocio que en CREATE

---

## 📊 Cálculos Automáticos Requeridos

El backend DEBE calcular y retornar estos valores:

### `material_cost` (Costo de Materiales):
```
material_cost = SUM(
  item.quantity * (1 + item.scrap_rate/100) * item.component.standard_cost
) para todos los items
```

### `total_cost` (Costo Total):
```
total_cost = material_cost + labor_cost + overhead_cost
```

Estos cálculos deben actualizarse automáticamente cuando:
- Se crea un BOM
- Se actualiza un BOM
- Se agregan/modifican/eliminan items

---

## 🧪 Casos de Prueba Sugeridos

### Test 1: Crear BOM Completo
```bash
POST /boms
{
  "code": "BOM-TEST-001",
  "name": "BOM de Prueba",
  "product_id": "uuid-product",
  "version": "1.0",
  "batch_size": 1000,
  "batch_unit": "PZ",
  "labor_cost": 2000,
  "overhead_cost": 1500,
  "items": [
    {
      "component_id": "uuid-comp-1",
      "quantity": 250,
      "scrap_rate": 2
    }
  ]
}
```

**Verificar:**
- ✅ `material_cost` se calcula automáticamente
- ✅ `total_cost` se calcula automáticamente
- ✅ `_count.items` = 1

### Test 2: Obtener BOM con Detalles
```bash
GET /boms/{id}
```

**Verificar:**
- ✅ Incluye `product` con categoría
- ✅ Incluye `items` con información completa de `component`
- ✅ Cada `component` incluye `standard_cost`
- ✅ Costos están calculados

### Test 3: Explotar BOM
```bash
POST /boms/{id}/explode
{
  "quantity": 5000
}
```

**Verificar:**
- ✅ `required_quantity` considera `scrap_rate`
- ✅ Costos totales son correctos
- ✅ Incluye todos los componentes

---

## ⏰ Estimación de Tiempo

- **Actualización de `GET /boms`:** 2-3 horas
- **Actualización de `GET /boms/:id`:** 2-3 horas
- **Cálculos automáticos de costos:** 3-4 horas
- **Endpoint `explode`:** 2-3 horas (si no existe)
- **Pruebas completas:** 2-3 horas

**Total estimado:** 1-2 días de desarrollo

---

## 📞 Contacto

Para cualquier duda sobre estos requerimientos, contactar al equipo de frontend.

**Gracias por su colaboración! 🙏**
