'use client';

import React from 'react';
import { ProductionOrderStatus, ProductionOrderPriority } from '@/lib/types/production-orders';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon, CalendarIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ProductionOrdersFiltersProps {
  filters: {
    search: string;
    status: ProductionOrderStatus | '';
    priority: ProductionOrderPriority | '';
    work_center: string;
    start_from: string;
    start_to: string;
  };
  onFilterChange: (filters: any) => void;
}

export default function ProductionOrdersFilters({ filters, onFilterChange }: ProductionOrdersFiltersProps) {
  const handleChange = (field: string, value: any) => {
    onFilterChange({ ...filters, [field]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      status: '',
      priority: '',
      work_center: '',
      start_from: '',
      start_to: ''
    });
  };

  const hasActiveFilters = filters.search || filters.status || filters.priority ||
                          filters.work_center || filters.start_from || filters.start_to;

  const getStatusLabel = (status: ProductionOrderStatus) => {
    const labels: Record<ProductionOrderStatus, string> = {
      [ProductionOrderStatus.PLANNED]: 'Planeada',
      [ProductionOrderStatus.RELEASED]: 'Liberada',
      [ProductionOrderStatus.IN_PROGRESS]: 'En Progreso',
      [ProductionOrderStatus.COMPLETED]: 'Completada',
      [ProductionOrderStatus.CLOSED]: 'Cerrada',
      [ProductionOrderStatus.CANCELLED]: 'Cancelada'
    };
    return labels[status];
  };

  const getPriorityLabel = (priority: ProductionOrderPriority) => {
    const labels = {
      [ProductionOrderPriority.LOW]: 'Baja',
      [ProductionOrderPriority.MEDIUM]: 'Media',
      [ProductionOrderPriority.HIGH]: 'Alta',
      [ProductionOrderPriority.URGENT]: 'Urgente'
    };
    return labels[priority];
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FunnelIcon className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-800">Filtros</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <XMarkIcon className="h-4 w-4" />
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Búsqueda */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buscar
          </label>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleChange('search', e.target.value)}
              placeholder="Código, descripción..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos</option>
            {Object.values(ProductionOrderStatus).map(status => (
              <option key={status} value={status}>
                {getStatusLabel(status)}
              </option>
            ))}
          </select>
        </div>

        {/* Prioridad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prioridad
          </label>
          <div className="relative">
            <ExclamationTriangleIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={filters.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas</option>
              {Object.values(ProductionOrderPriority).map(priority => (
                <option key={priority} value={priority}>
                  {getPriorityLabel(priority)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Centro de Trabajo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Centro de Trabajo
          </label>
          <input
            type="text"
            value={filters.work_center}
            onChange={(e) => handleChange('work_center', e.target.value)}
            placeholder="Centro..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Fecha Desde */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Desde
          </label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={filters.start_from}
              onChange={(e) => handleChange('start_from', e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Fecha Hasta */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Hasta
          </label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={filters.start_to}
              onChange={(e) => handleChange('start_to', e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}