# Actualización: Enum PaymentTerms Corregido

**Fecha**: 21 de Noviembre de 2025
**Estado**: ✅ Frontend CORREGIDO y sincronizado

---

## 📝 Corrección Aplicada

El frontend ahora usa el enum `PaymentTerms` **exactamente** como lo espera el backend.

### ✅ Enum Correcto (PaymentTerms)

```typescript
export enum PaymentTerms {
  CASH = 'CASH',           // Contado
  NET_15 = 'NET_15',       // 15 días
  NET_30 = 'NET_30',       // 30 días
  NET_45 = 'NET_45',       // 45 días
  NET_60 = 'NET_60',       // 60 días
  NET_90 = 'NET_90',       // 90 días
  PREPAID = 'PREPAID',     // Prepago
}
```

### ❌ Valores Removidos del Frontend

Los siguientes valores que teníamos antes **han sido eliminados** porque no existen en el backend:

- ❌ `IMMEDIATE`
- ❌ `COD` (Cash on Delivery)
- ❌ `CUSTOM`

---

## 🎯 Valores Válidos para payment_terms

El campo `payment_terms` en el DTO `CreateSupplierDto` y `UpdateSupplierDto` ahora acepta **ÚNICAMENTE** estos valores:

1. **CASH** - Pago de contado
2. **NET_15** - Pago a 15 días
3. **NET_30** - Pago a 30 días
4. **NET_45** - Pago a 45 días
5. **NET_60** - Pago a 60 días
6. **NET_90** - Pago a 90 días
7. **PREPAID** - Prepago

---

## 📋 Ejemplo de Request Válido

```json
{
  "code": "PROV-001",
  "name": "Distribuidora de Insumos",
  "legal_name": "DISTRIBUIDORA DE INSUMOS NATURALES S.A. DE C.V.",
  "rfc": "DIN123456789",
  "payment_terms": "NET_30",
  "credit_limit": 100000.00,
  "currency": "MXN",
  "lead_time_days": 15
}
```

---

## 🔧 Cambios en el Frontend

### 1. **Enum actualizado** (`lib/types/suppliers.ts`):
```typescript
export enum PaymentTerms {
  CASH = 'CASH',
  NET_15 = 'NET_15',
  NET_30 = 'NET_30',
  NET_45 = 'NET_45',
  NET_60 = 'NET_60',
  NET_90 = 'NET_90',
  PREPAID = 'PREPAID',
}
```

### 2. **Dropdown actualizado** (`components/suppliers/SupplierModal.tsx`):
```tsx
<select name="payment_terms">
  <option value={PaymentTerms.CASH}>Contado</option>
  <option value={PaymentTerms.NET_15}>15 días</option>
  <option value={PaymentTerms.NET_30}>30 días</option>
  <option value={PaymentTerms.NET_45}>45 días</option>
  <option value={PaymentTerms.NET_60}>60 días</option>
  <option value={PaymentTerms.NET_90}>90 días</option>
  <option value={PaymentTerms.PREPAID}>Prepago</option>
</select>
```

### 3. **Valor por defecto cambiado**:
- Antes: `PaymentTerms.NET_30`
- Ahora: `PaymentTerms.CASH`

---

## ✅ Estado Final

- ✅ Enum `PaymentTerms` sincronizado con backend
- ✅ Enum `Currency` sincronizado con backend (MXN, USD, EUR)
- ✅ Enum `SupplierStatus` sincronizado con backend
- ✅ Estructura de dirección dividida en campos separados
- ✅ Validaciones de RFC implementadas
- ✅ Solo `code` y `name` son obligatorios
- ✅ Campos vacíos no se envían al backend

---

## 📊 Resumen de Campos

| Campo | Tipo | Requerido | Valores Válidos |
|-------|------|-----------|-----------------|
| `code` | string | ✅ Sí | Cualquier string |
| `name` | string | ✅ Sí | Cualquier string |
| `payment_terms` | enum | ❌ No | CASH, NET_15, NET_30, NET_45, NET_60, NET_90, PREPAID |
| `currency` | enum | ❌ No | MXN, USD, EUR |
| `status` | enum | ❌ No | ACTIVE, INACTIVE, SUSPENDED, BLACKLISTED |

---

**Última actualización**: 21 de Noviembre de 2025
**Estado**: ✅ Sincronizado y funcionando
