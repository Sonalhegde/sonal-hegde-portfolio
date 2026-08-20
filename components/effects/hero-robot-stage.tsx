"use client";

import { lazy, Suspense, useEffect, useState, useSyncExternalStore } from "react";

const HeroRobot = lazy(() => import("@/components/effects/robot-3d").then((module) => ({ default: module.HeroRobot })));
import { usePrefersReducedMotion } from "@/components/effects/use-prefers-reduced-motion";
import { sitePath } from "@/lib/site-path";
import { SplineScene } from "@/components/ui/splite";

const LIGHTWEIGHT_QUERY = "(hover: none), (pointer: coarse), (max-width: 780px)";

function subscribeLightweight(onStoreChange: () => void) {
  const media = window.matchMedia(LIGHTWEIGHT_QUERY);
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getLightweightSnapshot() {
  return window.matchMedia(LIGHTWEIGHT_QUERY).matches;
}

// Server has no viewport/pointer info. Default to the Spline scene there so the initial
// (pre-hydration) markup matches historical behavior; the very first client render then
// re-evaluates the real media queries and swaps to the lightweight robot on mobile/touch.
function getLightweightServerSnapshot() {
  return false;
}

/**
 * The Spline scene is a large, network-fetched WebGL asset — great on a capable desktop,
 * but a common source of a blank/broken hero on phones and slow connections. This wrapper:
 *  - always renders the lightweight, self-contained Three.js robot on touch/small-viewport
 *    devices, so mobile visitors get a real interactive 3D robot instead of a stuck loader.
 *  - on desktop, tries the richer Spline scene first, and swaps to the Three.js robot the
 *    moment Spline reports a load failure, so the hero is never left empty.
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
      <Suspense fallback={<div className="robot-3d-canvas" aria-hidden="true" />}>
        <HeroRobot />
      </Suspense>
    );
  }

  return <SplineScene scene={sitePath("/hero-robot.splinecode")} className="h-full w-full" />;
}
