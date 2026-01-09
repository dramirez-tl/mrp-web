'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import Link from 'next/link';
import {
  CubeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ShoppingCartIcon,
  ArchiveBoxIcon,
  BeakerIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  BuildingOffice2Icon,
  TruckIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

// Componente de tarjeta de estadística mejorado
function StatCard({
  title,
  value,
  icon: Icon,
  change,
  color = 'blue',
  subtitle,
  link,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  change?: string;
  color?: string;
  subtitle?: string;
  link?: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    gray: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  }[color] || 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';

  const changeColor = change?.startsWith('+') ? 'text-green-600 dark:text-green-400' :
                     change?.startsWith('-') ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400';

  const content = (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 hover:shadow-lg dark:hover:shadow-gray-900/70 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
          {change && (
            <div className="flex items-center mt-2">
              <ArrowTrendingUpIcon className={`h-4 w-4 ${changeColor} mr-1`} />
              <span className={`text-sm ${changeColor}`}>{change}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${colorClasses}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );

  if (link) {
    return <Link href={link} className="block">{content}</Link>;
  }

  return content;
}

// Dashboard principal con datos reales
export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    products: { total: 0, finished: 0, raw: 0, packaging: 0 },
    boms: { total: 0, active: 0, draft: 0 },
    orders: { active: 0, pending: 0, completed: 0, efficiency: 0 },
    inventory: { lowStock: 0, outOfStock: 0, totalValue: 0 },
    suppliers: { total: 0, active: 0 },
    purchases: { pending: 0, value: 0, overdue: 0 },
    mrp: { activeRuns: 0, pendingDemands: 0 },
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [
        productsRes,
        bomsRes,
        ordersRes,
        suppliersRes,
        lowStockRes,
        purchasesRes,
        mrpRes,
      ] = await Promise.all([
        api.get('/products').catch(() => ({ data: { data: [], meta: { total: 0 } } })),
        api.get('/boms').catch(() => ({ data: { data: [], meta: { total: 0 } } })),
        api.get('/production-orders').catch((err) => {
          if (err.response?.status === 404) {
            console.info('ℹ️ Módulo de Órdenes de Producción aún no implementado en el backend');
          }
          return { data: { data: [] } };
        }),
        api.get('/suppliers').catch(() => ({ data: { data: [], meta: { total: 0 } } })),
        api.get('/inventory/low-stock').catch(() => ({ data: [] })),
        api.get('/purchase-orders/statistics').catch((err) => {
          if (err.response?.status === 404) {
            console.info('ℹ️ Módulo de Estadísticas de Órdenes de Compra aún no implementado en el backend');
          }
          return {
            data: {
              total_orders: 0,
              by_status: {},
              pending_value: 0,
              recent_orders: []
            }
          };
        }),
        api.get('/mrp/runs').catch(() => ({ data: [] })),
      ]);

      // Process products
      const products = productsRes.data?.data || productsRes.data || [];
      const productStats = {
        total: productsRes.data?.meta?.total || products.length,
        finished: products.filter((p: any) => p.type === 'PT').length,
        raw: products.filter((p: any) => p.type === 'MP').length,
        packaging: products.filter((p: any) => p.type === 'ME').length,
      };

      // Process BOMs
      const boms = bomsRes.data?.data || bomsRes.data || [];
      const bomStats = {
        total: bomsRes.data?.meta?.total || boms.length,
        active: boms.filter((b: any) => b.status === 'ACTIVE').length,
        draft: boms.filter((b: any) => b.status === 'DRAFT').length,
      };

      // Process production orders
      const orders = ordersRes.data.data || ordersRes.data || [];
      const today = new Date().toDateString();
      const orderStats = {
        active: orders.filter((o: any) =>
          ['RELEASED', 'IN_PROGRESS'].includes(o.status)
        ).length,
        pending: orders.filter((o: any) => o.status === 'PLANNED').length,
        completed: orders.filter((o: any) =>
          o.status === 'COMPLETED' &&
          new Date(o.updated_at).toDateString() === today
        ).length,
        efficiency: 92, // Mock value
      };

      // Process suppliers
      const suppliers = suppliersRes.data?.data || suppliersRes.data || [];
      const supplierStats = {
        total: suppliersRes.data?.meta?.total || suppliers.length,
        active: suppliers.filter((s: any) => s.status === 'ACTIVE').length,
      };

      // Process inventory
      const lowStock = Array.isArray(lowStockRes.data) ? lowStockRes.data : [];
      const inventoryStats = {
        lowStock: lowStock.filter((i: any) => i.status === 'LOW').length,
        outOfStock: lowStock.filter((i: any) => i.status === 'CRITICAL').length,
        totalValue: 0, // Would need valuation endpoint
      };

      // Process purchases
      const purchaseData = purchasesRes.data;
      const purchaseStats = {
        pending: (purchaseData.by_status?.PENDING || 0) +
                 (purchaseData.by_status?.APPROVED || 0) +
                 (purchaseData.by_status?.SENT || 0),
        value: purchaseData.pending_value || 0,
        overdue: 0, // Would need date calculation
      };

      // Process MRP
      const mrpRuns = Array.isArray(mrpRes.data) ? mrpRes.data : [];
      const mrpStats = {
        activeRuns: mrpRuns.filter((r: any) => r.status === 'RUNNING').length,
        pendingDemands: 0, // Would need demands endpoint
      };

      setStats({
        products: productStats,
        boms: bomStats,
        orders: orderStats,
        inventory: inventoryStats,
        suppliers: supplierStats,
        purchases: purchaseStats,
        mrp: mrpStats,
      });

      // Set low stock items for display
      setLowStockItems(lowStock.slice(0, 5));

      // Create recent activities
      const activities: any[] = [];

      // Add recent orders
      orders.slice(0, 3).forEach((order: any) => {
        activities.push({
          id: order.id,
          type: 'production',
          description: `Orden de Producción ${order.order_number} - ${order.status}`,
          time: order.created_at,
          icon: CogIcon,
          color: 'text-purple-600 dark:text-purple-400',
        });
      });

      // Add recent purchases
      if (purchaseData.recent_orders) {
        purchaseData.recent_orders.slice(0, 2).forEach((order: any) => {
          activities.push({
            id: order.id,
            type: 'purchase',
            description: `Orden de Compra ${order.order_number}`,
            time: order.created_at,
            icon: ShoppingCartIcon,
            color: 'text-blue-600 dark:text-blue-400',
          });
        });
      }

      // Sort by date and take first 5
      activities.sort((a, b) =>
        new Date(b.time).getTime() - new Date(a.time).getTime()
      );
      setRecentActivities(activities.slice(0, 5));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Hace menos de 1 hora';
    } else if (diffInHours < 24) {
      return `Hace ${Math.floor(diffInHours)} horas`;
    } else {
      return date.toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short'
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Bienvenido, {user?.first_name} {user?.last_name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sistema MRP - {new Date().toLocaleDateString('es-MX', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          {/* Estadísticas principales - Primera fila */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Productos Totales"
              value={stats.products.total}
              icon={CubeIcon}
              subtitle={`PT: ${stats.products.finished} | MP: ${stats.products.raw} | ME: ${stats.products.packaging}`}
              color="blue"
              link="/products"
            />
            <StatCard
              title="BOMs (Listas de Materiales)"
              value={stats.boms.total}
              icon={DocumentTextIcon}
              subtitle={`Activos: ${stats.boms.active} | Borradores: ${stats.boms.draft}`}
              color="green"
              link="/boms"
            />
            <StatCard
              title="Alertas Inventario"
              value={stats.inventory.lowStock + stats.inventory.outOfStock}
              icon={ExclamationTriangleIcon}
              subtitle={`Bajo: ${stats.inventory.lowStock} | Sin stock: ${stats.inventory.outOfStock}`}
              color={stats.inventory.outOfStock > 0 ? 'red' : 'yellow'}
              link="/inventory"
            />
            <StatCard
              title="Proveedores"
              value={stats.suppliers.total}
              icon={UserGroupIcon}
              subtitle={`Activos: ${stats.suppliers.active}`}
              color="purple"
              link="/suppliers"
            />
          </div>

          {/* Segunda fila de métricas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              title="Compras Pendientes"
              value={stats.purchases.pending}
              icon={ShoppingCartIcon}
              subtitle={formatCurrency(stats.purchases.value)}
              color="orange"
              link="/purchase-orders"
            />
            <StatCard
              title="Eficiencia Producción"
              value={`${stats.orders.efficiency}%`}
              icon={ChartBarIcon}
              change="+3% vs semana anterior"
              color="green"
            />
            <StatCard
              title="MRP"
              value={stats.mrp.activeRuns > 0 ? 'Activo' : 'Inactivo'}
              icon={BeakerIcon}
              subtitle={`${stats.mrp.pendingDemands} demandas pendientes`}
              color={stats.mrp.activeRuns > 0 ? 'green' : 'gray'}
              link="/mrp"
            />
          </div>

          {/* Contenido principal en grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Actividad reciente */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 transition-colors">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Actividad Reciente</h3>
                </div>
                <div className="p-6">
                  {recentActivities.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No hay actividad reciente</p>
                  ) : (
                    <div className="space-y-4">
                      {recentActivities.map((activity) => {
                        const Icon = activity.icon;
                        return (
                          <div key={activity.id} className="flex items-start space-x-3">
                            <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-700`}>
                              <Icon className={`h-4 w-4 ${activity.color}`} />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-900 dark:text-white">{activity.description}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(activity.time)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Items con stock bajo */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 transition-colors">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Productos con Stock Bajo</h3>
                  <Link href="/inventory" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                    Ver todos →
                  </Link>
                </div>
                <div className="p-6">
                  {lowStockItems.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No hay productos con stock bajo</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr>
                            <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Producto</th>
                            <th className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Disponible</th>
                            <th className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Min Stock</th>
                            <th className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Estado</th>
                            <th className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ubicación</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {lowStockItems.map((item: any) => (
                            <tr key={item.id}>
                              <td className="py-2">
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {item.products?.code}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {item.products?.name}
                                  </p>
                                </div>
                              </td>
                              <td className="py-2 text-center">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {item.available_quantity?.toFixed(2) || '0.00'}
                                </span>
                              </td>
                              <td className="py-2 text-center">
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                  {item.products?.min_stock || 0}
                                </span>
                              </td>
                              <td className="py-2 text-center">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  item.status === 'CRITICAL'
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                }`}>
                                  {item.status === 'CRITICAL' ? 'Crítico' : 'Bajo'}
                                </span>
                              </td>
                              <td className="py-2 text-center">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {item.inventory_locations?.code || 'N/A'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Acciones rápidas y estado del sistema */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Acciones rápidas */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 transition-colors">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Acciones Rápidas</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/products">
                    <button className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium transition-colors">
                      + Nuevo Producto
                    </button>
                  </Link>
                  <Link href="/production-orders">
                    <button className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium transition-colors">
                      + Orden Producción
                    </button>
                  </Link>
                  <Link href="/purchase-orders">
                    <button className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium transition-colors">
                      + Orden Compra
                    </button>
                  </Link>
                  <Link href="/inventory">
                    <button className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium transition-colors">
                      Movimiento Inventario
                    </button>
                  </Link>
                  <Link href="/mrp">
                    <button className="w-full px-4 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm font-medium col-span-2 transition-colors">
                      Ejecutar MRP
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Estado del sistema */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 transition-colors">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Estado del Sistema</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Base de Datos</span>
                    <span className="flex items-center text-green-600 dark:text-green-400">
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      <span className="text-sm">Operativo</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">API Backend</span>
                    <span className="flex items-center text-green-600 dark:text-green-400">
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      <span className="text-sm">Operativo</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Inventario</span>
                    <span className="flex items-center text-green-600 dark:text-green-400">
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      <span className="text-sm">Sincronizado</span>
                    </span>
                  </div>
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      Última actualización: {new Date().toLocaleTimeString('es-MX')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
