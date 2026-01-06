import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Supplier, SupplierProduct, AddSupplierProductRequest } from '@/lib/types/suppliers';
import { Product } from '@/lib/types/products';
import suppliersService from '@/lib/services/suppliers.service';
import productsService from '@/lib/services/products.service';
import { toast } from 'sonner';

interface SupplierProductsModalProps {
  supplier: Supplier;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const SupplierProductsModal: React.FC<SupplierProductsModalProps> = ({
  supplier,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [supplierProducts, setSupplierProducts] = useState<SupplierProduct[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState<AddSupplierProductRequest>({
    product_id: '',
    supplier_sku: '',
    supplier_description: '',
    unit_price: 0,
    currency: 'MXN',
    lead_time_days: 0,
    min_order_qty: 0,
    order_multiple: undefined,
    pack_size: undefined,
    is_preferred: false,
    is_active: true,
  });

  useEffect(() => {
    if (supplier && isOpen) {
      fetchSupplierProducts();
      fetchAvailableProducts();
    }
  }, [supplier, isOpen]);

  const fetchSupplierProducts = async () => {
    try {
      setLoading(true);
      const products = await suppliersService.getSupplierProducts(supplier.id);
      console.log('Productos del proveedor recibidos del backend:', products);
      console.log('Primer producto (si existe):', products[0]);

      // WORKAROUND: Si el backend no envía la relación product, cargarla manualmente
      if (products.length > 0 && !products[0].product) {
        console.warn('⚠️ Backend no envía relación product. Aplicando workaround...');

        // Cargar todos los productos disponibles para hacer el match
        const allProductsResponse = await productsService.getProducts({ limit: 1000 });
        const allProducts = allProductsResponse.data;

        // Enriquecer los supplier_products con los datos del producto
        const enrichedProducts = products.map(sp => {
          const product = allProducts.find(p => p.id === sp.product_id);
          return {
            ...sp,
            product: product || null
          };
        });

        console.log('✅ Productos enriquecidos con datos:', enrichedProducts);
        setSupplierProducts(enrichedProducts);
      } else {
        console.log('✅ Backend envía relación product correctamente');
        setSupplierProducts(products);
      }
    } catch (error) {
      console.error('Error al cargar productos del proveedor:', error);
      toast.error('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableProducts = async () => {
    try {
      const response = await productsService.getProducts({
        limit: 100,
        status: 'ACTIVE',
      });
      setAvailableProducts(response.data);
    } catch (error) {
      console.error('Error al cargar productos disponibles:', error);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.product_id) {
      toast.error('Debe seleccionar un producto');
      return;
    }
    if (newProduct.unit_price <= 0) {
      toast.error('El precio unitario debe ser mayor a 0');
      return;
    }

    try {
      // Limpiar datos antes de enviar - remover undefined y valores vacíos
      const cleanData: any = {
        product_id: newProduct.product_id,
        unit_price: newProduct.unit_price,
      };

      // Solo agregar campos opcionales si tienen valor
      if (newProduct.supplier_sku) cleanData.supplier_sku = newProduct.supplier_sku;
      if (newProduct.supplier_description) cleanData.supplier_description = newProduct.supplier_description;
      if (newProduct.currency) cleanData.currency = newProduct.currency;
      if (newProduct.lead_time_days && newProduct.lead_time_days > 0) cleanData.lead_time_days = newProduct.lead_time_days;
      if (newProduct.min_order_qty && newProduct.min_order_qty > 0) cleanData.min_order_qty = newProduct.min_order_qty;
      if (newProduct.order_multiple && newProduct.order_multiple > 0) cleanData.order_multiple = newProduct.order_multiple;
      if (newProduct.pack_size && newProduct.pack_size > 0) cleanData.pack_size = newProduct.pack_size;
      if (newProduct.is_preferred !== undefined) cleanData.is_preferred = newProduct.is_preferred;
      if (newProduct.is_active !== undefined) cleanData.is_active = newProduct.is_active;

      console.log('Datos a enviar al backend:', cleanData);

      await suppliersService.addProductToSupplier(supplier.id, cleanData);
      toast.success('Producto agregado correctamente');
      fetchSupplierProducts();
      setShowAddProduct(false);
      setNewProduct({
        product_id: '',
        supplier_sku: '',
        supplier_description: '',
        unit_price: 0,
        currency: 'MXN',
        lead_time_days: 0,
        min_order_qty: 0,
        order_multiple: undefined,
        pack_size: undefined,
        is_preferred: false,
        is_active: true,
      });
      onUpdate();
    } catch (error) {
      console.error('Error al agregar producto:', error);
      toast.error('Error al agregar el producto');
    }
  };

  const handleRemoveProduct = async (productId: string) => {
    if (confirm('¿Está seguro de eliminar este producto del proveedor?')) {
      try {
        await suppliersService.removeProductFromSupplier(supplier.id, productId);
        toast.success('Producto eliminado correctamente');
        fetchSupplierProducts();
        onUpdate();
      } catch (error) {
        console.error('Error al eliminar producto:', error);
        toast.error('Error al eliminar el producto');
      }
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: supplier.currency || 'MXN',
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md transition-opacity" />

        <div className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all max-w-4xl w-full">
          <div className="bg-white px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Productos del Proveedor
                </h3>
                <p className="text-sm text-gray-500">{supplier.name}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="px-6 py-4">
            {/* Add Product Section */}
            {!showAddProduct ? (
              <button
                onClick={() => setShowAddProduct(true)}
                className="mb-4 flex items-center px-4 py-2 bg-[#7cb342] text-white rounded-md hover:bg-[#689f38]"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Agregar Producto
              </button>
            ) : (
              <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h4 className="font-medium mb-4">Agregar Nuevo Producto</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Producto *
                    </label>
                    <select
                      value={newProduct.product_id}
                      onChange={(e) => setNewProduct({ ...newProduct, product_id: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#7cb342] focus:border-[#7cb342]"
                    >
                      <option value="">Seleccionar producto...</option>
                      {availableProducts
                        .filter(p => !supplierProducts.some(sp => sp.product_id === p.id))
                        .map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.code} - {product.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SKU del Proveedor
                    </label>
                    <input
                      type="text"
                      value={newProduct.supplier_sku}
                      onChange={(e) => setNewProduct({ ...newProduct, supplier_sku: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#7cb342] focus:border-[#7cb342]"
                      placeholder="Código/SKU del proveedor"
                    />
                    <p className="mt-1 text-xs text-gray-500">Código interno que usa el proveedor para este producto</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción del Proveedor
                    </label>
                    <input
                      type="text"
                      value={newProduct.supplier_description}
                      onChange={(e) => setNewProduct({ ...newProduct, supplier_description: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#7cb342] focus:border-[#7cb342]"
                      placeholder="Descripción del proveedor"
                    />
                    <p className="mt-1 text-xs text-gray-500">Cómo el proveedor describe este producto</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio Unitario *
                    </label>
                    <input
                      type="number"
                      value={newProduct.unit_price}
                      onChange={(e) => setNewProduct({ ...newProduct, unit_price: parseFloat(e.target.value) || 0 })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#7cb342] focus:border-[#7cb342]"
                      min="0"
                      step="0.01"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">Precio por unidad en la moneda seleccionada</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Moneda
                    </label>
                    <select
                      value={newProduct.currency}
                      onChange={(e) => setNewProduct({ ...newProduct, currency: e.target.value as any })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#7cb342] focus:border-[#7cb342]"
                    >
                      <option value="MXN">MXN - Peso Mexicano</option>
                      <option value="USD">USD - Dólar Americano</option>
                      <option value="EUR">EUR - Euro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lead Time (días)
                    </label>
                    <input
                      type="number"
                      value={newProduct.lead_time_days}
                      onChange={(e) => setNewProduct({ ...newProduct, lead_time_days: parseInt(e.target.value) || 0 })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#7cb342] focus:border-[#7cb342]"
                      min="0"
                    />
                    <p className="mt-1 text-xs text-gray-500">Días desde pedido hasta recepción</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cantidad Mínima de Orden
                    </label>
                    <input
                      type="number"
                      value={newProduct.min_order_qty}
                      onChange={(e) => setNewProduct({ ...newProduct, min_order_qty: parseFloat(e.target.value) || 0 })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#7cb342] focus:border-[#7cb342]"
                      min="0"
                    />
                    <p className="mt-1 text-xs text-gray-500">Cantidad mínima que se puede ordenar</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Múltiplo de Orden
                    </label>
                    <input
                      type="number"
                      value={newProduct.order_multiple || ''}
                      onChange={(e) => setNewProduct({ ...newProduct, order_multiple: parseInt(e.target.value) || undefined })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#7cb342] focus:border-[#7cb342]"
                      min="0"
                    />
                    <p className="mt-1 text-xs text-gray-500">Múltiplo en el que se debe ordenar (ej: 10, 50, 100)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tamaño de Paquete
                    </label>
                    <input
                      type="number"
                      value={newProduct.pack_size || ''}
                      onChange={(e) => setNewProduct({ ...newProduct, pack_size: parseInt(e.target.value) || undefined })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#7cb342] focus:border-[#7cb342]"
                      min="0"
                    />
                    <p className="mt-1 text-xs text-gray-500">Unidades por paquete/caja</p>
                  </div>

                  <div className="flex items-center space-x-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newProduct.is_preferred}
                        onChange={(e) => setNewProduct({ ...newProduct, is_preferred: e.target.checked })}
                        className="rounded border-gray-300 text-[#7cb342] focus:ring-[#7cb342]"
                      />
                      <span className="ml-2 text-sm text-gray-700">Proveedor Preferido</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newProduct.is_active}
                        onChange={(e) => setNewProduct({ ...newProduct, is_active: e.target.checked })}
                        className="rounded border-gray-300 text-[#7cb342] focus:ring-[#7cb342]"
                      />
                      <span className="ml-2 text-sm text-gray-700">Activo</span>
                    </label>
                  </div>
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setShowAddProduct(false);
                      setNewProduct({
                        product_id: '',
                        supplier_sku: '',
                        supplier_description: '',
                        unit_price: 0,
                        currency: 'MXN',
                        lead_time_days: 0,
                        min_order_qty: 0,
                        order_multiple: undefined,
                        pack_size: undefined,
                        is_preferred: false,
                        is_active: true,
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddProduct}
                    className="px-4 py-2 bg-[#7cb342] text-white rounded-md hover:bg-[#689f38]"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            )}

            {/* Products List */}
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7cb342]"></div>
              </div>
            ) : supplierProducts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No hay productos asociados a este proveedor</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Producto
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SKU Prov.
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Precio
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Condiciones
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pref.
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {supplierProducts.map((item) => (
                      <tr key={item.id}>
                        {/* Producto */}
                        <td className="px-4 py-3">
                          {item.product ? (
                            <>
                              <div className="text-sm font-medium text-gray-900">
                                {item.product.code || 'Sin código'}
                              </div>
                              <div className="text-xs text-gray-600">
                                {item.product.name || 'Sin nombre'}
                              </div>
                              {item.supplier_description && (
                                <div className="text-xs text-gray-500 italic mt-1">
                                  {item.supplier_description}
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-xs text-red-500">
                              Producto no encontrado (ID: {item.product_id})
                            </div>
                          )}
                        </td>

                        {/* SKU Proveedor */}
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {item.supplier_sku || '-'}
                        </td>

                        {/* Precio */}
                        <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                          {formatCurrency(item.unit_price)}
                          <div className="text-xs text-gray-500">
                            {item.currency || 'MXN'}
                          </div>
                        </td>

                        {/* Condiciones (Lead Time, Min Order, etc) */}
                        <td className="px-4 py-3 text-sm">
                          {item.lead_time_days && (
                            <div className="text-gray-900">
                              Lead: {item.lead_time_days}d
                            </div>
                          )}
                          {item.min_order_qty && (
                            <div className="text-gray-600 text-xs">
                              Min: {item.min_order_qty} {item.product?.unit_measure}
                            </div>
                          )}
                          {item.order_multiple && (
                            <div className="text-gray-500 text-xs">
                              Múlt: {item.order_multiple}
                            </div>
                          )}
                          {item.pack_size && (
                            <div className="text-gray-500 text-xs">
                              Pack: {item.pack_size}
                            </div>
                          )}
                        </td>

                        {/* Preferido */}
                        <td className="px-4 py-3 text-center">
                          {item.is_preferred ? (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              ✓
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>

                        {/* Estado */}
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {item.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>

                        {/* Acciones */}
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleRemoveProduct(item.product_id)}
                            className="text-red-600 hover:text-red-900"
                            title="Eliminar producto"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-gray-50 px-6 py-3 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierProductsModal;