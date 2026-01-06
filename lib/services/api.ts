import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Crear instancia de axios
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  withCredentials: true, // Importante para CORS con cookies
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Si el error es 401 y no es un retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = Cookies.get('refresh_token');

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token } = response.data.data;
          Cookies.set('access_token', access_token);

          // Reintentar la petición original con el nuevo token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
          }
          return api(originalRequest);
        } catch (refreshError) {
          // Si el refresh falla, limpiar tokens y redirigir a login
          Cookies.remove('access_token');
          Cookies.remove('refresh_token');
          Cookies.remove('user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No hay refresh token, redirigir a login
        window.location.href = '/login';
      }
    }

    // Manejar otros errores
    if (error.response?.status === 400) {
      const message = (error.response?.data as any)?.message || 'Solicitud inválida';
      console.error('Error 400 - Bad Request:', {
        url: originalRequest.url,
        params: originalRequest.params,
        data: originalRequest.data,
        responseData: error.response?.data
      });
      toast.error(`Error en la solicitud: ${message}`);
    } else if (error.response?.status === 403) {
      toast.error('No tienes permisos para realizar esta acción');
    } else if (error.response?.status === 404) {
      toast.error('Recurso no encontrado');
    } else if (error.response?.status === 500) {
      toast.error('Error del servidor. Por favor, intenta más tarde');
    } else if (error.code === 'ECONNABORTED') {
      toast.error('La petición tardó demasiado tiempo');
    } else if (!error.response) {
      toast.error('Error de conexión. Verifica tu conexión a internet');
    }

    return Promise.reject(error);
  }
);

export default api;