'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ProductCategory } from '@/lib/types/products';
import productsService from '@/lib/services/products.service';

interface CategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  category: ProductCategory | null;
}

// Default colors for categories
const CATEGORY_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
];

// Default icons for categories
const CATEGORY_ICONS = [
  '📦', '🏷️', '📁', '🗂️', '📋', '🎯', '⚙️', '🔧',
  '💊', '💉', '🧪', '🧬', '⚗️', '🔬', '🩺', '🏥'
];

export default function CategoriesModal({
  isOpen,
  onClose,
  onSave,
  category,
}: CategoriesModalProps) {
  const [formData, setFormData] = useState<any>({
    code: '',
    name: '',
    description: '',
    parent_id: undefined,
    color: CATEGORY_COLORS[0],
    icon: CATEGORY_ICONS[0],
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Load categories for parent selection
  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    if (category) {
      setFormData({
        code: category.code || '',
        name: category.name,
        description: category.description || '',
        parent_id: category.parent_id || undefined,
        color: category.color || CATEGORY_COLORS[0],
        icon: category.icon || CATEGORY_ICONS[0],
        is_active: category.is_active,
      });
    } else {
      setFormData({
        code: '',
        name: '',
        description: '',
        parent_id: undefined,
        color: CATEGORY_COLORS[0],
        icon: CATEGORY_ICONS[0],
        is_active: true,
      });
    }
    setErrors({});
  }, [category, isOpen]);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const tree = await productsService.getCategoryTree();
      setCategories(tree);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
               name === 'parent_id' && value === '' ? undefined : value,
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code?.trim()) {
      newErrors.code = 'El código es requerido';
    } else if (formData.code.length > 50) {
      newErrors.code = 'El código no puede tener más de 50 caracteres';
    }

    if (!formData.name?.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.length > 200) {
      newErrors.name = 'El nombre no puede tener más de 200 caracteres';
    }

    // Check if trying to set itself as parent
    if (category && formData.parent_id === category.id) {
      newErrors.parent_id = 'Una categoría no puede ser su propio padre';
    }

    // Check if trying to set a descendant as parent
    if (category && formData.parent_id && isDescendant(category.id, formData.parent_id)) {
      newErrors.parent_id = 'No se puede establecer una subcategoría como padre';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isDescendant = (ancestorId: string, possibleDescendantId: string): boolean => {
    const findInTree = (nodes: ProductCategory[], targetId: string): boolean => {
      for (const node of nodes) {
        if (node.id === targetId) return true;
        if (node.children && findInTree(node.children, targetId)) return true;
      }
      return false;
    };

    const ancestor = categories.find(c => c.id === ancestorId);
    if (!ancestor || !ancestor.children) return false;

    return findInTree(ancestor.children, possibleDescendantId);
  };

  const getAvailableParents = (): ProductCategory[] => {
    const flattenTree = (
      nodes: ProductCategory[],
      level = 0,
      excludeId?: string
    ): Array<ProductCategory & { label: string; level: number }> => {
      const result: Array<ProductCategory & { label: string; level: number }> = [];

      for (const node of nodes) {
        if (node.id !== excludeId) {
          result.push({
            ...node,
            label: '  '.repeat(level) + node.name,
            level,
          });

          if (node.children && (!excludeId || !isDescendant(excludeId, node.id))) {
            result.push(...flattenTree(node.children, level + 1, excludeId));
          }
        }
      }

      return result;
    };

    // Build tree structure from flat categories
    const buildTree = (items: ProductCategory[]): ProductCategory[] => {
      const map = new Map<string, ProductCategory>();
      const roots: ProductCategory[] = [];

      // Create map of all items
      items.forEach(item => {
        map.set(item.id, { ...item, children: [] });
      });

      // Build tree
      items.forEach(item => {
        if (item.parent_id) {
          const parent = map.get(item.parent_id);
          if (parent && parent.children) {
            parent.children.push(map.get(item.id)!);
          }
        } else {
          roots.push(map.get(item.id)!);
        }
      });

      return roots;
    };

    const tree = buildTree(categories);
    return flattenTree(tree, 0, category?.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      parent_id: undefined,
      color: CATEGORY_COLORS[0],
      icon: CATEGORY_ICONS[0],
      is_active: true,
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  const availableParents = getAvailableParents();

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {category ? 'Editar Categoría' : 'Nueva Categoría'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.code ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={50}
              />
              {errors.code && (
                <p className="text-red-500 text-xs mt-1">{errors.code}</p>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={200}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>
          </div>

          {/* Parent Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría Padre
            </label>
            <select
              name="parent_id"
              value={formData.parent_id || ''}
              onChange={handleInputChange}
              disabled={loadingCategories}
              className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                errors.parent_id ? 'border-red-500' : 'border-gray-300'
              } ${loadingCategories ? 'bg-gray-100' : ''}`}
            >
              <option value="">Sin categoría padre (Raíz)</option>
              {availableParents.map(parent => (
                <option key={parent.id} value={parent.id}>
                  {parent.label}
                </option>
              ))}
            </select>
            {errors.parent_id && (
              <p className="text-red-500 text-xs mt-1">{errors.parent_id}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <div className="flex gap-2 flex-wrap">
                {CATEGORY_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData((prev: any) => ({ ...prev, color }))}
                    className={`w-8 h-8 rounded-md border-2 ${
                      formData.color === color ? 'border-gray-900' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <input
                  type="color"
                  value={formData.color || '#3B82F6'}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, color: e.target.value }))}
                  className="w-8 h-8 rounded-md border border-gray-300 cursor-pointer"
                  title="Color personalizado"
                />
              </div>
            </div>

            {/* Icon Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ícono
              </label>
              <div className="flex gap-2 flex-wrap">
                {CATEGORY_ICONS.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData((prev: any) => ({ ...prev, icon }))}
                    className={`w-8 h-8 rounded-md border-2 flex items-center justify-center ${
                      formData.icon === icon ? 'border-gray-900 bg-gray-100' : 'border-gray-300'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, icon: e.target.value }))}
                className="mt-2 w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                placeholder="Ícono personalizado (emoji o texto)"
                maxLength={100}
              />
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              id="is_active"
              checked={formData.is_active}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
              Categoría activa
            </label>
          </div>

          {/* Preview */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <p className="text-xs text-gray-500 mb-2">Vista previa:</p>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-md flex items-center justify-center text-white"
                style={{ backgroundColor: formData.color || '#e5e7eb' }}
              >
                <span className="text-sm">{formData.icon || '📁'}</span>
              </div>
              <div>
                <div className="font-medium">{formData.name || 'Nombre de categoría'}</div>
                <div className="text-xs text-gray-500">{formData.code || 'CODIGO'}</div>
              </div>
            </div>
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
              {isSubmitting ? 'Guardando...' : category ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}