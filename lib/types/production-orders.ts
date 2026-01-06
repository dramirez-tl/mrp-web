// Production Orders Types and Interfaces

export enum ProductionOrderStatus {
  PLANNED = 'PLANNED',
  RELEASED = 'RELEASED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED'
}

export enum ProductionOrderPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum ProductionOutputType {
  GOOD = 'GOOD',
  REWORK = 'REWORK',
  SCRAP = 'SCRAP'
}

export interface MaterialRequirement {
  material_id: string;  // Renombrado de component_id
  component?: {
    id: string;
    code: string;
    name: string;
    unit_measure: string;
    current_stock?: number;
    category?: {
      id: string;
      name: string;
    };
  };
  required_qty: number;  // Renombrado de quantity_required
  unit_measure: string;
  // Campos eliminados por el backend:
  // - quantity_consumed (se eliminó)
  // - quantity_remaining (se eliminó)
  // - available_stock (se eliminó)
  // - coverage_percentage (se eliminó)
  // - shortage (se eliminó)
}

export interface MaterialConsumptionItem {
  id?: string;
  component_id: string;
  component?: {
    id: string;
    code: string;
    name: string;
  };
  quantity_consumed: number;
  lot_number?: string;
  notes?: string;
}

export interface MaterialConsumption {
  id: string;
  production_order_id: string;
  consumption_date: string;
  shift?: string;
  operator?: string;
  observations?: string;
  items: MaterialConsumptionItem[];
}

export interface ProductionOutput {
  id: string;
  production_order_id: string;
  quantity_produced: number;
  output_type: ProductionOutputType;
  lot_number: string;
  production_date: string;
  expiration_date?: string;
  operator?: string;
  observations?: string;
  quality_report?: string;
}

export interface ProductionOrder {
  id: string;
  order_number: string;
  product_id: string;
  product?: {
    id: string;
    code: string;
    name: string;
    unit_measure: string;
  };
  bom_id: string;
  bom?: {
    id: string;
    code: string;
    version: string;
  };
  planned_qty: number;
  produced_qty: number;
  status: ProductionOrderStatus;
  priority: ProductionOrderPriority;
  planned_start_date: string;
  planned_end_date: string;
  actual_start_date?: string;
  actual_end_date?: string;
  description?: string;
  work_center?: string;
  created_by?: string;
  supervisor?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  shift?: string;
  notes?: string;
  material_requirements?: MaterialRequirement[];
  material_consumptions?: MaterialConsumption[];
  production_outputs?: ProductionOutput[];
  _count?: {
    material_requirements: number;
    material_consumptions: number;
    production_outputs: number;
  };
  created_at: string;
  updated_at: string;
  // Métricas calculadas
  completion_percentage?: number;
  is_delayed?: boolean;
  total_material_cost?: number;
  efficiency?: number;
}

export interface CreateProductionOrderDto {
  order_number: string;
  product_id: string;
  bom_id: string;
  planned_qty: number;
  priority: ProductionOrderPriority;
  planned_start_date: string;
  planned_end_date: string;
  description?: string;
  work_center?: string;
  created_by?: string;
  shift?: string;
  notes?: string;
}

export interface UpdateProductionOrderDto extends Partial<CreateProductionOrderDto> {}

export interface FilterProductionOrdersDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProductionOrderStatus;
  priority?: ProductionOrderPriority;
  product_id?: string;
  work_center?: string;
  created_by?: string;
  start_from?: string;
  start_to?: string;
  end_from?: string;
  end_to?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface ProductionOrdersResponse {
  data: ProductionOrder[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface RegisterMaterialConsumptionDto {
  production_order_id: string;
  consumption_date: string;
  items: {
    component_id: string;
    quantity_consumed: number;
    lot_number?: string;
    notes?: string;
  }[];
  shift?: string;
  operator?: string;
  observations?: string;
}

export interface RegisterProductionOutputDto {
  production_order_id: string;
  quantity_produced: number;
  output_type: ProductionOutputType;
  lot_number: string;
  production_date: string;
  expiration_date?: string;
  operator?: string;
  observations?: string;
  quality_report?: string;
}

export interface ProductionSummary {
  order_info: {
    order_number: string;
    product: any;
    planned_qty: number;
    produced_qty: number;
    remaining_qty: number;  // Renombrado de quantity_remaining
    completion_percentage: number;
    status: ProductionOrderStatus;
    planned_dates: {  // Renombrado de scheduled_dates
      start: string;
      end: string;
    };
    actual_dates: {
      start?: string;
      end?: string;
    };
  };
  material_consumption: {
    total_consumptions: number;
    total_consumed: number;  // Nuevo campo, reemplaza total_items y total_cost
    // Campos eliminados:
    // - total_items (eliminado)
    // - total_cost (eliminado)
  };
  production_output: {
    total_outputs: number;
    total_produced: number;  // Nuevo campo, reemplaza good_production
    // Campos eliminados:
    // - good_production (eliminado)
    // - rejected_quantity (eliminado)
    // - rework_quantity (eliminado)
  };
  is_delayed: boolean;  // Movido de efficiency_metrics a raíz
  // efficiency_metrics: ELIMINADO COMPLETAMENTE
}