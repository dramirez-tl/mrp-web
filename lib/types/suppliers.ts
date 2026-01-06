export enum PaymentTerms {
  CASH = 'CASH',
  NET_15 = 'NET_15',
  NET_30 = 'NET_30',
  NET_45 = 'NET_45',
  NET_60 = 'NET_60',
  NET_90 = 'NET_90',
  PREPAID = 'PREPAID',
}

export enum Currency {
  MXN = 'MXN',
  USD = 'USD',
  EUR = 'EUR',
}

export enum SupplierStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  BLACKLISTED = 'BLACKLISTED',
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  legal_name?: string;
  rfc?: string;

  // Dirección dividida en campos separados
  address_street?: string;
  address_number?: string;
  address_colony?: string;
  address_city?: string;
  address_state?: string;
  address_country?: string;
  address_zip?: string;

  // Contacto
  contact_name?: string;
  contact_position?: string;
  contact_phone?: string;
  contact_email?: string;

  // Información financiera
  payment_terms?: PaymentTerms;
  credit_limit?: number;
  currency?: Currency;
  bank_account?: string;

  // Logística
  lead_time_days?: number;
  min_order_value?: number;

  // Estado y metadatos
  status: SupplierStatus;
  certifications?: any;
  rating?: number;
  rating_date?: string;

  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  deleted_at?: string;

  _count?: {
    supplier_products: number;
  };
  supplier_products?: SupplierProduct[];
}

export interface SupplierProduct {
  id: string;
  supplier_id: string;
  product_id: string;

  // Campos actualizados según backend
  supplier_sku?: string;              // Antes: supplier_code
  supplier_description?: string;      // Nuevo campo
  unit_price: number;
  currency?: Currency;                // Nuevo campo
  lead_time_days?: number;
  min_order_qty?: number;            // Antes: min_order_quantity
  order_multiple?: number;           // Nuevo campo
  pack_size?: number;                // Nuevo campo
  is_preferred?: boolean;            // Antes: is_primary
  is_active?: boolean;               // Nuevo campo

  created_at: string;
  updated_at: string;
  product?: {
    id: string;
    code: string;
    name: string;
    type: string;
    unit_measure: string;
    category?: {
      id: string;
      name: string;
      icon?: string;
      color?: string;
    };
  };
  supplier?: Supplier;
}

export interface CreateSupplierRequest {
  // Obligatorios
  code: string;
  name: string;

  // Opcionales - Información Legal
  legal_name?: string;
  rfc?: string;

  // Opcionales - Dirección
  address_street?: string;
  address_number?: string;
  address_colony?: string;
  address_city?: string;
  address_state?: string;
  address_country?: string;
  address_zip?: string;

  // Opcionales - Contacto
  contact_name?: string;
  contact_position?: string;
  contact_phone?: string;
  contact_email?: string;

  // Opcionales - Financiero
  payment_terms?: PaymentTerms;
  credit_limit?: number;
  currency?: Currency;
  bank_account?: string;

  // Opcionales - Logística
  lead_time_days?: number;
  min_order_value?: number;

  // Opcionales - Estado
  status?: SupplierStatus;
  certifications?: any;
}

export interface UpdateSupplierRequest extends Partial<CreateSupplierRequest> {
  rating?: number;
  rating_date?: string;
}

export interface SuppliersResponse {
  data: Supplier[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SupplierStatsResponse {
  totalSuppliers: number;
  byType: {
    NATIONAL: number;
    INTERNATIONAL: number;
    LOCAL: number;
  };
  byStatus: {
    ACTIVE: number;
    INACTIVE: number;
    SUSPENDED: number;
    BLACKLISTED: number;
  };
  activeSuppliers: number;
}

export interface AddSupplierProductRequest {
  // Obligatorios
  product_id: string;
  unit_price: number;

  // Opcionales
  supplier_sku?: string;              // Antes: supplier_code
  supplier_description?: string;      // Nuevo
  currency?: Currency;                // Nuevo (default: MXN)
  lead_time_days?: number;
  min_order_qty?: number;            // Antes: min_order_quantity
  order_multiple?: number;           // Nuevo
  pack_size?: number;                // Nuevo
  is_preferred?: boolean;            // Antes: is_primary
  is_active?: boolean;               // Nuevo (default: true)
}