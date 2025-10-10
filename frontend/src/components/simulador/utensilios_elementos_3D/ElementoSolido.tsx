import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Sphere, Text, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

interface ElementoSolidoProps {
  color: string;
  simbolo?: string;
  position?: [number, number, number];
  scale?: number;
  onClick?: () => void;
}

const ElementoSolido: React.FC<ElementoSolidoProps> = ({ 
  color, 
  simbolo = 'E',
  position = [0, 0, 0],
  scale = 1,
  onClick
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const crystalRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }

    if (crystalRef.current) {
      crystalRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
      crystalRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  const crystalMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: color,
      roughness: 0.2,
      metalness: 0.3,
      transmission: 0.1,
      thickness: 0.5,
      envMapIntensity: 1.5,
      clearcoat: 0.5,
      clearcoatRoughness: 0.1
    });
  }, [color]);

  const wireframeMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.3,
      wireframe: true
    });
  }, [color]);

  return (
    <group 
      ref={groupRef} 
      position={position} 
      scale={scale}
      onClick={onClick}
    >
      <Box ref={crystalRef} args={[0.5, 0.5, 0.5]} castShadow receiveShadow>
        <primitive object={crystalMaterial} />
      </Box>

      <Box args={[0.52, 0.52, 0.52]}>
        <primitive object={wireframeMaterial} />
      </Box>

      <ParticulasCristalinas 
        color={color}
        cantidad={8}
        radio={0.4}
      />

      <Text
        position={[0, 0.8, 0]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {simbolo}
      </Text>

      {/* ✅ CORREGIDO: Usar Cylinder en lugar de Cylinder inexistente */}
      <Cylinder 
        args={[0.3, 0.4, 0.05, 8]} 
        position={[0, -0.3, 0]}
        receiveShadow
      >
        <meshStandardMaterial
          color="#333333"
          roughness={0.7}
          metalness={0.3}
        />
      </Cylinder>

      <Sphere args={[0.6, 16, 16]}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </Sphere>

      <RayosEfecto 
        color={color}
        cantidad={6}
        longitud={0.8}
      />
    </group>
  );
};

const ParticulasCristalinas: React.FC<{ color: string; cantidad: number; radio: number }> = ({ 
  color, 
  cantidad,
  radio 
}) => {
  const particlesRef = useRef<THREE.Points>(null);
  
  const { positions, sizes } = useMemo(() => {
    const positions = new Float32Array(cantidad * 3);
    const sizes = new Float32Array(cantidad);
    
    for (let i = 0; i < cantidad; i++) {
      const i3 = i * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radio * (0.8 + Math.random() * 0.4);
      
      positions[i3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = r * Math.cos(phi);
      
      sizes[i] = 0.05 + Math.random() * 0.08;
    }
    
    return { positions, sizes };
  }, [cantidad, radio]);

  useFrame((state) => {
    if (!particlesRef.current) return;
    
    const geom = particlesRef.current.geometry;
    const posAttr = geom.attributes.position;
    const positionsArr = posAttr.array as Float32Array;
    
    for (let i = 0; i < positionsArr.length / 3; i++) {
      const i3 = i * 3;
      const time = state.clock.elapsedTime;
      const speed = 0.5 + i * 0.1;
      const angle = time * speed;
      
      const x = positionsArr[i3];
      const z = positionsArr[i3 + 2];
      const distance = Math.sqrt(x * x + z * z);
      
      if (distance > 0) {
        positionsArr[i3] = Math.cos(angle) * distance;
        positionsArr[i3 + 2] = Math.sin(angle) * distance;
      }
      positionsArr[i3 + 1] += Math.sin(time * 2 + i) * 0.01;
    }
    
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        {/* ✅ CORREGIDO: Agregado args */}
        <bufferAttribute
          args={[positions, 3]}
          attach="attributes-position"
        />
        <bufferAttribute
          args={[sizes, 1]}
          attach="attributes-size"
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color={color}
        transparent
        opacity={0.7}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const RayosEfecto: React.FC<{ color: string; cantidad: number; longitud: number }> = ({ 
  color, 
  cantidad,
  longitud 
}) => {
  const raysRef = useRef<THREE.Points>(null);
  
  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(cantidad * 3);
    const colors = new Float32Array(cantidad * 3);
    const baseColor = new THREE.Color(color);
    
    for (let i = 0; i < cantidad; i++) {
      const i3 = i * 3;
      const theta = (i / cantidad) * Math.PI * 2;
      const extension = longitud * (0.7 + Math.random() * 0.3);
      
      positions[i3] = Math.cos(theta) * extension;
      positions[i3 + 1] = (Math.random() - 0.5) * 0.2;
      positions[i3 + 2] = Math.sin(theta) * extension;
      
      const rayColor = baseColor.clone().multiplyScalar(0.7 + Math.random() * 0.3);
      colors[i3] = rayColor.r;
      colors[i3 + 1] = rayColor.g;
      colors[i3 + 2] = rayColor.b;
    }
    
    return { positions, colors };
  }, [cantidad, longitud, color]);

  useFrame((state) => {
    if (!raysRef.current) return;
    
    const time = state.clock.elapsedTime;
    raysRef.current.rotation.y = time * 0.5;
    
    const geom = raysRef.current.geometry;
    const posAttr = geom.attributes.position;
    const positionsArr = posAttr.array as Float32Array;
    
    for (let i = 0; i < positionsArr.length / 3; i++) {
      const i3 = i * 3;
      const pulse = Math.sin(time * 3 + i) * 0.1 + 1;
      const currentLength = Math.sqrt(positionsArr[i3] ** 2 + positionsArr[i3 + 2] ** 2);
      
      if (currentLength > 0) {
        positionsArr[i3] = (positionsArr[i3] / currentLength) * longitud * pulse;
        positionsArr[i3 + 2] = (positionsArr[i3 + 2] / currentLength) * longitud * pulse;
      }
    }
    
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={raysRef}>
      <bufferGeometry>
        {/* ✅ CORREGIDO: Agregado args */}
        <bufferAttribute
          args={[positions, 3]}
          attach="attributes-position"
        />
        <bufferAttribute
          args={[colors, 3]}
          attach="attributes-color"
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default ElementoSolido;