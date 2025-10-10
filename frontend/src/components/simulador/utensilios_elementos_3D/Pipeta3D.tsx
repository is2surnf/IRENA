import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cylinder, Cone, Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';
import type { ContenidoUtensilio } from '../../../types/simulacion.types';

interface Pipeta3DProps {
  contenido?: ContenidoUtensilio;
  position?: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
}

const Pipeta3D: React.FC<Pipeta3DProps> = ({ 
  contenido, 
  position = [0, 0, 0],
  scale = 1,
  rotation = [0, 0, Math.PI / 6]
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const liquidRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    // Animación de balanceo sutil
    if (groupRef.current) {
      groupRef.current.rotation.z = rotation[2] + Math.sin(state.clock.elapsedTime * 0.3) * 0.02;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.01;
    }

    // Animación del líquido
    if (liquidRef.current && contenido?.estado === 'mezclando') {
      liquidRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.1;
    }
  });

  const glassMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      transparent: true,
      opacity: 0.1,
      color: '#aaccff',
      transmission: 0.98,
      roughness: 0.02,
      metalness: 0,
      thickness: 0.2,
      ior: 1.45,
      envMapIntensity: 1.8
    });
  }, []);

  const rubberMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#ff6b6b',
      roughness: 0.8,
      metalness: 0.1,
      envMapIntensity: 0.5
    });
  }, []);

  return (
    <group ref={groupRef} position={position} scale={scale} rotation={rotation}>
      {/* Bulbo de succión (goma) */}
      <Sphere 
        args={[0.25 * scale, 32, 32]} 
        position={[0, 1.5 * scale, 0]}
        castShadow
      >
        <primitive object={rubberMaterial} />
      </Sphere>

      {/* Detalle del bulbo */}
      <Cylinder 
        args={[0.15 * scale, 0.15 * scale, 0.1 * scale, 16]} 
        position={[0, 1.65 * scale, 0]}
        castShadow
      >
        <meshStandardMaterial
          color="#e74c3c"
          roughness={0.7}
          metalness={0.2}
        />
      </Cylinder>

      {/* Tubo principal de la pipeta */}
      <Cylinder 
        args={[0.05 * scale, 0.05 * scale, 1.8 * scale, 16]} 
        position={[0, 0.5 * scale, 0]}
        castShadow
      >
        <primitive object={glassMaterial} />
      </Cylinder>

      {/* Punta de la pipeta */}
      <Cone 
        args={[0.05 * scale, 0.15 * scale, 16]} 
        position={[0, -0.45 * scale, 0]}
        castShadow
      >
        <primitive object={glassMaterial} />
      </Cone>

      {/* Líquido contenido */}
      {contenido && contenido.nivel > 0 && (
        <group>
          <Cylinder 
            ref={liquidRef}
            args={[0.045 * scale, 0.045 * scale, contenido.nivel * 0.8 * scale, 16]} 
            position={[0, (contenido.nivel * 0.8 * scale) / 2 - 0.2 * scale, 0]}
          >
            <meshPhysicalMaterial
              color={contenido.color}
              transparent
              opacity={0.9}
              roughness={0.05}
              transmission={0.1}
              thickness={0.5}
            />
          </Cylinder>

          {/* Menisco en la punta */}
          <Sphere 
            args={[0.045 * scale, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} 
            position={[0, contenido.nivel * 0.8 * scale - 0.2 * scale, 0]}
            rotation={[Math.PI, 0, 0]}
          >
            <meshPhysicalMaterial
              color={contenido.color}
              transparent
              opacity={0.8}
              roughness={0.03}
            />
          </Sphere>

          {/* Burbujas de aire cuando hay poco líquido */}
          {contenido.nivel < 0.3 && (
            <BurbujasAireEfecto 
              position={[0, (contenido.nivel * 0.8 * scale) / 2 - 0.2 * scale, 0]}
              cantidad={Math.floor((1 - contenido.nivel) * 10)}
            />
          )}
        </group>
      )}

      {/* Marcas de graduación detalladas */}
      {[0.2, 0.5, 0.8, 1.1, 1.4].map((y, i) => (
        <group key={i} position={[0, y * scale, 0]}>
          {/* Marca principal */}
          <Cylinder
            args={[0.06 * scale, 0.06 * scale, 0.008 * scale, 8]}
            position={[0.03 * scale, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <meshBasicMaterial color="#333333" />
          </Cylinder>
          
          {/* Marcas secundarias más pequeñas */}
          {[0.1, 0.2, 0.3, 0.4, 0.6, 0.7, 0.8, 0.9].map((subY, j) => (
            <Cylinder
              key={j}
              args={[0.055 * scale, 0.055 * scale, 0.004 * scale, 8]}
              position={[0.02 * scale, (subY - 0.5) * 0.1 * scale, 0]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <meshBasicMaterial color="#666666" />
            </Cylinder>
          ))}

          {/* Números de graduación */}
          {(i === 0 || i === 2 || i === 4) && (
            <Text
              position={[0.08 * scale, 0, 0]}
              fontSize={0.05 * scale}
              color="#444444"
              anchorX="left"
              anchorY="middle"
              font="/fonts/inter-regular.woff"
            >
              {i * 5 + 5}
            </Text>
          )}
        </group>
      ))}

      {/* Anillo decorativo superior */}
      <Cylinder 
        args={[0.07 * scale, 0.07 * scale, 0.02 * scale, 16]} 
        position={[0, 1.7 * scale, 0]}
        castShadow
      >
        <meshStandardMaterial
          color="#cccccc"
          roughness={0.3}
          metalness={0.8}
        />
      </Cylinder>

      {/* Etiqueta elegante */}
      <Text
        position={[0.15 * scale, 0.8 * scale, 0]}
        fontSize={0.06 * scale}
        color="#333333"
        anchorX="left"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
        rotation={[0, 0, -Math.PI / 2]}
      >
        Pipeta
      </Text>

      {/* Reflejo especular en el vidrio */}
      <Cylinder 
        args={[0.049 * scale, 0.049 * scale, 1.78 * scale, 16]} 
        position={[0.005 * scale, 0.5 * scale, 0.005 * scale]}
      >
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.2}
          side={THREE.BackSide}
        />
      </Cylinder>
    </group>
  );
};

// Efecto de burbujas de aire
const BurbujasAireEfecto: React.FC<{ position: [number, number, number]; cantidad: number }> = ({ 
  position, 
  cantidad 
}) => {
  const bubblesRef = useRef<THREE.Points>(null);
  
  const { positions, sizes } = useMemo(() => {
    const positions = new Float32Array(cantidad * 3);
    const sizes = new Float32Array(cantidad);
    
    for (let i = 0; i < cantidad; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 0.03;
      positions[i3 + 1] = Math.random() * 0.3 - 0.15;
      positions[i3 + 2] = (Math.random() - 0.5) * 0.03;
      
      sizes[i] = 0.008 + Math.random() * 0.012;
    }
    
    return { positions, sizes };
  }, [cantidad]);

  useFrame((state) => {
    if (!bubblesRef.current) return;
    
    const positions = bubblesRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < positions.length / 3; i++) {
      const i3 = i * 3;
      
      // Flotación hacia arriba
      positions[i3 + 1] += 0.002;
      
      // Movimiento lateral aleatorio
      positions[i3] += (Math.random() - 0.5) * 0.001;
      positions[i3 + 2] += (Math.random() - 0.5) * 0.001;
      
      // Reset cuando llega arriba
      if (positions[i3 + 1] > 0.15) {
        positions[i3 + 1] = -0.15;
        positions[i3] = (Math.random() - 0.5) * 0.03;
        positions[i3 + 2] = (Math.random() - 0.5) * 0.03;
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

export default Pipeta3D;