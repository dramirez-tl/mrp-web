// BOMs Types and Interfaces

export enum BomStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  OBSOLETE = 'OBSOLETE'
}

export interface BomItem {
  id?: string;
  bom_id?: string;
  component_id: string;
  component?: {
    id: string;
    code: string;
    name: string;
    type: string;
    unit_measure: string;
    standard_cost?: number;
    average_cost?: number;
    category?: {
      id: string;
      name: string;
      code: string;
    };
  };
  quantity: number;
  scrap_rate?: number;
  notes?: string;
  sequence_number?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Bom {
  id: string;
  code: string;
  name: string;
  description?: string;
  product_id: string;
  product?: {
    id: string;
    code: string;
    name: string;
    type: string;
    unit_measure: string;
    category?: {
      id: string;
      name: string;
      code: string;
    };
  };
  status: BomStatus;
  version: string;
  batch_size: number;
  batch_unit: string;
  effective_date?: string;
  expiration_date?: string;
  labor_cost?: number;
  overhead_cost?: number;
  material_cost?: number;
  total_cost?: number;
  notes?: string;
  items?: BomItem[];
  _count?: {
    items: number;
  };
  created_at: string;
  updated_at: string;
}

export interface CreateBomDto {
  code: string;
  name: string;
  description?: string;
  product_id: string;
  version: string;
  batch_size: number;
  batch_unit: string;
  labor_cost?: number;
  overhead_cost?: number;
  effective_date?: string;
  expiration_date?: string;
  notes?: string;
  items: {
    component_id: string;
    quantity: number;
    scrap_rate?: number;
    notes?: string;
  }[];
}

export interface UpdateBomDto extends Partial<CreateBomDto> {}

export interface FilterBomsDto {
  page?: number;
  limit?: number;
  search?: string;
  product_id?: string;
  status?: BomStatus;
  active_only?: boolean;
  sortBy?: 'code' | 'createdAt' | 'updatedAt' | 'version';
  order?: 'asc' | 'desc';
}

export interface BomsResponse {
  data: Bom[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface BomExplosionRequest {
  quantity: number;
}

export interface BomExplosionResponse {
  bom_code: string;
  product_code: string;
  product_name: string;
  requested_quantity: number;
  batch_size: number;
  batch_unit: string;
  requirements: {
    component_id: string;
    component_code: string;
    component_name: string;
    required_quantity: number;
    unit_measure: string;
    unit_cost: number;
    total_cost: number;
  }[];
  total_material_cost: number;
  total_labor_cost: number;
  total_overhead_cost: number;
}