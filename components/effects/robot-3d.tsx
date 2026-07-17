"use client";

import { Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import { useElementInView } from "@/components/effects/use-element-in-view";
import { usePrefersReducedMotion } from "@/components/effects/use-prefers-reduced-motion";

const HEAD_YAW = THREE.MathUtils.degToRad(18);
const HEAD_PITCH = THREE.MathUtils.degToRad(9);

function CapsuleSegment({
  position,
  rotation,
  radius,
  length,
  material,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  radius: number;
  length: number;
  material: THREE.Material;
}) {
  return (
    <mesh position={position} rotation={rotation} material={material} castShadow receiveShadow>
      <capsuleGeometry args={[radius, length, 8, 24]} />
    </mesh>
  );
}

function RobotScene({ reducedMotion, lowEnd }: { reducedMotion: boolean; lowEnd: boolean }) {
  const rootRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const pointerTarget = useRef(new THREE.Vector2());
  const coarsePointer = useRef(false);

  const bodyMaterial = useMemo(
    () => new THREE.MeshPhysicalMaterial({
      color: "#080a0f",
      metalness: 0.72,
      roughness: 0.12,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      envMapIntensity: 1.75,
    }),
    [],
  );
  const jointMaterial = useMemo(
    () => new THREE.MeshPhysicalMaterial({
      color: "#11151e",
      metalness: 0.92,
      roughness: 0.2,
      clearcoat: 0.8,
      envMapIntensity: 1.25,
    }),
    [],
  );
  const visorMaterial = useMemo(
    () => new THREE.MeshPhysicalMaterial({
      color: "#02040a",
      metalness: 0.45,
      roughness: 0.06,
      transmission: lowEnd ? 0 : 0.2,
      thickness: 0.35,
      transparent: true,
      opacity: 0.92,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      envMapIntensity: 2.1,
    }),
    [lowEnd],
  );

  useEffect(
    () => () => {
      bodyMaterial.dispose();
      jointMaterial.dispose();
      visorMaterial.dispose();
    },
    [bodyMaterial, jointMaterial, visorMaterial],
  );

  useEffect(() => {
    const media = window.matchMedia("(pointer: coarse)");
    const updatePointerType = () => {
      coarsePointer.current = media.matches;
      if (media.matches) pointerTarget.current.set(0, 0);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (reducedMotion || coarsePointer.current) return;
      pointerTarget.current.set(
        THREE.MathUtils.clamp((event.clientX / window.innerWidth) * 2 - 1, -1, 1),
        THREE.MathUtils.clamp(1 - (event.clientY / window.innerHeight) * 2, -1, 1),
      );
    };

    updatePointerType();
    media.addEventListener("change", updatePointerType);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      media.removeEventListener("change", updatePointerType);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [reducedMotion]);

  useFrame(({ clock }, delta) => {
    const root = rootRef.current;
    const head = headRef.current;
    if (!root || !head) return;

    const elapsed = clock.elapsedTime;
    const cursorX = reducedMotion ? 0 : pointerTarget.current.x;
    const cursorY = reducedMotion ? 0 : pointerTarget.current.y;
    const idleYaw = reducedMotion ? 0 : Math.sin(elapsed * 0.32) * 0.025;
    const idlePitch = reducedMotion ? 0 : Math.sin(elapsed * 0.41) * 0.012;

    head.rotation.y = THREE.MathUtils.damp(head.rotation.y, cursorX * HEAD_YAW + idleYaw, 4, delta);
    head.rotation.x = THREE.MathUtils.damp(head.rotation.x, -cursorY * HEAD_PITCH + idlePitch, 4, delta);
    head.rotation.z = THREE.MathUtils.damp(head.rotation.z, -cursorX * 0.025, 4.5, delta);
    root.position.y = reducedMotion ? 0 : Math.sin(elapsed * 0.86) * 0.035;
    root.rotation.y = THREE.MathUtils.damp(root.rotation.y, -cursorX * 0.035, 2.6, delta);
    root.rotation.z = THREE.MathUtils.damp(
      root.rotation.z,
      reducedMotion ? 0 : Math.sin(elapsed * 0.55) * 0.008 + cursorX * 0.012,
      2.6,
      delta,
    );
  });

  return (
    <>
      <group ref={rootRef} position={[-0.55, 0, 0]} scale={0.92}>
        <group ref={headRef} position={[0, 2.17, 0]}>
          <mesh material={bodyMaterial} scale={[0.76, 0.68, 0.66]} castShadow>
            <sphereGeometry args={[0.78, 48, 36]} />
          </mesh>
          <mesh position={[0, 0.02, 0.48]} material={visorMaterial} scale={[0.61, 0.42, 0.12]}>
            <sphereGeometry args={[0.78, 40, 28]} />
          </mesh>
          {[-2.5, -1.5, -0.5, 0.5, 1.5, 2.5].map((index) => (
            <mesh key={index} position={[index * 0.075, -0.08, 0.585]}>
              <sphereGeometry args={[0.021, 12, 10]} />
              <meshStandardMaterial color="#f4fbff" emissive="#c3f4ff" emissiveIntensity={4.2} toneMapped={false} />
            </mesh>
          ))}
        </group>

        <mesh position={[0, 1.48, 0]} material={jointMaterial}>
          <cylinderGeometry args={[0.2, 0.24, 0.42, 24]} />
        </mesh>
        <RoundedBox args={[1.48, 1.78, 0.72]} radius={0.34} smoothness={8} position={[0, 0.62, 0]} material={bodyMaterial} castShadow />

        {([-1, 1] as const).map((side) => (
          <group key={side}>
            <group position={[side * 0.96, 1.13, 0]} rotation={[0, 0, side * -0.13]}>
              <mesh material={bodyMaterial} scale={[1.1, 0.88, 1]} castShadow>
                <sphereGeometry args={[0.36, 32, 24]} />
              </mesh>
              {[-0.16, -0.08, 0, 0.08, 0.16].map((offset) => (
                <mesh key={offset} position={[side * 0.28, offset, 0]} rotation={[0, Math.PI / 2, 0]} material={jointMaterial}>
                  <torusGeometry args={[0.2, 0.018, 8, 20]} />
                </mesh>
              ))}
            </group>
            <CapsuleSegment position={[side * 1.1, 0.36, 0]} rotation={[0, 0, side * -0.11]} radius={0.27} length={0.75} material={bodyMaterial} />
            <mesh position={[side * 1.18, -0.16, 0]} material={jointMaterial}>
              <sphereGeometry args={[0.25, 28, 20]} />
            </mesh>
            <CapsuleSegment position={[side * 1.23, -0.75, 0.04]} rotation={[side * 0.04, 0, side * -0.06]} radius={0.24} length={0.72} material={bodyMaterial} />
            <group position={[side * 1.27, -1.3, 0.1]} rotation={[0.12, 0, side * -0.06]}>
              <mesh material={bodyMaterial} scale={[0.28, 0.35, 0.22]} castShadow>
                <sphereGeometry args={[1, 28, 20]} />
              </mesh>
              {[0, 1, 2].map((finger) => (
                <mesh key={finger} position={[side * (0.17 + finger * 0.025), -0.1 + finger * 0.075, 0.08]} rotation={[0.35, 0, side * -0.25]} material={jointMaterial}>
                  <capsuleGeometry args={[0.035, 0.17, 5, 10]} />
                </mesh>
              ))}
            </group>
          </group>
        ))}

        <RoundedBox args={[0.82, 0.42, 0.58]} radius={0.18} smoothness={5} position={[0, -0.48, 0]} material={jointMaterial} />

        {([-1, 1] as const).map((side) => (
          <group key={side}>
            <mesh position={[side * 0.34, -0.74, 0]} material={jointMaterial}>
              <sphereGeometry args={[0.25, 28, 20]} />
            </mesh>
            <CapsuleSegment position={[side * 0.37, -1.34, 0]} radius={0.31} length={0.72} material={bodyMaterial} />
            <mesh position={[side * 0.37, -1.92, 0.02]} material={jointMaterial}>
              <sphereGeometry args={[0.29, 28, 20]} />
            </mesh>
            <CapsuleSegment position={[side * 0.37, -2.5, 0.02]} radius={0.29} length={0.72} material={bodyMaterial} />
            <RoundedBox args={[0.58, 0.3, 0.86]} radius={0.14} smoothness={5} position={[side * 0.37, -3.03, 0.19]} material={bodyMaterial} castShadow />
          </group>
        ))}
      </group>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.86, 0]} receiveShadow>
        <circleGeometry args={[2.35, 72]} />
        <meshStandardMaterial color="#05070d" roughness={0.68} metalness={0.15} transparent opacity={0.78} />
      </mesh>

      <ambientLight color="#a9c8ff" intensity={0.42} />
      <hemisphereLight args={["#889eff", "#03040a", 1.05]} />
      <directionalLight color="#fff0e4" intensity={4.3} position={[-4.5, 6, 5]} castShadow />
      <directionalLight color="#526cff" intensity={3.6} position={[5, 2.8, -4]} />
      <pointLight color="#B497CF" intensity={22} distance={10} decay={2} position={[3.4, 1.2, 2.2]} />

      {!lowEnd && (
        <Environment resolution={128} environmentIntensity={0.72}>
          <Lightformer form="rect" intensity={5} color="#ffffff" scale={[4, 4, 1]} position={[-4, 4, 4]} rotation={[0, 0.35, 0]} />
          <Lightformer form="rect" intensity={3} color="#738bff" scale={[3, 5, 1]} position={[4, 1, -3]} rotation={[0, -0.6, 0]} />
          <Lightformer form="ring" intensity={2} color="#B497CF" scale={2.5} position={[0, -1, 4]} />
        </Environment>
      )}
      {!lowEnd && (
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur intensity={0.72} luminanceThreshold={0.82} luminanceSmoothing={0.22} />
        </EffectComposer>
      )}
    </>
  );
}

export function HeroRobot() {
  const reducedMotion = usePrefersReducedMotion();
  const [containerRef, inView] = useElementInView<HTMLDivElement>();
  const [lowEnd, setLowEnd] = useState(false);

  useEffect(() => {
    const device = navigator as Navigator & { deviceMemory?: number };
    const timer = window.setTimeout(() => setLowEnd(
      (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4) ||
      (device.deviceMemory !== undefined && device.deviceMemory <= 4),
    ), 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div ref={containerRef} className="robot-3d-canvas" role="img" aria-label="A full-body glossy humanoid robot whose head gently follows the pointer">
      <Canvas
        camera={{ position: [0, -0.22, 9.4], fov: 38, near: 0.1, far: 100 }}
        dpr={[1, lowEnd ? 1.15 : 1.7]}
        frameloop={inView && !reducedMotion ? "always" : "never"}
        shadows={!lowEnd}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        onCreated={({ gl, invalidate }) => {
          gl.setClearColor(0x000000, 0);
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.24;
          if (reducedMotion) invalidate();
        }}
        performance={{ min: 0.55 }}
      >
        <RobotScene reducedMotion={reducedMotion} lowEnd={lowEnd} />
      </Canvas>
    </div>
  );
}

export const Robot3D = HeroRobot;
