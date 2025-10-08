// frontend/src/components/simulador/EfectosVisuales.tsx
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Cone, Box } from '@react-three/drei';
import type { EfectosReaccion } from '../../types/simulacion.types';
import * as THREE from 'three';

interface EfectosVisualesProps {
  efectos: EfectosReaccion;
  position?: [number, number, number];
}

const EfectosVisuales: React.FC<EfectosVisualesProps> = ({ 
  efectos, 
  position = [0, 1, 0] 
}) => {
  return (
    <group position={position}>
      {efectos.burbujeo && <BurbujasEfecto intensidad={efectos.temperatura / 100} />}
      {efectos.humo && <HumoEfecto color={efectos.colorFinal} />}
      {efectos.llama && <LlamaEfecto intensidad={efectos.intensidadLuz || 0.8} colorLuz={efectos.colorLuz} />}
      {efectos.precipitado && <PrecipitadoEfecto color={efectos.colorFinal} />}
    </group>
  );
};

// ============================================
// EFECTO DE BURBUJAS
// ============================================
const BurbujasEfecto: React.FC<{ intensidad: number }> = ({ intensidad }) => {
  const particlesRef = useRef<THREE.Points>(null);
  
  const { positions, velocities, sizes } = useMemo(() => {
    const count = Math.floor(100 * (intensidad + 0.5));
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count);
    const sizes = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      // Posición inicial dentro del líquido
      positions[i * 3] = (Math.random() - 0.5) * 0.6;
      positions[i * 3 + 1] = Math.random() * 0.3;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.6;
      
      // Velocidad de ascenso variable
      velocities[i] = 0.008 + Math.random() * 0.015 * intensidad;
      
      // Tamaño de burbuja
      sizes[i] = 0.02 + Math.random() * 0.05;
    }
    
    return { positions, velocities, sizes };
  }, [intensidad]);

  useFrame(() => {
    if (!particlesRef.current) return;
    
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    const count = positions.length / 3;
    
    for (let i = 0; i < count; i++) {
      // Ascenso de burbujas
      positions[i * 3 + 1] += velocities[i];
      
      // Movimiento lateral sinusoidal (simula turbulencia)
      positions[i * 3] += Math.sin(positions[i * 3 + 1] * 10) * 0.002;
      positions[i * 3 + 2] += Math.cos(positions[i * 3 + 1] * 10) * 0.002;
      
      // Resetear cuando llega arriba
      if (positions[i * 3 + 1] > 2.5) {
        positions[i * 3 + 1] = 0;
        positions[i * 3] = (Math.random() - 0.5) * 0.6;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 0.6;
      }
    }
    
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#ffffff"
        transparent
        opacity={0.7}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        map={createBubbleTexture()}
      />
    </points>
  );
};

// ============================================
// EFECTO DE HUMO
// ============================================
const HumoEfecto: React.FC<{ color: string }> = ({ color }) => {
  const groupRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<Array<THREE.Mesh>>([]);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    // Movimiento ascendente general
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3 + 1.2;
    groupRef.current.rotation.y += 0.005;
    
    // Animación individual de nubes
    cloudsRef.current.forEach((cloud, i) => {
      if (cloud) {
        cloud.rotation.y += 0.01 * (i % 2 === 0 ? 1 : -1);
        cloud.rotation.z += 0.005;
        const scale = 1 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.1;
        cloud.scale.setScalar(scale);
      }
    });
  });

  const smokeColor = new THREE.Color(color).lerp(new THREE.Color('#888888'), 0.5);

  return (
    <group ref={groupRef}>
      {Array.from({ length: 8 }).map((_, i) => {
        const height = i * 0.35;
        const radius = 0.25 + i * 0.08;
        const opacity = 0.4 - i * 0.04;
        
        return (
          <Sphere
            key={i}
            ref={(el) => {
              if (el) cloudsRef.current[i] = el as THREE.Mesh;
            }}
            args={[radius, 16, 16]}
            position={[
              Math.sin(i * 0.8) * 0.15,
              height,
              Math.cos(i * 0.8) * 0.15
            ]}
          >
            <meshStandardMaterial
              color={smokeColor}
              transparent
              opacity={opacity}
              roughness={1}
              metalness={0}
              depthWrite={false}
            />
          </Sphere>
        );
      })}
      
      {/* Luz ambiente del humo */}
      <pointLight
        position={[0, 0.5, 0]}
        intensity={0.2}
        color={color}
        distance={3}
      />
    </group>
  );
};

