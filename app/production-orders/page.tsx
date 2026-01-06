'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/lib/types';
import api from '@/lib/api';
import {
  ProductionOrder,
  ProductionOrderStatus,
  ProductionOrderPriority,
  CreateProductionOrderDto,
  UpdateProductionOrderDto
} from '@/lib/types/production-orders';
import { Product } from '@/lib/types/products';
import ProductionOrdersList from '@/components/production/ProductionOrdersList';
import ProductionOrderModal from '@/components/production/ProductionOrderModal';
import ProductionOrdersFilters from '@/components/production/ProductionOrdersFilters';
import MaterialConsumptionModal from '@/components/production/MaterialConsumptionModal';
import ProductionOutputModal from '@/components/production/ProductionOutputModal';
import {
  BuildingOfficeIcon,
  PlusIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  CubeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

export default function ProductionPage() {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<ProductionOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);
  const [isConsumptionModalOpen, setIsConsumptionModalOpen] = useState(false);
  const [isOutputModalOpen, setIsOutputModalOpen] = useState(false);
  const [selectedOrderForAction, setSelectedOrderForAction] = useState<ProductionOrder | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '' as ProductionOrderStatus | '',
    priority: '' as ProductionOrderPriority | '',
    work_center: '',
    start_from: '',
    start_to: ''
  });

  // Estadísticas
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    completed: 0,
    delayed: 0,
    efficiency: 0
  });

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  useEffect(() => {
    applyFilters();
    calculateStats();
  }, [orders, filters]);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/production-orders');
      setOrders(response.data.data || response.data || []);
    } catch (error: any) {
      // Solo mostrar error informativo si es 404 (módulo no implementado)
      if (error.response?.status === 404) {
        console.info('ℹ️ Módulo de Órdenes de Producción aún no implementado en el backend');
      } else {
        console.error('Error fetching orders:', error);
        toast.error('Error al cargar órdenes de producción');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products', { params: { type: 'PT' } });
      setProducts(response.data.data || response.data || []);
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.info('ℹ️ No se encontraron productos de tipo PT');
      } else {
        console.error('Error fetching products:', error);
        toast.error('Error al cargar productos');
      }
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];

    // Búsqueda
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(order =>
        order.order_number.toLowerCase().includes(searchLower) ||
        order.product?.name.toLowerCase().includes(searchLower) ||
        order.product?.code.toLowerCase().includes(searchLower)
      );
    }

    // Estado
    if (filters.status) {
      filtered = filtered.filter(order => order.status === filters.status);
    }

    // Rango de fechas
    if (filters.start_from || filters.start_to) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.planned_start_date);
        if (filters.start_from && orderDate < new Date(filters.start_from)) return false;
        if (filters.start_to && orderDate > new Date(filters.start_to)) return false;
        return true;
      });
    }

    // Centro de trabajo
    if (filters.work_center) {
      filtered = filtered.filter(order =>
        order.work_center?.toLowerCase().includes(filters.work_center.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  };

  const calculateStats = () => {
    const total = orders.length;
    const inProgress = orders.filter(o => o.status === ProductionOrderStatus.IN_PROGRESS).length;
    const completed = orders.filter(o => o.status === ProductionOrderStatus.COMPLETED).length;
    const delayed = orders.filter(o => o.is_delayed).length;

    const completedOnTime = orders.filter(o =>
      o.status === ProductionOrderStatus.COMPLETED && !o.is_delayed
    ).length;

    const efficiency = completed > 0
      ? Math.round((completedOnTime / completed) * 100)
      : 0;

    setStats({
      total,
      inProgress,
      completed,
      delayed,
      efficiency
    });
  };

  const handleCreate = () => {
    setSelectedOrder(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEdit = (order: ProductionOrder) => {
    setSelectedOrder(order);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleView = (order: ProductionOrder) => {
    // TODO: Implementar vista de detalle
    console.log('View order:', order);
  };

  const handleDelete = async (order: ProductionOrder) => {
    if (!confirm(`¿Estás seguro de eliminar la orden ${order.order_number}?`)) return;

    try {
      const response = await fetch(`http://localhost:3001/api/production-orders/${order.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Error al eliminar orden');

      toast.success('Orden eliminada exitosamente');
      fetchOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Error al eliminar orden');
    }
  };

  const handleStatusChange = async (order: ProductionOrder, newStatus: ProductionOrderStatus) => {
    try {
      const response = await fetch(`http://localhost:3001/api/production-orders/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Error al cambiar estado');

      toast.success('Estado actualizado exitosamente');
      fetchOrders();
    } catch (error) {
      console.error('Error changing status:', error);
      toast.error('Error al cambiar estado');
    }
  };

  const handleRegisterConsumption = (order: ProductionOrder) => {
    setSelectedOrderForAction(order);
    setIsConsumptionModalOpen(true);
  };

  const handleRegisterOutput = (order: ProductionOrder) => {
    setSelectedOrderForAction(order);
    setIsOutputModalOpen(true);
  };

  const handleSaveConsumption = async (consumption: any[]) => {
    if (!selectedOrderForAction) return;

    try {
      const response = await fetch(
        `http://localhost:3001/api/production-orders/${selectedOrderForAction.id}/consumption`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ materials: consumption })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al registrar consumo');
      }

      toast.success('Consumo registrado exitosamente');
      setIsConsumptionModalOpen(false);
      fetchOrders();
    } catch (error) {
      console.error('Error saving consumption:', error);
      toast.error(error instanceof Error ? error.message : 'Error al registrar consumo');
    }
  };

  const handleSaveOutput = async (output: any) => {
    if (!selectedOrderForAction) return;

    try {
      const response = await fetch(
        `http://localhost:3001/api/production-orders/${selectedOrderForAction.id}/output`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(output)
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al registrar producción');
      }

      toast.success('Producción registrada exitosamente');
      setIsOutputModalOpen(false);
      fetchOrders();
    } catch (error) {
      console.error('Error saving output:', error);
      toast.error(error instanceof Error ? error.message : 'Error al registrar producción');
    }
  };

  const handleSave = async (data: CreateProductionOrderDto | UpdateProductionOrderDto) => {
    try {
      const url = selectedOrder
        ? `http://localhost:3001/api/production-orders/${selectedOrder.id}`
        : 'http://localhost:3001/api/production-orders';

      const response = await fetch(url, {
        method: selectedOrder ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al guardar orden');
      }

      toast.success(selectedOrder ? 'Orden actualizada' : 'Orden creada exitosamente');
      setIsModalOpen(false);
      fetchOrders();
    } catch (error) {
      console.error('Error saving order:', error);
      toast.error(error instanceof Error ? error.message : 'Error al guardar orden');
    }
  };

  const handleExport = () => {
    // TODO: Implementar exportación
    toast.success('Función de exportación en desarrollo');
  };

  const handleImport = () => {
    // TODO: Implementar importación
    toast.success('Función de importación en desarrollo');
  };

  return (
    <ProtectedRoute requiredRoles={[UserRole.SUPER_ADMIN, UserRole.GERENTE_PRODUCCION, UserRole.PLANEADOR, UserRole.SUPERVISOR]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BuildingOfficeIcon className="h-8 w-8 text-gray-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Órdenes de Producción</h1>
                  <p className="text-gray-600">Gestiona y monitorea las órdenes de producción</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleImport}
                  className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <ArrowUpTrayIcon className="h-4 w-4" />
                  Importar
                </button>
                <button
                  onClick={handleExport}
                  className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  Exportar
                </button>
                <button
                  onClick={fetchOrders}
                  className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  Actualizar
                </button>
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  Nueva Orden
                </button>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <CubeIcon className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">En Progreso</p>
              <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            </div>
            <BuildingOfficeIcon className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Completadas</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CalendarIcon className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Retrasadas</p>
              <p className="text-2xl font-bold text-red-600">{stats.delayed}</p>
            </div>
            <ExclamationTriangleIcon className="h-8 w-8 text-red-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Eficiencia</p>
              <p className="text-2xl font-bold text-purple-600">{stats.efficiency}%</p>
            </div>
            <ArrowTrendingUpIcon className="h-8 w-8 text-purple-400" />
          </div>
        </div>
          </div>

          {/* Filtros */}
          <ProductionOrdersFilters
            filters={filters}
            onFilterChange={setFilters}
          />

          {/* Lista de órdenes */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <ArrowPathIcon className="h-8 w-8 text-gray-400 animate-spin" />
            </div>
          ) : (
            <ProductionOrdersList
              orders={filteredOrders}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
              onRegisterConsumption={handleRegisterConsumption}
              onRegisterOutput={handleRegisterOutput}
            />
          )}

          {/* Modal de creación/edición */}
          {isModalOpen && (
            <ProductionOrderModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSubmit={handleSave}
              order={selectedOrder}
              mode={modalMode}
            />
          )}

          {/* Modal de consumo de materiales */}
          {isConsumptionModalOpen && selectedOrderForAction && (
            <MaterialConsumptionModal
              isOpen={isConsumptionModalOpen}
              onClose={() => {
                setIsConsumptionModalOpen(false);
                setSelectedOrderForAction(null);
              }}
              order={selectedOrderForAction}
              onSave={handleSaveConsumption}
            />
          )}

          {/* Modal de registro de producción */}
          {isOutputModalOpen && selectedOrderForAction && (
            <ProductionOutputModal
              isOpen={isOutputModalOpen}
              onClose={() => {
                setIsOutputModalOpen(false);
                setSelectedOrderForAction(null);
              }}
              order={selectedOrderForAction}
              onSave={handleSaveOutput}
            />
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}