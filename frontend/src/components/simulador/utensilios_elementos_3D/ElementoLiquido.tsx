import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Cylinder, Text } from '@react-three/drei';
import * as THREE from 'three';

interface ElementoLiquidoProps {
  color: string;
  simbolo?: string;
  position?: [number, number, number];
  scale?: number;
  onClick?: () => void;
}

const ElementoLiquido: React.FC<ElementoLiquidoProps> = ({ 
  color, 
  simbolo = 'L',
  position = [0, 0, 0],
  scale = 1,
  onClick
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const liquidRef = useRef<THREE.Mesh>(null);
  const surfaceRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    // Movimiento fluido del grupo
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.03;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }

    // Animación de onda en el líquido
    if (liquidRef.current) {
      const time = state.clock.elapsedTime;
      liquidRef.current.scale.y = 1 + Math.sin(time * 2) * 0.05;
      liquidRef.current.rotation.z = Math.sin(time * 1.5) * 0.02;
    }

    // Animación de la superficie
    if (surfaceRef.current) {
      const time = state.clock.elapsedTime;
      surfaceRef.current.position.y = Math.sin(time * 3) * 0.02;
    }
  });

  const liquidMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: color,
      transparent: true,
      opacity: 0.85,
      roughness: 0.1,
      metalness: 0,
      transmission: 0.6,
      thickness: 1.5,
      ior: 1.33,
      envMapIntensity: 1.8,
      clearcoat: 0.5,
      clearcoatRoughness: 0.05
    });
  }, [color]);

  const containerMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: '#aaccff',
      transparent: true,
      opacity: 0.3,
      roughness: 0.05,
      metalness: 0,
      transmission: 0.95,
      thickness: 0.3,
      ior: 1.45
    });
  }, []);

  return (
    <group 
      ref={groupRef} 
      position={position} 
      scale={scale}
      onClick={onClick}
    >
      {/* Contenedor de vidrio */}
      <Sphere 
        args={[0.4, 32, 32]} 
        castShadow
        receiveShadow
      >
        <primitive object={containerMaterial} />
      </Sphere>

      {/* Líquido principal */}
      <Sphere 
        ref={liquidRef}
        args={[0.35, 32, 32]} 
        castShadow
      >
        <primitive object={liquidMaterial} />
      </Sphere>

      {/* Superficie del líquido con ondulación */}
      <Sphere 
        ref={surfaceRef}
        args={[0.36, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} 
        position={[0, 0.34, 0]}
        rotation={[Math.PI, 0, 0]}
      >
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={0.9}
          roughness={0.05}
          metalness={0}
          transmission={0.3}
        />
      </Sphere>

      {/* Gotas en las paredes */}
      <GotasEfecto 
        color={color}
        cantidad={12}
        radio={0.38}
      />

      {/* Burbujas ascendentes */}
      <BurbujasAscendentes 
        color={color}
        cantidad={15}
        altura={0.6}
      />

      {/* Onda superficial */}
      <OndaSuperficial 
        color={color}
        radio={0.36}
      />

      {/* Símbolo del elemento */}
      <Text
        position={[0, 0.8, 0]}
        fontSize={0.25}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {simbolo}
      </Text>

      {/* Base del contenedor */}
      <Cylinder 
        args={[0.45, 0.5, 0.08, 16]} 
        position={[0, -0.45, 0]}
        receiveShadow
      >
        <meshStandardMaterial
          color="#333333"
          roughness={0.6}
          metalness={0.4}
        />
      </Cylinder>

      {/* Reflejo especular */}
      <Sphere 
        args={[0.39, 32, 32, 0, Math.PI * 2, Math.PI / 4, Math.PI / 2]} 
        position={[0.1, 0.1, 0.1]}
      >
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.3}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Aura líquida */}
      <Sphere 
        args={[0.5, 16, 16]} 
      >
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.15}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>
    </group>
  );
};

