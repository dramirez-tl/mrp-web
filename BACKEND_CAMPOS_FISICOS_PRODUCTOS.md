# Solicitud: Agregar Campos Físicos al Endpoint de Productos

## Contexto

Al intentar crear/editar productos desde el frontend, el backend está rechazando los siguientes campos con error 400:

```
Error de validación: property unit_weight should not exist
```

## Campos Solicitados

El frontend está intentando enviar los siguientes campos físicos que son **muy útiles** para un sistema MRP:

### 1. `unit_weight` (Peso Unitario)
- **Tipo**: `number` (float/decimal)
- **Opcional**: Sí
- **Descripción**: Peso de una unidad del producto en kilogramos
- **Ejemplo**: `0.270` (para Jimmy Coffee 270g = 0.27 kg)
- **Uso**: Cálculos de logística, transporte, capacidad de almacén

### 2. `unit_volume` (Volumen Unitario)
- **Tipo**: `number` (float/decimal)
- **Opcional**: Sí
- **Descripción**: Volumen de una unidad del producto en litros
- **Ejemplo**: `0.250` (250 ml = 0.25 L)
- **Uso**: Cálculos de capacidad de almacén, optimización de espacios

### 3. `units_per_package` (Unidades por Paquete)
- **Tipo**: `number` (integer)
- **Opcional**: Sí
- **Descripción**: Cantidad de unidades que vienen en un paquete/empaque
- **Ejemplo**: `12` (una caja contiene 12 unidades)
- **Uso**: Planificación de compras, control de inventario por cajas/pallets

## Endpoints Afectados

Por favor agregar estos campos a:

1. **POST** `/products` - Crear producto
2. **PUT** `/products/:id` - Actualizar producto
3. **GET** `/products` - Listar productos (incluir en respuesta)
4. **GET** `/products/:id` - Obtener producto (incluir en respuesta)

## DTO Sugerido (CreateProductDto / UpdateProductDto)

```typescript
export class CreateProductDto {
  // ... campos existentes ...

  // Campos físicos (opcionales)
  @IsOptional()
  @IsNumber()
  @Min(0)
  unit_weight?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unit_volume?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  units_per_package?: number;
}
```

## Schema Prisma Sugerido

```prisma
model Product {
  // ... campos existentes ...

  // Campos físicos
  unit_weight       Float?
  unit_volume       Float?
  units_per_package Int?
}
```

## Beneficios para el Sistema MRP

1. **Logística**: Calcular peso total de órdenes de compra/producción
2. **Almacén**: Optimizar espacio basado en volumen de productos
3. **Compras**: Saber cuántas cajas/pallets ordenar basado en unidades por paquete
4. **Producción**: Planificar recursos considerando dimensiones físicas
5. **Reportes**: Análisis de capacidad de almacenamiento vs inventario

## Prioridad

**MEDIA-ALTA** - Estos campos son estándar en sistemas MRP/ERP y son necesarios para una gestión completa de inventario y logística.

## Estado Actual del Frontend

✅ El frontend YA está preparado para usar estos campos:
- Formulario de producto tiene los inputs
- Validaciones implementadas
- Tipos TypeScript definidos
- Textos de ayuda para el usuario

Solo falta que el backend acepte y persista estos datos.

## Ejemplo de Payload que Envía el Frontend

```json
{
  "code": "9019",
  "name": "JIMMY COFFEE 270g",
  "type": "PT",
  "purchase_unit": "PZ",
  "inventory_unit": "PZ",
  "conversion_factor": 1,
  "unit_weight": 0.270,
  "unit_volume": 0.250,
  "units_per_package": 12,
  "lead_time_days": 3,
  "min_stock": 100,
  "max_stock": 1000
}
```

---

**Fecha de solicitud**: 20 de Noviembre, 2025
**Solicitado por**: Frontend Team (Diego)
**Módulo**: Productos / Inventario
