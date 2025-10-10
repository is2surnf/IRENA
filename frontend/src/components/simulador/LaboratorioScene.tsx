// frontend/src/components/simulador/LaboratorioScene.tsx 
import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  ContactShadows, 
  Sky,
  Sparkles,
  Float,
  Text,
  Stars,
  Sphere,
  Box
} from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField, SSAO } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import MesaLaboratorio from './MesaLaboratorio';
import UtensiliosInteractivos from './UtensiliosInteractivos';
import EfectosVisuales from './EfectosVisuales';
import type { ObjetoSimulacion, EfectosReaccion } from '../../types/simulacion.types';
import * as THREE from 'three';

interface LaboratorioSceneProps {
  objetosEnMesa: ObjetoSimulacion[];
  efectosActivos?: EfectosReaccion;
  onObjectClick: (objeto: ObjetoSimulacion) => void;
  onObjectMove: (id: string, position: [number, number, number]) => void;
}

// ============================================
// ILUMINACIÓN REALISTA DE LABORATORIO
// ============================================
const RealisticLabLighting: React.FC<{ efectosActivos?: EfectosReaccion }> = ({ efectosActivos }) => {
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const reactionLightRef = useRef<THREE.PointLight | null>(null);
  
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    
    // Luz principal suave y constante
    if (keyLightRef.current) {
      keyLightRef.current.intensity = 1.8 + Math.sin(t * 0.2) * 0.05;
    }
    
    // Luz de reacción con parpadeo
    if (reactionLightRef.current && efectosActivos) {
      reactionLightRef.current.intensity = 3 + Math.sin(t * 8) * 0.5;
    }
  });

  return (
    <group>
      {/* Luz principal direccional (simula luz del techo) */}
      <directionalLight 
        ref={keyLightRef}
        position={[5, 8, 5]} 
        intensity={1.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={30}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0005}
        color="#ffffff"
      />
      
      {/* Luz ambiental más fuerte para mejor visibilidad */}
      <ambientLight intensity={0.6} color="#e8f4ff" />
      
      {/* Luz hemisférica para simular reflexión del piso/techo */}
      <hemisphereLight
        args={['#ffffff', '#444444', 0.8]}
        position={[0, 10, 0]}
      />
      
      {/* Luces puntuales del techo del laboratorio */}
      <pointLight position={[0, 6, 0]} intensity={1.2} color="#ffffff" distance={15} decay={2} />
      <pointLight position={[-4, 6, -3]} intensity={0.8} color="#f0f8ff" distance={12} decay={2} />
      <pointLight position={[4, 6, -3]} intensity={0.8} color="#f0f8ff" distance={12} decay={2} />
      <pointLight position={[-4, 6, 3]} intensity={0.8} color="#f0f8ff" distance={12} decay={2} />
      <pointLight position={[4, 6, 3]} intensity={0.8} color="#f0f8ff" distance={12} decay={2} />
      
      {/* Luz de reacción química */}
      {efectosActivos && (
        <pointLight
          ref={reactionLightRef}
          position={[0, 2, 0]}
          intensity={3}
          color={efectosActivos.colorLuz || '#ffffff'}
          distance={6}
          decay={2}
          castShadow
        />
      )}
    </group>
  );
};

