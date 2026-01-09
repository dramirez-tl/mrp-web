'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { EyeIcon, EyeSlashIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { login } = useAuth();

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`${field} copiado al portapapeles`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast.error('Error al copiar al portapapeles');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login({ email, password });
    } catch (error) {
      console.error('Error en login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl dark:shadow-gray-900/50 overflow-hidden">
          {/* Header */}
          <div className="bg-[#1e3a6f] px-8 py-6">
            <h1 className="text-2xl font-bold text-white text-center">
              MRP Tonic Life
            </h1>
            <p className="text-blue-200 text-center mt-2">
              Sistema de Planificación de Recursos
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 shadow-sm focus:border-[#7cb342] focus:ring-[#7cb342] dark:focus:border-[#7cb342] dark:focus:ring-[#7cb342] sm:text-sm px-4 py-3 border transition-colors"
                placeholder="usuario@toniclife.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Contraseña
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 shadow-sm focus:border-[#7cb342] focus:ring-[#7cb342] dark:focus:border-[#7cb342] dark:focus:ring-[#7cb342] sm:text-sm px-4 py-3 border pr-10 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-[#7cb342] focus:ring-[#7cb342] transition-colors"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Recordarme
                </label>
              </div>

              <a href="#" className="text-sm text-[#1e3a6f] dark:text-blue-400 hover:text-[#7cb342] dark:hover:text-[#7cb342] transition-colors">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#7cb342] hover:bg-green-600 dark:hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7cb342] dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Iniciando sesión...
                </div>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              © 2024 Tonic Life. Todos los derechos reservados.
            </p>
          </div>
        </div>

        {/* Test credentials info - only show in development */}
        {process.env.NEXT_PUBLIC_ENV === 'development' && (
          <div className="mt-4 p-4 bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 rounded-lg shadow-md dark:shadow-gray-900/50">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Credenciales de prueba:</p>
            <div className="space-y-3">
              {/* Admin Credentials */}
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md border border-gray-200 dark:border-gray-600">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-200 mb-2">Admin:</p>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-600 dark:text-gray-300 font-mono">admin@toniclife.com</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('admin@toniclife.com', 'admin-email')}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    title="Copiar email"
                  >
                    {copiedField === 'admin-email' ? (
                      <CheckIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <ClipboardDocumentIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-300 font-mono">Admin123!</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('Admin123!', 'admin-password')}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    title="Copiar contraseña"
                  >
                    {copiedField === 'admin-password' ? (
                      <CheckIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <ClipboardDocumentIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Gerente Credentials */}
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md border border-gray-200 dark:border-gray-600">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-200 mb-2">Gerente:</p>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-600 dark:text-gray-300 font-mono">gerente@toniclife.com</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('gerente@toniclife.com', 'gerente-email')}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    title="Copiar email"
                  >
                    {copiedField === 'gerente-email' ? (
                      <CheckIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <ClipboardDocumentIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-300 font-mono">Gerente123!</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('Gerente123!', 'gerente-password')}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    title="Copiar contraseña"
                  >
                    {copiedField === 'gerente-password' ? (
                      <CheckIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <ClipboardDocumentIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Planeador Credentials */}
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md border border-gray-200 dark:border-gray-600">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-200 mb-2">Planeador:</p>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-600 dark:text-gray-300 font-mono">planeador@toniclife.com</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('planeador@toniclife.com', 'planeador-email')}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    title="Copiar email"
                  >
                    {copiedField === 'planeador-email' ? (
                      <CheckIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <ClipboardDocumentIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-300 font-mono">Planeador123!</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('Planeador123!', 'planeador-password')}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    title="Copiar contraseña"
                  >
                    {copiedField === 'planeador-password' ? (
                      <CheckIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <ClipboardDocumentIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
