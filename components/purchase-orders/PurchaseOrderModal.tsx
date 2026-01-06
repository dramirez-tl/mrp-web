'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon, CalculatorIcon } from '@heroicons/react/24/outline';
import {
  PurchaseOrder,
  CreatePurchaseOrderDto,
  CreatePurchaseOrderItemDto,
  PurchaseOrderStatus,
} from '@/lib/types/purchase-order';
import { Product } from '@/lib/types/products';
import { Supplier } from '@/lib/types/suppliers';
import api from '@/lib/services/api';
import { toast } from 'sonner';

interface PurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  order: PurchaseOrder | null;
}

export default function PurchaseOrderModal({
  isOpen,
  onClose,
  onSave,
  order,
}: PurchaseOrderModalProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'items' | 'notes'>('general');
  const [formData, setFormData] = useState<CreatePurchaseOrderDto>({
    supplier_id: '',
    status: PurchaseOrderStatus.DRAFT,
    order_date: new Date().toISOString().split('T')[0],
    expected_date: '',
    payment_terms: '',
    notes: '',
    items: [],
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Totals calculation
  const [totals, setTotals] = useState({
    subtotal: 0,
    tax: 0,
    total: 0,
  });

  useEffect(() => {
    if (isOpen) {
      fetchSuppliers();
      fetchProducts();

      if (order) {
        // Edit mode - populate form with existing order data
        setFormData({
          supplier_id: order.supplier_id,
          status: order.status,
          order_date: order.order_date.split('T')[0],
          expected_date: order.expected_date?.split('T')[0] || '',
          payment_terms: order.payment_terms || '',
          notes: order.notes || '',
          items: order.purchase_order_items.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            discount: item.discount,
            tax_rate: item.tax_rate,
            notes: item.notes,
          })),
        });
      } else {
        // Create mode - reset form
        resetForm();
      }
    }
  }, [isOpen, order]);

  useEffect(() => {
    calculateTotals();
  }, [formData.items]);

  const fetchSuppliers = async () => {
    try {
      const response = await api.get('/suppliers');
      // La respuesta es { data: Supplier[], meta: {...} }
      setSuppliers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast.error('Error al cargar proveedores');
      setSuppliers([]);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products', {
        params: { type: 'MP' }
      });
      // La respuesta es { data: Product[], meta: {...} }
      setProducts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error al cargar productos');
      setProducts([]);
    }
  };

  const resetForm = () => {
    setFormData({
      supplier_id: '',
      status: PurchaseOrderStatus.DRAFT,
      order_date: new Date().toISOString().split('T')[0],
      expected_date: '',
      payment_terms: '',
      notes: '',
      items: [],
    });
    setErrors({});
    setActiveTab('general');
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let tax = 0;

    formData.items.forEach(item => {
      const itemSubtotal = item.quantity * item.unit_price * (1 - (item.discount || 0) / 100);
      const itemTax = itemSubtotal * (item.tax_rate || 0) / 100;

      subtotal += itemSubtotal;
      tax += itemTax;
    });

    setTotals({
      subtotal,
      tax,
      total: subtotal + tax,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          product_id: '',
          quantity: 1,
          unit_price: 0,
          discount: 0,
          tax_rate: 16,
          notes: '',
        },
      ],
    }));
  };

  const updateItem = (index: number, field: keyof CreatePurchaseOrderItemDto, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };

          // Auto-fill unit price when product is selected
          if (field === 'product_id' && value) {
            const product = products.find(p => p.id === value);
            if (product) {
              updatedItem.unit_price = product.standard_cost || 0;
            }
          }

          return updatedItem;
        }
        return item;
      }),
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.supplier_id) {
      newErrors.supplier_id = 'El proveedor es requerido';
    }

    if (formData.items.length === 0) {
      newErrors.items = 'Debe agregar al menos un producto';
    }

    formData.items.forEach((item, index) => {
      if (!item.product_id) {
        newErrors[`item_${index}_product`] = 'El producto es requerido';
      }
      if (item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = 'La cantidad debe ser mayor a 0';
      }
      if (item.unit_price < 0) {
        newErrors[`item_${index}_price`] = 'El precio no puede ser negativo';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Switch to items tab if there are item errors
      if (Object.keys(errors).some(key => key.startsWith('item_'))) {
        setActiveTab('items');
      }
      return;
    }

    setIsSubmitting(true);
    try {
      if (order) {
        // Update existing order
        await api.patch(`/purchase-orders/${order.id}`, formData);
      } else {
        // Create new order
        await api.post('/purchase-orders', formData);
      }
      onSave();
      handleClose();
    } catch (error: any) {
      console.error('Error saving purchase order:', error);
      if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error('Error al guardar la orden de compra');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value);
  };

  if (!isOpen) return null;

  const isEditMode = !!order;
  const canEdit = !order || [PurchaseOrderStatus.DRAFT, PurchaseOrderStatus.PENDING_APPROVAL].includes(order.status);

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {isEditMode ? `Editar Orden ${order.order_number}` : 'Nueva Orden de Compra'}
          </h2>
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
            onClick={() => setActiveTab('general')}
            className={`pb-2 px-1 ${
              activeTab === 'general'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500'
            }`}
          >
            Información General
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={`pb-2 px-1 ${
              activeTab === 'items'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500'
            }`}
          >
            Productos ({formData.items.length})
            {errors.items && <span className="text-red-500 ml-1">*</span>}
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`pb-2 px-1 ${
              activeTab === 'notes'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500'
            }`}
          >
            Notas y Condiciones
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          {/* General Information Tab */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Supplier */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proveedor *
                  </label>
                  <select
                    name="supplier_id"
                    value={formData.supplier_id}
                    onChange={handleInputChange}
                    disabled={!canEdit}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      errors.supplier_id ? 'border-red-500' : 'border-gray-300'
                    } ${!canEdit ? 'bg-gray-100' : ''}`}
                  >
                    <option value="">Seleccionar proveedor</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.code} - {supplier.name}
                      </option>
                    ))}
                  </select>
                  {errors.supplier_id && (
                    <p className="text-red-500 text-xs mt-1">{errors.supplier_id}</p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    disabled={!canEdit}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      !canEdit ? 'bg-gray-100' : ''
                    }`}
                  >
                    <option value={PurchaseOrderStatus.DRAFT}>Borrador</option>
                    <option value={PurchaseOrderStatus.PENDING_APPROVAL}>Pendiente Aprobación</option>
                    {isEditMode && (
                      <>
                        <option value={PurchaseOrderStatus.APPROVED}>Aprobada</option>
                        <option value={PurchaseOrderStatus.SENT}>Enviada</option>
                        <option value={PurchaseOrderStatus.PARTIALLY_RECEIVED}>Parcialmente Recibida</option>
                        <option value={PurchaseOrderStatus.COMPLETED}>Completada</option>
                        <option value={PurchaseOrderStatus.CANCELLED}>Cancelada</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Order Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Orden
                  </label>
                  <input
                    type="date"
                    name="order_date"
                    value={formData.order_date}
                    onChange={handleInputChange}
                    disabled={!canEdit}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      !canEdit ? 'bg-gray-100' : ''
                    }`}
                  />
                </div>

                {/* Expected Delivery Date */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Esperada de Entrega
                  </label>
                  <input
                    type="date"
                    name="expected_date"
                    value={formData.expected_date}
                    onChange={handleInputChange}
                    disabled={!canEdit}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      !canEdit ? 'bg-gray-100' : ''
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Items Tab */}
          {activeTab === 'items' && (
            <div className="space-y-4">
              {errors.items && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {errors.items}
                </div>
              )}

              {canEdit && (
                <button
                  type="button"
                  onClick={addItem}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  Agregar Producto
                </button>
              )}

              {formData.items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay productos agregados. Haga clic en "Agregar Producto" para comenzar.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Producto
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                          Cantidad
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                          Precio Unit.
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                          Desc. %
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                          IVA %
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                          Subtotal
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                          Total
                        </th>
                        {canEdit && (
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                            Acciones
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {formData.items.map((item, index) => {
                        const subtotal = item.quantity * item.unit_price * (1 - (item.discount || 0) / 100);
                        const tax = subtotal * (item.tax_rate || 0) / 100;
                        const total = subtotal + tax;

                        return (
                          <tr key={index}>
                            <td className="px-4 py-2">
                              <select
                                value={item.product_id}
                                onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                                disabled={!canEdit}
                                className={`w-full px-2 py-1 border rounded text-sm ${
                                  errors[`item_${index}_product`] ? 'border-red-500' : 'border-gray-300'
                                } ${!canEdit ? 'bg-gray-100' : ''}`}
                              >
                                <option value="">Seleccionar...</option>
                                {products.map((product) => (
                                  <option key={product.id} value={product.id}>
                                    {product.code} - {product.name}
                                  </option>
                                ))}
                              </select>
                              {errors[`item_${index}_product`] && (
                                <p className="text-red-500 text-xs mt-1">{errors[`item_${index}_product`]}</p>
                              )}
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                disabled={!canEdit}
                                min="0"
                                step="0.01"
                                className={`w-20 px-2 py-1 border rounded text-sm text-center ${
                                  errors[`item_${index}_quantity`] ? 'border-red-500' : 'border-gray-300'
                                } ${!canEdit ? 'bg-gray-100' : ''}`}
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                value={item.unit_price}
                                onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                disabled={!canEdit}
                                min="0"
                                step="0.01"
                                className={`w-24 px-2 py-1 border rounded text-sm text-center ${
                                  errors[`item_${index}_price`] ? 'border-red-500' : 'border-gray-300'
                                } ${!canEdit ? 'bg-gray-100' : ''}`}
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                value={item.discount || 0}
                                onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                                disabled={!canEdit}
                                min="0"
                                max="100"
                                step="0.01"
                                className={`w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center ${
                                  !canEdit ? 'bg-gray-100' : ''
                                }`}
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                value={item.tax_rate || 0}
                                onChange={(e) => updateItem(index, 'tax_rate', parseFloat(e.target.value) || 0)}
                                disabled={!canEdit}
                                min="0"
                                max="100"
                                step="0.01"
                                className={`w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center ${
                                  !canEdit ? 'bg-gray-100' : ''
                                }`}
                              />
                            </td>
                            <td className="px-4 py-2 text-center text-sm">
                              {formatCurrency(subtotal)}
                            </td>
                            <td className="px-4 py-2 text-center text-sm font-medium">
                              {formatCurrency(total)}
                            </td>
                            {canEdit && (
                              <td className="px-4 py-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => removeItem(index)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Order Totals */}
              {formData.items.length > 0 && (
                <div className="mt-6 border-t pt-4">
                  <div className="flex justify-end">
                    <div className="w-64">
                      <div className="flex justify-between py-2">
                        <span>Subtotal:</span>
                        <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span>IVA:</span>
                        <span className="font-medium">{formatCurrency(totals.tax)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-t font-bold">
                        <span>Total:</span>
                        <span>{formatCurrency(totals.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              {/* Payment Terms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Términos de Pago
                </label>
                <input
                  type="text"
                  name="payment_terms"
                  value={formData.payment_terms}
                  onChange={handleInputChange}
                  disabled={!canEdit}
                  placeholder="Ej: 30 días, Contado, 50% anticipo..."
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    !canEdit ? 'bg-gray-100' : ''
                  }`}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas / Observaciones
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  disabled={!canEdit}
                  rows={6}
                  placeholder="Instrucciones especiales, observaciones, etc..."
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    !canEdit ? 'bg-gray-100' : ''
                  }`}
                />
              </div>
            </div>
          )}
        </form>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          {canEdit && (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : isEditMode ? 'Actualizar Orden' : 'Crear Orden'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}