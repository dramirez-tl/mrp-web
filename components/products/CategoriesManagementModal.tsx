'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { ProductCategory } from '@/lib/types/products';
import productsService from '@/lib/services/products.service';
import CategoryModal from './CategoryModal';
import { toast } from 'sonner';

interface CategoriesManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CategoriesManagementModal({
  isOpen,
  onClose,
}: CategoriesManagementModalProps) {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await productsService.getCategories({ includeInactive: true });
      console.log('Categories loaded from backend:', data);
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (category: ProductCategory) => {
    setSelectedCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = async (category: ProductCategory) => {
    // Mostrar toast de confirmación con acciones
    toast.warning(
      `¿Eliminar la categoría "${category.name}"?`,
      {
        description: 'Esta acción no se puede deshacer',
        duration: 10000,
        action: {
          label: 'Eliminar',
          onClick: async () => {
            const loadingToast = toast.loading('Eliminando categoría...');
            try {
              await productsService.deleteCategory(category.id);
              toast.success('Categoría eliminada correctamente', { id: loadingToast });
              loadCategories();
            } catch (error: any) {
              console.error('Error deleting category:', error);
              toast.error(
                error.response?.data?.message || 'Error al eliminar la categoría',
                { id: loadingToast }
              );
            }
          },
        },
        cancel: {
          label: 'Cancelar',
          onClick: () => {},
        },
      }
    );
  };

  const handleCategoryModalSave = () => {
    setIsCategoryModalOpen(false);
    setSelectedCategory(null);
    loadCategories();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold">Gestión de Categorías</h2>
              <p className="text-sm text-gray-600">Administra las categorías de productos</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Action Button */}
          <div className="mb-4">
            <button
              onClick={handleCreateCategory}
              className="flex items-center px-4 py-2 bg-[#7cb342] text-white rounded-lg hover:bg-[#689f38] transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Nueva Categoría
            </button>
          </div>

          {/* Categories List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">Cargando categorías...</div>
              </div>
            ) : categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <p className="text-lg mb-2">No hay categorías creadas</p>
                <p className="text-sm">Haz clic en "Nueva Categoría" para crear una</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {/* Icon and Color */}
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0"
                          style={{ backgroundColor: category.color || '#6B7280' }}
                        >
                          {category.icon || '📁'}
                        </div>

                        {/* Category Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{category.name}</h3>
                            {/* Status Badge */}
                            {category.is_active ? (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                                Activa
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
                                Inactiva
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">Código: {category.code}</p>
                          {category.description && (
                            <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                          )}
                          {category.parent_id && (
                            <p className="text-xs text-gray-400 mt-1">
                              Subcategoría de: {categories.find(c => c.id === category.parent_id)?.name || 'N/A'}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end pt-4 border-t mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Category Create/Edit Modal */}
      {isCategoryModalOpen && (
        <CategoryModal
          isOpen={isCategoryModalOpen}
          onClose={() => {
            setIsCategoryModalOpen(false);
            setSelectedCategory(null);
          }}
          onSave={handleCategoryModalSave}
          category={selectedCategory}
          categories={categories.map(cat => ({
            ...cat,
            children: [],
            level: cat.level || 0
          }))}
        />
      )}
    </>
  );
}
