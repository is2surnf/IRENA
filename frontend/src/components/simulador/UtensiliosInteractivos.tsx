// frontend/src/components/simulador/UtensiliosInteractivos.tsx
import React, { useRef, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Cylinder, Cone, Text, Sphere, Box } from '@react-three/drei';
import type { Utensilio, ContenidoUtensilio } from '../../types/simulacion.types';
import * as THREE from 'three';

interface UtensiliosInteractivosProps {
  utensilio: Utensilio;
  position: [number, number, number];
  contenido?: ContenidoUtensilio;
  onClick: () => void;
  onMove: (position: [number, number, number]) => void;
}

const UtensiliosInteractivos: React.FC<UtensiliosInteractivosProps> = ({
  utensilio,
  position,
  contenido,
  onClick,
  onMove
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hover, setHover] = useState(false);
  const { camera, gl } = useThree();
  const dragPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);

  // Animación de hover
  useFrame(() => {
    if (groupRef.current) {
      const targetScale = hover ? 1.08 : 1.0;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      
      // Rotación sutil cuando está en hover
      if (hover && !isDragging) {
        groupRef.current.rotation.y += 0.01;
      }
    }
  });

  // Manejo de drag & drop 3D
  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    setIsDragging(true);
    gl.domElement.style.cursor = 'grabbing';
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    gl.domElement.style.cursor = hover ? 'grab' : 'auto';
  };

  const handlePointerMove = (e: any) => {
    if (isDragging) {
      e.stopPropagation();
      
      // Calcular nueva posición en el plano 3D
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(
        new THREE.Vector2(
          (e.clientX / window.innerWidth) * 2 - 1,
          -(e.clientY / window.innerHeight) * 2 + 1
        ),
        camera
      );

      const intersectPoint = new THREE.Vector3();
      raycaster.ray.intersectPlane(dragPlane, intersectPoint);

      // Limitar movimiento dentro de la mesa
      const clampedX = Math.max(-3.5, Math.min(3.5, intersectPoint.x));
      const clampedZ = Math.max(-1.5, Math.min(1.5, intersectPoint.z));
      
      onMove([clampedX, 0.1, clampedZ]);
    }
  };

  const renderUtensilio = () => {
    const nombre = utensilio.nombre.toLowerCase();
    
    if (nombre.includes('vaso') || nombre.includes('precipitado')) {
      return <VasoPrecipitados contenido={contenido} />;
    }
    if (nombre.includes('matraz') || nombre.includes('erlenmeyer')) {
      return <MatrazErlenmeyer contenido={contenido} />;
    }
    if (nombre.includes('tubo')) {
      return <TuboEnsayo contenido={contenido} />;
    }
    if (nombre.includes('mechero') || nombre.includes('bunsen')) {
      return <MecheroBunsen />;
    }
    if (nombre.includes('pipeta')) {
      return <Pipeta contenido={contenido} />;
    }
    if (nombre.includes('probeta')) {
      return <Probeta contenido={contenido} />;
    }
    
    // Por defecto, vaso de precipitados
    return <VasoPrecipitados contenido={contenido} />;
  };

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
        gl.domElement.style.cursor = isDragging ? 'grabbing' : 'grab';
      }}
      onPointerOut={() => {
        setHover(false);
        gl.domElement.style.cursor = 'auto';
      }}
    >
      {renderUtensilio()}
      
      {/* Etiqueta flotante */}
      {hover && (
        <Text
          position={[0, 2.2, 0]}
          fontSize={0.25}
          color="#00d4ff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {utensilio.nombre}
        </Text>
      )}

      {/* Indicador de contenido */}
      {contenido && contenido.elementos.length > 0 && (
        <Text
          position={[0, 1.8, 0]}
          fontSize={0.18}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="#000000"
        >
          {contenido.elementos.map(e => e.simbolo).join(' + ')}
        </Text>
      )}

      {/* Sombra proyectada */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0.01, 0]}
        receiveShadow
      >
        <circleGeometry args={[0.6, 32]} />
        <meshBasicMaterial 
          color="#000000" 
          transparent 
          opacity={hover ? 0.3 : 0.2}
        />
      </mesh>
    </group>
  );
};

