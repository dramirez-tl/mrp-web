# Requisitos y Recomendaciones para la API Backend

## Problema Identificado

Se están presentando errores HTTP 400 (Bad Request) en las siguientes llamadas a la API:

1. **GET /products/categories**
2. **GET /products**

### Causa del Problema

El frontend estaba enviando parámetros de query con valores de strings vacíos (`''`), lo cual puede causar que el backend rechace la petición dependiendo de cómo esté configurada la validación.

**Ejemplo de petición problemática:**
```
GET /products?page=1&limit=10&search=&type=&status=&category_id=
```

## Soluciones Implementadas en el Frontend

### 1. Limpieza de Parámetros Vacíos

Se modificó el servicio de productos para filtrar automáticamente los parámetros vacíos, nulos o indefinidos antes de enviarlos al backend:

```typescript
// En products.service.ts - getProducts()
const cleanParams = params ? Object.fromEntries(
  Object.entries(params).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
) : {};
```

**Ahora las peticiones se envían como:**
```
GET /products?page=1&limit=10
```

### 2. Mejora del Manejo de Errores 400

Se agregó logging detallado para los errores 400 que incluye:
- URL de la petición
- Parámetros enviados
- Data enviada
- Respuesta del backend

Esto facilitará la depuración de futuros problemas.

## Recomendaciones para el Equipo Backend

### 1. Validación de Parámetros Query (ALTA PRIORIDAD)

**Recomendación:** Los endpoints deben ser tolerantes a parámetros vacíos o manejarlos correctamente.

**Opciones:**

#### Opción A: Ignorar parámetros vacíos (Recomendado)
```typescript
// NestJS example
@Get('products')
async getProducts(
  @Query('page') page?: number,
  @Query('limit') limit?: number,
  @Query('search') search?: string,
  @Query('type') type?: string,
  @Query('category_id') categoryId?: string,
  @Query('status') status?: string,
) {
  // Filtrar valores vacíos antes de usar
  const filters = {
    ...(search && search.trim() !== '' && { search }),
    ...(type && type.trim() !== '' && { type }),
    ...(categoryId && categoryId.trim() !== '' && { categoryId }),
    ...(status && status.trim() !== '' && { status }),
  };

  return this.productsService.findAll(page, limit, filters);
}
```

#### Opción B: Validación explícita con class-validator
```typescript
import { IsOptional, IsNotEmpty, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetProductsDto {
  @IsOptional()
  @Transform(({ value }) => value?.trim() || undefined)
  @IsNotEmpty()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => value?.trim() || undefined)
  @IsEnum(ProductType)
  type?: ProductType;

  @IsOptional()
  @Transform(({ value }) => value?.trim() || undefined)
  @IsNotEmpty()
  category_id?: string;

  @IsOptional()
  @Transform(({ value }) => value?.trim() || undefined)
  @IsEnum(ProductStatus)
  status?: ProductStatus;
}
```

### 2. Endpoints Específicos a Verificar

#### GET /products/categories

**Query Parameters esperados:**
```typescript
{
  includeInactive?: boolean  // Debe ser opcional
}
```

**Comportamiento esperado:**
- Si no se envía `includeInactive`, debe retornar solo categorías activas
- No debe fallar si se envían otros parámetros desconocidos

#### GET /products

**Query Parameters esperados:**
```typescript
{
  page?: number           // Default: 1
  limit?: number          // Default: 10
  search?: string         // Búsqueda en code, name, description
  type?: 'PT' | 'MP' | 'ME'
  category_id?: string    // UUID de categoría
  status?: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED'
  sortBy?: string         // Campo para ordenar
  order?: 'asc' | 'desc'  // Dirección del ordenamiento
}
```

**Comportamiento esperado:**
- Todos los parámetros deben ser opcionales
- Los parámetros vacíos deben ser ignorados
- Debe retornar respuesta paginada:
  ```typescript
  {
    data: Product[],
    meta: {
      total: number,
      page: number,
      limit: number,
      totalPages: number
    }
  }
  ```

### 3. Formato de Respuestas de Error

**Para errores 400, incluir información detallada:**

```typescript
{
  statusCode: 400,
  message: "Descripción clara del error",
  error: "Bad Request",
  details: {
    // Información específica sobre qué parámetro falló
    field: "type",
    value: "INVALID",
    constraint: "must be one of: PT, MP, ME"
  }
}
```

Esto ayudará al frontend a mostrar mensajes de error más útiles al usuario.

### 4. CORS y Cookies

Verificar que el backend tenga configurado correctamente:

```typescript
// NestJS example
app.enableCors({
  origin: 'http://localhost:3000', // URL del frontend
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

### 5. Autenticación

El frontend envía el token JWT en el header:
```
Authorization: Bearer <token>
```

Asegurar que todos los endpoints protegidos validen este token correctamente.

## Testing Recomendado

### Casos de Prueba para el Backend

1. **GET /products sin parámetros**
   - Debe retornar productos con paginación default

2. **GET /products con parámetros vacíos**
   ```
   GET /products?search=&type=&status=
   ```
   - Debe ignorar los parámetros vacíos y retornar como si no se enviaran

3. **GET /products con parámetros válidos**
   ```
   GET /products?page=1&limit=20&type=PT&status=ACTIVE
   ```
   - Debe filtrar correctamente

4. **GET /products/categories sin parámetros**
   - Debe retornar solo categorías activas

5. **GET /products/categories?includeInactive=true**
   - Debe retornar todas las categorías

## Información Adicional de Contexto

### Tecnologías Frontend
- Next.js 16 (App Router)
- React 19
- TypeScript
- Axios para peticiones HTTP

### Base URL Configurada
```
http://localhost:3001
```

### Headers Enviados
```
Content-Type: application/json
Authorization: Bearer <token>
```

### withCredentials
El frontend tiene `withCredentials: true` para soportar cookies en CORS.

## Contacto

Si necesitan más información o ejemplos específicos de las peticiones que está enviando el frontend, por favor soliciten capturas de la consola del navegador o logs de red.
