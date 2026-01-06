# Error en Unidades de Medida - Explosión de BOM

**Fecha**: 21 de Noviembre de 2025
**Endpoint**: `POST /boms/{id}/explode`
**Prioridad**: 🔴 ALTA - Datos incorrectos en explosión de BOM

---

## 🔴 Problema

El endpoint de explosión de BOM está devolviendo **la misma unidad de medida para todos los componentes** (la unidad del producto terminado, "PZ") en lugar de usar la **unidad de inventario** (`inventory_unit`) específica de cada componente.

**IMPORTANTE**: Los productos tienen DOS unidades:
- `purchase_unit` - Unidad en la que se compra (ej: KG)
- `inventory_unit` - Unidad de control de inventario (ej: G)

La explosión BOM debe usar **`inventory_unit`** porque calcula cuánto inventario se necesita.

---

## 📊 Evidencia

### Request:
```http
POST /boms/a8183651-dfac-49a4-b2b6-5ba8aeba14e5/explode
Content-Type: application/json

{
  "quantity": 100
}
```

### Response Actual (❌ INCORRECTO):
```json
{
  "bom_code": "BOM-JIMMY-10S",
  "product_code": "9309",
  "product_name": "JIMMY COFFEE C/10 SOBRES DE 12g C/U",
  "requested_quantity": 100,
  "batch_size": 1,
  "batch_unit": "PZ",  // ✅ Esto está correcto (es la unidad del producto terminado)
  "requirements": [
    {
      "component_id": "b0741698-b60b-4fe4-bc7b-52475adec457",
      "component_code": "MP694",
      "component_name": "CAFÉ SOLUBLE, POLVO",
      "required_quantity": 6013.512,
      "unit_measure": "PZ",  // ❌ INCORRECTO - debería ser "G" o "KG"
      "unit_cost": 0,
      "total_cost": 0
    },
    {
      "component_id": "118e0a23-a062-41bf-abf6-0aa15aeb51ef",
      "component_code": "MP1312",
      "component_name": "MALTEADA SABOR VAINILLA",
      "required_quantity": 5901.834,
      "unit_measure": "PZ",  // ❌ INCORRECTO - debería ser "G" o "KG"
      "unit_cost": 0,
      "total_cost": 0
    },
    {
      "component_code": "MP1261",
      "component_name": "EXTRACTO DE GANODERMA (REISHI) SOLUBLE",
      "required_quantity": 26,
      "unit_measure": "PZ",  // ❌ INCORRECTO - debería ser "G"
      "unit_cost": 0,
      "total_cost": 0
    },
    {
      "component_code": "MP166",
      "component_name": "GOMA GUAR",
      "required_quantity": 156.5,
      "unit_measure": "PZ",  // ❌ INCORRECTO - debería ser "G"
      "unit_cost": 0,
      "total_cost": 0
    }
  ],
  "total_material_cost": 0,
  "total_labor_cost": 800,
  "total_overhead_cost": 400
}
```

---

## ✅ Response Esperado (CORRECTO):

```json
{
  "bom_code": "BOM-JIMMY-10S",
  "product_code": "9309",
  "product_name": "JIMMY COFFEE C/10 SOBRES DE 12g C/U",
  "requested_quantity": 100,
  "batch_size": 1,
  "batch_unit": "PZ",  // ✅ Unidad del producto terminado
  "requirements": [
    {
      "component_id": "b0741698-b60b-4fe4-bc7b-52475adec457",
      "component_code": "MP694",
      "component_name": "CAFÉ SOLUBLE, POLVO",
      "required_quantity": 6013.512,
      "unit_measure": "G",  // ✅ Unidad del componente (según product.unit_measure)
      "unit_cost": 0,
      "total_cost": 0
    },
    {
      "component_id": "118e0a23-a062-41bf-abf6-0aa15aeb51ef",
      "component_code": "MP1312",
      "component_name": "MALTEADA SABOR VAINILLA",
      "required_quantity": 5901.834,
      "unit_measure": "G",  // ✅ Unidad del componente
      "unit_cost": 0,
      "total_cost": 0
    },
    {
      "component_code": "MP1261",
      "component_name": "EXTRACTO DE GANODERMA (REISHI) SOLUBLE",
      "required_quantity": 26,
      "unit_measure": "G",  // ✅ Unidad del componente
      "unit_cost": 0,
      "total_cost": 0
    },
    {
      "component_code": "MP166",
      "component_name": "GOMA GUAR",
      "required_quantity": 156.5,
      "unit_measure": "G",  // ✅ Unidad del componente
      "unit_cost": 0,
      "total_cost": 0
    }
  ],
  "total_material_cost": 0,
  "total_labor_cost": 800,
  "total_overhead_cost": 400
}
```

