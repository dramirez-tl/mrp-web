'use client';

import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon, CheckIcon, CalculatorIcon, CubeIcon, CurrencyDollarIcon, DocumentTextIcon, ChevronDownIcon, ChevronUpIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Bom, CreateBomDto, UpdateBomDto, BomItem } from '@/lib/types/boms';
import { Product, ProductType } from '@/lib/types/products';
import productsService from '@/lib/services/products.service';
import { toast } from 'sonner';

interface BomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBomDto | UpdateBomDto) => void;
  bom?: Bom | null;
  mode: 'create' | 'edit';
}

export default function BomModal({
  isOpen,
  onClose,
  onSubmit,
  bom,
  mode
}: BomModalProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState<CreateBomDto>({
    code: '',
    name: '',
    description: '',
    product_id: '',
    version: '1.0',
    batch_size: 1,
    batch_unit: 'PZ',
    labor_cost: 0,
    overhead_cost: 0,
    notes: '',
    items: []
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [components, setComponents] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isComponentSummaryOpen, setIsComponentSummaryOpen] = useState(true);
  const [componentSearchOpen, setComponentSearchOpen] = useState<{ [key: number]: boolean }>({});
  const [componentSearchQuery, setComponentSearchQuery] = useState<{ [key: number]: string }>({});
  const componentSearchRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.keys(componentSearchRefs.current).forEach(key => {
        const index = Number(key);
        if (
          componentSearchRefs.current[index] &&
          !componentSearchRefs.current[index]?.contains(event.target as Node)
        ) {
          setComponentSearchOpen(prev => ({ ...prev, [index]: false }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (bom && mode === 'edit') {
      // Cargar los componentes del BOM en el estado de components
      if (bom.items && bom.items.length > 0) {
        const bomComponents = bom.items
          .filter(item => item.component)
          .map(item => item.component as Product);

        // Combinar con los componentes ya cargados, evitando duplicados
        setComponents(prev => {
          const existingIds = new Set(prev.map(c => c.id));
          const newComponents = bomComponents.filter(c => !existingIds.has(c.id));
          return [...prev, ...newComponents];
        });
      }

      setFormData({
        code: bom.code,
        name: bom.name,
        description: bom.description || '',
        product_id: bom.product_id,
        version: bom.version,
        batch_size: bom.batch_size,
        batch_unit: bom.batch_unit,
        labor_cost: bom.labor_cost || 0,
        overhead_cost: bom.overhead_cost || 0,
        effective_date: bom.effective_date,
        expiration_date: bom.expiration_date,
        notes: bom.notes || '',
        items: bom.items?.map(item => ({
          component_id: item.component_id,
          quantity: item.quantity,
          scrap_rate: item.scrap_rate || 0,
          notes: item.notes || ''
        })) || []
      });
    } else if (!bom && mode === 'create') {
      setFormData({
        code: '',
        name: '',
        description: '',
        product_id: '',
        version: '1.0',
        batch_size: 1,
        batch_unit: 'PZ',
        labor_cost: 0,
        overhead_cost: 0,
        notes: '',
        items: []
      });
      setActiveTab(0);
    }
  }, [bom, mode]);

  const loadProducts = async () => {
    try {
      const response = await productsService.getProducts({
        limit: 100,
        type: ProductType.PT
      });
      setProducts(response.data);

      const componentsResponse = await productsService.getProducts({
        limit: 100
      });
      setComponents(componentsResponse.data.filter(p => p.type !== ProductType.PT));
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          component_id: '',
          quantity: 1,
          scrap_rate: 0,
          notes: ''
        }
      ]
    }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    let processedValue = value;

    // Solo convertir a número los campos numéricos
    if (field === 'quantity' || field === 'scrap_rate') {
      processedValue = parseFloat(value) || 0;
    }

    newItems[index] = {
      ...newItems[index],
      [field]: processedValue
    };
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateTotalCost = () => {
    let materialCost = 0;

    formData.items.forEach(item => {
      const component = components.find(c => c.id === item.component_id);
      if (component) {
        const quantity = Number(item.quantity) || 0;
        const scrapRate = Number(item.scrap_rate) || 0;
        const standardCost = Number(component.standard_cost) || Number(component.average_cost) || 0;
        const totalQuantity = quantity * (1 + scrapRate / 100);
        materialCost += totalQuantity * standardCost;
      }
    });

    const labor = Number(formData.labor_cost) || 0;
    const overhead = Number(formData.overhead_cost) || 0;

    return {
      material: Number(materialCost) || 0,
      labor: labor,
      overhead: overhead,
      total: Number(materialCost + labor + overhead) || 0
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.items.length === 0) {
      toast.error('Debe agregar al menos un componente al BOM');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error saving BOM:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { name: 'Información General', icon: DocumentTextIcon },
    { name: 'Componentes', icon: CubeIcon },
    { name: 'Costos', icon: CurrencyDollarIcon }
  ];

  const costs = calculateTotalCost();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen py-4">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md transition-opacity" aria-hidden="true"></div>

        <div className="relative z-10 w-full max-w-5xl bg-white shadow-xl flex flex-col rounded-lg" style={{ height: 'calc(100vh - 2rem)' }}>
          {/* Header fijo */}
          <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {mode === 'create' ? 'Crear BOM' : 'Editar BOM'}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Tabs */}
            <nav className="flex space-x-8">
              {tabs.map((tab, index) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={index}
                    type="button"
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

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">{/* Contenido con scroll */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
            {/* Tab 0: Información General */}
            {activeTab === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código *
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    required
                    placeholder="BOM-9019"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">Identificador único del BOM (ej: BOM-9019)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="BOM Jimmy Coffee 270g"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">Nombre descriptivo de la lista de materiales</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Producto *
                  </label>
                  <select
                    name="product_id"
                    value={formData.product_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar producto</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.code} - {product.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">Producto terminado que se fabrica con este BOM</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Versión *
                  </label>
                  <input
                    type="text"
                    name="version"
                    value={formData.version}
                    onChange={handleInputChange}
                    required
                    placeholder="1.0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">Versión del BOM (ej: 1.0, 1.1, 2.0)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tamaño de Lote *
                  </label>
                  <input
                    type="number"
                    name="batch_size"
                    value={formData.batch_size}
                    onChange={handleInputChange}
                    min="0.01"
                    step="0.01"
                    required
                    placeholder="1000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">Cantidad de salida del lote de producción</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unidad de Lote *
                  </label>
                  <select
                    name="batch_unit"
                    value={formData.batch_unit}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="PZ">Pieza (PZ)</option>
                    <option value="KG">Kilogramo (KG)</option>
                    <option value="G">Gramo (G)</option>
                    <option value="L">Litro (L)</option>
                    <option value="ML">Mililitro (ML)</option>
                    <option value="CAP">Cápsula (CAP)</option>
                    <option value="TAB">Tableta (TAB)</option>
                    <option value="BOX">Caja (BOX)</option>
                    <option value="BAG">Bolsa (BAG)</option>
                    <option value="BTL">Botella (BTL)</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">Unidad de medida del lote de producción</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Inicio de Vigencia
                  </label>
                  <input
                    type="date"
                    name="effective_date"
                    value={formData.effective_date || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">Fecha desde la cual este BOM es válido</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Fin de Vigencia
                  </label>
                  <input
                    type="date"
                    name="expiration_date"
                    value={formData.expiration_date || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">Fecha hasta la cual este BOM es válido (opcional)</p>
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
                    placeholder="Descripción detallada del BOM..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">Descripción detallada del proceso de fabricación</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Notas adicionales..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">Notas o consideraciones especiales</p>
                </div>
              </div>
            )}

            {/* Tab 1: Componentes */}
            {activeTab === 1 && (
              <div className="h-full flex flex-col">
                <div className="mb-6 flex justify-between items-center">
                  <div>
                    <h4 className="text-base font-semibold text-gray-900">
                      Componentes del BOM
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Agrega las materias primas y materiales de empaque necesarios
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm"
                  >
                    <PlusIcon className="h-5 w-5" />
                    Agregar Componente
                  </button>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                  {formData.items.map((item, index) => (
                    <div key={index} className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-colors shadow-sm">
                      {/* Header del componente con número y botón eliminar */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-blue-700">#{index + 1}</span>
                          </div>
                          <span className="text-sm font-medium text-gray-700">Componente {index + 1}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar componente"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        {/* Selector de componente - ancho completo */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Componente *
                          </label>
                          <div className="relative" ref={(el) => { componentSearchRefs.current[index] = el; }}>
                            <button
                              type="button"
                              onClick={() => setComponentSearchOpen(prev => ({ ...prev, [index]: !prev[index] }))}
                              className="w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-lg text-left bg-white hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between transition-colors"
                            >
                              <span className={item.component_id ? "text-gray-900" : "text-gray-500"}>
                                {item.component_id
                                  ? `${components.find(c => c.id === item.component_id)?.code} - ${components.find(c => c.id === item.component_id)?.name}`
                                  : "Seleccionar componente..."
                                }
                              </span>
                              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                            </button>

                            {componentSearchOpen[index] && (
                              <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
                                <div className="p-2 border-b border-gray-200">
                                  <input
                                    type="text"
                                    placeholder="Buscar por código o nombre..."
                                    value={componentSearchQuery[index] || ''}
                                    onChange={(e) => setComponentSearchQuery(prev => ({ ...prev, [index]: e.target.value }))}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    autoFocus
                                  />
                                </div>
                                <div className="max-h-48 overflow-y-auto">
                                  {components
                                    .filter(comp => {
                                      const query = (componentSearchQuery[index] || '').toLowerCase();
                                      return comp.code.toLowerCase().includes(query) ||
                                             comp.name.toLowerCase().includes(query);
                                    })
                                    .map(comp => (
                                      <button
                                        key={comp.id}
                                        type="button"
                                        onClick={() => {
                                          handleItemChange(index, 'component_id', comp.id);
                                          setComponentSearchOpen(prev => ({ ...prev, [index]: false }));
                                          setComponentSearchQuery(prev => ({ ...prev, [index]: '' }));
                                        }}
                                        className="w-full px-3 py-2 text-sm text-left hover:bg-blue-50 flex items-center justify-between group"
                                      >
                                        <div>
                                          <div className="font-medium text-gray-900">{comp.code}</div>
                                          <div className="text-xs text-gray-500">{comp.name}</div>
                                        </div>
                                        <div className="text-xs text-gray-400">
                                          {comp.inventory_unit}
                                        </div>
                                      </button>
                                    ))}
                                  {components.filter(comp => {
                                    const query = (componentSearchQuery[index] || '').toLowerCase();
                                    return comp.code.toLowerCase().includes(query) ||
                                           comp.name.toLowerCase().includes(query);
                                  }).length === 0 && (
                                    <div className="px-3 py-4 text-sm text-center text-gray-500">
                                      No se encontraron componentes
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          <p className="mt-2 text-xs text-gray-500">Materia prima o material de empaque</p>
                        </div>

                        {/* Grid de cantidad y merma */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Cantidad *
                              {item.component_id && components.find(c => c.id === item.component_id)?.inventory_unit && (
                                <span className="ml-2 text-xs text-gray-500 font-normal">
                                  ({components.find(c => c.id === item.component_id)?.inventory_unit})
                                </span>
                              )}
                            </label>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                              min="0.01"
                              step="0.01"
                              required
                              placeholder="0.270"
                              className="w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                            <p className="mt-2 text-xs text-gray-500">
                              Cantidad necesaria por unidad
                              {item.component_id && components.find(c => c.id === item.component_id)?.inventory_unit && (
                                <span className="font-medium"> en {components.find(c => c.id === item.component_id)?.inventory_unit}</span>
                              )}
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Merma (%)
                            </label>
                            <input
                              type="number"
                              value={item.scrap_rate}
                              onChange={(e) => handleItemChange(index, 'scrap_rate', e.target.value)}
                              min="0"
                              step="0.1"
                              placeholder="0"
                              className="w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                            <p className="mt-2 text-xs text-gray-500">Porcentaje de desperdicio esperado</p>
                          </div>
                        </div>

                        {/* Notas */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Notas
                          </label>
                          <input
                            type="text"
                            value={item.notes || ''}
                            onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                            className="w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            placeholder="Ej: Ingrediente principal, Sustituible por alternativa orgánica..."
                          />
                          <p className="mt-2 text-xs text-gray-500">Comentarios o consideraciones especiales (opcional)</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {formData.items.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <CubeIcon className="h-10 w-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No hay componentes agregados</h3>
                      <p className="text-sm text-gray-500 mb-6 max-w-sm">
                        Comienza agregando las materias primas y materiales de empaque necesarios para este producto
                      </p>
                      <button
                        type="button"
                        onClick={handleAddItem}
                        className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm"
                      >
                        <PlusIcon className="h-5 w-5" />
                        Agregar Primer Componente
                      </button>
                    </div>
                  )}
                </div>

                {/* Resumen de Componentes */}
                {formData.items.length > 0 && (() => {
                  // Calcular totales por unidad de medida
                  const totalsByUnit: { [unit: string]: { base: number; withScrap: number } } = {};

                  formData.items.forEach(item => {
                    const component = components.find(c => c.id === item.component_id);
                    if (!component) return;

                    const unit = component.inventory_unit || component.unit_measure || 'N/A';
                    if (!unit) return; // Skip if no unit is defined

                    if (!totalsByUnit[unit]) {
                      totalsByUnit[unit] = { base: 0, withScrap: 0 };
                    }

                    const quantity = Number(item.quantity) || 0;
                    const scrapRate = Number(item.scrap_rate) || 0;

                    totalsByUnit[unit].base += quantity;
                    totalsByUnit[unit].withScrap += quantity * (1 + scrapRate / 100);
                  });

                  return (
                    <div className="mt-4 bg-blue-50 rounded-lg border border-blue-200">
                      <button
                        type="button"
                        onClick={() => setIsComponentSummaryOpen(!isComponentSummaryOpen)}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-blue-100 transition-colors rounded-t-lg"
                      >
                        <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          <CubeIcon className="h-4 w-4 text-blue-600" />
                          Resumen de Componentes
                        </h4>
                        {isComponentSummaryOpen ? (
                          <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                        )}
                      </button>

                      {isComponentSummaryOpen && (
                        <div className="px-4 pb-4 space-y-2">
                        {formData.items.map((item, index) => {
                          const component = components.find(c => c.id === item.component_id);
                          if (!component) return null;

                          const quantityWithScrap = item.quantity * (1 + (item.scrap_rate || 0) / 100);

                          return (
                            <div key={index} className="flex justify-between items-center text-sm">
                              <span className="text-gray-700">
                                {component.code} - {component.name}:
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-900 font-medium">
                                  {item.quantity} {component.inventory_unit || component.unit_measure || 'N/A'}
                                </span>
                                {(item.scrap_rate ?? 0) > 0 && (
                                  <span className="text-xs text-gray-500">
                                    (+{item.scrap_rate}% merma = {quantityWithScrap.toFixed(3)} {component.inventory_unit || component.unit_measure || 'N/A'})
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        <div className="border-t border-blue-300 pt-2 mt-2 space-y-1">
                          <p className="text-xs text-gray-600">
                            Número de componentes: {formData.items.length}
                          </p>
                          {Object.entries(totalsByUnit).map(([unit, totals]) => {
                            const base = Number(totals?.base) || 0;
                            const withScrap = Number(totals?.withScrap) || 0;
                            return (
                              <div key={unit} className="flex justify-between items-center">
                                <span className="text-sm text-gray-700">Total en {unit}:</span>
                                <div className="text-sm">
                                  <span className="font-medium text-blue-900">{base.toFixed(3)} {unit}</span>
                                  {withScrap > base && (
                                    <span className="text-xs text-gray-600 ml-2">
                                      (con merma: {withScrap.toFixed(3)} {unit})
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Tab 2: Costos */}
            {activeTab === 2 && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Costo de Mano de Obra
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        name="labor_cost"
                        value={formData.labor_cost}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Costo de trabajo humano para fabricar una unidad</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gastos Generales
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        name="overhead_cost"
                        value={formData.overhead_cost}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Costos indirectos (energía, depreciación, etc.)</p>
                  </div>
                </div>

                {/* Resumen de Costos */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <CalculatorIcon className="h-4 w-4" />
                    Resumen de Costos
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Costo de Materiales:</span>
                      <span className="text-sm font-medium text-gray-900">
                        ${costs.material.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Costo de Mano de Obra:</span>
                      <span className="text-sm font-medium text-gray-900">
                        ${costs.labor.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Gastos Generales:</span>
                      <span className="text-sm font-medium text-gray-900">
                        ${costs.overhead.toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">Costo Total:</span>
                        <span className="text-lg font-bold text-blue-600">
                          ${costs.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            </div>

            {/* Footer fijo con botones de acción */}
            <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <CheckIcon className="h-4 w-4" />
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}