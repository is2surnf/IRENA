import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cylinder, Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';
import type { ContenidoUtensilio } from '../../../types/simulacion.types';

interface TuboEnsayo3DProps {
  contenido?: ContenidoUtensilio;
  position?: [number, number, number];
  scale?: number;
}

const TuboEnsayo3D: React.FC<TuboEnsayo3DProps> = ({ 
  contenido, 
  position = [0, 0, 0],
  scale = 1
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const liquidRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    // Animación sutil del tubo
    if (groupRef.current) {
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.005;
    }

    // Animación del líquido
    if (liquidRef.current && contenido?.estado === 'mezclando') {
      liquidRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.05;
    }
  });

  const glassMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      transparent: true,
      opacity: 0.12,
      color: '#aaccff',
      transmission: 0.97,
      roughness: 0.03,
      metalness: 0,
      thickness: 0.3,
      ior: 1.45,
      envMapIntensity: 1.5
    });
  }, []);

  const rimMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#dddddd',
      roughness: 0.1,
      metalness: 0.9,
      envMapIntensity: 2
    });
  }, []);

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Cuerpo cilíndrico del tubo */}
      <Cylinder 
        args={[0.2 * scale, 0.2 * scale, 1.2 * scale, 32]} 
        position={[0, 0.6 * scale, 0]}
        castShadow
        receiveShadow
      >
        <primitive object={glassMaterial} />
      </Cylinder>

      {/* Fondo redondeado */}
      <Sphere 
        args={[0.2 * scale, 16, 16, 0, Math.PI, 0, Math.PI]} 
        position={[0, 0.0 * scale, 0]}
        castShadow
      >
        <primitive object={glassMaterial} />
      </Sphere>

      {/* Borde superior */}
      <Cylinder 
        args={[0.21 * scale, 0.21 * scale, 0.04 * scale, 32]} 
        position={[0, 1.22 * scale, 0]}
        castShadow
      >
        <primitive object={rimMaterial} />
      </Cylinder>

      {/* Líquido contenido */}
      {contenido && contenido.nivel > 0 && (
        <group>
          {/* Cuerpo del líquido */}
          <Cylinder 
            ref={liquidRef}
            args={[0.18 * scale, 0.18 * scale, contenido.nivel * 0.9 * scale, 32]} 
            position={[0, (contenido.nivel * 0.9 * scale) / 2 + 0.05 * scale, 0]}
            castShadow
          >
            <meshPhysicalMaterial
              color={contenido.color}
              transparent
              opacity={0.85}
              roughness={0.08}
              transmission={0.2}
              thickness={0.8}
              envMapIntensity={1.2}
            />
          </Cylinder>

          {/* Menisco superior */}
          <Sphere 
            args={[0.18 * scale, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} 
            position={[0, contenido.nivel * 0.9 * scale + 0.05 * scale, 0]}
            rotation={[Math.PI, 0, 0]}
          >
            <meshPhysicalMaterial
              color={contenido.color}
              transparent
              opacity={0.7}
              roughness={0.05}
            />
          </Sphere>

          {/* Efectos de reacción */}
          {contenido.estado === 'reaccionando' && (
            <CentelleoEfecto 
              position={[0, contenido.nivel * 0.9 * scale * 0.5, 0]}
              intensidad={1}
              color={contenido.color}
            />
          )}
        </group>
      )}

      {/* Soporte del tubo (simulado) */}
      <Cylinder 
        args={[0.25 * scale, 0.3 * scale, 0.08 * scale, 6]} 
        position={[0, -0.1 * scale, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#888888"
          roughness={0.6}
          metalness={0.4}
        />
      </Cylinder>

      {/* Marcas de graduación */}
      {[0.2, 0.4, 0.6, 0.8, 1.0].map((y, i) => (
        <group key={i} position={[0, y * scale, 0]}>
          <Cylinder
            args={[0.21 * scale, 0.21 * scale, 0.008 * scale, 32]}
            position={[0, 0, 0]}
          >
            <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
          </Cylinder>
          
          {/* Marcas numéricas */}
          {(i === 0 || i === 2 || i === 4) && (
            <Text
              position={[0.25 * scale, 0, 0]}
              fontSize={0.06 * scale}
              color="#666666"
              anchorX="left"
              anchorY="middle"
              font="/fonts/inter-regular.woff"
            >
              {i * 2 + 2}ml
            </Text>
          )}
        </group>
      ))}

      {/* Etiqueta elegante */}
      <Text
        position={[0, 1.35 * scale, 0]}
        fontSize={0.08 * scale}
        color="#333333"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
        outlineWidth={0.001}
        outlineColor="#ffffff"
      >
        Tubo Ensayo
      </Text>

      {/* Reflejo interno */}
      <Cylinder 
        args={[0.19 * scale, 0.19 * scale, 1.18 * scale, 32]} 
        position={[0.01 * scale, 0.6 * scale, 0.01 * scale]}
      >
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </Cylinder>
    </group>
  );
};

// Efecto de centelleo para reacciones
const CentelleoEfecto: React.FC<{ position: [number, number, number]; intensidad: number; color: string }> = ({ 
  position, 
  intensidad,
  color 
}) => {
  const sparksRef = useRef<THREE.Points>(null);
  
  const { positions, colors, sizes } = useMemo(() => {
    const count = Math.floor(8 * intensidad);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    const baseColor = new THREE.Color(color);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 0.1 * Math.random();
      const angle = Math.random() * Math.PI * 2;
      
      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = (Math.random() - 0.5) * 0.3;
      positions[i3 + 2] = Math.sin(angle) * radius;
      
      // Variación de color
      const sparkColor = baseColor.clone().offsetHSL(0, 0, Math.random() * 0.3 - 0.15);
      colors[i3] = sparkColor.r;
      colors[i3 + 1] = sparkColor.g;
      colors[i3 + 2] = sparkColor.b;
      
      sizes[i] = 0.01 + Math.random() * 0.02;
    }
    
    return { positions, colors, sizes };
  }, [intensidad, color]);

  useFrame((state) => {
    if (!sparksRef.current) return;
    
    const positions = sparksRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < positions.length / 3; i++) {
      const i3 = i * 3;
      
      // Movimiento aleatorio
      positions[i3] += (Math.random() - 0.5) * 0.01;
      positions[i3 + 1] += (Math.random() - 0.5) * 0.01;
      positions[i3 + 2] += (Math.random() - 0.5) * 0.01;
      
      // Mantener dentro del volumen
      const distance = Math.sqrt(positions[i3] ** 2 + positions[i3 + 2] ** 2);
      if (distance > 0.15) {
        positions[i3] *= 0.9;
        positions[i3 + 2] *= 0.9;
      }
      
      if (Math.abs(positions[i3 + 1]) > 0.2) {
        positions[i3 + 1] *= 0.9;
      }
    }
    
    sparksRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={sparksRef} position={position}>
      <bufferGeometry>
  <bufferAttribute
    args={[positions, 3]}
    attach="attributes-position"
  />
  <bufferAttribute
    args={[colors, 3]}
    attach="attributes-color"
  />
  <bufferAttribute
    args={[sizes, 1]}
    attach="attributes-size"
  />
</bufferGeometry>
    </points>
  );
};

export default TuboEnsayo3D;