---

## 🔍 Análisis del Problema

### Comportamiento Actual:
El backend está usando `batch_unit` (la unidad del producto terminado) para **todos** los componentes.

### Comportamiento Esperado:
Cada componente debe tener su propia `unit_measure` obtenida del campo **`inventory_unit`** de la tabla `products`:

```sql
-- Pseudocódigo de lo que debería hacer el backend
SELECT
  bi.component_id,
  p.code as component_code,
  p.name as component_name,
  (bi.quantity * requested_quantity) as required_quantity,
  p.inventory_unit,  -- ✅ Usar inventory_unit del COMPONENTE, no del producto terminado
  p.unit_cost,
  (bi.quantity * requested_quantity * p.unit_cost) as total_cost
FROM bom_items bi
JOIN products p ON p.id = bi.component_id
WHERE bi.bom_id = ?
```

**Nota**: `inventory_unit` es la unidad en la que se controla el inventario del producto (G, ML, PZ, etc.), mientras que `purchase_unit` es la unidad en la que se compra (KG, L, etc.).

---

## 🛠️ Solución Sugerida (Backend)

En el controlador o servicio de explosión de BOM:

```typescript
// ❌ INCORRECTO (código actual probablemente)
const requirements = bomItems.map(item => ({
  component_id: item.component_id,
  component_code: item.component.code,
  component_name: item.component.name,
  required_quantity: item.quantity * requestedQuantity,
  unit_measure: bom.product.unit_measure,  // ❌ Usando unidad del producto terminado
  unit_cost: item.component.unit_cost || 0,
  total_cost: (item.quantity * requestedQuantity * (item.component.unit_cost || 0))
}));

// ✅ CORRECTO
const requirements = bomItems.map(item => ({
  component_id: item.component_id,
  component_code: item.component.code,
  component_name: item.component.name,
  required_quantity: item.quantity * requestedQuantity,
  unit_measure: item.component.inventory_unit,  // ✅ Usando inventory_unit del componente
  unit_cost: item.component.unit_cost || 0,
  total_cost: (item.quantity * requestedQuantity * (item.component.unit_cost || 0))
}));
```

### Query de Prisma Sugerido:

```typescript
const bomItems = await prisma.bomItem.findMany({
  where: {
    bom_id: bomId,
    deleted_at: null,
  },
  include: {
    component: {
      select: {
        id: true,
        code: true,
        name: true,
        purchase_unit: true,      // Unidad de compra (ej: KG)
        inventory_unit: true,     // ✅ IMPORTANTE: Unidad de inventario (ej: G)
        conversion_factor: true,  // Factor de conversión (ej: 1000)
        unit_cost: true,
      },
    },
  },
});

// Luego mapear:
const requirements = bomItems.map(item => ({
  component_id: item.component.id,
  component_code: item.component.code,
  component_name: item.component.name,
  required_quantity: item.quantity * requestedQuantity,
  unit_measure: item.component.inventory_unit,  // ✅ Usar inventory_unit del componente
  unit_cost: item.component.unit_cost || 0,
  total_cost: (item.quantity * requestedQuantity * (item.component.unit_cost || 0)),
}));
```

**Explicación de los campos del producto:**
- `purchase_unit`: Unidad en la que se COMPRA el producto (ej: "KG", "L")
- `inventory_unit`: Unidad en la que se CONTROLA el inventario (ej: "G", "ML")
- `conversion_factor`: Cuántas unidades de inventario hay en 1 unidad de compra (ej: 1 KG = 1000 G)

