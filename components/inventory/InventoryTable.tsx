'use client';

import React from 'react';
import { InventoryCurrent } from '@/lib/types/inventory';
import { Badge } from '@/components/ui/badge';

interface InventoryTableProps {
  inventory: InventoryCurrent[];
  onView: (item: InventoryCurrent) => void;
  onAdjust: (item: InventoryCurrent) => void;
  onMovement: (item: InventoryCurrent) => void;
}

export default function InventoryTable({
  inventory,
  onView,
  onAdjust,
  onMovement,
}: InventoryTableProps) {
  const getStockStatusBadge = (status: string) => {
    const statusConfig = {
      OUT_OF_STOCK: { label: 'Sin Stock', className: 'bg-gray-500 text-white' },
      CRITICAL: { label: 'Crítico', className: 'bg-red-500 text-white' },
      LOW: { label: 'Bajo', className: 'bg-yellow-500 text-white' },
      NORMAL: { label: 'Normal', className: 'bg-green-500 text-white' },
      OVERSTOCK: { label: 'Exceso', className: 'bg-purple-500 text-white' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] ||
                   statusConfig.NORMAL;

    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getLocationTypeBadge = (type: string) => {
    const typeConfig = {
      WAREHOUSE: { label: 'Almacén', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
      PRODUCTION: { label: 'Producción', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
      QUARANTINE: { label: 'Cuarentena', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
      TRANSIT: { label: 'Tránsito', className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
    };

    const config = typeConfig[type as keyof typeof typeConfig] ||
                   { label: type, className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' };

    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
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

  if (inventory.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No se encontraron registros de inventario</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors">
        <thead className="bg-gray-50 dark:bg-gray-700/50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Producto
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Ubicación
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              En Mano
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Reservado
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Disponible
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Unidad
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Lote
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Vencimiento
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Último Mov.
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {inventory.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.products.code}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {item.products.name}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    Min: {formatNumber(item.products.min_stock)} |
                    Max: {formatNumber(item.products.max_stock)} |
                    Reorden: {formatNumber(item.products.reorder_point)}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm text-gray-900 dark:text-white">
                    {item.inventory_locations.code}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {item.inventory_locations.name}
                  </div>
                  <div className="mt-1">
                    {getLocationTypeBadge(item.inventory_locations.type)}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatNumber(item.quantity_on_hand)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {formatNumber(item.quantity_reserved)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {formatNumber(item.available_quantity)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  {item.products.unit_measure}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                {getStockStatusBadge(item.stock_status)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {item.batch_number || '-'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                {item.expiration_date ? (
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {new Date(item.expiration_date).toLocaleDateString('es-MX')}
                  </span>
                ) : (
                  <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(item.last_movement_date)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => onView(item)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                    title="Ver Kardex"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onMovement(item)}
                    className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors"
                    title="Registrar Movimiento"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onAdjust(item)}
                    className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300 transition-colors"
                    title="Ajustar Inventario"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
