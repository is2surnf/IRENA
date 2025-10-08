// frontend/src/types/simulacion.types.ts
// TIPOS COMPLETOS PARA TU SISTEMA DE SIMULACIÓN

// ============================================
// TIPOS BASE DE LA BASE DE DATOS
// ============================================

export interface Elemento {
  id: number;
  nombre: string;
  simbolo: string;
  numero_atomico?: number;
  masa_atomica?: number;
  densidad?: number;
  estado: 'Sólido' | 'Líquido' | 'Gas';
  descripcion?: string;
  categoria: 'Metales' | 'No metales' | 'Gases y Halógenos' | 'Ácidos' | 'Bases' | 'Sales';
  imagen_url?: string;
}

export interface Utensilio {
  id: number;
  nombre: string;
  descripcion: string;
  capacidad?: number;
  tipo: 'Vidriería y plásticos' | 'Equipos básicos' | 'Otros materiales';
  imagen_url?: string;
}

export interface Reaccion {
  id: number;
  nombre: string;
  descripcion: string;
  reactivos: string[];
  productos: string[];
  formula: string;
  tipo?: string;
  peligrosidad?: 'baja' | 'media' | 'alta';
  efectos: EfectosReaccion;
}

export interface EfectosReaccion {
  colorFinal: string;
  temperatura: number;
  burbujeo: boolean;
  humo: boolean;
  precipitado: boolean;
  llama: boolean;
  mensaje: string;
  intensidadLuz?: number;
  colorLuz?: string;
  duracion?: number;
}

// ============================================
// ESTADO DE SIMULACIÓN
// ============================================

export interface ContenidoUtensilio {
  elementos: Elemento[];
  nivel: number;
  color: string;
  temperatura: number;
  estado: 'reposo' | 'mezclando' | 'reaccionando' | 'completado';
}

export interface ObjetoSimulacion {
  id: string;
  tipo: 'utensilio' | 'elemento';
  data: Utensilio | Elemento;
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: [number, number, number];
  contenido?: ContenidoUtensilio;
  bloqueado?: boolean;
  visible?: boolean;
}

export interface EstadoSimulacion {
  activa: boolean;
  objetosEnMesa: ObjetoSimulacion[];
  temperatura: number;
  pH: number;
  tiempo: number;
  resultados: string[];
  reaccionActual?: Reaccion;
  historialReacciones?: Reaccion[];
  advertencias?: string[];
}

// ============================================
// PETICIONES Y RESPUESTAS API
// ============================================

export interface DetectarReaccionRequest {
  utensilio_id: string;
  elementos: string[];
}

export interface ReaccionDetectadaResponse {
  reaccion: Reaccion | null;
  mensaje: string;
}

export interface SimulacionCreateRequest {
  nombre: string;
  descripcion?: string;
  usuario_id?: number;
  estado: EstadoSimulacion;
}

export interface SimulacionResponse {
  id: number;
  nombre: string;
  fecha: string;
  descripcion?: string;
  estado: EstadoSimulacion;
  objetos_en_mesa: any[];
  reacciones_realizadas?: any[];
}

// ============================================
// UTILIDADES Y CONSTANTES
// ============================================

export const COLORES_CATEGORIA: Record<string, string> = {
  'Metales': '#FFD700',
  'No metales': '#4A90E2', 
  'Gases y Halógenos': '#9B59B6',
  'Ácidos': '#E74C3C',
  'Bases': '#27AE60',
  'Sales': '#ECF0F1'
};

export const ESTADOS_MATERIA = ['Sólido', 'Líquido', 'Gas'] as const;

export type TipoUtensilio = 'Vidriería y plásticos' | 'Equipos básicos' | 'Otros materiales';
export type CategoriaElemento = 'Metales' | 'No metales' | 'Gases y Halógenos' | 'Ácidos' | 'Bases' | 'Sales';
export type EstadoMateria = 'Sólido' | 'Líquido' | 'Gas';
export type Peligrosidad = 'baja' | 'media' | 'alta';

// ============================================
// HOOKS Y PROPS
// ============================================

export interface UseSimulacionReturn {
  estado: EstadoSimulacion;
  efectosActivos: EfectosReaccion | null;
  agregarUtensilio: (utensilio: Utensilio, position?: [number, number, number]) => string;
  agregarElementoAUtensilio: (utensilioId: string, elemento: Elemento) => void;
  detectarReaccion: (utensilioId: string) => Reaccion | null;
  iniciarReaccion: (utensilioId: string) => void;
  iniciarSimulacion: () => void;
  detenerSimulacion: () => void;
  limpiarMesa: () => void;
  moverObjeto: (id: string, newPosition: [number, number, number]) => void;
  eliminarObjeto: (id: string) => void;
  reaccionesDisponibles: Reaccion[];
}

export interface LaboratorioSceneProps {
  objetosEnMesa: ObjetoSimulacion[];
  efectosActivos?: EfectosReaccion;
  onObjectClick: (objeto: ObjetoSimulacion) => void;
  onObjectMove: (id: string, position: [number, number, number]) => void;
}

export interface PanelControlSimulacionProps {
  elementos: Elemento[];
  utensilios: Utensilio[];
  onAgregarUtensilio: (utensilio: Utensilio) => void;
  onSeleccionarElemento: (elemento: Elemento) => void;
  onIniciarSimulacion: () => void;
  simulacionActiva: boolean;
  elementoSeleccionado: Elemento | null;
}

export interface InformeSimulacionProps {
  estado: EstadoSimulacion;
  reaccionActual?: Reaccion;
  onGuardar: () => void;
  onEliminar: () => void;
  onIniciarReaccion?: (utensilioId: string) => void;
  utensiliosConElementos?: Array<{ id: string; nombre: string; cantidadElementos: number }>;
}

export interface UtensiliosInteractivosProps {
  utensilio: Utensilio;
  position: [number, number, number];
  contenido?: ContenidoUtensilio;
  onClick: () => void;
  onMove: (position: [number, number, number]) => void;
}

export interface ElementosQuimicos3DProps {
  elemento: Elemento;
  position: [number, number, number];
  onClick: () => void;
}

export interface EfectosVisualesProps {
  efectos: EfectosReaccion;
  position?: [number, number, number];
}

export interface MotorReaccionesProps {
  reaccion: Reaccion;
  elementos: Elemento[];
  utensilio: Utensilio;
  position: [number, number, number];
  onCompletada: () => void;
  onError?: (mensaje: string) => void;
}