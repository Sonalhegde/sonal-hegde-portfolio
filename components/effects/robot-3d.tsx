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

function RobotScene({
  reducedMotion,
  lowEnd,
  waveSignal,
  touchTarget,
  lightTheme,
}: {
  reducedMotion: boolean;
  lowEnd: boolean;
  waveSignal: number;
  touchTarget: { x: number; y: number } | null;
  lightTheme: boolean;
}) {
  const rootRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const eyeMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const pointerTarget = useRef(new THREE.Vector2());
  const coarsePointer = useRef(false);
  const waveState = useRef({ active: false, t: 0, lastSignal: 0 });
  const blinkState = useRef({ next: 0, phase: 0 });
  const blinkInitialized = useRef(false);
  const lastPointerActivity = useRef(0);

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
    if (touchTarget) pointerTarget.current.set(touchTarget.x, touchTarget.y);
    else if (coarsePointer.current) pointerTarget.current.set(0, 0);
  }, [touchTarget]);

  useEffect(() => {
    const media = window.matchMedia("(pointer: coarse)");
    const updatePointerType = () => {
      coarsePointer.current = media.matches;
      if (media.matches) pointerTarget.current.set(0, 0);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (reducedMotion || coarsePointer.current) return;
      lastPointerActivity.current = performance.now();
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
    // After ~4s without pointer movement the robot drifts into a wandering
    // "look around" glance instead of holding the last cursor position.
    const pointerIdle = performance.now() - lastPointerActivity.current > 4000;
    const idleWanderX = Math.sin(elapsed * 0.24) * 0.42 + Math.sin(elapsed * 0.11) * 0.2;
    const idleWanderY = Math.sin(elapsed * 0.17 + 1.3) * 0.18;
    const glanceX = pointerIdle || reducedMotion ? (reducedMotion ? 0 : idleWanderX) : pointerTarget.current.x;
    const glanceY = pointerIdle || reducedMotion ? (reducedMotion ? 0 : idleWanderY) : pointerTarget.current.y;
    const idleYaw = reducedMotion ? 0 : Math.sin(elapsed * 0.32) * 0.025;
    const idlePitch = reducedMotion ? 0 : Math.sin(elapsed * 0.41) * 0.012;

    head.rotation.y = THREE.MathUtils.damp(head.rotation.y, glanceX * HEAD_YAW + idleYaw, 4, delta);
    head.rotation.x = THREE.MathUtils.damp(head.rotation.x, -glanceY * HEAD_PITCH + idlePitch, 4, delta);
    head.rotation.z = THREE.MathUtils.damp(head.rotation.z, -glanceX * 0.025, 4.5, delta);
    root.position.y = reducedMotion ? 0 : Math.sin(elapsed * 0.86) * 0.035;
    root.rotation.y = THREE.MathUtils.damp(root.rotation.y, -glanceX * 0.035, 2.6, delta);
    root.rotation.z = THREE.MathUtils.damp(
      root.rotation.z,
      reducedMotion ? 0 : Math.sin(elapsed * 0.55) * 0.008 + glanceX * 0.012,
      2.6,
      delta,
    );

    // Tap / click triggered wave gesture on the right arm.
    if (waveSignal !== waveState.current.lastSignal) {
      waveState.current.lastSignal = waveSignal;
      waveState.current.active = true;
      waveState.current.t = 0;
    }
    const arm = rightArmRef.current;
    if (arm) {
      if (waveState.current.active && !reducedMotion) {
        waveState.current.t += delta;
        const duration = 1.5;
        const progress = Math.min(waveState.current.t / duration, 1);
        const lift = Math.sin(progress * Math.PI) * 2.05;
        const wag = progress > 0.18 ? Math.sin(elapsed * 9) * 0.3 * Math.sin(progress * Math.PI) : 0;
        arm.rotation.z = THREE.MathUtils.damp(arm.rotation.z, lift, 6, delta);
        arm.rotation.x = THREE.MathUtils.damp(arm.rotation.x, wag, 6, delta);
        if (progress >= 1) waveState.current.active = false;
      } else {
        arm.rotation.z = THREE.MathUtils.damp(arm.rotation.z, 0, 4, delta);
        arm.rotation.x = THREE.MathUtils.damp(arm.rotation.x, 0, 4, delta);
      }
    }

    // Idle blink of the visor light strip.
    if (!reducedMotion) {
      if (!blinkInitialized.current) {
        blinkInitialized.current = true;
        blinkState.current.next = 3 + Math.random() * 3;
      }
      blinkState.current.next -= delta;
      if (blinkState.current.next <= 0 && blinkState.current.phase === 0) {
        blinkState.current.phase = 1;
        blinkState.current.next = 0.12;
      } else if (blinkState.current.phase === 1 && blinkState.current.next <= 0) {
        blinkState.current.phase = 0;
        blinkState.current.next = 3 + Math.random() * 4;
      }
      const dim = blinkState.current.phase === 1 ? 0.15 : 4.2;
      for (const material of eyeMaterialsRef.current) {
        material.emissiveIntensity = THREE.MathUtils.damp(material.emissiveIntensity, dim, 10, delta);
      }
    }
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
              <meshStandardMaterial
                ref={(material) => {
                  if (material && !eyeMaterialsRef.current.includes(material)) {
                    eyeMaterialsRef.current.push(material);
                  }
                }}
                color="#f4fbff"
                emissive="#c3f4ff"
                emissiveIntensity={4.2}
                toneMapped={false}
              />
            </mesh>
          ))}
        </group>

        <mesh position={[0, 1.48, 0]} material={jointMaterial}>
          <cylinderGeometry args={[0.2, 0.24, 0.42, 24]} />
        </mesh>
        <RoundedBox args={[1.48, 1.78, 0.72]} radius={0.34} smoothness={8} position={[0, 0.62, 0]} material={bodyMaterial} castShadow />

        {([-1, 1] as const).map((side) => {
          const shoulder: [number, number, number] = [side * 0.96, 1.13, 0];
          const armBody = (
            <>
              <group position={shoulder} rotation={[0, 0, side * -0.13]}>
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
            </>
          );

          if (side === 1) {
            // Right arm gets a shoulder-anchored pivot group so the wave gesture rotates naturally.
            return (
              <group key={side} position={shoulder} ref={rightArmRef}>
                <group position={[-shoulder[0], -shoulder[1], -shoulder[2]]}>{armBody}</group>
              </group>
            );
          }
          return <group key={side}>{armBody}</group>;
        })}

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
        <meshStandardMaterial
          color={lightTheme ? "#d3d8e2" : "#05070d"}
          roughness={lightTheme ? 0.85 : 0.68}
          metalness={0.15}
          transparent
          opacity={lightTheme ? 0.55 : 0.78}
        />
      </mesh>

      <ambientLight color="#a9c8ff" intensity={0.42} />
      <hemisphereLight args={["#889eff", lightTheme ? "#eef1f6" : "#03040a", 1.05]} />
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

