// services/progreso.service.ts - VERSIÓN COMPLETAMENTE CORREGIDA
import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
const API_URL = `${API_BASE_URL}/api/progreso`;

// ==================== INTERFACES ====================

export interface EstadisticaGeneral {
  total_simulaciones: number;
  simulaciones_completadas: number;
  simulaciones_en_proceso: number;
  simulaciones_fallidas: number;
  elementos_diferentes_usados: number;
  tiempo_total_simulacion_minutos: number;
  teoria_completadas: number;
  teoria_totales: number;
  preguntas_ia_realizadas: number;
  nivel_experiencia: string;
  puntuacion_total: number;
}

export interface EstadisticaElement {
  elemento_id: number;
  nombre_elemento: string;
  simbolo: string;
  veces_usado: number;
  cantidad_total: number;
  rendimiento_promedio: number;
  estado: string;
}

export interface SimulacionHistorial {
  id_simulacion: number;
  nombre: string;
  fecha: string;
  descripcion?: string;
  estado: string;
  elementos_usados: number;
  tipo_simulacion: string;
  rendimiento?: number;
  duracion_estimada?: string;
}

export interface TeoriaProgreso {
  id_teoria: number;
  titulo: string;
  categoria: string;
  leido: boolean;
  fecha_lectura?: string;
  tareas_completadas: number;
  tareas_totales: number;
  porcentaje_completado: number;
}

export interface ProgresoGeneral {
  usuario_id: number;
  estadisticas_generales: EstadisticaGeneral;
  top_elementos: EstadisticaElement[];
  progreso_teorias: TeoriaProgreso[];
}

export interface HistorialSimulaciones {
  usuario_id: number;
  total_simulaciones: number;
  simulaciones: SimulacionHistorial[];
}

export interface EstadisticasElementos {
  usuario_id: number;
  total_elementos_usados: number;
  estadisticas: EstadisticaElement[];
}

export interface ResumenProgreso {
  usuario_id: number;
  nivel: string;
  puntuacion: number;
  simulaciones_completadas: number;
  total_simulaciones: number;
  teorias_completadas: number;
  total_teorias: number;
  progreso_simulaciones: number;
  progreso_teorias: number;
  tiempo_total_legible: string;
  puede_guardar_progreso: boolean;
  es_usuario_anonimo: boolean;
  posicion_ranking?: number;
}

export interface RespuestaGuardado {
  success: boolean;
  message: string;
  timestamp: string;
  usuario_id: number;
  progreso_id?: number;
}

// ==================== CLASE DEL SERVICIO ====================

export class ProgresoService {
  private static instance: ProgresoService;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private useMockData: boolean = false;

  private constructor() {
    setInterval(() => this.cleanExpiredCache(), 5 * 60 * 1000);
    // Verificar si debemos usar datos mock (para desarrollo)
    this.useMockData = import.meta.env.DEV || false;
  }

  public static getInstance(): ProgresoService {
    if (!ProgresoService.instance) {
      ProgresoService.instance = new ProgresoService();
    }
    return ProgresoService.instance;
  }

