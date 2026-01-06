'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ProductsList from '@/components/products/ProductsList';
import ProductsFilters from '@/components/products/ProductsFilters';
import ProductModal from '@/components/products/ProductModal';
import CategoriesManagementModal from '@/components/products/CategoriesManagementModal';
import productsService from '@/lib/services/products.service';
import { Product, ProductType, ProductStatus } from '@/lib/types/products';
import { UserRole } from '@/lib/types';
import { PlusIcon, FolderIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '',
    category_id: '',
  });

  useEffect(() => {
    fetchProducts();
  }, [pagination.page, filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsService.getProducts({
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      });

      setProducts(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.meta.total,
        totalPages: response.meta.totalPages,
      }));
    } catch (error) {
      console.error('Error al cargar productos:', error);
      toast.error('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (product: Product) => {
    if (confirm(`¿Está seguro de eliminar el producto ${product.name}?`)) {
      try {
        await productsService.deleteProduct(product.id);
        toast.success('Producto eliminado correctamente');
        fetchProducts();
      } catch (error) {
        console.error('Error al eliminar producto:', error);
        toast.error('Error al eliminar el producto');
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleModalSave = async (data: any) => {
    try {
      console.log('Datos a enviar al backend:', data);

      if (selectedProduct) {
        await productsService.updateProduct(selectedProduct.id, data);
        toast.success('Producto actualizado correctamente');
      } else {
        await productsService.createProduct(data);
        toast.success('Producto creado correctamente');
      }
      fetchProducts();
      handleModalClose();
    } catch (error: any) {
      console.error('Error al guardar producto:', error);
      console.error('Detalles del error:', error.response?.data);

      // Log del mensaje completo para debugging
      if (error.response?.data?.message) {
        console.log('Mensaje de error del backend:', error.response.data.message);
      }

      // Mostrar mensaje de error específico del backend
      if (error.response?.data?.message) {
        const message = Array.isArray(error.response.data.message)
          ? error.response.data.message.join('\n')
          : error.response.data.message;
        toast.error(`Error de validación:\n${message}`, { duration: 8000 });
      } else if (error.response?.data?.error) {
        toast.error(`Error: ${error.response.data.error}`);
      } else {
        toast.error('Error al guardar el producto');
      }
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  return (
    <ProtectedRoute requiredRoles={[UserRole.SUPER_ADMIN, UserRole.GERENTE_PRODUCCION, UserRole.PLANEADOR, UserRole.ALMACENISTA]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
              <p className="text-gray-600">Gestión de productos y materiales</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsCategoriesModalOpen(true)}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <FolderIcon className="h-5 w-5 mr-2" />
                Gestionar Categorías
              </button>
              <button
                onClick={handleCreateProduct}
                className="flex items-center px-4 py-2 bg-[#7cb342] text-white rounded-lg hover:bg-[#689f38] transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Nuevo Producto
              </button>
            </div>
          </div>

          {/* Filters */}
          <ProductsFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />

          {/* Products List */}
          <ProductsList
            products={products}
            loading={loading}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            pagination={pagination}
            onPageChange={handlePageChange}
          />

          {/* Product Modal */}
          {isModalOpen && (
            <ProductModal
              product={selectedProduct}
              isOpen={isModalOpen}
              onClose={handleModalClose}
              onSave={handleModalSave}
            />
          )}

          {/* Categories Management Modal */}
          {isCategoriesModalOpen && (
            <CategoriesManagementModal
              isOpen={isCategoriesModalOpen}
              onClose={() => {
                setIsCategoriesModalOpen(false);
                // Recargar productos para actualizar filtros de categorías
                fetchProducts();
              }}
            />
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}