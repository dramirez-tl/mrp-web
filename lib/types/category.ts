// Product Category Types

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
}

export interface CreateCategoryDto {
  code: string;
  name: string;
  description?: string;
  parent_id?: string;
  color?: string;
  icon?: string;
  is_active?: boolean;
}

export interface UpdateCategoryDto {
  code?: string;
  name?: string;
  description?: string;
  parent_id?: string;
  color?: string;
  icon?: string;
  is_active?: boolean;
}

export interface CategoryStatistics {
  total_products: number;
  active_products: number;
  inactive_products: number;
  by_type: Record<string, number>;
}

export interface CategoryTreeNode extends ProductCategory {
  children: CategoryTreeNode[];
  level: number;
  expanded?: boolean;
}