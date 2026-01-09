import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import {
  Product,
  ProductType,
  ProductStatus,
  ProductPresentation,
  UnitMeasure,
  ProductCategory,
  CreateProductRequest,
  UpdateProductRequest
} from '@/lib/types/products';
import productsService from '@/lib/services/products.service';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateProductRequest | UpdateProductRequest) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<any>({
    code: '',
    barcode: '',
    name: '',
    description: '',
    type: ProductType.PT,
    category_id: '',
    presentation: ProductPresentation.OTHER,
    status: ProductStatus.ACTIVE,

    // Unidades (nuevos campos requeridos)
    purchase_unit: UnitMeasure.PZ,
    inventory_unit: UnitMeasure.PZ,
    conversion_factor: 1,

    // Campos físicos
    unit_weight: '',
    unit_volume: '',
    units_per_package: '',

    // Inventario
    min_stock: '',
    max_stock: '',
    reorder_point: '',
    safety_stock: '',
    lead_time_days: '',

    // Calidad y almacenamiento
    shelf_life_days: '',
    quarantine_days: '',
    requires_quality_control: false,
    sampling_plan: '',
  });

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [activeTab, setActiveTab] = useState('basic');
  const [errors, setErrors] = useState<any>({});
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        code: product.code || '',
        barcode: product.barcode || '',
        name: product.name || '',
        description: product.description || '',
        type: product.type || ProductType.PT,
        category_id: product.category_id || '',
        presentation: product.presentation || ProductPresentation.OTHER,
        status: product.status || ProductStatus.ACTIVE,

        // Unidades
        purchase_unit: product.purchase_unit || UnitMeasure.PZ,
        inventory_unit: product.inventory_unit || UnitMeasure.PZ,
        conversion_factor: product.conversion_factor || 1,

        // Campos físicos
        unit_weight: product.unit_weight || '',
        unit_volume: product.unit_volume || '',
        units_per_package: product.units_per_package || '',

        // Inventario
        min_stock: product.min_stock || '',
        max_stock: product.max_stock || '',
        reorder_point: product.reorder_point || '',
        safety_stock: product.safety_stock || '',
        lead_time_days: product.lead_time_days || '',

        // Calidad y almacenamiento
        shelf_life_days: product.shelf_life_days || '',
        quarantine_days: product.quarantine_days || '',
        requires_quality_control: product.requires_quality_control || false,
        sampling_plan: product.sampling_plan || '',
      });
    }
    fetchCategories();
  }, [product]);

  const fetchCategories = async () => {
    try {
      const data = await productsService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev: any) => ({
        ...prev,
        [name]: checked
      }));
    } else if (type === 'number') {
      setFormData((prev: any) => ({
        ...prev,
        [name]: value ? parseFloat(value) : ''
      }));
    } else {
      setFormData((prev: any) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validate = () => {
    const newErrors: any = {};

    if (!formData.code) newErrors.code = 'El código es requerido';
    if (!formData.name) newErrors.name = 'El nombre es requerido';
    if (!formData.type) newErrors.type = 'El tipo es requerido';
    if (!formData.purchase_unit) newErrors.purchase_unit = 'La unidad de compra es requerida';
    if (!formData.inventory_unit) newErrors.inventory_unit = 'La unidad de inventario es requerida';
    if (!formData.conversion_factor || formData.conversion_factor < 0.0001) {
      newErrors.conversion_factor = 'El factor de conversión debe ser mayor o igual a 0.0001';
    }

    if (formData.min_stock && formData.max_stock) {
      if (parseFloat(formData.min_stock) > parseFloat(formData.max_stock)) {
        newErrors.min_stock = 'El stock mínimo no puede ser mayor al máximo';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const data: any = { ...formData };

    // Convertir campos numéricos opcionales vacíos a undefined
    const optionalNumericFields = [
      'unit_weight', 'unit_volume', 'units_per_package',
      'min_stock', 'max_stock', 'reorder_point', 'safety_stock',
      'lead_time_days', 'shelf_life_days', 'quarantine_days'
    ];

    optionalNumericFields.forEach(field => {
      if (data[field] === '' || data[field] === null) {
        data[field] = undefined;
      } else if (data[field]) {
        data[field] = parseFloat(data[field]);
      }
    });

    // Asegurar que conversion_factor siempre sea número
    if (data.conversion_factor) {
      data.conversion_factor = parseFloat(data.conversion_factor);
    }

    // Limpiar campos vacíos (convertir strings vacíos a undefined o null según el campo)
    Object.keys(data).forEach(key => {
      if (data[key] === '') {
        // category_id debe ser null si está vacío, no undefined
        if (key === 'category_id') {
          data[key] = null;
        } else {
          data[key] = undefined;
        }
      }
    });

    // Remover campos undefined para no enviarlos al backend (pero mantener null)
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined)
    );

    console.log('Datos limpios a enviar:', cleanData);

    onSave(cleanData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md transition-opacity" />

        <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-xl dark:shadow-gray-900/50 transition-all max-w-4xl w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {product ? 'Editar Producto' : 'Nuevo Producto'}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8 px-6">
                <button
                  type="button"
                  onClick={() => setActiveTab('basic')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'basic'
                      ? 'border-[#7cb342] text-[#7cb342]'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  Información Básica
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('inventory')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'inventory'
                      ? 'border-[#7cb342] text-[#7cb342]'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  Inventario y Logística
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('quality')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'quality'
                      ? 'border-[#7cb342] text-[#7cb342]'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  Calidad y Almacenamiento
                </button>
              </nav>
            </div>

            <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
              {/* Tab: Información Básica */}
              {activeTab === 'basic' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Código *
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 ${
                        errors.code
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300 dark:border-gray-600 focus:border-[#7cb342] focus:ring-[#7cb342] bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                      placeholder="MP694"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Identificador único del producto</p>
                    {errors.code && (
                      <p className="mt-1 text-sm text-red-600">{errors.code}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Código de Barras
                    </label>
                    <input
                      type="text"
                      name="barcode"
                      value={formData.barcode}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7cb342] focus:ring-[#7cb342] px-3 py-2"
                      placeholder="7501234567890"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Código de barras EAN/UPC (opcional)</p>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 ${
                        errors.name
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300 dark:border-gray-600 focus:border-[#7cb342] focus:ring-[#7cb342] bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                      placeholder="CAFÉ SOLUBLE, POLVO"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Nombre descriptivo del producto</p>
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Descripción
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7cb342] focus:ring-[#7cb342] px-3 py-2"
                      placeholder="Café soluble en polvo para fórmulas"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Descripción detallada del producto y sus características</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Tipo *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7cb342] focus:ring-[#7cb342] px-3 py-2"
                    >
                      <option value={ProductType.PT}>Producto Terminado</option>
                      <option value={ProductType.MP}>Materia Prima</option>
                      <option value={ProductType.ME}>Material de Empaque</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Clasificación del producto en el sistema</p>
                  </div>

                  <div className="relative" ref={categoryDropdownRef}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Categoría
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                      className="mt-1 w-full flex items-center justify-between rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-3 py-2 bg-white dark:bg-gray-700 text-left focus:outline-none focus:ring-1 focus:ring-[#7cb342] focus:border-[#7cb342]"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        {formData.category_id ? (
                          <>
                            {categories.find(c => c.id === formData.category_id)?.icon && (
                              <span className="text-base">
                                {categories.find(c => c.id === formData.category_id)?.icon}
                              </span>
                            )}
                            <span
                              className="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                              style={{
                                backgroundColor: `${categories.find(c => c.id === formData.category_id)?.color}20`,
                                color: categories.find(c => c.id === formData.category_id)?.color,
                              }}
                            >
                              {categories.find(c => c.id === formData.category_id)?.name}
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">Sin categoría</span>
                        )}
                      </div>
                      <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform ${isCategoryDropdownOpen ? 'transform rotate-180' : ''}`} />
                    </button>

                    {isCategoryDropdownOpen && (
                      <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg dark:shadow-gray-900/50 max-h-60 overflow-auto">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev: any) => ({ ...prev, category_id: '' }));
                            setIsCategoryDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 text-sm transition-colors"
                        >
                          Sin categoría
                        </button>
                        {categories.map((category) => (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => {
                              setFormData((prev: any) => ({ ...prev, category_id: category.id }));
                              setIsCategoryDropdownOpen(false);
                            }}
                            className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2 transition-colors"
                          >
                            {category.icon && (
                              <span className="text-base">{category.icon}</span>
                            )}
                            <span
                              className="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                              style={{
                                backgroundColor: `${category.color}20`,
                                color: category.color,
                              }}
                            >
                              {category.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Categoría para organizar el producto</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Presentación
                    </label>
                    <select
                      name="presentation"
                      value={formData.presentation}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7cb342] focus:ring-[#7cb342] px-3 py-2"
                    >
                      <option value={ProductPresentation.CAPSULE}>Cápsula</option>
                      <option value={ProductPresentation.TABLET}>Tableta</option>
                      <option value={ProductPresentation.POWDER}>Polvo</option>
                      <option value={ProductPresentation.LIQUID}>Líquido</option>
                      <option value={ProductPresentation.CREAM}>Crema</option>
                      <option value={ProductPresentation.GEL}>Gel</option>
                      <option value={ProductPresentation.INJECTION}>Inyección</option>
                      <option value={ProductPresentation.OTHER}>Otro</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Forma física del producto</p>
                  </div>

                  {product && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Estado
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7cb342] focus:ring-[#7cb342] px-3 py-2"
                      >
                        <option value={ProductStatus.ACTIVE}>Activo</option>
                        <option value={ProductStatus.INACTIVE}>Inactivo</option>
                        <option value={ProductStatus.DISCONTINUED}>Descontinuado</option>
                      </select>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Estado actual del producto</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Unidad de Compra *
                    </label>
                    <select
                      name="purchase_unit"
                      value={formData.purchase_unit}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 ${
                        errors.purchase_unit
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300 dark:border-gray-600 focus:border-[#7cb342] focus:ring-[#7cb342] bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      <optgroup label="Peso">
                        <option value={UnitMeasure.MG}>Miligramos (MG)</option>
                        <option value={UnitMeasure.G}>Gramos (G)</option>
                        <option value={UnitMeasure.KG}>Kilogramos (KG)</option>
                        <option value={UnitMeasure.LB}>Libras (LB)</option>
                        <option value={UnitMeasure.OZ}>Onzas (OZ)</option>
                      </optgroup>
                      <optgroup label="Volumen">
                        <option value={UnitMeasure.ML}>Mililitros (ML)</option>
                        <option value={UnitMeasure.L}>Litros (L)</option>
                        <option value={UnitMeasure.GAL}>Galones (GAL)</option>
                      </optgroup>
                      <optgroup label="Unidades">
                        <option value={UnitMeasure.PZ}>Pieza (PZ)</option>
                        <option value={UnitMeasure.CAP}>Cápsula (CAP)</option>
                        <option value={UnitMeasure.TAB}>Tableta (TAB)</option>
                        <option value={UnitMeasure.BOX}>Caja (BOX)</option>
                        <option value={UnitMeasure.BAG}>Bolsa (BAG)</option>
                        <option value={UnitMeasure.BTL}>Botella (BTL)</option>
                        <option value={UnitMeasure.PKT}>Paquete (PKT)</option>
                        <option value={UnitMeasure.PAL}>Pallet (PAL)</option>
                      </optgroup>
                      <optgroup label="Otros">
                        <option value={UnitMeasure.MT}>Metro (MT)</option>
                        <option value={UnitMeasure.CM}>Centímetro (CM)</option>
                        <option value={UnitMeasure.M2}>Metro cuadrado (M2)</option>
                        <option value={UnitMeasure.ROLL}>Rollo (ROLL)</option>
                      </optgroup>
                    </select>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Unidad en la que compras el producto al proveedor</p>
                    {errors.purchase_unit && (
                      <p className="mt-1 text-sm text-red-600">{errors.purchase_unit}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Unidad de Inventario *
                    </label>
                    <select
                      name="inventory_unit"
                      value={formData.inventory_unit}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 ${
                        errors.inventory_unit
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300 dark:border-gray-600 focus:border-[#7cb342] focus:ring-[#7cb342] bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      <optgroup label="Peso">
                        <option value={UnitMeasure.MG}>Miligramos (MG)</option>
                        <option value={UnitMeasure.G}>Gramos (G)</option>
                        <option value={UnitMeasure.KG}>Kilogramos (KG)</option>
                        <option value={UnitMeasure.LB}>Libras (LB)</option>
                        <option value={UnitMeasure.OZ}>Onzas (OZ)</option>
                      </optgroup>
                      <optgroup label="Volumen">
                        <option value={UnitMeasure.ML}>Mililitros (ML)</option>
                        <option value={UnitMeasure.L}>Litros (L)</option>
                        <option value={UnitMeasure.GAL}>Galones (GAL)</option>
                      </optgroup>
                      <optgroup label="Unidades">
                        <option value={UnitMeasure.PZ}>Pieza (PZ)</option>
                        <option value={UnitMeasure.CAP}>Cápsula (CAP)</option>
                        <option value={UnitMeasure.TAB}>Tableta (TAB)</option>
                        <option value={UnitMeasure.BOX}>Caja (BOX)</option>
                        <option value={UnitMeasure.BAG}>Bolsa (BAG)</option>
                        <option value={UnitMeasure.BTL}>Botella (BTL)</option>
                        <option value={UnitMeasure.PKT}>Paquete (PKT)</option>
                        <option value={UnitMeasure.PAL}>Pallet (PAL)</option>
                      </optgroup>
                      <optgroup label="Otros">
                        <option value={UnitMeasure.MT}>Metro (MT)</option>
                        <option value={UnitMeasure.CM}>Centímetro (CM)</option>
                        <option value={UnitMeasure.M2}>Metro cuadrado (M2)</option>
                        <option value={UnitMeasure.ROLL}>Rollo (ROLL)</option>
                      </optgroup>
                    </select>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Unidad en la que controlas el inventario interno</p>
                    {errors.inventory_unit && (
                      <p className="mt-1 text-sm text-red-600">{errors.inventory_unit}</p>
                    )}
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Factor de Conversión *
                    </label>
                    <input
                      type="number"
                      name="conversion_factor"
                      value={formData.conversion_factor}
                      onChange={handleChange}
                      step="0.0001"
                      min="0.0001"
                      className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 ${
                        errors.conversion_factor
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300 dark:border-gray-600 focus:border-[#7cb342] focus:ring-[#7cb342] bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                      placeholder="1000"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Cuántas unidades de inventario hay en 1 unidad de compra. Ejemplo: 1 KG = 1000 G, el factor es 1000
                    </p>
                    {errors.conversion_factor && (
                      <p className="mt-1 text-sm text-red-600">{errors.conversion_factor}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Tab: Inventario y Logística */}
              {activeTab === 'inventory' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Peso Unitario
                      </label>
                      <input
                        type="number"
                        name="unit_weight"
                        value={formData.unit_weight}
                        onChange={handleChange}
                        step="0.001"
                        min="0"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7cb342] focus:ring-[#7cb342] px-3 py-2"
                        placeholder="0.270"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Peso por unidad en kg</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Volumen Unitario
                      </label>
                      <input
                        type="number"
                        name="unit_volume"
                        value={formData.unit_volume}
                        onChange={handleChange}
                        step="0.001"
                        min="0"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7cb342] focus:ring-[#7cb342] px-3 py-2"
                        placeholder="0.250"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Volumen por unidad en litros</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Unidades por Paquete
                      </label>
                      <input
                        type="number"
                        name="units_per_package"
                        value={formData.units_per_package}
                        onChange={handleChange}
                        min="0"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7cb342] focus:ring-[#7cb342] px-3 py-2"
                        placeholder="12"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Cantidad de unidades por empaque</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Lead Time (días)
                      </label>
                      <input
                        type="number"
                        name="lead_time_days"
                        value={formData.lead_time_days}
                        onChange={handleChange}
                        min="0"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7cb342] focus:ring-[#7cb342] px-3 py-2"
                        placeholder="15"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Días desde pedido hasta recepción</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-4">Niveles de Inventario</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                          Stock Mínimo
                        </label>
                        <input
                          type="number"
                          name="min_stock"
                          value={formData.min_stock}
                          onChange={handleChange}
                          min="0"
                          className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 ${
                            errors.min_stock
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                              : 'border-gray-300 dark:border-gray-600 focus:border-[#7cb342] focus:ring-[#7cb342] bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                          }`}
                          placeholder="1000"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Nivel mínimo permitido en inventario</p>
                        {errors.min_stock && (
                          <p className="mt-1 text-sm text-red-600">{errors.min_stock}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                          Stock Máximo
                        </label>
                        <input
                          type="number"
                          name="max_stock"
                          value={formData.max_stock}
                          onChange={handleChange}
                          min="0"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7cb342] focus:ring-[#7cb342] px-3 py-2"
                          placeholder="10000"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Nivel máximo deseado en inventario</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                          Punto de Reorden
                        </label>
                        <input
                          type="number"
                          name="reorder_point"
                          value={formData.reorder_point}
                          onChange={handleChange}
                          min="0"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7cb342] focus:ring-[#7cb342] px-3 py-2"
                          placeholder="5000"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Nivel que activa una nueva compra</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                          Stock de Seguridad
                        </label>
                        <input
                          type="number"
                          name="safety_stock"
                          value={formData.safety_stock}
                          onChange={handleChange}
                          min="0"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7cb342] focus:ring-[#7cb342] px-3 py-2"
                          placeholder="2000"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Stock de reserva para imprevistos</p>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* Tab: Calidad y Almacenamiento */}
              {activeTab === 'quality' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Vida Útil (días)
                      </label>
                      <input
                        type="number"
                        name="shelf_life_days"
                        value={formData.shelf_life_days}
                        onChange={handleChange}
                        min="0"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7cb342] focus:ring-[#7cb342] px-3 py-2"
                        placeholder="365"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Días de duración desde fabricación</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Días de Cuarentena
                      </label>
                      <input
                        type="number"
                        name="quarantine_days"
                        value={formData.quarantine_days}
                        onChange={handleChange}
                        min="0"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7cb342] focus:ring-[#7cb342] px-3 py-2"
                        placeholder="7"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Días de retención antes de liberar</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-4">Control de Calidad</h4>
                    <div className="space-y-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="requires_quality_control"
                          checked={formData.requires_quality_control}
                          onChange={handleChange}
                          className="rounded border-gray-300 text-[#7cb342] focus:ring-[#7cb342]"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-200">Requiere Control de Calidad</span>
                      </label>

                      {formData.requires_quality_control && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Plan de Muestreo
                          </label>
                          <textarea
                            name="sampling_plan"
                            value={formData.sampling_plan}
                            onChange={handleChange}
                            rows={3}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7cb342] focus:ring-[#7cb342] px-3 py-2"
                            placeholder="Ej: Muestreo de 3 unidades cada lote de 1000"
                          />
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Describe cómo se realizará el control de calidad</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-3 flex justify-end space-x-3 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#7cb342] hover:bg-[#689f38] transition-colors"
              >
                {product ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;