'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon, CheckIcon, BuildingOfficeIcon, CalendarIcon, ExclamationTriangleIcon, UserIcon, CubeIcon } from '@heroicons/react/24/outline';
import {
  ProductionOrder,
  CreateProductionOrderDto,
  UpdateProductionOrderDto,
  ProductionOrderPriority
} from '@/lib/types/production-orders';
import { Product } from '@/lib/types/products';
import { Bom, BomStatus } from '@/lib/types/boms';
import productsService from '@/lib/services/products.service';
import bomsService from '@/lib/services/boms.service';
import { toast } from 'sonner';

interface ProductionOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductionOrderDto | UpdateProductionOrderDto) => void;
  order?: ProductionOrder | null;
  mode: 'create' | 'edit';
}

export default function ProductionOrderModal({
  isOpen,
  onClose,
  onSubmit,
  order,
  mode
}: ProductionOrderModalProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [boms, setBoms] = useState<Bom[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeBom, setActiveBom] = useState<Bom | null>(null);

  const [formData, setFormData] = useState<CreateProductionOrderDto>({
    order_number: '',
    product_id: '',
    bom_id: '',
    planned_qty: 1,
    priority: ProductionOrderPriority.MEDIUM,
    planned_start_date: '',
    planned_end_date: '',
    description: '',
    work_center: '',
    shift: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen]);

  useEffect(() => {
    if (order && mode === 'edit') {
      setFormData({
        order_number: order.order_number,
        product_id: order.product_id,
        bom_id: order.bom_id,
        planned_qty: order.planned_qty,
        priority: order.priority,
        planned_start_date: order.planned_start_date.split('T')[0],
        planned_end_date: order.planned_end_date.split('T')[0],
        description: order.description || '',
        work_center: order.work_center || '',
        shift: order.shift || '',
        notes: order.notes || ''
      });
    } else if (!order && mode === 'create') {
      // Generar código automático
      const now = new Date();
      const order_number = `OP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

      setFormData({
        order_number,
        product_id: '',
        bom_id: '',
        planned_qty: 1,
        priority: ProductionOrderPriority.MEDIUM,
        planned_start_date: '',
        planned_end_date: '',
        description: '',
        work_center: '',
        shift: '',
        notes: ''
      });
      setActiveTab(0);
    }
  }, [order, mode]);

  useEffect(() => {
    if (formData.product_id) {
      loadBomForProduct(formData.product_id);
    }
  }, [formData.product_id]);

  const loadProducts = async () => {
    try {
      const response = await productsService.getProducts({
        limit: 100,
        type: 'PT' // Solo productos terminados
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadBomForProduct = async (productId: string) => {
    try {
      const response = await bomsService.findAll({
        product_id: productId,
        status: BomStatus.APPROVED,
        active_only: true
      });

      if (response.data.length > 0) {
        setBoms(response.data);
        setActiveBom(response.data[0]);
        setFormData(prev => ({
          ...prev,
          bom_id: response.data[0].id
        }));
      } else {
        setBoms([]);
        setActiveBom(null);
        toast.error('No hay BOM aprobado para este producto. Debe crear o aprobar un BOM primero.');
      }
    } catch (error) {
      console.error('Error loading BOMs:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (name === 'product_id') {
      const product = products.find(p => p.id === value);
      setSelectedProduct(product || null);
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const calculateEndDate = () => {
    if (!formData.planned_start_date || !formData.planned_qty) return;

    // Cálculo simplificado: 1 día por cada 100 unidades
    const daysNeeded = Math.ceil(formData.planned_qty / 100);
    const startDate = new Date(formData.planned_start_date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + daysNeeded);

    setFormData(prev => ({
      ...prev,
      planned_end_date: endDate.toISOString().split('T')[0]
    }));
  };

  const validateForm = () => {
    if (!formData.order_number || !formData.product_id || !formData.bom_id) {
      toast.error('Por favor complete los campos obligatorios');
      return false;
    }

    if (!formData.planned_start_date || !formData.planned_end_date) {
      toast.error('Por favor defina las fechas programadas');
      return false;
    }

    if (new Date(formData.planned_start_date) > new Date(formData.planned_end_date)) {
      toast.error('La fecha de inicio debe ser anterior a la fecha de fin');
      return false;
    }

    if (formData.planned_qty <= 0) {
      toast.error('La cantidad debe ser mayor a 0');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error saving production order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { name: 'Información General', icon: BuildingOfficeIcon },
    { name: 'Programación', icon: CalendarIcon },
    { name: 'Recursos', icon: UserIcon }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md transition-opacity" aria-hidden="true"></div>

        <div className="relative z-10 inline-block w-full max-w-4xl px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {mode === 'create' ? 'Crear Orden de Producción' : 'Editar Orden de Producción'}
            </h3>
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

          <form onSubmit={handleSubmit}>
            {/* Tab 0: Información General */}
            {activeTab === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Orden *
                  </label>
                  <input
                    type="text"
                    name="order_number"
                    value={formData.order_number}
                    onChange={handleInputChange}
                    required
                    disabled={mode === 'edit'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prioridad *
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={ProductionOrderPriority.LOW}>Baja</option>
                    <option value={ProductionOrderPriority.MEDIUM}>Media</option>
                    <option value={ProductionOrderPriority.HIGH}>Alta</option>
                    <option value={ProductionOrderPriority.URGENT}>Urgente</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Producto *
                  </label>
                  <select
                    name="product_id"
                    value={formData.product_id}
                    onChange={handleInputChange}
                    required
                    disabled={mode === 'edit'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">Seleccionar producto</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.code} - {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                {activeBom && (
                  <div className="md:col-span-2 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <CubeIcon className="h-4 w-4" />
                      <span className="font-medium">BOM Activo:</span>
                      <span>{activeBom.code} - v{activeBom.version}</span>
                      <span className="text-xs text-blue-600">
                        ({activeBom._count?.items || 0} componentes)
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cantidad a Producir *
                  </label>
                  <input
                    type="number"
                    name="planned_qty"
                    value={formData.planned_qty}
                    onChange={handleInputChange}
                    min="1"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Centro de Trabajo
                  </label>
                  <input
                    type="text"
                    name="work_center"
                    value={formData.work_center}
                    onChange={handleInputChange}
                    placeholder="Ej: Centro 1, Área A"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Descripción de la orden de producción..."
                  />
                </div>
              </div>
            )}

            {/* Tab 1: Programación */}
            {activeTab === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Inicio Programada *
                  </label>
                  <input
                    type="date"
                    name="planned_start_date"
                    value={formData.planned_start_date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Fin Programada *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      name="planned_end_date"
                      value={formData.planned_end_date}
                      onChange={handleInputChange}
                      required
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={calculateEndDate}
                      className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                      title="Calcular fecha fin automática"
                    >
                      Auto
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Turno
                  </label>
                  <select
                    name="shift"
                    value={formData.shift}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar turno</option>
                    <option value="MORNING">Matutino (6:00 - 14:00)</option>
                    <option value="AFTERNOON">Vespertino (14:00 - 22:00)</option>
                    <option value="NIGHT">Nocturno (22:00 - 6:00)</option>
                  </select>
                </div>

                {formData.planned_start_date && formData.planned_end_date && (
                  <div className="md:col-span-2 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Resumen de Programación</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Duración estimada:</span>
                        <span className="ml-2 font-medium">
                          {Math.ceil(
                            (new Date(formData.planned_end_date).getTime() -
                             new Date(formData.planned_start_date).getTime()) /
                            (1000 * 60 * 60 * 24)
                          )} días
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Producción diaria:</span>
                        <span className="ml-2 font-medium">
                          {Math.ceil(
                            formData.planned_qty /
                            Math.max(1, Math.ceil(
                              (new Date(formData.planned_end_date).getTime() -
                               new Date(formData.planned_start_date).getTime()) /
                              (1000 * 60 * 60 * 24)
                            ))
                          )} unidades/día
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Recursos */}
            {activeTab === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas Adicionales
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Instrucciones especiales, consideraciones, etc..."
                  />
                </div>

                {selectedProduct && (
                  <div className="md:col-span-2 p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-yellow-800 mb-1">
                          Consideraciones del Producto
                        </h4>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          {selectedProduct.requires_quality_control && (
                            <li>• Requiere control de calidad</li>
                          )}
                          {selectedProduct.expiration_control && (
                            <li>• Producto perecedero - Gestionar con prioridad</li>
                          )}
                          {selectedProduct.storage_conditions && (
                            <li>• {selectedProduct.storage_conditions}</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !activeBom}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <CheckIcon className="h-4 w-4" />
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}