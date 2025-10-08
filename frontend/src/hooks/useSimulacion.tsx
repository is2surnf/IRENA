// frontend/src/hooks/useSimulacion.ts - VERSIÓN CORREGIDA Y MEJORADA
import { useState, useCallback, useEffect, useRef } from 'react';
import type { 
  ObjetoSimulacion, 
  EstadoSimulacion, 
  Reaccion, 
  Elemento,
  Utensilio,
  EfectosReaccion,
  UseSimulacionReturn
} from '../types/simulacion.types';
import { useReacciones } from './useReacciones';

// ============================================
// GENERADOR DE ID ÚNICO
// ============================================
const generarId = (): string => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// ============================================
// REACCIONES PREDEFINIDAS (Base de datos local mejorada)
// ============================================
const REACCIONES_DB: Reaccion[] = [
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
  },
  {
    id: 3,
    nombre: 'Oxidación del Magnesio',
    descripcion: 'Magnesio arde en presencia de oxígeno',
    reactivos: ['Mg', 'O'],
    productos: ['MgO'],
    formula: '2Mg + O₂ → 2MgO',
    tipo: 'combustión',
    peligrosidad: 'alta',
    efectos: {
      colorFinal: '#FFFFFF',
      temperatura: 650,
      burbujeo: false,
      humo: true,
      precipitado: true,
      llama: true,
      mensaje: '¡Llama brillante! Óxido de magnesio formado',
      intensidadLuz: 1.0,
      colorLuz: '#FFFFFF',
      duracion: 5
    }
  },
  {
    id: 4,
    nombre: 'Descomposición del Peróxido',
    descripcion: 'Peróxido de hidrógeno se descompone',
    reactivos: ['H₂O₂'],
    productos: ['H₂O', 'O₂'],
    formula: '2H₂O₂ → 2H₂O + O₂',
    tipo: 'descomposición',
    peligrosidad: 'baja',
    efectos: {
      colorFinal: '#FFFFFF',
      temperatura: 25,
      burbujeo: true,
      humo: false,
      precipitado: false,
      llama: false,
      mensaje: 'Oxígeno liberado - Efervescencia visible',
      intensidadLuz: 0.2,
      colorLuz: '#FFFFFF',
      duracion: 5
    }
  },
  {
    id: 5,
    nombre: 'Formación de Cloruro de Sodio',
    descripcion: 'Sodio reacciona violentamente con cloro',
    reactivos: ['Na', 'Cl'],
    productos: ['NaCl'],
    formula: '2Na + Cl₂ → 2NaCl',
    tipo: 'síntesis',
    peligrosidad: 'alta',
    efectos: {
      colorFinal: '#FFFFFF',
      temperatura: 45,
      burbujeo: false,
      humo: true,
      precipitado: true,
      llama: true,
      mensaje: 'Sal de mesa formada - Reacción violenta',
      intensidadLuz: 0.7,
      colorLuz: '#FFFF00',
      duracion: 5
    }
  },
  {
    id: 6,
    nombre: 'Reacción de Bicarbonato con Vinagre',
    descripcion: 'Efervescencia al mezclar bicarbonato y ácido acético',
    reactivos: ['NaHCO₃', 'CH₃COOH'],
    productos: ['CO₂', 'H₂O', 'NaCH₃COO'],
    formula: 'NaHCO₃ + CH₃COOH → CO₂ + H₂O + NaCH₃COO',
    tipo: 'doble_sustitución',
    peligrosidad: 'baja',
    efectos: {
      colorFinal: '#F0E68C',
      temperatura: 22,
      burbujeo: true,
      humo: false,
      precipitado: false,
      llama: false,
      mensaje: 'Efervescencia intensa - Liberación de CO₂',
      intensidadLuz: 0.1,
      colorLuz: '#FFFFFF',
      duracion: 5
    }
  }
];

