'use client';

import React, { useState } from 'react';
import { MrpDemand, RunMrpCalculationDto } from '@/lib/types/mrp';
import {
  XMarkIcon,
  PlayIcon,
  CalculatorIcon,
  Cog6ToothIcon,
  CalendarIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface MrpExecutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  demands: MrpDemand[];
  onExecute: () => void;
}

export default function MrpExecutionModal({
  isOpen,
  onClose,
  demands,
  onExecute
}: MrpExecutionModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedDemands, setSelectedDemands] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [parameters, setParameters] = useState<RunMrpCalculationDto>({
    demand_ids: [],
    include_safety_stock: true,
    consolidate_orders: true,
    planning_horizon_days: 30
  });

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedDemands([]);
    } else {
      setSelectedDemands(demands.map(d => d.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectDemand = (demandId: string) => {
    if (selectedDemands.includes(demandId)) {
      setSelectedDemands(selectedDemands.filter(id => id !== demandId));
    } else {
      setSelectedDemands([...selectedDemands, demandId]);
    }
  };

  const calculateTotalProducts = () => {
    const selected = demands.filter(d => selectedDemands.includes(d.id));
    const products = new Set<string>();
    selected.forEach(demand => {
      demand.items?.forEach(item => {
        if (item.product_id) products.add(item.product_id);
      });
    });
    return products.size;
  };

  const calculateTotalQuantity = () => {
    const selected = demands.filter(d => selectedDemands.includes(d.id));
    return selected.reduce((total, demand) => {
      const demandTotal = demand.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      return total + demandTotal;
    }, 0);
  };

  const handleExecute = async () => {
    if (selectedDemands.length === 0) {
      toast.error('Seleccione al menos una demanda');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/mrp/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...parameters,
          demand_ids: selectedDemands
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al ejecutar MRP');
      }

      toast.success('Cálculo MRP iniciado exitosamente');
      onExecute();
      onClose();
    } catch (error) {
      console.error('Error executing MRP:', error);
      toast.error(error instanceof Error ? error.message : 'Error al ejecutar MRP');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalculatorIcon className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              Ejecutar Cálculo MRP
            </h2>
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
          {/* Parámetros de Configuración */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Cog6ToothIcon className="h-4 w-4" />
              Parámetros de Configuración
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Horizonte de Planificación
                  </label>
                  <p className="text-xs text-gray-500">Días a considerar en el cálculo</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={parameters.planning_horizon_days}
                    onChange={(e) => setParameters({
                      ...parameters,
                      planning_horizon_days: parseInt(e.target.value) || 30
                    })}
                    className="w-20 px-3 py-1 border border-gray-300 rounded-lg text-sm"
                    min="1"
                    max="365"
                  />
                  <span className="text-sm text-gray-600">días</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Incluir Stock de Seguridad
                  </label>
                  <p className="text-xs text-gray-500">Considerar el stock mínimo de productos</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={parameters.include_safety_stock}
                    onChange={(e) => setParameters({
                      ...parameters,
                      include_safety_stock: e.target.checked
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Consolidar Órdenes
                  </label>
                  <p className="text-xs text-gray-500">Agrupar requerimientos por proveedor</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={parameters.consolidate_orders}
                    onChange={(e) => setParameters({
                      ...parameters,
                      consolidate_orders: e.target.checked
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Selección de Demandas */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <CubeIcon className="h-4 w-4" />
                Seleccionar Demandas
              </h3>
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {selectAll ? 'Deseleccionar todas' : 'Seleccionar todas'}
              </button>
            </div>

            {demands.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-800 font-medium">
                      No hay demandas activas
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Cree al menos una demanda activa antes de ejecutar el cálculo MRP
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {demands.map(demand => (
                  <div
                    key={demand.id}
                    className={`border rounded-lg p-3 cursor-pointer transition ${
                      selectedDemands.includes(demand.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleSelectDemand(demand.id)}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedDemands.includes(demand.id)}
                        onChange={() => {}}
                        className="mt-1"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-800">{demand.code}</p>
                            <p className="text-sm text-gray-600">{demand.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">
                              {demand.items?.length || 0} productos
                            </p>
                            <p className="text-xs text-gray-500">
                              {demand.items?.reduce((sum, item) => sum + item.quantity, 0).toLocaleString()} unidades
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            {new Date(demand.start_date).toLocaleDateString('es-MX')}
                          </span>
                          <span>→</span>
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            {new Date(demand.end_date).toLocaleDateString('es-MX')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resumen */}
          {selectedDemands.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Resumen del Cálculo</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-blue-700">Demandas seleccionadas</p>
                  <p className="text-lg font-bold text-blue-900">{selectedDemands.length}</p>
                </div>
                <div>
                  <p className="text-blue-700">Productos únicos</p>
                  <p className="text-lg font-bold text-blue-900">{calculateTotalProducts()}</p>
                </div>
                <div>
                  <p className="text-blue-700">Cantidad total</p>
                  <p className="text-lg font-bold text-blue-900">
                    {calculateTotalQuantity().toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Información */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <InformationCircleIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-1">El cálculo MRP realizará:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Explosión de BOMs para calcular materiales necesarios</li>
                  <li>Verificación de inventario disponible</li>
                  <li>Cálculo de requerimientos netos</li>
                  <li>Generación de órdenes de compra y producción sugeridas</li>
                  <li>Consideración de lead times de proveedores</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-between bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedDemands.length > 0 ? (
              <span className="flex items-center gap-2">
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                Listo para ejecutar el cálculo
              </span>
            ) : (
              <span className="text-yellow-600">Seleccione al menos una demanda</span>
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
              onClick={handleExecute}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
              disabled={loading || selectedDemands.length === 0}
            >
              {loading ? (
                <>Ejecutando...</>
              ) : (
                <>
                  <PlayIcon className="h-4 w-4" />
                  Ejecutar MRP
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}