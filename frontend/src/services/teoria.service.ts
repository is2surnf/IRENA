// frontend/src/services/teoria.service.ts (VERSIÓN CORREGIDA COMPLETA)
import axios from 'axios';

export interface Teoria {
  id: number;
  titulo: string;
  contenido: string;
  categoria: string;
  fecha_creacion?: string;
  leido?: boolean;
}

export interface TeoriaCreate {
  titulo: string;
  contenido: string;
  categoria: string;
}

export interface TeoriaUpdate {
  titulo?: string;
  contenido?: string;
  categoria?: string;
}

export interface TareaTeorica {
  id: number;
  teoria_id: number;
  reaccion_id?: number;
  descripcion_tarea: string;
  dificultad?: string;
}

export interface ProgresoUsuario {
  teoria_id: number;
  leido: boolean;
  fecha: string;
}

// Configuración de la API
const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';
const API_URL = `${API_BASE_URL}/api/teoria`;

console.log('Teoria API_URL configured:', API_URL);

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
    console.log('Teoria API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('Error en API de Teoría:', error);
    console.error('Error details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 404) {
      throw new Error('Tema de teoría no encontrado');
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
    console.log('Teoria API Request:', config.method?.toUpperCase(), config.url, config.params);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Obtener todos los temas de teoría
 */
export const getTodasLasTeoria = async (params?: {
  skip?: number;
  limit?: number;
  categoria?: string;
}): Promise<Teoria[]> => {
  try {
    const response = await axiosInstance.get('/', {
      params: {
        skip: params?.skip || 0,
        limit: params?.limit || 100,
        ...(params?.categoria && { categoria: params.categoria }),
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo temas de teoría:', error);
    throw error;
  }
};

/**
 * Obtener teorías por categoría
 */
export const getTeoriasPorCategoria = async (categoria: string): Promise<Teoria[]> => {
  try {
    const response = await axiosInstance.get(`/categoria/${encodeURIComponent(categoria)}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo teorías por categoría:', error);
    throw error;
  }
};

/**
 * Buscar teorías por término
 */
export const buscarTeorias = async (
  searchTerm: string, 
  categoria?: string
): Promise<Teoria[]> => {
  try {
    if (!searchTerm?.trim()) {
      return [];
    }

    const response = await axiosInstance.get('/buscar', {
      params: {
        q: searchTerm,
        ...(categoria && { categoria }),
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error buscando teorías:', error);
    throw error;
  }
};

/**
 * Obtener una teoría específica por ID
 */
export const getTeoria = async (id: number): Promise<Teoria> => {
  try {
    const response = await axiosInstance.get(`/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo teoría:', error);
    throw error;
  }
};

/**
 * Crear nuevo tema de teoría
 */
export const crearTeoria = async (teoria: TeoriaCreate): Promise<Teoria> => {
  try {
    const response = await axiosInstance.post('/', teoria);
    return response.data;
  } catch (error) {
    console.error('Error creando teoría:', error);
    throw error;
  }
};

/**
 * Actualizar tema de teoría
 */
export const actualizarTeoria = async (
  id: number, 
  teoria: TeoriaUpdate
): Promise<Teoria> => {
  try {
    const response = await axiosInstance.put(`/${id}`, teoria);
    return response.data;
  } catch (error) {
    console.error('Error actualizando teoría:', error);
    throw error;
  }
};

/**
 * Eliminar tema de teoría
 */
export const eliminarTeoria = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/${id}`);
  } catch (error) {
    console.error('Error eliminando teoría:', error);
    throw error;
  }
};

/**
 * Marcar teoría como leída - CORREGIDO
 */
export const marcarComoLeida = async (
  teoriaId: number, 
  usuarioId: number = 1
): Promise<any> => {
  try {
    const response = await axiosInstance.post(`/${teoriaId}/marcar-leida`, { 
      usuario_id: usuarioId 
    });
    return response.data;
  } catch (error) {
    console.error('Error marcando teoría como leída:', error);
    throw error;
  }
};

/**
 * Obtener progreso del usuario - CORREGIDO
 */
export const getProgresoUsuario = async (usuarioId: number): Promise<ProgresoUsuario[]> => {
  try {
    const response = await axiosInstance.get(`/progreso/${usuarioId}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo progreso:', error);
    throw error;
  }
};

/**
 * Obtener tareas relacionadas con una teoría - CORREGIDO
 */
export const getTareasTeoria = async (teoriaId: number): Promise<TareaTeorica[]> => {
  try {
    const response = await axiosInstance.get(`/${teoriaId}/tareas`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo tareas de teoría:', error);
    throw error;
  }
};

/**
 * Obtener categorías disponibles
 */
export const getCategorias = async (): Promise<string[]> => {
  try {
    const response = await axiosInstance.get('/categorias');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    throw error;
  }
};

/**
 * Health check del servicio
 */
export const healthCheckTeoria = async () => {
  try {
    const response = await axiosInstance.get('/health/status');
    return response.data;
  } catch (error) {
    console.error('Error en health check de teoría:', error);
    throw error;
  }
};

/**
 * Diagnóstico completo del servicio - NUEVO
 */
export const diagnosticoServicio = async (): Promise<any> => {
  try {
    const health = await axiosInstance.get('/health/status');
    const teorias = await axiosInstance.get('/?limit=1');
    const categorias = await axiosInstance.get('/categorias');
    
    return {
      status: 'healthy',
      health: health.data,
      teorias: teorias.data.length > 0 ? 'disponibles' : 'no disponibles',
      categorias: categorias.data.length,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    };
  }
};

// Utilidades
export const formatearContenido = (contenido: string): string => {
  // Formatear contenido para mostrar mejor en la UI
  return contenido.replace(/\n/g, '<br/>');
};

export const truncarTexto = (texto: string, limite: number = 150): string => {
  if (texto.length <= limite) return texto;
  return texto.substring(0, limite) + '...';
};

export const validarCategoria = (categoria: string): boolean => {
  const categoriasValidas = [
    'Estructura Atómica',
    'Enlace Químico', 
    'Estequiometría',
    'Termoquímica',
    'Cinética Química',
    'Equilibrio Químico',
    'Ácidos y Bases',
    'Redox',
    'Química Orgánica',
    'Fundamentos'
  ];
  return categoriasValidas.includes(categoria);
};

export const getDificultadColor = (dificultad?: string): string => {
  switch (dificultad?.toLowerCase()) {
    case 'fácil':
    case 'facil':
      return 'text-green-400 bg-green-600/20 border-green-600/30';
    case 'medio':
    case 'intermedio':
      return 'text-yellow-400 bg-yellow-600/20 border-yellow-600/30';
    case 'difícil':
    case 'dificil':
    case 'avanzado':
      return 'text-red-400 bg-red-600/20 border-red-600/30';
    default:
      return 'text-gray-400 bg-gray-600/20 border-gray-600/30';
  }
};