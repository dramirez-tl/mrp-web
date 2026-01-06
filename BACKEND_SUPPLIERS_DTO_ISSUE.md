# Solicitud de Corrección: Endpoint de Proveedores - Validación DTO Incorrecta

**Fecha**: 21 de Noviembre de 2025
**Prioridad**: 🔴 **ALTA** - Bloquea funcionalidad crítica
**Módulo**: Proveedores (Suppliers)
**Endpoint afectado**: `POST /suppliers`

---

## 🐛 Problema Detectado

Al intentar crear un proveedor desde el frontend, el backend rechaza **TODOS los campos** con el siguiente error:

```
property tax_id should not exist
property trade_name should not exist
property type should not exist
property address should not exist
property city should not exist
property state should not exist
property postal_code should not exist
property country should not exist
property phone should not exist
property email should not exist
```

---

## 🔍 Análisis

Este error indica que:

1. **El DTO de validación está vacío o no acepta ninguna propiedad**
2. El backend está rechazando campos legítimos que deberían ser aceptados
3. Posible desconexión entre la estructura de la base de datos (modelo Prisma) y el DTO de validación

---

## ✅ Solución Requerida

### 1. **Verificar y Corregir el DTO de Creación de Proveedores**

El DTO `CreateSupplierDto` debe aceptar los siguientes campos:

#### **Campos Requeridos** (obligatorios):
```typescript
code: string;           // Código único del proveedor
tax_id: string;         // RFC o Tax ID
name: string;           // Razón social
type: SupplierType;     // NATIONAL | INTERNATIONAL | LOCAL
address: string;        // Dirección completa
city: string;           // Ciudad
state: string;          // Estado/Provincia
postal_code: string;    // Código postal
country: string;        // País
phone: string;          // Teléfono principal
email: string;          // Email principal
```

#### **Campos Opcionales**:
```typescript
trade_name?: string;         // Nombre comercial
phone_secondary?: string;    // Teléfono secundario
email_secondary?: string;    // Email secundario
website?: string;            // Sitio web
contact_name?: string;       // Nombre del contacto
contact_position?: string;   // Cargo del contacto
contact_phone?: string;      // Teléfono del contacto
contact_email?: string;      // Email del contacto
credit_days?: number;        // Días de crédito
credit_limit?: number;       // Límite de crédito
currency?: string;           // Moneda (MXN, USD, EUR, CAD)
bank_account?: string;       // Cuenta bancaria
bank_name?: string;          // Nombre del banco
notes?: string;              // Notas adicionales
custom_fields?: any;         // Campos personalizados (JSON)
```

---

## 📋 Ejemplo del DTO Correcto (NestJS)

```typescript
// src/suppliers/dto/create-supplier.dto.ts
import { IsString, IsEmail, IsEnum, IsOptional, IsNumber, IsObject, MaxLength } from 'class-validator';
import { SupplierType } from '@prisma/client';

export class CreateSupplierDto {
  // ===== CAMPOS REQUERIDOS =====

  @IsString()
  @MaxLength(50)
  code: string;

  @IsString()
  @MaxLength(20)
  tax_id: string;

  @IsString()
  @MaxLength(200)
  name: string;

  @IsEnum(SupplierType)
  type: SupplierType;

  @IsString()
  @MaxLength(300)
  address: string;

  @IsString()
  @MaxLength(100)
  city: string;

  @IsString()
  @MaxLength(100)
  state: string;

  @IsString()
  @MaxLength(20)
  postal_code: string;

  @IsString()
  @MaxLength(100)
  country: string;

  @IsString()
  @MaxLength(30)
  phone: string;

  @IsEmail()
  @MaxLength(200)
  email: string;

  // ===== CAMPOS OPCIONALES =====

  @IsOptional()
  @IsString()
  @MaxLength(200)
  trade_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone_secondary?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(200)
  email_secondary?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  contact_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  contact_position?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  contact_phone?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(200)
  contact_email?: string;

  @IsOptional()
  @IsNumber()
  credit_days?: number;

  @IsOptional()
  @IsNumber()
  credit_limit?: number;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  bank_account?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  bank_name?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsObject()
  custom_fields?: any;
}
```

