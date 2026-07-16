"use client";

import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { useEffect, useRef } from "react";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function Robot3D() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = window.matchMedia("(pointer: coarse)");
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0.2, 7.1);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.22;
    renderer.domElement.className = "h-full w-full";
    renderer.domElement.setAttribute("aria-hidden", "true");
    mount.appendChild(renderer.domElement);

    const shell = new THREE.MeshPhysicalMaterial({
      color: 0x8d9bb2,
      metalness: 0.88,
      roughness: 0.25,
      clearcoat: 0.72,
      clearcoatRoughness: 0.18,
    });
    const darkMetal = new THREE.MeshStandardMaterial({
      color: 0x111827,
      metalness: 0.92,
      roughness: 0.3,
    });
    const visor = new THREE.MeshPhysicalMaterial({
      color: 0x030711,
      metalness: 0.58,
      roughness: 0.16,
      transmission: 0.08,
      clearcoat: 1,
    });
    const cyan = new THREE.MeshStandardMaterial({
      color: 0xc3f4ff,
      emissive: 0x62cdec,
      emissiveIntensity: 2.2,
      toneMapped: false,
    });
    const violet = new THREE.MeshStandardMaterial({
      color: 0xb497cf,
      emissive: 0x7f4fb0,
      emissiveIntensity: 2.5,
      toneMapped: false,
    });
    const pupilMaterial = new THREE.MeshStandardMaterial({
      color: 0x05070c,
      roughness: 0.18,
      metalness: 0.66,
    });

    const robot = new THREE.Group();
    robot.rotation.y = -0.18;
    scene.add(robot);

    const torso = new THREE.Mesh(new RoundedBoxGeometry(2.05, 2.15, 1.08, 6, 0.23), shell);
    torso.position.y = -1.22;
    robot.add(torso);

    const chest = new THREE.Mesh(new RoundedBoxGeometry(1.28, 0.82, 0.18, 5, 0.14), darkMetal);
    chest.position.set(0, -1.16, 0.61);
    robot.add(chest);
    const core = new THREE.Mesh(new THREE.RingGeometry(0.19, 0.31, 40), violet);
    core.position.set(0, -1.14, 0.72);
    robot.add(core);
    const coreLens = new THREE.Mesh(new THREE.CircleGeometry(0.12, 32), cyan);
    coreLens.position.set(0, -1.14, 0.735);
    robot.add(coreLens);

    const headPivot = new THREE.Group();
    headPivot.position.set(0, 0.38, 0.02);
    robot.add(headPivot);
    const head = new THREE.Mesh(new RoundedBoxGeometry(2.48, 1.75, 1.26, 7, 0.34), shell);
    headPivot.add(head);
    const faceplate = new THREE.Mesh(new RoundedBoxGeometry(1.92, 1.02, 0.18, 6, 0.24), visor);
    faceplate.position.z = 0.69;
    headPivot.add(faceplate);

    const pupils: THREE.Mesh[] = [];
    [-0.46, 0.46].forEach((x) => {
      const eye = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.38, 0.13, 5, 0.16), cyan);
      eye.position.set(x, 0.16, 0.81);
      headPivot.add(eye);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.105, 24, 20), pupilMaterial);
      pupil.position.set(x, 0.16, 0.93);
      pupil.userData.baseX = x;
      pupil.userData.baseY = 0.16;
      headPivot.add(pupil);
      pupils.push(pupil);
    });

    const mouthRail = new THREE.Mesh(new RoundedBoxGeometry(0.96, 0.13, 0.09, 4, 0.05), darkMetal);
    mouthRail.position.set(0, -0.42, 0.81);
    headPivot.add(mouthRail);
    for (let index = -2; index <= 2; index += 1) {
      const light = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 10), violet);
      light.position.set(index * 0.16, -0.42, 0.88);
      headPivot.add(light);
    }

    const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.72, 14), darkMetal);
    antenna.position.set(0, 1.18, 0);
    headPivot.add(antenna);
    const antennaLight = new THREE.Mesh(new THREE.SphereGeometry(0.105, 20, 16), violet);
    antennaLight.position.set(0, 1.58, 0);
    headPivot.add(antennaLight);

    const shoulderJoints: THREE.Group[] = [];
    [-1, 1].forEach((side) => {
      const shoulder = new THREE.Group();
      shoulder.position.set(side * 1.22, -0.62, 0);
      robot.add(shoulder);
      shoulderJoints.push(shoulder);
      const joint = new THREE.Mesh(new THREE.SphereGeometry(0.31, 28, 22), darkMetal);
      shoulder.add(joint);
      const arm = new THREE.Mesh(new RoundedBoxGeometry(0.42, 1.28, 0.52, 5, 0.2), shell);
      arm.position.y = -0.78;
      arm.rotation.z = side * -0.08;
      shoulder.add(arm);
    });

    const floorGlow = new THREE.Mesh(
      new THREE.CircleGeometry(1.8, 64),
      new THREE.MeshBasicMaterial({ color: 0x1e6fff, transparent: true, opacity: 0.09 }),
    );
    floorGlow.rotation.x = -Math.PI / 2;
    floorGlow.position.set(0, -2.46, -0.35);
    scene.add(floorGlow);

    scene.add(new THREE.HemisphereLight(0xc3f4ff, 0x06070c, 1.55));
    const key = new THREE.DirectionalLight(0xffffff, 4.2);
    key.position.set(-3, 4, 5);
    scene.add(key);
    const rim = new THREE.PointLight(0x1e6fff, 26, 14, 2);
    rim.position.set(3.2, 1.2, 1.8);
    scene.add(rim);
    const violetLight = new THREE.PointLight(0xb497cf, 18, 9, 2);
    violetLight.position.set(-2.8, -1.2, 2.2);
    scene.add(violetLight);

    const pointerTarget = new THREE.Vector2(0, 0);
    const pointerCurrent = new THREE.Vector2(0, 0);
    let pointerSeen = false;
    let visible = true;
    let documentVisible = !document.hidden;
    let frame = 0;
    const startedAt = performance.now();

    const onPointerMove = (event: PointerEvent) => {
      if (reducedMotion.matches || coarsePointer.matches) return;
      const rect = mount.getBoundingClientRect();
      pointerSeen = true;
      pointerTarget.set(
        clamp(((event.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1, -1, 1),
        clamp(-(((event.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1), -1, 1),
      );
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    }, { rootMargin: "120px" });
    observer.observe(mount);

    const onVisibilityChange = () => {
      documentVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    const resize = new ResizeObserver(([entry]) => {
      const width = Math.max(1, Math.round(entry.contentRect.width));
      const height = Math.max(1, Math.round(entry.contentRect.height));
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarsePointer.matches ? 1.15 : 1.6));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    });
    resize.observe(mount);

    const render = (now: number) => {
      frame = requestAnimationFrame(render);
      if (!visible || !documentVisible) return;
      const elapsed = (now - startedAt) / 1000;

      if (reducedMotion.matches) {
        pointerTarget.set(0, 0);
      } else if (coarsePointer.matches || !pointerSeen) {
        pointerTarget.set(Math.sin(elapsed * 0.56) * 0.58, Math.sin(elapsed * 0.39 + 0.8) * 0.32);
      }
      pointerCurrent.lerp(pointerTarget, 0.15);

      const pupilX = pointerCurrent.x * 0.085;
      const pupilY = pointerCurrent.y * 0.07;
      pupils.forEach((pupil) => {
        pupil.position.x = pupil.userData.baseX + pupilX;
        pupil.position.y = pupil.userData.baseY + pupilY;
      });
      headPivot.rotation.y = pointerCurrent.x * 0.24;
      headPivot.rotation.x = -pointerCurrent.y * 0.13;
      headPivot.rotation.z = -pointerCurrent.x * 0.035;

      if (!reducedMotion.matches) {
        robot.position.y = Math.sin(elapsed * 1.05) * 0.065;
        robot.rotation.z = Math.sin(elapsed * 0.72) * 0.012;
        shoulderJoints[0].rotation.z = Math.sin(elapsed * 0.83) * 0.035;
        shoulderJoints[1].rotation.z = -Math.sin(elapsed * 0.83) * 0.035;
        const pulse = 1 + Math.sin(elapsed * 3.2) * 0.14;
        antennaLight.scale.setScalar(pulse);
        coreLens.scale.setScalar(1 + Math.sin(elapsed * 2.3) * 0.08);
      }
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      observer.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();
      });
      [shell, darkMetal, visor, cyan, violet, pupilMaterial].forEach((material) => material.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="robot-3d-canvas"
      role="img"
      aria-label="A three-dimensional robot whose eyes and head follow the pointer"
    />
  );
}
