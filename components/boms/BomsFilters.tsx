'use client';

import React from 'react';
import { BomStatus } from '@/lib/types/boms';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface BomsFiltersProps {
  filters: {
    search: string;
    status: BomStatus | '';
    active_only: boolean;
  };
  onFilterChange: (filters: any) => void;
}

export default function BomsFilters({ filters, onFilterChange }: BomsFiltersProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, status: e.target.value });
  };

  const handleActiveOnlyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, active_only: e.target.checked });
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      status: '',
      active_only: false
    });
  };

  const hasActiveFilters = filters.search || filters.status || filters.active_only;

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buscar
          </label>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={handleSearchChange}
              placeholder="Código, nombre..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            value={filters.status}
            onChange={handleStatusChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos</option>
            <option value={BomStatus.DRAFT}>Borrador</option>
            <option value={BomStatus.PENDING_APPROVAL}>Pendiente Aprobación</option>
            <option value={BomStatus.APPROVED}>Aprobado</option>
            <option value={BomStatus.OBSOLETE}>Obsoleto</option>
          </select>
        </div>

        {/* Active Only */}
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.active_only}
              onChange={handleActiveOnlyChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              Solo BOMs aprobados
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}