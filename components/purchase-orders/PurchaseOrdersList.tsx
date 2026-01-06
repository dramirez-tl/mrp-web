'use client';

import React from 'react';
import {
  PurchaseOrder,
  PurchaseOrderStatus,
} from '@/lib/types/purchase-order';
import { Badge } from '@/components/ui/badge';
import {
  PencilIcon,
  TrashIcon,
  CubeIcon,
  EyeIcon,
  ChevronRightIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

interface PurchaseOrdersListProps {
  orders: PurchaseOrder[];
  onEdit: (order: PurchaseOrder) => void;
  onDelete: (orderId: string) => void;
  onStatusChange: (orderId: string, newStatus: PurchaseOrderStatus) => void;
  onReceive: (order: PurchaseOrder) => void;
  onDownloadPDF: (order: PurchaseOrder) => void;
  onPrint: (order: PurchaseOrder) => void;
  onSendEmail: (order: PurchaseOrder) => void;
}

export default function PurchaseOrdersList({
  orders,
  onEdit,
  onDelete,
  onStatusChange,
  onReceive,
  onDownloadPDF,
  onPrint,
  onSendEmail,
}: PurchaseOrdersListProps) {
  const getStatusBadge = (status: PurchaseOrderStatus) => {
    const statusConfig = {
      [PurchaseOrderStatus.DRAFT]: { label: 'Borrador', className: 'bg-gray-100 text-gray-800' },
      [PurchaseOrderStatus.PENDING_APPROVAL]: { label: 'Pendiente Aprobación', className: 'bg-yellow-100 text-yellow-800' },
      [PurchaseOrderStatus.APPROVED]: { label: 'Aprobada', className: 'bg-blue-100 text-blue-800' },
      [PurchaseOrderStatus.SENT]: { label: 'Enviada', className: 'bg-purple-100 text-purple-800' },
      [PurchaseOrderStatus.PARTIALLY_RECEIVED]: { label: 'Parcialmente Recibida', className: 'bg-orange-100 text-orange-800' },
      [PurchaseOrderStatus.COMPLETED]: { label: 'Completada', className: 'bg-green-100 text-green-800' },
      [PurchaseOrderStatus.CANCELLED]: { label: 'Cancelada', className: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status] || statusConfig[PurchaseOrderStatus.DRAFT];

    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getAvailableActions = (status: PurchaseOrderStatus) => {
    const actions: { status: PurchaseOrderStatus; label: string; className: string }[] = [];

    switch (status) {
      case PurchaseOrderStatus.DRAFT:
        actions.push(
          { status: PurchaseOrderStatus.PENDING_APPROVAL, label: 'Enviar a Aprobación', className: 'text-yellow-600' },
          { status: PurchaseOrderStatus.CANCELLED, label: 'Cancelar', className: 'text-red-600' },
        );
        break;
      case PurchaseOrderStatus.PENDING_APPROVAL:
        actions.push(
          { status: PurchaseOrderStatus.APPROVED, label: 'Aprobar', className: 'text-blue-600' },
          { status: PurchaseOrderStatus.CANCELLED, label: 'Cancelar', className: 'text-red-600' },
        );
        break;
      case PurchaseOrderStatus.APPROVED:
        actions.push(
          { status: PurchaseOrderStatus.SENT, label: 'Marcar como Enviada', className: 'text-purple-600' },
          { status: PurchaseOrderStatus.CANCELLED, label: 'Cancelar', className: 'text-red-600' },
        );
        break;
      case PurchaseOrderStatus.SENT:
        actions.push(
          { status: PurchaseOrderStatus.CANCELLED, label: 'Cancelar', className: 'text-red-600' },
        );
        break;
      case PurchaseOrderStatus.PARTIALLY_RECEIVED:
        actions.push(
          { status: PurchaseOrderStatus.CANCELLED, label: 'Cancelar', className: 'text-red-600' },
        );
        break;
    }

    return actions;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateProgress = (order: PurchaseOrder) => {
    const totalQuantity = order.purchase_order_items.reduce((sum, item) => sum + item.quantity, 0);
    const receivedQuantity = order.purchase_order_items.reduce((sum, item) => sum + item.quantity_received, 0);

    if (totalQuantity === 0) return 0;
    return (receivedQuantity / totalQuantity) * 100;
  };

  const canEdit = (status: PurchaseOrderStatus) => {
    return [
      PurchaseOrderStatus.DRAFT,
      PurchaseOrderStatus.PENDING_APPROVAL,
    ].includes(status);
  };

  const canDelete = (status: PurchaseOrderStatus) => {
    return status === PurchaseOrderStatus.DRAFT;
  };

  const canReceive = (status: PurchaseOrderStatus) => {
    return [
      PurchaseOrderStatus.SENT,
      PurchaseOrderStatus.PARTIALLY_RECEIVED,
    ].includes(status);
  };

  const canPrintOrDownload = (status: PurchaseOrderStatus) => {
    return [
      PurchaseOrderStatus.APPROVED,
      PurchaseOrderStatus.SENT,
      PurchaseOrderStatus.PARTIALLY_RECEIVED,
      PurchaseOrderStatus.COMPLETED,
    ].includes(status);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Orden
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Proveedor
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Productos
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Progreso
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fechas
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => {
            const progress = calculateProgress(order);
            const availableActions = getAvailableActions(order.status);

            return (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {order.order_number}
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {order.id.slice(0, 8)}...
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {order.suppliers.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.suppliers.code}
                    </div>
                    {order.suppliers.contact_email && (
                      <div className="text-xs text-gray-400">
                        {order.suppliers.contact_email}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {getStatusBadge(order.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="text-sm text-gray-900">
                    {order.purchase_order_items.length} productos
                  </div>
                  <div className="text-xs text-gray-500">
                    {order.purchase_order_items.reduce((sum, item) => sum + item.quantity, 0)} unidades
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(order.total_amount || 0)}
                  </div>
                  {order.tax_amount && order.tax_amount > 0 && (
                    <div className="text-xs text-gray-500">
                      IVA: {formatCurrency(order.tax_amount)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {(order.status === PurchaseOrderStatus.SENT ||
                    order.status === PurchaseOrderStatus.PARTIALLY_RECEIVED ||
                    order.status === PurchaseOrderStatus.COMPLETED) && (
                    <div className="w-full">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Recibido</span>
                        <span>{progress.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            progress === 100
                              ? 'bg-green-500'
                              : progress > 0
                              ? 'bg-yellow-500'
                              : 'bg-gray-300'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">Orden:</span> {formatDate(order.order_date)}
                    </div>
                    {order.expected_date && (
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Entrega:</span> {formatDate(order.expected_date)}
                      </div>
                    )}
                    {order.received_date && (
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Recibido:</span> {formatDate(order.received_date)}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center space-x-2">
                    {/* View Details */}
                    <button
                      onClick={() => onEdit(order)}
                      className="text-gray-600 hover:text-gray-800"
                      title="Ver Detalles"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>

                    {/* Download PDF */}
                    {canPrintOrDownload(order.status) && (
                      <button
                        onClick={() => onDownloadPDF(order)}
                        className="text-indigo-600 hover:text-indigo-800"
                        title="Descargar PDF"
                      >
                        <DocumentArrowDownIcon className="h-5 w-5" />
                      </button>
                    )}

                    {/* Print */}
                    {canPrintOrDownload(order.status) && (
                      <button
                        onClick={() => onPrint(order)}
                        className="text-gray-600 hover:text-gray-800"
                        title="Imprimir"
                      >
                        <PrinterIcon className="h-5 w-5" />
                      </button>
                    )}

                    {/* Send Email - UI only for now */}
                    {canPrintOrDownload(order.status) && (
                      <button
                        onClick={() => onSendEmail(order)}
                        className="text-purple-600 hover:text-purple-800"
                        title="Enviar por Email"
                      >
                        <EnvelopeIcon className="h-5 w-5" />
                      </button>
                    )}

                    {/* Edit */}
                    {canEdit(order.status) && (
                      <button
                        onClick={() => onEdit(order)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Editar"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                    )}

                    {/* Receive Items */}
                    {canReceive(order.status) && (
                      <button
                        onClick={() => onReceive(order)}
                        className="text-green-600 hover:text-green-800"
                        title="Recibir Mercancía"
                      >
                        <CubeIcon className="h-5 w-5" />
                      </button>
                    )}

                    {/* Delete */}
                    {canDelete(order.status) && (
                      <button
                        onClick={() => onDelete(order.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Eliminar"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}

                    {/* Status Actions Dropdown */}
                    {availableActions.length > 0 && (
                      <div className="relative inline-block text-left">
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              onStatusChange(order.id, e.target.value as PurchaseOrderStatus);
                              e.target.value = '';
                            }
                          }}
                          className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          defaultValue=""
                        >
                          <option value="" disabled>
                            Cambiar estado...
                          </option>
                          {availableActions.map((action) => (
                            <option key={action.status} value={action.status}>
                              {action.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}