# Guía de Ingreso de Datos - Productos Jimmy Coffee

Esta guía te ayudará a ingresar los datos de prueba para los productos **Jimmy Coffee** en el sistema MRP Tonic Life.

## ⚠️ IMPORTANTE - Cambios en el Sistema (Nov 2025)

El sistema ahora requiere **3 campos nuevos obligatorios** para todos los productos:

1. **Unidad de Compra**: La unidad en la que se compra el producto al proveedor
2. **Unidad de Inventario**: La unidad en la que se maneja el producto en el inventario
3. **Factor de Conversión**: El factor de conversión entre ambas unidades

### Ejemplo de Factor de Conversión:
- Si compras en **Kilogramos (KG)** pero manejas inventario en **Gramos (G)**: Factor = `1000`
- Si compras en **Cajas (BOX)** pero manejas inventario en **Piezas (PZ)**: Factor = `24` (si cada caja tiene 24 piezas)
- Si usas la misma unidad para compra e inventario: Factor = `1`

### Campos Removidos:
Los siguientes campos ya **NO están disponibles** en el sistema:
- ❌ Unidad de Medida única (ahora son dos: compra e inventario)
- ❌ Control por Lotes, Control de Caducidad (movidos a otro módulo)
- ❌ Temperatura/Humedad Mínima/Máxima (removidos del modelo)
- ❌ Condiciones de Almacenamiento (removido del modelo)
- ❌ Costo Estándar (se calcula automáticamente desde el BOM)

---

## Tabla de Contenidos

