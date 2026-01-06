'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/lib/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

export default function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }

      if (requiredRoles && requiredRoles.length > 0) {
        if (!requiredRoles.includes(user.role as UserRole)) {
          router.push('/unauthorized');
        }
      }
    }
  }, [user, loading, requiredRoles, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requiredRoles && requiredRoles.length > 0) {
    if (!requiredRoles.includes(user.role as UserRole)) {
      return null;
    }
  }

  return <>{children}</>;
}