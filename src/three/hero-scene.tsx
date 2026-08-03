"use client";

import { useMemo, useRef } from "react";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import * as THREE from "three";

import { useMousePosition } from "@/hooks/use-mouse-position";
import { HeroEffects } from "@/three/effects";

type HeroSceneProps = {
  holdProgress?: number;
  enableEffects?: boolean;
};

function chromeMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#d8d8e0"),
    metalness: 1,
    roughness: 0.18,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.6,
    reflectivity: 1,
  });
}

function extrudeShape(
  build: (shape: THREE.Shape) => void,
  depth = 0.22,
): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  build(shape);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.025,
    bevelSegments: 2,
    curveSegments: 2,
  });
  geo.center();
  return geo;
}

/** Broken logo pieces — each mesh is a fragment of the Mordesu mark */
function useLogoFragments() {
  return useMemo(() => {
    const mat = chromeMaterial();

    // Left vertical of M
    const leftStem = extrudeShape((s) => {
      s.moveTo(-0.9, -1);
      s.lineTo(-0.52, -1);
      s.lineTo(-0.52, 1);
      s.lineTo(-0.9, 1);
      s.closePath();
    });

    // Left diagonal of M
    const leftDiag = extrudeShape((s) => {
      s.moveTo(-0.52, 1);
      s.lineTo(-0.12, 1);
      s.lineTo(0.02, 0.05);
      s.lineTo(-0.28, 0.05);
      s.closePath();
    });

    // Right diagonal of M
    const rightDiag = extrudeShape((s) => {
      s.moveTo(0.12, 1);
      s.lineTo(0.52, 1);
      s.lineTo(0.28, 0.05);
      s.lineTo(-0.02, 0.05);
      s.closePath();
    });

    // Right vertical of M
    const rightStem = extrudeShape((s) => {
      s.moveTo(0.52, -1);
      s.lineTo(0.9, -1);
      s.lineTo(0.9, 1);
      s.lineTo(0.52, 1);
      s.closePath();
    });

    // Bottom-left foot
    const leftFoot = extrudeShape((s) => {
      s.moveTo(-0.9, -1);
      s.lineTo(-0.52, -1);
      s.lineTo(-0.52, -0.35);
      s.lineTo(-0.9, -0.35);
      s.closePath();
    }, 0.2);

    // Bottom-right foot
    const rightFoot = extrudeShape((s) => {
      s.moveTo(0.52, -1);
      s.lineTo(0.9, -1);
      s.lineTo(0.9, -0.35);
      s.lineTo(0.52, -0.35);
      s.closePath();
    }, 0.2);

    // Swoosh as short tube segments
    const swooshCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.95, -0.32, 0.18),
      new THREE.Vector3(-0.35, -0.52, 0.26),
      new THREE.Vector3(0.2, -0.18, 0.3),
      new THREE.Vector3(0.72, 0.22, 0.22),
    ]);
    const swooshA = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(swooshCurve.getPoints(20).slice(0, 10)),
      20,
      0.04,
      8,
      false,
    );
    const swooshB = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(swooshCurve.getPoints(20).slice(9)),
      20,
      0.04,
      8,
      false,
    );

    // Star
    const star = extrudeShape((s) => {
      const spikes = 5;
      const outer = 0.24;
      const inner = 0.1;
      for (let i = 0; i < spikes * 2; i++) {
        const r = i % 2 === 0 ? outer : inner;
        const a = (i * Math.PI) / spikes - Math.PI / 2;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (i === 0) s.moveTo(x, y);
        else s.lineTo(x, y);
      }
      s.closePath();
    }, 0.1);

    type Frag = {
      geometry: THREE.BufferGeometry;
      // rest position + explosion direction
      home: [number, number, number];
      burst: [number, number, number];
      rot: [number, number, number];
      scale?: number;
    };

    const frags: Frag[] = [
      {
        geometry: leftStem,
        home: [-0.12, 0.08, 0],
        burst: [-0.55, 0.15, 0.2],
        rot: [0, 0.15, -0.08],
      },
      {
        geometry: leftDiag,
        home: [-0.08, 0.35, 0.02],
        burst: [-0.35, 0.55, 0.25],
        rot: [0.1, 0, 0.12],
      },
      {
        geometry: rightDiag,
        home: [0.08, 0.35, 0.02],
        burst: [0.35, 0.55, 0.2],
        rot: [-0.1, 0, -0.1],
      },
      {
        geometry: rightStem,
        home: [0.12, 0.08, 0],
        burst: [0.55, 0.1, 0.22],
        rot: [0, -0.15, 0.08],
      },
      {
        geometry: leftFoot,
        home: [-0.12, -0.45, 0],
        burst: [-0.4, -0.55, 0.15],
        rot: [0.12, 0.1, 0],
      },
      {
        geometry: rightFoot,
        home: [0.12, -0.45, 0],
        burst: [0.4, -0.55, 0.15],
        rot: [-0.12, -0.1, 0],
      },
      {
        geometry: swooshA,
        home: [-0.15, -0.15, 0.12],
        burst: [-0.5, -0.35, 0.4],
        rot: [0.2, 0.3, 0.1],
      },
      {
        geometry: swooshB,
        home: [0.25, 0.05, 0.14],
        burst: [0.55, 0.2, 0.45],
        rot: [-0.15, -0.25, 0.15],
      },
      {
        geometry: star,
        home: [0.95, 0.42, 0.2],
        burst: [1.35, 0.85, 0.5],
        rot: [0.3, 0.5, 0.4],
        scale: 1,
      },
    ];

    return { frags, mat };
  }, []);
}