1. [Paso Previo: Crear Categoría "Polvos"](#paso-previo-crear-categoría-polvos)
2. [Paso 1: Crear las Materias Primas (MP)](#paso-1-crear-las-materias-primas-mp)
3. [Paso 2: Crear el Producto Terminado - Jimmy Coffee 270g](#paso-2-crear-el-producto-terminado---jimmy-coffee-270g)
4. [Paso 3: Crear BOM para Jimmy Coffee 270g](#paso-3-crear-bom-para-jimmy-coffee-270g)
5. [Paso 4: Crear el Producto Terminado - Jimmy Coffee 10 Sobres](#paso-4-crear-el-producto-terminado---jimmy-coffee-10-sobres)
6. [Paso 5: Crear BOM para Jimmy Coffee 10 Sobres](#paso-5-crear-bom-para-jimmy-coffee-10-sobres)

---

## Paso Previo: Crear Categoría "Polvos"

Antes de crear los productos, asegúrate de tener la categoría "Polvos" disponible.

### Acceso

1. Inicia sesión en el sistema MRP Tonic Life
2. Navega a **Productos** en el menú lateral
3. Haz clic en el botón **"Categorías"** (ubicado en la parte superior de la página)

### Crear Categoría

1. En el modal de categorías, haz clic en **"Nueva Categoría"**
2. Completa los siguientes campos:
   - **Código**: `POLVOS`
   - **Nombre**: `Polvos`
   - **Descripción**: `Productos en presentación de polvo`
   - **Color**: Selecciona un color (ej: `#FFB74D` - naranja claro)
   - **Icono**: Selecciona un ícono apropiado
   - **Estado**: Activo ✓
3. Haz clic en **"Guardar"**
4. Cierra el modal de categorías

---

## Paso 1: Crear las Materias Primas (MP)

Necesitarás crear 5 materias primas que serán componentes de los productos terminados.

### 1.1 MP694 - CAFÉ SOLUBLE, POLVO

1. En la página de **Productos**, haz clic en **"Nuevo Producto"**
2. **Pestaña "Información Básica":**
   - **Código**: `MP694`
   - **Nombre**: `CAFÉ SOLUBLE, POLVO`
   - **Descripción**: `Café soluble en polvo para fórmulas`
   - **Tipo**: `Materia Prima`
   - **Categoría**: `Polvos`
   - **Presentación**: `Polvo`
   - **Unidad de Compra**: `Kilogramos (KG)` ⭐ *NUEVO CAMPO REQUERIDO*
   - **Unidad de Inventario**: `Gramos (G)` ⭐ *NUEVO CAMPO REQUERIDO*
   - **Factor de Conversión**: `1000` ⭐ *NUEVO CAMPO REQUERIDO* (1 KG = 1000 G)
3. **Pestaña "Inventario y Logística"** (opcional):
   - **Lead Time (días)**: `15`
   - **Stock Mínimo**: `1000`
   - **Punto de Reorden**: `5000`
4. **Pestaña "Calidad y Almacenamiento"** (opcional):
   - **Vida Útil (días)**: `365`
   - **Requiere Control de Calidad**: ✓
5. Haz clic en **"Crear"**

### 1.2 MP1312 - MALTEADA SABOR VAINILLA

1. Haz clic en **"Nuevo Producto"**
2. **Pestaña "Información Básica":**
   - **Código**: `MP1312`
   - **Nombre**: `MALTEADA SABOR VAINILLA`
   - **Descripción**: `Polvo de malteada sabor vainilla`
   - **Tipo**: `Materia Prima`
   - **Categoría**: `Polvos`
   - **Presentación**: `Polvo`
   - **Unidad de Compra**: `Kilogramos (KG)`
   - **Unidad de Inventario**: `Gramos (G)`
   - **Factor de Conversión**: `1000`
3. Configuración similar a MP694 (opcional)
4. Haz clic en **"Crear"**

### 1.3 MP166 - GOMA GUAR

1. Haz clic en **"Nuevo Producto"**
2. **Pestaña "Información Básica":**
   - **Código**: `MP166`
   - **Nombre**: `GOMA GUAR`
   - **Descripción**: `Goma guar como espesante`
   - **Tipo**: `Materia Prima`
   - **Categoría**: `Polvos`
   - **Presentación**: `Polvo`
   - **Unidad de Compra**: `Kilogramos (KG)`
   - **Unidad de Inventario**: `Gramos (G)`
   - **Factor de Conversión**: `1000`
3. Haz clic en **"Crear"**

### 1.4 MP1261 - EXTRACTO DE GANODERMA (REISHI) SOLUBLE

1. Haz clic en **"Nuevo Producto"**
2. **Pestaña "Información Básica":**
   - **Código**: `MP1261`
   - **Nombre**: `EXTRACTO DE GANODERMA (REISHI) SOLUBLE`
   - **Descripción**: `Polvo de extracto de Ganoderma Reishi soluble`
   - **Tipo**: `Materia Prima`
   - **Categoría**: `Polvos`
   - **Presentación**: `Polvo`
   - **Unidad de Compra**: `Kilogramos (KG)`
   - **Unidad de Inventario**: `Gramos (G)`
   - **Factor de Conversión**: `1000`
3. Haz clic en **"Crear"**

### 1.5 MP117 - DIÓXIDO DE SILICIO

1. Haz clic en **"Nuevo Producto"**
2. **Pestaña "Información Básica":**
   - **Código**: `MP117`
   - **Nombre**: `DIÓXIDO DE SILICIO`
   - **Descripción**: `Dióxido de silicio como antiaglomerante`
   - **Tipo**: `Materia Prima`
   - **Categoría**: `Polvos`
   - **Presentación**: `Polvo`
   - **Unidad de Compra**: `Kilogramos (KG)`
   - **Unidad de Inventario**: `Gramos (G)`
   - **Factor de Conversión**: `1000`
3. Haz clic en **"Crear"**

---

## Paso 2: Crear el Producto Terminado - Jimmy Coffee 270g

1. En la página de **Productos**, haz clic en **"Nuevo Producto"**
2. **Pestaña "Información Básica":**
   - **Código**: `9019`
   - **Código de Barras**: `51512` (opcional)
   - **Nombre**: `JIMMY COFFEE 270g`
   - **Descripción**: `Jimmy Coffee presentación de 270 gramos`
   - **Tipo**: `Producto Terminado`
   - **Categoría**: `Polvos`
   - **Presentación**: `Polvo`
   - **Unidad de Compra**: `Pieza (PZ)` ⭐ *NUEVO CAMPO REQUERIDO*
   - **Unidad de Inventario**: `Pieza (PZ)` ⭐ *NUEVO CAMPO REQUERIDO*
   - **Factor de Conversión**: `1` ⭐ *NUEVO CAMPO REQUERIDO* (1 PZ = 1 PZ)
3. **Pestaña "Inventario y Logística":**
   - **Peso Unitario**: `270` (gramos)
   - **Lead Time (días)**: `3`
   - **Stock Mínimo**: `100`
   - **Stock Máximo**: `1000`
   - **Punto de Reorden**: `200`
4. **Pestaña "Calidad y Almacenamiento":**
   - **Vida Útil (días)**: `730` (2 años)
   - **Requiere Control de Calidad**: ✓
5. Haz clic en **"Crear"**

---

## Paso 3: Crear BOM para Jimmy Coffee 270g

Ahora crearás la lista de materiales (BOM) que define qué componentes y en qué cantidades se necesitan para producir 1 unidad de Jimmy Coffee 270g.

### Acceso al Módulo de BOMs

1. Navega a **BOMs** en el menú lateral
2. Haz clic en **"Crear BOM"**

### Pestaña 1: Información General

1. **Código**: `BOM-JIMMY-270`
2. **Nombre**: `BOM Jimmy Coffee 270g`
3. **Descripción**: `Lista de materiales para Jimmy Coffee 270g`
4. **Producto**: Selecciona `9019 - JIMMY COFFEE 270g`
5. **Versión**: `1.0`
6. **Cantidad de Salida**: `1` (produciremos 1 unidad)
7. **Válido Desde**: (Fecha actual o dejar vacío)
8. **Válido Hasta**: (Dejar vacío)
9. **Notas**: `Fórmula estándar`

### Pestaña 2: Componentes

Haz clic en la pestaña **"Componentes"** y agrega cada materia prima:

#### Componente 1: Café Soluble
1. Haz clic en **"Agregar Componente"**
2. **Componente**: `MP694 - CAFÉ SOLUBLE, POLVO`
3. **Cantidad**: `132.5` (gramos)
4. **Merma (%)**: `2` (opcional, ajusta según tu proceso)
5. **Notas**: `Ingrediente principal`

#### Componente 2: Malteada Vainilla
1. Haz clic en **"Agregar Componente"**
2. **Componente**: `MP1312 - MALTEADA SABOR VAINILLA`
3. **Cantidad**: `131` (gramos)
4. **Merma (%)**: `1`
5. **Notas**: `Saborizante`

#### Componente 3: Goma Guar
1. Haz clic en **"Agregar Componente"**
2. **Componente**: `MP166 - GOMA GUAR`
3. **Cantidad**: `3.5` (gramos)
4. **Merma (%)**: `0`
5. **Notas**: `Espesante`

#### Componente 4: Extracto de Ganoderma
1. Haz clic en **"Agregar Componente"**
2. **Componente**: `MP1261 - EXTRACTO DE GANODERMA (REISHI) SOLUBLE`
3. **Cantidad**: `0.5` (gramos)
4. **Merma (%)**: `0`
5. **Notas**: `Extracto funcional`

#### Componente 5: Dióxido de Silicio
1. Haz clic en **"Agregar Componente"**
2. **Componente**: `MP117 - DIÓXIDO DE SILICIO`
3. **Cantidad**: `1` (gramo)
4. **Merma (%)**: `0`
5. **Notas**: `Antiaglomerante`

**Total de componentes: 268.5 gramos** (más merma = ~270g final)

### Pestaña 3: Costos

1. **Costo de Mano de Obra**: `5.00` (ejemplo)
2. **Gastos Generales**: `2.50` (ejemplo)
3. Revisa el **Resumen de Costos** que se calcula automáticamente

### Guardar BOM

1. Haz clic en **"Guardar"**
2. El sistema creará el BOM y lo mostrará en la lista

---

## Paso 4: Crear el Producto Terminado - Jimmy Coffee 10 Sobres

1. En la página de **Productos**, haz clic en **"Nuevo Producto"**
2. **Pestaña "Información Básica":**
   - **Código**: `9309`
   - **Código de Barras**: `5281` (opcional)
   - **Nombre**: `JIMMY COFFEE C/10 SOBRES DE 12g C/U`
   - **Descripción**: `Jimmy Coffee caja con 10 sobres de 12 gramos cada uno`
   - **Tipo**: `Producto Terminado`
   - **Categoría**: `Polvos`
   - **Presentación**: `Polvo`
   - **Unidad de Compra**: `Caja (BOX)` ⭐ *NUEVO CAMPO REQUERIDO*
   - **Unidad de Inventario**: `Caja (BOX)` ⭐ *NUEVO CAMPO REQUERIDO*
   - **Factor de Conversión**: `1` ⭐ *NUEVO CAMPO REQUERIDO* (1 BOX = 1 BOX)
3. **Pestaña "Inventario y Logística":**
   - **Peso Unitario**: `120` (gramos - 10 sobres x 12g)
   - **Unidades por Paquete**: `10` (sobres)
   - **Lead Time (días)**: `3`
   - **Stock Mínimo**: `500`
   - **Stock Máximo**: `10000`
   - **Punto de Reorden**: `1000`
4. **Pestaña "Calidad y Almacenamiento":**
   - **Vida Útil (días)**: `730` (2 años)
   - **Requiere Control de Calidad**: ✓
5. Haz clic en **"Crear"**

---

## Paso 5: Crear BOM para Jimmy Coffee 10 Sobres

Este BOM define las cantidades necesarias para producir 1 caja (10 sobres de 12g cada uno).

### Acceso al Módulo de BOMs

1. Navega a **BOMs** en el menú lateral
2. Haz clic en **"Crear BOM"**

### Pestaña 1: Información General

1. **Código**: `BOM-JIMMY-10S`
2. **Nombre**: `BOM Jimmy Coffee 10 Sobres`
3. **Descripción**: `Lista de materiales para Jimmy Coffee 10 sobres de 12g`
4. **Producto**: Selecciona `9309 - JIMMY COFFEE C/10 SOBRES DE 12g C/U`
5. **Versión**: `1.0`
6. **Cantidad de Salida**: `1` (1 caja = 10 sobres)
7. **Notas**: `Fórmula para presentación en sobres`

### Pestaña 2: Componentes

Basándonos en los datos proporcionados, las cantidades son por sobre individual (12g):

#### Componente 1: Café Soluble
1. Haz clic en **"Agregar Componente"**
2. **Componente**: `MP694 - CAFÉ SOLUBLE, POLVO`
3. **Cantidad**: `58.956` (gramos por sobre) × 10 = `589.56` gramos por caja
   - **NOTA**: Usa `58.956` o redondea a `59` gramos
4. **Merma (%)**: `2`
5. **Notas**: `Ingrediente principal - por sobre`

#### Componente 2: Malteada Vainilla
1. Haz clic en **"Agregar Componente"**
2. **Componente**: `MP1312 - MALTEADA SABOR VAINILLA`
3. **Cantidad**: `58.434` gramos por sobre × 10 = `584.34` gramos por caja
   - **NOTA**: Usa `58.434` o redondea a `58.5` gramos
4. **Merma (%)**: `1`
5. **Notas**: `Saborizante`

#### Componente 3: Extracto de Ganoderma
1. Haz clic en **"Agregar Componente"**
2. **Componente**: `MP1261 - EXTRACTO DE GANODERMA (REISHI) SOLUBLE`
3. **Cantidad**: `0.26` gramos por sobre × 10 = `2.6` gramos por caja
4. **Merma (%)**: `0`
5. **Notas**: `Extracto funcional`

#### Componente 4: Goma Guar
1. Haz clic en **"Agregar Componente"**
2. **Componente**: `MP166 - GOMA GUAR`
3. **Cantidad**: `1.565` gramos por sobre × 10 = `15.65` gramos por caja
4. **Merma (%)**: `0`
5. **Notas**: `Espesante`

#### Componente 5: Dióxido de Silicio
1. Haz clic en **"Agregar Componente"**
2. **Componente**: `MP117 - DIÓXIDO DE SILICIO`
3. **Cantidad**: `0.26` gramos por sobre × 10 = `2.6` gramos por caja
4. **Merma (%)**: `0`
5. **Notas**: `Antiaglomerante`

**Total aproximado: ~120 gramos por caja (10 sobres de 12g)**

### Pestaña 3: Costos

1. **Costo de Mano de Obra**: `8.00` (ejemplo, mayor por empaque individual)
2. **Gastos Generales**: `4.00` (ejemplo)
3. Revisa el **Resumen de Costos**

### Guardar BOM

1. Haz clic en **"Guardar"**
2. El sistema creará el BOM

---

## Verificación Final

### Productos Creados

Ve a **Productos** y verifica que tienes:

**Materias Primas (5):**
- MP694 - CAFÉ SOLUBLE, POLVO
- MP1312 - MALTEADA SABOR VAINILLA
- MP166 - GOMA GUAR
- MP1261 - EXTRACTO DE GANODERMA (REISHI) SOLUBLE
- MP117 - DIÓXIDO DE SILICIO

**Productos Terminados (2):**
- 9019 - JIMMY COFFEE 270g
- 9309 - JIMMY COFFEE C/10 SOBRES DE 12g C/U

### BOMs Creados

Ve a **BOMs** y verifica que tienes:

- BOM-JIMMY-270 (para Jimmy Coffee 270g)
- BOM-JIMMY-10S (para Jimmy Coffee 10 Sobres)

---

## Notas Importantes

1. **⭐ Campos Obligatorios Nuevos**: No olvides completar **Unidad de Compra**, **Unidad de Inventario** y **Factor de Conversión** en TODOS los productos. Sin estos campos, no podrás crear el producto.

2. **Factor de Conversión**:
   - Para materias primas que se compran en KG y se usan en gramos: usa `1000`
   - Para productos terminados donde compra = inventario: usa `1`
   - Asegúrate de que el factor sea ≥ 0.0001

3. **Cantidades**: Las cantidades en los BOMs están expresadas en gramos según los datos proporcionados. Ajusta según tu proceso de manufactura real.

4. **Merma**: Los porcentajes de merma son sugerencias. Ajusta según la experiencia de producción.

5. **Costos**: Los costos de mano de obra/gastos generales son ejemplos. Debes usar tus costos reales. El costo de materiales se calcula automáticamente.

6. **Unidades de Medida**:
   - Materias primas: Compra en KG, Inventario en G (factor 1000)
   - Jimmy Coffee 270g: Compra e Inventario en Pieza/PZ (factor 1)
   - Jimmy Coffee 10 Sobres: Compra e Inventario en Caja/BOX (factor 1)

7. **Conversión de Datos Originales**:
   - Los datos originales mostraban cantidades totales para 50,000 o 63,000 unidades
   - Esta guía las convierte a cantidades **por unidad individual**
   - Ejemplo: Si el BOM original decía 2,947,800g para 50,000 cajas, aquí usamos 58.956g por caja (2,947,800 ÷ 50,000)

8. **Validación de Fórmulas**: Verifica que la suma de componentes coincida aproximadamente con el peso final del producto terminado.

---

## ¿Necesitas Ayuda?

Si encuentras problemas durante el ingreso de datos:

1. Verifica que la categoría "Polvos" esté creada y activa
2. Asegúrate de crear primero las materias primas antes de los BOMs
3. Los campos marcados con asterisco (*) son obligatorios
4. Usa el código de producto correcto al crear los BOMs
5. Revisa los costos calculados en la pestaña de Costos del BOM

---

**Fecha de Creación**: 2025-11-20
**Sistema**: MRP Tonic Life v1.0
**Autor**: Claude Code Assistant
