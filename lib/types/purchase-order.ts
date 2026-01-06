// Purchase Order Types

export enum PurchaseOrderStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  SENT = 'SENT',
  PARTIALLY_RECEIVED = 'PARTIALLY_RECEIVED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  discount: number;
  tax_rate: number;
  subtotal: number;
  tax_amount: number;
  total: number;
  quantity_received: number;
  received_date?: string;
  notes?: string;
  products: {
    id: string;
    code: string;
    name: string;
    unit_measure: string;
  };
}

export interface PurchaseOrder {
  id: string;
  order_number: string;
  supplier_id: string;
  status: PurchaseOrderStatus;
  order_date: string;
  expected_date?: string;
  payment_terms?: string;
  notes?: string;
  approved_at?: string;
  received_date?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  suppliers: {
    id: string;
    name: string;
    code: string;
    contact_email?: string;
    contact_phone?: string;
  };
  purchase_order_items: PurchaseOrderItem[];
  users?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  // Calculated fields
  subtotal?: number;
  tax_amount?: number;
  total_amount?: number;
}

export interface CreatePurchaseOrderDto {
  supplier_id: string;
  status?: PurchaseOrderStatus;
  order_date?: string;
  expected_date?: string;
  payment_terms?: string;
  notes?: string;
  items: CreatePurchaseOrderItemDto[];
}

export interface CreatePurchaseOrderItemDto {
  product_id: string;
  quantity: number;
  unit_price: number;
  discount?: number;
  tax_rate?: number;
  notes?: string;
}

export interface ReceiveItemDto {
  item_id: string;
  received_qty: number;
  lot_number?: string;
  notes?: string;
}

export interface PurchaseOrderStatistics {
  total_orders: number;
  by_status: Record<string, number>;
  pending_value: number;
  recent_orders: Array<{
    id: string;
    order_number: string;
    status: string;
    suppliers: {
      name: string;
    };
    created_at: string;
  }>;
}

export interface PurchaseOrderResponse {
  data: PurchaseOrder[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}