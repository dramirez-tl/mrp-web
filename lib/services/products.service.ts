import api from './api';
import {
  Product,
  ProductCategory,
  CreateProductRequest,
  UpdateProductRequest,
  ProductsResponse,
  ProductStatsResponse
} from '@/lib/types/products';
import {
  ProductSpecification,
  CreateSpecificationDto,
  UpdateSpecificationDto,
  BulkCreateSpecificationsDto,
  SpecificationTemplate,
  CreateSpecificationTemplateDto,
  UpdateSpecificationTemplateDto,
  SpecificationStatistics,
} from '@/lib/types/specifications';

class ProductsService {
  // ==================== PRODUCTOS ====================

  async getProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    category_id?: string;
    status?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }): Promise<ProductsResponse> {
    // Only process params if they were actually provided
    if (!params) {
      const response = await api.get('/products');
      return response.data;
    }

    // Filter out empty string values to avoid sending them to the backend
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
    );

    // Only send params if there are actual values after filtering
    if (Object.keys(cleanParams).length === 0) {
      const response = await api.get('/products');
      return response.data;
    }

    const response = await api.get('/products', { params: cleanParams });
    return response.data;
  }

  async getProduct(id: string): Promise<Product> {
    const response = await api.get(`/products/${id}`);
    return response.data;
  }

  async getProductByCode(code: string): Promise<Product> {
    const response = await api.get(`/products/code/${code}`);
    return response.data;
  }

  async createProduct(data: CreateProductRequest): Promise<Product> {
    const response = await api.post('/products', data);
    return response.data;
  }

  async updateProduct(id: string, data: UpdateProductRequest): Promise<Product> {
    const response = await api.patch(`/products/${id}`, data);
    return response.data;
  }

  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  }

  async getProductStats(): Promise<ProductStatsResponse> {
    const response = await api.get('/products/stats');
    return response.data;
  }

  // ==================== CATEGORÍAS ====================

  async getCategories(params?: {
    includeInactive?: boolean;
  }): Promise<ProductCategory[]> {
    // WORKAROUND: Usando /products/categories/all temporalmente
    // hasta que el backend corrija el endpoint /products/categories

    // Only process params if they were actually provided
    if (!params) {
      const response = await api.get('/products/categories/all');
      return response.data;
    }

    // Filter out undefined/null values
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined && value !== null)
    );

    // Only send params if there are actual values after filtering
    if (Object.keys(cleanParams).length === 0) {
      const response = await api.get('/products/categories/all');
      return response.data;
    }

    const response = await api.get('/products/categories/all', { params: cleanParams });
    return response.data;
  }

  async getCategoryTree(): Promise<ProductCategory[]> {
    // WORKAROUND: Usando /products/categories/all temporalmente
    // hasta que el backend corrija el endpoint /products/categories/tree
    const response = await api.get('/products/categories/all');
    return response.data;
  }

  async getCategory(id: string): Promise<ProductCategory> {
    const response = await api.get(`/products/categories/${id}`);
    return response.data;
  }

  async getCategoryStatistics(categoryId?: string): Promise<any> {
    const requestConfig = categoryId ? { params: { categoryId } } : {};
    const response = await api.get('/products/categories/statistics', requestConfig);
    return response.data;
  }

  async getProductsByCategory(categoryId: string, includeSubcategories?: boolean): Promise<Product[]> {
    const requestConfig = includeSubcategories !== undefined ? { params: { includeSubcategories } } : {};
    const response = await api.get(`/products/categories/${categoryId}/products`, requestConfig);
    return response.data;
  }

  async createCategory(data: {
    code: string;
    name: string;
    description?: string;
    parent_id?: string;
    color?: string;
    icon?: string;
    is_active?: boolean;
  }): Promise<ProductCategory> {
    const response = await api.post('/products/categories', data);
    return response.data;
  }

  async updateCategory(id: string, data: {
    code?: string;
    name?: string;
    description?: string;
    parent_id?: string;
    color?: string;
    icon?: string;
    is_active?: boolean;
  }): Promise<ProductCategory> {
    const response = await api.patch(`/products/categories/${id}`, data);
    return response.data;
  }

  async updateCategorySequence(updates: Array<{ id: string; sequence: number }>): Promise<any> {
    const response = await api.post('/products/categories/reorder', updates);
    return response.data;
  }

  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/products/categories/${id}`);
  }

  // ==================== ESPECIFICACIONES ====================

  async getSpecificationsByProduct(productId: string): Promise<ProductSpecification[]> {
    const response = await api.get(`/products/${productId}/specifications`);
    return response.data;
  }

  async getSpecification(id: string): Promise<ProductSpecification> {
    const response = await api.get(`/products/specifications/${id}`);
    return response.data;
  }

  async createSpecification(data: CreateSpecificationDto): Promise<ProductSpecification> {
    const response = await api.post('/products/specifications', data);
    return response.data;
  }

  async createBulkSpecifications(data: BulkCreateSpecificationsDto): Promise<ProductSpecification[]> {
    const response = await api.post('/products/specifications/bulk', data);
    return response.data;
  }

  async updateSpecification(id: string, data: UpdateSpecificationDto): Promise<ProductSpecification> {
    const response = await api.patch(`/products/specifications/${id}`, data);
    return response.data;
  }

  async updateSpecificationSequence(
    productId: string,
    updates: Array<{ id: string; sequence: number }>
  ): Promise<any> {
    const response = await api.post(`/products/${productId}/specifications/reorder`, updates);
    return response.data;
  }

  async deleteSpecification(id: string): Promise<void> {
    await api.delete(`/products/specifications/${id}`);
  }

  async deleteProductSpecifications(productId: string): Promise<void> {
    await api.delete(`/products/${productId}/specifications`);
  }

  async copySpecifications(sourceProductId: string, targetProductId: string): Promise<any> {
    const response = await api.post(`/products/${targetProductId}/specifications/copy`, null, {
      params: { sourceProductId }
    });
    return response.data;
  }

  // ==================== PLANTILLAS DE ESPECIFICACIONES ====================

  async getSpecificationTemplates(): Promise<SpecificationTemplate[]> {
    const response = await api.get('/products/specification-templates');
    return response.data;
  }

  async getTemplatesByCategory(categoryId: string): Promise<SpecificationTemplate[]> {
    const response = await api.get(`/products/specification-templates/category/${categoryId}`);
    return response.data;
  }

  async getSpecificationTemplate(id: string): Promise<SpecificationTemplate> {
    const response = await api.get(`/products/specification-templates/${id}`);
    return response.data;
  }

  async createSpecificationTemplate(data: CreateSpecificationTemplateDto): Promise<SpecificationTemplate> {
    const response = await api.post('/products/specification-templates', data);
    return response.data;
  }

  async updateSpecificationTemplate(
    id: string,
    data: UpdateSpecificationTemplateDto
  ): Promise<SpecificationTemplate> {
    const response = await api.patch(`/products/specification-templates/${id}`, data);
    return response.data;
  }

  async deleteSpecificationTemplate(id: string): Promise<void> {
    await api.delete(`/products/specification-templates/${id}`);
  }

  async applyTemplate(productId: string, templateId: string): Promise<any> {
    const response = await api.post(`/products/${productId}/specifications/apply-template`, null, {
      params: { templateId }
    });
    return response.data;
  }

  async getSpecificationStatistics(productId?: string): Promise<SpecificationStatistics> {
    const requestConfig = productId ? { params: { productId } } : {};
    const response = await api.get('/products/specifications/statistics', requestConfig);
    return response.data;
  }
}

export default new ProductsService();