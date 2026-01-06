'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/lib/types';
import api from '@/lib/api';
import {
  MrpDemand,
  DemandStatus,
  CreateMrpDemandDto,
  MrpRunResult,
  MrpRunStatus
} from '@/lib/types/mrp';
import { Product } from '@/lib/types/products';
import {
  CalculatorIcon,
  PlusIcon,
  PlayIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import DemandModal from '@/components/mrp/DemandModal';
import DemandsList from '@/components/mrp/DemandsList';
import MrpExecutionModal from '@/components/mrp/MrpExecutionModal';

export default function MrpPage() {
  const [activeTab, setActiveTab] = useState<'demands' | 'runs' | 'results'>('demands');
  const [demands, setDemands] = useState<MrpDemand[]>([]);
  const [mrpRuns, setMrpRuns] = useState<MrpRunResult[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemandModalOpen, setIsDemandModalOpen] = useState(false);
  const [isExecutionModalOpen, setIsExecutionModalOpen] = useState(false);
  const [selectedDemand, setSelectedDemand] = useState<MrpDemand | null>(null);
  const [selectedRun, setSelectedRun] = useState<MrpRunResult | null>(null);

  // Estadísticas
  const [stats, setStats] = useState({
    activeDemands: 0,
    pendingRuns: 0,
    completedRuns: 0,
    totalRequirements: 0,
    criticalItems: 0,
    estimatedCost: 0
  });

  useEffect(() => {
    fetchDemands();
    fetchMrpRuns();
    fetchProducts();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [demands, mrpRuns]);

  const fetchDemands = async () => {
    try {
      const response = await api.get('/mrp/demands');
      setDemands(response.data || []);
    } catch (error: any) {
      // Solo mostrar error informativo si es 404 (módulo no implementado)
      if (error.response?.status === 404) {
        console.info('ℹ️ Módulo de Demandas MRP aún no implementado en el backend');
      } else {
        console.error('Error fetching demands:', error);
        toast.error('Error al cargar demandas MRP');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMrpRuns = async () => {
    try {
      const response = await api.get('/mrp/runs');
      setMrpRuns(response.data || []);
    } catch (error: any) {
      // Solo mostrar error informativo si es 404 (módulo no implementado)
      if (error.response?.status === 404) {
        console.info('ℹ️ Módulo de Ejecuciones MRP aún no implementado en el backend');
      } else {
        console.error('Error fetching MRP runs:', error);
        toast.error('Error al cargar historial MRP');
      }
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products', { params: { type: 'PT' } });
      setProducts(response.data.data || response.data || []);
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.info('ℹ️ No se encontraron productos de tipo PT');
      } else {
        console.error('Error fetching products:', error);
      }
    }
  };

  const calculateStats = () => {
    const activeDemands = demands.filter(d => d.status === DemandStatus.ACTIVE).length;
    const pendingRuns = mrpRuns.filter(r => r.status === MrpRunStatus.RUNNING).length;
    const completedRuns = mrpRuns.filter(r => r.status === MrpRunStatus.COMPLETED).length;

    const latestRun = mrpRuns.find(r => r.status === MrpRunStatus.COMPLETED);
    const totalRequirements = latestRun?.requirements?.length || 0;
    const criticalItems = latestRun?.requirements?.filter(r => r.is_critical).length || 0;
    const estimatedCost = latestRun?.summary?.total_cost || 0;

    setStats({
      activeDemands,
      pendingRuns,
      completedRuns,
      totalRequirements,
      criticalItems,
      estimatedCost
    });
  };

  const handleCreateDemand = () => {
    setSelectedDemand(null);
    setIsDemandModalOpen(true);
  };

  const handleEditDemand = (demand: MrpDemand) => {
    setSelectedDemand(demand);
    setIsDemandModalOpen(true);
  };

  const handleDeleteDemand = async (demand: MrpDemand) => {
    if (!confirm(`¿Estás seguro de eliminar la demanda ${demand.code}?`)) return;

    try {
      const response = await fetch(`http://localhost:3001/api/mrp/demands/${demand.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Error al eliminar demanda');

      toast.success('Demanda eliminada exitosamente');
      fetchDemands();
    } catch (error) {
      console.error('Error deleting demand:', error);
      toast.error('Error al eliminar demanda');
    }
  };

  const handleSaveDemand = async (data: CreateMrpDemandDto) => {
    try {
      const url = selectedDemand
        ? `http://localhost:3001/api/mrp/demands/${selectedDemand.id}`
        : 'http://localhost:3001/api/mrp/demands';

      const response = await fetch(url, {
        method: selectedDemand ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al guardar demanda');
      }

      toast.success(selectedDemand ? 'Demanda actualizada' : 'Demanda creada exitosamente');
      setIsDemandModalOpen(false);
      fetchDemands();
    } catch (error) {
      console.error('Error saving demand:', error);
      toast.error(error instanceof Error ? error.message : 'Error al guardar demanda');
    }
  };

  const handleRunMrp = () => {
    setIsExecutionModalOpen(true);
  };

  const handleViewResults = (run: MrpRunResult) => {
    setSelectedRun(run);
    setActiveTab('results');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  return (
    <ProtectedRoute requiredRoles={[UserRole.SUPER_ADMIN, UserRole.GERENTE_PRODUCCION, UserRole.PLANEADOR]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CalculatorIcon className="h-8 w-8 text-gray-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    MRP - Planificación de Requerimientos
                  </h1>
                  <p className="text-gray-600">
                    Calcula las necesidades de materiales basado en demanda
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunMrp}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <PlayIcon className="h-4 w-4" />
                  Ejecutar MRP
                </button>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Demandas Activas</p>
              <p className="text-2xl font-bold text-gray-800">{stats.activeDemands}</p>
            </div>
            <DocumentTextIcon className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">En Proceso</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingRuns}</p>
            </div>
            <ClockIcon className="h-8 w-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Completados</p>
              <p className="text-2xl font-bold text-green-600">{stats.completedRuns}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Requerimientos</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalRequirements}</p>
            </div>
            <CubeIcon className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Items Críticos</p>
              <p className="text-2xl font-bold text-red-600">{stats.criticalItems}</p>
            </div>
            <ExclamationTriangleIcon className="h-8 w-8 text-red-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Costo Estimado</p>
              <p className="text-lg font-bold text-purple-600">
                {formatCurrency(stats.estimatedCost)}
              </p>
            </div>
            <ArrowTrendingUpIcon className="h-8 w-8 text-purple-400" />
          </div>
        </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('demands')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'demands'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Demandas
          </button>
          <button
            onClick={() => setActiveTab('runs')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'runs'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Historial de Ejecuciones
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'results'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Resultados
          </button>
        </nav>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <ArrowPathIcon className="h-8 w-8 text-gray-400 animate-spin" />
            </div>
          ) : (
            <>
              {activeTab === 'demands' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Demandas Activas</h2>
                    <button
                      onClick={handleCreateDemand}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <PlusIcon className="h-4 w-4" />
                      Nueva Demanda
                    </button>
                  </div>
                  <DemandsList
                    demands={demands}
                    onEdit={handleEditDemand}
                    onDelete={handleDeleteDemand}
                    onView={(demand) => console.log('View demand:', demand)}
                  />
                </div>
              )}

              {activeTab === 'runs' && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Historial de Ejecuciones MRP
                  </h2>
                  {/* Aquí irá el componente MrpRunsList */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <p className="text-gray-500">Lista de ejecuciones MRP...</p>
                  </div>
                </div>
              )}

              {activeTab === 'results' && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Resultados del Cálculo MRP
                  </h2>
                  {selectedRun ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <p className="text-gray-500">Resultados del cálculo #{selectedRun.run_number}...</p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                      <CalculatorIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">
                        Selecciona una ejecución para ver los resultados
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Modal de Demanda */}
          {isDemandModalOpen && (
            <DemandModal
              isOpen={isDemandModalOpen}
              onClose={() => setIsDemandModalOpen(false)}
              onSave={handleSaveDemand}
              demand={selectedDemand}
              products={products}
            />
          )}

          {/* Modal de Ejecución MRP */}
          {isExecutionModalOpen && (
            <MrpExecutionModal
              isOpen={isExecutionModalOpen}
              onClose={() => setIsExecutionModalOpen(false)}
              demands={demands.filter(d => d.status === DemandStatus.ACTIVE)}
              onExecute={() => {
                fetchMrpRuns();
                setActiveTab('runs');
              }}
            />
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}