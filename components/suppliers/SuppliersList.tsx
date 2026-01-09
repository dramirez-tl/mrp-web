import React from 'react';
import { Supplier, SupplierStatus } from '@/lib/types/suppliers';
import suppliersService from '@/lib/services/suppliers.service';
import {
  PencilIcon,
  TrashIcon,
  BuildingOffice2Icon,
  GlobeAltIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface SuppliersListProps {
  suppliers: Supplier[];
  loading: boolean;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
  onViewProducts: (supplier: Supplier) => void;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
}

const SuppliersList: React.FC<SuppliersListProps> = ({
  suppliers,
  loading,
  onEdit,
  onDelete,
  onViewProducts,
  pagination,
  onPageChange,
}) => {
  const getStatusBadge = (status: SupplierStatus) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      INACTIVE: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      SUSPENDED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      BLACKLISTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };

    const labels = {
      ACTIVE: 'Activo',
      INACTIVE: 'Inactivo',
      SUSPENDED: 'Suspendido',
      BLACKLISTED: 'Lista Negra',
    };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colors[status]}`}>
        {status === SupplierStatus.BLACKLISTED && (
          <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
        )}
        {labels[status]}
      </span>
    );
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

  if (suppliers.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 transition-colors">
        <div className="text-center py-12">
          <BuildingOffice2Icon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay proveedores</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Comience agregando un nuevo proveedor.
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
                Proveedor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                RFC
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Ubicación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Crédito
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
            {suppliers.map((supplier) => (
              <tr key={supplier.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {supplier.code}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <BuildingOffice2Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {supplier.name}
                      </div>
                      {supplier.legal_name && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {supplier.legal_name}
                        </div>
                      )}
                      {supplier._count?.supplier_products && supplier._count.supplier_products > 0 && (
                        <div className="text-xs text-[#7cb342] dark:text-green-400 font-medium">
                          {supplier._count.supplier_products} productos
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-200">
                    {supplier.rfc || '-'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 dark:text-gray-200">
                    {supplier.contact_name || '-'}
                  </div>
                  {supplier.contact_phone && (
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <PhoneIcon className="h-3 w-3 mr-1" />
                      {supplier.contact_phone}
                    </div>
                  )}
                  {supplier.contact_email && (
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <EnvelopeIcon className="h-3 w-3 mr-1" />
                      {supplier.contact_email}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 dark:text-gray-200">
                    {supplier.address_city && supplier.address_state
                      ? `${supplier.address_city}, ${supplier.address_state}`
                      : supplier.address_city || supplier.address_state || '-'}
                  </div>
                  {supplier.address_country && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {supplier.address_country}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-200">
                    {supplier.payment_terms
                      ? suppliersService.getPaymentTermsLabel(supplier.payment_terms)
                      : '-'}
                  </div>
                  {supplier.credit_limit && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                      <CreditCardIcon className="h-3 w-3 mr-1" />
                      {suppliersService.formatCurrency(supplier.credit_limit, supplier.currency || 'MXN')}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(supplier.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onViewProducts(supplier)}
                    className="text-[#7cb342] hover:text-[#689f38] dark:text-green-400 dark:hover:text-green-300 mr-3 transition-colors"
                    title="Ver productos"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onEdit(supplier)}
                    className="text-[#1e3a6f] dark:text-blue-400 hover:text-[#2c4a8f] dark:hover:text-blue-300 mr-3 transition-colors"
                    title="Editar"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onDelete(supplier)}
                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
                    title="Eliminar"
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
              {pagination.totalPages <= 7 ? (
                [...Array(pagination.totalPages)].map((_, i) => (
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
                ))
              ) : (
                <>
                  {pagination.page > 3 && (
                    <>
                      <button
                        onClick={() => onPageChange(1)}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      >
                        1
                      </button>
                      {pagination.page > 4 && (
                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200">
                          ...
                        </span>
                      )}
                    </>
                  )}
                  {[...Array(5)].map((_, idx) => {
                    const pageNum = pagination.page - 2 + idx;
                    if (pageNum > 0 && pageNum <= pagination.totalPages) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => onPageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                            pagination.page === pageNum
                              ? 'z-10 bg-[#7cb342] border-[#7cb342] text-white'
                              : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    return null;
                  })}
                  {pagination.page < pagination.totalPages - 2 && (
                    <>
                      {pagination.page < pagination.totalPages - 3 && (
                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200">
                          ...
                        </span>
                      )}
                      <button
                        onClick={() => onPageChange(pagination.totalPages)}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      >
                        {pagination.totalPages}
                      </button>
                    </>
                  )}
                </>
              )}
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

export default SuppliersList;
