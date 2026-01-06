'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/lib/types';
import api from '@/lib/api';
import {
  InventoryCurrent,
  InventoryMovement,
  StockStatus,
  MovementType,
  CreateMovementDto
} from '@/lib/types/inventory';
import { Product } from '@/lib/types/products';
import {
  CubeIcon,
  ExclamationTriangleIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  ArrowPathIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  ArrowsRightLeftIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import InventoryTable from '@/components/inventory/InventoryTable';
import MovementModal from '@/components/inventory/MovementModal';
import AdjustmentModal from '@/components/inventory/AdjustmentModal';
import KardexModal from '@/components/inventory/KardexModal';

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<'current' | 'movements' | 'low-stock' | 'valuation'>('current');
  const [inventory, setInventory] = useState<InventoryCurrent[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [isKardexModalOpen, setIsKardexModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryCurrent | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showZeroStock, setShowZeroStock] = useState(false);

  // Estadísticas
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    lowStockItems: 0,
    criticalItems: 0,
    overstockItems: 0,
    totalMovements: 0
  });

  useEffect(() => {
    fetchInventory();
    fetchProducts();
    fetchRecentMovements();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [inventory]);

  const fetchInventory = async () => {
    try {
      const params: any = {};
      if (showZeroStock) params.include_zero = 'true';

      const response = await api.get('/inventory/current', { params });
      setInventory(response.data || []);
    } catch (error: any) {
      // Solo mostrar error informativo si es 404 (módulo no implementado)
      if (error.response?.status === 404) {
        console.info('ℹ️ Módulo de Inventario Actual aún no implementado en el backend');
      } else {
        console.error('Error fetching inventory:', error);
        toast.error('Error al cargar inventario');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentMovements = async () => {
    try {
      const response = await api.get('/inventory/movements', { params: { limit: 10 } });
      setMovements(response.data.data || response.data || []);
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.info('ℹ️ Módulo de Movimientos de Inventario aún no implementado en el backend');
      } else {
        console.error('Error fetching movements:', error);
      }
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data.data || response.data || []);
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.info('ℹ️ No se encontraron productos');
      } else {
        console.error('Error fetching products:', error);
      }
    }
  };

  const fetchLowStock = async () => {
    try {
      const response = await api.get('/inventory/low-stock');
      setInventory(response.data || []);
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.info('ℹ️ Módulo de Stock Bajo aún no implementado en el backend');
      } else {
        console.error('Error fetching low stock:', error);
        toast.error('Error al cargar items con stock bajo');
      }
    }
  };

  const fetchValuation = async () => {
    try {
      const response = await api.get('/inventory/valuation');
      // Process valuation data
      console.log('Valuation:', response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.info('ℹ️ Módulo de Valorización aún no implementado en el backend');
      } else {
        console.error('Error fetching valuation:', error);
        toast.error('Error al cargar valorización');
      }
    }
  };

  const calculateStats = () => {
    const totalProducts = new Set(inventory.map(item => item.product_id)).size;
    const totalValue = inventory.reduce((sum, item) =>
      sum + (item.quantity_on_hand * 0), 0
    );
    const lowStockItems = inventory.filter(item =>
      item.stock_status === StockStatus.LOW
    ).length;
    const criticalItems = inventory.filter(item =>
      item.stock_status === StockStatus.CRITICAL || item.stock_status === StockStatus.OUT_OF_STOCK
    ).length;
    const overstockItems = inventory.filter(item =>
      item.stock_status === StockStatus.OVERSTOCK
    ).length;

    setStats({
      totalProducts,
      totalValue,
      lowStockItems,
      criticalItems,
      overstockItems,
      totalMovements: movements.length
    });
  };

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);

    if (tab === 'low-stock') {
      fetchLowStock();
    } else if (tab === 'valuation') {
      fetchValuation();
    } else if (tab === 'current') {
      fetchInventory();
    }
  };

  const handleCreateMovement = () => {
    setIsMovementModalOpen(true);
  };

  const handleCreateAdjustment = () => {
    setIsAdjustmentModalOpen(true);
  };

  const handleView = (item: InventoryCurrent) => {
    // Find product from item
    const product: Product = item.products as any;
    setSelectedProduct(product);
    setIsKardexModalOpen(true);
  };

  const handleAdjust = (item: InventoryCurrent) => {
    setSelectedItem(item);
    setIsAdjustmentModalOpen(true);
  };

  const handleMovement = (item: InventoryCurrent) => {
    setSelectedItem(item);
    setIsMovementModalOpen(true);
  };

  const handleViewKardex = (product: Product) => {
    setSelectedProduct(product);
    setIsKardexModalOpen(true);
  };

  const handleSaveMovement = async () => {
    setIsMovementModalOpen(false);
    fetchInventory();
    fetchRecentMovements();
  };

  const filteredInventory = inventory.filter(item => {
    if (!searchTerm) return true;

    const search = searchTerm.toLowerCase();
    return (
      item.products?.code?.toLowerCase().includes(search) ||
      item.products?.name?.toLowerCase().includes(search) ||
      item.inventory_locations?.name?.toLowerCase().includes(search)
    );
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const getStockStatusColor = (status: StockStatus) => {
    switch (status) {
      case StockStatus.OUT_OF_STOCK:
        return 'text-red-600';
      case StockStatus.CRITICAL:
        return 'text-orange-600';
      case StockStatus.LOW:
        return 'text-yellow-600';
      case StockStatus.NORMAL:
        return 'text-green-600';
      case StockStatus.OVERSTOCK:
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <ProtectedRoute requiredRoles={[UserRole.SUPER_ADMIN, UserRole.GERENTE_PRODUCCION, UserRole.ALMACENISTA, UserRole.PLANEADOR, UserRole.SUPERVISOR]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BuildingOfficeIcon className="h-8 w-8 text-gray-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Control de Inventario</h1>
                  <p className="text-gray-600">Gestiona el stock y movimientos de productos</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCreateMovement}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <ArrowsRightLeftIcon className="h-4 w-4" />
                  Nuevo Movimiento
                </button>
                <button
                  onClick={handleCreateAdjustment}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  Ajuste de Inventario
                </button>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Productos</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalProducts}</p>
            </div>
            <CubeIcon className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Valor Total</p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(stats.totalValue)}
              </p>
            </div>
            <CurrencyDollarIcon className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Stock Bajo</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.lowStockItems}</p>
            </div>
            <ArrowTrendingDownIcon className="h-8 w-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Críticos</p>
              <p className="text-2xl font-bold text-red-600">{stats.criticalItems}</p>
            </div>
            <ExclamationTriangleIcon className="h-8 w-8 text-red-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Sobrestock</p>
              <p className="text-2xl font-bold text-blue-600">{stats.overstockItems}</p>
            </div>
            <ArrowTrendingUpIcon className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Movimientos Hoy</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalMovements}</p>
            </div>
            <ClockIcon className="h-8 w-8 text-purple-400" />
          </div>
        </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange('current')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'current'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Inventario Actual
          </button>
          <button
            onClick={() => handleTabChange('movements')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'movements'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Movimientos Recientes
          </button>
          <button
            onClick={() => handleTabChange('low-stock')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'low-stock'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Stock Bajo
          </button>
          <button
            onClick={() => handleTabChange('valuation')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'valuation'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Valorización
          </button>
        </nav>
          </div>

          {/* Search and Filters */}
          {activeTab === 'current' && (
            <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar producto o ubicación..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-80"
              />
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showZeroStock}
                onChange={(e) => {
                  setShowZeroStock(e.target.checked);
                  fetchInventory();
                }}
                className="rounded text-blue-600"
              />
              <span className="text-sm text-gray-600">Mostrar stock cero</span>
            </label>
          </div>
          <button
            onClick={fetchInventory}
            className="px-3 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Actualizar
              </button>
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <ArrowPathIcon className="h-8 w-8 text-gray-400 animate-spin" />
            </div>
          ) : (
            <>
              {activeTab === 'current' && (
                <InventoryTable
                  inventory={filteredInventory}
                  onView={handleView}
                  onAdjust={handleAdjust}
                  onMovement={handleMovement}
                />
              )}

              {activeTab === 'movements' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Fecha
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Tipo
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Producto
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Cantidad
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Origen
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Destino
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Usuario
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {movements.map((movement) => (
                          <tr key={movement.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(movement.movement_date).toLocaleDateString('es-MX')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                {movement.movement_type}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {movement.products?.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {movement.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {movement.from_location?.name || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {movement.to_location?.name || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {movement.user?.first_name} {movement.user?.last_name}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Modals */}
          {isMovementModalOpen && (
            <MovementModal
              isOpen={isMovementModalOpen}
              onClose={() => setIsMovementModalOpen(false)}
              onSave={handleSaveMovement}
            />
          )}

          {isAdjustmentModalOpen && (
            <AdjustmentModal
              isOpen={isAdjustmentModalOpen}
              onClose={() => setIsAdjustmentModalOpen(false)}
              onSave={() => {
                fetchInventory();
                fetchRecentMovements();
              }}
            />
          )}

          {isKardexModalOpen && selectedProduct && (
            <KardexModal
              isOpen={isKardexModalOpen}
              onClose={() => {
                setIsKardexModalOpen(false);
                setSelectedProduct(null);
              }}
              productId={selectedProduct.id}
              productCode={selectedProduct.code}
              productName={selectedProduct.name}
            />
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}