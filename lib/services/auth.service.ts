import api from './api';
import Cookies from 'js-cookie';
import { LoginRequest, LoginResponse, User } from '@/lib/types';

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post('/auth/login', credentials);

    // El backend devuelve la data directamente, no en un objeto con 'success'
    if (response.data) {
      const { tokens, user } = response.data;

      // Guardar tokens en cookies
      Cookies.set('access_token', tokens.accessToken, { expires: 1 }); // 1 día
      Cookies.set('refresh_token', tokens.refreshToken, { expires: 7 }); // 7 días
      Cookies.set('user', JSON.stringify(user), { expires: 7 });

      // Retornar en el formato esperado por el frontend
      return {
        success: true,
        message: 'Login successful',
        data: {
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
          user,
          expires_in: 3600 // 1 hora en segundos
        }
      };
    }

    throw new Error('Login failed');
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      // Limpiar cookies
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      Cookies.remove('user');

      // Redirigir a login
      window.location.href = '/login';
    }
  }

  async refreshToken(): Promise<string | null> {
    const refreshToken = Cookies.get('refresh_token');

    if (!refreshToken) {
      return null;
    }

    try {
      const response = await api.post<LoginResponse>('/auth/refresh', {
        refresh_token: refreshToken,
      });

      if (response.data.success) {
        const { access_token } = response.data.data;
        Cookies.set('access_token', access_token, { expires: 1 });
        return access_token;
      }
    } catch (error) {
      console.error('Error al refrescar token:', error);
      this.logout();
    }

    return null;
  }

  getCurrentUser(): User | null {
    const userCookie = Cookies.get('user');

    if (!userCookie) {
      return null;
    }

    try {
      return JSON.parse(userCookie) as User;
    } catch (error) {
      console.error('Error al parsear usuario:', error);
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!Cookies.get('access_token');
  }

  hasRole(allowedRoles: string[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    return allowedRoles.includes(user.role);
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }

  async requestPasswordReset(email: string): Promise<void> {
    await api.post('/auth/request-reset', { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post('/auth/reset-password', {
      token,
      new_password: newPassword,
    });
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.patch<{ data: User }>('/auth/profile', data);
    const updatedUser = response.data.data;

    // Actualizar usuario en cookies
    Cookies.set('user', JSON.stringify(updatedUser), { expires: 7 });

    return updatedUser;
  }
}

export default new AuthService();