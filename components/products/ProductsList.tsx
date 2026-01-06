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
        return <CubeIcon className="h-5 w-5 text-blue-600" />;
      case ProductType.MP:
        return <BeakerIcon className="h-5 w-5 text-purple-600" />;
      case ProductType.ME:
        return <ArchiveBoxIcon className="h-5 w-5 text-orange-600" />;
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
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      DISCONTINUED: 'bg-red-100 text-red-800',
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
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay productos</h3>
          <p className="mt-1 text-sm text-gray-500">
            Comience creando un nuevo producto.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock Min/Max
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Costo Std
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {product.code}
                  </div>
                  {product.barcode && (
                    <div className="text-xs text-gray-500">{product.barcode}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {getTypeIcon(product.type)}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                      {product.description && (
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {product.description}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
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
                    <span className="text-sm text-gray-500">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {product.min_stock || 0} / {product.max_stock || 0}
                  </div>
                  <div className="text-xs text-gray-500">
                    {product.unit_measure}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatCurrency(product.standard_cost)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(product.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onEdit(product)}
                    className="text-[#1e3a6f] hover:text-[#2c4a8f] mr-3"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onDelete(product)}
                    className="text-red-600 hover:text-red-900"
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
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
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
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Anterior
              </button>
              {[...Array(pagination.totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => onPageChange(i + 1)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    pagination.page === i + 1
                      ? 'z-10 bg-[#7cb342] border-[#7cb342] text-white'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
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