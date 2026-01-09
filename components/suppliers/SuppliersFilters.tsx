import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { SupplierStatus } from '@/lib/types/suppliers';

interface SuppliersFiltersProps {
  filters: {
    search: string;
    type: string;
    status: string;
    city: string;
    state: string;
    country: string;
  };
  onFilterChange: (filters: any) => void;
}

const SuppliersFilters: React.FC<SuppliersFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  const [search, setSearch] = useState(filters.search);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== filters.search) {
        onFilterChange({ ...filters, search });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleTypeChange = (type: string) => {
    onFilterChange({ ...filters, type });
  };

  const handleStatusChange = (status: string) => {
    onFilterChange({ ...filters, status });
  };

  const handleLocationChange = (field: string, value: string) => {
    onFilterChange({ ...filters, [field]: value });
  };

  const clearFilters = () => {
    setSearch('');
    onFilterChange({
      search: '',
      type: '',
      status: '',
      city: '',
      state: '',
      country: '',
    });
  };

  const activeFiltersCount = () => {
    let count = 0;
    if (filters.type) count++;
    if (filters.status) count++;
    if (filters.city) count++;
    if (filters.state) count++;
    if (filters.country) count++;
    return count;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 space-y-4 transition-colors">
      {/* Search and Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-500 focus:ring-1 focus:ring-[#7cb342] focus:border-[#7cb342] dark:focus:ring-[#7cb342] dark:focus:border-[#7cb342] transition-colors"
              placeholder="Buscar por código, nombre, RFC o nombre comercial..."
            />
          </div>
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="ml-4 flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          <FunnelIcon className="h-5 w-5 mr-2" />
          Filtros {showAdvanced ? 'Ocultar' : 'Avanzados'}
          {activeFiltersCount() > 0 && (
            <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-[#7cb342] rounded-full">
              {activeFiltersCount()}
            </span>
          )}
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Estado
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-[#7cb342] focus:border-[#7cb342] dark:focus:ring-[#7cb342] dark:focus:border-[#7cb342] text-sm transition-colors"
              >
                <option value="">Todos</option>
                <option value={SupplierStatus.ACTIVE}>Activo</option>
                <option value={SupplierStatus.INACTIVE}>Inactivo</option>
                <option value={SupplierStatus.SUSPENDED}>Suspendido</option>
                <option value={SupplierStatus.BLACKLISTED}>Lista Negra</option>
              </select>
            </div>

            {/* City Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Ciudad
              </label>
              <input
                type="text"
                value={filters.city}
                onChange={(e) => handleLocationChange('city', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-[#7cb342] focus:border-[#7cb342] dark:focus:ring-[#7cb342] dark:focus:border-[#7cb342] text-sm transition-colors"
                placeholder="Filtrar por ciudad"
              />
            </div>

            {/* State Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Estado/Provincia
              </label>
              <input
                type="text"
                value={filters.state}
                onChange={(e) => handleLocationChange('state', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-[#7cb342] focus:border-[#7cb342] dark:focus:ring-[#7cb342] dark:focus:border-[#7cb342] text-sm transition-colors"
                placeholder="Filtrar por estado"
              />
            </div>

            {/* Country Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                País
              </label>
              <input
                type="text"
                value={filters.country}
                onChange={(e) => handleLocationChange('country', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-[#7cb342] focus:border-[#7cb342] dark:focus:ring-[#7cb342] dark:focus:border-[#7cb342] text-sm transition-colors"
                placeholder="Filtrar por país"
              />
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuppliersFilters;
