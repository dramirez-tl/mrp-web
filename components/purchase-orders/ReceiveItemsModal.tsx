'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon, CubeIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { PurchaseOrder, ReceiveItemDto } from '@/lib/types/purchase-order';
import api from '@/lib/api';
import { toast } from 'sonner';

interface ReceiveItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  order: PurchaseOrder;
}

interface ReceiveFormItem {
  item_id: string;
  product_code: string;
  product_name: string;
  quantity_ordered: number;
  quantity_received: number;
  quantity_pending: number;
  quantity_to_receive: number;
  lot_number: string;
  notes: string;
}

export default function ReceiveItemsModal({
  isOpen,
  onClose,
  onSave,
  order,
}: ReceiveItemsModalProps) {
  const [receiveItems, setReceiveItems] = useState<ReceiveFormItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiveAll, setReceiveAll] = useState(false);

  useEffect(() => {
    if (isOpen && order) {
      // Initialize receive items from order items
      const items = order.purchase_order_items.map(item => ({
        item_id: item.id,
        product_code: item.products.code,
        product_name: item.products.name,
        quantity_ordered: item.quantity,
        quantity_received: item.quantity_received || 0,
        quantity_pending: item.quantity - (item.quantity_received || 0),
        quantity_to_receive: 0,
        lot_number: '',
        notes: '',
      }));

      setReceiveItems(items);
      setReceiveAll(false);
    }
  }, [isOpen, order]);

  const handleQuantityChange = (index: number, value: number) => {
    setReceiveItems(prev => prev.map((item, i) => {
      if (i === index) {
        const maxReceivable = item.quantity_pending;
        const quantity = Math.min(Math.max(0, value), maxReceivable);
        return { ...item, quantity_to_receive: quantity };
      }
      return item;
    }));
    setErrors(prev => ({ ...prev, [`quantity_${index}`]: '' }));
  };

  const handleLotChange = (index: number, value: string) => {
    setReceiveItems(prev => prev.map((item, i) =>
      i === index ? { ...item, lot_number: value } : item
    ));
  };

  const handleNotesChange = (index: number, value: string) => {
    setReceiveItems(prev => prev.map((item, i) =>
      i === index ? { ...item, notes: value } : item
    ));
  };

  const handleReceiveAllToggle = () => {
    const newReceiveAll = !receiveAll;
    setReceiveAll(newReceiveAll);

    if (newReceiveAll) {
      // Set all pending quantities to receive
      setReceiveItems(prev => prev.map(item => ({
        ...item,
        quantity_to_receive: item.quantity_pending,
      })));
    } else {
      // Reset all quantities to 0
      setReceiveItems(prev => prev.map(item => ({
        ...item,
        quantity_to_receive: 0,
      })));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const hasItemsToReceive = receiveItems.some(item => item.quantity_to_receive > 0);

    if (!hasItemsToReceive) {
      newErrors.general = 'Debe recibir al menos un producto';
    }

    receiveItems.forEach((item, index) => {
      if (item.quantity_to_receive < 0) {
        newErrors[`quantity_${index}`] = 'La cantidad no puede ser negativa';
      }
      if (item.quantity_to_receive > item.quantity_pending) {
        newErrors[`quantity_${index}`] = 'No puede recibir más de lo pendiente';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Filter items with quantity > 0
      const itemsToReceive: ReceiveItemDto[] = receiveItems
        .filter(item => item.quantity_to_receive > 0)
        .map(item => ({
          item_id: item.item_id,
          received_qty: item.quantity_to_receive,
          lot_number: item.lot_number || undefined,
          notes: item.notes || undefined,
        }));

      await api.post(`/purchase-orders/${order.id}/receive`, itemsToReceive);

      toast.success('Mercancía recibida exitosamente');
      onSave();
      handleClose();
    } catch (error: any) {
      console.error('Error receiving items:', error);
      if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error('Error al recibir la mercancía');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReceiveItems([]);
    setErrors({});
    setReceiveAll(false);
    onClose();
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const totalOrdered = receiveItems.reduce((sum, item) => sum + item.quantity_ordered, 0);
  const totalReceived = receiveItems.reduce((sum, item) => sum + item.quantity_received, 0);
  const totalPending = receiveItems.reduce((sum, item) => sum + item.quantity_pending, 0);
  const totalToReceive = receiveItems.reduce((sum, item) => sum + item.quantity_to_receive, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold">Recibir Mercancía</h2>
            <p className="text-sm text-gray-600 mt-1">
              Orden: {order.order_number} | Proveedor: {order.suppliers.name}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-600">Total Ordenado</div>
            <div className="text-lg font-semibold">{formatNumber(totalOrdered)}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-xs text-gray-600">Ya Recibido</div>
            <div className="text-lg font-semibold text-green-600">{formatNumber(totalReceived)}</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3">
            <div className="text-xs text-gray-600">Pendiente</div>
            <div className="text-lg font-semibold text-yellow-600">{formatNumber(totalPending)}</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-xs text-gray-600">A Recibir Ahora</div>
            <div className="text-lg font-semibold text-blue-600">{formatNumber(totalToReceive)}</div>
          </div>
        </div>

        {/* Error Message */}
        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            {errors.general}
          </div>
        )}

        {/* Receive All Toggle */}
        <div className="mb-4 flex items-center justify-between bg-gray-50 p-3 rounded">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={receiveAll}
              onChange={handleReceiveAllToggle}
              className="mr-2"
            />
            <span className="text-sm font-medium">
              Recibir todo lo pendiente
            </span>
          </label>
          <div className="flex items-center text-sm text-gray-600">
            <ExclamationCircleIcon className="h-4 w-4 mr-1" />
            Los productos recibidos se agregarán automáticamente al inventario
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Producto
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                  Ordenado
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                  Recibido
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                  Pendiente
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                  Cantidad a Recibir
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                  Lote
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                  Notas
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {receiveItems.map((item, index) => (
                <tr key={item.item_id} className={item.quantity_pending === 0 ? 'bg-gray-50' : ''}>
                  <td className="px-4 py-3">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.product_code}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.product_name}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-sm">
                    {formatNumber(item.quantity_ordered)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-green-600 font-medium">
                      {formatNumber(item.quantity_received)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-yellow-600 font-medium">
                      {formatNumber(item.quantity_pending)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {item.quantity_pending > 0 ? (
                      <div>
                        <input
                          type="number"
                          value={item.quantity_to_receive}
                          onChange={(e) => handleQuantityChange(index, parseFloat(e.target.value) || 0)}
                          min="0"
                          max={item.quantity_pending}
                          step="0.01"
                          className={`w-24 px-2 py-1 border rounded text-sm text-center ${
                            errors[`quantity_${index}`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors[`quantity_${index}`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`quantity_${index}`]}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {item.quantity_pending > 0 ? (
                      <input
                        type="text"
                        value={item.lot_number}
                        onChange={(e) => handleLotChange(index, e.target.value)}
                        placeholder="Opcional"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {item.quantity_pending > 0 ? (
                      <input
                        type="text"
                        value={item.notes}
                        onChange={(e) => handleNotesChange(index, e.target.value)}
                        placeholder="Opcional"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </form>

        {/* Form Actions */}
        <div className="flex justify-between items-center pt-4 border-t mt-4">
          <div className="flex items-center text-sm text-gray-600">
            {totalToReceive > 0 && (
              <>
                <CheckCircleIcon className="h-5 w-5 mr-2 text-green-500" />
                Se recibirán {formatNumber(totalToReceive)} unidades en total
              </>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || totalPending === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              <CubeIcon className="h-4 w-4" />
              {isSubmitting ? 'Procesando...' : 'Recibir Mercancía'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}