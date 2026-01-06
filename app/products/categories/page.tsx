'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import CategoriesModal from '@/components/products/CategoriesModal';
import productsService from '@/lib/services/products.service';
import { ProductCategory } from '@/lib/types/products';
import { UserRole } from '@/lib/types';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  TagIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchCategories();
  }, [filterStatus]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const includeInactive = filterStatus === 'all' || filterStatus === 'inactive';
      const response = await productsService.getCategories({ includeInactive });
      setCategories(response);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      toast.error('Error al cargar las categorías');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: ProductCategory) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleDeleteCategory = async (category: ProductCategory) => {
    if (category._count?.products && category._count.products > 0) {
      toast.error(`No se puede eliminar. Esta categoría tiene ${category._count.products} productos asociados.`);
      return;
    }

    if (confirm(`¿Está seguro de eliminar la categoría ${category.name}?`)) {
      try {
        await productsService.deleteCategory(category.id);
        toast.success('Categoría eliminada correctamente');
        fetchCategories();
      } catch (error) {
        console.error('Error al eliminar categoría:', error);
        toast.error('Error al eliminar la categoría');
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  const handleModalSave = async (data: any) => {
    try {
      if (selectedCategory) {
        await productsService.updateCategory(selectedCategory.id, data);
        toast.success('Categoría actualizada correctamente');
      } else {
        await productsService.createCategory(data);
        toast.success('Categoría creada correctamente');
      }
      fetchCategories();
      handleModalClose();
    } catch (error) {
      console.error('Error al guardar categoría:', error);
      toast.error('Error al guardar la categoría');
    }
  };

  // Filtrar categorías
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && category.is_active) ||
      (filterStatus === 'inactive' && !category.is_active);

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <ProtectedRoute requiredRoles={[UserRole.SUPER_ADMIN, UserRole.GERENTE_PRODUCCION, UserRole.PLANEADOR, UserRole.ALMACENISTA]}>
        <DashboardLayout>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7cb342]"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRoles={[UserRole.SUPER_ADMIN, UserRole.GERENTE_PRODUCCION, UserRole.PLANEADOR, UserRole.ALMACENISTA]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Categorías de Productos</h1>
              <p className="text-gray-600">Gestión de categorías para organizar productos</p>
            </div>
            <button
              onClick={handleCreateCategory}
              className="flex items-center px-4 py-2 bg-[#7cb342] text-white rounded-lg hover:bg-[#689f38] transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Nueva Categoría
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#7cb342] focus:border-[#7cb342]"
                    placeholder="Buscar categorías..."
                  />
                </div>
              </div>
              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#7cb342] focus:border-[#7cb342]"
                >
                  <option value="all">Todas</option>
                  <option value="active">Activas</option>
                  <option value="inactive">Inactivas</option>
                </select>
              </div>
            </div>
          </div>

          {/* Categories Grid */}
          {filteredCategories.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center py-12">
                <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay categorías</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'No se encontraron categorías con ese criterio de búsqueda.' : 'Comience creando una nueva categoría.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <div
                          className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-white"
                          style={{ backgroundColor: category.color || '#7cb342' }}
                        >
                          <span className="text-lg">{category.icon || <TagIcon className="h-6 w-6" />}</span>
                        </div>
                        <div className="ml-3 flex-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            {category.name}
                          </h3>
                          <p className="text-xs text-gray-500">{category.code}</p>
                          {category.description && (
                            <p className="mt-1 text-sm text-gray-500">
                              {category.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="ml-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          category.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {category.is_active ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        {category.product_count !== undefined ? (
                          <span>{category.product_count} productos</span>
                        ) : category._count?.products !== undefined ? (
                          <span>{category._count.products} productos</span>
                        ) : null}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="text-[#1e3a6f] hover:text-[#2c4a8f]"
                          title="Editar"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-xs text-gray-500">
                        <div>Creada: {new Date(category.created_at).toLocaleDateString('es-MX')}</div>
                        <div>Actualizada: {new Date(category.updated_at).toLocaleDateString('es-MX')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal */}
          {isModalOpen && (
            <CategoriesModal
              category={selectedCategory}
              isOpen={isModalOpen}
              onClose={handleModalClose}
              onSave={handleModalSave}
            />
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}