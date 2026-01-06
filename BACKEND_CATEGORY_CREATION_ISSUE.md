# Reporte: Categorías se crean como INACTIVAS por defecto

## Fecha
2025-11-20

## Problema Identificado

Al crear una nueva categoría a través del endpoint `POST /products/categories`, la categoría se crea con `is_active = false` en lugar de `is_active = true`.

## Comportamiento Actual

**Endpoint:** `POST http://localhost:3001/products/categories`

**Datos enviados desde el frontend:**
```json
{
  "code": "POLV",
  "name": "Polvos",
  "description": "Productos en presentación de polvo",
  "parent_id": null,
  "color": "#F59E0B",
  "icon": "🥄"
}
```

**Nota:** El frontend NO envía el campo `is_active` porque el backend lo rechaza con el error:
```
"property is_active should not exist"
```

Esto es correcto según la configuración del backend con `forbidNonWhitelisted: true`.

## Problema

La categoría se crea exitosamente (HTTP 201), pero cuando se consulta, aparece con:
```json
{
  "id": "uuid...",
  "code": "POLV",
  "name": "Polvos",
  "is_active": false,  // ❌ DEBERÍA SER TRUE
  ...
}
```

## Comportamiento Esperado

Cuando se crea una nueva categoría sin especificar `is_active`, el backend debería:
1. Asignar automáticamente `is_active = true` por defecto
2. La categoría recién creada debería estar activa desde su creación

## Solución Sugerida para el Backend

### Opción 1: Valor por defecto en la entidad (Recomendado)

Asegurar que la entidad `ProductCategory` tenga el valor por defecto:

```typescript
@Entity('product_categories')
export class ProductCategory {
  // ... otros campos

  @Column({ type: 'boolean', default: true })  // ✅ Agregar default: true
  is_active: boolean;

  // ... resto de la entidad
}
```

### Opción 2: Agregar el campo al DTO de creación

Si se prefiere que el frontend controle este valor, agregar el campo al `CreateCategoryDto`:

```typescript
export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  parent_id?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value ?? true)  // ✅ Default a true si no se envía
  is_active?: boolean;
}
```

Y en el servicio:
```typescript
async createCategory(createDto: CreateCategoryDto): Promise<ProductCategory> {
  const category = this.categoryRepository.create({
    ...createDto,
    is_active: createDto.is_active ?? true,  // ✅ Asegurar que sea true por defecto
  });

  return await this.categoryRepository.save(category);
}
```

## Recomendación

**Preferimos la Opción 1** porque:
- Es más simple y sigue el principio de "convención sobre configuración"
- Las nuevas categorías deberían estar activas por defecto (es el caso más común)
- Si se quiere crear una categoría inactiva, se puede desactivar después de la creación

## Impacto

**Severidad:** Media

**Impacto en el usuario:**
- Los usuarios tienen que editar cada categoría recién creada para activarla
- Puede causar confusión al no ver las categorías en filtros que solo muestran activas

## Testing Sugerido

Después de implementar la corrección, probar:

### Test 1: Crear categoría sin is_active
```bash
POST /products/categories
{
  "code": "TEST1",
  "name": "Test Category"
}

# Resultado esperado: is_active = true
```

### Test 2: Crear categoría con is_active explícito (si se implementa Opción 2)
```bash
POST /products/categories
{
  "code": "TEST2",
  "name": "Test Category 2",
  "is_active": false
}

# Resultado esperado: is_active = false
```

## Estado Actual del Frontend

El frontend ha sido actualizado para:
- ✅ No enviar `is_active` al crear categorías (para evitar error 400)
- ✅ Sí enviar `is_active` al editar categorías (funciona correctamente)
- ✅ Mostrar correctamente el estado activo/inactivo en la UI

## Prioridad

**MEDIA** - Las categorías se pueden activar manualmente después de crearlas, pero esto es inconveniente para los usuarios.

## Contacto

Frontend team esperando confirmación de la corrección en el backend.
