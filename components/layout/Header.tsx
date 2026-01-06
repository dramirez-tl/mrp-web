'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { Menu } from '@headlessui/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Menu button and title */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 lg:hidden"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <h2 className="ml-4 text-xl font-semibold text-gray-800">
            Sistema MRP - Tonic Life
          </h2>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {/* Date and time */}
          <div className="hidden md:block text-sm text-gray-600">
            {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
          </div>

          {/* Notifications */}
          <button className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100">
            <BellIcon className="h-6 w-6" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          {/* User menu */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center space-x-3 rounded-lg px-3 py-2 hover:bg-gray-100">
              <UserCircleIcon className="h-8 w-8 text-gray-600" />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-700">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.role.replace(/_/g, ' ')}
                </p>
              </div>
              <ChevronDownIcon className="h-4 w-4 text-gray-600" />
            </Menu.Button>

            <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="/profile"
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } flex items-center px-4 py-2 text-sm text-gray-700`}
                    >
                      <UserCircleIcon className="mr-3 h-5 w-5" />
                      Mi Perfil
                    </a>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={logout}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                    >
                      <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                      Cerrar Sesión
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Menu>
        </div>
      </div>
    </header>
  );
}