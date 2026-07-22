"use client";

import type { Application, SPEObject } from "@splinetool/runtime";
import { Component, Suspense, lazy, useCallback, useEffect, useRef, type ReactNode } from "react";

const Spline = lazy(() => import("@splinetool/react-spline"));

interface SplineSceneProps {
  scene: string;
  className?: string;
}

function SceneLoader() {
  return (
    <div className="flex h-full w-full items-center justify-center" aria-hidden="true">
      <span className="loader" />
    </div>
  );
}

function SceneUnavailable() {
  return (
    <div className="flex h-full w-full items-center justify-center px-6 text-center" role="status">
      <p className="max-w-xs font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500">
        Interactive 3D scene unavailable
      </p>
    </div>
  );
}

class SplineErrorBoundary extends Component<
  { children: ReactNode; scene: string },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    console.error("Spline scene failed to load", error);
    window.dispatchEvent(new Event("spline-error"));
  }

  componentDidUpdate(previous: Readonly<{ children: ReactNode; scene: string }>) {
    if (previous.scene !== this.props.scene && this.state.failed) {
      this.setState({ failed: false });
    }
  }

  render() {
    return this.state.failed ? <SceneUnavailable /> : this.props.children;
  }
}

type Rotation = { x: number; y: number; z: number };

const HEAD_TOKENS = ["head", "helmet", "face", "visor"];
const TORSO_TOKENS = ["torso", "chest", "body", "shoulder"];

function findTrackedObject(objects: SPEObject[], tokens: string[], excluded?: SPEObject) {
  return objects.find((object) => {
    if (object === excluded) return false;
    const name = object.name.toLowerCase();
    return tokens.some((token) => name === token || name.includes(token));
  });
}

function copyRotation(object?: SPEObject): Rotation | null {
  return object ? { x: object.rotation.x, y: object.rotation.y, z: object.rotation.z } : null;
}

