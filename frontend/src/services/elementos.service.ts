//src/services/elementosService.ts
import axios from 'axios';

export interface Elemento {
  id: number;
  nombre: string;
  simbolo?: string;
  numero_atomico?: number;
  masa_atomica?: number;
  densidad?: number;
  estado?: string;
  descripcion?: string;
  categoria?: string;
  imagen_url?: string;
}

export interface ElementoCreate {
  nombre: string;
  simbolo?: string;
  numero_atomico?: number;
  masa_atomica?: number;
  densidad?: number;
  estado?: string;
  descripcion?: string;
  categoria?: string;
  imagen_url?: string;
}

export interface ElementoUpdate {
  nombre?: string;
  simbolo?: string;
  numero_atomico?: number;
  masa_atomica?: number;
  densidad?: number;
  estado?: string;
  descripcion?: string;
  categoria?: string;
  imagen_url?: string;
}

// Configuración de la API usando las variables de entorno
const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';
const API_URL = `${API_BASE_URL}/api/elementos`;

console.log('Elementos API_URL configured:', API_URL);

// Instancia de axios configurada
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejo de errores
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('Error en API de Elementos:', error);
    console.error('Error details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 404) {
      throw new Error('Elemento no encontrado');
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
 * Obtener todos los elementos con filtros opcionales
 */
export const getElementos = async (params?: {
  skip?: number;
  limit?: number;
  categoria?: string;
  estado?: string;
}): Promise<Elemento[]> => {
  try {
    const response = await axiosInstance.get('/', {
      params: {
        skip: params?.skip || 0,
        limit: params?.limit || 100,
        ...(params?.categoria && { categoria: params.categoria }),
        ...(params?.estado && { estado: params.estado }),
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo elementos:', error);
    throw error;
  }
};

/**
 * Buscar elementos por término de búsqueda
 */
export const searchElementos = async (
  searchTerm: string, 
  categoria?: string,
  estado?: string
): Promise<Elemento[]> => {
  try {
    if (!searchTerm?.trim()) {
      return [];
    }

    const response = await axiosInstance.get('/search', {
      params: {
        q: searchTerm,
        ...(categoria && { categoria }),
        ...(estado && { estado }),
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error buscando elementos:', error);
    throw error;
  }
};

/**
 * Obtener elementos por categoría específica
 */
export const getElementsByCategoria = async (categoria: string): Promise<Elemento[]> => {
  try {
    const response = await axiosInstance.get(`/categoria/${encodeURIComponent(categoria)}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo elementos por categoría:', error);
    throw error;
  }
};

/**
 * Obtener elementos por estado específico
 */
export const getElementsByEstado = async (estado: string): Promise<Elemento[]> => {
  try {
    const response = await axiosInstance.get(`/estado/${encodeURIComponent(estado)}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo elementos por estado:', error);
    throw error;
  }
};

/**
 * Obtener un elemento específico por ID
 */
export const getElemento = async (id: number): Promise<Elemento> => {
  try {
    const response = await axiosInstance.get(`/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo elemento:', error);
    throw error;
  }
};

/**
 * Crear un nuevo elemento
 */
export const createElemento = async (elemento: ElementoCreate): Promise<Elemento> => {
  try {
    const response = await axiosInstance.post('/', elemento);
    return response.data;
  } catch (error) {
    console.error('Error creando elemento:', error);
    throw error;
  }
};

/**
 * Actualizar un elemento existente
 */
export const updateElemento = async (
  id: number, 
  elemento: ElementoUpdate
): Promise<Elemento> => {
  try {
    const response = await axiosInstance.put(`/${id}`, elemento);
    return response.data;
  } catch (error) {
    console.error('Error actualizando elemento:', error);
    throw error;
  }
};

/**
 * Eliminar un elemento
 */
export const deleteElemento = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/${id}`);
  } catch (error) {
    console.error('Error eliminando elemento:', error);
    throw error;
  }
};

/**
 * Obtener categorías de elementos disponibles
 */
export const getCategoriasElementos = async (): Promise<string[]> => {
  try {
    const response = await axiosInstance.get('/categorias');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    throw error;
  }
};

/**
 * Obtener estados de elementos disponibles
 */
export const getEstadosElementos = async (): Promise<string[]> => {
  try {
    const response = await axiosInstance.get('/estados');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo estados:', error);
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
    return '/images/elementos/default.png'; // Imagen por defecto
  }
  
  // Si ya es una URL completa, devolverla tal como está
  if (imagen_url.startsWith('http://') || imagen_url.startsWith('https://')) {
    return imagen_url;
  }
  
  // Si es solo el nombre del archivo, construir la ruta completa
  return `/images/elementos/${imagen_url}`;
};

// Utilidades existentes
export const validateCategoriaElemento = (categoria: string): boolean => {
  const categoriasValidas = ['Metales', 'No metales', 'Gases y Halógenos', 'Ácidos', 'Bases', 'Sales'];
  return categoriasValidas.includes(categoria);
};

export const validateEstadoElemento = (estado: string): boolean => {
  const estadosValidos = ['Gas', 'Líquido', 'Sólido'];
  return estadosValidos.includes(estado);
};

export const formatMasaAtomica = (masa?: number): string => {
  if (!masa) return '';
  return `${masa.toFixed(3)} u`;
};

export const formatDensidad = (densidad?: number): string => {
  if (!densidad) return '';
  return `${densidad.toFixed(2)} g/cm³`;
};