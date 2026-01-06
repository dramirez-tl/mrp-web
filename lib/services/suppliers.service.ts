import api from './api';
import {
  Supplier,
  SupplierProduct,
  CreateSupplierRequest,
  UpdateSupplierRequest,
  SuppliersResponse,
  SupplierStatsResponse,
  AddSupplierProductRequest
} from '@/lib/types/suppliers';

class SuppliersService {
  // ==================== PROVEEDORES ====================

  async getSuppliers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    status?: string;
    city?: string;
    state?: string;
    country?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }): Promise<SuppliersResponse> {
    // Only process params if they were actually provided
    if (!params) {
      const response = await api.get('/suppliers');
      return response.data;
    }

    // Filter out empty string values to avoid sending them to the backend
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
    );

    // Only send params if there are actual values after filtering
    if (Object.keys(cleanParams).length === 0) {
      const response = await api.get('/suppliers');
      return response.data;
    }

    const response = await api.get('/suppliers', { params: cleanParams });
    return response.data;
  }

  async getSupplier(id: string): Promise<Supplier> {
    const response = await api.get(`/suppliers/${id}`);
    return response.data;
  }

  async getSupplierByCode(code: string): Promise<Supplier> {
    const response = await api.get(`/suppliers/code/${code}`);
    return response.data;
  }

  async createSupplier(data: CreateSupplierRequest): Promise<Supplier> {
    const response = await api.post('/suppliers', data);
    return response.data;
  }

  async updateSupplier(id: string, data: UpdateSupplierRequest): Promise<Supplier> {
    const response = await api.patch(`/suppliers/${id}`, data);
    return response.data;
  }

  async deleteSupplier(id: string): Promise<void> {
    await api.delete(`/suppliers/${id}`);
  }

  async getSupplierStats(): Promise<SupplierStatsResponse> {
    const response = await api.get('/suppliers/stats');
    return response.data;
  }

  // ==================== PRODUCTOS DEL PROVEEDOR ====================

  async getSupplierProducts(supplierId: string): Promise<SupplierProduct[]> {
    const response = await api.get(`/suppliers/${supplierId}/products`);
    return response.data;
  }

  async addProductToSupplier(
    supplierId: string,
    data: AddSupplierProductRequest
  ): Promise<SupplierProduct> {
    const response = await api.post(`/suppliers/${supplierId}/products`, data);
    return response.data;
  }

  async removeProductFromSupplier(
    supplierId: string,
    productId: string
  ): Promise<void> {
    await api.delete(`/suppliers/${supplierId}/products/${productId}`);
  }

  // ==================== UTILIDADES ====================

  formatCurrency(amount?: number, currency: string = 'MXN'): string {
    if (!amount) return '-';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  getPaymentTermsLabel(paymentTerms: string): string {
    const labels: Record<string, string> = {
      CASH: 'Contado',
      NET_15: '15 días',
      NET_30: '30 días',
      NET_45: '45 días',
      NET_60: '60 días',
      NET_90: '90 días',
      PREPAID: 'Prepago',
    };
    return labels[paymentTerms] || paymentTerms;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      ACTIVE: 'Activo',
      INACTIVE: 'Inactivo',
      SUSPENDED: 'Suspendido',
      BLACKLISTED: 'Lista Negra',
    };
    return labels[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      SUSPENDED: 'bg-yellow-100 text-yellow-800',
      BLACKLISTED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      NATIONAL: '🇲🇽',
      INTERNATIONAL: '🌍',
      LOCAL: '📍',
    };
    return icons[type] || '📦';
  }
}

export default new SuppliersService();