---

## 📋 Ejemplo del DTO de Actualización (NestJS)

```typescript
// src/suppliers/dto/update-supplier.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateSupplierDto } from './create-supplier.dto';
import { SupplierStatus } from '@prisma/client';

export class UpdateSupplierDto extends PartialType(CreateSupplierDto) {
  @IsOptional()
  @IsEnum(SupplierStatus)
  status?: SupplierStatus;
}
```

---

## 🧪 Request de Prueba (JSON)

Este es el payload que el frontend está enviando y que debe ser aceptado:

```json
{
  "code": "PROV-001",
  "tax_id": "ABC123456789",
  "name": "DISTRIBUIDORA DE INSUMOS NATURALES S.A. DE C.V.",
  "trade_name": "Insumos Naturales",
  "type": "NATIONAL",
  "address": "Av. Insurgentes Sur 1234, Col. Del Valle",
  "city": "Guadalajara",
  "state": "Jalisco",
  "postal_code": "44100",
  "country": "México",
  "phone": "33-1234-5678",
  "phone_secondary": "33-8765-4321",
  "email": "ventas@proveedor.com",
  "email_secondary": "administracion@proveedor.com",
  "website": "https://www.proveedor.com",
  "contact_name": "Juan Pérez García",
  "contact_position": "Gerente de Ventas",
  "contact_phone": "33-9876-5432",
  "contact_email": "juan.perez@proveedor.com",
  "credit_days": 30,
  "credit_limit": 100000.00,
  "currency": "MXN",
  "bank_account": "012180001234567890",
  "bank_name": "BBVA Bancomer",
  "notes": "Proveedor de materias primas orgánicas"
}
```

---

## 🔧 Verificaciones Adicionales

1. **Verificar que el modelo Prisma esté sincronizado**:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

2. **Verificar que el enum `SupplierType` coincida con Prisma**:
   ```prisma
   enum SupplierType {
     NATIONAL
     INTERNATIONAL
     LOCAL
   }
   ```

3. **Verificar que el enum `SupplierStatus` coincida con Prisma**:
   ```prisma
   enum SupplierStatus {
     ACTIVE
     INACTIVE
     SUSPENDED
     BLACKLISTED
   }
   ```

4. **Asegurarse de que el controlador use el DTO correcto**:
   ```typescript
   @Post()
   @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false }))
   async create(@Body() createSupplierDto: CreateSupplierDto) {
     return this.suppliersService.create(createSupplierDto);
   }
   ```

---

## 🚨 Impacto

- **Bloqueador**: No se pueden crear proveedores desde el frontend
- **Afecta**: Todo el flujo de compras y gestión de proveedores
- **Dependencias**:
  - Módulo de Órdenes de Compra (requiere proveedores)
  - Módulo de Productos (asociación producto-proveedor)
  - Módulo MRP (cálculo de lead times y precios)

---

## ✅ Checklist de Implementación

- [ ] Revisar y corregir `CreateSupplierDto`
- [ ] Revisar y corregir `UpdateSupplierDto`
- [ ] Verificar que todos los campos requeridos estén marcados correctamente
- [ ] Verificar que todos los campos opcionales tengan `@IsOptional()`
- [ ] Probar endpoint `POST /suppliers` con el JSON de ejemplo
- [ ] Probar endpoint `PATCH /suppliers/:id`
- [ ] Verificar que `GET /suppliers` devuelve todos los campos
- [ ] Verificar que `GET /suppliers/:id` devuelve todos los campos

---

## 📞 Contacto

**Reportado por**: Frontend Team
**Ambiente**: Desarrollo
**Backend API**: http://localhost:3001

---

## 📎 Archivos Frontend Relacionados

- `components/suppliers/SupplierModal.tsx` - Formulario de creación
- `lib/types/suppliers.ts` - Tipos TypeScript
- `lib/services/suppliers.service.ts` - Servicio API

**Nota**: El frontend ya está implementado y funcionando correctamente. Solo necesita que el backend acepte estos campos en el DTO.
