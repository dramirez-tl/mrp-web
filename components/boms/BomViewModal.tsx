'use client';

import React, { useState } from 'react';
import { XMarkIcon, CubeIcon, CalculatorIcon, DocumentTextIcon, CurrencyDollarIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import { Bom, BomExplosionResponse } from '@/lib/types/boms';
import bomsService from '@/lib/services/boms.service';
import { toast } from 'sonner';

interface BomViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bom: Bom | null;
}

export default function BomViewModal({ isOpen, onClose, bom }: BomViewModalProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [explosionQuantity, setExplosionQuantity] = useState(1);
  const [explosionResult, setExplosionResult] = useState<BomExplosionResponse | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !bom) return null;

  const handleExplode = async () => {
    if (!bom.id) return;

    setLoading(true);
    try {
      const result = await bomsService.explodeBom(bom.id, explosionQuantity);
      console.log('📊 Resultado de explosión de BOM:', result);
      console.log('📦 Primer requerimiento:', result.requirements[0]);
      setExplosionResult(result);
    } catch (error) {
      console.error('Error exploding BOM:', error);
      toast.error('Error al explotar el BOM');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value) return '$0.00';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  };

  const formatDate = (date?: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-MX');
  };

  const tabs = [
    { name: 'Información General', icon: DocumentTextIcon },
    { name: 'Componentes', icon: CubeIcon },
    { name: 'Costos', icon: CurrencyDollarIcon },
    { name: 'Explosión BOM', icon: CalculatorIcon }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md transition-opacity" aria-hidden="true"></div>

        <div className="relative z-10 inline-block w-full max-w-5xl px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Detalles del BOM
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {bom.code} - {bom.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab, index) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={index}
                    onClick={() => setActiveTab(index)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === index
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab 0: Información General */}
          {activeTab === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código
                </label>
                <p className="text-gray-900">{bom.code}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <p className="text-gray-900">{bom.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Producto
                </label>
                <p className="text-gray-900">
                  {bom.product?.code} - {bom.product?.name}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Versión
                </label>
                <p className="text-gray-900">v{bom.version}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <p className="text-gray-900">{bom.status}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tamaño de Lote
                </label>
                <p className="text-gray-900">
                  {bom.batch_size} {bom.batch_unit}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Inicio Vigencia
                </label>
                <p className="text-gray-900">{formatDate(bom.effective_date)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Fin Vigencia
                </label>
                <p className="text-gray-900">{formatDate(bom.expiration_date)}</p>
              </div>

              {bom.description && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <p className="text-gray-900">{bom.description}</p>
                </div>
              )}

              {bom.notes && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas
                  </label>
                  <p className="text-gray-900">{bom.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Tab 1: Componentes */}
          {activeTab === 1 && (
            <div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Componente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cantidad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Merma (%)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cantidad Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Costo Unitario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Costo Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bom.items?.map((item) => {
                      const totalQty = item.quantity * (1 + (item.scrap_rate || 0) / 100);
                      const totalCost = totalQty * (item.component?.standard_cost || 0);
                      return (
                        <tr key={item.id}>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.component?.code}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.component?.name}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.scrap_rate || 0}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {totalQty.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(item.component?.standard_cost)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(totalCost)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2: Costos */}
          {activeTab === 2 && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <CurrencyDollarIcon className="h-5 w-5" />
                  Resumen de Costos
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Costo de Materiales:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(bom.material_cost)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Costo de Mano de Obra:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(bom.labor_cost)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Gastos Generales:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(bom.overhead_cost)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Costo Total Unitario</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {formatCurrency(bom.total_cost)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Explosión BOM */}
          {activeTab === 3 && (
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <Squares2X2Icon className="h-4 w-4" />
                  Calcular Requerimientos
                </h4>
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cantidad a Producir
                    </label>
                    <input
                      type="number"
                      value={explosionQuantity}
                      onChange={(e) => setExplosionQuantity(parseFloat(e.target.value) || 1)}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button
                    onClick={handleExplode}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    <CalculatorIcon className="h-4 w-4" />
                    {loading ? 'Calculando...' : 'Explotar BOM'}
                  </button>
                </div>
              </div>

              {explosionResult && (
                <div className="space-y-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-3">
                      Requerimientos de Materiales
                    </h5>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Componente
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Cantidad Requerida
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Unidad
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Costo Unitario
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Costo Total
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {explosionResult.requirements.map((req, index) => (
                            <tr key={index}>
                              <td className="px-4 py-2">
                                <div className="text-sm text-gray-900">{req.component_code}</div>
                                <div className="text-xs text-gray-500">{req.component_name}</div>
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {req.required_quantity.toFixed(2)}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {req.unit_measure}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {formatCurrency(req.unit_cost)}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {formatCurrency(req.total_cost)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-3">
                      Resumen de Costos Totales
                    </h5>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-600">Materiales</p>
                        <p className="text-lg font-medium text-gray-900">
                          {formatCurrency(explosionResult.total_material_cost)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Mano de Obra</p>
                        <p className="text-lg font-medium text-gray-900">
                          {formatCurrency(explosionResult.total_labor_cost)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Gastos Generales</p>
                        <p className="text-lg font-medium text-gray-900">
                          {formatCurrency(explosionResult.total_overhead_cost)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-medium text-gray-900">Total:</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {formatCurrency(
                            explosionResult.total_material_cost +
                            explosionResult.total_labor_cost +
                            explosionResult.total_overhead_cost
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}