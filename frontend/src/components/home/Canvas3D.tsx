import React, { useMemo, useRef, useLayoutEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line, Stars } from "@react-three/drei";
import * as THREE from "three";
// Efectos de postproceso (bloom elegante)
import { EffectComposer, Bloom } from "@react-three/postprocessing";

type ElectronProps = {
  radius: number;
  speed: number;
  tilt?: number; // inclinación del plano orbital
  size?: number;
};

const Electron: React.FC<ElectronProps> = ({ radius, speed, tilt = 0.4, size = 0.08 }) => {
  const ref = useRef<THREE.Mesh>(null!);
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta * speed;
    const x = Math.cos(t.current) * radius;
    const z = Math.sin(t.current) * radius;
    const y = Math.sin(t.current * 0.7) * radius * 0.15;
    // rotamos el plano para que no todas las órbitas sean iguales
    ref.current.position.set(
      x,
      y * Math.cos(tilt) + z * Math.sin(tilt),
      -y * Math.sin(tilt) + z * Math.cos(tilt)
    );
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 24, 24]} />
      <meshStandardMaterial emissive={"#ffd166"} emissiveIntensity={1.2} color={"#fff2b6"} />
    </mesh>
  );
};

const OrbitPath: React.FC<{ radius: number; tilt?: number }> = ({ radius, tilt = 0.4 }) => {
  // curva elíptica ligera
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      const x = Math.cos(a) * radius;
      const z = Math.sin(a) * radius;
      const y = Math.sin(a * 0.7) * radius * 0.15;
      // aplicar inclinación
      const yy = y * Math.cos(tilt) + z * Math.sin(tilt);
      const zz = -y * Math.sin(tilt) + z * Math.cos(tilt);
      pts.push(new THREE.Vector3(x, yy, zz));
    }
    return pts;
  }, [radius, tilt]);

  return <Line points={points} linewidth={1} transparent opacity={0.25} color="#66e6ff" />;
};

const Nucleo: React.FC = () => {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((_, delta) => {
    ref.current.rotation.y += delta * 0.25;
    ref.current.rotation.x += delta * 0.1;
  });

  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[0.45, 1]} />
      <meshStandardMaterial
        color={"#00e5ff"}
        emissive={"#00d0ff"}
        emissiveIntensity={1.5}
        roughness={0.25}
        metalness={0.3}
      />
    </mesh>
  );
};

const NebulaParticles: React.FC<{ count?: number; spread?: number }> = ({ count = 600, spread = 8 }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colors = useMemo(() => [new THREE.Color("#8be9fd"), new THREE.Color("#b388ff"), new THREE.Color("#64ffda")], []);

  useLayoutEffect(() => {
    if (!meshRef.current) return;
    
    for (let i = 0; i < count; i++) {
      const r = spread * (0.5 + Math.random() * 0.5);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta) * 0.65;
      const z = r * Math.cos(phi);

      dummy.position.set(x, y, z);
      const s = 0.03 + Math.random() * 0.08;
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      const c = colors[i % colors.length];
      meshRef.current.setColorAt(i, c);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    // @ts-ignore
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [count, spread, colors, dummy]);

  useFrame((_, delta) => {
    if (meshRef.current) {
        meshRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined as any, undefined as any, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial />
    </instancedMesh>
  );
};

const EscenaAtomica: React.FC = () => {
  return (
    <>
      {/* Iluminación cinematográfica */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 7, 5]} intensity={1.1} color={"#a5f3fc"} />
      <pointLight position={[-6, -4, -3]} intensity={0.7} color={"#60a5fa"} />

      {/* Nebulosa/estrellas */}
      <Stars radius={80} depth={40} count={1500} factor={4} saturation={0} fade speed={0.6} />
      <NebulaParticles count={700} spread={9} />

      {/* Átomo principal */}
      <group position={[0, 0, 0]}>
        <Nucleo />
        {/* Órbitas y electrones en distintos planos */}
        <OrbitPath radius={1.4} tilt={0.15} />
        <OrbitPath radius={1.8} tilt={0.55} />
        <OrbitPath radius={2.2} tilt={-0.35} />

        <Electron radius={1.4} speed={1.6} tilt={0.15} />
        <Electron radius={1.8} speed={1.0} tilt={0.55} />
        <Electron radius={2.2} speed={0.8} tilt={-0.35} />
      </group>

      {/* Postproceso (bloom suave) */}
      <EffectComposer>
        <Bloom mipmapBlur intensity={0.75} luminanceThreshold={0.1} luminanceSmoothing={0.2} />
      </EffectComposer>
    </>
  );
};

const Canvas3D: React.FC = () => {
  return (
    <div className="w-full rounded-xl overflow-hidden bg-gradient-to-b from-[#07111e] via-[#0b1a2e] to-[#0a1222]">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [3.2, 2.6, 3.2], fov: 55 }}
        gl={{ antialias: true, alpha: true }}
        className="h-96 md:h-[30rem] lg:h-[40rem]"
      >
        <EscenaAtomica />
        <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.6} />
      </Canvas>
    </div>
  );
};

export default Canvas3D;