"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

import "./GhostCursor.css";

type GhostCursorProps = {
  color?: string;
  brightness?: number;
  trailLength?: number;
  inertia?: number;
  bloomStrength?: number;
  grainIntensity?: number;
  mixBlendMode?: string;
  maxDevicePixelRatio?: number;
  targetPixels?: number;
};

const grainShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uIntensity: { value: 0.04 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uIntensity;
    varying vec2 vUv;
    float random(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233)) + uTime) * 43758.5453);
    }
    void main() {
      vec4 base = texture2D(tDiffuse, vUv);
      float noise = (random(vUv) - 0.5) * uIntensity;
      gl_FragColor = vec4(base.rgb + noise * base.a, base.a);
    }
  `,
};

export default function GhostCursor({
  color = "#B497CF",
  brightness = 1.1,
  trailLength = 50,
  inertia = 0.55,
  bloomStrength = 0.12,
  grainIntensity = 0.04,
  mixBlendMode = "screen",
  maxDevicePixelRatio = 1.5,
  targetPixels = 1_600_000,
}: GhostCursorProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (reducedMotion || isTouch) return;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.setAttribute("aria-hidden", "true");
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);
    camera.position.z = 1;
    const count = Math.max(12, Math.min(80, Math.round(trailLength)));
    const positions = new Float32Array(count * 3);
    const ages = new Float32Array(count);
    for (let index = 0; index < count; index += 1) ages[index] = index / count;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aAge", new THREE.BufferAttribute(ages, 1));
    const tint = new THREE.Color(color);
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uColor: { value: tint },
        uBrightness: { value: brightness },
        uPixelRatio: { value: 1 },
      },
      vertexShader: `
        attribute float aAge;
        varying float vLife;
        uniform float uPixelRatio;
        void main() {
          vLife = 1.0 - aAge;
          gl_Position = vec4(position, 1.0);
          gl_PointSize = max(2.0, (3.0 + 18.0 * vLife * vLife) * uPixelRatio);
        }
      `,
      fragmentShader: `
        varying float vLife;
        uniform vec3 uColor;
        uniform float uBrightness;
        void main() {
          vec2 point = gl_PointCoord - 0.5;
          float distanceToCenter = length(point);
          float core = smoothstep(0.5, 0.02, distanceToCenter);
          float halo = smoothstep(0.5, 0.12, distanceToCenter) * 0.32;
          float alpha = (core + halo) * pow(vLife, 1.7);
          gl_FragColor = vec4(uColor * uBrightness, alpha);
        }
      `,
    });
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), bloomStrength, 0.42, 0.18);
    composer.addPass(bloom);
    const grain = new ShaderPass(grainShader);
    grain.uniforms.uIntensity.value = grainIntensity;
    composer.addPass(grain);

    let width = window.innerWidth;
    let height = window.innerHeight;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let animationFrame = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const pixelBudgetRatio = Math.sqrt(targetPixels / Math.max(1, width * height));
      const ratio = Math.max(0.75, Math.min(window.devicePixelRatio, maxDevicePixelRatio, pixelBudgetRatio));
      renderer.setPixelRatio(ratio);
      renderer.setSize(width, height, false);
      composer.setPixelRatio(ratio);
      composer.setSize(width, height);
      material.uniforms.uPixelRatio.value = ratio;
    };
    resize();

    const move = (event: PointerEvent) => {
      targetX = (event.clientX / width) * 2 - 1;
      targetY = -((event.clientY / height) * 2 - 1);
    };

    const render = (time: number) => {
      const smoothing = 1 - Math.min(0.94, Math.max(0.08, inertia));
      currentX += (targetX - currentX) * smoothing;
      currentY += (targetY - currentY) * smoothing;
      for (let index = count - 1; index > 0; index -= 1) {
        positions[index * 3] = positions[(index - 1) * 3];
        positions[index * 3 + 1] = positions[(index - 1) * 3 + 1];
      }
      positions[0] = currentX;
      positions[1] = currentY;
      geometry.attributes.position.needsUpdate = true;
      grain.uniforms.uTime.value = time * 0.001;
      composer.render();
      animationFrame = requestAnimationFrame(render);
    };

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });
    animationFrame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      composer.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [bloomStrength, brightness, color, grainIntensity, inertia, maxDevicePixelRatio, targetPixels, trailLength]);

  return (
    <div
      ref={hostRef}
      className="ghost-cursor"
      style={{ zIndex: 10, mixBlendMode: mixBlendMode as React.CSSProperties["mixBlendMode"] }}
      aria-hidden="true"
    />
  );
}
