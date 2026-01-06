'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { CreateMovementDto, MovementType } from '@/lib/types/inventory';
import { Product } from '@/lib/types/products';
import api from '@/lib/api';
import { toast } from 'sonner';

interface MovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  productId?: string;
  locationId?: string;
}

interface Location {
  id: string;
  code: string;
  name: string;
  type: string;
}

export default function MovementModal({
  isOpen,
  onClose,
  onSave,
  productId,
  locationId,
}: MovementModalProps) {
  const [formData, setFormData] = useState<CreateMovementDto>({
    product_id: productId || '',
    movement_type: MovementType.ENTRY,
    quantity: 0,
    from_location_id: '',
    to_location_id: locationId || '',
    batch_number: '',
    reference_document: '',
    notes: '',
    movement_date: new Date().toISOString().split('T')[0],
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
      fetchLocations();
      if (productId) {
        setFormData(prev => ({ ...prev, product_id: productId }));
      }
      if (locationId) {
        setFormData(prev => ({ ...prev, to_location_id: locationId }));
      }
    }
  }, [isOpen, productId, locationId]);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await api.get('/inventory/locations');
      setLocations(response.data);
    } catch (error) {
      console.error('Error fetching locations:', error);
      // If locations endpoint doesn't exist yet, use default location
      setLocations([
        { id: 'default', code: 'MAIN', name: 'Almacén Principal', type: 'WAREHOUSE' }
      ]);
    }
  };

  const movementTypeConfig = {
    [MovementType.ENTRY]: {
      label: 'Entrada',
      requiresFrom: false,
      requiresTo: true,
      color: 'text-green-600',
    },
    [MovementType.EXIT]: {
      label: 'Salida',
      requiresFrom: true,
      requiresTo: false,
      color: 'text-red-600',
    },
    [MovementType.TRANSFER]: {
      label: 'Transferencia',
      requiresFrom: true,
      requiresTo: true,
      color: 'text-blue-600',
    },
    [MovementType.ADJUSTMENT]: {
      label: 'Ajuste',
      requiresFrom: false,
      requiresTo: false,
      color: 'text-yellow-600',
    },
    [MovementType.PRODUCTION_ENTRY]: {
      label: 'Entrada Producción',
      requiresFrom: false,
      requiresTo: true,
      color: 'text-purple-600',
    },
    [MovementType.PRODUCTION_EXIT]: {
      label: 'Salida Producción',
      requiresFrom: true,
      requiresTo: false,
      color: 'text-purple-600',
    },
    [MovementType.PURCHASE_ENTRY]: {
      label: 'Entrada Compra',
      requiresFrom: false,
      requiresTo: true,
      color: 'text-indigo-600',
    },
    [MovementType.SALE_EXIT]: {
      label: 'Salida Venta',
      requiresFrom: true,
      requiresTo: false,
      color: 'text-orange-600',
    },
    [MovementType.RETURN]: {
      label: 'Devolución',
      requiresFrom: false,
      requiresTo: true,
      color: 'text-gray-600',
    },
    [MovementType.WASTE]: {
      label: 'Desperdicio',
      requiresFrom: true,
      requiresTo: false,
      color: 'text-red-800',
    },
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseFloat(value) || 0 : value,
    }));
    // Clear error for this field
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.product_id) {
      newErrors.product_id = 'El producto es requerido';
    }

    if (!formData.movement_type) {
      newErrors.movement_type = 'El tipo de movimiento es requerido';
    }

    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = 'La cantidad debe ser mayor a 0';
    }

    const config = movementTypeConfig[formData.movement_type];

    if (config.requiresFrom && !formData.from_location_id) {
      newErrors.from_location_id = 'La ubicación de origen es requerida';
    }

    if (config.requiresTo && !formData.to_location_id) {
      newErrors.to_location_id = 'La ubicación de destino es requerida';
    }

    if (formData.movement_type === MovementType.TRANSFER &&
        formData.from_location_id === formData.to_location_id) {
      newErrors.to_location_id = 'Las ubicaciones deben ser diferentes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await api.post('/inventory/movements', formData);
      onSave();
      handleClose();
    } catch (error: any) {
      console.error('Error creating movement:', error);
      if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error('Error al crear el movimiento');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      product_id: '',
      movement_type: MovementType.ENTRY,
      quantity: 0,
      from_location_id: '',
      to_location_id: '',
      batch_number: '',
      reference_document: '',
      notes: '',
      movement_date: new Date().toISOString().split('T')[0],
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  const currentConfig = movementTypeConfig[formData.movement_type];

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Registrar Movimiento de Inventario</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Product Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Producto *
              </label>
              <select
                name="product_id"
                value={formData.product_id}
                onChange={handleInputChange}
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

            {/* Movement Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Movimiento *
              </label>
              <select
                name="movement_type"
                value={formData.movement_type}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.movement_type ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {Object.entries(movementTypeConfig).map(([type, config]) => (
                  <option key={type} value={type}>
                    {config.label}
                  </option>
                ))}
              </select>
              {errors.movement_type && (
                <p className="text-red-500 text-xs mt-1">{errors.movement_type}</p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad *
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
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

            {/* Movement Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha del Movimiento
              </label>
              <input
                type="date"
                name="movement_date"
                value={formData.movement_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* From Location */}
            {currentConfig.requiresFrom && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicación de Origen *
                </label>
                <select
                  name="from_location_id"
                  value={formData.from_location_id}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.from_location_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar ubicación</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.code} - {location.name}
                    </option>
                  ))}
                </select>
                {errors.from_location_id && (
                  <p className="text-red-500 text-xs mt-1">{errors.from_location_id}</p>
                )}
              </div>
            )}

            {/* To Location */}
            {currentConfig.requiresTo && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicación de Destino *
                </label>
                <select
                  name="to_location_id"
                  value={formData.to_location_id}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.to_location_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={!!locationId && currentConfig.requiresTo && !currentConfig.requiresFrom}
                >
                  <option value="">Seleccionar ubicación</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.code} - {location.name}
                    </option>
                  ))}
                </select>
                {errors.to_location_id && (
                  <p className="text-red-500 text-xs mt-1">{errors.to_location_id}</p>
                )}
              </div>
            )}

            {/* Batch Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Lote
              </label>
              <input
                type="text"
                name="batch_number"
                value={formData.batch_number || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Opcional"
              />
            </div>

            {/* Reference Document */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Documento de Referencia
              </label>
              <input
                type="text"
                name="reference_document"
                value={formData.reference_document || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: OC-001, OP-001"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              name="notes"
              value={formData.notes || ''}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Observaciones adicionales..."
            />
          </div>

          {/* Movement Type Info */}
          <div className={`p-3 bg-gray-50 rounded-md border border-gray-200`}>
            <p className={`text-sm font-medium ${currentConfig.color}`}>
              Tipo de Movimiento: {currentConfig.label}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {currentConfig.requiresFrom && currentConfig.requiresTo &&
                'Este movimiento transferirá inventario de una ubicación a otra'}
              {currentConfig.requiresFrom && !currentConfig.requiresTo &&
                'Este movimiento reducirá el inventario de la ubicación de origen'}
              {!currentConfig.requiresFrom && currentConfig.requiresTo &&
                'Este movimiento aumentará el inventario en la ubicación de destino'}
              {!currentConfig.requiresFrom && !currentConfig.requiresTo &&
                'Este movimiento ajustará el inventario según la cantidad especificada'}
            </p>
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
              {isSubmitting ? 'Guardando...' : 'Guardar Movimiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}