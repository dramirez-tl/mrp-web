// MRP Types

export enum DemandStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  COMPLETED = 'COMPLETED'
}

export enum DemandPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum MrpRunStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  APPROVED = 'APPROVED'
}

export interface MrpDemandItem {
  id?: string;
  product_id: string;
  product?: {
    id: string;
    code: string;
    name: string;
    type: string;
  };
  quantity: number;
  required_date: string;
  priority: DemandPriority;
  notes?: string;
}

export interface MrpDemand {
  id: string;
  code: string;
  description: string;
  start_date: string;
  end_date: string;
  status: DemandStatus;
  items: MrpDemandItem[];
  created_at: string;
  updated_at: string;
  created_by?: {
    id: string;
    name: string;
  };
}

export interface CreateMrpDemandDto {
  code: string;
  description: string;
  start_date: string;
  end_date: string;
  items: Omit<MrpDemandItem, 'id' | 'product'>[];
}

export interface UpdateMrpDemandDto extends Partial<CreateMrpDemandDto> {
  status?: DemandStatus;
}

export interface RunMrpCalculationDto {
  demand_ids?: string[];
  include_safety_stock: boolean;
  consolidate_orders: boolean;
  planning_horizon_days: number;
}

export interface MrpRequirement {
  id: string;
  material_id: string;
  material: {
    id: string;
    code: string;
    name: string;
    type: string;
    unit_of_measure: string;
  };
  required_quantity: number;
  available_quantity: number;
  on_order_quantity: number;
  net_requirement: number;
  planned_order_quantity: number;
  planned_order_date: string;
  supplier?: {
    id: string;
    code: string;
    name: string;
  };
  lead_time_days: number;
  unit_cost: number;
  total_cost: number;
  is_critical: boolean;
}

export interface MrpRunResult {
  id: string;
  run_number: string;
  status: MrpRunStatus;
  started_at: string;
  completed_at?: string;
  parameters: RunMrpCalculationDto;
  demands: MrpDemand[];
  requirements: MrpRequirement[];
  summary: {
    total_products: number;
    total_materials: number;
    total_requirements: number;
    critical_items: number;
    total_cost: number;
    purchase_orders_suggested: number;
    production_orders_suggested: number;
  };
  created_by: {
    id: string;
    name: string;
  };
}

export interface ApproveOrdersDto {
  order_ids: string[];
  order_type: 'PURCHASE' | 'PRODUCTION';
}