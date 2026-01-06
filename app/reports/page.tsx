'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/lib/types';
import { ChartBarIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';

export default function ReportsPage() {
  return (
    <ProtectedRoute requiredRoles={Object.values(UserRole)}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <ChartBarIcon className="h-8 w-8 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Reportes y Análisis</h1>
                  <p className="text-gray-600">Reportes operativos y analíticos del sistema MRP</p>
                </div>
              </div>
            </div>
          </div>

          {/* Placeholder Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                <WrenchScrewdriverIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Módulo en Construcción
              </h2>
              <p className="text-gray-600 mb-6">
                El módulo de Reportes está actualmente en desarrollo y estará disponible próximamente.
              </p>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-left">
                <h3 className="font-semibold text-indigo-900 mb-2">Reportes Planificados:</h3>
                <ul className="space-y-2 text-sm text-indigo-800">
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    <span>Reporte de producción por período</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    <span>Análisis de inventarios (ABC, rotación, obsolescencia)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    <span>Reporte de compras y proveedores</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    <span>Análisis de costos de producción</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    <span>KPIs y métricas de desempeño</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    <span>Reportes de calidad y no conformidades</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    <span>Análisis de ejecuciones MRP</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