// ============================================
// AMBIENTE COMPACTO DEL LABORATORIO
// ============================================
const CompactLabEnvironment: React.FC = () => {
  return (
    <group>
      {/* Pared trasera más cercana */}
      <mesh position={[0, 3, -6]} receiveShadow>
        <planeGeometry args={[16, 8]} />
        <meshStandardMaterial 
          color="#2a3544" 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Paneles decorativos en la pared con mejor contraste */}
      {[-4, 0, 4].map((x, i) => (
        <group key={`panel-${i}`} position={[x, 3.5, -5.9]}>
          <Box args={[2, 3, 0.15]}>
            <meshStandardMaterial 
              color="#1a2332" 
              roughness={0.6}
              metalness={0.4}
              emissive="#00d4ff"
              emissiveIntensity={0.08}
            />
          </Box>
          
          {/* Luz decorativa en panel */}
          <Sphere args={[0.06, 16, 16]} position={[0, -1.3, 0.12]}>
            <meshStandardMaterial 
              color="#00d4ff" 
              emissive="#00d4ff" 
              emissiveIntensity={3}
            />
          </Sphere>
          
          <pointLight
            position={[0, -1.3, 0.25]}
            intensity={0.3}
            color="#00d4ff"
            distance={2.5}
          />
        </group>
      ))}
      
      {/* Pared lateral izquierda */}
      <mesh position={[-8, 3, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[14, 8]} />
        <meshStandardMaterial 
          color="#2a3544" 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Pared lateral derecha */}
      <mesh position={[8, 3, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[14, 8]} />
        <meshStandardMaterial 
          color="#2a3544" 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Suelo del laboratorio con mejor visibilidad */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.1, 0]} receiveShadow>
        <planeGeometry args={[20, 16]} />
        <meshStandardMaterial 
          color="#1a2332" 
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>
      
      {/* Grid sutil en el suelo */}
      <gridHelper 
        args={[16, 32, '#00d4ff', '#2a3544']} 
        position={[0, -2.08, 0]} 
      />
      
      {/* Vigas del techo más bajas */}
      {[-6, -3, 0, 3, 6].map((x, i) => (
        <Box 
          key={`beam-${i}`}
          args={[0.3, 0.4, 14]} 
          position={[x, 6.8, 0]}
          castShadow
        >
          <meshStandardMaterial 
            color="#3a4a5f" 
            roughness={0.4}
            metalness={0.7}
          />
        </Box>
      ))}
      
      {/* Luces de techo tipo laboratorio */}
      {[
        [-4, 6.5, -3], [0, 6.5, -3], [4, 6.5, -3],
        [-4, 6.5, 0], [0, 6.5, 0], [4, 6.5, 0],
        [-4, 6.5, 3], [0, 6.5, 3], [4, 6.5, 3]
      ].map((pos, i) => (
        <group key={`ceiling-light-${i}`} position={pos as [number, number, number]}>
          <Box args={[0.8, 0.15, 0.8]}>
            <meshStandardMaterial 
              color="#1a1a1a" 
              roughness={0.5}
              metalness={0.5}
            />
          </Box>
          <Box args={[0.7, 0.04, 0.7]} position={[0, -0.12, 0]}>
            <meshStandardMaterial 
              color="#ffffff" 
              emissive="#ffffff" 
              emissiveIntensity={2}
            />
          </Box>
          <pointLight
            position={[0, -0.25, 0]}
            intensity={0.6}
            color="#ffffff"
            distance={6}
            decay={2}
          />
        </group>
      ))}
      
      {/* Estantes en la pared trasera */}
      {[1, 2.5, 4].map((y, i) => (
        <Box 
          key={`shelf-${i}`}
          args={[10, 0.1, 0.4]} 
          position={[0, y, -5.8]}
          castShadow
        >
          <meshStandardMaterial 
            color="#4a5a6f" 
            roughness={0.6}
            metalness={0.3}
          />
        </Box>
      ))}
    </group>
  );
};

// ============================================
// PARTÍCULAS SUTILES (REDUCIDAS)
// ============================================
const SubtleParticles: React.FC = () => {
  return (
    <>
      <Sparkles
        count={30}
        scale={[15, 8, 12]}
        size={2}
        speed={0.08}
        opacity={0.04}
        color="#00d4ff"
        position={[0, 3, 0]}
      />
    </>
  );
};

