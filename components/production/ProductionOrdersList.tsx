'use client';

import React from 'react';
import { ProductionOrder, ProductionOrderStatus, ProductionOrderPriority } from '@/lib/types/production-orders';
import {
  BuildingOfficeIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CubeIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface ProductionOrdersListProps {
  orders: ProductionOrder[];
  onView: (order: ProductionOrder) => void;
  onEdit: (order: ProductionOrder) => void;
  onDelete: (order: ProductionOrder) => void;
  onStatusChange: (order: ProductionOrder, status: ProductionOrderStatus) => void;
  onRegisterConsumption: (order: ProductionOrder) => void;
  onRegisterOutput: (order: ProductionOrder) => void;
}

export default function ProductionOrdersList({
  orders,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  onRegisterConsumption,
  onRegisterOutput
}: ProductionOrdersListProps) {

  const getStatusBadge = (status: ProductionOrderStatus) => {
    const statusConfig: Record<ProductionOrderStatus, { label: string; icon: any; className: string }> = {
      [ProductionOrderStatus.PLANNED]: {
        label: 'Planeada',
        icon: CalendarIcon,
        className: 'bg-gray-100 text-gray-600'
      },
      [ProductionOrderStatus.RELEASED]: {
        label: 'Liberada',
        icon: ClockIcon,
        className: 'bg-blue-100 text-blue-600'
      },
      [ProductionOrderStatus.IN_PROGRESS]: {
        label: 'En Progreso',
        icon: PlayIcon,
        className: 'bg-yellow-100 text-yellow-600'
      },
      [ProductionOrderStatus.COMPLETED]: {
        label: 'Completada',
        icon: CheckCircleIcon,
        className: 'bg-green-100 text-green-600'
      },
      [ProductionOrderStatus.CLOSED]: {
        label: 'Cerrada',
        icon: CheckCircleIcon,
        className: 'bg-blue-100 text-blue-600'
      },
      [ProductionOrderStatus.CANCELLED]: {
        label: 'Cancelada',
        icon: XCircleIcon,
        className: 'bg-red-100 text-red-600'
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

  const getPriorityBadge = (priority: ProductionOrderPriority) => {
    const priorityConfig = {
      [ProductionOrderPriority.LOW]: {
        label: 'Baja',
        className: 'bg-gray-100 text-gray-600'
      },
      [ProductionOrderPriority.MEDIUM]: {
        label: 'Media',
        className: 'bg-blue-100 text-blue-600'
      },
      [ProductionOrderPriority.HIGH]: {
        label: 'Alta',
        className: 'bg-orange-100 text-orange-600'
      },
      [ProductionOrderPriority.URGENT]: {
        label: 'Urgente',
        className: 'bg-red-100 text-red-600'
      }
    };

    const config = priorityConfig[priority];

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {priority === ProductionOrderPriority.URGENT && <ExclamationTriangleIcon className="h-3 w-3" />}
        {config.label}
      </span>
    );
  };

  const getCompletionBar = (order: ProductionOrder) => {
    const percentage = order.completion_percentage || 0;
    const isDelayed = order.is_delayed;

    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-600">{percentage}%</span>
          {isDelayed && (
            <span className="text-xs text-red-600 flex items-center gap-1">
              <ExclamationTriangleIcon className="h-3 w-3" />
              Retrasada
            </span>
          )}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${isDelayed ? 'bg-red-500' : 'bg-green-500'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const canEdit = (status: ProductionOrderStatus) => {
    return status === ProductionOrderStatus.PLANNED || status === ProductionOrderStatus.RELEASED;
  };

  const canDelete = (status: ProductionOrderStatus) => {
    return status === ProductionOrderStatus.PLANNED;
  };

  const canChangeStatus = (currentStatus: ProductionOrderStatus, newStatus: ProductionOrderStatus) => {
    const transitions: Record<ProductionOrderStatus, ProductionOrderStatus[]> = {
      [ProductionOrderStatus.PLANNED]: [ProductionOrderStatus.RELEASED, ProductionOrderStatus.CANCELLED],
      [ProductionOrderStatus.RELEASED]: [ProductionOrderStatus.IN_PROGRESS, ProductionOrderStatus.CANCELLED],
      [ProductionOrderStatus.IN_PROGRESS]: [ProductionOrderStatus.COMPLETED, ProductionOrderStatus.CANCELLED],
      [ProductionOrderStatus.COMPLETED]: [ProductionOrderStatus.CLOSED],
      [ProductionOrderStatus.CLOSED]: [],
      [ProductionOrderStatus.CANCELLED]: []
    };

    return transitions[currentStatus]?.includes(newStatus) || false;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Orden
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cantidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prioridad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progreso
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fechas
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <BuildingOfficeIcon className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{order.order_number}</div>
                      {order.work_center && (
                        <div className="text-xs text-gray-500">Centro: {order.work_center}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <CubeIcon className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.product?.code}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.product?.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm text-gray-900">
                      {order.produced_qty} / {order.planned_qty}
                    </div>
                    <div className="text-xs text-gray-500">
                      Pendiente: {order.planned_qty - order.produced_qty}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(order.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getPriorityBadge(order.priority)}
                </td>
                <td className="px-6 py-4">
                  <div className="w-32">
                    {getCompletionBar(order)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3 text-gray-400" />
                      {formatDate(order.planned_start_date)}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      hasta {formatDate(order.planned_end_date)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onView(order)}
                      className="text-gray-400 hover:text-gray-600"
                      title="Ver detalles"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>

                    {canEdit(order.status) && (
                      <button
                        onClick={() => onEdit(order)}
                        className="text-blue-400 hover:text-blue-600"
                        title="Editar"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    )}

                    {order.status === ProductionOrderStatus.IN_PROGRESS && (
                      <>
                        <button
                          onClick={() => onRegisterConsumption(order)}
                          className="text-orange-400 hover:text-orange-600"
                          title="Registrar consumo"
                        >
                          <CubeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onRegisterOutput(order)}
                          className="text-green-400 hover:text-green-600"
                          title="Registrar producción"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                        </button>
                      </>
                    )}

                    {/* Botones de cambio de estado */}
                    {canChangeStatus(order.status, ProductionOrderStatus.IN_PROGRESS) && (
                      <button
                        onClick={() => onStatusChange(order, ProductionOrderStatus.IN_PROGRESS)}
                        className="text-green-400 hover:text-green-600"
                        title="Iniciar producción"
                      >
                        <PlayIcon className="h-4 w-4" />
                      </button>
                    )}

                    {canDelete(order.status) && (
                      <button
                        onClick={() => onDelete(order)}
                        className="text-red-400 hover:text-red-600"
                        title="Eliminar"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  No se encontraron órdenes de producción
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}