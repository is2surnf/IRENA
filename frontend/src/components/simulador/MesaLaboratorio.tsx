// frontend/src/components/simulador/MesaLaboratorio.tsx
import React, { useRef, useMemo } from 'react';
import { Box, Cylinder, Sphere, RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const MesaLaboratorio: React.FC = () => {
  const tableRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  
  // Animación sutil de respiración
  useFrame((state) => {
    if (tableRef.current) {
      tableRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.005;
    }
    
    // Luz pulsante sutil
    if (lightRef.current) {
      lightRef.current.intensity = 0.3 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  // Generar textura procedural para superficie de laboratorio
  const surfaceTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Base gris oscuro
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, 512, 512);
    
    // Añadir ruido para textura realista
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const size = Math.random() * 2;
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.05})`;
      ctx.fillRect(x, y, size, size);
    }
    
    // Líneas de desgaste
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * 512, Math.random() * 512);
      ctx.lineTo(Math.random() * 512, Math.random() * 512);
      ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  }, []);

  return (
    <group ref={tableRef} position={[0, -1.8, 0]}>
      {/* ======================================
          SUPERFICIE PRINCIPAL DE LA MESA
      ====================================== */}
      <RoundedBox 
        args={[8, 0.2, 4]} 
        position={[0, 0.1, 0]} 
        radius={0.02}
        smoothness={4}
        castShadow 
        receiveShadow
      >
        <meshPhysicalMaterial 
          map={surfaceTexture}
          roughness={0.4}
          metalness={0.3}
          clearcoat={0.6}
          clearcoatRoughness={0.3}
          reflectivity={0.5}
          envMapIntensity={1.2}
        />
      </RoundedBox>

      {/* Borde decorativo superior */}
      <RoundedBox 
        args={[8.3, 0.08, 4.3]} 
        position={[0, 0.02, 0]} 
        radius={0.02}
        receiveShadow
      >
        <meshStandardMaterial 
          color="#1a252f" 
          roughness={0.5}
          metalness={0.4}
        />
      </RoundedBox>

      {/* Borde inferior con detalle */}
      <RoundedBox 
        args={[8.4, 0.12, 4.4]} 
        position={[0, -0.08, 0]}
        radius={0.03}
      >
        <meshStandardMaterial 
          color="#0f1419" 
          roughness={0.6}
          metalness={0.5}
        />
      </RoundedBox>

      {/* ======================================
          MARCADORES DE MEDICIÓN
      ====================================== */}
      {/* Marcas horizontales */}
      {[-3.5, -2.5, -1.5, -0.5, 0.5, 1.5, 2.5, 3.5].map((x, i) => (
        <group key={`mark-h-${i}`}>
          <Box args={[0.03, 0.01, 0.25]} position={[x, 0.21, 1.8]}>
            <meshBasicMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.5} />
          </Box>
          <Box args={[0.03, 0.01, 0.25]} position={[x, 0.21, -1.8]}>
            <meshBasicMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.5} />
          </Box>
        </group>
      ))}

      {/* Marcas verticales */}
      {[-1.5, -0.5, 0.5, 1.5].map((z, i) => (
        <group key={`mark-v-${i}`}>
          <Box args={[0.25, 0.01, 0.03]} position={[3.8, 0.21, z]}>
            <meshBasicMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.5} />
          </Box>
          <Box args={[0.25, 0.01, 0.03]} position={[-3.8, 0.21, z]}>
            <meshBasicMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.5} />
          </Box>
        </group>
      ))}

      {/* ======================================
          PATAS METÁLICAS DE LA MESA
      ====================================== */}
      {[
        [-3.8, -1, 1.8],
        [3.8, -1, 1.8],
        [-3.8, -1, -1.8],
        [3.8, -1, -1.8]
      ].map((pos, i) => (
        <group key={`leg-${i}`}>
          {/* Pata principal */}
          <Cylinder 
            args={[0.12, 0.15, 2, 16]} 
            position={pos as [number, number, number]}
            castShadow
          >
            <meshPhysicalMaterial 
              color="#4a5a6f"
              roughness={0.2}
              metalness={0.9}
              clearcoat={1}
              clearcoatRoughness={0.1}
              envMapIntensity={1.5}
            />
          </Cylinder>

          {/* Base de la pata */}
          <Cylinder 
            args={[0.2, 0.18, 0.1, 16]} 
            position={[pos[0], -2, pos[2]]}
            castShadow
          >
            <meshStandardMaterial 
              color="#2c3e50"
              roughness={0.3}
              metalness={0.8}
            />
          </Cylinder>

          {/* Detalle superior de conexión */}
          <Cylinder 
            args={[0.15, 0.12, 0.15, 16]} 
            position={[pos[0], 0.15, pos[2]]}
          >
            <meshStandardMaterial 
              color="#3a4a5f"
              roughness={0.3}
              metalness={0.85}
            />
          </Cylinder>

          {/* Tornillos decorativos */}
          {[0, 90, 180, 270].map((angle, j) => {
            const rad = (angle * Math.PI) / 180;
            const offset = 0.18;
            return (
              <Cylinder
                key={`bolt-${i}-${j}`}
                args={[0.02, 0.02, 0.05, 8]}
                position={[
                  pos[0] + Math.cos(rad) * offset,
                  0.15,
                  pos[2] + Math.sin(rad) * offset
                ]}
                rotation={[Math.PI / 2, 0, 0]}
              >
                <meshStandardMaterial 
                  color="#1a1a1a"
                  roughness={0.1}
                  metalness={0.95}
                />
              </Cylinder>
            );
          })}
        </group>
      ))}

      {/* ======================================
          REFUERZOS ESTRUCTURALES
      ====================================== */}
      {[
        { start: [-3.8, -0.5, 1.8], end: [3.8, -0.5, 1.8], rotation: [0, 0, 0] },
        { start: [-3.8, -0.5, -1.8], end: [3.8, -0.5, -1.8], rotation: [0, 0, 0] },
        { start: [-3.8, -0.5, 1.8], end: [-3.8, -0.5, -1.8], rotation: [0, Math.PI / 2, 0] },
        { start: [3.8, -0.5, 1.8], end: [3.8, -0.5, -1.8], rotation: [0, Math.PI / 2, 0] }
      ].map((bar, i) => {
        const length = i < 2 ? 7.6 : 3.6;
        const midX = (bar.start[0] + bar.end[0]) / 2;
        const midZ = (bar.start[2] + bar.end[2]) / 2;

        return (
          <Cylinder
            key={`support-${i}`}
            args={[0.05, 0.05, length, 12]}
            position={[midX, bar.start[1], midZ]}
            rotation={bar.rotation as [number, number, number]}
            castShadow
          >
            <meshPhysicalMaterial 
              color="#3a4a5f" 
              roughness={0.25}
              metalness={0.85}
              clearcoat={0.5}
            />
          </Cylinder>
        );
      })}

      {/* ======================================
          SISTEMA DE DRENAJE (Detalle realista)
      ====================================== */}
      <group position={[3.5, 0.05, -1.5]}>
        {/* Sumidero */}
        <Cylinder args={[0.15, 0.12, 0.08, 16]} rotation={[Math.PI, 0, 0]}>
          <meshStandardMaterial 
            color="#1a1a1a"
            roughness={0.2}
            metalness={0.9}
          />
        </Cylinder>
        
        {/* Rejilla del sumidero */}
        {[-0.08, -0.04, 0, 0.04, 0.08].map((offset, i) => (
          <Box 
            key={`drain-${i}`}
            args={[0.25, 0.01, 0.02]} 
            position={[0, 0.01, offset]}
          >
            <meshBasicMaterial color="#333333" />
          </Box>
        ))}
      </group>

      {/* ======================================
          ILUMINACIÓN INCORPORADA EN LA MESA
      ====================================== */}
      <pointLight
        ref={lightRef}
        position={[0, 0.5, 0]}
        intensity={0.3}
        color="#aaccff"
        distance={8}
        decay={2}
      />

      {/* Luces LED bajo la mesa (ambiente) */}
      {[
        [-3, -0.1, 0],
        [0, -0.1, 0],
        [3, -0.1, 0]
      ].map((pos, i) => (
        <group key={`led-${i}`}>
          <pointLight
            position={pos as [number, number, number]}
            intensity={0.15}
            color="#00d4ff"
            distance={3}
          />
          <Sphere args={[0.05, 8, 8]} position={pos as [number, number, number]}>
            <meshBasicMaterial 
              color="#00d4ff" 
              emissive="#00d4ff" 
              emissiveIntensity={2}
            />
          </Sphere>
        </group>
      ))}

      {/* ======================================
          PLACAS DE IDENTIFICACIÓN
      ====================================== */}
      <Box args={[1, 0.01, 0.3]} position={[0, 0.21, -1.7]}>
        <meshStandardMaterial 
          color="#1a252f"
          roughness={0.3}
          metalness={0.7}
        />
      </Box>
      
      {/* Texto de la placa (simulado con geometría) */}
      <Box args={[0.8, 0.005, 0.05]} position={[0, 0.215, -1.7]}>
        <meshBasicMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.8} />
      </Box>

      {/* ======================================
          EFECTOS DE REFLEXIÓN EN SUPERFICIE
      ====================================== */}
      <Box args={[7.8, 0.005, 3.8]} position={[0, 0.21, 0]} receiveShadow>
        <meshPhysicalMaterial 
          color="#4a6178"
          roughness={0.15}
          metalness={0.1}
          transparent
          opacity={0.3}
          transmission={0.1}
          thickness={0.5}
          envMapIntensity={2}
        />
      </Box>
    </group>
  );
};

export default MesaLaboratorio;