// Efecto de gotas en las paredes
const GotasEfecto: React.FC<{ color: string; cantidad: number; radio: number }> = ({ 
  color, 
  cantidad,
  radio 
}) => {
  const dropsRef = useRef<THREE.Points>(null);
  
  const { positions, sizes } = useMemo(() => {
    const positions = new Float32Array(cantidad * 3);
    const sizes = new Float32Array(cantidad);
    
    for (let i = 0; i < cantidad; i++) {
      const i3 = i * 3;
      
      // Distribución en hemisferio
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1) * 0.5; // Solo hemisferio superior
      
      positions[i3] = Math.sin(phi) * Math.cos(theta) * radio;
      positions[i3 + 1] = Math.cos(phi) * radio * 0.8;
      positions[i3 + 2] = Math.sin(phi) * Math.sin(theta) * radio;
      
      sizes[i] = 0.03 + Math.random() * 0.04;
    }
    
    return { positions, sizes };
  }, [cantidad, radio]);

  useFrame((state) => {
    if (!dropsRef.current) return;
    
    const positions = dropsRef.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.elapsedTime;
    
    for (let i = 0; i < positions.length / 3; i++) {
      const i3 = i * 3;
      
      // Las gotas se deslizan hacia abajo
      positions[i3 + 1] -= 0.001;
      
      // Reset cuando llegan al fondo
      if (positions[i3 + 1] < -0.3) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1) * 0.3;
        
        positions[i3] = Math.sin(phi) * Math.cos(theta) * radio;
        positions[i3 + 1] = 0.3;
        positions[i3 + 2] = Math.sin(phi) * Math.sin(theta) * radio;
      }
      
      // Movimiento de deslizamiento
      const currentRadius = Math.sqrt(positions[i3] ** 2 + positions[i3 + 2] ** 2);
      if (currentRadius > 0.1) {
        positions[i3] *= 0.999;
        positions[i3 + 2] *= 0.999;
      }
    }
    
    dropsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={dropsRef}>
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

// Burbujas ascendentes
const BurbujasAscendentes: React.FC<{ color: string; cantidad: number; altura: number }> = ({ 
  color, 
  cantidad,
  altura 
}) => {
  const bubblesRef = useRef<THREE.Points>(null);
  
  const { positions, sizes } = useMemo(() => {
    const positions = new Float32Array(cantidad * 3);
    const sizes = new Float32Array(cantidad);
    
    for (let i = 0; i < cantidad; i++) {
      const i3 = i * 3;
      
      positions[i3] = (Math.random() - 0.5) * 0.3;
      positions[i3 + 1] = (Math.random() - 0.5) * altura;
      positions[i3 + 2] = (Math.random() - 0.5) * 0.3;
      
      sizes[i] = 0.02 + Math.random() * 0.03;
    }
    
    return { positions, sizes };
  }, [cantidad, altura]);

  useFrame((state) => {
    if (!bubblesRef.current) return;
    
    const positions = bubblesRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < positions.length / 3; i++) {
      const i3 = i * 3;
      
      // Ascenso de las burbujas
      positions[i3 + 1] += 0.01;
      
      // Movimiento lateral aleatorio
      positions[i3] += (Math.random() - 0.5) * 0.002;
      positions[i3 + 2] += (Math.random() - 0.5) * 0.002;
      
      // Reset cuando llegan arriba
      if (positions[i3 + 1] > altura / 2) {
        positions[i3 + 1] = -altura / 2;
        positions[i3] = (Math.random() - 0.5) * 0.3;
        positions[i3 + 2] = (Math.random() - 0.5) * 0.3;
      }
    }
    
    bubblesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={bubblesRef}>
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

// Onda superficial animada
const OndaSuperficial: React.FC<{ color: string; radio: number }> = ({ 
  color, 
  radio 
}) => {
  const waveRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!waveRef.current) return;
    
    const time = state.clock.elapsedTime;
    waveRef.current.rotation.y = time * 0.5;
    waveRef.current.scale.setScalar(1 + Math.sin(time * 2) * 0.1);
  });

  return (
    <mesh ref={waveRef} position={[0, 0.35, 0]}>
      <ringGeometry args={[radio * 0.8, radio * 1.2, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.4}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};

export default ElementoLiquido;