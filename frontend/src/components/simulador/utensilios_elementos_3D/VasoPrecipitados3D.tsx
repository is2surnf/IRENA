import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cylinder, Text } from '@react-three/drei';
import * as THREE from 'three';
import type { ContenidoUtensilio } from '../../../types/simulacion.types';

interface VasoPrecipitados3DProps {
  contenido?: ContenidoUtensilio;
  position?: [number, number, number];
  scale?: number;
}

const VasoPrecipitados3D: React.FC<VasoPrecipitados3DProps> = ({ 
  contenido, 
  position = [0, 0, 0],
  scale = 1
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const liquidRef = useRef<THREE.Mesh>(null);
  
  // Animación del líquido
  useFrame((state) => {
    if (liquidRef.current && contenido?.estado === 'mezclando') {
      liquidRef.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 0.02;
    }
    
    // Flotación sutil del vaso
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.01;
    }
  });

  // Textura procedural para el vidrio
  const glassMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      transparent: true,
      opacity: 0.15,
      color: '#aaccff',
      transmission: 0.95,
      roughness: 0.05,
      metalness: 0,
      thickness: 0.5,
      ior: 1.4,
      envMapIntensity: 1.2,
      clearcoat: 0.5,
      clearcoatRoughness: 0.1
    });
  }, []);

  // Material para el borde metálico
  const rimMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#cccccc',
      roughness: 0.3,
      metalness: 0.8,
      envMapIntensity: 1.5
    });
  }, []);

  // Material para la base
  const baseMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#dddddd',
      roughness: 0.4,
      metalness: 0.6,
      transparent: true,
      opacity: 0.3
    });
  }, []);

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Base del vaso */}
      <Cylinder 
        args={[0.6 * scale, 0.6 * scale, 0.08 * scale, 32]} 
        position={[0, 0.04 * scale, 0]}
        castShadow
        receiveShadow
      >
        <primitive object={baseMaterial} />
      </Cylinder>

      {/* Cuerpo principal del vaso */}
      <Cylinder 
        args={[0.5 * scale, 0.6 * scale, 1.5 * scale, 32]} 
        position={[0, 0.75 * scale, 0]}
        castShadow
        receiveShadow
      >
        <primitive object={glassMaterial} />
      </Cylinder>

      {/* Borde superior metálico */}
      <Cylinder 
        args={[0.52 * scale, 0.52 * scale, 0.05 * scale, 32]} 
        position={[0, 1.52 * scale, 0]}
        castShadow
      >
        <primitive object={rimMaterial} />
      </Cylinder>

      {/* Líquido contenido */}
      {contenido && contenido.nivel > 0 && (
        <group>
          <Cylinder 
            ref={liquidRef}
            args={[0.48 * scale, 0.58 * scale, contenido.nivel * 1.4 * scale, 32]} 
            position={[0, (contenido.nivel * 1.4 * scale) / 2 + 0.05 * scale, 0]}
            castShadow
          >
            <meshPhysicalMaterial
              color={contenido.color}
              transparent
              opacity={0.75}
              roughness={0.1}
              metalness={0.1}
              transmission={0.3}
              thickness={1}
              envMapIntensity={1.5}
            />
          </Cylinder>

          {/* Superficie del líquido con menisco */}
          <Cylinder 
            args={[0.48 * scale, 0.58 * scale, 0.02 * scale, 32]} 
            position={[0, contenido.nivel * 1.4 * scale + 0.05 * scale, 0]}
          >
            <meshPhysicalMaterial
              color={contenido.color}
              transparent
              opacity={0.9}
              roughness={0.05}
              metalness={0}
            />
          </Cylinder>

          {/* Efecto de burbujas cuando está mezclando */}
          {contenido.estado === 'mezclando' && (
            <BurbujasEfecto 
              position={[0, contenido.nivel * 1.4 * scale * 0.5, 0]}
              intensidad={0.5}
              color={contenido.color}
            />
          )}
        </group>
      )}

      {/* Marcas de graduación */}
      {[0.3, 0.6, 0.9, 1.2].map((y, i) => (
        <group key={i} position={[0, y * scale, 0]}>
          <Cylinder
            args={[0.61 * scale, 0.61 * scale, 0.02 * scale, 32]}
            position={[0, 0, 0]}
          >
            <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
          </Cylinder>
          
          {/* Números de graduación */}
          <Text
            position={[0.65 * scale, 0, 0]}
            fontSize={0.1 * scale}
            color="#666666"
            anchorX="left"
            anchorY="middle"
            font="/fonts/inter-bold.woff"
          >
            {(i + 1) * 250}ml
          </Text>
        </group>
      ))}

      {/* Efecto de brillo/reflejo */}
      <Cylinder 
        args={[0.49 * scale, 0.59 * scale, 1.48 * scale, 32]} 
        position={[0, 0.75 * scale, 0.01 * scale]}
      >
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </Cylinder>

      {/* Etiqueta del vaso */}
      <Text
        position={[0, 1.7 * scale, 0]}
        fontSize={0.15 * scale}
        color="#333333"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        Vaso Precipitados
      </Text>
    </group>
  );
};

// Componente de burbujas interno
const BurbujasEfecto: React.FC<{ position: [number, number, number]; intensidad: number; color: string }> = ({ 
  position, 
  intensidad,
  color 
}) => {
  const bubblesRef = useRef<THREE.Points>(null);
  
  const { positions, sizes } = useMemo(() => {
    const count = Math.floor(20 * intensidad);
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 0.3 * Math.random();
      const angle = Math.random() * Math.PI * 2;
      
      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = Math.random() * 0.5;
      positions[i3 + 2] = Math.sin(angle) * radius;
      
      sizes[i] = 0.02 + Math.random() * 0.03;
    }
    
    return { positions, sizes };
  }, [intensidad]);

  useFrame((state) => {
    if (!bubblesRef.current) return;
    
    const positions = bubblesRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < positions.length / 3; i++) {
      positions[i * 3 + 1] += 0.01;
      
      if (positions[i * 3 + 1] > 0.5) {
        positions[i * 3 + 1] = 0;
        const radius = 0.3 * Math.random();
        const angle = Math.random() * Math.PI * 2;
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 2] = Math.sin(angle) * radius;
      }
    }
    
    bubblesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={bubblesRef} position={position}>
      <bufferGeometry>
  <bufferAttribute
    args={[positions, 3]}
    attach="attributes-position"
  />
  <bufferAttribute
    args={[sizes, 1]}
    attach="attributes-size"
  />
</bufferGeometry>
    </points>
  );
};

export default VasoPrecipitados3D;