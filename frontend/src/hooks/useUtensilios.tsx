// src/hooks/useUtensilios.tsx
import { useState, useEffect, useCallback } from 'react';
import { 
  getUtensilios, 
  getUtensilio,
  searchUtensilios,
  getUtensiliosByTipo,
  createUtensilio,
  updateUtensilio,
  deleteUtensilio
} from '../services/utensiliosService';
import type { Utensilio, UtensilioCreate, UtensilioUpdate } from '../services/utensiliosService';

interface UtensiliosState {
  utensilios: Utensilio[];
  loading: boolean;
  error: string | null;
}

export const useUtensilios = (initialFetch: boolean = true) => {
  const [state, setState] = useState<UtensiliosState>({
    utensilios: [],
    loading: false,
    error: null,
  });

  const setLoading = (loading: boolean) => {
    setState((prev: UtensiliosState) => ({ ...prev, loading }));
  };

  const setError = (error: string | null) => {
    setState((prev: UtensiliosState) => ({ ...prev, error }));
  };

  const setUtensilios = (utensilios: Utensilio[]) => {
    setState((prev: UtensiliosState) => ({ ...prev, utensilios }));
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchUtensilios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUtensilios();
      setUtensilios(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al cargar utensilios');
      console.error('Error fetching utensilios:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchUtensiliosHandler = useCallback(async (query: string, tipo?: string) => {
    if (!query.trim()) {
      await fetchUtensilios();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await searchUtensilios(query, tipo);
      setUtensilios(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error en la búsqueda');
      console.error('Error searching utensilios:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchUtensilios]);

  const getUtensiliosByTipoHandler = useCallback(async (tipo: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUtensiliosByTipo(tipo);
      setUtensilios(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al filtrar por tipo');
      console.error('Error getting utensilios by tipo:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createUtensilioHandler = useCallback(async (utensilio: UtensilioCreate): Promise<Utensilio | null> => {
    setLoading(true);
    setError(null);
    try {
      const newUtensilio = await createUtensilio(utensilio);
      // Corrección: obtén la lista actual de utensilios del estado y crea la nueva lista
      setUtensilios([...state.utensilios, newUtensilio]);
      return newUtensilio;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al crear utensilio');
      console.error('Error creating utensilio:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [state.utensilios]); // Dependencia del estado

  const updateUtensilioHandler = useCallback(async (id: number, utensilioUpdate: UtensilioUpdate): Promise<Utensilio | null> => {
    setLoading(true);
    setError(null);
    try {
      const updatedUtensilio = await updateUtensilio(id, utensilioUpdate);
      // Corrección: obtén la lista actual de utensilios del estado y crea la nueva lista
      const updatedList = state.utensilios.map(u => u.id === id ? updatedUtensilio : u);
      setUtensilios(updatedList);
      return updatedUtensilio;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al actualizar utensilio');
      console.error('Error updating utensilio:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [state.utensilios]); // Dependencia del estado

  const deleteUtensilioHandler = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await deleteUtensilio(id);
      // Corrección: obtén la lista actual de utensilios del estado y crea la nueva lista
      const updatedList = state.utensilios.filter(u => u.id !== id);
      setUtensilios(updatedList);
      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al eliminar utensilio');
      console.error('Error deleting utensilio:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [state.utensilios]); // Dependencia del estado

  useEffect(() => {
    if (initialFetch) {
      fetchUtensilios();
    }
  }, [fetchUtensilios, initialFetch]);

  return {
    ...state,
    refetch: fetchUtensilios,
    searchUtensilios: searchUtensiliosHandler,
    getUtensiliosByTipo: getUtensiliosByTipoHandler,
    createUtensilio: createUtensilioHandler,
    updateUtensilio: updateUtensilioHandler,
    deleteUtensilio: deleteUtensilioHandler,
    clearError,
  };
};

// ... (El resto del código para useUtensilio no necesita cambios)