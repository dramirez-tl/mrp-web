// Inventory Types

export enum MovementType {
  ENTRY = 'ENTRY',
  EXIT = 'EXIT',
  TRANSFER = 'TRANSFER',
  ADJUSTMENT = 'ADJUSTMENT',
  PRODUCTION_ENTRY = 'PRODUCTION_ENTRY',
  PRODUCTION_EXIT = 'PRODUCTION_EXIT',
  PURCHASE_ENTRY = 'PURCHASE_ENTRY',
  SALE_EXIT = 'SALE_EXIT',
  RETURN = 'RETURN',
  WASTE = 'WASTE'
}

export enum StockStatus {
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  CRITICAL = 'CRITICAL',
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  OVERSTOCK = 'OVERSTOCK'
}

export enum LocationType {
  WAREHOUSE = 'WAREHOUSE',
  PRODUCTION = 'PRODUCTION',
  QUARANTINE = 'QUARANTINE',
  TRANSIT = 'TRANSIT'
}

export interface InventoryLocation {
  id: string;
  code: string;
  name: string;
  type: LocationType;
  address?: string;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryCurrent {
  id: string;
  product_id: string;
  location_id: string;
  quantity_on_hand: number;
  quantity_reserved: number;
  available_quantity: number;
  batch_number?: string;
  expiration_date?: string;
  last_movement_date: string;
  stock_status: StockStatus;
  products: {
    id: string;
    code: string;
    name: string;
    unit_measure: string;
    min_stock: number;
    max_stock: number;
    reorder_point: number;
  };
  inventory_locations: {
    id: string;
    code: string;
    name: string;
    type: string;
  };
}

export interface InventoryMovement {
  id: string;
  product_id: string;
  movement_type: MovementType;
  quantity: number;
  from_location_id?: string;
  to_location_id?: string;
  batch_number?: string;
  reference_document?: string;
  notes?: string;
  movement_date: string;
  balance_after?: number;
  created_by: string;
  created_at: string;
  products: {
    id: string;
    code: string;
    name: string;
    unit_measure: string;
  };
  from_location?: {
    id: string;
    code: string;
    name: string;
  };
  to_location?: {
    id: string;
    code: string;
    name: string;
  };
  user?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export interface CreateMovementDto {
  product_id: string;
  movement_type: MovementType;
  quantity: number;
  from_location_id?: string;
  to_location_id?: string;
  batch_number?: string;
  reference_document?: string;
  notes?: string;
  movement_date?: string;
}

export interface CreateAdjustmentDto {
  product_id: string;
  quantity: number; // positive or negative
  reason: string;
  location_id?: string;
  batch_number?: string;
  notes?: string;
}

export interface CycleCountDto {
  product_id: string;
  physical_count: number;
  location_id?: string;
  batch_number?: string;
  notes?: string;
}

export interface InventoryByProduct {
  product: any;
  inventory: InventoryCurrent[];
  recent_movements: InventoryMovement[];
  summary: {
    total_on_hand: number;
    total_reserved: number;
    total_available: number;
    locations_count: number;
  };
}

export interface InventoryValuation {
  valuation: {
    product_id: string;
    product_code: string;
    product_name: string;
    product_type: string;
    quantity_on_hand: number;
    unit_cost: number;
    total_value: number;
  }[];
  summary: {
    total_items: number;
    total_quantity: number;
    total_value: number;
    by_type: Record<string, {
      count: number;
      quantity: number;
      value: number;
    }>;
  };
}

export interface MovementHistoryResponse {
  data: InventoryMovement[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}