'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/lib/types';
import { CogIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';

export default function SettingsPage() {
  return (
    <ProtectedRoute requiredRoles={[UserRole.SUPER_ADMIN]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <CogIcon className="h-8 w-8 text-gray-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h1>
                  <p className="text-gray-600">Configuración general y administración del sistema MRP</p>
                </div>
              </div>
            </div>
          </div>

          {/* Placeholder Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <WrenchScrewdriverIcon className="h-8 w-8 text-gray-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Módulo en Construcción
              </h2>
              <p className="text-gray-600 mb-6">
                El módulo de Configuración está actualmente en desarrollo y estará disponible próximamente.
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-left">
                <h3 className="font-semibold text-gray-900 mb-2">Configuraciones Planificadas:</h3>
                <ul className="space-y-2 text-sm text-gray-800">
                  <li className="flex items-start">
                    <span className="text-gray-600 mr-2">•</span>
                    <span>Gestión de usuarios y roles</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-600 mr-2">•</span>
                    <span>Configuración de permisos y accesos</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-600 mr-2">•</span>
                    <span>Parámetros generales del sistema</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-600 mr-2">•</span>
                    <span>Configuración de unidades de medida</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-600 mr-2">•</span>
                    <span>Configuración de líneas de producción</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-600 mr-2">•</span>
                    <span>Ubicaciones y almacenes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-600 mr-2">•</span>
                    <span>Parámetros de MRP (horizontes, políticas de lote)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-600 mr-2">•</span>
                    <span>Configuración de notificaciones</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-600 mr-2">•</span>
                    <span>Respaldos y auditoría</span>
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