// ============================================
// VASO DE PRECIPITADOS
// ============================================
const VasoPrecipitados: React.FC<{ contenido?: ContenidoUtensilio }> = ({ contenido }) => {
  const liquidRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (liquidRef.current && contenido?.estado === 'mezclando') {
      liquidRef.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 0.02;
    }
  });

  return (
    <group>
      {/* Cuerpo del vaso */}
      <Cylinder args={[0.5, 0.6, 1.5, 32]} position={[0, 0.75, 0]} castShadow>
        <meshPhysicalMaterial
          transparent
          opacity={0.25}
          color="#88ccff"
          roughness={0.05}
          transmission={0.95}
          thickness={0.5}
          envMapIntensity={1.5}
        />
      </Cylinder>

      {/* Borde superior */}
      <Cylinder args={[0.52, 0.52, 0.05, 32]} position={[0, 1.52, 0]}>
        <meshStandardMaterial
          color="#aaccff"
          roughness={0.1}
          metalness={0.8}
          transparent
          opacity={0.4}
        />
      </Cylinder>

      {/* Líquido contenido */}
      {contenido && contenido.nivel > 0 && (
        <Cylinder 
          ref={liquidRef}
          args={[0.48, 0.58, contenido.nivel * 1.4, 32]} 
          position={[0, (contenido.nivel * 1.4) / 2 + 0.05, 0]}
          castShadow
        >
          <meshPhysicalMaterial
            color={contenido.color}
            transparent
            opacity={0.75}
            roughness={0.1}
            metalness={0.1}
            transmission={0.3}
            thickness={1}
          />
        </Cylinder>
      )}

      {/* Marcas de graduación */}
      {[0.3, 0.6, 0.9, 1.2].map((y, i) => (
        <group key={i}>
          <Cylinder
            args={[0.61, 0.61, 0.02, 32]}
            position={[0, y, 0]}
          >
            <meshBasicMaterial color="#ffffff" opacity={0.6} transparent />
          </Cylinder>
          {/* Números de graduación */}
          <Text
            position={[0.65, y, 0]}
            fontSize={0.1}
            color="#666666"
            anchorX="left"
            anchorY="middle"
          >
            {(i + 1) * 250}ml
          </Text>
        </group>
      ))}

      {/* Base del vaso */}
      <Cylinder args={[0.6, 0.6, 0.08, 32]} position={[0, 0.04, 0]} castShadow>
        <meshStandardMaterial
          color="#aaccff"
          roughness={0.2}
          metalness={0.7}
          transparent
          opacity={0.5}
        />
      </Cylinder>
    </group>
  );
};

// ============================================
// MATRAZ ERLENMEYER
// ============================================
const MatrazErlenmeyer: React.FC<{ contenido?: ContenidoUtensilio }> = ({ contenido }) => {
  return (
    <group>
      {/* Cuerpo cónico */}
      <Cone args={[0.8, 1.5, 32]} position={[0, 0.75, 0]} castShadow>
        <meshPhysicalMaterial
          transparent
          opacity={0.25}
          color="#88ccff"
          roughness={0.05}
          transmission={0.95}
          thickness={0.8}
        />
      </Cone>

      {/* Cuello del matraz */}
      <Cylinder args={[0.2, 0.2, 0.8, 32]} position={[0, 1.9, 0]} castShadow>
        <meshPhysicalMaterial
          transparent
          opacity={0.25}
          color="#88ccff"
          roughness={0.05}
          transmission={0.95}
        />
      </Cylinder>

      {/* Borde del cuello */}
      <Cylinder args={[0.22, 0.22, 0.05, 32]} position={[0, 2.32, 0]}>
        <meshStandardMaterial
          color="#aaccff"
          roughness={0.1}
          metalness={0.8}
          transparent
          opacity={0.4}
        />
      </Cylinder>

      {/* Líquido */}
      {contenido && contenido.nivel > 0 && (
        <Cone 
          args={[0.78, contenido.nivel * 1.4, 32]} 
          position={[0, (contenido.nivel * 1.4) / 2 + 0.05, 0]}
        >
          <meshPhysicalMaterial
            color={contenido.color}
            transparent
            opacity={0.75}
            roughness={0.1}
            transmission={0.3}
          />
        </Cone>
      )}
    </group>
  );
};

