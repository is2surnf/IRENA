// src/hooks/useElementos.tsx
import { useState, useEffect, useCallback } from 'react';
import { 
  getElementos, 
  getElemento,
  searchElementos,
  getElementsByCategoria,
  getElementsByEstado,
  createElemento,
  updateElemento,
  deleteElemento
} from '../services/elementos.service';
import type { Elemento, ElementoCreate, ElementoUpdate } from '../services/elementos.service';

interface ElementosState {
  elementos: Elemento[];
  loading: boolean;
  error: string | null;
}

export const useElementos = (initialFetch: boolean = true) => {
  const [state, setState] = useState<ElementosState>({
    elementos: [],
    loading: false,
    error: null,
  });

  const setLoading = (loading: boolean) => {
    setState((prev: ElementosState) => ({ ...prev, loading }));
  };

  const setError = (error: string | null) => {
    setState((prev: ElementosState) => ({ ...prev, error }));
  };

  const setElementos = (elementos: Elemento[]) => {
    setState((prev: ElementosState) => ({ ...prev, elementos }));
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchElementos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getElementos();
      setElementos(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al cargar elementos');
      console.error('Error fetching elementos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchElementosHandler = useCallback(async (query: string, categoria?: string, estado?: string) => {
    if (!query.trim()) {
      await fetchElementos();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await searchElementos(query, categoria, estado);
      setElementos(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error en la búsqueda');
      console.error('Error searching elementos:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchElementos]);

  const getElementsByCategoriaHandler = useCallback(async (categoria: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getElementsByCategoria(categoria);
      setElementos(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al filtrar por categoría');
      console.error('Error getting elementos by categoria:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const getElementsByEstadoHandler = useCallback(async (estado: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getElementsByEstado(estado);
      setElementos(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al filtrar por estado');
      console.error('Error getting elementos by estado:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createElementoHandler = useCallback(async (elemento: ElementoCreate): Promise<Elemento | null> => {
    setLoading(true);
    setError(null);
    try {
      const newElemento = await createElemento(elemento);
      setElementos([...state.elementos, newElemento]);
      return newElemento;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al crear elemento');
      console.error('Error creating elemento:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [state.elementos]);

  const updateElementoHandler = useCallback(async (id: number, elementoUpdate: ElementoUpdate): Promise<Elemento | null> => {
    setLoading(true);
    setError(null);
    try {
      const updatedElemento = await updateElemento(id, elementoUpdate);
      const updatedList = state.elementos.map(e => e.id === id ? updatedElemento : e);
      setElementos(updatedList);
      return updatedElemento;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al actualizar elemento');
      console.error('Error updating elemento:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [state.elementos]);

  const deleteElementoHandler = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await deleteElemento(id);
      const updatedList = state.elementos.filter(e => e.id !== id);
      setElementos(updatedList);
      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al eliminar elemento');
      console.error('Error deleting elemento:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [state.elementos]);

  useEffect(() => {
    if (initialFetch) {
      fetchElementos();
    }
  }, [fetchElementos, initialFetch]);

  return {
    ...state,
    refetch: fetchElementos,
    searchElementos: searchElementosHandler,
    getElementsByCategoria: getElementsByCategoriaHandler,
    getElementsByEstado: getElementsByEstadoHandler,
    createElemento: createElementoHandler,
    updateElemento: updateElementoHandler,
    deleteElemento: deleteElementoHandler,
    clearError,
  };
};