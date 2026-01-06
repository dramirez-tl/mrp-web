# Reporte de Problema con Endpoint de Categorías

## Fecha
2025-11-20

## Problema
El endpoint `/products/categories` sigue devolviendo error HTTP 400 (Bad Request) a pesar de las correcciones implementadas por el backend.

## Evidencia del Error

### Error en Frontend
```
Error 400 - Bad Request: {}
Request failed with status code 400

at ProductsService.getCategories
at fetchCategories
```

### Error en Consola del Navegador
```
:3001/products/categories:1  Failed to load resource: the server responded with a status of 400 (Bad Request)
```

## Petición que está Haciendo el Frontend

**Endpoint:** `GET http://localhost:3001/products/categories`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Query Parameters:** NINGUNO (la petición se hace sin parámetros)

## Código del Frontend

```typescript
// lib/services/products.service.ts
async getCategories(params?: {
  includeInactive?: boolean;
}): Promise<ProductCategory[]> {
  // Only process params if they were actually provided
  if (!params) {
    const response = await api.get('/products/categories');
    return response.data;
  }

  // Filter out undefined/null values
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, value]) => value !== undefined && value !== null)
  );

  // Only send params if there are actual values after filtering
  if (Object.keys(cleanParams).length === 0) {
    const response = await api.get('/products/categories');
    return response.data;
  }

  const response = await api.get('/products/categories', { params: cleanParams });
  return response.data;
}
```

## Cómo se Llama desde el Componente

```typescript
// components/products/ProductsFilters.tsx
const fetchCategories = async () => {
  try {
    const data = await productsService.getCategories(); // <-- SIN PARÁMETROS
    setCategories(data);
  } catch (error) {
    console.error('Error al cargar categorías:', error);
  }
};
```

## Expectativa según Documentación del Backend

Según el documento "Correcciones Implementadas para Integración Frontend", el backend debería:

1. ✅ Aceptar el endpoint `/products/categories` (además de `/products/categories/all`)
2. ✅ Usar el DTO `QueryCategoryDto` que tolera parámetros vacíos
3. ✅ Cuando no se envían parámetros, retornar solo categorías activas

## Solicitud al Equipo de Backend

Por favor verificar:

### 1. ¿Está el endpoint `/products/categories` configurado correctamente?

El controlador debería tener algo como:

```typescript
@Get('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, /* otros roles */)
async getAllCategories(
  @Query() query: QueryCategoryDto,
): Promise<ProductCategory[]> {
  return this.productsService.getAllCategories(query.includeInactive);
}
```

### 2. ¿El DTO `QueryCategoryDto` está aplicado correctamente?

```typescript
export class QueryCategoryDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  @IsBoolean()
  includeInactive?: boolean;
}
```

### 3. ¿El ValidationPipe tiene `transform: true`?

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true, // <-- CRÍTICO
  }),
);
```

### 4. ¿Hay algún Guard o Middleware que esté rechazando la petición?

Verificar que la autenticación JWT esté funcionando correctamente y que el usuario tenga los permisos necesarios.

## Pruebas Sugeridas

### Desde el Backend

**Prueba 1: Sin parámetros**
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3001/products/categories
```
**Resultado esperado:** 200 OK con array de categorías activas

**Prueba 2: Con includeInactive vacío**
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3001/products/categories?includeInactive="
```
**Resultado esperado:** 200 OK con array de categorías activas

**Prueba 3: Con includeInactive=true**
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3001/products/categories?includeInactive=true"
```
**Resultado esperado:** 200 OK con array de todas las categorías

### Logs a Verificar

1. **¿Qué está llegando al controlador?**
   - Agregar console.log en el método del controlador para ver los parámetros

2. **¿Qué dice el ValidationPipe?**
   - Si hay error de validación, debería aparecer en los logs del servidor

3. **¿Cuál es el mensaje de error exacto?**
   - La respuesta 400 debería incluir un mensaje descriptivo

## Información Adicional

### Otros Endpoints que Presentan 404

También se observan estos errores 404 en la consola, que probablemente son endpoints no implementados aún:

```
:3001/production-orders              404 (Not Found)
:3001/purchase-orders/statistics     404 (Not Found)
:3001/mrp/runs                       404 (Not Found)
```

Esto es esperado si esos módulos no están implementados aún.

## Workaround Temporal

Si el problema persiste, podríamos:

1. Usar el endpoint `/products/categories/all` en lugar de `/products/categories`
2. Modificar el frontend para usar ese endpoint específicamente

Sin embargo, esto no es ideal ya que según la documentación el endpoint `/products/categories` debería funcionar.

## Prioridad

**ALTA** - Este error bloquea la funcionalidad básica del módulo de productos.

## Contacto

Frontend Team esperando respuesta para continuar con la integración.