// ============================================
// TUBO DE ENSAYO
// ============================================
const TuboEnsayo: React.FC<{ contenido?: ContenidoUtensilio }> = ({ contenido }) => {
  return (
    <group>
      {/* Cuerpo del tubo */}
      <Cylinder args={[0.2, 0.2, 1.2, 32]} position={[0, 0.6, 0]} castShadow>
        <meshPhysicalMaterial
          transparent
          opacity={0.25}
          color="#88ccff"
          roughness={0.05}
          transmission={0.95}
        />
      </Cylinder>

      {/* Fondo redondeado */}
      <Sphere args={[0.2, 16, 16]} position={[0, 0.0, 0]} castShadow>
        <meshPhysicalMaterial
          transparent
          opacity={0.25}
          color="#88ccff"
          roughness={0.05}
          transmission={0.95}
        />
      </Sphere>

      {/* Borde superior */}
      <Cylinder args={[0.21, 0.21, 0.04, 32]} position={[0, 1.22, 0]}>
        <meshStandardMaterial
          color="#aaccff"
          roughness={0.1}
          metalness={0.8}
          transparent
          opacity={0.4}
        />
      </Cylinder>

      {/* Líquido */}
      {contenido && contenido.nivel > 0 && (
        <Cylinder 
          args={[0.18, 0.18, contenido.nivel, 32]} 
          position={[0, contenido.nivel / 2 + 0.05, 0]}
        >
          <meshPhysicalMaterial
            color={contenido.color}
            transparent
            opacity={0.75}
            roughness={0.1}
            transmission={0.3}
          />
        </Cylinder>
      )}
    </group>
  );
};

