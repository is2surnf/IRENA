//src/services/utensiliosService.ts
import axios from 'axios';

export interface Utensilio {
  id: number;
  nombre: string;
  descripcion: string;
  capacidad?: number;
  tipo: string;
  imagen_url?: string; // Campo agregado para las imágenes
}

export interface UtensilioCreate {
  nombre: string;
  descripcion?: string;
  capacidad?: number;
  tipo: string;
  imagen_url?: string; // Campo agregado
}

export interface UtensilioUpdate {
  nombre?: string;
  descripcion?: string;
  capacidad?: number;
  tipo?: string;
  imagen_url?: string; // Campo agregado
}

// Configuración de la API usando las variables de entorno
const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';
const API_URL = `${API_BASE_URL}/api/utensilios`;

console.log('API_URL configured:', API_URL); // Debug log

// Instancia de axios configurada
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejo de errores mejorado
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('Error en API de Utensilios:', error);
    console.error('Error details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 404) {
      throw new Error('Utensilio no encontrado');
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data?.detail || 'Solicitud inválida');
    } else if (error.response?.status >= 500) {
      throw new Error('Error interno del servidor');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Tiempo de espera agotado');
    } else if (!error.response) {
      throw new Error('Error de conexión. Verifica que el servidor esté ejecutándose.');
    }
    
    throw error;
  }
);

// Interceptor para requests (debug)
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url, config.params);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Obtener todos los utensilios con filtros opcionales
 */
export const getUtensilios = async (params?: {
  skip?: number;
  limit?: number;
  tipo?: string;
}): Promise<Utensilio[]> => {
  try {
    const response = await axiosInstance.get('/', {
      params: {
        skip: params?.skip || 0,
        limit: params?.limit || 100,
        ...(params?.tipo && { tipo: params.tipo }),
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo utensilios:', error);
    throw error;
  }
};

/**
 * Buscar utensilios por término de búsqueda
 */
export const searchUtensilios = async (
  searchTerm: string, 
  tipo?: string
): Promise<Utensilio[]> => {
  try {
    if (!searchTerm?.trim()) {
      return [];
    }

    const response = await axiosInstance.get('/search', {
      params: {
        q: searchTerm,
        ...(tipo && { tipo }),
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error buscando utensilios:', error);
    throw error;
  }
};

/**
 * Obtener utensilios por tipo específico
 */
export const getUtensiliosByTipo = async (tipo: string): Promise<Utensilio[]> => {
  try {
    const response = await axiosInstance.get(`/tipo/${encodeURIComponent(tipo)}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo utensilios por tipo:', error);
    throw error;
  }
};

/**
 * Obtener un utensilio específico por ID
 */
export const getUtensilio = async (id: number): Promise<Utensilio> => {
  try {
    const response = await axiosInstance.get(`/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo utensilio:', error);
    throw error;
  }
};

/**
 * Crear un nuevo utensilio
 */
export const createUtensilio = async (utensilio: UtensilioCreate): Promise<Utensilio> => {
  try {
    const response = await axiosInstance.post('/', utensilio);
    return response.data;
  } catch (error) {
    console.error('Error creando utensilio:', error);
    throw error;
  }
};

/**
 * Actualizar un utensilio existente
 */
export const updateUtensilio = async (
  id: number, 
  utensilio: UtensilioUpdate
): Promise<Utensilio> => {
  try {
    const response = await axiosInstance.put(`/${id}`, utensilio);
    return response.data;
  } catch (error) {
    console.error('Error actualizando utensilio:', error);
    throw error;
  }
};

/**
 * Eliminar un utensilio
 */
export const deleteUtensilio = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/${id}`);
  } catch (error) {
    console.error('Error eliminando utensilio:', error);
    throw error;
  }
};

/**
 * Obtener tipos de utensilios disponibles
 */
export const getTiposUtensilios = async (): Promise<string[]> => {
  try {
    const response = await axiosInstance.get('/tipos');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo tipos:', error);
    throw error;
  }
};

/**
 * Health check del servicio
 */
export const healthCheck = async () => {
  try {
    const response = await axiosInstance.get('/health/status');
    return response.data;
  } catch (error) {
    console.error('Error en health check:', error);
    throw error;
  }
};

// Utilidades para manejo de imágenes
export const getImageUrl = (imagen_url?: string): string => {
  if (!imagen_url) {
    return '/images/utensilios/default.png'; // Imagen por defecto
  }
  
  // Si ya es una URL completa, devolverla tal como está
  if (imagen_url.startsWith('http://') || imagen_url.startsWith('https://')) {
    return imagen_url;
  }
  
  // Si es solo el nombre del archivo, construir la ruta completa
  return `/images/utensilios/${imagen_url}`;
};

// Utilidades existentes
export const validateTipoUtensilio = (tipo: string): boolean => {
  const tiposValidos = ['Vidrieria y plasticos', 'Equipos basicos', 'Otros materiales'];
  return tiposValidos.includes(tipo);
};

export const formatCapacidad = (capacidad?: number): string => {
  if (!capacidad) return '';
  if (capacidad >= 1000) {
    return `${(capacidad / 1000).toFixed(1)} L`;
  }
  return `${capacidad} ml`;
};