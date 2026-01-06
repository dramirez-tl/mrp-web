'use client';

import React, { useState, useEffect } from 'react';
import {
  MrpDemand,
  MrpDemandItem,
  CreateMrpDemandDto,
  DemandPriority
} from '@/lib/types/mrp';
import { Product } from '@/lib/types/products';
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  CalendarIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface DemandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (demand: CreateMrpDemandDto) => Promise<void>;
  demand: MrpDemand | null;
  products: Product[];
}

export default function DemandModal({
  isOpen,
  onClose,
  onSave,
  demand,
  products
}: DemandModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [] as Omit<MrpDemandItem, 'id' | 'product'>[]
  });

  useEffect(() => {
    if (demand) {
      setFormData({
        code: demand.code,
        description: demand.description,
        start_date: demand.start_date.split('T')[0],
        end_date: demand.end_date.split('T')[0],
        items: demand.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          required_date: item.required_date,
          priority: item.priority,
          notes: item.notes
        }))
      });
    } else {
      // Generar código automático para nueva demanda
      generateDemandCode();
    }
  }, [demand]);

  const generateDemandCode = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    setFormData(prev => ({
      ...prev,
      code: `DEM-${year}${month}-${random}`
    }));
  };

  const handleAddItem = () => {
    const newItem: Omit<MrpDemandItem, 'id' | 'product'> = {
      product_id: '',
      quantity: 1,
      required_date: formData.end_date,
      priority: DemandPriority.MEDIUM,
      notes: ''
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index: number, field: keyof MrpDemandItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const validateForm = () => {
    if (!formData.code.trim()) {
      toast.error('El código es requerido');
      return false;
    }

    if (!formData.description.trim()) {
      toast.error('La descripción es requerida');
      return false;
    }

    if (formData.items.length === 0) {
      toast.error('Debe agregar al menos un producto');
      return false;
    }

    for (let i = 0; i < formData.items.length; i++) {
      const item = formData.items[i];
      if (!item.product_id) {
        toast.error(`Seleccione un producto en la línea ${i + 1}`);
        return false;
      }
      if (item.quantity <= 0) {
        toast.error(`La cantidad debe ser mayor a 0 en la línea ${i + 1}`);
        return false;
      }
    }

    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);

    if (endDate <= startDate) {
      toast.error('La fecha final debe ser posterior a la fecha inicial');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving demand:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? `${product.code} - ${product.name}` : 'Seleccione un producto';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              {demand ? 'Editar Demanda' : 'Nueva Demanda MRP'}
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
          {/* Información General */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Información General</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="DEM-202403-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción *
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Demanda de marzo 2024"
                />
              </div>
            </div>
          </div>

          {/* Período */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Período de Planificación</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <CalendarIcon className="h-4 w-4 inline mr-1" />
                  Fecha Inicial *
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <CalendarIcon className="h-4 w-4 inline mr-1" />
                  Fecha Final *
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  min={formData.start_date}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Productos Demandados */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">
                <CubeIcon className="h-4 w-4 inline mr-1" />
                Productos Demandados
              </h3>
              <button
                onClick={handleAddItem}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-1"
              >
                <PlusIcon className="h-4 w-4" />
                Agregar Producto
              </button>
            </div>

            {formData.items.length === 0 ? (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <CubeIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">No hay productos en esta demanda</p>
                <button
                  onClick={handleAddItem}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Agregar el primer producto
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                      <div className="md:col-span-2">
                        <label className="block text-xs text-gray-600 mb-1">Producto *</label>
                        <select
                          value={item.product_id}
                          onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          <option value="">Seleccione...</option>
                          {products.map(product => (
                            <option key={product.id} value={product.id}>
                              {product.code} - {product.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Cantidad *</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Fecha Requerida</label>
                        <input
                          type="date"
                          value={item.required_date}
                          onChange={(e) => handleItemChange(index, 'required_date', e.target.value)}
                          min={formData.start_date}
                          max={formData.end_date}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Prioridad</label>
                        <select
                          value={item.priority}
                          onChange={(e) => handleItemChange(index, 'priority', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          <option value={DemandPriority.LOW}>Baja</option>
                          <option value={DemandPriority.MEDIUM}>Media</option>
                          <option value={DemandPriority.HIGH}>Alta</option>
                          <option value={DemandPriority.URGENT}>Urgente</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                          title="Eliminar"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <input
                        type="text"
                        value={item.notes || ''}
                        onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                        placeholder="Notas adicionales (opcional)"
                        className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resumen */}
          {formData.items.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="text-sm text-blue-800">
                  <strong>Resumen:</strong> {formData.items.length} producto(s) -
                  Total: {formData.items.reduce((sum, item) => sum + item.quantity, 0).toLocaleString()} unidades
                </div>
                {formData.items.some(item => item.priority === DemandPriority.URGENT) && (
                  <div className="flex items-center gap-1 text-red-600">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    <span className="text-sm">Contiene items urgentes</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-between bg-gray-50">
          <div className="text-sm text-gray-600">
            {demand ? 'Editando demanda existente' : 'Creando nueva demanda'}
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
              disabled={loading || formData.items.length === 0}
            >
              {loading ? (
                <>Guardando...</>
              ) : (
                <>
                  <CheckIcon className="h-4 w-4" />
                  {demand ? 'Actualizar' : 'Crear'} Demanda
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}