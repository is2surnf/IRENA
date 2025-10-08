// hooks/useProgreso.tsx - VERSIÓN COMPLETAMENTE CORREGIDA
import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  ProgresoGeneral,
  HistorialSimulaciones,
  EstadisticasElementos,
  ResumenProgreso,
  RespuestaGuardado,
} from '../services/progreso.service';
import { progresoService } from '../services/progreso.service';

interface LoadingStates {
  general: boolean;
  resumen: boolean;
  historial: boolean;
  elementos: boolean;
  guardando: boolean;
  inicializando: boolean;
}

interface ErrorStates {
  general: string | null;
  resumen: string | null;
  historial: string | null;
  elementos: string | null;
  guardando: string | null;
}

// ==================== DATOS MOCK PARA FRONTEND ====================

const useMockData = (usuarioId: number) => {
  const mockResumenProgreso = useMemo((): ResumenProgreso => ({
    usuario_id: usuarioId,
    nivel: usuarioId === 1 ? "Intermedio" : usuarioId === 2 ? "Avanzado" : "Principiante",
    puntuacion: usuarioId === 1 ? 650 : usuarioId === 2 ? 1200 : 150,
    simulaciones_completadas: usuarioId === 1 ? 4 : usuarioId === 2 ? 9 : 1,
    total_simulaciones: 10,
    teorias_completadas: usuarioId === 1 ? 3 : usuarioId === 2 ? 7 : 1,
    total_teorias: 14,
    progreso_simulaciones: usuarioId === 1 ? 40 : usuarioId === 2 ? 90 : 10,
    progreso_teorias: usuarioId === 1 ? 21.4 : usuarioId === 2 ? 50 : 7.1,
    tiempo_total_legible: usuarioId === 1 ? "3h 15m" : usuarioId === 2 ? "6h 45m" : "45m",
    puede_guardar_progreso: usuarioId !== 3,
    es_usuario_anonimo: usuarioId === 3,
    posicion_ranking: usuarioId === 1 ? 3 : usuarioId === 2 ? 2 : 8
  }), [usuarioId]);

  const mockEstadisticasElementos = useMemo((): EstadisticasElementos => ({
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
  }), [usuarioId]);

  const mockHistorialSimulaciones = useMemo((): HistorialSimulaciones => ({
    usuario_id: usuarioId,
    total_simulaciones: 3,
    simulaciones: [
      {
        id_simulacion: 1,
        nombre: "Síntesis de Agua",
        fecha: new Date().toISOString(),
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
        fecha: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
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
        fecha: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        descripcion: "Reacción exotérmica",
        estado: "En proceso",
        elementos_usados: 2,
        tipo_simulacion: "Combustión",
        rendimiento: null,
        duracion_estimada: "20m"
      }
    ]
  }), [usuarioId]);

  const mockProgresoGeneral = useMemo((): ProgresoGeneral => ({
    usuario_id: usuarioId,
    estadisticas_generales: {
      total_simulaciones: 10,
      simulaciones_completadas: usuarioId === 1 ? 4 : usuarioId === 2 ? 9 : 1,
      simulaciones_en_proceso: 1,
      simulaciones_fallidas: 0,
      elementos_diferentes_usados: 3,
      tiempo_total_simulacion_minutos: usuarioId === 1 ? 195 : usuarioId === 2 ? 405 : 45,
      teoria_completadas: usuarioId === 1 ? 3 : usuarioId === 2 ? 7 : 1,
      teoria_totales: 14,
      preguntas_ia_realizadas: 3,
      nivel_experiencia: usuarioId === 1 ? "Intermedio" : usuarioId === 2 ? "Avanzado" : "Principiante",
      puntuacion_total: usuarioId === 1 ? 650 : usuarioId === 2 ? 1200 : 150
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
  }), [usuarioId]);

  return {
    mockResumenProgreso,
    mockEstadisticasElementos, 
    mockHistorialSimulaciones,
    mockProgresoGeneral
  };
};

// ==================== HOOK PRINCIPAL ====================

export const useProgreso = (usuarioId: number) => {
  // Estados de datos
  const [progresoGeneral, setProgresoGeneral] = useState<ProgresoGeneral | null>(null);
  const [resumenProgreso, setResumenProgreso] = useState<ResumenProgreso | null>(null);
  const [historialSimulaciones, setHistorialSimulaciones] = useState<HistorialSimulaciones | null>(null);
  const [estadisticasElementos, setEstadisticasElementos] = useState<EstadisticasElementos | null>(null);

  // Estados de carga
  const [loading, setLoading] = useState<LoadingStates>({
    general: false,
    resumen: false,
    historial: false,
    elementos: false,
    guardando: false,
    inicializando: false
  });

  // Estados de error
  const [errors, setErrors] = useState<ErrorStates>({
    general: null,
    resumen: null,
    historial: null,
    elementos: null,
    guardando: null
  });

  const isLoading = useMemo(() => Object.values(loading).some(Boolean), [loading]);
  const hasError = useMemo(() => Object.values(errors).some(e => e !== null), [errors]);

  const { mockResumenProgreso, mockEstadisticasElementos, mockHistorialSimulaciones, mockProgresoGeneral } = useMockData(usuarioId);

  const setLoadingState = useCallback((key: keyof LoadingStates, value: boolean) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  }, []);

  const setErrorState = useCallback((key: keyof ErrorStates, value: string | null) => {
    setErrors(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({
      general: null,
      resumen: null,
      historial: null,
      elementos: null,
      guardando: null
    });
  }, []);

  // Cargar resumen de progreso CON FALLBACK
  const cargarResumenProgreso = useCallback(async () => {
    if (!usuarioId || usuarioId <= 0) return null;

    setLoadingState('resumen', true);
    setErrorState('resumen', null);

    try {
      console.log(`🔄 Cargando resumen REAL para usuario ${usuarioId}`);
      const data = await progresoService.getResumenProgreso(usuarioId);
      setResumenProgreso(data);
      console.log(`✅ Resumen REAL cargado para usuario ${usuarioId}`);
      return data;
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      setErrorState('resumen', mensaje);
      
      // FALLBACK A DATOS MOCK
      console.warn(`🔄 Fallback a MOCK data para resumen (usuario: ${usuarioId})`);
      setResumenProgreso(mockResumenProgreso);
      return mockResumenProgreso;
    } finally {
      setLoadingState('resumen', false);
    }
  }, [usuarioId, setLoadingState, setErrorState, mockResumenProgreso]);

  // Cargar progreso general CON FALLBACK
  const cargarProgresoGeneral = useCallback(async () => {
    if (!usuarioId || usuarioId <= 0) return null;

    setLoadingState('general', true);
    setErrorState('general', null);

    try {
      console.log(`🔄 Cargando progreso general REAL para usuario ${usuarioId}`);
      const data = await progresoService.getProgresoGeneral(usuarioId);
      setProgresoGeneral(data);
      console.log(`✅ Progreso general REAL cargado para usuario ${usuarioId}`);
      return data;
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      setErrorState('general', mensaje);
      
      // FALLBACK A DATOS MOCK
      console.warn(`🔄 Fallback a MOCK data para progreso general (usuario: ${usuarioId})`);
      setProgresoGeneral(mockProgresoGeneral);
      return mockProgresoGeneral;
    } finally {
      setLoadingState('general', false);
    }
  }, [usuarioId, setLoadingState, setErrorState, mockProgresoGeneral]);

  // Cargar historial de simulaciones CON FALLBACK
  const cargarHistorialSimulaciones = useCallback(async (
    limite = 10,
    offset = 0,
    estado?: string
  ) => {
    if (!usuarioId || usuarioId <= 0) return null;

    setLoadingState('historial', true);
    setErrorState('historial', null);

    try {
      console.log(`🔄 Cargando historial REAL para usuario ${usuarioId}`);
      const data = await progresoService.getHistorialSimulaciones(usuarioId, limite, offset, estado);
      setHistorialSimulaciones(data);
      console.log(`✅ Historial REAL cargado para usuario ${usuarioId}`);
      return data;
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      setErrorState('historial', mensaje);
      
      // FALLBACK A DATOS MOCK
      console.warn(`🔄 Fallback a MOCK data para historial (usuario: ${usuarioId})`);
      setHistorialSimulaciones(mockHistorialSimulaciones);
      return mockHistorialSimulaciones;
    } finally {
      setLoadingState('historial', false);
    }
  }, [usuarioId, setLoadingState, setErrorState, mockHistorialSimulaciones]);

  // Cargar estadísticas de elementos CON FALLBACK
  const cargarEstadisticasElementos = useCallback(async () => {
    if (!usuarioId || usuarioId <= 0) return null;

    setLoadingState('elementos', true);
    setErrorState('elementos', null);

    try {
      console.log(`🔄 Cargando elementos REALES para usuario ${usuarioId}`);
      const data = await progresoService.getEstadisticasElementos(usuarioId);
      setEstadisticasElementos(data);
      console.log(`✅ Elementos REALES cargados para usuario ${usuarioId}`);
      return data;
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      setErrorState('elementos', mensaje);
      
      // FALLBACK A DATOS MOCK
      console.warn(`🔄 Fallback a MOCK data para elementos (usuario: ${usuarioId})`);
      setEstadisticasElementos(mockEstadisticasElementos);
      return mockEstadisticasElementos;
    } finally {
      setLoadingState('elementos', false);
    }
  }, [usuarioId, setLoadingState, setErrorState, mockEstadisticasElementos]);

  // Guardar progreso (sin cambios, ya que es una acción)
  const guardarProgreso = useCallback(async (progresoData: any): Promise<RespuestaGuardado | null> => {
    if (!usuarioId || usuarioId <= 0) {
      throw new Error('Usuario no válido');
    }

    setLoadingState('guardando', true);
    setErrorState('guardando', null);

    try {
      const data = await progresoService.guardarProgreso(usuarioId, progresoData);
      
      // Recargar datos después de guardar
      await Promise.allSettled([
        cargarResumenProgreso(),
        cargarProgresoGeneral()
      ]);
      
      return data;
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      setErrorState('guardando', mensaje);
      throw error;
    } finally {
      setLoadingState('guardando', false);
    }
  }, [usuarioId, setLoadingState, setErrorState, cargarResumenProgreso, cargarProgresoGeneral]);

  // Recargar todos los datos
  const recargarTodo = useCallback(async () => {
    console.log('🔄 Recargando todos los datos...');
    clearErrors();
    await Promise.allSettled([
      cargarResumenProgreso(),
      cargarProgresoGeneral(),
      cargarHistorialSimulaciones(),
      cargarEstadisticasElementos()
    ]);
    console.log('✅ Todos los datos recargados');
  }, [clearErrors, cargarResumenProgreso, cargarProgresoGeneral, cargarHistorialSimulaciones, cargarEstadisticasElementos]);

  // Propiedades calculadas
  const puedeGuardarProgreso = useMemo(
    () => resumenProgreso?.puede_guardar_progreso ?? false, 
    [resumenProgreso]
  );

  const esUsuarioAnonimo = useMemo(
    () => resumenProgreso?.es_usuario_anonimo ?? true, 
    [resumenProgreso]
  );

  // Cargar datos iniciales
  useEffect(() => {
    if (usuarioId && usuarioId > 0) {
      console.log(`🎯 Inicializando datos para usuario ${usuarioId}`);
      setLoadingState('inicializando', true);
      Promise.allSettled([
        cargarResumenProgreso(),
        cargarHistorialSimulaciones()
      ]).finally(() => {
        setLoadingState('inicializando', false);
        console.log(`✅ Inicialización completada para usuario ${usuarioId}`);
      });
    }
  }, [usuarioId, cargarResumenProgreso, cargarHistorialSimulaciones, setLoadingState]);

  return {
    // Datos
    progresoGeneral,
    resumenProgreso,
    historialSimulaciones,
    estadisticasElementos,
    
    // Estados
    loading,
    errors,
    isLoading,
    hasError,
    puedeGuardarProgreso,
    esUsuarioAnonimo,
    
    // Métodos
    cargarProgresoGeneral,
    cargarResumenProgreso,
    cargarHistorialSimulaciones,
    cargarEstadisticasElementos,
    guardarProgreso,
    recargarTodo,
    clearErrors,
    
    // Info adicional
    usuarioId
  };
};