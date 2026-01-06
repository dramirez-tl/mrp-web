import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { ProductType, ProductStatus, ProductCategory } from '@/lib/types/products';
import productsService from '@/lib/services/products.service';

interface ProductsFiltersProps {
  filters: {
    search: string;
    type: string;
    status: string;
    category_id: string;
  };
  onFilterChange: (filters: any) => void;
}

const ProductsFilters: React.FC<ProductsFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  const [search, setSearch] = useState(filters.search);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== filters.search) {
        onFilterChange({ ...filters, search });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchCategories = async () => {
    try {
      const data = await productsService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const handleTypeChange = (type: string) => {
    onFilterChange({ ...filters, type });
  };

  const handleStatusChange = (status: string) => {
    onFilterChange({ ...filters, status });
  };

  const handleCategoryChange = (category_id: string) => {
    onFilterChange({ ...filters, category_id });
  };

  const clearFilters = () => {
    setSearch('');
    onFilterChange({
      search: '',
      type: '',
      status: '',
      category_id: '',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      {/* Search and Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#7cb342] focus:border-[#7cb342]"
              placeholder="Buscar por código, nombre o descripción..."
            />
          </div>
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="ml-4 flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <FunnelIcon className="h-5 w-5 mr-2" />
          Filtros {showAdvanced ? 'Ocultar' : 'Avanzados'}
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#7cb342] focus:border-[#7cb342]"
            >
              <option value="">Todos</option>
              <option value={ProductType.PT}>Producto Terminado</option>
              <option value={ProductType.MP}>Materia Prima</option>
              <option value={ProductType.ME}>Material de Empaque</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              value={filters.category_id}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#7cb342] focus:border-[#7cb342]"
            >
              <option value="">Todas</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#7cb342] focus:border-[#7cb342]"
            >
              <option value="">Todos</option>
              <option value={ProductStatus.ACTIVE}>Activo</option>
              <option value={ProductStatus.INACTIVE}>Inactivo</option>
              <option value={ProductStatus.DISCONTINUED}>Descontinuado</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsFilters;