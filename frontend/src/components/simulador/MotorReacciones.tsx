// frontend/src/components/simulador/MotorReacciones.tsx - CORREGIDO
import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import type { Reaccion } from '../../types/simulacion.types';

interface MotorReaccionesProps {
  reaccion: Reaccion;
  position: [number, number, number];
  onCompletada: () => void;
}

export const MotorReacciones: React.FC<MotorReaccionesProps> = ({
  reaccion,
  position,
  onCompletada
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const [progreso, setProgreso] = useState(0);
  const [estado, setEstado] = useState<'iniciando' | 'procesando' | 'completando' | 'completado'>('iniciando');

  const particulas = useRef<{
    posiciones: Float32Array;
    velocidades: Float32Array;
    colores: Float32Array;
    tamanos: Float32Array;
  } | null>(null);

  useEffect(() => {
    const count = 50;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const baseColor = new THREE.Color(reaccion.efectos.colorLuz || '#FFFFFF');

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2;
      positions[i * 3 + 1] = Math.random() * 1.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2;

      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = Math.random() * 0.03;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;

      colors[i * 3] = baseColor.r;
      colors[i * 3 + 1] = baseColor.g;
      colors[i * 3 + 2] = baseColor.b;

      sizes[i] = Math.random() * 0.1 + 0.05;
    }

    particulas.current = {
      posiciones: positions,
      velocidades: velocities,
      colores: colors,
      tamanos: sizes
    };

    iniciarReaccion();
  }, [reaccion]);

  const iniciarReaccion = () => {
    setEstado('iniciando');
    
    const secuencia = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setEstado('procesando');
      setProgreso(30);

      await new Promise(resolve => setTimeout(resolve, 2000));
      setProgreso(70);

      setEstado('completando');
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProgreso(100);

      setEstado('completado');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onCompletada();
    };

    secuencia();
  };

  useFrame((state, delta) => {
    if (!groupRef.current || !particulas.current) return;

    if (estado !== 'completado') {
      groupRef.current.rotation.y += delta * 0.5;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }

    if (particlesRef.current && particulas.current) {
      const geometry = particlesRef.current.geometry;
      const positions = geometry.attributes.position.array as Float32Array;
      const count = positions.length / 3;

      for (let i = 0; i < count; i++) {
        switch (estado) {
          case 'iniciando':
            positions[i * 3 + 1] += particulas.current.velocidades[i * 3 + 1] * delta * 30;
            break;
          case 'procesando':
            positions[i * 3] += Math.sin(state.clock.elapsedTime + i) * 0.01;
            positions[i * 3 + 1] += particulas.current.velocidades[i * 3 + 1] * delta * 50;
            positions[i * 3 + 2] += Math.cos(state.clock.elapsedTime + i) * 0.01;
            break;
          case 'completando':
            const targetX = 0;
            const targetY = 1;
            const targetZ = 0;
            
            positions[i * 3] += (targetX - positions[i * 3]) * delta * 2;
            positions[i * 3 + 1] += (targetY - positions[i * 3 + 1]) * delta * 2;
            positions[i * 3 + 2] += (targetZ - positions[i * 3 + 2]) * delta * 2;
            break;
        }

        if (positions[i * 3 + 1] > 3) {
          positions[i * 3] = (Math.random() - 0.5) * 2;
          positions[i * 3 + 1] = 0;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
        }
      }

      geometry.attributes.position.needsUpdate = true;
    }
  });

  const getColorEstado = () => {
    switch (estado) {
      case 'iniciando': return '#FFA500';
      case 'procesando': return '#00BFFF';
      case 'completando': return '#32CD32';
      case 'completado': return '#008000';
      default: return '#FFFFFF';
    }
  };

  const getTextoEstado = () => {
    switch (estado) {
      case 'iniciando': return 'Iniciando Reacción...';
      case 'procesando': return 'Procesando...';
      case 'completando': return '¡Completando!';
      case 'completado': return 'Reacción Exitosa';
      default: return 'Preparando...';
    }
  };

  return (
    <group ref={groupRef} position={position}>
      {particulas.current && (
        <points ref={particlesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[particulas.current.posiciones, 3]}
              count={particulas.current.posiciones.length / 3}
              array={particulas.current.posiciones}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              args={[particulas.current.colores, 3]}
              count={particulas.current.colores.length / 3}
              array={particulas.current.colores}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-size"
              args={[particulas.current.tamanos, 1]}
              count={particulas.current.tamanos.length}
              array={particulas.current.tamanos}
              itemSize={1}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.1}
            vertexColors
            transparent
            opacity={0.8}
            sizeAttenuation
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}

      <Sphere args={[0.3, 16, 16]} position={[0, 1.5, 0]}>
        <meshBasicMaterial
          color={getColorEstado()}
          transparent
          opacity={0.7}
        />
      </Sphere>

      <Text
        position={[0, 2, 0]}
        fontSize={0.15}
        color={getColorEstado()}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {getTextoEstado()}
      </Text>

      <group position={[0, 1.2, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1, 0.1]} />
          <meshBasicMaterial color="#333333" transparent opacity={0.5} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <planeGeometry args={[(progreso / 100) * 1, 0.08]} />
          <meshBasicMaterial color={getColorEstado()} />
        </mesh>
      </group>

      <Text
        position={[0, 0.8, 0]}
        fontSize={0.1}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        maxWidth={2}
      >
        {reaccion.nombre}
      </Text>

      <Text
        position={[0, 0.6, 0]}
        fontSize={0.08}
        color="#CCCCCC"
        anchorX="center"
        anchorY="middle"
        maxWidth={2}
      >
        {reaccion.formula}
      </Text>

      {reaccion.efectos.llama && estado === 'procesando' && (
        <pointLight
          position={[0, 1, 0]}
          color={reaccion.efectos.colorLuz || '#FFA500'}
          intensity={reaccion.efectos.intensidadLuz || 1}
          distance={3}
        />
      )}
    </group>
  );
};

export default MotorReacciones;