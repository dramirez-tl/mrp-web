# Error 500 al Vincular Producto a Proveedor

**Fecha**: 21 de Noviembre de 2025
**Endpoint**: `POST /suppliers/{supplierId}/products`
**Status Code**: 500

---

## 📋 Descripción del Error

Al intentar vincular un producto a un proveedor desde el frontend, el backend responde con un error 500.

### Stack Trace Frontend:
```
AxiosError: Request failed with status code 500
  at settle (node_modules_ca1f66cb._.js:3706:16)
  at XMLHttpRequest.onloadend (node_modules_ca1f66cb._.js:4221:174)
  at Axios.request (node_modules_ca1f66cb._.js:5025:49)
  at async SuppliersService.addProductToSupplier
  at async handleAddProduct (SupplierProductsModal.tsx:86:13)
```

---

## 🔍 Datos que Enviamos

Según la documentación que nos proporcionaron, estamos enviando:

```typescript
interface AddSupplierProductRequest {
  // Obligatorios
  product_id: string;
  unit_price: number;

  // Opcionales
  supplier_sku?: string;
  supplier_description?: string;
  currency?: Currency;           // "MXN" | "USD" | "EUR"
  lead_time_days?: number;
  min_order_qty?: number;
  order_multiple?: number;
  pack_size?: number;
  is_preferred?: boolean;
  is_active?: boolean;
}
```

### Ejemplo de Request Body:
```json
{
  "product_id": "cm3xu1234567890",
  "unit_price": 150.50,
  "currency": "MXN",
  "is_preferred": false,
  "is_active": true
}
```

---

## ❓ Preguntas para Backend

1. ¿Cuál es el error exacto que está ocurriendo en el backend? (stack trace del servidor)
2. ¿Los nombres de los campos son correctos según el DTO?
3. ¿El tipo de dato `Currency` debe ser un string (`"MXN"`) o un enum del backend?
4. ¿Los campos `is_preferred` e `is_active` deben enviarse siempre, incluso si son `false`/`true`?
5. ¿Hay alguna validación adicional que estemos omitiendo?
6. ¿El endpoint espera algún header especial además del token de autenticación?

---

## 🛠️ Lo que Hemos Intentado

1. ✅ Actualizar todos los nombres de campos según documentación:
   - `supplier_code` → `supplier_sku`
   - `min_order_quantity` → `min_order_qty`
   - `is_primary` → `is_preferred`

2. ✅ Agregar campos nuevos:
   - `supplier_description`
   - `currency`
   - `order_multiple`
   - `pack_size`
   - `is_active`

3. ✅ Limpiar datos antes de enviar (remover `undefined` y valores vacíos)

---

## 📤 Código de Envío Frontend

```typescript
// lib/services/suppliers.service.ts
async addProductToSupplier(
  supplierId: string,
  data: AddSupplierProductRequest
): Promise<SupplierProduct> {
  const response = await api.post(`/suppliers/${supplierId}/products`, data);
  return response.data;
}

// components/suppliers/SupplierProductsModal.tsx
const cleanData: any = {
  product_id: newProduct.product_id,
  unit_price: newProduct.unit_price,
};

// Solo agregar campos opcionales si tienen valor
if (newProduct.supplier_sku) cleanData.supplier_sku = newProduct.supplier_sku;
if (newProduct.supplier_description) cleanData.supplier_description = newProduct.supplier_description;
if (newProduct.currency) cleanData.currency = newProduct.currency;
if (newProduct.lead_time_days && newProduct.lead_time_days > 0) cleanData.lead_time_days = newProduct.lead_time_days;
if (newProduct.min_order_qty && newProduct.min_order_qty > 0) cleanData.min_order_qty = newProduct.min_order_qty;
if (newProduct.order_multiple && newProduct.order_multiple > 0) cleanData.order_multiple = newProduct.order_multiple;
if (newProduct.pack_size && newProduct.pack_size > 0) cleanData.pack_size = newProduct.pack_size;
if (newProduct.is_preferred !== undefined) cleanData.is_preferred = newProduct.is_preferred;
if (newProduct.is_active !== undefined) cleanData.is_active = newProduct.is_active;

await suppliersService.addProductToSupplier(supplier.id, cleanData);
```

---

## 🎯 Solicitud

Por favor, proporcionen:
1. **Log del error del servidor** (stack trace completo)
2. **DTO exacto** que espera el endpoint `POST /suppliers/:id/products`
3. **Validaciones** que se aplican en el backend
4. **Ejemplo de request exitoso** (si tienen uno de pruebas)

---

**Nota**: Hemos agregado un `console.log` en el frontend para ver exactamente qué datos se están enviando. Adjuntaremos esa información una vez que intentemos vincular un producto nuevamente.