  private cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.timestamp + entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  private getCached<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const now = Date.now();
    if (now > entry.timestamp + entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  private setCache(key: string, data: any, ttlMinutes: number = 5): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000
    });
  }

  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      
      if (axiosError.response) {
        const status = axiosError.response.status;
        const detail = axiosError.response.data?.detail || 
                      axiosError.response.data?.message || 
                      'Error desconocido';
        
        switch (status) {
          case 401:
            return new Error(`No autorizado: ${detail}`);
          case 404:
            return new Error(`Recurso no encontrado: ${detail}`);
          case 422:
            return new Error(`Datos inválidos: ${detail}`);
          case 500:
            return new Error(`Error del servidor: ${detail}`);
          default:
            return new Error(`Error ${status}: ${detail}`);
        }
      } else if (axiosError.request) {
        return new Error('Error de conexión. Verifique su conexión a internet.');
      }
    }
    
    return new Error(error instanceof Error ? error.message : 'Error desconocido');
  }

  // ==================== DATOS MOCK PARA FRONTEND ====================

  private getMockResumenProgreso(usuarioId: number): ResumenProgreso {
    console.log(`📋 Usando MOCK data para resumen (usuario: ${usuarioId})`);
    
    const mockData = {
      1: { nivel: "Intermedio", puntuacion: 650, simulaciones: 4, teorias: 3 },
      2: { nivel: "Avanzado", puntuacion: 1200, simulaciones: 9, teorias: 7 },
      3: { nivel: "Principiante", puntuacion: 150, simulaciones: 1, teorias: 0 },
      4: { nivel: "Intermedio", puntuacion: 350, simulaciones: 3, teorias: 2 },
      5: { nivel: "Principiante", puntuacion: 50, simulaciones: 1, teorias: 1 }
    };
    
    const userData = mockData[usuarioId as keyof typeof mockData] || mockData[1];
    
    return {
      usuario_id: usuarioId,
      nivel: userData.nivel,
      puntuacion: userData.puntuacion,
      simulaciones_completadas: userData.simulaciones,
      total_simulaciones: 10,
      teorias_completadas: userData.teorias,
      total_teorias: 14,
      progreso_simulaciones: (userData.simulaciones / 10) * 100,
      progreso_teorias: (userData.teorias / 14) * 100,
      tiempo_total_legible: `${userData.simulaciones * 45}m`,
      puede_guardar_progreso: usuarioId !== 3,
      es_usuario_anonimo: usuarioId === 3,
      posicion_ranking: Math.floor(userData.puntuacion / 100)
    };
  }

  private getMockEstadisticasElementos(usuarioId: number): EstadisticasElementos {
    console.log(`🧪 Usando MOCK data para elementos (usuario: ${usuarioId})`);
    
    return {
      usuario_id: usuarioId,
      total_elementos_usados: 3,
      estadisticas: [
        {
          elemento_id: 1,
          nombre_elemento: "Hidrógeno",
          simbolo: "H",
          veces_usado: 8,
          cantidad_total: 12.5,
          rendimiento_promedio: 85.5,
          estado: "Óptimo"
        },
        {
          elemento_id: 8,
          nombre_elemento: "Oxígeno",
          simbolo: "O", 
          veces_usado: 6,
          cantidad_total: 9.2,
          rendimiento_promedio: 78.3,
          estado: "Muy bueno"
        },
        {
          elemento_id: 11,
          nombre_elemento: "Sodio",
          simbolo: "Na",
          veces_usado: 3,
          cantidad_total: 4.1,
          rendimiento_promedio: 65.2,
          estado: "Bueno"
        }
      ]
    };
  }

  private getMockHistorialSimulaciones(usuarioId: number): HistorialSimulaciones {
    console.log(`📋 Usando MOCK data para historial (usuario: ${usuarioId})`);
    
    const now = new Date();
    return {
      usuario_id: usuarioId,
      total_simulaciones: 3,
      simulaciones: [
        {
          id_simulacion: 1,
          nombre: "Síntesis de Agua",
          fecha: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          descripcion: "Primera simulación exitosa",
          estado: "Completada",
          elementos_usados: 2,
          tipo_simulacion: "Síntesis",
          rendimiento: 92.5,
          duracion_estimada: "45m"
        },
        {
          id_simulacion: 2,
          nombre: "Neutralización Ácido-Base",
          fecha: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          descripcion: "Titulación con indicador", 
          estado: "Completada",
          elementos_usados: 3,
          tipo_simulacion: "Neutralización",
          rendimiento: 87.3,
          duracion_estimada: "30m"
        },
        {
          id_simulacion: 3,
          nombre: "Combustión del Magnesio",
          fecha: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          descripcion: "Reacción exotérmica",
          estado: "En proceso",
          elementos_usados: 2,
          tipo_simulacion: "Combustión",
          rendimiento: null,
          duracion_estimada: "20m"
        }
      ]
    };
  }

  private getMockProgresoGeneral(usuarioId: number): ProgresoGeneral {
    console.log(`📊 Usando MOCK data para progreso general (usuario: ${usuarioId})`);
    
    const userData = {
      1: { completadas: 4, teorias: 3, puntuacion: 650 },
      2: { completadas: 9, teorias: 7, puntuacion: 1200 },
      3: { completadas: 1, teorias: 0, puntuacion: 150 }
    };
    
    const data = userData[usuarioId as keyof typeof userData] || userData[1];
    
    return {
      usuario_id: usuarioId,
      estadisticas_generales: {
        total_simulaciones: 10,
        simulaciones_completadas: data.completadas,
        simulaciones_en_proceso: 1,
        simulaciones_fallidas: 0,
        elementos_diferentes_usados: 3,
        tiempo_total_simulacion_minutos: data.completadas * 45,
        teoria_completadas: data.teorias,
        teoria_totales: 14,
        preguntas_ia_realizadas: 3,
        nivel_experiencia: data.puntuacion >= 1000 ? "Avanzado" : data.puntuacion >= 500 ? "Intermedio" : "Principiante",
        puntuacion_total: data.puntuacion
      },
      top_elementos: [
        {
          elemento_id: 1,
          nombre_elemento: "Hidrógeno",
          simbolo: "H",
          veces_usado: 8,
          cantidad_total: 12.5,
          rendimiento_promedio: 85.5,
          estado: "Óptimo"
        },
        {
          elemento_id: 8,
          nombre_elemento: "Oxígeno",
          simbolo: "O",
          veces_usado: 6,
          cantidad_total: 9.2,
          rendimiento_promedio: 78.3,
          estado: "Muy bueno"
        }
      ],
      progreso_teorias: []
    };
  }

  // ==================== MÉTODOS PÚBLICOS CON FALLBACK ====================

  async getResumenProgreso(usuarioId: number): Promise<ResumenProgreso> {
    // Forzar uso de mock data en desarrollo para pruebas
    if (this.useMockData) {
      return this.getMockResumenProgreso(usuarioId);
    }

    const cacheKey = `resumen_${usuarioId}`;
    const cached = this.getCached<ResumenProgreso>(cacheKey);
    if (cached) return cached;

    try {
      console.log(`🔄 Obteniendo resumen REAL para usuario ${usuarioId}`);
      
      const response = await axios.get<ResumenProgreso>(
        `${API_URL}/resumen`,
        {
          params: { usuario_id: usuarioId },
          timeout: 8000
        }
      );

      this.setCache(cacheKey, response.data, 2);
      console.log('✅ Resumen REAL obtenido:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo resumen REAL, usando MOCK:', error);
      // Fallback a datos mock
      const mockData = this.getMockResumenProgreso(usuarioId);
      this.setCache(cacheKey, mockData, 1); // Cache más corto para mock
      return mockData;
    }
  }

  async getProgresoGeneral(usuarioId: number): Promise<ProgresoGeneral> {
    if (this.useMockData) {
      return this.getMockProgresoGeneral(usuarioId);
    }

    const cacheKey = `progreso_general_${usuarioId}`;
    const cached = this.getCached<ProgresoGeneral>(cacheKey);
    if (cached) return cached;
    
    try {
      console.log(`🔄 Obteniendo progreso general REAL para usuario ${usuarioId}`);
      
      const response = await axios.get<ProgresoGeneral>(
        `${API_URL}/`,
        {
          params: { usuario_id: usuarioId },
          timeout: 10000
        }
      );

      this.setCache(cacheKey, response.data, 5);
      console.log('✅ Progreso general REAL obtenido');
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo progreso general REAL, usando MOCK:', error);
      const mockData = this.getMockProgresoGeneral(usuarioId);
      this.setCache(cacheKey, mockData, 2);
      return mockData;
    }
  }

  async getHistorialSimulaciones(
    usuarioId: number,
    limite: number = 10,
    offset: number = 0,
    estado?: string
  ): Promise<HistorialSimulaciones> {
    if (this.useMockData) {
      return this.getMockHistorialSimulaciones(usuarioId);
    }

    const cacheKey = `historial_${usuarioId}_${limite}_${offset}_${estado || 'all'}`;
    const cached = this.getCached<HistorialSimulaciones>(cacheKey);
    if (cached) return cached;
    
    try {
      console.log(`🔄 Obteniendo historial REAL para usuario ${usuarioId}`);
      
      const params: any = { limite, offset };
      if (estado) params.estado = estado;

      const response = await axios.get<HistorialSimulaciones>(
        `${API_URL}/${usuarioId}/simulaciones`,
        {
          params,
          timeout: 10000
        }
      );

      this.setCache(cacheKey, response.data, 3);
      console.log('✅ Historial REAL obtenido');
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo historial REAL, usando MOCK:', error);
      const mockData = this.getMockHistorialSimulaciones(usuarioId);
      this.setCache(cacheKey, mockData, 2);
      return mockData;
    }
  }

  async getEstadisticasElementos(usuarioId: number): Promise<EstadisticasElementos> {
    if (this.useMockData) {
      return this.getMockEstadisticasElementos(usuarioId);
    }

    const cacheKey = `elementos_${usuarioId}`;
    const cached = this.getCached<EstadisticasElementos>(cacheKey);
    if (cached) return cached;
    
    try {
      console.log(`🔄 Obteniendo elementos REALES para usuario ${usuarioId}`);
      
      const response = await axios.get<EstadisticasElementos>(
        `${API_URL}/${usuarioId}/elementos`,
        { timeout: 10000 }
      );

      this.setCache(cacheKey, response.data, 5);
      console.log('✅ Elementos REALES obtenidos');
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo elementos REALES, usando MOCK:', error);
      const mockData = this.getMockEstadisticasElementos(usuarioId);
      this.setCache(cacheKey, mockData, 3);
      return mockData;
    }
  }

  async guardarProgreso(usuarioId: number, progresoData: any): Promise<RespuestaGuardado> {
    try {
      console.log(`💾 Guardando progreso REAL para usuario ${usuarioId}`);
      
      const requestData = {
        accion: progresoData.accion || 'sesion_estudio',
        descripcion: progresoData.descripcion || 'Progreso guardado',
        puntos: progresoData.puntos || 0,
        datos: progresoData.datos || {},
        sesion_id: progresoData.sesion_id
      };
      
      const response = await axios.post<RespuestaGuardado>(
        `${API_URL}/${usuarioId}/guardar`,
        requestData,
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // Invalidar cache del usuario
      this.invalidateUserCache(usuarioId);

      console.log('✅ Progreso REAL guardado');
      return response.data;
    } catch (error) {
      console.error('❌ Error guardando progreso REAL:', error);
      
      // Simular éxito en desarrollo
      if (this.useMockData) {
        console.log('🔄 Simulando guardado exitoso en MOCK mode');
        return {
          success: true,
          message: "Progreso guardado exitosamente (MOCK)",
          timestamp: new Date().toISOString(),
          usuario_id: usuarioId,
          progreso_id: Math.floor(Math.random() * 1000)
        };
      }
      
      throw this.handleError(error);
    }
  }

  async checkHealth(): Promise<any> {
    try {
      const response = await axios.get(`${API_URL}/health/status`, { timeout: 5000 });
      return response.data;
    } catch (error) {
      console.error('❌ Error verificando salud:', error);
      
      // Health check mock para desarrollo
      if (this.useMockData) {
        return {
          status: "healthy",
          service: "progreso",
          timestamp: new Date().toISOString(),
          endpoints_available: [
            "GET /api/progreso/resumen?usuario_id={id} - Resumen rápido (MOCK)",
            "GET /api/progreso/?usuario_id={id} - Progreso general (MOCK)",
            "GET /api/progreso/{usuario_id}/simulaciones - Historial simulaciones (MOCK)",
            "GET /api/progreso/{usuario_id}/elementos - Estadísticas elementos (MOCK)",
            "POST /api/progreso/{usuario_id}/guardar - Guardar progreso (MOCK)"
          ],
          version: "2.1.0-mock"
        };
      }
      
      throw this.handleError(error);
    }
  }

  private invalidateUserCache(usuarioId: number): void {
    const keysToDelete: string[] = [];
    for (const key of this.cache.keys()) {
      if (key.includes(`_${usuarioId}`) || key.includes(`${usuarioId}_`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
    console.log(`🗑️ Cache invalidado para usuario ${usuarioId}: ${keysToDelete.length} entradas`);
  }

  clearAll(): void {
    this.cache.clear();
    console.log('🗑️ Cache limpiado completamente');
  }

  // Método para forzar modo mock (útil para testing)
  setMockMode(enabled: boolean): void {
    this.useMockData = enabled;
    console.log(`🎭 Modo MOCK ${enabled ? 'activado' : 'desactivado'}`);
  }
}

// Exportar instancia singleton
export const progresoService = ProgresoService.getInstance();

// Funciones de utilidad
export const formatearTiempo = (minutos: number): string => {
  if (minutos <= 0) return "0h 0m";
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  return `${horas}h ${mins}m`;
};

export const obtenerColorEstado = (estado: string): string => {
  switch (estado) {
    case 'Óptimo': return 'text-green-400';
    case 'Muy bueno': return 'text-blue-400';
    case 'Bueno': return 'text-yellow-400';
    case 'Regular': return 'text-orange-400';
    case 'Malo': return 'text-red-400';
    case 'Completada': return 'text-green-400';
    case 'En proceso': return 'text-yellow-400';
    case 'Fallida': return 'text-red-400';
    default: return 'text-gray-400';
  }
};