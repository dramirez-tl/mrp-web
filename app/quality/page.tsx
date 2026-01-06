'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/lib/types';
import { BeakerIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';

export default function QualityPage() {
  return (
    <ProtectedRoute requiredRoles={[
      UserRole.SUPER_ADMIN,
      UserRole.GERENTE_PRODUCCION,
      UserRole.CALIDAD,
      UserRole.SUPERVISOR
    ]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BeakerIcon className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Control de Calidad</h1>
                  <p className="text-gray-600">Gestión de inspecciones y control de calidad</p>
                </div>
              </div>
            </div>
          </div>

          {/* Placeholder Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <WrenchScrewdriverIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Módulo en Construcción
              </h2>
              <p className="text-gray-600 mb-6">
                El módulo de Control de Calidad está actualmente en desarrollo y estará disponible próximamente.
              </p>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-left">
                <h3 className="font-semibold text-purple-900 mb-2">Funcionalidades Planificadas:</h3>
                <ul className="space-y-2 text-sm text-purple-800">
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    <span>Inspecciones de entrada de materiales</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    <span>Control de calidad en proceso</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    <span>Inspección de producto terminado</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    <span>Registro de no conformidades</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    <span>Reportes y estadísticas de calidad</span>
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
