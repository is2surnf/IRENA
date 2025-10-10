import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cylinder, Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';

interface Balanza3DProps {
  peso?: number;
  position?: [number, number, number];
  scale?: number;
  onPesoChange?: (peso: number) => void;
}

const Balanza3D: React.FC<Balanza3DProps> = ({ 
  peso = 0,
  position = [0, 0, 0],
  scale = 1,
  onPesoChange
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const plataformaRef = useRef<THREE.Group>(null);
  const agujaRef = useRef<THREE.Mesh>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  useFrame((state) => {
    // Animación de balanceo sutil
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.2) * 0.005;
    }

    // Animación de la plataforma con peso
    if (plataformaRef.current && peso > 0) {
      const targetY = -0.1 * (peso / 1000);
      plataformaRef.current.position.y = THREE.MathUtils.lerp(
        plataformaRef.current.position.y,
        targetY,
        0.1
      );
    }

    // Animación de la aguja
    if (agujaRef.current) {
      const targetRotation = (peso / 1000) * Math.PI / 4;
      agujaRef.current.rotation.z = THREE.MathUtils.lerp(
        agujaRef.current.rotation.z,
        -targetRotation,
        0.1
      );
    }

    // Efecto de animación al cambiar peso
    if (isAnimating) {
      if (plataformaRef.current) {
        plataformaRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 10) * 0.05);
      }
    }
  });

  const metalMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#34495e',
      roughness: 0.4,
      metalness: 0.8,
      envMapIntensity: 1.5
    });
  }, []);

  const chromeMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#cccccc',
      roughness: 0.1,
      metalness: 0.95,
      envMapIntensity: 2
    });
  }, []);

  const glassMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 0.3,
      transmission: 0.9,
      roughness: 0.05,
      metalness: 0,
      thickness: 0.5
    });
  }, []);

  const handlePesoChange = (newPeso: number) => {
    setIsAnimating(true);
    onPesoChange?.(newPeso);
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Base de la balanza */}
      <Box 
        args={[1.2 * scale, 0.1 * scale, 0.8 * scale]} 
        position={[0, 0.05 * scale, 0]}
        castShadow
        receiveShadow
      >
        <primitive object={metalMaterial} />
      </Box>

      {/* Columnas de soporte */}
      {[-0.4, 0.4].map((x) => (
        <Cylinder 
          key={x}
          args={[0.05 * scale, 0.05 * scale, 1.2 * scale, 16]} 
          position={[x * scale, 0.7 * scale, 0]}
          castShadow
        >
          <primitive object={chromeMaterial} />
        </Cylinder>
      ))}

      {/* Barra horizontal superior */}
      <Box 
        args={[1.0 * scale, 0.04 * scale, 0.06 * scale]} 
        position={[0, 1.3 * scale, 0]}
        castShadow
      >
        <primitive object={chromeMaterial} />
      </Box>

      {/* Mecanismo de suspensión */}
      <group position={[0, 1.1 * scale, 0]}>
        {/* Soporte central */}
        <Cylinder 
          args={[0.02 * scale, 0.02 * scale, 0.4 * scale, 12]} 
          position={[0, -0.2 * scale, 0]}
          castShadow
        >
          <primitive object={chromeMaterial} />
        </Cylinder>

        {/* Barra de equilibrio */}
        <Box 
          args={[0.6 * scale, 0.02 * scale, 0.02 * scale]} 
          position={[0, -0.4 * scale, 0]}
          castShadow
        >
          <primitive object={chromeMaterial} />
        </Box>

        {/* Brazos de suspensión */}
        {[-0.3, 0.3].map((x) => (
          <Cylinder 
            key={x}
            args={[0.008 * scale, 0.008 * scale, 0.3 * scale, 8]} 
            position={[x * scale, -0.55 * scale, 0]}
            rotation={[0, 0, Math.PI / 4]}
            castShadow
          >
            <primitive object={chromeMaterial} />
          </Cylinder>
        ))}
      </group>

      {/* Plataforma de pesaje */}
      <group ref={plataformaRef} position={[0, 0.3 * scale, 0]}>
        <Box 
          args={[0.5 * scale, 0.02 * scale, 0.5 * scale]} 
          position={[0, 0.01 * scale, 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color="#f8f9fa"
            roughness={0.6}
            metalness={0.2}
          />
        </Box>

        {/* Borde de la plataforma */}
        <Box 
          args={[0.52 * scale, 0.03 * scale, 0.52 * scale]} 
          position={[0, 0 * scale, 0]}
        >
          <meshStandardMaterial
            color="#495057"
            roughness={0.5}
            metalness={0.7}
          />
        </Box>

        {/* Patas de la plataforma */}
        {[
          [-0.2, -0.2], [0.2, -0.2], 
          [-0.2, 0.2], [0.2, 0.2]
        ].map(([x, z], i) => (
          <Cylinder 
            key={i}
            args={[0.015 * scale, 0.015 * scale, 0.15 * scale, 8]} 
            position={[x * scale, -0.075 * scale, z * scale]}
            castShadow
          >
            <primitive object={chromeMaterial} />
          </Cylinder>
        ))}
      </group>

      {/* Display digital */}
      <group position={[0, 1.1 * scale, 0.1 * scale]}>
        {/* Panel del display */}
        <Box 
          args={[0.4 * scale, 0.2 * scale, 0.05 * scale]} 
          position={[0, 0, 0]}
          castShadow
        >
          <meshStandardMaterial
            color="#1a1a1a"
            roughness={0.8}
            metalness={0.1}
          />
        </Box>

        {/* Pantalla LCD */}
        <Box 
          args={[0.35 * scale, 0.15 * scale, 0.02 * scale]} 
          position={[0, 0, 0.025 * scale]}
        >
          <meshPhysicalMaterial
            color={peso > 0 ? "#00ff00" : "#003300"}
            emissive={peso > 0 ? "#00ff00" : "#003300"}
            emissiveIntensity={0.5}
            transparent
            opacity={0.9}
          />
        </Box>

        {/* Texto del display */}
        <Text
          position={[0, 0, 0.03 * scale]}
          fontSize={0.08 * scale}
          color={peso > 0 ? "#00ff00" : "#006600"}
          anchorX="center"
          anchorY="middle"
          font="/fonts/digital-7.mono.woff"
        >
          {peso > 0 ? `${peso.toFixed(1)}g` : "0.0g"}
        </Text>
      </group>

      {/* Aguja analógica */}
      <group position={[0, 1.1 * scale, -0.1 * scale]}>
        {/* Esfera del medidor */}
        <Sphere 
          args={[0.15 * scale, 16, 16]} 
          position={[0, 0, 0]}
        >
          <primitive object={glassMaterial} />
        </Sphere>

        {/* Aguja */}
        <Box 
          ref={agujaRef}
          args={[0.12 * scale, 0.005 * scale, 0.002 * scale]} 
          position={[0.06 * scale, 0, 0]}
        >
          <meshBasicMaterial color="#ff0000" />
        </Box>

        {/* Marcas del medidor */}
        {Array.from({ length: 9 }, (_, i) => {
          const angle = (i / 8) * Math.PI / 2 - Math.PI / 4;
          return (
            <Cylinder
              key={i}
              args={[0.005 * scale, 0.005 * scale, 0.02 * scale, 8]}
              position={[
                Math.cos(angle) * 0.13 * scale,
                Math.sin(angle) * 0.13 * scale,
                0.01 * scale
              ]}
              rotation={[0, 0, angle]}
            >
              <meshBasicMaterial color="#ffffff" />
            </Cylinder>
          );
        })}

        {/* Números del medidor */}
        {[0, 250, 500, 750, 1000].map((value, i) => {
          const angle = (i / 4) * Math.PI / 2 - Math.PI / 4;
          return (
            <Text
              key={value}
              position={[
                Math.cos(angle) * 0.18 * scale,
                Math.sin(angle) * 0.18 * scale,
                0.02 * scale
              ]}
              fontSize={0.04 * scale}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
              font="/fonts/inter-regular.woff"
            >
              {value}
            </Text>
          );
        })}
      </group>

      {/* Botones de control */}
      <group position={[0.3 * scale, 0.8 * scale, 0]}>
        {[
          { label: "+10g", value: 10, color: "#27ae60" },
          { label: "+1g", value: 1, color: "#3498db" },
          { label: "0", value: 0, color: "#e74c3c" }
        ].map((btn, i) => (
          <group key={btn.label} position={[0, -i * 0.15 * scale, 0]}>
            <Sphere 
              args={[0.05 * scale, 16, 16]} 
              position={[0, 0, 0]}
              onClick={() => handlePesoChange(peso + btn.value)}
            >
              <meshStandardMaterial
                color={btn.color}
                roughness={0.3}
                metalness={0.2}
              />
            </Sphere>
            <Text
              position={[0.08 * scale, 0, 0]}
              fontSize={0.04 * scale}
              color="#ffffff"
              anchorX="left"
              anchorY="middle"
              font="/fonts/inter-regular.woff"
            >
              {btn.label}
            </Text>
          </group>
        ))}
      </group>

      {/* Etiqueta de la balanza */}
      <Text
        position={[0, 1.5 * scale, 0]}
        fontSize={0.1 * scale}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
        outlineWidth={0.003}
        outlineColor="#000000"
      >
        Balanza Digital
      </Text>

      {/* Efecto de peso activo */}
      {peso > 0 && (
        <pointLight
          position={[0, 0.5 * scale, 0]}
          color="#00ff00"
          intensity={0.5}
          distance={1 * scale}
        />
      )}
    </group>
  );
};

export default Balanza3D;