// frontend/src/components/simulador/MesaLaboratorio.tsx - NUEVA MESA CORREGIDA
import React, { useRef, useMemo } from 'react';
import { Box, Cylinder, Sphere } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const MesaLaboratorio: React.FC = () => {
  const tableRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  
  useFrame((state) => {
    if (tableRef.current) {
      tableRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.002;
    }
    
    if (lightRef.current) {
      lightRef.current.intensity = 0.4 + Math.sin(state.clock.elapsedTime * 0.5) * 0.08;
    }
  });

  const surfaceTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;
    
    // Base oscura profesional
    const gradient = ctx.createLinearGradient(0, 0, 1024, 1024);
    gradient.addColorStop(0, '#1a1f2e');
    gradient.addColorStop(0.5, '#2d3748');
    gradient.addColorStop(1, '#1a1f2e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 1024);
    
    // Textura de carbono/metal
    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const size = Math.random() * 1.5;
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.03})`;
      ctx.fillRect(x, y, size, size);
    }
    
    // Líneas de fibra de carbono
    ctx.strokeStyle = 'rgba(100, 150, 200, 0.05)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 40; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * 1024, 0);
      ctx.lineTo(Math.random() * 1024, 1024);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, Math.random() * 1024);
      ctx.lineTo(1024, Math.random() * 1024);
      ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  }, []);

  return (
    <group ref={tableRef} position={[0, -2, 0]}>
      {/* ======================================
          ✅ SUPERFICIE PRINCIPAL (HORIZONTAL - HACIA ARRIBA)
      ====================================== */}
      <Box 
        args={[8, 0.25, 4.5]} 
        position={[0, 1, 0]} 
        castShadow 
        receiveShadow
      >
        <meshPhysicalMaterial 
          map={surfaceTexture}
          roughness={0.35}
          metalness={0.6}
          clearcoat={0.8}
          clearcoatRoughness={0.2}
          reflectivity={0.7}
          envMapIntensity={1.5}
          color="#2a3f5f"
        />
      </Box>

      {/* Marco exterior con relieve */}
      <Box 
        args={[8.4, 0.12, 4.9]} 
        position={[0, 0.94, 0]} 
        receiveShadow
      >
        <meshStandardMaterial 
          color="#1a2332" 
          roughness={0.4}
          metalness={0.7}
          emissive="#0a1520"
          emissiveIntensity={0.1}
        />
      </Box>

      {/* Base inferior robusta */}
      <Box 
        args={[8.5, 0.18, 5]} 
        position={[0, 0.82, 0]}
      >
        <meshStandardMaterial 
          color="#0f1419" 
          roughness={0.5}
          metalness={0.8}
        />
      </Box>

      {/* ======================================
          SISTEMA DE MARCADORES HOLOGRÁFICOS
      ====================================== */}
      {/* Grid holográfico de la superficie */}
      {[-3, -1.5, 0, 1.5, 3].map((x, i) => (
        <group key={`grid-x-${i}`}>
          {[-1.8, -0.9, 0, 0.9, 1.8].map((z, j) => (
            <Sphere key={`node-${i}-${j}`} args={[0.02, 8, 8]} position={[x, 1.14, z]}>
              <meshStandardMaterial 
                color="#00d4ff" 
                emissive="#00d4ff" 
                emissiveIntensity={1.5}
                toneMapped={false}
              />
            </Sphere>
          ))}
        </group>
      ))}

      {/* Líneas de guía laterales */}
      {[
        { start: [-3.8, 1.14, -2], end: [3.8, 1.14, -2], axis: 'x' },
        { start: [-3.8, 1.14, 2], end: [3.8, 1.14, 2], axis: 'x' },
        { start: [-3.8, 1.14, -2], end: [-3.8, 1.14, 2], axis: 'z' },
        { start: [3.8, 1.14, -2], end: [3.8, 1.14, 2], axis: 'z' }
      ].map((line, i) => (
        <Box 
          key={`guide-${i}`}
          args={line.axis === 'x' ? [7.6, 0.008, 0.015] : [0.015, 0.008, 4]}
          position={[
            (line.start[0] + line.end[0]) / 2,
            line.start[1],
            (line.start[2] + line.end[2]) / 2
          ]}
        >
          <meshStandardMaterial 
            color="#00d4ff" 
            emissive="#00d4ff" 
            emissiveIntensity={2}
            transparent
            opacity={0.6}
          />
        </Box>
      ))}

      {/* ======================================
          PATAS METÁLICAS VERTICALES (CORREGIDAS)
      ====================================== */}
      {[
        [-3.7, 0, 2],
        [3.7, 0, 2],
        [-3.7, 0, -2],
        [3.7, 0, -2]
      ].map((pos, i) => (
        <group key={`leg-${i}`}>
          {/* Pata principal hexagonal VERTICAL */}
          <Cylinder 
            args={[0.15, 0.18, 2.1, 6]} 
            position={[pos[0], pos[1], pos[2]]}
            rotation={[0, 0, 0]}
            castShadow
          >
            <meshPhysicalMaterial 
              color="#3a4a6f"
              roughness={0.15}
              metalness={0.95}
              clearcoat={1}
              clearcoatRoughness={0.05}
              envMapIntensity={2}
            />
          </Cylinder>

          {/* Anillos decorativos */}
          {[0, 0.5, 1, 1.5].map((offset, j) => (
            <Cylinder 
              key={`ring-${j}`}
              args={[0.17, 0.17, 0.04, 6]} 
              position={[pos[0], pos[1] + offset, pos[2]]}
            >
              <meshStandardMaterial 
                color="#1a2a3f"
                roughness={0.2}
                metalness={0.9}
                emissive="#00d4ff"
                emissiveIntensity={0.1}
              />
            </Cylinder>
          ))}

          {/* Base antideslizante en el suelo */}
          <Cylinder 
            args={[0.22, 0.2, 0.12, 6]} 
            position={[pos[0], -1.06, pos[2]]}
            castShadow
          >
            <meshStandardMaterial 
              color="#0a0f1a"
              roughness={0.8}
              metalness={0.3}
            />
          </Cylinder>

          {/* Conexión superior reforzada con la mesa */}
          <Cylinder 
            args={[0.18, 0.15, 0.2, 6]} 
            position={[pos[0], 1.1, pos[2]]}
          >
            <meshStandardMaterial 
              color="#2a3a4f"
              roughness={0.25}
              metalness={0.9}
            />
          </Cylinder>

          {/* Luces LED en las patas */}
          <Sphere args={[0.04, 12, 12]} position={[pos[0], pos[1] + 0.5, pos[2] + 0.2]}>
            <meshStandardMaterial 
              color="#00d4ff"
              emissive="#00d4ff"
              emissiveIntensity={3}
              toneMapped={false}
            />
          </Sphere>

          <pointLight
            position={[pos[0], pos[1] + 0.5, pos[2] + 0.2]}
            intensity={0.3}
            color="#00d4ff"
            distance={2}
          />
        </group>
      ))}

      {/* ======================================
          REFUERZOS ESTRUCTURALES HORIZONTALES
      ====================================== */}
      {[
        { start: [-3.7, 0.5, 2], end: [3.7, 0.5, 2], rotation: [0, 0, Math.PI / 2], length: 7.4 },
        { start: [-3.7, 0.5, -2], end: [3.7, 0.5, -2], rotation: [0, 0, Math.PI / 2], length: 7.4 },
        { start: [-3.7, 0.5, 2], end: [-3.7, 0.5, -2], rotation: [Math.PI / 2, 0, 0], length: 4 },
        { start: [3.7, 0.5, 2], end: [3.7, 0.5, -2], rotation: [Math.PI / 2, 0, 0], length: 4 }
      ].map((bar, i) => {
        const midX = (bar.start[0] + bar.end[0]) / 2;
        const midZ = (bar.start[2] + bar.end[2]) / 2;

        return (
          <Cylinder
            key={`support-${i}`}
            args={[0.06, 0.06, bar.length, 6]}
            position={[midX, bar.start[1], midZ]}
            rotation={bar.rotation as [number, number, number]}
            castShadow
          >
            <meshPhysicalMaterial 
              color="#2a3a5f" 
              roughness={0.2}
              metalness={0.9}
              clearcoat={0.7}
            />
          </Cylinder>
        );
      })}

      {/* Refuerzos diagonales (X) */}
      {[
        { from: [-3.7, 0.5, 2], to: [3.7, 0.5, -2] },
        { from: [3.7, 0.5, 2], to: [-3.7, 0.5, -2] }
      ].map((diag, i) => {
        const midX = (diag.from[0] + diag.to[0]) / 2;
        const midZ = (diag.from[2] + diag.to[2]) / 2;
        const length = Math.sqrt(
          Math.pow(diag.to[0] - diag.from[0], 2) + 
          Math.pow(diag.to[2] - diag.from[2], 2)
        );
        const angle = Math.atan2(diag.to[2] - diag.from[2], diag.to[0] - diag.from[0]);

        return (
          <Cylinder
            key={`diag-${i}`}
            args={[0.04, 0.04, length, 6]}
            position={[midX, 0.5, midZ]}
            rotation={[0, angle, Math.PI / 2]}
          >
            <meshStandardMaterial 
              color="#1a2a3f"
              roughness={0.3}
              metalness={0.85}
              emissive="#00d4ff"
              emissiveIntensity={0.05}
            />
          </Cylinder>
        );
      })}

      {/* ======================================
          ILUMINACIÓN INTEGRADA PREMIUM
      ====================================== */}
      <pointLight
        ref={lightRef}
        position={[0, 1.7, 0]}
        intensity={0.4}
        color="#aaccff"
        distance={10}
        decay={2}
      />

      {/* Tira LED bajo la mesa */}
      {[-3, -1, 1, 3].map((x, i) => (
        <group key={`led-strip-${i}`}>
          <Box args={[0.4, 0.02, 0.08]} position={[x, 0.85, 0]}>
            <meshStandardMaterial 
              color="#00d4ff" 
              emissive="#00d4ff" 
              emissiveIntensity={2}
              transparent
              opacity={0.8}
            />
          </Box>
          <pointLight
            position={[x, 0.85, 0]}
            intensity={0.2}
            color="#00d4ff"
            distance={3}
          />
        </group>
      ))}

      {/* ======================================
          PLACA DE IDENTIFICACIÓN HOLOGRÁFICA
      ====================================== */}
      <group position={[0, 1.15, -2.1]}>
        <Box args={[1.5, 0.01, 0.4]}>
          <meshStandardMaterial 
            color="#0a1520"
            roughness={0.2}
            metalness={0.9}
            emissive="#00d4ff"
            emissiveIntensity={0.15}
          />
        </Box>
        
        <Box args={[1.3, 0.015, 0.1]} position={[0, 0.01, -0.05]}>
          <meshStandardMaterial 
            color="#00d4ff" 
            emissive="#00d4ff" 
            emissiveIntensity={1.5}
            transparent
            opacity={0.9}
          />
        </Box>

        <Box args={[1.3, 0.015, 0.06]} position={[0, 0.01, 0.08]}>
          <meshStandardMaterial 
            color="#00d4ff" 
            emissive="#00d4ff" 
            emissiveIntensity={1}
            transparent
            opacity={0.7}
          />
        </Box>
      </group>

      {/* ======================================
          CAPA DE REFLEXIÓN REALISTA
      ====================================== */}
      <Box args={[7.8, 0.01, 4.3]} position={[0, 1.14, 0]} receiveShadow>
        <meshPhysicalMaterial 
          color="#3a5a7f"
          roughness={0.08}
          metalness={0.15}
          transparent
          opacity={0.25}
          transmission={0.15}
          thickness={0.5}
          envMapIntensity={3}
        />
      </Box>

      {/* Partículas ambientales flotantes */}
      {Array.from({ length: 8 }).map((_, i) => {
        const x = (Math.random() - 0.5) * 6;
        const z = (Math.random() - 0.5) * 3;
        const y = 1.2 + Math.random() * 0.5;
        
        return (
          <Sphere key={`particle-${i}`} args={[0.01, 8, 8]} position={[x, y, z]}>
            <meshStandardMaterial 
              color="#00d4ff"
              emissive="#00d4ff"
              emissiveIntensity={2}
              transparent
              opacity={0.6}
            />
          </Sphere>
        );
      })}
    </group>
  );
};

export default MesaLaboratorio;