"use client";

import { lazy, Suspense, useEffect, useState, useSyncExternalStore } from "react";

import { usePrefersReducedMotion } from "@/components/effects/use-prefers-reduced-motion";
import { sitePath } from "@/lib/site-path";
import { RobotLoader } from "@/components/effects/robot-loader";
import { SplineScene } from "@/components/ui/splite";

const HeroRobot = lazy(() => import("@/components/effects/robot-3d").then((module) => ({ default: module.HeroRobot })));

const LIGHTWEIGHT_QUERY = "(hover: none), (pointer: coarse), (max-width: 780px)";

function subscribeLightweight(onStoreChange: () => void) {
  const media = window.matchMedia(LIGHTWEIGHT_QUERY);
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getLightweightSnapshot() {
  return window.matchMedia(LIGHTWEIGHT_QUERY).matches;
}

// Server has no viewport/pointer info. Default to the Spline scene there so the
// initial (pre-hydration) markup is stable; the first client render then
// re-evaluates the real media queries and swaps to the lightweight robot on
// mobile/touch.
function getLightweightServerSnapshot() {
  return false;
}

/**
 * Restored robot selection: the Spline scene on capable desktops, and the
 * Three.js robot on touch devices, small viewports, and reduced-motion —
 * the same split as before the lite-mode experiment. The robot loader
 * (silhouette shimmer) shows while either lazy chunk arrives.
 */
export function HeroRobotStage() {
  const reducedMotion = usePrefersReducedMotion();
  const preferLightweight = useSyncExternalStore(
    subscribeLightweight,
    getLightweightSnapshot,
    getLightweightServerSnapshot,
  );
  const [splineFailed, setSplineFailed] = useState(false);

  useEffect(() => {
    const onError = () => setSplineFailed(true);
    window.addEventListener("spline-error", onError);
    return () => window.removeEventListener("spline-error", onError);
  }, []);

  const useLightweightRobot = reducedMotion || preferLightweight || splineFailed;

  if (useLightweightRobot) {
    return (
      <Suspense fallback={<RobotLoader />}>
        <HeroRobot />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<RobotLoader />}>
      <SplineScene scene={sitePath("/hero-robot.splinecode")} className="h-full w-full" />
    </Suspense>
  );
}
