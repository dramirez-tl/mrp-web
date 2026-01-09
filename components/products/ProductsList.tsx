import React from 'react';
import { Product, ProductType, ProductStatus } from '@/lib/types/products';
import {
  PencilIcon,
  TrashIcon,
  CubeIcon,
  BeakerIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline';

interface ProductsListProps {
  products: Product[];
  loading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
}

const ProductsList: React.FC<ProductsListProps> = ({
  products,
  loading,
  onEdit,
  onDelete,
  pagination,
  onPageChange,
}) => {
  const getTypeIcon = (type: ProductType) => {
    switch (type) {
      case ProductType.PT:
        return <CubeIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case ProductType.MP:
        return <BeakerIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
      case ProductType.ME:
        return <ArchiveBoxIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />;
    }
  };

  const getTypeLabel = (type: ProductType) => {
    switch (type) {
      case ProductType.PT:
        return 'Producto Terminado';
      case ProductType.MP:
        return 'Materia Prima';
      case ProductType.ME:
        return 'Material de Empaque';
    }
  };

  const getStatusBadge = (status: ProductStatus) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      INACTIVE: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      DISCONTINUED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };

    const labels = {
      ACTIVE: 'Activo',
      INACTIVE: 'Inactivo',
      DISCONTINUED: 'Descontinuado',
    };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colors[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 transition-colors">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 transition-colors">
        <div className="text-center py-12">
          <CubeIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay productos</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Comience creando un nuevo producto.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 overflow-hidden transition-colors">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Código
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Stock Min/Max
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Costo Std
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {product.code}
                  </div>
                  {product.barcode && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">{product.barcode}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {getTypeIcon(product.type)}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </div>
                      {product.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                          {product.description}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-200">
                    {getTypeLabel(product.type)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {(product.product_categories || product.category) ? (
                    <div className="flex items-center gap-2">
                      {(product.product_categories?.icon || product.category?.icon) && (
                        <span className="text-lg">
                          {product.product_categories?.icon || product.category?.icon}
                        </span>
                      )}
                      <span
                        className="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                        style={{
                          backgroundColor: `${product.product_categories?.color || product.category?.color}20`,
                          color: product.product_categories?.color || product.category?.color,
                        }}
                      >
                        {product.product_categories?.name || product.category?.name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-200">
                    {product.min_stock || 0} / {product.max_stock || 0}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {product.unit_measure}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-200">
                    {formatCurrency(product.standard_cost)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(product.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onEdit(product)}
                    className="text-[#1e3a6f] dark:text-blue-400 hover:text-[#2c4a8f] dark:hover:text-blue-300 mr-3 transition-colors"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onDelete(product)}
                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
          >
            Anterior
          </button>
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
          >
            Siguiente
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Mostrando{' '}
              <span className="font-medium">
                {(pagination.page - 1) * pagination.limit + 1}
              </span>{' '}
              a{' '}
              <span className="font-medium">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{' '}
              de <span className="font-medium">{pagination.total}</span> resultados
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
              >
                Anterior
              </button>
              {[...Array(pagination.totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => onPageChange(i + 1)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                    pagination.page === i + 1
                      ? 'z-10 bg-[#7cb342] border-[#7cb342] text-white'
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
              >
                Siguiente
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsList;
