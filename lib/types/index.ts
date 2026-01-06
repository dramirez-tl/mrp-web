// ==================== ENUMS ====================
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  GERENTE_PRODUCCION = 'GERENTE_PRODUCCION',
  PLANEADOR = 'PLANEADOR',
  SUPERVISOR = 'SUPERVISOR',
  COMPRADOR = 'COMPRADOR',
  ALMACENISTA = 'ALMACENISTA',
  CALIDAD = 'CALIDAD',
  CONSULTA = 'CONSULTA',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum ProductType {
  PT = 'PT', // Producto Terminado
  MP = 'MP', // Materia Prima
  ME = 'ME', // Material de Empaque
}

export enum SupplierType {
  RAW_MATERIAL = 'RAW_MATERIAL',
  PACKAGING = 'PACKAGING',
  SERVICE = 'SERVICE',
}

export enum BomStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum UnitMeasure {
  MG = 'MG',
  G = 'G',
  KG = 'KG',
  LB = 'LB',
  OZ = 'OZ',
  ML = 'ML',
  L = 'L',
  GAL = 'GAL',
  PZ = 'PZ',
  CAP = 'CAP',
  TAB = 'TAB',
  BOT = 'BOT',
  PAQ = 'PAQ',
  CAJ = 'CAJ',
  TAR = 'TAR',
}

// ==================== USER TYPES ====================
export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  last_login?: string;
  created_at: string;
  updated_at?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
  message: string;
}

// ==================== PRODUCT TYPES ====================
export interface ProductCategory {
  id: string;
  code: string;
  name: string;
  description?: string;
  parent_id?: string;
  level: number;
  path: string;
  parent?: ProductCategory;
  children?: ProductCategory[];
  product_count?: number;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: ProductType;
  category_id?: string;
  unit: UnitMeasure;
  cost?: number;
  price?: number;
  min_stock?: number;
  max_stock?: number;
  reorder_point?: number;
  lead_time_days?: number;
  shelf_life_days?: number;
  requires_quality_control?: boolean;
  created_at: string;
  updated_at?: string;
  category?: ProductCategory;
}

// ==================== SUPPLIER TYPES ====================
export interface Supplier {
  id: string;
  code: string;
  name: string;
  legal_name?: string;
  rfc?: string;
  type: SupplierType;
  status: string;
  description?: string;
  address_street?: string;
  address_number?: string;
  address_city?: string;
  address_state?: string;
  address_country?: string;
  address_zip?: string;
  phone?: string;
  email?: string;
  website?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  payment_terms?: string;
  credit_limit?: number;
  discount_percentage?: number;
  lead_time_days?: number;
  min_order_value?: number;
  is_approved?: boolean;
  requires_quality_audit?: boolean;
  rating?: number;
  created_at: string;
  updated_at?: string;
}

export interface SupplierProduct {
  id: string;
  supplier_id: string;
  product_id: string;
  supplier_product_code?: string;
  supplier_product_name?: string;
  unit_price: number;
  currency: string;
  min_order_qty?: number;
  package_qty?: number;
  lead_time_days?: number;
  is_primary?: boolean;
  is_active?: boolean;
  supplier?: Supplier;
  product?: Product;
}

// ==================== BOM TYPES ====================
export interface BomComponent {
  id: string;
  bom_id: string;
  material_id: string;
  quantity: number;
  unit_measure: UnitMeasure;
  scrap_percentage?: number;
  sequence_number?: number;
  stage?: string;
  instructions?: string;
  materials?: Product;
}

export interface Bom {
  id: string;
  product_id: string;
  code: string;
  name: string;
  version: string;
  batch_size: number;
  batch_unit: UnitMeasure;
  yield_percentage?: number;
  prep_time?: number;
  production_time?: number;
  cleaning_time?: number;
  status?: BomStatus;
  is_current?: boolean;
  effective_date?: string;
  expiration_date?: string;
  instructions?: string;
  created_at: string;
  updated_at?: string;
  products?: Product;
  bom_components?: BomComponent[];
  total_cost?: number;
}

// ==================== COMMON TYPES ====================
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  orderBy?: string;
  order?: 'asc' | 'desc';
  [key: string]: any;
}

export interface SelectOption {
  value: string;
  label: string;
}