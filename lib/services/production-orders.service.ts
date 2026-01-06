// Production Orders Service for API interactions

import api from './api';
import {
  ProductionOrder,
  CreateProductionOrderDto,
  UpdateProductionOrderDto,
  FilterProductionOrdersDto,
  ProductionOrdersResponse,
  ProductionOrderStatus,
  MaterialRequirement,
  RegisterMaterialConsumptionDto,
  RegisterProductionOutputDto,
  MaterialConsumption,
  ProductionOutput,
  ProductionSummary
} from '../types/production-orders';

class ProductionOrdersService {
  private baseUrl = '/production-orders';

  // Create new production order
  async create(data: CreateProductionOrderDto): Promise<ProductionOrder> {
    const response = await api.post<ProductionOrder>(this.baseUrl, data);
    return response.data;
  }

  // Get all production orders with filters and pagination
  async findAll(filters?: FilterProductionOrdersDto): Promise<ProductionOrdersResponse> {
    // Only process filters if they were actually provided
    if (!filters) {
      const response = await api.get<ProductionOrdersResponse>(this.baseUrl);
      return response.data;
    }

    // Filter out empty string values to avoid sending them to the backend
    const cleanParams = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
    );

    // Only send params if there are actual values after filtering
    if (Object.keys(cleanParams).length === 0) {
      const response = await api.get<ProductionOrdersResponse>(this.baseUrl);
      return response.data;
    }

    const response = await api.get<ProductionOrdersResponse>(this.baseUrl, { params: cleanParams });
    return response.data;
  }

  // Get single production order by ID
  async findOne(id: string): Promise<ProductionOrder> {
    const response = await api.get<ProductionOrder>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // Update production order
  async update(id: string, data: UpdateProductionOrderDto): Promise<ProductionOrder> {
    const response = await api.patch<ProductionOrder>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  // Update production order status
  async updateStatus(id: string, status: ProductionOrderStatus): Promise<ProductionOrder> {
    const response = await api.post<ProductionOrder>(`${this.baseUrl}/${id}/status`, {
      status
    });
    return response.data;
  }

  // Get material requirements for a production order
  async getMaterialRequirements(id: string): Promise<MaterialRequirement[]> {
    const response = await api.get<MaterialRequirement[]>(
      `${this.baseUrl}/${id}/requirements`
    );
    return response.data;
  }

  // Register material consumption
  async registerMaterialConsumption(data: RegisterMaterialConsumptionDto): Promise<MaterialConsumption> {
    const response = await api.post<MaterialConsumption>(
      `${this.baseUrl}/consumption`,
      data
    );
    return response.data;
  }

  // Register production output
  async registerProductionOutput(data: RegisterProductionOutputDto): Promise<ProductionOutput> {
    const response = await api.post<ProductionOutput>(
      `${this.baseUrl}/output`,
      data
    );
    return response.data;
  }

  // Get production summary
  async getProductionSummary(id: string): Promise<ProductionSummary> {
    const response = await api.get<ProductionSummary>(
      `${this.baseUrl}/${id}/summary`
    );
    return response.data;
  }

  // Delete production order
  async remove(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  // Helper methods

  // Start production order
  async startOrder(id: string): Promise<ProductionOrder> {
    return this.updateStatus(id, ProductionOrderStatus.IN_PROGRESS);
  }

  // Complete production order
  async completeOrder(id: string): Promise<ProductionOrder> {
    return this.updateStatus(id, ProductionOrderStatus.COMPLETED);
  }

  // Close production order
  async closeOrder(id: string): Promise<ProductionOrder> {
    return this.updateStatus(id, ProductionOrderStatus.CLOSED);
  }

  // Cancel production order
  async cancelOrder(id: string): Promise<ProductionOrder> {
    return this.updateStatus(id, ProductionOrderStatus.CANCELLED);
  }

  // Release production order
  async releaseOrder(id: string): Promise<ProductionOrder> {
    return this.updateStatus(id, ProductionOrderStatus.RELEASED);
  }

  // Calculate production metrics
  calculateMetrics(order: ProductionOrder) {
    const completion = order.planned_qty > 0
      ? Math.round((order.produced_qty / order.planned_qty) * 100)
      : 0;

    const isDelayed = order.status === ProductionOrderStatus.IN_PROGRESS &&
                     new Date(order.planned_end_date) < new Date();

    const daysDelayed = isDelayed
      ? Math.floor(
          (new Date().getTime() - new Date(order.planned_end_date).getTime()) /
          (1000 * 60 * 60 * 24)
        )
      : 0;

    return {
      completion,
      isDelayed,
      daysDelayed,
      efficiency: order.efficiency || 0
    };
  }
}

export default new ProductionOrdersService();