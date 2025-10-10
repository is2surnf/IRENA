//src/components/simulador/ElementoGaseoso.tsx - CORREGIDO
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Text, Torus } from '@react-three/drei';
import * as THREE from 'three';

interface ElementoGaseosoProps {
  color: string;
  simbolo?: string;
  position?: [number, number, number];
  scale?: number;
  onClick?: () => void;
}

const ElementoGaseoso: React.FC<ElementoGaseosoProps> = ({ 
  color, 
  simbolo = 'G',
  position = [0, 0, 0],
  scale = 1,
  onClick
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const cloudRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
      groupRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.2) * 0.05;
    }

    if (cloudRef.current) {
      const time = state.clock.elapsedTime;
      const pulse = 1 + Math.sin(time * 1.5) * 0.1;
      cloudRef.current.scale.setScalar(pulse);
    }
  });

  const gasMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: color,
      transparent: true,
      opacity: 0.6,
      roughness: 0.9,
      metalness: 0,
      transmission: 0.8,
      thickness: 2,
      ior: 1.1,
      envMapIntensity: 0.5
    });
  }, [color]);

  return (
    <group 
      ref={groupRef} 
      position={position} 
      scale={scale}
      onClick={onClick}
    >
      <group ref={cloudRef}>
        <Sphere args={[0.3, 16, 16]} castShadow>
          <primitive object={gasMaterial} />
        </Sphere>

        {[
          [0.2, 0.1, 0.15, 0.25],
          [-0.15, 0.2, 0.1, 0.2],
          [0.1, -0.1, 0.25, 0.18],
          [-0.2, -0.15, -0.1, 0.22],
          [0.25, 0.25, -0.1, 0.16]
        ].map(([x, y, z, size], i) => (
          <Sphere 
            key={i}
            args={[size, 12, 12]} 
            position={[x, y, z]}
          >
            <primitive object={gasMaterial} />
          </Sphere>
        ))}
      </group>

      <ParticulasGas 
        color={color}
        cantidad={30}
        radio={0.8}
      />

      <VorticesGas 
        color={color}
        cantidad={4}
        radio={0.5}
      />

      <AnillosExpansion 
        color={color}
        cantidad={3}
      />

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

      <Sphere args={[0.6, 16, 16]}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.1}
          wireframe
          side={THREE.BackSide}
        />
      </Sphere>

      <EmanacionesEnergia 
        color={color}
        cantidad={8}
        longitud={1.2}
      />

      <Sphere args={[0.5, 16, 16]}>
        <meshBasicMaterial transparent opacity={0} />
      </Sphere>
    </group>
  );
};

const ParticulasGas: React.FC<{ color: string; cantidad: number; radio: number }> = ({ 
  color, 
  cantidad,
  radio 
}) => {
  const particlesRef = useRef<THREE.Points>(null);
  
  const { positions, sizes, velocities } = useMemo(() => {
    const positions = new Float32Array(cantidad * 3);
    const sizes = new Float32Array(cantidad);
    const velocities = new Float32Array(cantidad * 3);
    
    for (let i = 0; i < cantidad; i++) {
      const i3 = i * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.cbrt(Math.random()) * radio;
      
      positions[i3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = r * Math.cos(phi);
      
      sizes[i] = 0.02 + Math.random() * 0.04;
      
      velocities[i3] = (Math.random() - 0.5) * 0.01;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.01;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.01;
    }
    
    return { positions, sizes, velocities };
  }, [cantidad, radio]);

  useFrame(() => {
    if (!particlesRef.current) return;
    
    const geom = particlesRef.current.geometry;
    const posAttr = geom.attributes.position;
    const positionsArr = posAttr.array as Float32Array;
    // @ts-ignore
    const vels = particlesRef.current.userData.velocities as Float32Array;
    
    if (!vels) return;
    
    for (let i = 0; i < positionsArr.length / 3; i++) {
      const i3 = i * 3;
      
      positionsArr[i3] += vels[i3];
      positionsArr[i3 + 1] += vels[i3 + 1];
      positionsArr[i3 + 2] += vels[i3 + 2];
      
      vels[i3] += (Math.random() - 0.5) * 0.002;
      vels[i3 + 1] += (Math.random() - 0.5) * 0.002;
      vels[i3 + 2] += (Math.random() - 0.5) * 0.002;
      
      const speed = Math.sqrt(vels[i3] ** 2 + vels[i3 + 1] ** 2 + vels[i3 + 2] ** 2);
      if (speed > 0.02) {
        vels[i3] *= 0.95;
        vels[i3 + 1] *= 0.95;
        vels[i3 + 2] *= 0.95;
      }
      
      const distance = Math.sqrt(positionsArr[i3] ** 2 + positionsArr[i3 + 1] ** 2 + positionsArr[i3 + 2] ** 2);
      if (distance > radio) {
        const factor = radio / distance;
        positionsArr[i3] *= factor;
        positionsArr[i3 + 1] *= factor;
        positionsArr[i3 + 2] *= factor;
        
        const dot = (positionsArr[i3] * vels[i3] + positionsArr[i3 + 1] * vels[i3 + 1] + positionsArr[i3 + 2] * vels[i3 + 2]) / (distance * distance);
        
        vels[i3] -= 2 * dot * positionsArr[i3];
        vels[i3 + 1] -= 2 * dot * positionsArr[i3 + 1];
        vels[i3 + 2] -= 2 * dot * positionsArr[i3 + 2];
      }
    }
    
    posAttr.needsUpdate = true;
  });

  return (
    <points 
      ref={particlesRef} 
      // @ts-ignore
      userData={{ velocities }}
    >
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
        size={0.04}
        color={color}
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const VorticesGas: React.FC<{ color: string; cantidad: number; radio: number }> = ({ 
  color, 
  cantidad,
  radio 
}) => {
  const vorticesRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!vorticesRef.current) return;
    const time = state.clock.elapsedTime;
    vorticesRef.current.children.forEach((vortex, i) => {
      const speed = 0.5 + i * 0.2;
      vortex.rotation.y = time * speed;
      vortex.rotation.x = Math.sin(time * 0.3 + i) * 0.2;
    });
  });

  return (
    <group ref={vorticesRef}>
      {Array.from({ length: cantidad }, (_, i) => {
        const angle = (i / cantidad) * Math.PI * 2;
        const vortexRadius = radio * (0.3 + (i / cantidad) * 0.7);
        
        return (
          <Torus
            key={i}
            args={[vortexRadius, 0.02, 8, 16]}
            position={[
              Math.cos(angle) * vortexRadius * 0.5,
              Math.sin(angle) * vortexRadius * 0.3,
              Math.sin(angle) * vortexRadius * 0.5
            ]}
            rotation={[Math.PI / 2, 0, angle]}
          >
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.4}
              blending={THREE.AdditiveBlending}
            />
          </Torus>
        );
      })}
    </group>
  );
};

