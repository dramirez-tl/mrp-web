'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/lib/types';
import { PlusIcon, ShoppingCartIcon, ArrowTrendingUpIcon, CubeIcon, ClockIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import api from '@/lib/api';
import {
  PurchaseOrder,
  PurchaseOrderStatistics,
  PurchaseOrderStatus,
} from '@/lib/types/purchase-order';
import PurchaseOrdersList from '@/components/purchase-orders/PurchaseOrdersList';
import PurchaseOrderModal from '@/components/purchase-orders/PurchaseOrderModal';
import ReceiveItemsModal from '@/components/purchase-orders/ReceiveItemsModal';
import { toast } from 'sonner';
import { downloadPurchaseOrderPDF, printPurchaseOrder } from '@/lib/utils/pdf-generator';

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [statistics, setStatistics] = useState<PurchaseOrderStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    supplier_id: '',
    search: '',
  });

  useEffect(() => {
    fetchOrders();
    fetchStatistics();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filters.status) params.status = filters.status;
      if (filters.supplier_id) params.supplier_id = filters.supplier_id;

      const response = await api.get('/purchase-orders', { params });
      setOrders(response.data.data || response.data || []);
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.info('ℹ️ Módulo de Órdenes de Compra aún no implementado en el backend');
      } else {
        console.error('Error fetching purchase orders:', error);
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/purchase-orders/statistics');
      setStatistics(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.info('ℹ️ Módulo de Estadísticas de Órdenes de Compra aún no implementado en el backend');
      } else {
        console.error('Error fetching statistics:', error);
      }
    }
  };

  const handleCreateOrder = () => {
    setSelectedOrder(null);
    setIsCreateModalOpen(true);
  };

  const handleEditOrder = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setIsEditModalOpen(true);
  };

  const handleReceiveItems = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setIsReceiveModalOpen(true);
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('¿Está seguro de eliminar esta orden de compra?')) return;

    try {
      await api.delete(`/purchase-orders/${orderId}`);
      fetchOrders();
      fetchStatistics();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar la orden');
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: PurchaseOrderStatus) => {
    try {
      await api.patch(`/purchase-orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
      fetchStatistics();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar el estado');
    }
  };

  const handleDownloadPDF = async (order: PurchaseOrder) => {
    try {
      toast.info('Generando PDF de orden de compra...');
      downloadPurchaseOrderPDF(order);
      toast.success(`PDF generado: Orden_Compra_${order.order_number}.pdf`);
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      toast.error('Error al generar PDF');
    }
  };

  const handlePrint = (order: PurchaseOrder) => {
    try {
      toast.info('Abriendo vista de impresión...');
      printPurchaseOrder(order);
    } catch (error: any) {
      console.error('Error printing order:', error);
      toast.error('Error al imprimir');
    }
  };

  const handleSendEmail = (order: PurchaseOrder) => {
    // UI only - functionality to be implemented later
    toast.info('Funcionalidad de envío por email próximamente');
    console.log('Send email for order:', order.order_number);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 500);
    return () => clearTimeout(timer);
  }, [filters]);

  const filteredOrders = orders.filter(order => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        order.order_number.toLowerCase().includes(searchLower) ||
        order.suppliers.name.toLowerCase().includes(searchLower) ||
        order.suppliers.code.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value);
  };

  const getStatusColor = (status: PurchaseOrderStatus) => {
    const colors = {
      [PurchaseOrderStatus.DRAFT]: 'text-gray-600',
      [PurchaseOrderStatus.PENDING_APPROVAL]: 'text-yellow-600',
      [PurchaseOrderStatus.APPROVED]: 'text-blue-600',
      [PurchaseOrderStatus.SENT]: 'text-purple-600',
      [PurchaseOrderStatus.PARTIALLY_RECEIVED]: 'text-orange-600',
      [PurchaseOrderStatus.COMPLETED]: 'text-green-600',
      [PurchaseOrderStatus.CANCELLED]: 'text-red-600',
    };
    return colors[status] || 'text-gray-600';
  };

  return (
    <ProtectedRoute requiredRoles={[UserRole.SUPER_ADMIN, UserRole.GERENTE_PRODUCCION, UserRole.COMPRADOR]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Órdenes de Compra</h1>
            <p className="text-gray-600">Gestión de órdenes de compra y recepción de mercancía</p>
          </div>

          {/* Statistics Cards */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Orders */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Órdenes</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.total_orders}</p>
              </div>
              <ShoppingCartIcon className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          {/* Pending Value */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Pendiente</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(statistics.pending_value)}
                </p>
              </div>
              <ArrowTrendingUpIcon className="h-8 w-8 text-green-500" />
            </div>
          </div>

          {/* Active Orders */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Proceso</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(statistics.by_status.PENDING_APPROVAL || 0) +
                   (statistics.by_status.APPROVED || 0) +
                   (statistics.by_status.SENT || 0)}
                </p>
              </div>
              <ClockIcon className="h-8 w-8 text-yellow-500" />
            </div>
          </div>

          {/* Completed Orders */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completadas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics.by_status.COMPLETED || 0}
                </p>
              </div>
              <ExclamationCircleIcon className="h-8 w-8 text-green-500" />
            </div>
          </div>
            </div>
          )}

          {/* Filters and Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <input
              type="text"
              placeholder="Buscar por número o proveedor..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los estados</option>
              <option value={PurchaseOrderStatus.DRAFT}>Borrador</option>
              <option value={PurchaseOrderStatus.PENDING_APPROVAL}>Pendiente Aprobación</option>
              <option value={PurchaseOrderStatus.APPROVED}>Aprobada</option>
              <option value={PurchaseOrderStatus.SENT}>Enviada</option>
              <option value={PurchaseOrderStatus.PARTIALLY_RECEIVED}>Parcialmente Recibida</option>
              <option value={PurchaseOrderStatus.COMPLETED}>Completada</option>
              <option value={PurchaseOrderStatus.CANCELLED}>Cancelada</option>
            </select>
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreateOrder}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Nueva Orden
          </button>
            </div>
          </div>

          {/* Orders List */}
          <div className="bg-white rounded-lg shadow-md">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                Cargando órdenes de compra...
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No se encontraron órdenes de compra
              </div>
            ) : (
              <PurchaseOrdersList
                orders={filteredOrders}
                onEdit={handleEditOrder}
                onDelete={handleDeleteOrder}
                onStatusChange={handleStatusChange}
                onReceive={handleReceiveItems}
                onDownloadPDF={handleDownloadPDF}
                onPrint={handlePrint}
                onSendEmail={handleSendEmail}
              />
            )}
          </div>

          {/* Recent Orders Summary */}
          {statistics && statistics.recent_orders.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Órdenes Recientes</h3>
              <div className="space-y-2">
                {statistics.recent_orders.map((order) => (
                  <div key={order.id} className="flex justify-between items-center py-2 border-b">
                    <div className="flex items-center gap-4">
                      <span className="font-medium">{order.order_number}</span>
                      <span className="text-sm text-gray-600">{order.suppliers.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-sm font-medium ${getStatusColor(order.status as PurchaseOrderStatus)}`}>
                        {order.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('es-MX')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modals */}
          <PurchaseOrderModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSave={() => {
              setIsCreateModalOpen(false);
              fetchOrders();
              fetchStatistics();
            }}
            order={null}
          />

          <PurchaseOrderModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSave={() => {
              setIsEditModalOpen(false);
              fetchOrders();
              fetchStatistics();
            }}
            order={selectedOrder}
          />

          {selectedOrder && (
            <ReceiveItemsModal
              isOpen={isReceiveModalOpen}
              onClose={() => setIsReceiveModalOpen(false)}
              onSave={() => {
                setIsReceiveModalOpen(false);
                fetchOrders();
                fetchStatistics();
              }}
              order={selectedOrder}
            />
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}