// frontend/src/hooks/useSimulacion.ts 
import { useState, useCallback, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { 
  EstadoSimulacion, 
  ObjetoSimulacion, 
  Utensilio, 
  Elemento, 
  Reaccion,
  EfectosReaccion,
  ContenidoUtensilio,
  ReaccionDetectadaResponse
} from '../types/simulacion.types';
import { reaccionesService } from '../services/reacciones.service';
// CORRECCIÓN 3: Importar THREE para que calcularColorMezcla funcione
import * as THREE from 'three'; 

const initialState: EstadoSimulacion = {
  activa: false,
  objetosEnMesa: [],
  temperatura: 25,
  pH: 7.0,
  tiempo: 0,
  resultados: [],
  historialReacciones: [],
  advertencias: []
};

export const useSimulacion = () => {
  const [estado, setEstado] = useState<EstadoSimulacion>(initialState);
  const [efectosActivos, setEfectosActivos] = useState<EfectosReaccion | null>(null);
  const [reaccionEnProgreso, setReaccionEnProgreso] = useState<string | null>(null);
  // CORRECCIÓN 1: Cambiar NodeJS.Timeout a number para entorno de navegador
  const tiempoRef = useRef<number | null>(null);

  // ============================================
  // GESTIÓN DE ESTADO MEJORADA
  // ============================================

  const agregarUtensilio = useCallback((utensilio: Utensilio, position: [number, number, number] = [0, 0.1, 0]): string => {
    const nuevoObjeto: ObjetoSimulacion = {
      id: uuidv4(),
      tipo: 'utensilio',
      data: utensilio,
      position,
      rotation: [0, 0, 0],
      contenido: {
        elementos: [],
        nivel: 0,
        color: '#FFFFFF',
        temperatura: 25,
        estado: 'reposo'
      }
    };

    setEstado(prev => ({
      ...prev,
      objetosEnMesa: [...prev.objetosEnMesa, nuevoObjeto],
      advertencias: [...(prev.advertencias || []), `✅ ${utensilio.nombre} agregado a la mesa`]
    }));

    return nuevoObjeto.id;
  }, []);

  const agregarElementoAUtensilio = useCallback((utensilioId: string, elemento: Elemento) => {
    setEstado(prev => {
      const utensilio = prev.objetosEnMesa.find(obj => obj.id === utensilioId && obj.tipo === 'utensilio');
      
      if (!utensilio || !utensilio.contenido) {
        console.warn('Utensilio no encontrado o sin contenido');
        return prev;
      }

      const nuevosObjetos = prev.objetosEnMesa.map(objeto => {
        if (objeto.id === utensilioId && objeto.tipo === 'utensilio' && objeto.contenido) {
          const elementosExistentes = objeto.contenido.elementos;
          
          // Verificar si el elemento ya existe
          const elementoExistente = elementosExistentes.find(e => e.id === elemento.id);
          if (elementoExistente) {
            return objeto; // No agregar duplicados
          }

          const nuevoContenido: ContenidoUtensilio = {
            ...objeto.contenido,
            elementos: [...elementosExistentes, elemento],
            nivel: Math.min(1, objeto.contenido.nivel + 0.25),
            color: calcularColorMezcla([...elementosExistentes, elemento]),
            temperatura: objeto.contenido.temperatura + (elemento.categoria === 'Ácidos' ? 5 : 0),
            estado: elementosExistentes.length > 0 ? 'mezclando' : 'reposo'
          };
          
          return {
            ...objeto,
            contenido: nuevoContenido
          };
        }
        return objeto;
      });

      const mensaje = `➕ ${elemento.nombre} (${elemento.simbolo}) agregado al utensilio`;
      
      return {
        ...prev,
        objetosEnMesa: nuevosObjetos,
        resultados: [...prev.resultados, mensaje],
        advertencias: [...(prev.advertencias || []), mensaje]
      };
    });
  }, []);

  // ============================================
  // DETECCIÓN DE REACCIONES MEJORADA
  // ============================================

  const detectarReaccion = useCallback(async (utensilioId: string): Promise<Reaccion | null> => {
    const utensilio = estado.objetosEnMesa.find(obj => obj.id === utensilioId);
    
    if (!utensilio || !utensilio.contenido || utensilio.contenido.elementos.length < 2) {
      console.log('No hay suficientes elementos para detectar reacción');
      return null;
    }

    // Verificar si ya hay una reacción en progreso
    if (reaccionEnProgreso === utensilioId) {
      console.log('Reacción ya en progreso para este utensilio');
      return null;
    }

    const simbolosElementos = utensilio.contenido.elementos.map(e => e.simbolo || '');
    
    try {
      console.log('🔬 Detectando reacción para elementos:', simbolosElementos);
      
      const response: ReaccionDetectadaResponse = await reaccionesService.detectarReaccion({
        utensilio_id: utensilioId,
        elementos: simbolosElementos.filter(s => s)
      });

      if (response.reaccion) {
        console.log('🎉 Reacción detectada:', response.reaccion.nombre);
        
        setReaccionEnProgreso(utensilioId);
        setEstado(prev => ({
          ...prev,
          // CORRECCIÓN 2: Usar ! para asegurar el tipo, resolviendo Error 2345
          reaccionActual: response.reaccion!,
          // CORRECCIÓN 2: Usar ! para asegurar el tipo, resolviendo Error 18047
          resultados: [...prev.resultados, `⚡ Reacción iniciada: ${response.reaccion!.nombre}`], 
          // CORRECCIÓN 2: Usar ! para asegurar el tipo, resolviendo Error 18047
          advertencias: [...(prev.advertencias || []), `🔥 ${response.reaccion!.nombre} detectada!`] 
        }));
        
        // Activar efectos visuales
        setEfectosActivos(response.reaccion.efectos);
        
        // Actualizar estado del utensilio
        setEstado(prev => ({
          ...prev,
          objetosEnMesa: prev.objetosEnMesa.map(obj => 
            obj.id === utensilioId && obj.tipo === 'utensilio' && obj.contenido
              ? {
                  ...obj,
                  contenido: {
                    ...obj.contenido,
                    estado: 'reaccionando',
                    temperatura: response.reaccion!.efectos.temperatura,
                    color: response.reaccion!.efectos.colorFinal
                  }
                }
              : obj
          )
        }));

        // Programar finalización de la reacción
        const duracion = (response.reaccion.efectos.duracion || 8) * 1000;
        
        setTimeout(() => {
          console.log('✅ Reacción completada');
          setReaccionEnProgreso(null);
          setEfectosActivos(null);
          
          setEstado(prev => ({
            ...prev,
            reaccionActual: undefined,
            // CORRECCIÓN 2: Usar ! para asegurar el tipo en el closure (Error 18047)
            historialReacciones: [...(prev.historialReacciones || []), response.reaccion!], 
            objetosEnMesa: prev.objetosEnMesa.map(obj => 
              obj.id === utensilioId && obj.tipo === 'utensilio' && obj.contenido
                ? {
                    ...obj,
                    contenido: {
                      ...obj.contenido,
                      estado: 'completado',
                      temperatura: 25
                    }
                  }
                : obj
            ),
            // CORRECCIÓN 2: Usar ! para asegurar el tipo en el closure (Error 18047)
            advertencias: [...(prev.advertencias || []), `✅ ${response.reaccion!.nombre} completada`] 
          }));
        }, duracion);
        
        return response.reaccion;
      } else {
        console.log('❌ No se detectó reacción para:', simbolosElementos);
        setEstado(prev => ({
          ...prev,
          advertencias: [...(prev.advertencias || []), `❌ No se detectó reacción para la combinación`]
        }));
        return null;
      }
    } catch (error) {
      console.error('🚨 Error detectando reacción:', error);
      
      // Fallback a detección local
      const reaccionLocal = detectarReaccionLocal(utensilio.contenido.elementos);
      if (reaccionLocal) {
        console.log('🔄 Usando reacción local de fallback:', reaccionLocal.nombre);
        return reaccionLocal;
      }
      
      setEstado(prev => ({
        ...prev,
        advertencias: [...(prev.advertencias || []), `⚠️ Error de conexión. Reintentando...`]
      }));
      
      return null;
    }
  }, [estado.objetosEnMesa, reaccionEnProgreso]);

  // ============================================
  // DETECCIÓN LOCAL DE REACCIONES (FALLBACK)
  // ============================================

  const detectarReaccionLocal = useCallback((elementos: Elemento[]): Reaccion | null => {
    const simbolos = elementos.map(e => e.simbolo).sort();
    const reaccionesLocales = obtenerReaccionesLocales();

    // Buscar reacción exacta
    for (const reaccion of reaccionesLocales) {
      const reactivosReaccion = [...reaccion.reactivos].sort();
      
      if (JSON.stringify(simbolos) === JSON.stringify(reactivosReaccion)) {
        return reaccion;
      }
    }

    // Buscar reacción parcial (al menos 2 elementos coinciden)
    for (const reaccion of reaccionesLocales) {
      const reactivosReaccion = [...reaccion.reactivos];
      const elementosCoincidentes = simbolos.filter(s => reactivosReaccion.includes(s));
      
      if (elementosCoincidentes.length >= 2) {
        console.log('🔍 Reacción parcial detectada:', reaccion.nombre);
        return {
          ...reaccion,
          nombre: `${reaccion.nombre} (Parcial)`,
          efectos: {
            ...reaccion.efectos,
            intensidadLuz: reaccion.efectos.intensidadLuz ? reaccion.efectos.intensidadLuz * 0.7 : 0.5
          }
        };
      }
    }

    return null;
  }, []);

  // ============================================
  // GESTIÓN DE SIMULACIÓN MEJORADA
  // ============================================

  const iniciarReaccion = useCallback(async (utensilioId: string) => {
    if (reaccionEnProgreso) {
      console.log('⏳ Ya hay una reacción en progreso');
      return;
    }

    console.log('🚀 Iniciando reacción manual para utensilio:', utensilioId);
    const reaccion = await detectarReaccion(utensilioId);
    
    if (reaccion) {
      setEstado(prev => ({
        ...prev,
        // CORRECCIÓN 2: Usar ! para asegurar el tipo (Error 18047)
        resultados: [...prev.resultados, `🎯 Reacción manual iniciada: ${reaccion!.nombre}`],
        advertencias: [...(prev.advertencias || []), `⚡ Reacción manual activada!`]
      }));
    }
  }, [detectarReaccion, reaccionEnProgreso]);

  const iniciarSimulacion = useCallback(() => {
    if (estado.activa) {
      console.log('⏸️ La simulación ya está activa');
      return;
    }

    console.log('🔬 Iniciando simulación de laboratorio');
    setEstado(prev => ({
      ...prev,
      activa: true,
      tiempo: 0,
      resultados: [...prev.resultados, '🔬 Simulación de laboratorio iniciada'],
      advertencias: [...(prev.advertencias || []), '🎯 Modo experimental activado']
    }));

    // Sistema de tiempo mejorado
    if (tiempoRef.current) {
      clearInterval(tiempoRef.current);
    }

    tiempoRef.current = setInterval(() => {
      setEstado(prev => ({
        ...prev,
        tiempo: prev.tiempo + 1,
        temperatura: prev.temperatura + (Math.random() - 0.5) * 0.1, // Fluctuación natural
        pH: Math.max(0, Math.min(14, prev.pH + (Math.random() - 0.5) * 0.05)) // Fluctuación controlada
      }));
    }, 1000);
  }, [estado.activa]);

  const detenerSimulacion = useCallback(() => {
    console.log('⏹️ Deteniendo simulación');
    
    if (tiempoRef.current) {
      clearInterval(tiempoRef.current);
      tiempoRef.current = null;
    }

    setEstado(prev => ({
      ...prev,
      activa: false,
      resultados: [...prev.resultados, '⏹️ Simulación detenida'],
      advertencias: [...(prev.advertencias || []), '💤 Modo experimental pausado']
    }));
  }, []);

  const limpiarMesa = useCallback(() => {
    console.log('🧹 Limpiando mesa de laboratorio');
    
    if (tiempoRef.current) {
      clearInterval(tiempoRef.current);
      tiempoRef.current = null;
    }

    setEstado(initialState);
    setEfectosActivos(null);
    setReaccionEnProgreso(null);
  }, []);

  // ============================================
  // MANIPULACIÓN DE OBJETOS MEJORADA
  // ============================================

  const moverObjeto = useCallback((id: string, newPosition: [number, number, number]) => {
    setEstado(prev => ({
      ...prev,
      objetosEnMesa: prev.objetosEnMesa.map(obj =>
        obj.id === id ? { ...obj, position: newPosition } : obj
      )
    }));
  }, []);

  const eliminarObjeto = useCallback((id: string) => {
    const objeto = estado.objetosEnMesa.find(obj => obj.id === id);
    
    setEstado(prev => ({
      ...prev,
      objetosEnMesa: prev.objetosEnMesa.filter(obj => obj.id !== id),
      advertencias: [
        ...(prev.advertencias || []), 
        `🗑️ ${objeto?.tipo === 'utensilio' ? (objeto.data as Utensilio).nombre : 'Elemento'} removido`
      ]
    }));
  }, [estado.objetosEnMesa]);

  const reiniciarExperimento = useCallback(() => {
    console.log('🔄 Reiniciando experimento');
    
    setEstado(prev => ({
      ...initialState,
      historialReacciones: prev.historialReacciones // Mantener historial
    }));
    
    setEfectosActivos(null);
    setReaccionEnProgreso(null);
  }, []);

  // ============================================
  // EFECTOS DE LIMPIEZA
  // ============================================

  useEffect(() => {
    return () => {
      if (tiempoRef.current) {
        clearInterval(tiempoRef.current);
      }
    };
  }, []);

  // ============================================
  // FUNCIONES AUXILIARES
  // ============================================

  function calcularColorMezcla(elementos: Elemento[]): string {
    if (elementos.length === 0) return '#FFFFFF';
    
    const coloresCategoria = {
      'Metales': '#FFD700',
      'No metales': '#4A90E2',
      'Gases y Halógenos': '#9B59B6',
      'Ácidos': '#E74C3C',
      'Bases': '#27AE60',
      'Sales': '#ECF0F1'
    };

    const colores = elementos.map(e => coloresCategoria[e.categoria] || '#4A90E2');
    
    // Mezcla simple de colores
    if (colores.length === 1) return colores[0];
    
    // Para múltiples elementos, crear un gradiente
    const colorBase = colores[0];
    const variacion = elementos.length * 40;
    
    const color = new THREE.Color(colorBase);
    const hsl = { h: 0, s: 0, l: 0 };
    color.getHSL(hsl);
    
    hsl.h = (hsl.h + (variacion / 360)) % 1;
    hsl.s = Math.min(1, hsl.s * 1.2);
    
    color.setHSL(hsl.h, hsl.s, hsl.l);
    return `#${color.getHexString()}`;
  }

  function obtenerReaccionesLocales(): Reaccion[] {
    return [
      {
        id: 1,
        nombre: 'Síntesis de Agua',
        descripcion: 'Reacción de hidrógeno con oxígeno para formar agua - Reacción altamente exotérmica',
        reactivos: ['H', 'O'],
        productos: ['H₂O'],
        formula: '2H₂ + O₂ → 2H₂O',
        tipo: 'síntesis',
        peligrosidad: 'alta',
        efectos: {
          colorFinal: '#4A90E2',
          temperatura: 150,
          burbujeo: true,
          humo: true,
          precipitado: false,
          llama: true,
          mensaje: '¡Agua sintetizada! Reacción muy exotérmica',
          intensidadLuz: 1.0,
          colorLuz: '#FF5500',
          duracion: 8
        }
      },
      {
        id: 2,
        nombre: 'Neutralización Ácido-Base',
        descripcion: 'Ácido clorhídrico reacciona con hidróxido de sodio formando sal común y agua',
        reactivos: ['HCl', 'NaOH'],
        productos: ['NaCl', 'H₂O'],
        formula: 'HCl + NaOH → NaCl + H₂O',
        tipo: 'doble_sustitución',
        peligrosidad: 'media',
        efectos: {
          colorFinal: '#ECF0F1',
          temperatura: 45,
          burbujeo: true,
          humo: false,
          precipitado: false,
          llama: false,
          mensaje: 'Sal común formada - Neutralización completa',
          intensidadLuz: 0.4,
          colorLuz: '#FFFFFF',
          duracion: 6
        }
      },
      {
        id: 3,
        nombre: 'Combustión de Metano',
        descripcion: 'El metano reacciona con oxígeno produciendo dióxido de carbono y agua',
        reactivos: ['CH₄', 'O'],
        productos: ['CO₂', 'H₂O'],
        formula: 'CH₄ + 2O₂ → CO₂ + 2H₂O',
        tipo: 'combustión',
        peligrosidad: 'alta',
        efectos: {
          colorFinal: '#1a1a1a',
          temperatura: 200,
          burbujeo: false,
          humo: true,
          precipitado: false,
          llama: true,
          mensaje: '¡Combustión! Liberación de energía térmica',
          intensidadLuz: 1.2,
          colorLuz: '#FF3300',
          duracion: 10
        }
      }
    ];
  }

  // ============================================
  // RETORNO DEL HOOK MEJORADO
  // ============================================

  return {
    // Estado principal
    estado,
    efectosActivos,
    reaccionEnProgreso,
    
    // Gestión de objetos
    agregarUtensilio,
    agregarElementoAUtensilio,
    moverObjeto,
    eliminarObjeto,
    
    // Gestión de reacciones
    detectarReaccion,
    iniciarReaccion,
    
    // Control de simulación
    iniciarSimulacion,
    detenerSimulacion,
    limpiarMesa,
    reiniciarExperimento,
    
    // Utilidades
    tieneElementos: estado.objetosEnMesa.length > 0,
    tieneReacciones: (estado.historialReacciones?.length || 0) > 0,
    estaActiva: estado.activa
  };
};