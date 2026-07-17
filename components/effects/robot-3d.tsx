"use client";

import { RoundedBox } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";
import { useEffect, useRef, useState } from "react";

import { useElementInView } from "@/components/effects/use-element-in-view";
import { usePrefersReducedMotion } from "@/components/effects/use-prefers-reduced-motion";

const HEAD_YAW = THREE.MathUtils.degToRad(20);
const HEAD_PITCH = THREE.MathUtils.degToRad(10);

function RobotScene({ reducedMotion, lowEnd }: { reducedMotion: boolean; lowEnd: boolean }) {
  const rootRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftPupilRef = useRef<THREE.Mesh>(null);
  const rightPupilRef = useRef<THREE.Mesh>(null);
  const antennaRef = useRef<THREE.Group>(null);
  const antennaSphereRef = useRef<THREE.Mesh>(null);
  const pointerTarget = useRef(new THREE.Vector2());
  const coarsePointer = useRef(false);

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
        THREE.MathUtils.clamp(-((event.clientY / window.innerHeight) * 2 - 1), -1, 1),
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
    const leftPupil = leftPupilRef.current;
    const rightPupil = rightPupilRef.current;
    const antenna = antennaRef.current;
    const antennaSphere = antennaSphereRef.current;
    if (!root || !head || !leftPupil || !rightPupil || !antenna || !antennaSphere) return;

    const elapsed = clock.elapsedTime;
    const cursorX = reducedMotion ? 0 : pointerTarget.current.x;
    const cursorY = reducedMotion ? 0 : pointerTarget.current.y;
    const headIdle = Math.sin(elapsed * 0.34) * (reducedMotion ? 0.008 : 0.018);
    const bobAmount = reducedMotion ? 0.022 : 0.065;

    head.rotation.y = THREE.MathUtils.damp(
      head.rotation.y,
      cursorX * HEAD_YAW + headIdle,
      4.2,
      delta,
    );
    head.rotation.x = THREE.MathUtils.damp(
      head.rotation.x,
      -cursorY * HEAD_PITCH + Math.sin(elapsed * 0.42) * 0.01,
      4.2,
      delta,
    );
    head.rotation.z = THREE.MathUtils.damp(head.rotation.z, -cursorX * 0.035, 4.5, delta);

    const pupilX = THREE.MathUtils.clamp(cursorX * 0.09, -0.09, 0.09);
    const pupilY = THREE.MathUtils.clamp(cursorY * 0.065, -0.065, 0.065);
    leftPupil.position.x = THREE.MathUtils.damp(leftPupil.position.x, -0.46 + pupilX, 12, delta);
    rightPupil.position.x = THREE.MathUtils.damp(rightPupil.position.x, 0.46 + pupilX, 12, delta);
    leftPupil.position.y = THREE.MathUtils.damp(leftPupil.position.y, 0.16 + pupilY, 12, delta);
    rightPupil.position.y = THREE.MathUtils.damp(rightPupil.position.y, 0.16 + pupilY, 12, delta);

    root.position.y = Math.sin(elapsed * 1.05) * bobAmount;
    root.rotation.y = THREE.MathUtils.damp(root.rotation.y, -0.18 - cursorX * 0.045, 2.8, delta);
    root.rotation.z = THREE.MathUtils.damp(
      root.rotation.z,
      Math.sin(elapsed * 0.72) * 0.012 + cursorX * 0.018,
      2.8,
      delta,
    );
    antenna.rotation.z = Math.sin(elapsed * 1.15) * (reducedMotion ? 0.012 : 0.035);
    const antennaPulse = 1 + Math.sin(elapsed * 3.2) * (reducedMotion ? 0.04 : 0.12);
    antennaSphere.scale.setScalar(antennaPulse);
  });

  return (
    <>
      <group ref={rootRef} rotation={[0, -0.18, 0]}>
        <RoundedBox args={[2.05, 2.15, 1.08]} radius={0.23} smoothness={6} position={[0, -1.22, 0]}>
          <meshPhysicalMaterial color="#8d9bb2" metalness={0.88} roughness={0.25} clearcoat={0.72} clearcoatRoughness={0.18} />
        </RoundedBox>
        <RoundedBox args={[1.28, 0.82, 0.18]} radius={0.14} smoothness={5} position={[0, -1.16, 0.61]}>
          <meshStandardMaterial color="#111827" metalness={0.92} roughness={0.3} />
        </RoundedBox>
        <mesh position={[0, -1.14, 0.72]}>
          <ringGeometry args={[0.19, 0.31, 40]} />
          <meshStandardMaterial color="#B497CF" emissive="#7f4fb0" emissiveIntensity={3.2} toneMapped={false} />
        </mesh>
        <mesh position={[0, -1.14, 0.735]}>
          <circleGeometry args={[0.12, 32]} />
          <meshStandardMaterial color="#c3f4ff" emissive="#62cdec" emissiveIntensity={3.1} toneMapped={false} />
        </mesh>

        <group ref={headRef} position={[0, 0.38, 0.02]}>
          <RoundedBox args={[2.48, 1.75, 1.26]} radius={0.34} smoothness={7}>
            <meshPhysicalMaterial color="#8d9bb2" metalness={0.88} roughness={0.24} clearcoat={0.8} clearcoatRoughness={0.16} />
          </RoundedBox>
          <RoundedBox args={[1.92, 1.02, 0.18]} radius={0.24} smoothness={6} position={[0, 0, 0.69]}>
            <meshPhysicalMaterial color="#030711" metalness={0.58} roughness={0.16} clearcoat={1} />
          </RoundedBox>

          {[-0.46, 0.46].map((x) => (
            <RoundedBox key={x} args={[0.62, 0.38, 0.13]} radius={0.16} smoothness={5} position={[x, 0.16, 0.81]}>
              <meshStandardMaterial color="#c3f4ff" emissive="#62cdec" emissiveIntensity={3.4} toneMapped={false} />
            </RoundedBox>
          ))}
          <mesh ref={leftPupilRef} position={[-0.46, 0.16, 0.93]}>
            <sphereGeometry args={[0.105, 24, 20]} />
            <meshPhysicalMaterial color="#03050a" metalness={0.7} roughness={0.12} clearcoat={1} />
            <mesh position={[-0.028, 0.032, 0.094]}>
              <sphereGeometry args={[0.018, 12, 10]} />
              <meshBasicMaterial color="#ffffff" toneMapped={false} />
            </mesh>
          </mesh>
          <mesh ref={rightPupilRef} position={[0.46, 0.16, 0.93]}>
            <sphereGeometry args={[0.105, 24, 20]} />
            <meshPhysicalMaterial color="#03050a" metalness={0.7} roughness={0.12} clearcoat={1} />
            <mesh position={[-0.028, 0.032, 0.094]}>
              <sphereGeometry args={[0.018, 12, 10]} />
              <meshBasicMaterial color="#ffffff" toneMapped={false} />
            </mesh>
          </mesh>

          <RoundedBox args={[0.96, 0.13, 0.09]} radius={0.05} smoothness={4} position={[0, -0.42, 0.81]}>
            <meshStandardMaterial color="#111827" metalness={0.92} roughness={0.3} />
          </RoundedBox>
          {[-2, -1, 0, 1, 2].map((index) => (
            <mesh key={index} position={[index * 0.16, -0.42, 0.88]}>
              <sphereGeometry args={[0.035, 12, 10]} />
              <meshStandardMaterial color="#B497CF" emissive="#7f4fb0" emissiveIntensity={2.8} toneMapped={false} />
            </mesh>
          ))}

          <group ref={antennaRef} position={[0, 0.86, 0]}>
            <mesh position={[0, 0.32, 0]}>
              <cylinderGeometry args={[0.025, 0.035, 0.72, 14]} />
              <meshStandardMaterial color="#111827" metalness={0.92} roughness={0.3} />
            </mesh>
            <mesh ref={antennaSphereRef} position={[0, 0.72, 0]}>
              <sphereGeometry args={[0.105, 20, 16]} />
              <meshStandardMaterial color="#B497CF" emissive="#9f5ed4" emissiveIntensity={4.2} toneMapped={false} />
            </mesh>
          </group>
        </group>

        {[-1, 1].map((side) => (
          <group key={side} position={[side * 1.22, -0.62, 0]} rotation={[0, 0, side * -0.08]}>
            <mesh>
              <sphereGeometry args={[0.31, 28, 22]} />
              <meshStandardMaterial color="#111827" metalness={0.92} roughness={0.3} />
            </mesh>
            <RoundedBox args={[0.42, 1.28, 0.52]} radius={0.2} smoothness={5} position={[0, -0.78, 0]}>
              <meshPhysicalMaterial color="#8d9bb2" metalness={0.88} roughness={0.25} clearcoat={0.72} />
            </RoundedBox>
          </group>
        ))}
      </group>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.46, -0.35]}>
        <circleGeometry args={[1.8, 64]} />
        <meshBasicMaterial color="#1e6fff" transparent opacity={0.09} depthWrite={false} />
      </mesh>

      <hemisphereLight args={["#c3f4ff", "#06070c", 1.55]} />
      <directionalLight color="#ffd9bd" intensity={4.2} position={[-3, 4, 5]} />
      <pointLight color="#1e6fff" intensity={26} distance={14} decay={2} position={[3.2, 1.2, 1.8]} />
      <pointLight color="#B497CF" intensity={18} distance={9} decay={2} position={[-2.8, -1.2, 2.2]} />

      {!lowEnd && <EffectComposer multisampling={0}>
        <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.78} luminanceSmoothing={0.24} />
      </EffectComposer>}
    </>
  );
}

export function Robot3D() {
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
    <div
      ref={containerRef}
      className="robot-3d-canvas"
      role="img"
      aria-label="A three-dimensional robot whose eyes and head gently follow the pointer"
    >
      <Canvas
        camera={{ position: [0, 0.2, 7.1], fov: 34, near: 0.1, far: 100 }}
        dpr={[1, lowEnd ? 1.2 : 1.6]}
        frameloop={inView ? "always" : "never"}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.18;
        }}
        performance={{ min: 0.55 }}
      >
        <RobotScene reducedMotion={reducedMotion} lowEnd={lowEnd} />
      </Canvas>
    </div>
  );
}