---

## 📋 Campos a Verificar

| Campo | Origen Correcto | Origen Incorrecto |
|-------|----------------|-------------------|
| `batch_unit` | `bom.product.inventory_unit` | ✅ Ya está correcto |
| `requirements[].unit_measure` | `component.inventory_unit` | ❌ Actualmente usa `bom.product.inventory_unit` para todos |

**Ejemplo de Producto:**
```typescript
// Producto MP694 - CAFÉ SOLUBLE, POLVO
{
  code: "MP694",
  name: "CAFÉ SOLUBLE, POLVO",
  purchase_unit: "KG",        // Compramos en Kilogramos
  inventory_unit: "G",        // Controlamos inventario en Gramos
  conversion_factor: 1000     // 1 KG = 1000 G
}
```

Por lo tanto, en la explosión BOM, el `unit_measure` de este componente debe ser **"G"** (inventory_unit), no "PZ".

---

## 🎯 Impacto

### En el Frontend:
La tabla de "Requerimientos de Materiales" muestra:
```
Componente                          Cantidad    Unidad
CAFÉ SOLUBLE, POLVO                 6013.51     PZ     ❌ Debería ser "G"
MALTEADA SABOR VAINILLA             5901.83     PZ     ❌ Debería ser "G"
EXTRACTO DE GANODERMA               26.00       PZ     ❌ Debería ser "G"
GOMA GUAR                           156.50      PZ     ❌ Debería ser "G"
```

### Problemas Causados:
1. ❌ Información engañosa para el usuario (dice "PZ" cuando son gramos)
2. ❌ Imposible planificar compras correctamente
3. ❌ Reportes de materiales incorrectos
4. ❌ Cálculos de inventario erróneos

---

## ✅ Checklist de Corrección

- [ ] Verificar que el query incluya `component.inventory_unit` (NO `unit_measure`)
- [ ] Cambiar el mapeo para usar `item.component.inventory_unit` en lugar de `bom.product.inventory_unit`
- [ ] Probar con diferentes BOMs que tengan componentes con unidades variadas
- [ ] Verificar que `batch_unit` siga usando la unidad del producto terminado (debe permanecer "PZ" si el producto terminado es en piezas)

---

## 🧪 Casos de Prueba

### Test 1: BOM con componentes de diferentes unidades
```
Producto Terminado: JIMMY COFFEE (PZ)
Componentes:
  - CAFÉ SOLUBLE (G)
  - MALTEADA (G)
  - EXTRACTO (G)
  - GOMA GUAR (G)

Resultado esperado:
  batch_unit: "PZ"
  requirements[0].unit_measure: "G"
  requirements[1].unit_measure: "G"
  requirements[2].unit_measure: "G"
  requirements[3].unit_measure: "G"
```

### Test 2: BOM con componentes en litros y gramos
```
Producto Terminado: BEBIDA XYZ (PZ)
Componentes:
  - AGUA (L)
  - AZÚCAR (KG)
  - SABORIZANTE (ML)

Resultado esperado:
  batch_unit: "PZ"
  requirements[0].unit_measure: "L"
  requirements[1].unit_measure: "KG"
  requirements[2].unit_measure: "ML"
```

---

## 📞 Información Adicional

**Logs del Frontend:**
```javascript
console.log('📦 Primer requerimiento:', result.requirements[0]);
// Output actual:
// {
//   component_code: "MP694",
//   component_name: "CAFÉ SOLUBLE, POLVO",
//   required_quantity: 6013.512,
//   unit_measure: "PZ",  // ❌ Incorrecto
//   unit_cost: 0
// }
```

**BOM ID de prueba**: `a8183651-dfac-49a4-b2b6-5ba8aeba14e5`
**Producto**: JIMMY COFFEE C/10 SOBRES DE 12g C/U

---

**Estado**: ⏳ Esperando corrección del backend
**Prioridad**: 🔴 ALTA - Bloquea funcionalidad de explosión de BOM
**Fecha de reporte**: 21 de Noviembre de 2025, 2:15 AM
