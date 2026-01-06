'use client';

import React, { useState, useEffect } from 'react';
import { ProductionOrder, ProductionOutput } from '@/lib/types/production-orders';
import {
  XMarkIcon,
  CheckCircleIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  UserIcon,
  HashtagIcon,
  InformationCircleIcon,
  PlusIcon,
  MinusIcon,
  CheckIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface ProductionOutputModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: ProductionOrder;
  onSave: (output: ProductionOutput) => Promise<void>;
}

export default function ProductionOutputModal({
  isOpen,
  onClose,
  order,
  onSave
}: ProductionOutputModalProps) {
  const [loading, setLoading] = useState(false);

  // Datos del registro
  const [quantityProduced, setQuantityProduced] = useState(0);
  const [lotNumber, setLotNumber] = useState('');
  const [productionDate, setProductionDate] = useState(new Date().toISOString().split('T')[0]);
  const [expirationDate, setExpirationDate] = useState('');
  const [operator, setOperator] = useState('');
  const [outputType, setOutputType] = useState<'GOOD' | 'REWORK' | 'SCRAP'>('GOOD');
  const [productionNotes, setProductionNotes] = useState('');

  // Estadísticas
  const [stats, setStats] = useState({
    totalProduced: 0,
    totalRemaining: 0,
    completionPercentage: 0
  });

  useEffect(() => {
    if (isOpen && order) {
      calculateStats();
      generateLotNumber();
    }
  }, [isOpen, order]);

  useEffect(() => {
    calculateStats();
  }, [quantityProduced]);

  const calculateStats = () => {
    const newTotalProduced = (order.produced_qty || 0) + quantityProduced;
    const newTotalRemaining = order.planned_qty - newTotalProduced;
    const completionPercentage = Math.round((newTotalProduced / order.planned_qty) * 100);

    setStats({
      totalProduced: newTotalProduced,
      totalRemaining: Math.max(0, newTotalRemaining),
      completionPercentage: Math.min(100, completionPercentage)
    });
  };

  const generateLotNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    setLotNumber(`LOT-${year}${month}${day}-${random}`);
  };

  const validateOutput = () => {
    if (!operator.trim()) {
      toast.error('Debe ingresar el nombre del operador');
      return false;
    }

    if (!lotNumber.trim()) {
      toast.error('Debe ingresar el número de lote');
      return false;
    }

    if (quantityProduced <= 0) {
      toast.error('La cantidad producida debe ser mayor a 0');
      return false;
    }

    const remainingQty = order.planned_qty - order.produced_qty;
    if (quantityProduced > remainingQty) {
      toast.error(`La cantidad producida no puede exceder ${remainingQty} unidades pendientes`);
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateOutput()) return;

    setLoading(true);
    try {
      const output: any = {
        quantity_produced: quantityProduced,
        output_type: outputType,
        lot_number: lotNumber,
        production_date: productionDate,
        expiration_date: expirationDate || undefined,
        operator,
        observations: productionNotes || undefined
      };

      await onSave(output);

      // Verificar si se completó la orden
      if (stats.totalProduced >= order.planned_qty) {
        toast.success('¡Orden de producción completada!');
      } else {
        toast.success('Producción registrada exitosamente');
      }

      onClose();
    } catch (error) {
      console.error('Error saving output:', error);
      toast.error('Error al registrar producción');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md transition-opacity" aria-hidden="true"></div>

        <div className="relative z-10 inline-block bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col text-left align-bottom transition-all transform shadow-xl sm:my-8 sm:align-middle">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="h-6 w-6 text-green-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Registrar Producción</h2>
              <p className="text-sm text-gray-600">Orden: {order.order_number} - {order.product?.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Estado actual de la orden */}
          <div className="mb-6 bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-3">Estado Actual de la Orden</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-blue-700">Cantidad Ordenada</p>
                <p className="text-lg font-bold text-blue-900">{order.planned_qty}</p>
              </div>
              <div>
                <p className="text-xs text-blue-700">Producido Anteriormente</p>
                <p className="text-lg font-bold text-blue-900">{order.produced_qty || 0}</p>
              </div>
              <div>
                <p className="text-xs text-blue-700">Pendiente</p>
                <p className="text-lg font-bold text-orange-600">{order.planned_qty - order.produced_qty}</p>
              </div>
              <div>
                <p className="text-xs text-blue-700">Progreso</p>
                <div className="mt-1">
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${order.completion_percentage || 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-blue-700 mt-1">{order.completion_percentage || 0}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Datos de producción */}
          <div className="space-y-6">
            {/* Información general */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Información General</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    <CalendarIcon className="h-4 w-4 inline mr-1" />
                    Fecha de Producción
                  </label>
                  <input
                    type="date"
                    value={productionDate}
                    onChange={(e) => setProductionDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    <UserIcon className="h-4 w-4 inline mr-1" />
                    Operador *
                  </label>
                  <input
                    type="text"
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                    placeholder="Nombre del operador"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Tipo de Salida
                  </label>
                  <select
                    value={outputType}
                    onChange={(e) => setOutputType(e.target.value as 'GOOD' | 'REWORK' | 'SCRAP')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="GOOD">Bueno</option>
                    <option value="REWORK">Retrabajo</option>
                    <option value="SCRAP">Desperdicio</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Cantidades */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Información de Producción</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    <CubeIcon className="h-4 w-4 inline mr-1" />
                    Cantidad Producida *
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantityProduced(Math.max(0, quantityProduced - 1))}
                      className="p-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded"
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      value={quantityProduced}
                      onChange={(e) => setQuantityProduced(parseFloat(e.target.value) || 0)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500"
                      min="0"
                      max={order.planned_qty - order.produced_qty}
                      step="1"
                    />
                    <button
                      onClick={() => setQuantityProduced(Math.min(order.planned_qty - order.produced_qty, quantityProduced + 1))}
                      className="p-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                  {quantityProduced > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      Nuevo total: {stats.totalProduced} de {order.planned_qty}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    <HashtagIcon className="h-4 w-4 inline mr-1" />
                    Número de Lote *
                  </label>
                  <input
                    type="text"
                    value={lotNumber}
                    onChange={(e) => setLotNumber(e.target.value)}
                    placeholder="Ej: LOT-20240315-001"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    <CalendarIcon className="h-4 w-4 inline mr-1" />
                    Fecha de Expiración
                  </label>
                  <input
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Indicadores de rendimiento */}
            {quantityProduced > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <ChartBarIcon className="h-4 w-4" />
                  Indicadores de Progreso
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalProduced}</div>
                    <p className="text-xs text-gray-600">Total Producido</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.completionPercentage}%</div>
                    <p className="text-xs text-gray-600">Completado</p>
                  </div>
                </div>
              </div>
            )}

            {/* Notas adicionales */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas de Producción (Opcional)
              </label>
              <textarea
                value={productionNotes}
                onChange={(e) => setProductionNotes(e.target.value)}
                rows={3}
                placeholder="Observaciones sobre el proceso de producción..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Advertencias */}
            {stats.totalProduced >= order.planned_qty && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  <p className="text-green-800">
                    Con este registro se completará la orden de producción.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-between bg-gray-50">
          <div className="text-sm text-gray-600">
            {stats.totalRemaining > 0 ? (
              <span>Quedarán {stats.totalRemaining} unidades pendientes</span>
            ) : (
              <span className="text-green-600 font-medium">Orden completada</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
              disabled={loading || quantityProduced <= 0}
            >
              {loading ? (
                <>Guardando...</>
              ) : (
                <>
                  <CheckIcon className="h-4 w-4" />
                  Registrar Producción
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}