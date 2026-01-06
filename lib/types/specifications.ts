export enum SpecificationType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  DATE = 'DATE',
  SELECT = 'SELECT',
  MULTISELECT = 'MULTISELECT',
}

export interface ProductSpecification {
  id: string;
  product_id: string;
  name: string;
  value: string;
  unit?: string;
  type: SpecificationType;
  category?: string;
  sequence: number;
  is_required: boolean;
  is_visible: boolean;
  created_at: string;
  updated_at: string;

  // Relations
  products?: {
    id: string;
    code: string;
    name: string;
  };
}

export interface CreateSpecificationDto {
  product_id: string;
  name: string;
  value: string;
  unit?: string;
  type?: SpecificationType;
  category?: string;
  sequence?: number;
  is_required?: boolean;
  is_visible?: boolean;
}

export interface UpdateSpecificationDto {
  name?: string;
  value?: string;
  unit?: string;
  type?: SpecificationType;
  category?: string;
  sequence?: number;
  is_required?: boolean;
  is_visible?: boolean;
}

export interface BulkCreateSpecificationsDto {
  product_id: string;
  specifications: Omit<CreateSpecificationDto, 'product_id'>[];
}

export interface SpecificationTemplate {
  id: string;
  name: string;
  description?: string;
  category_id?: string;
  specifications: TemplateSpecification[];
  created_at: string;
  updated_at: string;

  // Relations
  product_categories?: {
    id: string;
    code: string;
    name: string;
  };
}

export interface TemplateSpecification {
  name: string;
  type: SpecificationType;
  unit?: string;
  category?: string;
  is_required?: boolean;
  is_visible?: boolean;
  default_value?: string;
  options?: string[]; // For SELECT/MULTISELECT types
}

export interface CreateSpecificationTemplateDto {
  name: string;
  description?: string;
  category_id?: string;
  specifications: TemplateSpecification[];
}

export interface UpdateSpecificationTemplateDto {
  name?: string;
  description?: string;
  category_id?: string;
  specifications?: TemplateSpecification[];
}

export interface SpecificationStatistics {
  total_specifications: number;
  required_specifications: number;
  by_type: Record<string, number>;
  by_category: Record<string, number>;
  templates_available: number;
}