// ============================================
// HOOK PRINCIPAL MEJORADO
// ============================================
export const useSimulacion = (): UseSimulacionReturn => {
  const [estado, setEstado] = useState<EstadoSimulacion>({
    activa: false,
    objetosEnMesa: [],
    temperatura: 25,
    pH: 7.0,
    tiempo: 0,
    resultados: [],
    reaccionActual: undefined,
    historialReacciones: [],
    advertencias: []
  });

  const [efectosActivos, setEfectosActivos] = useState<EfectosReaccion | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { detectarReaccion: detectarReaccionHook } = useReacciones();

  // ============================================
  // CONTADOR DE TIEMPO MEJORADO
  // ============================================
  useEffect(() => {
    if (!estado.activa) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setEstado(prev => ({
        ...prev,
        tiempo: prev.tiempo + 1
      }));
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [estado.activa]);

  // ============================================
  // AGREGAR UTENSILIO A LA MESA (MEJORADO)
  // ============================================
  const agregarUtensilio = useCallback((
    utensilio: Utensilio, 
    position?: [number, number, number]
  ): string => {
    const posicionFinal = position || [
      (Math.random() - 0.5) * 6,
      0.1,
      (Math.random() - 0.5) * 3
    ];

    const nuevoObjeto: ObjetoSimulacion = {
      id: generarId(),
      tipo: 'utensilio',
      data: utensilio,
      position: posicionFinal,
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      contenido: {
        elementos: [],
        nivel: 0,
        color: '#FFFFFF',
        temperatura: 25,
        estado: 'reposo'
      },
      bloqueado: false,
      visible: true
    };

    setEstado(prev => ({
      ...prev,
      objetosEnMesa: [...prev.objetosEnMesa, nuevoObjeto]
    }));

    return nuevoObjeto.id;
  }, []);

  // ============================================
  // AGREGAR ELEMENTO A UTENSILIO (MEJORADO)
  // ============================================
  const agregarElementoAUtensilio = useCallback((
    utensilioId: string,
    elemento: Elemento
  ): void => {
    setEstado(prev => {
      const objetosActualizados = prev.objetosEnMesa.map(obj => {
        if (obj.id === utensilioId && obj.contenido) {
          const elementosActuales = obj.contenido.elementos;
          
          // Evitar duplicados del mismo elemento
          const yaExiste = elementosActuales.some(e => e.simbolo === elemento.simbolo);
          if (yaExiste) {
            console.warn(`El elemento ${elemento.simbolo} ya está en el utensilio`);
            return obj;
          }

          const nuevosElementos = [...elementosActuales, elemento];
          const nuevoNivel = Math.min(obj.contenido.nivel + 0.15, 1.0);
          
          // Determinar color según categoría del último elemento agregado
          let nuevoColor = '#4A90E2';
          switch (elemento.categoria) {
            case 'Ácidos':
              nuevoColor = '#E74C3C';
              break;
            case 'Bases':
              nuevoColor = '#27AE60';
              break;
            case 'Metales':
              nuevoColor = '#FFD700';
              break;
            case 'Sales':
              nuevoColor = '#ECF0F1';
              break;
            case 'Gases y Halógenos':
              nuevoColor = '#9B59B6';
              break;
            default:
              nuevoColor = '#4A90E2';
          }
          
          return {
            ...obj,
            contenido: {
              ...obj.contenido,
              elementos: nuevosElementos,
              nivel: nuevoNivel,
              color: nuevoColor,
              estado: 'mezclando' as const
            }
          };
        }
        return obj;
      });

      return {
        ...prev,
        objetosEnMesa: objetosActualizados
      };
    });
  }, []);

  // ============================================
  // DETECTAR REACCIÓN QUÍMICA (MEJORADO)
  // ============================================
  const detectarReaccion = useCallback((utensilioId: string): Reaccion | null => {
    const utensilio = estado.objetosEnMesa.find(obj => obj.id === utensilioId);
    
    if (!utensilio || !utensilio.contenido || utensilio.contenido.elementos.length < 1) {
      console.warn('No hay suficientes elementos para detectar reacción');
      return null;
    }

    const simbolos = utensilio.contenido.elementos
      .map(e => e.simbolo)
      .sort();

    // Buscar reacción que coincida
    const reaccion = REACCIONES_DB.find(r => {
      const reactivosReaccion = [...r.reactivos].sort();
      
      // Verificar si todos los reactivos están presentes
      return reactivosReaccion.every(reactivo => 
        simbolos.includes(reactivo)
      ) && simbolos.length === reactivosReaccion.length;
    });

    if (reaccion) {
      console.log('✅ Reacción detectada:', reaccion.nombre);
      return reaccion;
    }

    console.log('❌ No se detectó reacción con elementos:', simbolos);
    return null;
  }, [estado.objetosEnMesa]);

  // ============================================
  // INICIAR REACCIÓN (CON BOTÓN) - MEJORADO
  // ============================================
  const iniciarReaccion = useCallback(async (utensilioId: string): Promise<void> => {
    let reaccion = detectarReaccion(utensilioId);
    
    // Si no se encuentra localmente, intentar con el hook
    if (!reaccion) {
      const utensilio = estado.objetosEnMesa.find(obj => obj.id === utensilioId);
      if (utensilio && utensilio.contenido) {
        reaccion = await detectarReaccionHook(utensilio.contenido.elementos);
      }
    }
    
    if (!reaccion) {
      setEstado(prev => ({
        ...prev,
        advertencias: [...(prev.advertencias || []), 'No se detectó ninguna reacción química válida']
      }));
      return;
    }

    // Activar efectos visuales inmediatamente
    setEfectosActivos(reaccion.efectos);
    
    // Actualizar estado de simulación
    setEstado(prev => ({
      ...prev,
      reaccionActual: reaccion,
      temperatura: reaccion.efectos.temperatura,
      pH: calcularPH(reaccion.reactivos),
      historialReacciones: [...(prev.historialReacciones || []), reaccion],
      resultados: [...prev.resultados, `${reaccion.nombre}: ${reaccion.efectos.mensaje}`],
      objetosEnMesa: prev.objetosEnMesa.map(obj => {
        if (obj.id === utensilioId && obj.contenido) {
          return {
            ...obj,
            contenido: {
              ...obj.contenido,
              color: reaccion!.efectos.colorFinal,
              temperatura: reaccion!.efectos.temperatura,
              estado: 'reaccionando' as const
            }
          };
        }
        return obj;
      })
    }));

    // Desactivar efectos después de la duración especificada
    const duracion = reaccion.efectos.duracion || 5;
    setTimeout(() => {
      setEfectosActivos(null);
      setEstado(prev => ({
        ...prev,
        reaccionActual: undefined,
        objetosEnMesa: prev.objetosEnMesa.map(obj => {
          if (obj.id === utensilioId && obj.contenido) {
            return {
              ...obj,
              contenido: {
                ...obj.contenido,
                estado: 'completado' as const
              }
            };
          }
          return obj;
        })
      }));
    }, duracion * 1000);

  }, [detectarReaccion, detectarReaccionHook, estado.objetosEnMesa]);

  // ============================================
  // FUNCIÓN AUXILIAR: CALCULAR PH (MEJORADA)
  // ============================================
  const calcularPH = (reactivos: string[]): number => {
    // Lógica mejorada para cálculo de pH
    if (reactivos.includes('HCl') || reactivos.includes('H₂SO₄') || reactivos.includes('HNO₃')) {
      return 2.0; // Ácido fuerte
    }
    if (reactivos.includes('CH₃COOH')) {
      return 4.5; // Ácido débil
    }
    if (reactivos.includes('NaOH') || reactivos.includes('KOH')) {
      return 12.0; // Base fuerte
    }
    if (reactivos.includes('NH₃')) {
      return 9.5; // Base débil
    }
    if (reactivos.includes('NaCl') || reactivos.includes('KNO₃')) {
      return 7.0; // Sal neutra
    }
    return 7.0; // Neutro por defecto
  };

  // ============================================
  // MOVER OBJETO EN LA MESA
  // ============================================
  const moverObjeto = useCallback((id: string, newPosition: [number, number, number]): void => {
    setEstado(prev => ({
      ...prev,
      objetosEnMesa: prev.objetosEnMesa.map(obj => 
        obj.id === id ? { ...obj, position: newPosition } : obj
      )
    }));
  }, []);

  // ============================================
  // INICIAR/DETENER SIMULACIÓN
  // ============================================
  const iniciarSimulacion = useCallback((): void => {
    setEstado(prev => ({ 
      ...prev, 
      activa: true, 
      tiempo: 0,
      advertencias: []
    }));
  }, []);

  const detenerSimulacion = useCallback((): void => {
    setEstado(prev => ({ ...prev, activa: false }));
  }, []);

  // ============================================
  // LIMPIAR MESA (MEJORADO)
  // ============================================
  const limpiarMesa = useCallback((): void => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setEstado({
      activa: false,
      objetosEnMesa: [],
      temperatura: 25,
      pH: 7.0,
      tiempo: 0,
      resultados: [],
      reaccionActual: undefined,
      historialReacciones: [],
      advertencias: []
    });
    
    setEfectosActivos(null);
  }, []);

  // ============================================
  // ELIMINAR OBJETO ESPECÍFICO
  // ============================================
  const eliminarObjeto = useCallback((id: string): void => {
    setEstado(prev => ({
      ...prev,
      objetosEnMesa: prev.objetosEnMesa.filter(obj => obj.id !== id)
    }));
  }, []);

  return {
    estado,
    efectosActivos,
    agregarUtensilio,
    agregarElementoAUtensilio,
    detectarReaccion,
    iniciarReaccion,
    iniciarSimulacion,
    detenerSimulacion,
    limpiarMesa,
    moverObjeto,
    eliminarObjeto,
    reaccionesDisponibles: REACCIONES_DB
  };
};