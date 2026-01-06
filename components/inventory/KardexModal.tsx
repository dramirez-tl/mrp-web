'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon, ArrowDownTrayIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { InventoryMovement, MovementType } from '@/lib/types/inventory';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';

interface KardexModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productCode?: string;
  productName?: string;
  locationId?: string;
}

export default function KardexModal({
  isOpen,
  onClose,
  productId,
  productCode,
  productName,
  locationId,
}: KardexModalProps) {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    movement_type: '',
    start_date: '',
    end_date: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    if (isOpen && productId) {
      fetchMovements();
    }
  }, [isOpen, productId, locationId, filters, pagination.page]);

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        product_id: productId,
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (locationId) params.append('location_id', locationId);
      if (filters.movement_type) params.append('movement_type', filters.movement_type);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);

      const response = await api.get(`/inventory/movements?${params}`);
      setMovements(response.data.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.meta.total,
        totalPages: response.data.meta.totalPages,
      }));
    } catch (error) {
      console.error('Error fetching movements:', error);
      setMovements([]);
    } finally {
      setLoading(false);
    }
  };

  const movementTypeConfig: Record<MovementType, { label: string; color: string; icon: string }> = {
    [MovementType.ENTRY]: { label: 'Entrada', color: 'bg-green-100 text-green-800', icon: '↓' },
    [MovementType.EXIT]: { label: 'Salida', color: 'bg-red-100 text-red-800', icon: '↑' },
    [MovementType.TRANSFER]: { label: 'Transferencia', color: 'bg-blue-100 text-blue-800', icon: '↔' },
    [MovementType.ADJUSTMENT]: { label: 'Ajuste', color: 'bg-yellow-100 text-yellow-800', icon: '±' },
    [MovementType.PRODUCTION_ENTRY]: { label: 'Entrada Prod.', color: 'bg-purple-100 text-purple-800', icon: '⚙↓' },
    [MovementType.PRODUCTION_EXIT]: { label: 'Salida Prod.', color: 'bg-purple-100 text-purple-800', icon: '⚙↑' },
    [MovementType.PURCHASE_ENTRY]: { label: 'Compra', color: 'bg-indigo-100 text-indigo-800', icon: '🛒' },
    [MovementType.SALE_EXIT]: { label: 'Venta', color: 'bg-orange-100 text-orange-800', icon: '💰' },
    [MovementType.RETURN]: { label: 'Devolución', color: 'bg-gray-100 text-gray-800', icon: '↩' },
    [MovementType.WASTE]: { label: 'Desperdicio', color: 'bg-red-200 text-red-900', icon: '🗑' },
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on filter change
  };

  const clearFilters = () => {
    setFilters({
      movement_type: '',
      start_date: '',
      end_date: '',
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const exportToCSV = () => {
    // Create CSV content
    const headers = ['Fecha', 'Tipo', 'Cantidad', 'Desde', 'Hacia', 'Lote', 'Documento', 'Usuario', 'Notas'];
    const rows = movements.map(mov => [
      formatDate(mov.movement_date),
      movementTypeConfig[mov.movement_type].label,
      formatNumber(mov.quantity),
      mov.from_location?.name || '-',
      mov.to_location?.name || '-',
      mov.batch_number || '-',
      mov.reference_document || '-',
      mov.user ? `${mov.user.first_name} ${mov.user.last_name}` : '-',
      mov.notes || '-',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `kardex_${productCode || productId}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const calculateRunningBalance = (movements: InventoryMovement[]) => {
    let balance = 0;
    return movements.map(mov => {
      // Determine if movement adds or subtracts from inventory
      const isAddition = [
        MovementType.ENTRY,
        MovementType.PRODUCTION_ENTRY,
        MovementType.PURCHASE_ENTRY,
        MovementType.RETURN,
      ].includes(mov.movement_type) ||
      (mov.movement_type === MovementType.ADJUSTMENT && mov.to_location_id);

      const isSubtraction = [
        MovementType.EXIT,
        MovementType.PRODUCTION_EXIT,
        MovementType.SALE_EXIT,
        MovementType.WASTE,
      ].includes(mov.movement_type) ||
      (mov.movement_type === MovementType.ADJUSTMENT && mov.from_location_id);

      if (isAddition) {
        balance += mov.quantity;
      } else if (isSubtraction) {
        balance -= mov.quantity;
      }
      // TRANSFER doesn't affect total balance (moves between locations)

      return { ...mov, runningBalance: balance };
    }).reverse(); // Reverse to show newest first
  };

  const movementsWithBalance = calculateRunningBalance([...movements].reverse());

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold">Kardex - Historial de Movimientos</h2>
            {(productCode || productName) && (
              <p className="text-sm text-gray-600 mt-1">
                {productCode && <span className="font-medium">{productCode}</span>}
                {productCode && productName && ' - '}
                {productName}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
              title="Filtros"
            >
              <FunnelIcon className="h-5 w-5" />
            </button>
            <button
              onClick={exportToCSV}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
              title="Exportar CSV"
              disabled={movements.length === 0}
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Tipo de Movimiento
                </label>
                <select
                  name="movement_type"
                  value={filters.movement_type}
                  onChange={handleFilterChange}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                >
                  <option value="">Todos</option>
                  {Object.entries(movementTypeConfig).map(([type, config]) => (
                    <option key={type} value={type}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Fecha Desde
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={filters.start_date}
                  onChange={handleFilterChange}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Fecha Hasta
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={filters.end_date}
                  onChange={handleFilterChange}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Movement History Table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Cargando movimientos...</div>
            </div>
          ) : movements.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">No hay movimientos registrados</div>
            </div>
          ) : (
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    Tipo
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    Cantidad
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    Saldo
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Desde
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Hacia
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Lote
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Documento
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Usuario
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Notas
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {movementsWithBalance.map((movement: any, index) => {
                  const config = movementTypeConfig[movement.movement_type as MovementType];
                  const isAddition = [
                    MovementType.ENTRY,
                    MovementType.PRODUCTION_ENTRY,
                    MovementType.PURCHASE_ENTRY,
                    MovementType.RETURN,
                  ].includes(movement.movement_type) ||
                  (movement.movement_type === MovementType.ADJUSTMENT && movement.to_location_id);

                  const isSubtraction = [
                    MovementType.EXIT,
                    MovementType.PRODUCTION_EXIT,
                    MovementType.SALE_EXIT,
                    MovementType.WASTE,
                  ].includes(movement.movement_type) ||
                  (movement.movement_type === MovementType.ADJUSTMENT && movement.from_location_id);

                  return (
                    <tr key={movement.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(movement.movement_date)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-center">
                        <Badge className={config.color}>
                          <span className="mr-1">{config.icon}</span>
                          {config.label}
                        </Badge>
                      </td>
                      <td className={`px-4 py-2 whitespace-nowrap text-center text-sm font-medium ${
                        isAddition ? 'text-green-600' : isSubtraction ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {isAddition && '+'}
                        {isSubtraction && '-'}
                        {formatNumber(movement.quantity)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-center text-sm font-bold text-gray-900">
                        {formatNumber(movement.runningBalance || 0)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                        {movement.from_location ? (
                          <div>
                            <div className="font-medium">{movement.from_location.code}</div>
                            <div className="text-xs text-gray-500">{movement.from_location.name}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                        {movement.to_location ? (
                          <div>
                            <div className="font-medium">{movement.to_location.code}</div>
                            <div className="text-xs text-gray-500">{movement.to_location.name}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                        {movement.batch_number || <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                        {movement.reference_document || <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                        {movement.user ? (
                          <div>
                            <div className="font-medium">
                              {movement.user.first_name} {movement.user.last_name}
                            </div>
                            <div className="text-xs text-gray-500">{movement.user.email}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600 max-w-xs">
                        {movement.notes ? (
                          <div className="truncate" title={movement.notes}>
                            {movement.notes}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && movements.length > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
              {pagination.total} movimientos
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="px-3 py-1 text-sm">
                Página {pagination.page} de {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}