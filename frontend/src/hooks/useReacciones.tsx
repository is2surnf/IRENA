  // frontend/src/hooks/useReacciones.ts
  import { useState, useCallback } from 'react';
  import type { Elemento, Reaccion, DetectarReaccionRequest, ReaccionDetectadaResponse } from '../types/simulacion.types';
  import { reaccionesService } from '../services/reacciones.service';

  interface UseReaccionesReturn {
    reacciones: Reaccion[];
    loading: boolean;
    error: string | null;
    detectarReaccion: (elementos: Elemento[]) => Promise<Reaccion | null>;
    obtenerReaccionesDisponibles: () => Promise<Reaccion[]>;
    buscarReaccionesPorElemento: (elementoSimbolo: string) => Reaccion[];
    limpiarError: () => void;
  }

  export const useReacciones = (): UseReaccionesReturn => {
    const [reacciones, setReacciones] = useState<Reaccion[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const limpiarError = useCallback(() => {
      setError(null);
    }, []);

    const detectarReaccion = useCallback(async (elementos: Elemento[]): Promise<Reaccion | null> => {
      if (elementos.length < 1) {
        setError('Se necesitan al menos 2 elementos para detectar una reacción');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const simbolos = elementos.map(e => e.simbolo);
        const request: DetectarReaccionRequest = {
          utensilio_id: 'temp',
          elementos: simbolos
        };

        const response: ReaccionDetectadaResponse = await reaccionesService.detectarReaccion(request);
        
        if (response.reaccion) {
          return response.reaccion;
        } else {
          setError(response.mensaje || 'No se detectó ninguna reacción');
          return null;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al detectar reacción';
        setError(errorMessage);
        
        const reaccionLocal = detectarReaccionLocal(elementos);
        if (reaccionLocal) {
          return reaccionLocal;
        }
        
        return null;
      } finally {
        setLoading(false);
      }
    }, []);

    const obtenerReaccionesDisponibles = useCallback(async (): Promise<Reaccion[]> => {
      setLoading(true);
      setError(null);

      try {
        const reaccionesData = await reaccionesService.obtenerReaccionesDisponibles();
        setReacciones(reaccionesData);
        return reaccionesData;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al obtener reacciones';
        setError(errorMessage);
        
        const reaccionesLocales = obtenerReaccionesLocales();
        setReacciones(reaccionesLocales);
        return reaccionesLocales;
      } finally {
        setLoading(false);
      }
    }, []);

    const buscarReaccionesPorElemento = useCallback((elementoSimbolo: string): Reaccion[] => {
      return reacciones.filter(reaccion => 
        reaccion.reactivos.includes(elementoSimbolo) || 
        reaccion.productos.includes(elementoSimbolo)
      );
    }, [reacciones]);

    const detectarReaccionLocal = useCallback((elementos: Elemento[]): Reaccion | null => {
      const simbolos = elementos.map(e => e.simbolo).sort();
      const reaccionesLocales = obtenerReaccionesLocales();

      for (const reaccion of reaccionesLocales) {
        const reactivosReaccion = [...reaccion.reactivos].sort();
        
        if (JSON.stringify(simbolos) === JSON.stringify(reactivosReaccion)) {
          return reaccion;
        }
        
        const tieneTodosReactivos = reactivosReaccion.every(reactivo => 
          simbolos.includes(reactivo)
        );
        
        if (tieneTodosReactivos && reactivosReaccion.length === simbolos.length) {
          return reaccion;
        }
      }

      return null;
    }, []);

    const obtenerReaccionesLocales = useCallback((): Reaccion[] => {
      return [
        {
          id: 1,
          nombre: 'Síntesis de Agua',
          descripcion: 'Reacción de hidrógeno con oxígeno para formar agua',
          reactivos: ['H', 'O'],
          productos: ['H₂O'],
          formula: '2H₂ + O₂ → 2H₂O',
          tipo: 'síntesis',
          peligrosidad: 'alta',
          efectos: {
            colorFinal: '#4A90E2',
            temperatura: 100,
            burbujeo: true,
            humo: true,
            precipitado: false,
            llama: true,
            mensaje: '¡Agua formada! Reacción muy exotérmica con liberación de energía',
            intensidadLuz: 0.8,
            colorLuz: '#FFA500',
            duracion: 5
          }
        },
        {
          id: 2,
          nombre: 'Neutralización Ácido-Base',
          descripcion: 'HCl reacciona con NaOH formando sal y agua',
          reactivos: ['HCl', 'NaOH'],
          productos: ['NaCl', 'H₂O'],
          formula: 'HCl + NaOH → NaCl + H₂O',
          tipo: 'doble_sustitución',
          peligrosidad: 'media',
          efectos: {
            colorFinal: '#ECF0F1',
            temperatura: 35,
            burbujeo: false,
            humo: false,
            precipitado: false,
            llama: false,
            mensaje: 'Sal común formada - pH neutro alcanzado',
            intensidadLuz: 0.3,
            colorLuz: '#FFFFFF',
            duracion: 5
          }
        }
      ];
    }, []);

    return {
      reacciones,
      loading,
      error,
      detectarReaccion,
      obtenerReaccionesDisponibles,
      buscarReaccionesPorElemento,
      limpiarError
    };
  };