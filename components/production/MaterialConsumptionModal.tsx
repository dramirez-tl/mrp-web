'use client';

import React, { useState, useEffect } from 'react';
import { ProductionOrder, MaterialConsumption, MaterialConsumptionItem } from '@/lib/types/production-orders';
import { Product } from '@/lib/types/products';
import {
  XMarkIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlusIcon,
  MinusIcon,
  CheckIcon,
  CalendarIcon,
  UserIcon,
  HashtagIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface MaterialConsumptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: ProductionOrder;
  onSave: (consumption: MaterialConsumptionItem[]) => Promise<void>;
}

interface ConsumptionItem {
  materialId: string;
  material?: Product;
  requiredQuantity: number;
  consumedQuantity: number;
  remainingQuantity: number;
  lotNumber: string;
  expirationDate: string;
  notes: string;
}

export default function MaterialConsumptionModal({
  isOpen,
  onClose,
  order,
  onSave
}: MaterialConsumptionModalProps) {
  const [consumptionItems, setConsumptionItems] = useState<ConsumptionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [bomMaterials, setBomMaterials] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [operator, setOperator] = useState('');
  const [shift, setShift] = useState<'MORNING' | 'AFTERNOON' | 'NIGHT'>('MORNING');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen && order) {
      fetchBomMaterials();
      initializeConsumptionItems();
    }
  }, [isOpen, order]);

  const fetchBomMaterials = async () => {
    if (!order.product?.id) return;

    try {
      // Obtener el BOM activo del producto
      const response = await fetch(`http://localhost:3001/api/boms?product_id=${order.product.id}&is_active=true`, {
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Error al cargar BOM');

      const data = await response.json();
      if (data.data && data.data.length > 0) {
        // Obtener detalles del BOM con explosión
        const bomResponse = await fetch(`http://localhost:3001/api/boms/${data.data[0].id}/explode`, {
          credentials: 'include'
        });

        if (!bomResponse.ok) throw new Error('Error al explotar BOM');

        const bomData = await bomResponse.json();
        setBomMaterials(bomData.materials || []);
      }
    } catch (error) {
      console.error('Error fetching BOM:', error);
      toast.error('Error al cargar lista de materiales');
    }
  };

  const initializeConsumptionItems = () => {
    // Inicializar con los materiales del BOM y las cantidades requeridas
    const items: ConsumptionItem[] = bomMaterials.map(material => ({
      materialId: material.material_id,
      material: material.material,
      requiredQuantity: material.total_quantity * order.planned_qty,
      consumedQuantity: 0,
      remainingQuantity: material.total_quantity * order.planned_qty,
      lotNumber: '',
      expirationDate: '',
      notes: ''
    }));

    setConsumptionItems(items);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const newItems = [...consumptionItems];
    const item = newItems[index];

    // Validar que no exceda la cantidad requerida
    if (quantity > item.requiredQuantity) {
      toast.error('La cantidad no puede exceder lo requerido');
      return;
    }

    item.consumedQuantity = quantity;
    item.remainingQuantity = item.requiredQuantity - quantity;
    setConsumptionItems(newItems);
  };

  const handleLotChange = (index: number, lot: string) => {
    const newItems = [...consumptionItems];
    newItems[index].lotNumber = lot;
    setConsumptionItems(newItems);
  };

  const handleExpirationChange = (index: number, date: string) => {
    const newItems = [...consumptionItems];
    newItems[index].expirationDate = date;
    setConsumptionItems(newItems);
  };

  const handleItemNotesChange = (index: number, notes: string) => {
    const newItems = [...consumptionItems];
    newItems[index].notes = notes;
    setConsumptionItems(newItems);
  };

  const calculateProgress = () => {
    if (consumptionItems.length === 0) return 0;

    const totalRequired = consumptionItems.reduce((sum, item) => sum + item.requiredQuantity, 0);
    const totalConsumed = consumptionItems.reduce((sum, item) => sum + item.consumedQuantity, 0);

    return totalRequired > 0 ? Math.round((totalConsumed / totalRequired) * 100) : 0;
  };

  const validateConsumption = () => {
    // Validar operador
    if (!operator.trim()) {
      toast.error('Debe ingresar el nombre del operador');
      return false;
    }

    // Validar que todos los materiales tengan lote si se consumió cantidad
    for (const item of consumptionItems) {
      if (item.consumedQuantity > 0 && !item.lotNumber) {
        toast.error(`Debe ingresar el número de lote para ${item.material?.name}`);
        return false;
      }
    }

    // Advertencia si no se consumió nada
    const totalConsumed = consumptionItems.reduce((sum, item) => sum + item.consumedQuantity, 0);
    if (totalConsumed === 0) {
      return confirm('No se ha registrado consumo de materiales. ¿Desea continuar?');
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateConsumption()) return;

    setLoading(true);
    try {
      const consumption: MaterialConsumptionItem[] = consumptionItems
        .filter(item => item.consumedQuantity > 0)
        .map(item => ({
          component_id: item.materialId,
          quantity_consumed: item.consumedQuantity,
          lot_number: item.lotNumber,
          notes: item.notes || notes
        }));

      await onSave(consumption);
      toast.success('Consumo registrado exitosamente');
      onClose();
    } catch (error) {
      console.error('Error saving consumption:', error);
      toast.error('Error al registrar consumo');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const progress = calculateProgress();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md transition-opacity" aria-hidden="true"></div>

        <div className="relative z-10 inline-block bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col text-left align-bottom transition-all transform shadow-xl sm:my-8 sm:align-middle">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CubeIcon className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Registrar Consumo de Materiales</h2>
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
          {/* Información general */}
          <div className="mb-6 bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Información del Consumo</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  <CalendarIcon className="h-4 w-4 inline mr-1" />
                  Fecha de Consumo
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  <UserIcon className="h-4 w-4 inline mr-1" />
                  Operador
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
                  Turno
                </label>
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value as 'MORNING' | 'AFTERNOON' | 'NIGHT')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MORNING">Matutino</option>
                  <option value="AFTERNOON">Vespertino</option>
                  <option value="NIGHT">Nocturno</option>
                </select>
              </div>
            </div>
          </div>

          {/* Progreso general */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progreso de Consumo</span>
              <span className="text-sm text-gray-600">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Lista de materiales */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Materiales a Consumir</h3>

            {bomMaterials.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                  <p className="text-yellow-800">
                    No se encontró un BOM activo para este producto. Configure el BOM antes de registrar consumos.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {consumptionItems.map((item, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-800">{item.material?.name}</h4>
                        <p className="text-sm text-gray-600">Código: {item.material?.code}</p>
                      </div>
                      {item.consumedQuantity === item.requiredQuantity && (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Cantidad Requerida</label>
                        <div className="px-3 py-2 bg-gray-100 rounded text-sm">
                          {item.requiredQuantity} {item.material?.unit_measure}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Cantidad Consumida</label>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleQuantityChange(index, Math.max(0, item.consumedQuantity - 1))}
                            className="p-1 text-gray-500 hover:text-gray-700"
                          >
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          <input
                            type="number"
                            value={item.consumedQuantity}
                            onChange={(e) => handleQuantityChange(index, parseFloat(e.target.value) || 0)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                            min="0"
                            max={item.requiredQuantity}
                            step="0.01"
                          />
                          <button
                            onClick={() => handleQuantityChange(index, Math.min(item.requiredQuantity, item.consumedQuantity + 1))}
                            className="p-1 text-gray-500 hover:text-gray-700"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          <HashtagIcon className="h-3 w-3 inline" /> Número de Lote *
                        </label>
                        <input
                          type="text"
                          value={item.lotNumber}
                          onChange={(e) => handleLotChange(index, e.target.value)}
                          placeholder="Ej: LOT-2024-001"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          disabled={item.consumedQuantity === 0}
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Fecha Vencimiento</label>
                        <input
                          type="date"
                          value={item.expirationDate}
                          onChange={(e) => handleExpirationChange(index, e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          disabled={item.consumedQuantity === 0}
                        />
                      </div>
                    </div>

                    {item.consumedQuantity > 0 && (
                      <div className="mt-2">
                        <input
                          type="text"
                          value={item.notes}
                          onChange={(e) => handleItemNotesChange(index, e.target.value)}
                          placeholder="Notas adicionales (opcional)"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    )}

                    {item.consumedQuantity > 0 && item.consumedQuantity < item.requiredQuantity && (
                      <div className="mt-2 flex items-center gap-2 text-yellow-600">
                        <InformationCircleIcon className="h-4 w-4" />
                        <span className="text-xs">
                          Consumo parcial: Faltan {item.remainingQuantity} {item.material?.unit_measure}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notas generales */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas Generales (Opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Observaciones adicionales sobre el consumo..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-between bg-gray-50">
          <div className="text-sm text-gray-600">
            {consumptionItems.filter(i => i.consumedQuantity > 0).length} de {consumptionItems.length} materiales con consumo
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
              disabled={loading || bomMaterials.length === 0}
            >
              {loading ? (
                <>Guardando...</>
              ) : (
                <>
                  <CheckIcon className="h-4 w-4" />
                  Registrar Consumo
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