// frontend/src/hooks/useTeoria.tsx (VERSIÓN CORREGIDA COMPLETA)
import { useState, useEffect, useCallback } from 'react';
import {
  getTodasLasTeoria,
  getTeoria,
  buscarTeorias,
  getTeoriasPorCategoria,
  crearTeoria,
  actualizarTeoria,
  eliminarTeoria,
  marcarComoLeida,
  getProgresoUsuario,
  getTareasTeoria,
  getCategorias,
  diagnosticoServicio
} from '../services/teoria.service';
import type { 
  Teoria, 
  TeoriaCreate, 
  TeoriaUpdate, 
  TareaTeorica, 
  ProgresoUsuario 
} from '../services/teoria.service';

interface TeoriaState {
  teorias: Teoria[];
  teoriaSeleccionada: Teoria | null;
  tareas: TareaTeorica[];
  progreso: ProgresoUsuario[];
  categorias: string[];
  loading: boolean;
  error: string | null;
  diagnostico: any;
}

export const useTeoria = (initialFetch: boolean = true) => {
  const [state, setState] = useState<TeoriaState>({
    teorias: [],
    teoriaSeleccionada: null,
    tareas: [],
    progreso: [],
    categorias: [],
    loading: false,
    error: null,
    diagnostico: null,
  });

  const setLoading = (loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  };

  const setError = (error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  };

  const setTeorias = (teorias: Teoria[]) => {
    setState((prev) => ({ ...prev, teorias }));
  };

  const setTeoriaSeleccionada = (teoria: Teoria | null) => {
    setState((prev) => ({ ...prev, teoriaSeleccionada: teoria }));
  };

  const setTareas = (tareas: TareaTeorica[]) => {
    setState((prev) => ({ ...prev, tareas }));
  };

  const setProgreso = (progreso: ProgresoUsuario[]) => {
    setState((prev) => ({ ...prev, progreso }));
  };

  const setCategorias = (categorias: string[]) => {
    setState((prev) => ({ ...prev, categorias }));
  };

  const setDiagnostico = (diagnostico: any) => {
    setState((prev) => ({ ...prev, diagnostico }));
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cargar todas las teorías
  const fetchTeorias = useCallback(async (params?: {
    skip?: number;
    limit?: number;
    categoria?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTodasLasTeoria(params);
      setTeorias(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al cargar teorías');
      console.error('Error fetching teorias:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar teorías
  const buscarTeoriasHandler = useCallback(async (query: string, categoria?: string) => {
    if (!query.trim()) {
      await fetchTeorias();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await buscarTeorias(query, categoria);
      setTeorias(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error en la búsqueda');
      console.error('Error searching teorias:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchTeorias]);

  // Obtener teorías por categoría
  const getTeoriasPorCategoriaHandler = useCallback(async (categoria: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTeoriasPorCategoria(categoria);
      setTeorias(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al filtrar por categoría');
      console.error('Error getting teorias by categoria:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar teoría específica
  const fetchTeoria = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const teoria = await getTeoria(id);
      setTeoriaSeleccionada(teoria);
      
      // Cargar tareas relacionadas
      try {
        const tareasData = await getTareasTeoria(id);
        setTareas(tareasData);
      } catch (tareasError) {
        console.warn('No se pudieron cargar las tareas:', tareasError);
        setTareas([]);
      }
      
      return teoria;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al cargar teoría');
      console.error('Error fetching teoria:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear nueva teoría
  const crearTeoriaHandler = useCallback(async (teoria: TeoriaCreate): Promise<Teoria | null> => {
    setLoading(true);
    setError(null);
    try {
      const newTeoria = await crearTeoria(teoria);
      setTeorias([...state.teorias, newTeoria]);
      return newTeoria;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al crear teoría');
      console.error('Error creating teoria:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [state.teorias]);

  // Actualizar teoría
  const actualizarTeoriaHandler = useCallback(async (
    id: number, 
    teoriaUpdate: TeoriaUpdate
  ): Promise<Teoria | null> => {
    setLoading(true);
    setError(null);
    try {
      const updatedTeoria = await actualizarTeoria(id, teoriaUpdate);
      const updatedList = state.teorias.map(t => t.id === id ? updatedTeoria : t);
      setTeorias(updatedList);
      
      if (state.teoriaSeleccionada?.id === id) {
        setTeoriaSeleccionada(updatedTeoria);
      }
      
      return updatedTeoria;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al actualizar teoría');
      console.error('Error updating teoria:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [state.teorias, state.teoriaSeleccionada]);

  // Eliminar teoría
  const eliminarTeoriaHandler = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await eliminarTeoria(id);
      const updatedList = state.teorias.filter(t => t.id !== id);
      setTeorias(updatedList);
      
      if (state.teoriaSeleccionada?.id === id) {
        setTeoriaSeleccionada(null);
      }
      
      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al eliminar teoría');
      console.error('Error deleting teoria:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [state.teorias, state.teoriaSeleccionada]);

  // Marcar como leída - CORREGIDO
  const marcarComoLeidaHandler = useCallback(async (
    teoriaId: number, 
    usuarioId: number = 1
  ): Promise<boolean> => {
    try {
      const resultado = await marcarComoLeida(teoriaId, usuarioId);
      
      if (resultado && resultado.status === 'success') {
        // Actualizar progreso local
        const nuevoProgreso = [...state.progreso];
        const existingIndex = nuevoProgreso.findIndex(p => p.teoria_id === teoriaId);
        
        if (existingIndex >= 0) {
          nuevoProgreso[existingIndex] = {
            ...nuevoProgreso[existingIndex],
            leido: true,
            fecha: new Date().toISOString()
          };
        } else {
          nuevoProgreso.push({
            teoria_id: teoriaId,
            leido: true,
            fecha: new Date().toISOString()
          });
        }
        
        setProgreso(nuevoProgreso);
        
        // Actualizar teoría seleccionada si es la actual
        if (state.teoriaSeleccionada?.id === teoriaId) {
          setTeoriaSeleccionada({
            ...state.teoriaSeleccionada,
            leido: true
          });
        }
        
        return true;
      }
      return false;
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al marcar como leída');
      console.error('Error marking as read:', error);
      return false;
    }
  }, [state.progreso, state.teoriaSeleccionada]);

  // Cargar progreso del usuario
  const fetchProgreso = useCallback(async (usuarioId: number = 1) => {
    try {
      const data = await getProgresoUsuario(usuarioId);
      setProgreso(data);
    } catch (error) {
      console.warn('Error loading progress:', error);
      setProgreso([]);
    }
  }, []);

  // Cargar categorías
  const fetchCategorias = useCallback(async () => {
    try {
      const data = await getCategorias();
      setCategorias(data);
    } catch (error) {
      console.warn('Error loading categories:', error);
      // Categorías por defecto si no se pueden cargar desde el servidor
      setCategorias([
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
      ]);
    }
  }, []);

  // Ejecutar diagnóstico del servicio
  const ejecutarDiagnostico = useCallback(async () => {
    try {
      const diagnostico = await diagnosticoServicio();
      setDiagnostico(diagnostico);
      return diagnostico;
    } catch (error) {
      console.error('Error en diagnóstico:', error);
      setDiagnostico({
        status: 'error',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      return null;
    }
  }, []);

  // Verificar si una teoría está leída
  const isTeoriaLeida = useCallback((teoriaId: number): boolean => {
    return state.progreso.some(p => p.teoria_id === teoriaId && p.leido);
  }, [state.progreso]);

  // Obtener estadísticas de progreso
  const getEstadisticasProgreso = useCallback(() => {
    const totalTeorias = state.teorias.length;
    const teoriasLeidas = state.teorias.filter(t => isTeoriaLeida(t.id)).length;
    const porcentaje = totalTeorias > 0 ? Math.round((teoriasLeidas / totalTeorias) * 100) : 0;
    
    return {
      total: totalTeorias,
      leidas: teoriasLeidas,
      porcentaje
    };
  }, [state.teorias, isTeoriaLeida]);

  // Funciones para botones - NUEVAS
  const handleSimulacion = useCallback((teoria: Teoria) => {
    // TODO: Integrar con sistema de simulaciones
    console.log('Iniciando simulación para:', teoria.titulo);
    // window.location.href = `/simulaciones?teoria=${teoria.id}&categoria=${teoria.categoria}`;
  }, []);

  const handleGuardarTeoria = useCallback((teoria: Teoria) => {
    // TODO: Implementar guardado en favoritos
    console.log('Guardando teoría:', teoria.titulo);
    // Lógica para guardar en localStorage o base de datos
  }, []);

  const handleCompartirTeoria = useCallback((teoria: Teoria) => {
    // TODO: Implementar compartir
    console.log('Compartiendo teoría:', teoria.titulo);
    if (navigator.share) {
      navigator.share({
        title: teoria.titulo,
        text: teoria.contenido.substring(0, 100) + '...',
        url: window.location.href,
      });
    } else {
      // Fallback para copiar al portapapeles
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  }, []);

  // Efectos
  useEffect(() => {
    if (initialFetch) {
      fetchTeorias();
      fetchCategorias();
      fetchProgreso();
      ejecutarDiagnostico();
    }
  }, [fetchTeorias, fetchCategorias, fetchProgreso, ejecutarDiagnostico, initialFetch]);

  return {
    ...state,
    refetch: fetchTeorias,
    buscarTeorias: buscarTeoriasHandler,
    getTeoriasPorCategoria: getTeoriasPorCategoriaHandler,
    fetchTeoria,
    crearTeoria: crearTeoriaHandler,
    actualizarTeoria: actualizarTeoriaHandler,
    eliminarTeoria: eliminarTeoriaHandler,
    marcarComoLeida: marcarComoLeidaHandler,
    fetchProgreso,
    fetchCategorias,
    ejecutarDiagnostico,
    isTeoriaLeida,
    getEstadisticasProgreso,
    clearError,
    setTeoriaSeleccionada,
    // Funciones para botones
    handleSimulacion,
    handleGuardarTeoria,
    handleCompartirTeoria,
  };
};

// Hook específico para una sola teoría
export const useTeoriaSingle = (id?: number) => {
  const [teoria, setTeoria] = useState<Teoria | null>(null);
  const [tareas, setTareas] = useState<TareaTeorica[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeoria = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    try {
      const teoriaData = await getTeoria(id);
      setTeoria(teoriaData);
      
      const tareasData = await getTareasTeoria(id);
      setTareas(tareasData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al cargar teoría');
      console.error('Error fetching single teoria:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTeoria();
  }, [fetchTeoria]);

  return {
    teoria,
    tareas,
    loading,
    error,
    refetch: fetchTeoria,
  };
};