// ============================================
// MECHERO BUNSEN
// ============================================
const MecheroBunsen: React.FC = () => {
  const [encendido, setEncendido] = useState(false);
  const flameRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (flameRef.current && encendido) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.15;
      flameRef.current.scale.set(1, scale, 1);
      flameRef.current.rotation.y += 0.02;
    }
  });

  return (
    <group onClick={() => setEncendido(!encendido)}>
      {/* Base */}
      <Cylinder args={[0.35, 0.45, 0.25, 32]} position={[0, 0.125, 0]} castShadow>
        <meshStandardMaterial color="#2C3E50" metalness={0.8} roughness={0.3} />
      </Cylinder>

      {/* Cuerpo del mechero */}
      <Cylinder args={[0.12, 0.12, 1.2, 32]} position={[0, 0.85, 0]} castShadow>
        <meshStandardMaterial color="#34495E" metalness={0.85} roughness={0.25} />
      </Cylinder>

      {/* Regulador de aire */}
      <Cylinder args={[0.15, 0.15, 0.08, 32]} position={[0, 0.4, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <meshStandardMaterial color="#7F8C8D" metalness={0.9} roughness={0.2} />
      </Cylinder>

      {/* Boquilla superior */}
      <Cylinder args={[0.08, 0.12, 0.15, 32]} position={[0, 1.52, 0]} castShadow>
        <meshStandardMaterial color="#95A5A6" metalness={0.9} roughness={0.2} />
      </Cylinder>

      {/* Llama (cuando está encendido) */}
      {encendido && (
        <group ref={flameRef} position={[0, 1.7, 0]}>
          {/* Llama exterior (naranja) */}
          <Cone args={[0.25, 0.8, 16]} position={[0, 0.4, 0]}>
            <meshBasicMaterial
              color="#FF6600"
              transparent
              opacity={0.8}
            />
          </Cone>
          
          {/* Llama interior (azul) */}
          <Cone args={[0.15, 0.5, 16]} position={[0, 0.25, 0]}>
            <meshBasicMaterial
              color="#00BFFF"
              transparent
              opacity={0.7}
            />
          </Cone>

          {/* Núcleo brillante */}
          <Sphere args={[0.08, 16, 16]} position={[0, 0.15, 0]}>
            <meshBasicMaterial
              color="#FFFF00"
              emissive="#FFFF00"
              emissiveIntensity={2}
            />
          </Sphere>

          {/* Luz de la llama */}
          <pointLight
            color="#FF6600"
            intensity={3}
            distance={5}
            decay={2}
          />
        </group>
      )}

      {/* Indicador de estado */}
      <Sphere args={[0.05, 16, 16]} position={[0.2, 0.3, 0]}>
        <meshBasicMaterial
          color={encendido ? "#00FF00" : "#FF0000"}
          emissive={encendido ? "#00FF00" : "#FF0000"}
          emissiveIntensity={1}
        />
      </Sphere>
    </group>
  );
};

// ============================================
// PIPETA
// ============================================
const Pipeta: React.FC<{ contenido?: ContenidoUtensilio }> = ({ contenido }) => {
  return (
    <group rotation={[0, 0, Math.PI / 6]}>
      {/* Bulbo de succión */}
      <Sphere args={[0.25, 16, 16]} position={[0, 1.5, 0]} castShadow>
        <meshStandardMaterial
          color="#FF6B6B"
          roughness={0.3}
          metalness={0.1}
          transparent
          opacity={0.7}
        />
      </Sphere>

      {/* Tubo de la pipeta */}
      <Cylinder args={[0.05, 0.05, 1.8, 16]} position={[0, 0.5, 0]} castShadow>
        <meshPhysicalMaterial
          transparent
          opacity={0.25}
          color="#88ccff"
          roughness={0.05}
          transmission={0.95}
        />
      </Cylinder>

      {/* Punta de la pipeta */}
      <Cone args={[0.05, 0.15, 16]} position={[0, -0.45, 0]} castShadow>
        <meshPhysicalMaterial
          transparent
          opacity={0.25}
          color="#88ccff"
          roughness={0.05}
          transmission={0.95}
        />
      </Cone>

      {/* Marcas de graduación */}
      {[0.2, 0.5, 0.8, 1.1].map((y, i) => (
        <Box
          key={i}
          args={[0.08, 0.01, 0.01]}
          position={[0.03, y, 0]}
        >
          <meshBasicMaterial color="#666666" />
        </Box>
      ))}

      {/* Líquido dentro */}
      {contenido && contenido.nivel > 0 && (
        <Cylinder 
          args={[0.045, 0.045, contenido.nivel * 0.8, 16]} 
          position={[0, contenido.nivel * 0.4 - 0.2, 0]}
        >
          <meshPhysicalMaterial
            color={contenido.color}
            transparent
            opacity={0.8}
          />
        </Cylinder>
      )}
    </group>
  );
};

// ============================================
// PROBETA GRADUADA
// ============================================
const Probeta: React.FC<{ contenido?: ContenidoUtensilio }> = ({ contenido }) => {
  return (
    <group>
      {/* Base hexagonal */}
      <Cylinder args={[0.35, 0.35, 0.1, 6]} position={[0, 0.05, 0]} castShadow>
        <meshStandardMaterial
          color="#aaccff"
          roughness={0.2}
          metalness={0.7}
          transparent
          opacity={0.5}
        />
      </Cylinder>

      {/* Cuerpo cilíndrico */}
      <Cylinder args={[0.25, 0.25, 1.8, 32]} position={[0, 1.0, 0]} castShadow>
        <meshPhysicalMaterial
          transparent
          opacity={0.25}
          color="#88ccff"
          roughness={0.05}
          transmission={0.95}
          thickness={0.5}
        />
      </Cylinder>

      {/* Pico vertedor */}
      <Cone args={[0.15, 0.2, 32]} position={[0.35, 1.85, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
        <meshPhysicalMaterial
          transparent
          opacity={0.25}
          color="#88ccff"
          roughness={0.05}
          transmission={0.95}
        />
      </Cone>

      {/* Marcas de graduación detalladas */}
      {Array.from({ length: 10 }).map((_, i) => {
        const y = 0.2 + (i * 0.18);
        return (
          <group key={i}>
            <Cylinder
              args={[0.26, 0.26, 0.01, 32]}
              position={[0, y, 0]}
            >
              <meshBasicMaterial color="#ffffff" opacity={0.7} transparent />
            </Cylinder>
            <Text
              position={[0.3, y, 0]}
              fontSize={0.08}
              color="#333333"
              anchorX="left"
              anchorY="middle"
            >
              {(i + 1) * 100}
            </Text>
          </group>
        );
      })}

      {/* Líquido */}
      {contenido && contenido.nivel > 0 && (
        <Cylinder 
          args={[0.24, 0.24, contenido.nivel * 1.7, 32]} 
          position={[0, (contenido.nivel * 1.7) / 2 + 0.15, 0]}
          castShadow
        >
          <meshPhysicalMaterial
            color={contenido.color}
            transparent
            opacity={0.75}
            roughness={0.1}
            transmission={0.3}
          />
        </Cylinder>
      )}

      {/* Menisco (superficie del líquido) */}
      {contenido && contenido.nivel > 0 && (
        <Sphere 
          args={[0.24, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} 
          position={[0, contenido.nivel * 1.7 + 0.15, 0]}
          rotation={[Math.PI, 0, 0]}
        >
          <meshPhysicalMaterial
            color={contenido.color}
            transparent
            opacity={0.6}
            roughness={0.05}
          />
        </Sphere>
      )}
    </group>
  );
};

export default UtensiliosInteractivos;