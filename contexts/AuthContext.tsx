'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, LoginRequest } from '@/lib/types';
import authService from '@/lib/services/auth.service';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => void;
  hasRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  checkAuth: () => {},
  hasRole: () => false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const currentUser = authService.getCurrentUser();
      if (currentUser && authService.isAuthenticated()) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);

      if (response.success) {
        setUser(response.data.user);
        toast.success('Inicio de sesión exitoso');
        router.push('/dashboard');
      } else {
        toast.error(response.message || 'Error al iniciar sesión');
      }
    } catch (error: any) {
      console.error('Error en login:', error);
      const message = error.response?.data?.message || 'Error al iniciar sesión';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      toast.success('Sesión cerrada');
    } catch (error) {
      console.error('Error en logout:', error);
      toast.error('Error al cerrar sesión');
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (roles: string[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        checkAuth,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};