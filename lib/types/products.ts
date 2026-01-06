export enum ProductType {
  PT = 'PT', // Producto Terminado
  MP = 'MP', // Materia Prima
  ME = 'ME', // Material de Empaque
}

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DISCONTINUED = 'DISCONTINUED',
}

export enum ProductPresentation {
  CAPSULE = 'CAPSULE',
  TABLET = 'TABLET',
  POWDER = 'POWDER',
  LIQUID = 'LIQUID',
  CREAM = 'CREAM',
  GEL = 'GEL',
  INJECTION = 'INJECTION',
  OTHER = 'OTHER',
}

// Enum actualizado según el backend
export enum UnitMeasure {
  // Peso
  MG = 'MG',
  G = 'G',
  KG = 'KG',
  LB = 'LB',
  OZ = 'OZ',
  // Volumen
  ML = 'ML',
  L = 'L',
  GAL = 'GAL',
  // Unidades
  PZ = 'PZ',    // Pieza
  CAP = 'CAP',  // Cápsula
  TAB = 'TAB',  // Tableta
  BOX = 'BOX',  // Caja
  BAG = 'BAG',  // Bolsa
  BTL = 'BTL',  // Botella
  PKT = 'PKT',  // Paquete
  PAL = 'PAL',  // Pallet
  // Otros
  MT = 'MT',    // Metro
  CM = 'CM',    // Centímetro
  M2 = 'M2',    // Metro cuadrado
  ROLL = 'ROLL' // Rollo
}

export interface ProductCategory {
  id: string;
  code: string;
  name: string;
  description?: string;
  parent_id?: string;
  color?: string;
  icon?: string;
  sequence: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;

  // Relationships
  parent?: ProductCategory;
  children?: ProductCategory[];
  products?: Array<{
    id: string;
    code: string;
    name: string;
    type: string;
    is_active: boolean;
  }>;

  // Computed
  product_count?: number;
  subcategory_count?: number;
  level?: number;
  label?: string; // For select options

  // Old field for backwards compatibility
  _count?: {
    products: number;
  };
}

export interface Product {
  id: string;
  code: string;
  barcode?: string;
  name: string;
  description?: string;
  type: ProductType;
  category_id?: string;
  product_categories?: ProductCategory; // Nombre que usa el backend
  category?: ProductCategory; // Alias para compatibilidad
  presentation?: ProductPresentation;
  status: ProductStatus;

  // Unidades (nuevos campos requeridos)
  purchase_unit: UnitMeasure;
  inventory_unit: UnitMeasure;
  conversion_factor: number;

  // Campos físicos
  unit_weight?: number;
  unit_volume?: number;
  units_per_package?: number;

  // Inventario
  min_stock?: number;
  max_stock?: number;
  reorder_point?: number;
  safety_stock?: number;
  lead_time_days?: number;

  // Calidad y almacenamiento
  shelf_life_days?: number;
  quarantine_days?: number;
  requires_quality_control?: boolean;
  sampling_plan?: string;

  // Costos
  last_purchase_cost?: number;
  average_cost?: number;
  standard_cost?: number; // Backend compatibility for BOMs and some APIs

  // Unit measure alias (backend uses this in some contexts)
  unit_measure?: string; // Maps to inventory_unit

  // Archivos
  image_url?: string;
  technical_sheet_url?: string;
  safety_sheet_url?: string;

  // Additional fields from backend
  expiration_control?: boolean;
  storage_conditions?: string;

  custom_fields?: any;
  created_at: string;
  updated_at: string;
}

export interface CreateProductRequest {
  code: string;
  barcode?: string;
  name: string;
  description?: string;
  type: ProductType;
  category_id?: string;
  presentation?: ProductPresentation;

  // Unidades (requeridos)
  purchase_unit: UnitMeasure;
  inventory_unit: UnitMeasure;
  conversion_factor: number;

  // Campos físicos
  unit_weight?: number;
  unit_volume?: number;
  units_per_package?: number;

  // Inventario
  min_stock?: number;
  max_stock?: number;
  reorder_point?: number;
  safety_stock?: number;
  lead_time_days?: number;

  // Calidad y almacenamiento
  shelf_life_days?: number;
  quarantine_days?: number;
  requires_quality_control?: boolean;
  sampling_plan?: string;

  // Archivos
  image_url?: string;
  technical_sheet_url?: string;
  safety_sheet_url?: string;

  custom_fields?: any;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  status?: ProductStatus;
}

export interface ProductsResponse {
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProductStatsResponse {
  totalProducts: number;
  byType: {
    PT: number;
    MP: number;
    ME: number;
  };
  byStatus: {
    ACTIVE: number;
    INACTIVE: number;
    DISCONTINUED: number;
  };
  lowStock: number;
  outOfStock: number;
  totalValue: number;
}