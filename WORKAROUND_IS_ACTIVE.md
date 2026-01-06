# ⚠️ Workaround Temporal: Campo `is_active` Faltante

**Fecha:** 20 de Noviembre de 2025
**Estado:** ✅ Implementado (Temporal)
**Tipo:** Workaround Frontend

---

## 🐛 Problema Detectado

El backend **NO está enviando el campo `is_active`** en las respuestas del endpoint `/products/categories/all`.

### Evidencia:
```json
// Respuesta del backend (SIN is_active)
{
  "id": "c1cd5e60-edec-45e7-a866-2c95cdd0a219",
  "code": "POLV",
  "name": "Polvos",
  "description": "Productos en presentación de polvo",
  "color": "#F59E0B",
  "icon": "🥄"
  // ❌ FALTA: "is_active": true
}
```

### Impacto:
- Todas las categorías aparecían como "Inactivas" en la UI
- `!category.is_active` → `!undefined` → `true` → Muestra badge "Inactiva"

---

## ✅ Solución Temporal Implementada

### Archivo Modificado:
`components/products/CategoriesManagementModal.tsx`

### Código Agregado:
```typescript
const loadCategories = async () => {
  try {
    setLoading(true);
    const data = await productsService.getCategories({ includeInactive: true });

    // WORKAROUND TEMPORAL: El backend no está enviando is_active
    // Si no viene el campo, asumimos que es true (activa)
    const categoriesWithDefault = data.map(cat => ({
      ...cat,
      is_active: cat.is_active ?? true
    }));

    setCategories(categoriesWithDefault);
  } catch (error) {
    console.error('Error loading categories:', error);
    toast.error('Error al cargar categorías');
  } finally {
    setLoading(false);
  }
};
```

### Lógica del Workaround:
```typescript
is_active: cat.is_active ?? true
```

**Explicación:**
- Si `cat.is_active` existe → Usa su valor
- Si `cat.is_active` es `undefined` o `null` → Usa `true` por defecto
- Esto hace que todas las categorías aparezcan como "Activas" hasta que el backend envíe el valor real

---

## 🔍 Logs de Debugging

Se agregaron dos console.logs para debugging:

```typescript
console.log('Categories loaded from backend:', data);
// Muestra los datos RAW del backend (sin is_active)

console.log('Categories after workaround:', categoriesWithDefault);
// Muestra los datos DESPUÉS del workaround (con is_active: true)
```

Estos logs ayudan a:
1. Verificar que el backend sigue sin enviar `is_active`
2. Confirmar que el workaround está funcionando
3. Detectar cuándo el backend corrija el problema

---

## ⚠️ IMPORTANTE: Esto es TEMPORAL

### ❌ NO es la solución correcta:
- Este workaround solo "esconde" el problema
- Si una categoría está realmente inactiva, aparecerá como activa
- El backend DEBE corregir esto enviando el campo

### ✅ La solución correcta es:
El backend debe incluir `is_active` en todas las respuestas:
```json
{
  "id": "...",
  "code": "POLV",
  "name": "Polvos",
  "is_active": true,  // ← ESTO DEBE VENIR DEL BACKEND
  // ... otros campos
}
```

---

## 📋 Cuándo Remover este Workaround

### ✅ Remover cuando:
1. El backend confirme que corrigió el problema
2. Se verifique que el campo `is_active` viene en las respuestas
3. Los logs muestren: `is_active: true` o `is_active: false` (no `undefined`)

### Cómo remover:
```typescript
// Simplemente remover el map y usar data directamente
const data = await productsService.getCategories({ includeInactive: true });
setCategories(data);  // Sin workaround
```

---

## 📊 Estado Actual

| Aspecto | Estado |
|---------|--------|
| Backend envía is_active | ❌ NO |
| Workaround implementado | ✅ SÍ |
| UI muestra correctamente | ✅ SÍ (temporalmente) |
| Solución permanente | ⏳ Pendiente Backend |

---

## 📞 Reporte al Backend

Se creó el archivo: `BACKEND_CATEGORY_MISSING_IS_ACTIVE.md`

Este archivo documenta:
- El problema detectado
- Evidencia (respuesta del backend)
- Solución requerida
- Casos de prueba

**Acción requerida:** Backend debe incluir `is_active` en todas las respuestas de categorías.

---

## 🧪 Testing

### Verificación del Workaround:
1. ✅ Abre "Gestión de Categorías"
2. ✅ Las categorías NO deben aparecer como "Inactivas"
3. ✅ Abre consola (F12) y verifica:
   - Primer log: Sin `is_active`
   - Segundo log: Con `is_active: true`

### Verificación cuando Backend corrija:
1. Abre consola (F12)
2. Busca: `Categories loaded from backend:`
3. Verifica que AHORA sí venga: `is_active: true` o `is_active: false`
4. Si viene correctamente → Remover workaround

---

## 📝 Checklist de Limpieza (Futuro)

Cuando el backend corrija el problema:

- [ ] Verificar que `is_active` viene del backend
- [ ] Remover el workaround del código
- [ ] Remover los console.logs de debugging
- [ ] Actualizar documentación
- [ ] Cerrar este archivo como resuelto

---

**Última actualización:** 20 de Noviembre de 2025
**Status:** ⚠️ TEMPORAL - Requiere corrección en backend
**Owner:** Frontend Team (temporal) → Backend Team (permanente)