// ============================================
// POST PROCESSING OPTIMIZADO
// ============================================
const OptimizedPostProcessing: React.FC<{ 
  quality: 'high' | 'medium' | 'low'; 
  isLoading: boolean 
}> = ({ quality, isLoading }) => {
  const { gl, size } = useThree();
  const [safeToRender, setSafeToRender] = useState(false);

  useEffect(() => {
    const ok = !!gl && size.width > 0 && size.height > 0 && !isLoading;
    setSafeToRender(ok);
  }, [gl, size.width, size.height, isLoading]);

  if (quality === 'low' || !safeToRender) return null;

  return (
    <EffectComposer multisampling={quality === 'high' ? 4 : 2}>
      <Bloom 
        intensity={0.3} 
        luminanceThreshold={0.9} 
        luminanceSmoothing={0.9}
        radius={0.6}
      />
    </EffectComposer>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
const LaboratorioScene: React.FC<LaboratorioSceneProps> = ({
  objetosEnMesa,
  efectosActivos,
  onObjectClick,
  onObjectMove
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [quality, setQuality] = useState<'high' | 'medium' | 'low'>('medium');

  useEffect(() => {
    const detectQuality = () => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        if (!gl) {
          setQuality('low');
          return;
        }
        
        const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          if (renderer && typeof renderer === 'string') {
            const r = renderer.toLowerCase();
            if (r.includes('intel') || r.includes('software')) {
              setQuality('low');
            } else if (r.includes('nvidia') || r.includes('amd')) {
              setQuality('high');
            } else {
              setQuality('medium');
            }
          }
        }
      } catch (error) {
        setQuality('low');
      }
    };
    
    detectQuality();
  }, []);

  return (
    <div className="w-full h-full bg-gradient-to-b from-gray-900 via-slate-900 to-black relative">
      <Canvas 
        shadows 
        className="rounded-2xl"
        style={{ width: '100%', height: '100%' }}
        dpr={Math.min(window.devicePixelRatio, quality === 'high' ? 2 : 1.5)}
        gl={{
          antialias: quality !== 'low',
          alpha: false,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1
        }}
        camera={{ 
          fov: 50, 
          near: 0.1, 
          far: 100,
          position: [6, 4, 8]
        }}
        onCreated={({ gl }) => {
          try {
            gl.setClearColor('#0a0e1a');
          } catch (e) {
            /* ignore */
          }
          setTimeout(() => setIsLoading(false), 500);
        }}
      >
        {/* ORBIT CONTROLS - CÁMARA MANUAL SIN AUTOROTATE */}
        <OrbitControls 
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2.1}
          minPolarAngle={Math.PI / 8}
          minDistance={3}
          maxDistance={15}
          target={[0, 0, 0]}
          dampingFactor={0.08}
          enableDamping
          rotateSpeed={0.5}
          zoomSpeed={0.8}
          panSpeed={0.5}
          autoRotate={false}
          autoRotateSpeed={0}
        />

        <RealisticLabLighting efectosActivos={efectosActivos} />
        
        <Suspense fallback={null}>
          <CompactLabEnvironment />

          {/* MESA SIN ROTACIÓN - ORIENTACIÓN NORMAL */}
          <group position={[0, 0, 0]}>
            <MesaLaboratorio />
          </group>

          {objetosEnMesa.map((objeto) => (
            <React.Fragment key={objeto.id}>
              {objeto.tipo === 'utensilio' && (
                <UtensiliosInteractivos
                  utensilio={objeto.data as any}
                  position={objeto.position}
                  contenido={objeto.contenido}
                  onClick={() => onObjectClick(objeto)}
                  onMove={(pos) => onObjectMove(objeto.id, pos)}
                />
              )}
            </React.Fragment>
          ))}

          {efectosActivos && (
            <EfectosVisuales 
              efectos={efectosActivos}
              position={[0, 1.5, 0]}
            />
          )}

          <Environment 
            preset="apartment"
            background={false}
            blur={0.6}
          />
          
          {quality !== 'low' && <SubtleParticles />}

          <ContactShadows 
            position={[0, -1.99, 0]} 
            opacity={0.4} 
            scale={18} 
            blur={2} 
            far={8}
            resolution={quality === 'high' ? 1024 : 512}
            color="#000000"
          />
        </Suspense>

        <OptimizedPostProcessing quality={quality} isLoading={isLoading} />
      </Canvas>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-900 to-black z-50">
          <div className="text-center">
            <div className="relative mb-6">
              <div className="w-24 h-24 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl animate-pulse">🧪</span>
              </div>
            </div>
            <p className="text-white text-xl font-semibold mb-2">Inicializando Laboratorio</p>
            <p className="text-cyan-400 text-sm">Preparando entorno 3D...</p>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 right-4 z-10 bg-black/70 backdrop-blur-md rounded-xl px-4 py-2 text-white text-xs border border-cyan-500/30">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            quality === 'high' ? 'bg-green-400' : 
            quality === 'medium' ? 'bg-yellow-400' : 
            'bg-red-400'
          } animate-pulse`}></div>
          <span>Calidad: <span className="font-semibold text-cyan-400">
            {quality === 'high' ? 'Alta' : quality === 'medium' ? 'Media' : 'Baja'}
          </span></span>
        </div>
      </div>
    </div>
  );
};

export default LaboratorioScene;