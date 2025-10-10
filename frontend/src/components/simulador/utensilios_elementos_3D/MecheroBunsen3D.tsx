import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cylinder, Cone, Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';

interface MecheroBunsen3DProps {
  position?: [number, number, number];
  scale?: number;
  encendido?: boolean;
  onToggle?: () => void;
}

const MecheroBunsen3D: React.FC<MecheroBunsen3DProps> = ({ 
  position = [0, 0, 0],
  scale = 1,
  encendido = false,
  onToggle
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const flameRef = useRef<THREE.Group>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  useFrame((state) => {
    // Animación del mechero
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.2) * 0.005;
    }

    // Animación de la llama
    if (flameRef.current && encendido) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 12) * 0.15;
      const wobble = Math.sin(state.clock.elapsedTime * 8) * 0.08;
      
      flameRef.current.scale.set(1, scale, 1);
      flameRef.current.position.x = wobble;
      flameRef.current.rotation.z = wobble * 0.5;
    }

    // Animación del indicador
    if (groupRef.current) {
      const indicator = groupRef.current.getObjectByName('indicator');
      if (indicator) {
        indicator.rotation.y += 0.02;
        if (isHovered) {
          indicator.scale.setScalar(1.2 + Math.sin(state.clock.elapsedTime * 10) * 0.1);
        } else {
          indicator.scale.setScalar(1);
        }
      }
    }
  });

  const metalMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#2C3E50',
      roughness: 0.3,
      metalness: 0.9,
      envMapIntensity: 2
    });
  }, []);

  const brassMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#B8860B',
      roughness: 0.4,
      metalness: 0.8,
      envMapIntensity: 1.5
    });
  }, []);

  const rubberMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#333333',
      roughness: 0.9,
      metalness: 0.1
    });
  }, []);

  const handleClick = (e: any) => {
    e.stopPropagation();
    onToggle?.();
  };

  return (
    <group 
      ref={groupRef} 
      position={position} 
      scale={scale}
      onClick={handleClick}
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}
    >
      {/* Base del mechero */}
      <Cylinder 
        args={[0.35 * scale, 0.45 * scale, 0.25 * scale, 32]} 
        position={[0, 0.125 * scale, 0]}
        castShadow
        receiveShadow
      >
        <primitive object={metalMaterial} />
      </Cylinder>

      {/* Detalle de la base */}
      <Cylinder 
        args={[0.33 * scale, 0.33 * scale, 0.05 * scale, 32]} 
        position={[0, 0.225 * scale, 0]}
        castShadow
      >
        <meshStandardMaterial
          color="#34495E"
          roughness={0.4}
          metalness={0.8}
        />
      </Cylinder>

      {/* Cuerpo principal */}
      <Cylinder 
        args={[0.12 * scale, 0.12 * scale, 1.2 * scale, 32]} 
        position={[0, 0.85 * scale, 0]}
        castShadow
      >
        <primitive object={metalMaterial} />
      </Cylinder>

      {/* Regulador de aire */}
      <Cylinder 
        args={[0.15 * scale, 0.15 * scale, 0.08 * scale, 16]} 
        position={[0, 0.4 * scale, 0]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <primitive object={brassMaterial} />
      </Cylinder>

      {/* Mango del regulador */}
      <Cylinder 
        args={[0.08 * scale, 0.08 * scale, 0.3 * scale, 16]} 
        position={[0.2 * scale, 0.4 * scale, 0]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <meshStandardMaterial
          color="#7F8C8D"
          roughness={0.7}
          metalness={0.3}
        />
      </Cylinder>

      {/* Boquilla superior */}
      <Cylinder 
        args={[0.08 * scale, 0.12 * scale, 0.15 * scale, 32]} 
        position={[0, 1.52 * scale, 0]}
        castShadow
      >
        <primitive object={brassMaterial} />
      </Cylinder>

      {/* Tubo de gas (simulado) */}
      <Cylinder 
        args={[0.05 * scale, 0.05 * scale, 0.8 * scale, 16]} 
        position={[-0.3 * scale, 0.2 * scale, 0]}
        rotation={[0, 0, Math.PI / 4]}
        castShadow
      >
        <primitive object={rubberMaterial} />
      </Cylinder>

      {/* Conector del tubo */}
      <Sphere 
        args={[0.08 * scale, 16, 16]} 
        position={[-0.15 * scale, 0.1 * scale, 0]}
        castShadow
      >
        <meshStandardMaterial
          color="#666666"
          roughness={0.8}
          metalness={0.2}
        />
      </Sphere>

      {/* Llama cuando está encendido */}
      {encendido && (
        <group ref={flameRef} position={[0, 1.7 * scale, 0]}>
          {/* Llama exterior (naranja) */}
          <Cone args={[0.25 * scale, 0.8 * scale, 16]} position={[0, 0.4 * scale, 0]}>
            <meshBasicMaterial
              color="#FF6600"
              transparent
              opacity={0.9}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
            />
          </Cone>
          
          {/* Llama media (amarilla) */}
          <Cone args={[0.18 * scale, 0.6 * scale, 16]} position={[0, 0.3 * scale, 0]}>
            <meshBasicMaterial
              color="#FFAA00"
              transparent
              opacity={0.8}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
            />
          </Cone>
          
          {/* Llama interior (azul) */}
          <Cone args={[0.12 * scale, 0.5 * scale, 16]} position={[0, 0.25 * scale, 0]}>
            <meshBasicMaterial
              color="#00BFFF"
              transparent
              opacity={0.7}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
            />
          </Cone>

          {/* Núcleo brillante */}
          <Sphere args={[0.08 * scale, 16, 16]} position={[0, 0.15 * scale, 0]}>
            <meshBasicMaterial
              color="#FFFFFF"
              toneMapped={false}
              blending={THREE.AdditiveBlending}
            />
          </Sphere>

          {/* Chispas */}
          <ChispasEfecto 
            position={[0, 0.8 * scale, 0]}
            intensidad={0.5}
            scale={scale}
          />

          {/* Luz de la llama */}
          <pointLight
            position={[0, 0.5 * scale, 0]}
            color="#FF6600"
            intensity={3}
            distance={4 * scale}
            decay={2}
            castShadow
          />
          
          <pointLight
            position={[0, 0.3 * scale, 0]}
            color="#00BFFF"
            intensity={2}
            distance={2.5 * scale}
          />
        </group>
      )}

      {/* Indicador de estado */}
      <Sphere 
        name="indicator"
        args={[0.05 * scale, 16, 16]} 
        position={[0.2 * scale, 0.3 * scale, 0]}
      >
        <meshBasicMaterial
          color={encendido ? "#00FF00" : "#FF0000"}
          emissive={encendido ? "#00FF00" : "#FF0000"}
          emissiveIntensity={1}
        />
      </Sphere>

      {/* Etiqueta elegante */}
      <Text
        position={[0, 1.8 * scale, 0]}
        fontSize={0.1 * scale}
        color={encendido ? "#FF6600" : "#666666"}
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
        outlineWidth={0.002}
        outlineColor="#000000"
      >
        {encendido ? "ENCENDIDO" : "Mechero Bunsen"}
      </Text>

      {/* Efecto de hover */}
      {isHovered && (
        <Sphere 
          args={[0.5 * scale, 16, 16]} 
          position={[0, 0.8 * scale, 0]}
        >
          <meshBasicMaterial
            color="#ffff00"
            transparent
            opacity={0.1}
            wireframe
          />
        </Sphere>
      )}
    </group>
  );
};

