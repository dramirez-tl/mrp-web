// BOMs Service for API interactions

import api from './api';
import {
  Bom,
  CreateBomDto,
  UpdateBomDto,
  FilterBomsDto,
  BomsResponse,
  BomExplosionRequest,
  BomExplosionResponse
} from '../types/boms';

class BomsService {
  private baseUrl = '/boms';

  // Create new BOM
  async create(data: CreateBomDto): Promise<Bom> {
    const response = await api.post<Bom>(this.baseUrl, data);
    return response.data;
  }

  // Get all BOMs with filters and pagination
  async findAll(filters?: FilterBomsDto): Promise<BomsResponse> {
    // Only process filters if they were actually provided
    if (!filters) {
      const response = await api.get<BomsResponse>(this.baseUrl);
      return response.data;
    }

    // Filter out empty string values to avoid sending them to the backend
    const cleanParams = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
    );

    // Only send params if there are actual values after filtering
    if (Object.keys(cleanParams).length === 0) {
      const response = await api.get<BomsResponse>(this.baseUrl);
      return response.data;
    }

    const response = await api.get<BomsResponse>(this.baseUrl, { params: cleanParams });
    return response.data;
  }

  // Get single BOM by ID
  async findOne(id: string): Promise<Bom> {
    const response = await api.get<Bom>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // Alias for findOne (for consistency with other services)
  async getById(id: string): Promise<Bom> {
    return this.findOne(id);
  }

  // Get BOM by code
  async findByCode(code: string): Promise<Bom> {
    const response = await api.get<Bom>(`${this.baseUrl}/code/${code}`);
    return response.data;
  }

  // Get active BOM for a product
  async getActiveByProduct(productId: string): Promise<Bom> {
    const response = await api.get<Bom>(`${this.baseUrl}/product/${productId}/active`);
    return response.data;
  }

  // Update BOM
  async update(id: string, data: UpdateBomDto): Promise<Bom> {
    const response = await api.patch<Bom>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  // Activate BOM
  async activate(id: string): Promise<Bom> {
    const response = await api.post<Bom>(`${this.baseUrl}/${id}/activate`);
    return response.data;
  }

  // Duplicate BOM
  async duplicate(id: string, newCode: string): Promise<Bom> {
    const response = await api.post<Bom>(`${this.baseUrl}/${id}/duplicate`, {
      newCode
    });
    return response.data;
  }

  // Explode BOM to calculate requirements
  async explodeBom(bomId: string, quantity: number): Promise<BomExplosionResponse> {
    const response = await api.post<BomExplosionResponse>(
      `${this.baseUrl}/${bomId}/explode`,
      { quantity }
    );
    return response.data;
  }

  // Delete BOM
  async remove(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }
}

export default new BomsService();