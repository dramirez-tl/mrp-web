'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { CreateAdjustmentDto, CycleCountDto } from '@/lib/types/inventory';
import { Product } from '@/lib/types/products';
import api from '@/lib/services/api';
import { toast } from 'sonner';

interface AdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  productId?: string;
  locationId?: string;
  currentQuantity?: number;
  adjustmentType?: 'adjustment' | 'cycle_count';
}

interface Location {
  id: string;
  code: string;
  name: string;
  type: string;
}

export default function AdjustmentModal({
  isOpen,
  onClose,
  onSave,
  productId,
  locationId,
  currentQuantity = 0,
  adjustmentType = 'adjustment',
}: AdjustmentModalProps) {
  const [activeTab, setActiveTab] = useState<'adjustment' | 'cycle_count'>(adjustmentType);
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Adjustment form data
  const [adjustmentData, setAdjustmentData] = useState<CreateAdjustmentDto>({
    product_id: productId || '',
    quantity: 0,
    reason: '',
    location_id: locationId || '',
    batch_number: '',
    notes: '',
  });

  // Cycle count form data
  const [cycleCountData, setCycleCountData] = useState<CycleCountDto>({
    product_id: productId || '',
    physical_count: currentQuantity,
    location_id: locationId || '',
    batch_number: '',
    notes: '',
  });

  const [adjustmentType2, setAdjustmentType2] = useState<'positive' | 'negative'>('positive');
  const [adjustmentResult, setAdjustmentResult] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
      fetchLocations();
      setActiveTab(adjustmentType);
      if (productId) {
        setAdjustmentData(prev => ({ ...prev, product_id: productId }));
        setCycleCountData(prev => ({ ...prev, product_id: productId }));
      }
      if (locationId) {
        setAdjustmentData(prev => ({ ...prev, location_id: locationId }));
        setCycleCountData(prev => ({ ...prev, location_id: locationId }));
      }
      if (currentQuantity !== undefined) {
        setCycleCountData(prev => ({ ...prev, physical_count: currentQuantity }));
      }
    }
  }, [isOpen, productId, locationId, currentQuantity, adjustmentType]);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      // La respuesta es { data: Product[], meta: {...} }
      setProducts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error al cargar productos');
      setProducts([]);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await api.get('/inventory/locations');
      setLocations(response.data.data || response.data || []);
    } catch (error: any) {
      // Si el endpoint no existe (404), usar ubicación predeterminada sin mostrar error
      if (error.response?.status === 404) {
        console.log('Endpoint de ubicaciones no disponible, usando ubicación predeterminada');
      } else {
        console.error('Error fetching locations:', error);
      }
      // Usar ubicación predeterminada
      setLocations([
        { id: 'default', code: 'MAIN', name: 'Almacén Principal', type: 'WAREHOUSE' }
      ]);
    }
  };

  const adjustmentReasons = [
    'Pérdida por daño',
    'Pérdida por vencimiento',
    'Error de inventario',
    'Ajuste inicial',
    'Donación',
    'Muestra gratis',
    'Consumo interno',
    'Diferencia de recepción',
    'Otro',
  ];

  const handleAdjustmentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAdjustmentData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseFloat(value) || 0 : value,
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleCycleCountChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCycleCountData(prev => ({
      ...prev,
      [name]: name === 'physical_count' ? parseFloat(value) || 0 : value,
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateAdjustment = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!adjustmentData.product_id) {
      newErrors.product_id = 'El producto es requerido';
    }

    if (!adjustmentData.quantity || adjustmentData.quantity === 0) {
      newErrors.quantity = 'La cantidad no puede ser 0';
    }

    if (!adjustmentData.reason) {
      newErrors.reason = 'La razón es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCycleCount = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!cycleCountData.product_id) {
      newErrors.product_id = 'El producto es requerido';
    }

    if (cycleCountData.physical_count === undefined || cycleCountData.physical_count < 0) {
      newErrors.physical_count = 'El conteo físico debe ser mayor o igual a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdjustmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateAdjustment()) return;

    setIsSubmitting(true);
    try {
      // Apply sign based on adjustment type
      const finalQuantity = adjustmentType2 === 'negative'
        ? -Math.abs(adjustmentData.quantity)
        : Math.abs(adjustmentData.quantity);

      await api.post('/inventory/adjustments', {
        ...adjustmentData,
        quantity: finalQuantity,
      });

      onSave();
      handleClose();
    } catch (error: any) {
      console.error('Error creating adjustment:', error);
      if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error('Error al crear el ajuste');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCycleCountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCycleCount()) return;

    setIsSubmitting(true);
    try {
      const response = await api.post('/inventory/cycle-count', cycleCountData);
      setAdjustmentResult(response.data);

      if (response.data.difference !== 0) {
        setTimeout(() => {
          onSave();
          handleClose();
        }, 3000);
      } else {
        setTimeout(() => {
          handleClose();
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error processing cycle count:', error);
      if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error('Error al procesar el conteo cíclico');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setAdjustmentData({
      product_id: '',
      quantity: 0,
      reason: '',
      location_id: '',
      batch_number: '',
      notes: '',
    });
    setCycleCountData({
      product_id: '',
      physical_count: 0,
      location_id: '',
      batch_number: '',
      notes: '',
    });
    setErrors({});
    setAdjustmentResult(null);
    setAdjustmentType2('positive');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md transition-opacity" aria-hidden="true"></div>

        <div className="relative z-10 inline-block bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto text-left align-bottom transition-all transform shadow-xl sm:my-8 sm:align-middle">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Ajuste de Inventario</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-4 border-b">
          <button
            onClick={() => setActiveTab('adjustment')}
            className={`pb-2 px-1 ${
              activeTab === 'adjustment'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500'
            }`}
          >
            Ajuste Manual
          </button>
          <button
            onClick={() => setActiveTab('cycle_count')}
            className={`pb-2 px-1 ${
              activeTab === 'cycle_count'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500'
            }`}
          >
            Conteo Cíclico
          </button>
        </div>

        {/* Adjustment Tab */}
        {activeTab === 'adjustment' && (
          <form onSubmit={handleAdjustmentSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Product Selection */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Producto *
                </label>
                <select
                  name="product_id"
                  value={adjustmentData.product_id}
                  onChange={handleAdjustmentChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.product_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={!!productId}
                >
                  <option value="">Seleccionar producto</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.code} - {product.name}
                    </option>
                  ))}
                </select>
                {errors.product_id && (
                  <p className="text-red-500 text-xs mt-1">{errors.product_id}</p>
                )}
              </div>

              {/* Adjustment Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Ajuste
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="positive"
                      checked={adjustmentType2 === 'positive'}
                      onChange={(e) => setAdjustmentType2(e.target.value as 'positive' | 'negative')}
                      className="mr-2"
                    />
                    <span className="text-green-600">➕ Aumentar</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="negative"
                      checked={adjustmentType2 === 'negative'}
                      onChange={(e) => setAdjustmentType2(e.target.value as 'positive' | 'negative')}
                      className="mr-2"
                    />
                    <span className="text-red-600">➖ Disminuir</span>
                  </label>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={Math.abs(adjustmentData.quantity)}
                  onChange={handleAdjustmentChange}
                  step="0.01"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.quantity ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.quantity && (
                  <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
                )}
              </div>

              {/* Reason */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Razón del Ajuste *
                </label>
                <select
                  name="reason"
                  value={adjustmentData.reason}
                  onChange={handleAdjustmentChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.reason ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar razón</option>
                  {adjustmentReasons.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
                {errors.reason && (
                  <p className="text-red-500 text-xs mt-1">{errors.reason}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicación
                </label>
                <select
                  name="location_id"
                  value={adjustmentData.location_id || ''}
                  onChange={handleAdjustmentChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  disabled={!!locationId}
                >
                  <option value="">Ubicación predeterminada</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.code} - {location.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Batch Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Lote
                </label>
                <input
                  type="text"
                  name="batch_number"
                  value={adjustmentData.batch_number || ''}
                  onChange={handleAdjustmentChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Opcional"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas Adicionales
              </label>
              <textarea
                name="notes"
                value={adjustmentData.notes || ''}
                onChange={handleAdjustmentChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Detalles adicionales del ajuste..."
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Procesando...' : 'Crear Ajuste'}
              </button>
            </div>
          </form>
        )}

        {/* Cycle Count Tab */}
        {activeTab === 'cycle_count' && (
          <form onSubmit={handleCycleCountSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Product Selection */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Producto *
                </label>
                <select
                  name="product_id"
                  value={cycleCountData.product_id}
                  onChange={handleCycleCountChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.product_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={!!productId}
                >
                  <option value="">Seleccionar producto</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.code} - {product.name}
                    </option>
                  ))}
                </select>
                {errors.product_id && (
                  <p className="text-red-500 text-xs mt-1">{errors.product_id}</p>
                )}
              </div>

              {/* Current System Quantity (if available) */}
              {currentQuantity !== undefined && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cantidad en Sistema
                  </label>
                  <input
                    type="number"
                    value={currentQuantity}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>
              )}

              {/* Physical Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Conteo Físico *
                </label>
                <input
                  type="number"
                  name="physical_count"
                  value={cycleCountData.physical_count}
                  onChange={handleCycleCountChange}
                  step="0.01"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.physical_count ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.physical_count && (
                  <p className="text-red-500 text-xs mt-1">{errors.physical_count}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicación
                </label>
                <select
                  name="location_id"
                  value={cycleCountData.location_id || ''}
                  onChange={handleCycleCountChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  disabled={!!locationId}
                >
                  <option value="">Ubicación predeterminada</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.code} - {location.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Batch Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Lote
                </label>
                <input
                  type="text"
                  name="batch_number"
                  value={cycleCountData.batch_number || ''}
                  onChange={handleCycleCountChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Opcional"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones
              </label>
              <textarea
                name="notes"
                value={cycleCountData.notes || ''}
                onChange={handleCycleCountChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Observaciones del conteo..."
              />
            </div>

            {/* Result Display */}
            {adjustmentResult && (
              <div className={`p-4 rounded-md ${
                adjustmentResult.difference === 0
                  ? 'bg-green-50 border border-green-200'
                  : adjustmentResult.difference > 0
                  ? 'bg-blue-50 border border-blue-200'
                  : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <h4 className="font-medium mb-2">Resultado del Conteo</h4>
                <div className="space-y-1 text-sm">
                  <p>Cantidad en Sistema: <span className="font-medium">{adjustmentResult.system_quantity}</span></p>
                  <p>Conteo Físico: <span className="font-medium">{adjustmentResult.physical_count}</span></p>
                  <p>Diferencia: <span className="font-medium">{adjustmentResult.difference}</span></p>
                  {adjustmentResult.message && (
                    <p className="mt-2 font-medium">{adjustmentResult.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || adjustmentResult}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Procesando...' : 'Procesar Conteo'}
              </button>
            </div>
          </form>
        )}
      </div>
      </div>
    </div>
  );
}