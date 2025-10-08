// frontend/src/services/simulacion.service.ts - CORREGIDO
import type { Elemento, Utensilio, Reaccion, DetectarReaccionRequest, ReaccionDetectadaResponse } from '../types/simulacion.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

class SimulacionService {
  private async fetchAPI(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}/api${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // ============================================
  // ELEMENTOS QUÍMICOS - USANDO SERVICIO EXISTENTE
  // ============================================

  async obtenerElementos(): Promise<Elemento[]> {
    try {
      // Usar el servicio de elementos existente
      const { getElementos } = await import('./elementos.service');
      return await getElementos();
    } catch (error) {
      console.warn('Error fetching elementos, usando datos mock', error);
      return this.getElementosMock();
    }
  }

  async obtenerElementoPorId(id: number): Promise<Elemento> {
    try {
      const { getElemento } = await import('./elementos.service');
      return await getElemento(id);
    } catch (error) {
      console.warn('Error obteniendo elemento, usando mock', error);
      const elementos = this.getElementosMock();
      const elemento = elementos.find(e => e.id === id);
      if (!elemento) throw new Error('Elemento no encontrado');
      return elemento;
    }
  }

  async buscarElementos(query: string): Promise<Elemento[]> {
    try {
      const { searchElementos } = await import('./elementos.service');
      return await searchElementos(query);
    } catch (error) {
      console.warn('Error buscando elementos, usando búsqueda local', error);
      const elementos = this.getElementosMock();
      return elementos.filter(e => 
        e.nombre.toLowerCase().includes(query.toLowerCase()) ||
        e.simbolo.toLowerCase().includes(query.toLowerCase())
      );
    }
  }

  async obtenerElementosPorCategoria(categoria: string): Promise<Elemento[]> {
    try {
      const { getElementsByCategoria } = await import('./elementos.service');
      return await getElementsByCategoria(categoria);
    } catch (error) {
      console.warn('Error obteniendo elementos por categoría, usando filtro local', error);
      const elementos = this.getElementosMock();
      return elementos.filter(e => e.categoria === categoria);
    }
  }

  // ============================================
  // UTENSILIOS - USANDO SERVICIO EXISTENTE
  // ============================================

  async obtenerUtensilios(): Promise<Utensilio[]> {
    try {
      // Usar el servicio de utensilios existente
      const { getUtensilios } = await import('./utensiliosService');
      return await getUtensilios();
    } catch (error) {
      console.warn('Error fetching utensilios, usando datos mock', error);
      return this.getUtensiliosMock();
    }
  }

  async obtenerUtensilioPorId(id: number): Promise<Utensilio> {
    try {
      const { getUtensilio } = await import('./utensiliosService');
      return await getUtensilio(id);
    } catch (error) {
      console.warn('Error obteniendo utensilio, usando mock', error);
      const utensilios = this.getUtensiliosMock();
      const utensilio = utensilios.find(u => u.id === id);
      if (!utensilio) throw new Error('Utensilio no encontrado');
      return utensilio;
    }
  }

  async buscarUtensilios(query: string): Promise<Utensilio[]> {
    try {
      const { searchUtensilios } = await import('./utensiliosService');
      return await searchUtensilios(query);
    } catch (error) {
      console.warn('Error buscando utensilios, usando búsqueda local', error);
      const utensilios = this.getUtensiliosMock();
      return utensilios.filter(u => 
        u.nombre.toLowerCase().includes(query.toLowerCase()) ||
        u.descripcion.toLowerCase().includes(query.toLowerCase())
      );
    }
  }

  async obtenerUtensiliosPorTipo(tipo: string): Promise<Utensilio[]> {
    try {
      const { getUtensiliosByTipo } = await import('./utensiliosService');
      return await getUtensiliosByTipo(tipo);
    } catch (error) {
      console.warn('Error obteniendo utensilios por tipo, usando filtro local', error);
      const utensilios = this.getUtensiliosMock();
      return utensilios.filter(u => u.tipo === tipo);
    }
  }

  // ============================================
  // REACCIONES QUÍMICAS
  // ============================================

  async detectarReaccion(request: DetectarReaccionRequest): Promise<ReaccionDetectadaResponse> {
    try {
      return await this.fetchAPI('/simulacion/detectar-reaccion', {
        method: 'POST',
        body: JSON.stringify(request),
      });
    } catch (error) {
      console.warn('Error detectando reacción, usando lógica local', error);
      return this.detectarReaccionLocal(request);
    }
  }

  async obtenerReaccionesDisponibles(): Promise<Reaccion[]> {
    try {
      return await this.fetchAPI('/simulacion/reacciones/disponibles');
    } catch (error) {
      console.warn('Error fetching reacciones, usando datos mock', error);
      return this.getReaccionesMock();
    }
  }

  // ============================================
  // DATOS MOCK (FALLBACK) - ACTUALIZADOS CON TU BD
  // ============================================

  private getElementosMock(): Elemento[] {
    return [
      {
        id: 47,
        nombre: "Hidrógeno",
        simbolo: "H",
        numero_atomico: 1,
        masa_atomica: 1.01,
        densidad: 0.09,
        estado: "Gas",
        descripcion: "Gas inflamable, base de reacciones de combustión",
        categoria: "No metales",
        imagen_url: "hidrogeno.png"
      },
      {
        id: 48,
        nombre: "Oxígeno",
        simbolo: "O", 
        numero_atomico: 8,
        masa_atomica: 16.00,
        densidad: 1.43,
        estado: "Gas",
        descripcion: "Esencial para combustión y oxidación",
        categoria: "No metales",
        imagen_url: "oxigeno.png"
      },
      {
        id: 49,
        nombre: "Nitrógeno",
        simbolo: "N",
        numero_atomico: 7,
        masa_atomica: 14.01,
        densidad: 1.25,
        estado: "Gas",
        descripcion: "Gas inerte, útil para simulaciones atmosféricas",
        categoria: "No metales",
        imagen_url: "nitrogeno.png"
      },
      {
        id: 61,
        nombre: "Ácido clorhídrico",
        simbolo: "HCl",
        masa_atomica: 36.46,
        densidad: 1.49,
        estado: "Líquido",
        descripcion: "Ácido fuerte, reacciona con metales y bases",
        categoria: "Ácidos",
        imagen_url: "acido_clorhidrico.png"
      },
      {
        id: 65,
        nombre: "Hidróxido de sodio",
        simbolo: "NaOH",
        masa_atomica: 40.00,
        densidad: 2.13,
        estado: "Sólido",
        descripcion: "Base fuerte, reacciona con ácidos",
        categoria: "Bases",
        imagen_url: "hidroxido_sodio.png"
      }
    ];
  }

  private getUtensiliosMock(): Utensilio[] {
    return [
      {
        id: 1,
        nombre: "Vasos de precipitados",
        descripcion: "Recipientes para mezclar, calentar y contener líquidos",
        tipo: "Vidriería y plásticos",
        imagen_url: "vasos_de_precipitados.png"
      },
      {
        id: 2, 
        nombre: "Matraces Erlenmeyer",
        descripcion: "Matraces cónicos para mezclas y titulaciones",
        tipo: "Vidriería y plásticos",
        imagen_url: "matraces_erlenmeyer.png"
      },
      {
        id: 5,
        nombre: "Tubos de ensayo",
        descripcion: "Tubos para contener pequeñas muestras y reacciones",
        tipo: "Vidriería y plásticos",
        imagen_url: "tubos_de_ensayo.png"
      },
      {
        id: 7,
        nombre: "Mechero Bunsen",
        descripcion: "Fuente de calor para calentamiento y esterilización",
        tipo: "Equipos básicos",
        imagen_url: "mechero_bunsen.png"
      }
    ];
  }

  private getReaccionesMock(): Reaccion[] {
    return [
      {
        id: 1,
        nombre: "Síntesis de Agua",
        descripcion: "Reacción de hidrógeno con oxígeno para formar agua",
        reactivos: ["H", "O"],
        productos: ["H₂O"],
        formula: "2H₂ + O₂ → 2H₂O",
        tipo: "síntesis",
        peligrosidad: "alta",
        efectos: {
          colorFinal: "#4A90E2",
          temperatura: 100,
          burbujeo: true,
          humo: true,
          precipitado: false,
          llama: true,
          mensaje: "¡Agua formada! Reacción muy exotérmica",
          intensidadLuz: 0.8,
          colorLuz: "#FFA500",
          duracion: 5
        }
      },
      {
        id: 2,
        nombre: "Neutralización Ácido-Base",
        descripcion: "HCl reacciona con NaOH para formar sal y agua",
        reactivos: ["HCl", "NaOH"],
        productos: ["NaCl", "H₂O"],
        formula: "HCl + NaOH → NaCl + H₂O",
        tipo: "doble_sustitución",
        peligrosidad: "media",
        efectos: {
          colorFinal: "#ECF0F1",
          temperatura: 35,
          burbujeo: false,
          humo: false,
          precipitado: false,
          llama: false,
          mensaje: "Sal común formada - pH neutro alcanzado",
          intensidadLuz: 0.3,
          colorLuz: "#FFFFFF",
          duracion: 5
        }
      }
    ];
  }

  private detectarReaccionLocal(request: DetectarReaccionRequest): ReaccionDetectadaResponse {
    const simbolos = request.elementos.sort();
    const reacciones = this.getReaccionesMock();
    
    const reaccion = reacciones.find(r => 
      r.reactivos.sort().join(',') === simbolos.join(',')
    );

    return {
      reaccion: reaccion || null,
      mensaje: reaccion 
        ? `¡Reacción detectada: ${reaccion.nombre}!`
        : 'No se detectó ninguna reacción con los elementos proporcionados'
    };
  }

  // ============================================
  // HEALTH CHECKS
  // ============================================

  async healthCheck(): Promise<{ status: string; servicios: string[] }> {
    try {
      // Verificar servicios individuales
      const servicios: string[] = [];
      
      try {
        const elementos = await this.obtenerElementos();
        servicios.push(`elementos: ${elementos.length} disponibles`);
      } catch (e) {
        servicios.push('elementos: ❌ error');
      }

      try {
        const utensilios = await this.obtenerUtensilios();
        servicios.push(`utensilios: ${utensilios.length} disponibles`);
      } catch (e) {
        servicios.push('utensilios: ❌ error');
      }

      try {
        const reacciones = await this.obtenerReaccionesDisponibles();
        servicios.push(`reacciones: ${reacciones.length} disponibles`);
      } catch (e) {
        servicios.push('reacciones: ❌ error');
      }

      return {
        status: servicios.some(s => s.includes('❌')) ? 'degradado' : 'healthy',
        servicios
      };
    } catch (error) {
      return {
        status: 'error',
        servicios: ['Sistema no disponible']
      };
    }
  }
}

export const simulacionService = new SimulacionService();