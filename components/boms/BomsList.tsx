'use client';

import React from 'react';
import { Bom, BomStatus } from '@/lib/types/boms';
import { PencilIcon, EyeIcon, DocumentDuplicateIcon, TrashIcon, CubeIcon, CheckCircleIcon, XCircleIcon, DocumentTextIcon, ArrowPathIcon, CalculatorIcon } from '@heroicons/react/24/outline';

interface BomsListProps {
  boms: Bom[];
  onEdit: (bom: Bom) => void;
  onView: (bom: Bom) => void;
  onDelete: (bom: Bom) => void;
  onDuplicate: (bom: Bom) => void;
  onActivate: (bom: Bom) => void;
  onExplode: (bom: Bom) => void;
}

export default function BomsList({
  boms,
  onEdit,
  onView,
  onDelete,
  onDuplicate,
  onActivate,
  onExplode
}: BomsListProps) {
  const getStatusBadge = (status: BomStatus) => {
    const statusConfig = {
      [BomStatus.DRAFT]: {
        label: 'Borrador',
        icon: DocumentTextIcon,
        className: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
      },
      [BomStatus.PENDING_APPROVAL]: {
        label: 'Pendiente Aprobación',
        icon: ArrowPathIcon,
        className: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
      },
      [BomStatus.APPROVED]: {
        label: 'Aprobado',
        icon: CheckCircleIcon,
        className: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
      },
      [BomStatus.OBSOLETE]: {
        label: 'Obsoleto',
        icon: XCircleIcon,
        className: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
      }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  };

  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Código
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Versión
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Costo Total
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {boms.map((bom) => (
              <tr key={bom.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <CubeIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{bom.code}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">{bom.name}</div>
                  {bom.description && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">{bom.description}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {bom.product && (
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{bom.product.code}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{bom.product.name}</div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900 dark:text-gray-200">v{bom.version}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(bom.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900 dark:text-gray-200">{bom._count?.items || 0}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {formatCurrency(bom.total_cost)}
                  </div>
                  {bom.material_cost && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Mat: {formatCurrency(bom.material_cost)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onView(bom)}
                      className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                      title="Ver detalles"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>

                    {bom.status === BomStatus.DRAFT && (
                      <>
                        <button
                          onClick={() => onEdit(bom)}
                          className="text-blue-400 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          title="Editar"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onActivate(bom)}
                          className="text-green-400 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                          title="Activar"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => onExplode(bom)}
                      className="text-purple-400 hover:text-purple-600 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                      title="Explotar BOM"
                    >
                      <CalculatorIcon className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => onDuplicate(bom)}
                      className="text-indigo-400 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                      title="Duplicar"
                    >
                      <DocumentDuplicateIcon className="h-4 w-4" />
                    </button>

                    {bom.status !== BomStatus.APPROVED && (
                      <button
                        onClick={() => onDelete(bom)}
                        className="text-red-400 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                        title="Eliminar"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {boms.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  No se encontraron BOMs
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
