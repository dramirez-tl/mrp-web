'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  HomeIcon,
  CubeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  CogIcon,
  ChartBarIcon,
  BeakerIcon,
  TruckIcon,
  ArchiveBoxIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline';
import { UserRole } from '@/lib/types';

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const menuItems: MenuItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
    roles: Object.values(UserRole),
  },
  {
    name: 'Productos',
    href: '/products',
    icon: CubeIcon,
    roles: Object.values(UserRole),
  },
  {
    name: 'Proveedores',
    href: '/suppliers',
    icon: UserGroupIcon,
    roles: [
      UserRole.SUPER_ADMIN,
      UserRole.GERENTE_PRODUCCION,
      UserRole.COMPRADOR,
      UserRole.PLANEADOR,
      UserRole.ALMACENISTA,
      UserRole.CALIDAD,
      UserRole.CONSULTA,
    ],
  },
  {
    name: 'BOMs',
    href: '/boms',
    icon: DocumentTextIcon,
    roles: [
      UserRole.SUPER_ADMIN,
      UserRole.GERENTE_PRODUCCION,
      UserRole.PLANEADOR,
      UserRole.SUPERVISOR,
      UserRole.CALIDAD,
      UserRole.CONSULTA,
    ],
  },
  {
    name: 'Planificación MRP',
    href: '/mrp',
    icon: ClipboardDocumentListIcon,
    roles: [
      UserRole.SUPER_ADMIN,
      UserRole.GERENTE_PRODUCCION,
      UserRole.PLANEADOR,
    ],
  },
  {
    name: 'Órdenes de Producción',
    href: '/production-orders',
    icon: BeakerIcon,
    roles: [
      UserRole.SUPER_ADMIN,
      UserRole.GERENTE_PRODUCCION,
      UserRole.PLANEADOR,
      UserRole.SUPERVISOR,
    ],
  },
  {
    name: 'Inventario',
    href: '/inventory',
    icon: ArchiveBoxIcon,
    roles: [
      UserRole.SUPER_ADMIN,
      UserRole.GERENTE_PRODUCCION,
      UserRole.ALMACENISTA,
      UserRole.PLANEADOR,
      UserRole.SUPERVISOR,
    ],
  },
  {
    name: 'Compras',
    href: '/purchase-orders',
    icon: ShoppingCartIcon,
    roles: [
      UserRole.SUPER_ADMIN,
      UserRole.GERENTE_PRODUCCION,
      UserRole.COMPRADOR,
    ],
  },
  {
    name: 'Calidad',
    href: '/quality',
    icon: BeakerIcon,
    roles: [
      UserRole.SUPER_ADMIN,
      UserRole.GERENTE_PRODUCCION,
      UserRole.CALIDAD,
      UserRole.SUPERVISOR,
    ],
  },
  {
    name: 'Reportes',
    href: '/reports',
    icon: ChartBarIcon,
    roles: Object.values(UserRole),
  },
  {
    name: 'Configuración',
    href: '/settings',
    icon: CogIcon,
    roles: [UserRole.SUPER_ADMIN],
  },
];

interface SidebarProps {
  isOpen: boolean;
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(user.role as UserRole)
  );

  return (
    <aside
      className={`${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } fixed inset-y-0 left-0 z-30 w-64 bg-[#1e3a6f] transition-transform duration-300 lg:static lg:translate-x-0`}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-center border-b border-blue-700">
          <h1 className="text-xl font-bold text-white">MRP Tonic Life</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {filteredMenuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#7cb342] text-white'
                        : 'text-gray-300 hover:bg-blue-700 hover:text-white'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Info */}
        <div className="border-t border-blue-700 p-4">
          <div className="text-sm">
            <p className="font-medium text-white">
              {user.first_name} {user.last_name}
            </p>
            <p className="text-gray-400">{user.role.replace('_', ' ')}</p>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}