function Fragment({
  geometry,
  home,
  burst,
  rot,
  scale = 1,
  material,
  holdProgress,
  index,
}: {
  geometry: THREE.BufferGeometry;
  home: [number, number, number];
  burst: [number, number, number];
  rot: [number, number, number];
  scale?: number;
  material: THREE.MeshPhysicalMaterial;
  holdProgress: number;
  index: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    const breathe = 0.045 * Math.sin(t * 1.1 + index * 0.7);
    const drift = 0.03 * Math.sin(t * 0.8 + index);
    const p = holdProgress;

    // Base gap between pieces (broken look) + expand on hold
    const gap = 0.22 + p * 0.85;
    mesh.position.x = home[0] + burst[0] * gap + drift;
    mesh.position.y = home[1] + burst[1] * gap + breathe;
    mesh.position.z = home[2] + burst[2] * gap;

    mesh.rotation.x = rot[0] * (0.35 + p) + Math.sin(t * 0.6 + index) * 0.06;
    mesh.rotation.y =
      rot[1] * (0.35 + p) + t * 0.08 * (index % 2 === 0 ? 1 : -1);
    mesh.rotation.z = rot[2] * (0.35 + p);

    const s = scale * (1 + p * 0.12);
    mesh.scale.setScalar(s);
  });

  return <mesh ref={ref} geometry={geometry} material={material} />;
}

function BrokenLogoMark({ holdProgress }: { holdProgress: number }) {
  const group = useRef<THREE.Group>(null);
  const { frags, mat } = useLogoFragments();

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.y = Math.sin(t * 0.25) * 0.18 + holdProgress * 0.25;
    group.current.rotation.x = Math.sin(t * 0.2) * 0.08;
    group.current.position.y = Math.sin(t * 0.7) * 0.06;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.18} floatIntensity={0.35}>
      <group ref={group} scale={1.35}>
        {frags.map((f, i) => (
          <Fragment
            key={i}
            index={i}
            geometry={f.geometry}
            home={f.home}
            burst={f.burst}
            rot={f.rot}
            scale={f.scale}
            material={mat}
            holdProgress={holdProgress}
          />
        ))}
      </group>
    </Float>
  );
}

function CameraRig({ holdProgress }: { holdProgress: number }) {
  const mouse = useMousePosition();
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const z = 3.8 - holdProgress * 0.55;
    target.set(mouse.normalizedX * 0.28, mouse.normalizedY * 0.16, z);
    state.camera.position.lerp(target, 0.05);
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

function Scene({
  holdProgress,
  enableEffects,
}: {
  holdProgress: number;
  enableEffects: boolean;
}) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 5, 4]} intensity={2.8} color="#ffffff" />
      <directionalLight
        position={[-3, -1, 2]}
        intensity={1.1}
        color="#c4b5fd"
      />
      <spotLight
        position={[0, 4, 5]}
        angle={0.45}
        penumbra={0.55}
        intensity={2.8}
        color="#ffffff"
      />
      <pointLight
        position={[2, 1, 2]}
        intensity={1.5}
        color="#e9d5ff"
        distance={10}
      />
      <Environment preset="studio" environmentIntensity={0.85} />
      <BrokenLogoMark holdProgress={holdProgress} />
      <CameraRig holdProgress={holdProgress} />
      {enableEffects ? (
        <HeroEffects holdProgress={holdProgress} enabled />
      ) : null}
    </>
  );
}

export function HeroScene({
  holdProgress = 0,
  enableEffects = true,
}: HeroSceneProps) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 3.8], fov: 40 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.35,
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
      }}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        background: "transparent",
      }}
      aria-hidden
    >
      <Scene holdProgress={holdProgress} enableEffects={enableEffects} />
    </Canvas>
  );
}

export default HeroScene;
