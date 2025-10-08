// frontend/src/services/reacciones.service.ts
import type { Reaccion, DetectarReaccionRequest, ReaccionDetectadaResponse } from '../types/simulacion.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

class ReaccionesService {
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

  async detectarReaccion(request: DetectarReaccionRequest): Promise<ReaccionDetectadaResponse> {
    try {
      const data = await this.fetchAPI('/simulacion/detectar-reaccion', {
        method: 'POST',
        body: JSON.stringify(request),
      });
      return data;
    } catch (error) {
      console.warn('Error detectando reacción, usando lógica local', error);
      return this.detectarReaccionLocal(request);
    }
  }

  async obtenerReaccionesDisponibles(): Promise<Reaccion[]> {
    try {
      return await this.fetchAPI('/simulacion/reacciones/disponibles');
    } catch (error) {
      console.warn('Error fetching reacciones, usando datos locales', error);
      return this.getReaccionesLocales();
    }
  }

  async saludReacciones(): Promise<{ status: string; reacciones_disponibles: number }> {
    try {
      return await this.fetchAPI('/simulacion/health/status');
    } catch (error) {
      console.warn('Error en health check de reacciones', error);
      return {
        status: 'healthy',
        reacciones_disponibles: this.getReaccionesLocales().length
      };
    }
  }

  private detectarReaccionLocal(request: DetectarReaccionRequest): ReaccionDetectadaResponse {
    const simbolos = request.elementos.sort();
    const reacciones = this.getReaccionesLocales();
    
    const reaccion = reacciones.find(r => {
      const reactivosReaccion = [...r.reactivos].sort();
      return JSON.stringify(simbolos) === JSON.stringify(reactivosReaccion);
    });

    return {
      reaccion: reaccion || null,
      mensaje: reaccion 
        ? `¡Reacción detectada: ${reaccion.nombre}!`
        : 'No se detectó ninguna reacción con los elementos proporcionados'
    };
  }

  private getReaccionesLocales(): Reaccion[] {
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
  }
}

export const reaccionesService = new ReaccionesService();