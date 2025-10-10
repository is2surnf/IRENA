import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cone, Cylinder, Text } from '@react-three/drei';
import * as THREE from 'three';
import type { ContenidoUtensilio } from '../../../types/simulacion.types';

interface MatrazErlenmeyer3DProps {
  contenido?: ContenidoUtensilio;
  position?: [number, number, number];
  scale?: number;
}

const MatrazErlenmeyer3D: React.FC<MatrazErlenmeyer3DProps> = ({ 
  contenido, 
  position = [0, 0, 0],
  scale = 1
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const liquidRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (liquidRef.current && contenido?.estado === 'mezclando') {
      liquidRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
    
    // Rotación sutil del matraz
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  // Materiales optimizados
  const glassMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      transparent: true,
      opacity: 0.15,
      color: '#aaccff',
      transmission: 0.95,
      roughness: 0.05,
      metalness: 0,
      thickness: 0.8,
      ior: 1.4,
      envMapIntensity: 1.2
    });
  }, []);

  const rimMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#bbbbbb',
      roughness: 0.2,
      metalness: 0.9,
      envMapIntensity: 2
    });
  }, []);

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Cuerpo cónico del matraz */}
      <Cone 
        args={[0.8 * scale, 1.5 * scale, 32]} 
        position={[0, 0.75 * scale, 0]}
        castShadow
        receiveShadow
      >
        <primitive object={glassMaterial} />
      </Cone>

      {/* Cuello del matraz */}
      <Cylinder 
        args={[0.2 * scale, 0.2 * scale, 0.8 * scale, 32]} 
        position={[0, 1.9 * scale, 0]}
        castShadow
      >
        <primitive object={glassMaterial} />
      </Cylinder>

      {/* Borde del cuello */}
      <Cylinder 
        args={[0.22 * scale, 0.22 * scale, 0.05 * scale, 32]} 
        position={[0, 2.32 * scale, 0]}
        castShadow
      >
        <primitive object={rimMaterial} />
      </Cylinder>

      {/* Líquido contenido */}
      {contenido && contenido.nivel > 0 && (
        <group>
          <Cone 
            ref={liquidRef}
            args={[0.78 * scale, contenido.nivel * 1.4 * scale, 32]} 
            position={[0, (contenido.nivel * 1.4 * scale) / 2 + 0.05 * scale, 0]}
            castShadow
          >
            <meshPhysicalMaterial
              color={contenido.color}
              transparent
              opacity={0.8}
              roughness={0.1}
              transmission={0.4}
              thickness={1.2}
            />
          </Cone>

          {/* Superficie del líquido */}
          <Cylinder 
            args={[0.18 * scale, 0.18 * scale, 0.02 * scale, 32]} 
            position={[0, contenido.nivel * 1.4 * scale + 0.05 * scale, 0]}
          >
            <meshPhysicalMaterial
              color={contenido.color}
              transparent
              opacity={0.9}
              roughness={0.05}
            />
          </Cylinder>

          {/* Efectos de mezcla */}
          {contenido.estado === 'mezclando' && (
            <VorticeEfecto 
              position={[0, contenido.nivel * 1.4 * scale * 0.3, 0]}
              intensidad={0.7}
              color={contenido.color}
            />
          )}
        </group>
      )}

      {/* Base del matraz */}
      <Cylinder 
        args={[0.85 * scale, 0.85 * scale, 0.1 * scale, 32]} 
        position={[0, 0.05 * scale, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#eeeeee"
          roughness={0.4}
          metalness={0.3}
          transparent
          opacity={0.6}
        />
      </Cylinder>

      {/* Marcas de volumen */}
      {[0.5, 1.0, 1.3].map((y, i) => (
        <Cylinder
          key={i}
          args={[0.81 * scale, 0.81 * scale, 0.01 * scale, 32]}
          position={[0, y * scale, 0]}
        >
          <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
        </Cylinder>
      ))}

      {/* Etiqueta elegante */}
      <Text
        position={[0, 2.5 * scale, 0]}
        fontSize={0.12 * scale}
        color="#444444"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
        outlineWidth={0.002}
        outlineColor="#ffffff"
      >
        Erlenmeyer
      </Text>

      {/* Reflejo especular */}
      <Cone 
        args={[0.79 * scale, 1.48 * scale, 32]} 
        position={[0, 0.75 * scale, 0.02 * scale]}
        rotation={[0, 0, 0]}
      >
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </Cone>
    </group>
  );
};

// Efecto de vórtice para mezcla
const VorticeEfecto: React.FC<{ position: [number, number, number]; intensidad: number; color: string }> = ({ 
  position, 
  intensidad,
  color 
}) => {
  const vortexRef = useRef<THREE.Points>(null);
  
  const { positions, sizes } = useMemo(() => {
    const count = Math.floor(15 * intensidad);
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const angle = (i / count) * Math.PI * 2;
      const radius = 0.2 * (1 - i / count);
      
      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = (i / count) * 0.3 - 0.15;
      positions[i3 + 2] = Math.sin(angle) * radius;
      
      sizes[i] = 0.015 + Math.random() * 0.02;
    }
    
    return { positions, sizes };
  }, [intensidad]);

  useFrame((state) => {
    if (!vortexRef.current) return;
    
    const positions = vortexRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < positions.length / 3; i++) {
      const i3 = i * 3;
      const angle = Math.atan2(positions[i3 + 2], positions[i3]);
      const newAngle = angle + 0.1;
      const radius = Math.sqrt(positions[i3] ** 2 + positions[i3 + 2] ** 2);
      
      positions[i3] = Math.cos(newAngle) * radius;
      positions[i3 + 2] = Math.sin(newAngle) * radius;
      positions[i3 + 1] += 0.005;
      
      if (positions[i3 + 1] > 0.15) {
        positions[i3 + 1] = -0.15;
      }
    }
    
    vortexRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={vortexRef} position={position}>
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

export default MatrazErlenmeyer3D;