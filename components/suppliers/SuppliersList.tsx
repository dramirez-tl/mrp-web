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
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      SUSPENDED: 'bg-yellow-100 text-yellow-800',
      BLACKLISTED: 'bg-red-100 text-red-800',
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

  if (suppliers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <BuildingOffice2Icon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay proveedores</h3>
          <p className="mt-1 text-sm text-gray-500">
            Comience agregando un nuevo proveedor.
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
                Proveedor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                RFC
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ubicación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Crédito
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
            {suppliers.map((supplier) => (
              <tr key={supplier.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {supplier.code}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <BuildingOffice2Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {supplier.name}
                      </div>
                      {supplier.legal_name && (
                        <div className="text-xs text-gray-500">
                          {supplier.legal_name}
                        </div>
                      )}
                      {supplier._count?.supplier_products && supplier._count.supplier_products > 0 && (
                        <div className="text-xs text-[#7cb342] font-medium">
                          {supplier._count.supplier_products} productos
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {supplier.rfc || '-'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {supplier.contact_name || '-'}
                  </div>
                  {supplier.contact_phone && (
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <PhoneIcon className="h-3 w-3 mr-1" />
                      {supplier.contact_phone}
                    </div>
                  )}
                  {supplier.contact_email && (
                    <div className="flex items-center text-xs text-gray-500">
                      <EnvelopeIcon className="h-3 w-3 mr-1" />
                      {supplier.contact_email}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {supplier.address_city && supplier.address_state
                      ? `${supplier.address_city}, ${supplier.address_state}`
                      : supplier.address_city || supplier.address_state || '-'}
                  </div>
                  {supplier.address_country && (
                    <div className="text-xs text-gray-500">
                      {supplier.address_country}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {supplier.payment_terms
                      ? suppliersService.getPaymentTermsLabel(supplier.payment_terms)
                      : '-'}
                  </div>
                  {supplier.credit_limit && (
                    <div className="text-xs text-gray-500 flex items-center">
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
                    className="text-[#7cb342] hover:text-[#689f38] mr-3"
                    title="Ver productos"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onEdit(supplier)}
                    className="text-[#1e3a6f] hover:text-[#2c4a8f] mr-3"
                    title="Editar"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onDelete(supplier)}
                    className="text-red-600 hover:text-red-900"
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
              {pagination.totalPages <= 7 ? (
                [...Array(pagination.totalPages)].map((_, i) => (
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
                ))
              ) : (
                <>
                  {pagination.page > 3 && (
                    <>
                      <button
                        onClick={() => onPageChange(1)}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        1
                      </button>
                      {pagination.page > 4 && (
                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
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
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pagination.page === pageNum
                              ? 'z-10 bg-[#7cb342] border-[#7cb342] text-white'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
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
                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                          ...
                        </span>
                      )}
                      <button
                        onClick={() => onPageChange(pagination.totalPages)}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
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

export default SuppliersList;