'use client';

import React, { useState, useEffect } from 'react';
import { PlusIcon, CubeIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Bom, FilterBomsDto, CreateBomDto, UpdateBomDto, BomStatus } from '@/lib/types/boms';
import { UserRole } from '@/lib/types';
import bomsService from '@/lib/services/boms.service';
import BomsFilters from '@/components/boms/BomsFilters';
import BomsList from '@/components/boms/BomsList';
import BomModal from '@/components/boms/BomModal';
import BomViewModal from '@/components/boms/BomViewModal';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { toast } from 'sonner';

export default function BomsPage() {
  const [boms, setBoms] = useState<Bom[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBom, setSelectedBom] = useState<Bom | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [duplicateBom, setDuplicateBom] = useState<Bom | null>(null);
  const [duplicateCode, setDuplicateCode] = useState('');

  const [filters, setFilters] = useState({
    search: '',
    status: '' as BomStatus | '',
    active_only: false
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    loadBoms();
  }, [filters, pagination.page]);

  const loadBoms = async () => {
    setLoading(true);
    try {
      const filterDto: FilterBomsDto = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status as BomStatus }),
        ...(filters.active_only && { active_only: filters.active_only })
      };

      const response = await bomsService.findAll(filterDto);
      setBoms(response.data);
      setPagination({
        ...pagination,
        total: response.meta.total,
        totalPages: response.meta.totalPages
      });
    } catch (error) {
      console.error('Error loading BOMs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setPagination({ ...pagination, page: 1 });
  };

  const handleCreate = () => {
    setSelectedBom(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleEdit = async (bom: Bom) => {
    try {
      // Cargar el BOM completo con sus items
      const fullBom = await bomsService.getById(bom.id);
      setSelectedBom(fullBom);
      setModalMode('edit');
      setModalOpen(true);
    } catch (error) {
      console.error('Error loading BOM details:', error);
      toast.error('Error al cargar los detalles del BOM');
    }
  };

  const handleView = async (bom: Bom) => {
    try {
      // Cargar el BOM completo con sus items
      const fullBom = await bomsService.getById(bom.id);
      setSelectedBom(fullBom);
      setViewModalOpen(true);
    } catch (error) {
      console.error('Error loading BOM details:', error);
      toast.error('Error al cargar los detalles del BOM');
    }
  };

  const handleDuplicate = (bom: Bom) => {
    setDuplicateBom(bom);
    setDuplicateCode(`${bom.code}-COPY`);
    setDuplicateModalOpen(true);
  };

  const handleExplode = async (bom: Bom) => {
    try {
      // Cargar el BOM completo con sus items
      const fullBom = await bomsService.getById(bom.id);
      setSelectedBom(fullBom);
      setViewModalOpen(true);
      // The view modal has the explosion tab
    } catch (error) {
      console.error('Error loading BOM details:', error);
      toast.error('Error al cargar los detalles del BOM');
    }
  };

  const handleActivate = async (bom: Bom) => {
    if (!confirm(`¿Está seguro de activar el BOM ${bom.code}?`)) return;

    try {
      await bomsService.activate(bom.id);
      toast.success('BOM activado exitosamente');
      loadBoms();
    } catch (error) {
      console.error('Error activating BOM:', error);
      toast.error('Error al activar el BOM');
    }
  };

  const handleDelete = async (bom: Bom) => {
    if (!confirm(`¿Está seguro de eliminar el BOM ${bom.code}?`)) return;

    try {
      await bomsService.remove(bom.id);
      loadBoms();
    } catch (error) {
      console.error('Error deleting BOM:', error);
      toast.error('Error al eliminar el BOM');
    }
  };

  const handleSubmit = async (data: CreateBomDto | UpdateBomDto) => {
    try {
      if (modalMode === 'create') {
        await bomsService.create(data as CreateBomDto);
        toast.success('BOM creado exitosamente');
      } else {
        await bomsService.update(selectedBom!.id, data as UpdateBomDto);
        toast.success('BOM actualizado exitosamente');
      }
      setModalOpen(false);
      loadBoms();
    } catch (error: any) {
      console.error('Error saving BOM:', error);
      toast.error(error.response?.data?.message || 'Error al guardar el BOM');
    }
  };

  const handleDuplicateSubmit = async () => {
    if (!duplicateBom || !duplicateCode) return;

    try {
      await bomsService.duplicate(duplicateBom.id, duplicateCode);
      toast.success('BOM duplicado exitosamente');
      setDuplicateModalOpen(false);
      setDuplicateBom(null);
      setDuplicateCode('');
      loadBoms();
    } catch (error: any) {
      console.error('Error duplicating BOM:', error);
      toast.error(error.response?.data?.message || 'Error al duplicar el BOM');
    }
  };

  return (
    <ProtectedRoute requiredRoles={[
      UserRole.SUPER_ADMIN,
      UserRole.GERENTE_PRODUCCION,
      UserRole.PLANEADOR,
      UserRole.SUPERVISOR,
      UserRole.CALIDAD,
      UserRole.CONSULTA
    ]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CubeIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Bills of Materials (BOMs)</h1>
                  <p className="text-gray-600">Gestiona las listas de materiales de tus productos</p>
                </div>
              </div>
              <button
                onClick={handleCreate}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <PlusIcon className="h-5 w-5" />
                Nuevo BOM
              </button>
            </div>
          </div>

          {/* Filters */}
          <div>
            <BomsFilters
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* List */}
          <div>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <ArrowPathIcon className="h-8 w-8 text-gray-400 animate-spin" />
              </div>
            ) : (
              <BomsList
                boms={boms}
                onEdit={handleEdit}
                onView={handleView}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
                onActivate={handleActivate}
                onExplode={handleExplode}
              />
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-4 py-3 sm:px-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPagination({ ...pagination, page: Math.min(pagination.totalPages, pagination.page + 1) })}
                  disabled={pagination.page === pagination.totalPages}
                  className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> a{' '}
                    <span className="font-medium">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>{' '}
                    de <span className="font-medium">{pagination.total}</span> resultados
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                    <button
                      onClick={() => setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    {[...Array(pagination.totalPages)].map((_, index) => {
                      const page = index + 1;
                      if (
                        page === 1 ||
                        page === pagination.totalPages ||
                        (page >= pagination.page - 1 && page <= pagination.page + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => setPagination({ ...pagination, page })}
                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                              page === pagination.page
                                ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                                : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (page === pagination.page - 2 || page === pagination.page + 2) {
                        return <span key={page} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700">...</span>;
                      }
                      return null;
                    })}
                    <button
                      onClick={() => setPagination({ ...pagination, page: Math.min(pagination.totalPages, pagination.page + 1) })}
                      disabled={pagination.page === pagination.totalPages}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Siguiente
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}

          {/* Modals */}
          <BomModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            onSubmit={handleSubmit}
            bom={selectedBom}
            mode={modalMode}
          />

          <BomViewModal
            isOpen={viewModalOpen}
            onClose={() => setViewModalOpen(false)}
            bom={selectedBom}
          />

          {/* Duplicate Modal */}
          {duplicateModalOpen && duplicateBom && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-black/30 backdrop-blur-md" aria-hidden="true"></div>
                <div className="relative z-10 inline-block w-full max-w-md px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Duplicar BOM
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Duplicando: {duplicateBom.code} - {duplicateBom.name}
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nuevo Código *
                    </label>
                    <input
                      type="text"
                      value={duplicateCode}
                      onChange={(e) => setDuplicateCode(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ingrese el nuevo código"
                    />
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={() => setDuplicateModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleDuplicateSubmit}
                      disabled={!duplicateCode}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      Duplicar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}