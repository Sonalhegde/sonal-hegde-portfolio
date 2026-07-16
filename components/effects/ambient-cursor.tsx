"use client";

import type { ComponentType } from "react";
import { useEffect, useState } from "react";

type CursorProps = {
  color?: string;
  brightness?: number;
  trailLength?: number;
  inertia?: number;
  bloomStrength?: number;
  grainIntensity?: number;
  mixBlendMode?: string;
};

export function AmbientCursor() {
  const [Cursor, setCursor] = useState<ComponentType<CursorProps> | null>(null);

  useEffect(() => {
    if (
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let cancelled = false;
    const load = () => {
      void import("@/components/ui/GhostCursor").then((module) => {
        if (!cancelled) setCursor(() => module.default);
      });
    };
    const idle = window.requestIdleCallback?.(load, { timeout: 1200 });
    const timer = idle === undefined ? window.setTimeout(load, 400) : undefined;

    return () => {
      cancelled = true;
      if (idle !== undefined) window.cancelIdleCallback?.(idle);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, []);

  if (!Cursor) return null;
  return (
    <Cursor
      color="#B497CF"
      brightness={1.1}
      trailLength={50}
      inertia={0.55}
      bloomStrength={0.12}
      grainIntensity={0.04}
      mixBlendMode="screen"
    />
  );
}