export function HeroRobot({ readyEventName = "hero-scene-ready" }: { readyEventName?: string } = {}) {
  const reducedMotion = usePrefersReducedMotion();
  const [containerRef, inView] = useElementInView<HTMLDivElement>();
  const [lowEnd, setLowEnd] = useState(false);
  const [waveSignal, setWaveSignal] = useState(0);
  const [touchTarget, setTouchTarget] = useState<{ x: number; y: number } | null>(null);
  const [hovering, setHovering] = useState(false);
  const [lightTheme, setLightTheme] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const update = () => setLightTheme(root.dataset.theme === "light");
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const device = navigator as Navigator & { deviceMemory?: number };
    const timer = window.setTimeout(() => setLowEnd(
      (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4) ||
      (device.deviceMemory !== undefined && device.deviceMemory <= 4),
    ), 0);
    return () => window.clearTimeout(timer);
  }, []);

  // Robot renders synchronously (no external asset to fetch), so it's ready immediately —
  // this lets the site preloader dismiss right away rather than waiting on a network scene.
  useEffect(() => {
    window.dispatchEvent(new Event(readyEventName));
  }, [readyEventName]);

  const triggerWave = () => setWaveSignal((value) => value + 1);
  const updateTouchTarget = (event: { clientX: number; clientY: number }) => {
    if (reducedMotion) return;
    setTouchTarget({
      x: THREE.MathUtils.clamp((event.clientX / window.innerWidth) * 2 - 1, -1, 1),
      y: THREE.MathUtils.clamp(1 - (event.clientY / window.innerHeight) * 2, -1, 1),
    });
  };

  return (
    <div
      ref={containerRef}
      className={`robot-3d-canvas${hovering ? " is-hover" : ""}${waveSignal > 0 ? " is-waving" : ""}`}
      role="button"
      tabIndex={0}
      aria-label="A full-body glossy humanoid robot. Click or tap to make it wave; its head gently follows your pointer. Drag on touch devices to move its head."
      onClick={triggerWave}
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => setHovering(false)}
      onPointerDown={(event) => {
        if (event.pointerType !== "mouse") {
          updateTouchTarget(event);
          triggerWave();
        }
      }}
      onPointerMove={(event) => {
        if (event.pointerType !== "mouse") updateTouchTarget(event);
      }}
      onPointerUp={() => setTouchTarget(null)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          triggerWave();
        }
      }}
    >
      <span className="robot-stage__sparks" aria-hidden="true">
        {[...Array(8)].map((_, index) => (
          <i key={index} style={{ ["--spark-angle" as string]: `${index * 45}deg` }} />
        ))}
      </span>
      <Canvas
        camera={{ position: [0, -0.22, 9.4], fov: 38, near: 0.1, far: 100 }}
        dpr={[1, lowEnd ? 1.35 : 2]}
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
        <RobotScene reducedMotion={reducedMotion} lowEnd={lowEnd} waveSignal={waveSignal} touchTarget={touchTarget} lightTheme={lightTheme} />
      </Canvas>
    </div>
  );
}

export const Robot3D = HeroRobot;
