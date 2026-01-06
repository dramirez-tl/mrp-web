# Documentación del Endpoint GET /mrp/runs

## 📋 Información General

**Endpoint:** `GET /mrp/runs`
**Implementado:** ✅ Sí
**Fecha:** 2025-11-20

### Posición del Endpoint

**Importante:** El endpoint `GET /mrp/runs` está posicionado **ANTES** de `GET /mrp/runs/:id` en el controlador.

Esto es crítico porque NestJS evalúa las rutas en orden:
- ✅ `/mrp/runs` → Captura llamadas sin parámetro ID
- ✅ `/mrp/runs/:id` → Captura llamadas con ID específico

Si estuvieran al revés, `/mrp/runs` nunca se ejecutaría porque `:id` capturaría todo.

---

## 🔧 Uso del Endpoint

### Request

**URL Base:** `GET http://localhost:3001/mrp/runs`

**Headers requeridos:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Query Parameters (todos opcionales):**
- `start_date` (string, ISO 8601): Filtrar runs desde esta fecha
- `end_date` (string, ISO 8601): Filtrar runs hasta esta fecha
- `status` (enum): Filtrar por estado - valores válidos: `PENDING`, `RUNNING`, `COMPLETED`, `FAILED`, `CANCELLED`

### Ejemplos de Uso

#### 1. Listar todos los runs (sin filtros)
```bash
GET /mrp/runs
```

#### 2. Con parámetros vacíos (tolerante)
```bash
GET /mrp/runs?start_date=&end_date=&status=
```
**Resultado:** Igual que sin parámetros, no genera error 400

#### 3. Filtrar por rango de fechas
```bash
GET /mrp/runs?start_date=2024-01-01&end_date=2024-12-31
```

#### 4. Filtrar por estado
```bash
GET /mrp/runs?status=COMPLETED
```

#### 5. Combinación de filtros
```bash
GET /mrp/runs?start_date=2024-06-01&status=COMPLETED
```

### Response

**Status Code:** 200 OK

**Body (Array):**
```json
[
  {
    "id": "uuid",
    "code": "MRP-1234567890",
    "horizon_days": 30,
    "consider_safety_stock": true,
    "consolidate_orders": true,
    "status": "COMPLETED",
    "total_products": 15,
    "estimated_cost": 125000.50,
    "started_at": "2024-11-20T10:00:00.000Z",
    "completed_at": "2024-11-20T10:05:23.000Z",
    "created_at": "2024-11-20T09:55:00.000Z",
    "updated_at": "2024-11-20T10:05:23.000Z",
    "_count": {
      "mrp_requirements": 45,
      "purchase_orders": 8
    }
  },
  {
    "id": "uuid",
    "code": "MRP-1234567891",
    "horizon_days": 60,
    "consider_safety_stock": false,
    "consolidate_orders": true,
    "status": "COMPLETED",
    "total_products": 22,
    "estimated_cost": 250300.00,
    "started_at": "2024-11-19T14:30:00.000Z",
    "completed_at": "2024-11-19T14:38:45.000Z",
    "created_at": "2024-11-19T14:25:00.000Z",
    "updated_at": "2024-11-19T14:38:45.000Z",
    "_count": {
      "mrp_requirements": 67,
      "purchase_orders": 12
    }
  }
]
```

**Campos incluidos:**
- `id`: UUID del run
- `code`: Código único del run (formato: MRP-timestamp)
- `horizon_days`: Días del horizonte de planificación
- `consider_safety_stock`: Si se consideró stock de seguridad
- `consolidate_orders`: Si se consolidaron órdenes
- `status`: Estado del cálculo (PENDING, RUNNING, COMPLETED, FAILED, CANCELLED)
- `total_products`: Total de productos procesados
- `estimated_cost`: Costo estimado total
- `started_at`: Timestamp de inicio
- `completed_at`: Timestamp de finalización
- `created_at`: Timestamp de creación del registro
- `updated_at`: Timestamp de última actualización
- `_count.mrp_requirements`: Cantidad de requerimientos generados
- `_count.purchase_orders`: Cantidad de órdenes de compra sugeridas

---

## 🔐 Control de Acceso

**Roles permitidos:**
- ✅ `SUPER_ADMIN`
- ✅ `GERENTE_PRODUCCION`
- ✅ `PLANEADOR`
- ✅ `ALMACENISTA`
- ✅ `COMPRADOR`

**Roles NO permitidos:**
- ❌ `SUPERVISOR_PRODUCCION`
- ❌ `CALIDAD`
- ❌ `CONSULTA`

Si un usuario sin permisos intenta acceder:
```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

---

## 📊 Diferencias con Endpoints Relacionados

### `GET /mrp/runs` vs `GET /mrp/history`

Ambos endpoints retornan la misma información, con ligeras diferencias:

| Característica | `/mrp/runs` | `/mrp/history` |
|----------------|-------------|----------------|
| **Propósito** | Listado general de runs | Historial con énfasis en filtros |
| **Filtros** | Opcionales | Opcionales |
| **DTO** | `QueryMrpRunsDto` | Query params directos |
| **Orden** | Descendente por `created_at` | Descendente por `created_at` |
| **Roles** | 5 roles | 4 roles (sin COMPRADOR) |
| **Validación** | Tolerante a vacíos | Sin DTO específico |

**Recomendación:** El frontend debe usar `/mrp/runs` por:
- Mejor validación con DTO
- Tolerante a parámetros vacíos
- Más roles tienen acceso
- Nombre más intuitivo

### `GET /mrp/runs` vs `GET /mrp/runs/:id`

| Característica | `/mrp/runs` | `/mrp/runs/:id` |
|----------------|-------------|-----------------|
| **Propósito** | Listar múltiples runs | Obtener detalle de UN run |
| **Parámetros** | Query params (opcionales) | Path param `:id` (requerido) |
| **Respuesta** | Array de runs con resumen | Objeto único con detalles completos |
| **Incluye** | `_count` de relaciones | Relaciones completas (`mrp_requirements`, `purchase_orders`) |

---

## 🎯 Integración en el Frontend

### Uso en Dashboard (app/dashboard/page.tsx)

```typescript
// Fetch MRP runs data
const mrpRes = await api.get('/mrp/runs').catch(() => ({ data: [] }));

// Process MRP runs
const mrpRuns = Array.isArray(mrpRes.data) ? mrpRes.data : [];
const mrpStats = {
  activeRuns: mrpRuns.filter((r: any) => r.status === 'RUNNING').length,
  pendingDemands: 0, // Requiere endpoint /mrp/demands
};
```

### Estado de Implementación

- ✅ `/mrp/runs` - Implementado y funcionando
- ⏳ `/production-orders` - Pendiente de implementación
- ⏳ `/purchase-orders/statistics` - Pendiente de implementación

---

## 📝 Notas Adicionales

1. **Tolerancia a parámetros vacíos:** El endpoint usa `QueryMrpRunsDto` que filtra automáticamente valores vacíos, evitando errores 400
2. **Orden de rutas:** Es crucial mantener `/mrp/runs` antes de `/mrp/runs/:id` en el router
3. **Respuesta directa:** El endpoint retorna un array directamente, no envuelto en `{ data: [] }`
4. **Estados MRP:** Los valores válidos para filtrar por `status` son: PENDING, RUNNING, COMPLETED, FAILED, CANCELLED
