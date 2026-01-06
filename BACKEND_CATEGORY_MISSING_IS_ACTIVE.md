# 🔴 URGENTE: Campo `is_active` NO se está retornando en las categorías

**Fecha:** 20 de Noviembre de 2025
**Prioridad:** 🔴 CRÍTICA
**Estado:** 🚨 BLOQUEANTE

---

## 🐛 Problema

El backend **NO está retornando el campo `is_active`** en las respuestas del endpoint de categorías.

---

## 📋 Evidencia

### Endpoint Probado:
`GET /products/categories/all`

### Respuesta Actual del Backend:
```json
[
  {
    "id": "c1cd5e60-edec-45e7-a866-2c95cdd0a219",
    "code": "POLV",
    "name": "Polvos",
    "description": "Productos en presentación de polvo",
    "parent_id": null,
    "color": "#F59E0B",
    "icon": "🥄",
    "sequence": 0,
    "created_at": "2025-11-20T17:45:55.868Z",
    "updated_at": "2025-11-20T17:45:55.868Z",
    "created_by": null,
    "updated_by": null,
    "deleted_at": null,
    "default_shelf_life_days": null,
    "requires_quality_control": true,
    "children": []
    // ❌ FALTA: "is_active": true
  }
]
```

### Campos que SÍ vienen:
- ✅ `code`
- ✅ `name`
- ✅ `description`
- ✅ `parent_id`
- ✅ `color`
- ✅ `icon`
- ✅ `sequence`
- ✅ `created_at`
- ✅ `updated_at`
- ✅ `created_by`
- ✅ `updated_by`
- ✅ `deleted_at`
- ✅ `default_shelf_life_days`
- ✅ `requires_quality_control`
- ✅ `children`

### Campo que FALTA:
- ❌ **`is_active`** - **COMPLETAMENTE AUSENTE**

---

## 💥 Impacto

### En el Frontend:
1. **Todas las categorías aparecen como "Inactivas"** en la UI
2. Cuando `is_active` no viene, JavaScript lo evalúa como `undefined`
3. La expresión `!category.is_active` se evalúa como `true`
4. Por lo tanto, muestra el badge "Inactiva" para todas las categorías

### Flujo del Bug:
```typescript
// Backend NO envía is_active
category = { id: "...", name: "Polvos", /* sin is_active */ }

// Frontend evalúa
!category.is_active
// → !undefined
// → true
// → Muestra "Inactiva" ❌
```

---

## 🔍 Verificación

### Log de Consola (Frontend):
```javascript
Categories loaded: [{
  code: "POLV",
  name: "Polvos",
  // ... otros campos
  // is_active: NO EXISTE ❌
}]
```

---

## ✅ Solución Requerida

### 1. Incluir `is_active` en el DTO de Respuesta

**Archivo a revisar:** `src/products/dto/category.dto.ts` o similar

Asegurar que el DTO incluya el campo:

```typescript
export class CategoryResponseDto {
  id: string;
  code: string;
  name: string;
  description?: string;
  parent_id?: string;
  color?: string;
  icon?: string;
  sequence: number;
  is_active: boolean;  // ← ✅ DEBE INCLUIRSE
  // ... otros campos
}
```

### 2. Incluir en las Queries de Prisma/TypeORM

Si están usando `select` específico en las queries, asegurarse de incluir `is_active`:

```typescript
// Ejemplo con Prisma
const categories = await prisma.productCategory.findMany({
  select: {
    id: true,
    code: true,
    name: true,
    description: true,
    parent_id: true,
    color: true,
    icon: true,
    sequence: true,
    is_active: true,  // ← ✅ AGREGAR ESTO
    // ... otros campos
  }
});
```

### 3. Verificar la Entidad

Confirmar que la entidad tenga el campo con el default:

```typescript
@Entity('product_categories')
export class ProductCategory {
  // ... otros campos

  @Column({ type: 'boolean', default: true })
  is_active: boolean;  // ← ✅ Debe existir

  // ... resto de la entidad
}
```

---

## 🧪 Testing

### Caso de Prueba 1: GET todas las categorías
```bash
GET /products/categories/all
```

**Resultado esperado:**
```json
[
  {
    "id": "...",
    "code": "POLV",
    "name": "Polvos",
    "is_active": true,  // ← ✅ DEBE VENIR
    // ... otros campos
  }
]
```

### Caso de Prueba 2: GET una categoría por ID
```bash
GET /products/categories/:id
```

**Resultado esperado:**
```json
{
  "id": "...",
  "code": "POLV",
  "name": "Polvos",
  "is_active": true,  // ← ✅ DEBE VENIR
  // ... otros campos
}
```

### Caso de Prueba 3: POST crear categoría
```bash
POST /products/categories
{
  "code": "TEST",
  "name": "Test Category"
}
```

**Resultado esperado:**
```json
{
  "id": "...",
  "code": "TEST",
  "name": "Test Category",
  "is_active": true,  // ← ✅ DEBE VENIR con default true
  // ... otros campos
}
```

---

## 📝 Posibles Causas

### 1. Select Explícito sin `is_active`
```typescript
// ❌ INCORRECTO
const categories = await repository.find({
  select: ['id', 'code', 'name', 'description', 'color', 'icon']
  // Falta 'is_active'
});
```

### 2. DTO de Respuesta sin el campo
```typescript
// ❌ INCORRECTO
export class CategoryDto {
  @Expose()
  id: string;

  @Expose()
  code: string;

  // ... otros campos
  // Falta is_active
}
```

### 3. Transformación que elimina el campo
```typescript
// ❌ INCORRECTO
return categories.map(cat => ({
  id: cat.id,
  code: cat.code,
  name: cat.name,
  // ... otros campos
  // Falta is_active: cat.is_active
}));
```

---

## 🔧 Workaround Temporal (Frontend)

Mientras se corrige el backend, el frontend implementará un workaround:

```typescript
// Asumir que si is_active no viene, es true
const categoryWithDefault = {
  ...category,
  is_active: category.is_active ?? true
};
```

**NOTA:** Este es un workaround temporal y NO debe ser la solución permanente. El backend DEBE enviar el campo correctamente.

---

## 📊 Estado Actual

| Endpoint | is_active incluido | Estado |
|----------|-------------------|--------|
| GET /products/categories/all | ❌ NO | 🔴 Error |
| GET /products/categories/:id | ❓ Pendiente verificar | 🟡 Desconocido |
| POST /products/categories | ❓ Pendiente verificar | 🟡 Desconocido |
| PATCH /products/categories/:id | ❓ Pendiente verificar | 🟡 Desconocido |

---

## ⏰ Prioridad

**🔴 CRÍTICA - RESOLVER INMEDIATAMENTE**

Este bug hace que:
- ❌ Todas las categorías aparezcan como inactivas
- ❌ Los usuarios no puedan distinguir categorías activas de inactivas
- ❌ La funcionalidad de activar/desactivar categorías sea inútil

---

## 📞 Siguiente Paso

**Equipo de Backend:** Por favor revisar y corregir los endpoints de categorías para que incluyan el campo `is_active` en todas las respuestas.

**Timeline esperado:**
- Hoy (20 Nov): Identificación del problema
- Mañana (21 Nov): Corrección en backend
- Testing conjunto: 21-22 Nov

---

**Última actualización:** 20 de Noviembre de 2025
**Reportado por:** Frontend Team
**Asignado a:** Backend Team