function InteractiveSpline({ scene, className }: SplineSceneProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const headRef = useRef<SPEObject | null>(null);
  const torsoRef = useRef<SPEObject | null>(null);
  const headBaseRef = useRef<Rotation | null>(null);
  const torsoBaseRef = useRef<Rotation | null>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0, torsoX: 0, torsoY: 0, parallaxX: 0, parallaxY: 0 });
  const sizeRef = useRef({ width: 0, height: 0 });
  const wakeTrackingRef = useRef<(() => void) | null>(null);

  const handleLoad = useCallback((app: Application) => {
    appRef.current = app;
    const { width, height } = sizeRef.current;
    if (width && height) app.setSize(width, height);
    const objects = app.getAllObjects();
    const objectNames = objects.map((object) => object.name).filter(Boolean);

    console.info(`[Spline] scene objects: ${objectNames.join(", ")}`);
    headRef.current = findTrackedObject(objects, HEAD_TOKENS) ?? null;
    torsoRef.current = findTrackedObject(objects, TORSO_TOKENS, headRef.current ?? undefined) ?? null;
    console.info("[Spline] tracking targets:", {
      head: headRef.current?.name ?? "not found",
      torso: torsoRef.current?.name ?? "not found",
    });
    headBaseRef.current = copyRotation(headRef.current ?? undefined);
    torsoBaseRef.current = copyRotation(torsoRef.current ?? undefined);
    app.requestRender();
    wakeTrackingRef.current?.();
    window.dispatchEvent(new Event("spline-ready"));
  }, []);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touchOnlyDevice = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    let frame = 0;
    let lastTick = 0;
    let pointerActiveUntil = 0;
    let inViewport = true;
    let resizeTimer = 0;

    const resizeScene = (width: number, height: number) => {
      sizeRef.current = { width, height };
      const app = appRef.current;
      if (!app || width < 2 || height < 2) return;
      app.setSize(width, height);
      app.requestRender();
    };
    const resizeObserver = new ResizeObserver(([entry]) => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => resizeScene(
        Math.round(entry.contentRect.width),
        Math.round(entry.contentRect.height),
      ), 120);
    });
    resizeObserver.observe(shell);

    if (reducedMotion || touchOnlyDevice) {
      return () => {
        resizeObserver.disconnect();
        window.clearTimeout(resizeTimer);
        appRef.current = null;
      };
    }

    const canAnimate = () => inViewport && !document.hidden;
    const stopTracking = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
    };

    const onPointerMove = (event: PointerEvent) => {
      targetRef.current.x = Math.max(-1, Math.min(1, (event.clientX / window.innerWidth) * 2 - 1));
      targetRef.current.y = Math.max(-1, Math.min(1, (event.clientY / window.innerHeight) * 2 - 1));
      pointerActiveUntil = performance.now() + 700;
      wakeTrackingRef.current?.();
    };
    const resetTarget = () => {
      targetRef.current.x = 0;
      targetRef.current.y = 0;
      pointerActiveUntil = performance.now() + 500;
      wakeTrackingRef.current?.();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("blur", resetTarget);

    const tick = () => {
      const now = performance.now();
      if (!canAnimate()) {
        frame = 0;
        return;
      }
      if (now - lastTick < 1000 / 30) {
        frame = window.requestAnimationFrame(tick);
        return;
      }
      lastTick = now;
      const target = targetRef.current;
      const current = currentRef.current;

      current.x += (target.x - current.x) * 0.08;
      current.y += (target.y - current.y) * 0.08;
      current.torsoX += (target.x - current.torsoX) * 0.045;
      current.torsoY += (target.y - current.torsoY) * 0.045;
      current.parallaxX += (target.x * 7 - current.parallaxX) * 0.06;
      current.parallaxY += (target.y * 5 - current.parallaxY) * 0.06;

      const head = headRef.current;
      const headBase = headBaseRef.current;
      if (head && headBase) {
        head.rotation.y = headBase.y + current.x * (Math.PI / 9);
        head.rotation.x = headBase.x - current.y * (Math.PI / 18);
      }

      const torso = torsoRef.current;
      const torsoBase = torsoBaseRef.current;
      if (torso && torsoBase && torso !== head) {
        torso.rotation.y = torsoBase.y + current.torsoX * (Math.PI / 24);
        torso.rotation.x = torsoBase.x - current.torsoY * (Math.PI / 36);
      }

      shell.style.transform = `translate3d(${current.parallaxX}px, ${current.parallaxY}px, 0)`;
      appRef.current?.requestRender();
      const settled = Math.abs(current.x - target.x) + Math.abs(current.y - target.y) < 0.002;
      frame = !settled || now < pointerActiveUntil ? window.requestAnimationFrame(tick) : 0;
    };

    const wakeTracking = () => {
      if (canAnimate() && frame === 0) frame = window.requestAnimationFrame(tick);
    };
    wakeTrackingRef.current = wakeTracking;

    const observer = new IntersectionObserver(([entry]) => {
      inViewport = entry.isIntersecting;
      const app = appRef.current;
      if (inViewport && !document.hidden) {
        app?.play();
        wakeTracking();
      } else {
        app?.stop();
        stopTracking();
      }
    }, { threshold: 0.1 });
    observer.observe(shell);

    const onVisibilityChange = () => {
      const app = appRef.current;
      if (document.hidden) {
        app?.stop();
        stopTracking();
      } else if (inViewport) {
        app?.play();
        wakeTracking();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      window.clearTimeout(resizeTimer);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("blur", resetTarget);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      stopTracking();
      wakeTrackingRef.current = null;
      if (headRef.current && headBaseRef.current) Object.assign(headRef.current.rotation, headBaseRef.current);
      if (torsoRef.current && torsoBaseRef.current) Object.assign(torsoRef.current.rotation, torsoBaseRef.current);
      shell.style.transform = "";
      appRef.current = null;
    };
  }, []);

  return (
    <div ref={shellRef} className="spline-stage h-full w-full will-change-transform" aria-label="Interactive 3D robot scene">
      <Spline scene={scene} className={className} onLoad={handleLoad} renderOnDemand />
    </div>
  );
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  return (
    <SplineErrorBoundary scene={scene}>
      <Suspense fallback={<SceneLoader />}>
        <InteractiveSpline scene={scene} className={className} />
      </Suspense>
    </SplineErrorBoundary>
  );
}
