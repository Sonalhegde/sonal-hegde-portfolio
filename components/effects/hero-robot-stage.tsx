"use client";

import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from "react";

import { useDeviceMode } from "@/components/effects/use-device-mode";
import { usePrefersReducedMotion } from "@/components/effects/use-prefers-reduced-motion";
import { sitePath } from "@/lib/site-path";
import { RobotLite } from "@/components/effects/robot-lite";
import { RobotLoader } from "@/components/effects/robot-loader";
import { SplineScene } from "@/components/ui/splite";

const HeroRobot = lazy(() => import("@/components/effects/robot-3d").then((module) => ({ default: module.HeroRobot })));

// Fallback when even the lightweight WebGL robot cannot create a context:
// the pure CSS/SVG robot always renders.
class RobotErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <RobotLite /> : this.props.children;
  }
}

export function HeroRobotStage() {
  const reducedMotion = usePrefersReducedMotion();
  const deviceMode = useDeviceMode();
  const [splineFailed, setSplineFailed] = useState(false);

  useEffect(() => {
    const onError = () => setSplineFailed(true);
    window.addEventListener("spline-error", onError);
    return () => window.removeEventListener("spline-error", onError);
  }, []);

  if (deviceMode === "lite" || reducedMotion) {
    // Lite mode never mounts the 3D chunks — they are code-split behind these
    // lazy imports, so phones download neither Spline nor the WebGL robot.
    return <RobotLite />;
  }

  if (!splineFailed) {
    return (
      <Suspense fallback={<RobotLoader />}>
        <SplineScene scene={sitePath("/hero-robot.splinecode")} className="h-full w-full" />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<RobotLoader />}>
      <RobotErrorBoundary>
        <HeroRobot readyEventName="hero-scene-ready" />
      </RobotErrorBoundary>
    </Suspense>
  );
}