// Efecto de chispas
const ChispasEfecto: React.FC<{ position: [number, number, number]; intensidad: number; scale: number }> = ({ 
  position, 
  intensidad,
  scale 
}) => {
  const sparksRef = useRef<THREE.Points>(null);
  
  const { positions, sizes } = useMemo(() => {
    const count = Math.floor(15 * intensidad);
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 0.3 * scale;
      positions[i3 + 1] = Math.random() * 0.5 * scale;
      positions[i3 + 2] = (Math.random() - 0.5) * 0.3 * scale;
      
      sizes[i] = (0.02 + Math.random() * 0.03) * scale;
    }
    
    return { positions, sizes };
  }, [intensidad, scale]);

  useFrame((state) => {
    if (!sparksRef.current) return;
    
    const positions = sparksRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < positions.length / 3; i++) {
      const i3 = i * 3;
      
      positions[i3 + 1] += 0.03 * scale;
      positions[i3] += Math.sin(positions[i3 + 1] * 5) * 0.01 * scale;
      
      if (positions[i3 + 1] > 1.5 * scale) {
        positions[i3 + 1] = 0;
        positions[i3] = (Math.random() - 0.5) * 0.3 * scale;
        positions[i3 + 2] = (Math.random() - 0.5) * 0.3 * scale;
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
    args={[sizes, 1]}
    attach="attributes-size"
  />
</bufferGeometry>
    </points>
  );
};

export default MecheroBunsen3D;