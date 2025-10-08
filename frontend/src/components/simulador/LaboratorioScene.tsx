// frontend/src/components/simulador/LaboratorioScene.tsx
import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment, 
  ContactShadows, 
  Sky,
  Sparkles,
  Float,
  Text,
  Loader,
  Stars
} from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField, SSAO } from '@react-three/postprocessing';
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
// CÁMARA INTELIGENTE
// ============================================
const SmartCamera: React.FC<{ objetosEnMesa: ObjetoSimulacion[] }> = ({ objetosEnMesa }) => {
  const { camera } = useThree();
  
  useEffect(() => {
    if (objetosEnMesa.length > 0) {
      const center = new THREE.Vector3();
      objetosEnMesa.forEach(obj => center.add(new THREE.Vector3(...obj.position)));
      center.divideScalar(objetosEnMesa.length);
      
      // Ajustar cámara según cantidad de objetos
      const distanceFactor = Math.min(1 + objetosEnMesa.length * 0.1, 1.8);
      camera.position.set(
        center.x + 6 * distanceFactor, 
        center.y + 5 * distanceFactor, 
        center.z + 6 * distanceFactor
      );
      camera.lookAt(center);
    } else {
      camera.position.set(0, 5, 10);
      camera.lookAt(0, 0, 0);
    }
  }, [objetosEnMesa, camera]);

  return null;
};

