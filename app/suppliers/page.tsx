'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import SuppliersList from '@/components/suppliers/SuppliersList';
import SuppliersFilters from '@/components/suppliers/SuppliersFilters';
import SupplierModal from '@/components/suppliers/SupplierModal';
import SupplierProductsModal from '@/components/suppliers/SupplierProductsModal';
import suppliersService from '@/lib/services/suppliers.service';
import { Supplier, SupplierStatus } from '@/lib/types/suppliers';
import { UserRole } from '@/lib/types';
import { PlusIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProductsModalOpen, setIsProductsModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
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
    city: '',
    state: '',
    country: '',
  });

  useEffect(() => {
    fetchSuppliers();
  }, [pagination.page, filters]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await suppliersService.getSuppliers({
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      });
      setSuppliers(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.meta.total,
        totalPages: response.meta.totalPages,
      }));
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
      toast.error('Error al cargar los proveedores');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSupplier = () => {
    setSelectedSupplier(null);
    setIsModalOpen(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleDeleteSupplier = async (supplier: Supplier) => {
    if (supplier._count?.supplier_products && supplier._count.supplier_products > 0) {
      toast.error(`No se puede eliminar el proveedor ${supplier.name} porque tiene ${supplier._count.supplier_products} productos asociados`);
      return;
    }

    if (confirm(`¿Está seguro de eliminar el proveedor ${supplier.name}?`)) {
      try {
        await suppliersService.deleteSupplier(supplier.id);
        toast.success('Proveedor eliminado correctamente');
        fetchSuppliers();
      } catch (error) {
        console.error('Error al eliminar proveedor:', error);
        toast.error('Error al eliminar el proveedor');
      }
    }
  };

  const handleViewProducts = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsProductsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedSupplier(null);
  };

  const handleProductsModalClose = () => {
    setIsProductsModalOpen(false);
    setSelectedSupplier(null);
  };

  const handleModalSave = async (data: any) => {
    try {
      if (selectedSupplier) {
        await suppliersService.updateSupplier(selectedSupplier.id, data);
        toast.success('Proveedor actualizado correctamente');
      } else {
        await suppliersService.createSupplier(data);
        toast.success('Proveedor creado correctamente');
      }
      fetchSuppliers();
      handleModalClose();
    } catch (error: any) {
      console.error('Error al guardar proveedor:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Error al guardar el proveedor');
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
    <ProtectedRoute requiredRoles={[UserRole.SUPER_ADMIN, UserRole.GERENTE_PRODUCCION, UserRole.PLANEADOR, UserRole.COMPRADOR, UserRole.CALIDAD]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Proveedores</h1>
              <p className="text-gray-600">Gestión de proveedores y sus productos</p>
            </div>
            <button
              onClick={handleCreateSupplier}
              className="flex items-center px-4 py-2 bg-[#7cb342] text-white rounded-lg hover:bg-[#689f38] transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Nuevo Proveedor
            </button>
          </div>

          {/* Filters */}
          <SuppliersFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />

          {/* Suppliers List */}
          <SuppliersList
            suppliers={suppliers}
            loading={loading}
            onEdit={handleEditSupplier}
            onDelete={handleDeleteSupplier}
            onViewProducts={handleViewProducts}
            pagination={pagination}
            onPageChange={handlePageChange}
          />

          {/* Modal */}
          {isModalOpen && (
            <SupplierModal
              supplier={selectedSupplier}
              isOpen={isModalOpen}
              onClose={handleModalClose}
              onSave={handleModalSave}
            />
          )}

          {/* Products Modal */}
          {isProductsModalOpen && selectedSupplier && (
            <SupplierProductsModal
              supplier={selectedSupplier}
              isOpen={isProductsModalOpen}
              onClose={handleProductsModalClose}
              onUpdate={fetchSuppliers}
            />
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}