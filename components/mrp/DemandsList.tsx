'use client';

import React from 'react';
import { MrpDemand, DemandStatus, DemandPriority } from '@/lib/types/mrp';
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CalendarIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface DemandsListProps {
  demands: MrpDemand[];
  onEdit: (demand: MrpDemand) => void;
  onDelete: (demand: MrpDemand) => void;
  onView: (demand: MrpDemand) => void;
}

export default function DemandsList({
  demands,
  onEdit,
  onDelete,
  onView
}: DemandsListProps) {

  const getStatusBadge = (status: DemandStatus) => {
    const statusConfig = {
      [DemandStatus.ACTIVE]: {
        label: 'Activa',
        icon: CheckCircleIcon,
        className: 'bg-green-100 text-green-600'
      },
      [DemandStatus.INACTIVE]: {
        label: 'Inactiva',
        icon: ClockIcon,
        className: 'bg-gray-100 text-gray-600'
      },
      [DemandStatus.COMPLETED]: {
        label: 'Completada',
        icon: CheckCircleIcon,
        className: 'bg-blue-100 text-blue-600'
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

  const getPriorityBadge = (priority: DemandPriority) => {
    const priorityConfig = {
      [DemandPriority.LOW]: {
        label: 'Baja',
        className: 'bg-gray-100 text-gray-600'
      },
      [DemandPriority.MEDIUM]: {
        label: 'Media',
        className: 'bg-blue-100 text-blue-600'
      },
      [DemandPriority.HIGH]: {
        label: 'Alta',
        className: 'bg-orange-100 text-orange-600'
      },
      [DemandPriority.URGENT]: {
        label: 'Urgente',
        className: 'bg-red-100 text-red-600'
      }
    };

    const config = priorityConfig[priority];

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {priority === DemandPriority.URGENT && <ExclamationTriangleIcon className="h-3 w-3" />}
        {config.label}
      </span>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const calculateTotalItems = (demand: MrpDemand) => {
    return demand.items?.length || 0;
  };

  const calculateTotalQuantity = (demand: MrpDemand) => {
    return demand.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  };

  const getHighestPriority = (demand: MrpDemand) => {
    if (!demand.items || demand.items.length === 0) return DemandPriority.LOW;

    const priorities = [DemandPriority.URGENT, DemandPriority.HIGH, DemandPriority.MEDIUM, DemandPriority.LOW];

    for (const priority of priorities) {
      if (demand.items.some(item => item.priority === priority)) {
        return priority;
      }
    }

    return DemandPriority.LOW;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Demanda
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Período
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prioridad
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {demands.map((demand) => (
              <tr key={demand.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <DocumentTextIcon className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{demand.code}</div>
                      <div className="text-xs text-gray-500">ID: {demand.id.substring(0, 8)}...</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {demand.description}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3 text-gray-400" />
                      {formatDate(demand.start_date)}
                    </div>
                    <div className="text-xs text-gray-500">
                      hasta {formatDate(demand.end_date)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <CubeIcon className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {calculateTotalItems(demand)} productos
                      </div>
                      <div className="text-xs text-gray-500">
                        {calculateTotalQuantity(demand).toLocaleString()} unidades
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(demand.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getPriorityBadge(getHighestPriority(demand))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onView(demand)}
                      className="text-gray-400 hover:text-gray-600"
                      title="Ver detalles"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    {demand.status === DemandStatus.ACTIVE && (
                      <>
                        <button
                          onClick={() => onEdit(demand)}
                          className="text-blue-400 hover:text-blue-600"
                          title="Editar"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDelete(demand)}
                          className="text-red-400 hover:text-red-600"
                          title="Eliminar"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {demands.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No se encontraron demandas MRP
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}