// ============================================
// ILUMINACIÓN PROFESIONAL DEL LABORATORIO
// ============================================
const LabLighting: React.FC = () => {
  const directionalLightRef = useRef<THREE.DirectionalLight>(null);
  
  useFrame((state) => {
    if (directionalLightRef.current) {
      // Luz principal que sigue sutilmente el tiempo
      directionalLightRef.current.intensity = 1.5 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group>
      {/* Luz direccional principal (sol del laboratorio) */}
      <directionalLight 
        ref={directionalLightRef}
        position={[10, 15, 8]} 
        intensity={1.5}
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={50}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-bias={-0.0001}
        color="#ffffff"
      />
      
      {/* Luz ambiental suave (iluminación general) */}
      <ambientLight intensity={0.4} color="#b8d4f0" />
      
      {/* Luces de techo del laboratorio (3 puntos) */}
      <pointLight position={[0, 10, 0]} intensity={1.2} color="#ffffff" distance={18} decay={2} />
      <pointLight position={[-5, 9, -3]} intensity={0.8} color="#e6f2ff" distance={15} decay={2} />
      <pointLight position={[5, 9, -3]} intensity={0.8} color="#e6f2ff" distance={15} decay={2} />
      
      {/* Luz de trabajo focalizada sobre la mesa */}
      <spotLight 
        position={[0, 8, 4]} 
        angle={0.6} 
        penumbra={0.6}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        color="#fff8e1"
        target-position={[0, 0, 0]}
      />
      
      {/* Luz de relleno (fill light) */}
      <spotLight 
        position={[-8, 6, -5]} 
        angle={0.8} 
        penumbra={0.8}
        intensity={0.6}
        color="#cce7ff"
      />
      
      {/* Luz de contorno (rim light) */}
      <directionalLight
        position={[-10, 8, -10]}
        intensity={0.5}
        color="#b3d9ff"
      />
      
      {/* Hemisferio (simula luz del cielo y suelo) */}
      <hemisphereLight
        skyColor="#87ceeb"
        groundColor="#4a5f7a"
        intensity={0.4}
        position={[0, 10, 0]}
      />
    </group>
  );
};

// ============================================
// AMBIENTE DEL LABORATORIO
// ============================================
const LabEnvironment: React.FC = () => {
  return (
    <group>
      {/* Paredes del laboratorio */}
      <mesh position={[0, 5, -8]} receiveShadow>
        <planeGeometry args={[30, 12]} />
        <meshStandardMaterial 
          color="#e8f0f8" 
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>
      
      {/* Pared lateral izquierda */}
      <mesh position={[-15, 5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[20, 12]} />
        <meshStandardMaterial 
          color="#dde8f0" 
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>
      
      {/* Piso del laboratorio (texturizado) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.1, 0]} receiveShadow>
        <planeGeometry args={[35, 25]} />
        <meshStandardMaterial 
          color="#3a4a5f" 
          roughness={0.8}
          metalness={0.15}
        />
      </mesh>
      
      {/* Grid del piso */}
      <gridHelper 
        args={[30, 40, '#2a3a4f', '#354050']} 
        position={[0, -2.09, 0]} 
      />
    </group>
  );
};

// ============================================
// PARTÍCULAS FLOTANTES (AMBIENTE)
// ============================================
const ScientificParticles: React.FC = () => {
  return (
    <>
      <Sparkles
        count={80}
        scale={[25, 12, 20]}
        size={2.5}
        speed={0.2}
        opacity={0.08}
        color="#00d4ff"
        position={[0, 4, 0]}
      />
      <Stars
        radius={50}
        depth={30}
        count={200}
        factor={2}
        saturation={0.5}
        fade
        speed={0.3}
      />
    </>
  );
};

// ============================================
// TEXTO DE BIENVENIDA FLOTANTE
// ============================================
const FloatingWelcome: React.FC = () => {
  const textRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (textRef.current) {
      textRef.current.position.y = 4 + Math.sin(state.clock.elapsedTime) * 0.2;
      textRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={textRef}>
      <Text
        position={[0, 4, -3]}
        fontSize={1}
        color="#00d4ff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        ChemLab Pro 3D
      </Text>
      <Text
        position={[0, 3, -3]}
        fontSize={0.35}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        Laboratorio Virtual Interactivo
      </Text>
      <Text
        position={[0, 2.3, -3]}
        fontSize={0.2}
        color="#aaccff"
        anchorX="center"
        anchorY="middle"
      >
        Arrastra utensilios y agrega elementos químicos
      </Text>
    </group>
  );
};

// ============================================
// INDICADORES DE ESTADO
// ============================================
const StatusIndicators: React.FC<{ count: number }> = ({ count }) => {
  return (
    <group position={[8, 3, 0]}>
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.4}
        color="#00d4ff"
        anchorX="center"
      >
        Objetos: {count}
      </Text>
      
      {/* Indicador visual */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial 
          color={count > 0 ? "#00ff00" : "#ff0000"}
          emissive={count > 0 ? "#00ff00" : "#ff0000"}
          emissiveIntensity={1}
        />
      </mesh>
    </group>
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

  return (
    <div className="w-full h-full bg-gradient-to-b from-gray-900 via-blue-900 to-purple-900 relative">
      {/* Overlay de instrucciones */}
      <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md rounded-2xl p-5 text-white max-w-xs border border-cyan-500/30">
        <h3 className="font-bold text-cyan-400 mb-3 flex items-center text-lg">
          <span className="text-2xl mr-2">🎯</span> Instrucciones
        </h3>
        <ul className="text-sm space-y-2">
          <li className="flex items-start">
            <span className="text-cyan-400 mr-2">•</span>
            <span>Arrastra utensilios desde el panel al laboratorio</span>
          </li>
          <li className="flex items-start">
            <span className="text-cyan-400 mr-2">•</span>
            <span>Selecciona elementos químicos y haz clic en utensilios</span>
          </li>
          <li className="flex items-start">
            <span className="text-cyan-400 mr-2">•</span>
            <span>Presiona "Iniciar Reacción" cuando estés listo</span>
          </li>
          <li className="flex items-start">
            <span className="text-cyan-400 mr-2">•</span>
            <span>Usa el mouse para rotar y hacer zoom</span>
          </li>
        </ul>
      </div>

      {/* Contador de objetos (esquina superior derecha) */}
      <div className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-md rounded-2xl p-4 text-white border border-cyan-500/30">
        <div className="text-center">
          <div className="text-3xl font-bold text-cyan-400">{objetosEnMesa.length}</div>
          <div className="text-xs text-gray-300">Objetos en mesa</div>
        </div>
      </div>

      {/* Canvas 3D */}
      <Canvas 
        shadows 
        className="rounded-2xl"
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2
        }}
        camera={{ 
          fov: 55, 
          near: 0.1, 
          far: 1000,
          position: [0, 5, 10] 
        }}
        onCreated={() => setIsLoading(false)}
      >
        {/* Cámara inteligente */}
        <SmartCamera objetosEnMesa={objetosEnMesa} />
        
        {/* Controles de órbita mejorados */}
        <OrbitControls 
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2.2}
          minPolarAngle={Math.PI / 6}
          minDistance={4}
          maxDistance={30}
          target={[0, 0, 0]}
          dampingFactor={0.05}
          enableDamping
          rotateSpeed={0.6}
          zoomSpeed={0.8}
          panSpeed={0.5}
        />

        {/* Iluminación profesional */}
        <LabLighting />
        
        {/* Suspense para carga asíncrona */}
        <Suspense fallback={
          <Text position={[0, 2, 0]} color="white" fontSize={0.5}>
            Cargando laboratorio...
          </Text>
        }>
          {/* Ambiente del laboratorio */}
          <LabEnvironment />
          
          {/* Mesa de laboratorio */}
          <MesaLaboratorio />

          {/* Utensilios y elementos en la mesa */}
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

          {/* Efectos visuales de reacciones */}
          {efectosActivos && (
            <EfectosVisuales 
              efectos={efectosActivos}
              position={[0, 1.5, 0]}
            />
          )}

          {/* Ambiente HDRI */}
          <Environment 
            preset="studio"
            background={false}
          />
          
          {/* Partículas científicas */}
          <ScientificParticles />
          
          {/* Texto de bienvenida (solo cuando no hay objetos) */}
          {objetosEnMesa.length === 0 && <FloatingWelcome />}

          {/* Sombras de contacto realistas */}
          <ContactShadows 
            position={[0, -1.99, 0]} 
            opacity={0.5} 
            scale={25} 
            blur={2.5} 
            far={10}
            resolution={1024}
            color="#000000"
          />
        </Suspense>

        {/* Efectos de post-procesado */}
        <EffectComposer multisampling={8}>
          <Bloom 
            intensity={0.4} 
            luminanceThreshold={0.9} 
            luminanceSmoothing={0.9}
            radius={0.85}
          />
          <DepthOfField 
            focusDistance={0.01}
            focalLength={0.05}
            bokehScale={3}
          />
          <SSAO
            radius={0.4}
            intensity={30}
            luminanceInfluence={0.6}
            color="black"
          />
        </EffectComposer>
      </Canvas>

      {/* Loader personalizado */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Cargando laboratorio 3D...</p>
          </div>
        </div>
      )}

      {/* Indicador de interacción */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-md rounded-2xl px-6 py-3 text-white text-sm border border-cyan-500/30">
        🖱️ Click y arrastra para rotar • Scroll para zoom • Click derecho para mover
      </div>
    </div>
  );
};

export default LaboratorioScene;