const AnillosExpansion: React.FC<{ color: string; cantidad: number }> = ({ 
  color, 
  cantidad 
}) => {
  const ringsRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!ringsRef.current) return;
    const time = state.clock.elapsedTime;
    ringsRef.current.children.forEach((ring, i) => {
      const ringMesh = ring as THREE.Mesh;
      const delay = i * 0.5;
      const scale = 1 + (Math.sin(time * 2 + delay) + 1) * 0.5;
      ringMesh.scale.setScalar(scale);
      
      const mat = ringMesh.material as THREE.MeshBasicMaterial;
      if (mat.opacity !== undefined) {
        mat.opacity = 0.3 * (1 - (scale - 1) / 2);
      }
    });
  });

  return (
    <group ref={ringsRef}>
      {Array.from({ length: cantidad }, (_, i) => (
        <Torus
          key={i}
          args={[0.4 + i * 0.2, 0.01, 8, 32]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.3}
            blending={THREE.AdditiveBlending}
          />
        </Torus>
      ))}
    </group>
  );
};

const EmanacionesEnergia: React.FC<{ color: string; cantidad: number; longitud: number }> = ({ 
  color, 
  cantidad,
  longitud 
}) => {
  const emanationsRef = useRef<THREE.Points>(null);
  
  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(cantidad * 3);
    const colors = new Float32Array(cantidad * 3);
    const baseColor = new THREE.Color(color);
    
    for (let i = 0; i < cantidad; i++) {
      const i3 = i * 3;
      const theta = (i / cantidad) * Math.PI * 2;
      const extension = longitud * (0.5 + Math.random() * 0.5);
      
      positions[i3] = Math.cos(theta) * extension;
      positions[i3 + 1] = (Math.random() - 0.5) * 0.3;
      positions[i3 + 2] = Math.sin(theta) * extension;
      
      const energyColor = baseColor.clone().offsetHSL(0, Math.random() * 0.2 - 0.1, Math.random() * 0.3 - 0.15);
      colors[i3] = energyColor.r;
      colors[i3 + 1] = energyColor.g;
      colors[i3 + 2] = energyColor.b;
    }
    
    return { positions, colors };
  }, [cantidad, longitud, color]);

  useFrame((state) => {
    if (!emanationsRef.current) return;
    const time = state.clock.elapsedTime;
    const geom = emanationsRef.current.geometry;
    const posAttr = geom.attributes.position;
    const positionsArr = posAttr.array as Float32Array;
    
    for (let i = 0; i < positionsArr.length / 3; i++) {
      const i3 = i * 3;
      const pulse = Math.sin(time * 3 + i) * 0.2 + 0.8;
      const currentLength = Math.sqrt(positionsArr[i3] ** 2 + positionsArr[i3 + 2] ** 2);
      
      if (currentLength > 0) {
        positionsArr[i3] = (positionsArr[i3] / currentLength) * longitud * pulse;
        positionsArr[i3 + 2] = (positionsArr[i3 + 2] / currentLength) * longitud * pulse;
      }
      positionsArr[i3 + 1] = Math.sin(time * 2 + i) * 0.2;
    }
    
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={emanationsRef}>
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
        size={0.03}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default ElementoGaseoso;