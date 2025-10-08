// frontend/src/components/simulador/ElementosQuimicos3D.tsx
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Sphere, Text } from '@react-three/drei';
import type { Elemento } from '../../types/simulacion.types';
import * as THREE from 'three';

interface ElementosQuimicos3DProps {
  elemento: Elemento;
  position: [number, number, number];
  onClick: () => void;
}

const COLORES_CATEGORIA: Record<string, string> = {
  'Metales': '#FFD700',
  'No metales': '#4A90E2',
  'Gases y Halogenos': '#9B59B6',
  'Acidos': '#E74C3C',
  'Bases': '#27AE60',
  'Sales': '#ECF0F1',
};

const ElementosQuimicos3D: React.FC<ElementosQuimicos3DProps> = ({
  elemento,
  position,
  onClick
}) => {
  const [hover, setHover] = useState(false);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current && hover) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 2;
    }
  });

  const getColor = () => {
    return COLORES_CATEGORIA[elemento.categoria] || '#3498DB';
  };

  const renderByState = () => {
    switch (elemento.estado) {
      case 'Solido':
        return <ElementoSolido color={getColor()} />;
      case 'Liquido':
        return <ElementoLiquido color={getColor()} />;
      case 'Gas':
        return <ElementoGaseoso color={getColor()} />;
      default:
        return <ElementoSolido color={getColor()} />;
    }
  };

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      {renderByState()}

      <Text
        position={[0, 0.8, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {elemento.simbolo}
      </Text>

      {hover && (
        <Text
          position={[0, 1.2, 0]}
          fontSize={0.15}
          color="#00BFFF"
          anchorX="center"
          anchorY="middle"
        >
          {elemento.nombre}
        </Text>
      )}
    </group>
  );
};

const ElementoSolido: React.FC<{ color: string }> = ({ color }) => {
  return (
    <group>
      <Box args={[0.5, 0.5, 0.5]}>
        <meshStandardMaterial
          color={color}
          roughness={0.7}
          metalness={0.3}
        />
      </Box>
      <Box args={[0.52, 0.52, 0.52]}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.2}
          wireframe
        />
      </Box>
    </group>
  );
};

const ElementoLiquido: React.FC<{ color: string }> = ({ color }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group>
      <Sphere ref={meshRef} args={[0.3, 32, 32]}>
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={0.8}
          roughness={0.1}
          transmission={0.5}
        />
      </Sphere>
      <Sphere args={[0.1, 16, 16]} position={[0, -0.5, 0]}>
        <meshStandardMaterial color={color} transparent opacity={0.6} />
      </Sphere>
    </group>
  );
};

const ElementoGaseoso: React.FC<{ color: string }> = ({ color }) => {
  return (
    <group>
      {Array.from({ length: 15 }).map((_, i) => {
        const angle = (i / 15) * Math.PI * 2;
        const radius = 0.3 + Math.random() * 0.2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = (Math.random() - 0.5) * 0.4;

        return (
          <Sphere key={i} args={[0.05, 8, 8]} position={[x, y, z]}>
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.6}
            />
          </Sphere>
        );
      })}
      
      <Sphere args={[0.4, 16, 16]}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.1}
          wireframe
        />
      </Sphere>
    </group>
  );
};

export default ElementosQuimicos3D;