// ============================================
// EFECTO DE LLAMA
// ============================================
const LlamaEfecto: React.FC<{ intensidad: number; colorLuz?: string }> = ({ 
  intensidad, 
  colorLuz = '#FF6600' 
}) => {
  const flameRef = useRef<THREE.Group>(null);
  const innerFlameRef = useRef<THREE.Mesh>(null);
  const sparklesRef = useRef<THREE.Points>(null);

  const { sparks } = useMemo(() => {
    const count = 30;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.3;
      positions[i * 3 + 1] = Math.random() * 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
      
      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = 0.02 + Math.random() * 0.03;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }
    
    return { 
      sparks: positions,
      sparkVelocities: velocities
    };
  }, []);

  useFrame((state) => {
    if (!flameRef.current) return;
    
    // Oscilación de la llama
    const scale = 1 + Math.sin(state.clock.elapsedTime * 12) * 0.15 * intensidad;
    const wobble = Math.sin(state.clock.elapsedTime * 8) * 0.08;
    
    flameRef.current.scale.set(1, scale, 1);
    flameRef.current.position.x = wobble;
    flameRef.current.rotation.z = wobble * 0.5;
    
    // Llama interior más intensa
    if (innerFlameRef.current) {
      const innerScale = 1 + Math.sin(state.clock.elapsedTime * 15) * 0.2;
      innerFlameRef.current.scale.set(1, innerScale, 1);
    }
    
    // Animación de chispas
    if (sparklesRef.current) {
      const positions = sparklesRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < positions.length / 3; i++) {
        positions[i * 3 + 1] += 0.03;
        positions[i * 3] += Math.sin(positions[i * 3 + 1] * 5) * 0.01;
        
        if (positions[i * 3 + 1] > 1.5) {
          positions[i * 3 + 1] = 0;
          positions[i * 3] = (Math.random() - 0.5) * 0.3;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
        }
      }
      
      sparklesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      <group ref={flameRef}>
        {/* Llama exterior (naranja/roja) */}
        <Cone args={[0.25 * intensidad, 0.9 * intensidad, 16]} position={[0, 0.45, 0]}>
          <meshBasicMaterial
            color={colorLuz}
            transparent
            opacity={0.85}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </Cone>
        
        {/* Llama intermedia (amarilla) */}
        <Cone args={[0.18 * intensidad, 0.7 * intensidad, 16]} position={[0, 0.35, 0]}>
          <meshBasicMaterial
            color="#FFAA00"
            transparent
            opacity={0.75}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </Cone>
        
        {/* Llama interior (azul/blanca) */}
        <Cone 
          ref={innerFlameRef}
          args={[0.12 * intensidad, 0.5 * intensidad, 16]} 
          position={[0, 0.25, 0]}
        >
          <meshBasicMaterial
            color="#00BFFF"
            transparent
            opacity={0.7}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </Cone>

        {/* Núcleo brillante */}
        <Sphere args={[0.08 * intensidad, 16, 16]} position={[0, 0.15, 0]}>
          <meshBasicMaterial
            color="#FFFFFF"
            emissive="#FFFFFF"
            emissiveIntensity={2}
            toneMapped={false}
          />
        </Sphere>
      </group>

      {/* Chispas volando */}
      <points ref={sparklesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={sparks.length / 3}
            array={sparks}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.04}
          color="#FFFF00"
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Sistema de luces de la llama */}
      <pointLight
        position={[0, 0.5, 0]}
        color={colorLuz}
        intensity={3 * intensidad}
        distance={4}
        decay={2}
        castShadow
      />
      
      <pointLight
        position={[0, 0.3, 0]}
        color="#FFAA00"
        intensity={2 * intensidad}
        distance={2.5}
      />
      
      {/* Luz ambiental cálida */}
      <hemisphereLight
        skyColor="#FFAA00"
        groundColor="#FF6600"
        intensity={0.5 * intensidad}
        position={[0, 1, 0]}
      />
    </group>
  );
};

// ============================================
// EFECTO DE PRECIPITADO
// ============================================
const PrecipitadoEfecto: React.FC<{ color: string }> = ({ color }) => {
  const particlesRef = useRef<THREE.Points>(null);
  const pilesRef = useRef<Array<THREE.Mesh>>([]);
  
  const particles = useMemo(() => {
    const count = 60;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count);
    const sizes = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.7;
      positions[i * 3 + 1] = 0.5 + Math.random() * 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.7;
      velocities[i] = 0.015 + Math.random() * 0.02;
      sizes[i] = 0.04 + Math.random() * 0.06;
    }
    
    return { positions, velocities, sizes };
  }, []);

  useFrame(() => {
    if (!particlesRef.current) return;
    
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < positions.length / 3; i++) {
      // Caída con gravedad
      positions[i * 3 + 1] -= particles.velocities[i];
      
      // Movimiento lateral leve
      positions[i * 3] += Math.sin(positions[i * 3 + 1] * 5) * 0.001;
      
      // Resetear cuando llega al fondo
      if (positions[i * 3 + 1] < 0.1) {
        positions[i * 3 + 1] = 2;
        positions[i * 3] = (Math.random() - 0.5) * 0.7;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 0.7;
      }
    }
    
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group>
      {/* Partículas cayendo */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particles.positions.length / 3}
            array={particles.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={particles.sizes.length}
            array={particles.sizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          color={color}
          transparent
          opacity={0.9}
          sizeAttenuation
          map={createPrecipitateTexture()}
        />
      </points>

      {/* Acumulación en el fondo */}
      {Array.from({ length: 15 }).map((_, i) => (
        <Sphere
          key={i}
          ref={(el) => {
            if (el) pilesRef.current[i] = el as THREE.Mesh;
          }}
          args={[0.05 + Math.random() * 0.03, 8, 8]}
          position={[
            (Math.random() - 0.5) * 0.6,
            0.05 + Math.random() * 0.1,
            (Math.random() - 0.5) * 0.6
          ]}
        >
          <meshStandardMaterial
            color={color}
            roughness={0.8}
            metalness={0.2}
          />
        </Sphere>
      ))}
    </group>
  );
};

// ============================================
// FUNCIONES AUXILIARES PARA TEXTURAS
// ============================================
function createBubbleTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

function createPrecipitateTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(16, 16, 12, 0, Math.PI * 2);
  ctx.fill();
  
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export default EfectosVisuales;