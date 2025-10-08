// frontend/src/services/efectos3D.utils.ts
import * as THREE from 'three';
import type { EfectosReaccion } from '../types/simulacion.types';

export class Efectos3DUtils {
  /**
   * Crear textura para burbujas
   */
  static crearTexturaBurbuja(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d')!;

    // Fondo transparente
    context.clearRect(0, 0, 128, 128);

    // Gradiente radial para la burbuja
    const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.6, 'rgba(200, 200, 255, 0.4)');
    gradient.addColorStop(1, 'rgba(150, 150, 255, 0)');

    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);

    // Reflejo
    context.fillStyle = 'rgba(255, 255, 255, 0.3)';
    context.beginPath();
    context.ellipse(40, 40, 20, 15, 0, 0, Math.PI * 2);
    context.fill();

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  /**
   * Crear textura para humo
   */
  static crearTexturaHumo(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d')!;

    // Gradiente para humo
    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.2, 'rgba(200, 200, 200, 0.6)');
    gradient.addColorStop(0.5, 'rgba(150, 150, 150, 0.4)');
    gradient.addColorStop(1, 'rgba(100, 100, 100, 0)');

    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);

    // Añadir variación de ruido
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * 64;
      const y = Math.random() * 64;
      const alpha = Math.random() * 0.3;
      
      context.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      context.fillRect(x, y, 1, 1);
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  /**
   * Crear textura para llamas
   */
  static crearTexturaLlama(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d')!;

    // Gradiente para llama (naranja a amarillo)
    const gradient = context.createLinearGradient(0, 0, 0, 128);
    gradient.addColorStop(0, '#FFFF00');  // Amarillo (más caliente)
    gradient.addColorStop(0.3, '#FFA500'); // Naranja
    gradient.addColorStop(0.7, '#FF4500'); // Rojo-naranja
    gradient.addColorStop(1, '#8B0000');   // Rojo oscuro

    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);

    // Añadir textura de turbulencia
    for (let i = 0; i < 500; i++) {
      const x = Math.random() * 128;
      const y = Math.random() * 128;
      const height = Math.random() * 30 + 10;
      const alpha = Math.random() * 0.4 + 0.1;
      
      context.fillStyle = `rgba(255, 255, 200, ${alpha})`;
      context.fillRect(x, y, 2, height);
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  /**
   * Crear sistema de partículas para efectos
   */
  static crearSistemaParticulas(
    count: number,
    color: string,
    size: number = 0.1
  ): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const baseColor = new THREE.Color(color);

    for (let i = 0; i < count; i++) {
      // Posiciones aleatorias en una esfera
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 2;
      positions[i3 + 1] = Math.random() * 2;
      positions[i3 + 2] = (Math.random() - 0.5) * 2;

      // Variación de color
      const variation = 0.2;
      colors[i3] = Math.max(0, Math.min(1, baseColor.r + (Math.random() - 0.5) * variation));
      colors[i3 + 1] = Math.max(0, Math.min(1, baseColor.g + (Math.random() - 0.5) * variation));
      colors[i3 + 2] = Math.max(0, Math.min(1, baseColor.b + (Math.random() - 0.5) * variation));

      // Tamaños variados
      sizes[i] = size * (0.5 + Math.random() * 0.5);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    return geometry;
  }

  /**
   * Crear material para partículas
   */
  static crearMaterialParticulas(textura?: THREE.Texture): THREE.PointsMaterial {
    return new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      map: textura,
      depthWrite: false
    });
  }

  /**
   * Calcular color intermedio para transiciones
   */
  static interpolarColor(
    colorInicio: string, 
    colorFin: string, 
    factor: number
  ): string {
    const c1 = new THREE.Color(colorInicio);
    const c2 = new THREE.Color(colorFin);
    
    const r = c1.r + (c2.r - c1.r) * factor;
    const g = c1.g + (c2.g - c1.g) * factor;
    const b = c1.b + (c2.b - c1.b) * factor;
    
    return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
  }

  /**
   * Crear geometría para líquido con superficie ondulada
   */
  static crearGeometriaLiquido(
    radioSuperior: number,
    radioInferior: number,
    altura: number,
    segmentos: number = 32
  ): THREE.CylinderGeometry {
    const geometry = new THREE.CylinderGeometry(
      radioSuperior,
      radioInferior,
      altura,
      segmentos
    );

    // Añadir ondulación a la superficie
    const posiciones = geometry.attributes.position.array as Float32Array;
    const count = posiciones.length / 3;

    for (let i = 0; i < count; i++) {
      const y = posiciones[i * 3 + 1];
      
      // Solo modificar los vértices de la superficie superior
      if (y > altura / 2 - 0.01) {
        const x = posiciones[i * 3];
        const z = posiciones[i * 3 + 2];
        const distancia = Math.sqrt(x * x + z * z);
        
        // Ondulación sinusoidal
        const onda = Math.sin(distancia * 10) * 0.02;
        posiciones[i * 3 + 1] += onda;
      }
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();

    return geometry;
  }

  /**
   * Crear material para líquido realista
   */
  static crearMaterialLiquido(
    color: string,
    opacidad: number = 0.8,
    transmision: number = 0.3
  ): THREE.MeshPhysicalMaterial {
    return new THREE.MeshPhysicalMaterial({
      color: color,
      transparent: true,
      opacity: opacidad,
      transmission: transmision,
      roughness: 0.1,
      metalness: 0.0,
      thickness: 0.5,
      ior: 1.4,
      specularIntensity: 1,
      specularColor: new THREE.Color(0xFFFFFF),
      envMapIntensity: 1
    });
  }

  /**
   * Generar efectos de sonido (placeholders)
   */
  static generarEfectosSonido(efectos: EfectosReaccion): string[] {
    const sonidos: string[] = [];

    if (efectos.burbujeo) {
      sonidos.push('burbujas');
    }
    if (efectos.llama) {
      sonidos.push('fuego');
    }
    if (efectos.humo) {
      sonidos.push('humo');
    }
    if (efectos.precipitado) {
      sonidos.push('cristalizacion');
    }

    return sonidos;
  }

  /**
   * Crear animación para transición de color
   */
  static crearAnimacionColor(
    objeto: THREE.Mesh,
    colorInicial: string,
    colorFinal: string,
    duracion: number = 2000
  ): Promise<void> {
    return new Promise((resolve) => {
      const material = objeto.material as THREE.MeshPhysicalMaterial;
      const inicio = new THREE.Color(colorInicial);
      const fin = new THREE.Color(colorFinal);
      const startTime = Date.now();

      const animar = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duracion, 1);
        
        material.color.lerpColors(inicio, fin, progress);
        
        if (progress < 1) {
          requestAnimationFrame(animar);
        } else {
          resolve();
        }
      };

      animar();
    });
  }

  /**
   * Crear sistema de chispas para reacciones exotérmicas
   */
  static crearSistemaChispas(cantidad: number = 20): THREE.Points {
    const geometry = this.crearSistemaParticulas(cantidad, '#FFFF00', 0.05);
    const material = this.crearMaterialParticulas();
    
    const chispas = new THREE.Points(geometry, material);
    
    // Animación de chispas
    const positions = geometry.attributes.position.array as Float32Array;
    const velocities = new Float32Array(cantidad * 3);
    
    for (let i = 0; i < cantidad; i++) {
      velocities[i * 3] = (Math.random() - 0.5) * 0.1;
      velocities[i * 3 + 1] = Math.random() * 0.2;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
    }

    // @ts-ignore - Añadir velocidades al objeto para usarlas en el frame loop
    chispas.userData.velocities = velocities;
    
    return chispas;
  }

  /**
   * Actualizar animación de chispas
   */
  static actualizarChispas(chispas: THREE.Points, delta: number): void {
    const geometry = chispas.geometry;
    const positions = geometry.attributes.position.array as Float32Array;
    // @ts-ignore
    const velocities = chispas.userData.velocities as Float32Array;
    
    if (!velocities) return;

    const count = positions.length / 3;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Aplicar velocidad
      positions[i3] += velocities[i3] * delta * 60;
      positions[i3 + 1] += velocities[i3 + 1] * delta * 60;
      positions[i3 + 2] += velocities[i3 + 2] * delta * 60;
      
      // Gravedad
      velocities[i3 + 1] -= 0.01 * delta * 60;
      
      // Resetear chispas que caen demasiado
      if (positions[i3 + 1] < -1) {
        positions[i3] = (Math.random() - 0.5) * 0.5;
        positions[i3 + 1] = 0;
        positions[i3 + 2] = (Math.random() - 0.5) * 0.5;
        
        velocities[i3] = (Math.random() - 0.5) * 0.1;
        velocities[i3 + 1] = Math.random() * 0.2;
        velocities[i3 + 2] = (Math.random() - 0.5) * 0.1;
      }
    }
    
    geometry.attributes.position.needsUpdate = true;
  }
}

export default Efectos3DUtils;