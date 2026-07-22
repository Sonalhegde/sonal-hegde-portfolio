"use client";

import { useEffect, useMemo, useState } from "react";

import { AsciiArtCanvas, HERO_ASCII_PRESET } from "@/components/effects/ascii-art-canvas";

function adaptiveCellSize(width: number) {
  // The tower needs deliberately chunky cells to retain the requested
  // screen-printed/dithered character across both phone and desktop sizes.
  return Math.max(14, Math.round(width / 105));
}

export function SiteAsciiBackdrop() {
  const [cellSize, setCellSize] = useState(14);
  const [conserveResources, setConserveResources] = useState(false);
  const [compactViewport, setCompactViewport] = useState(false);

  useEffect(() => {
    let timer = 0;
    const update = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        setCellSize(adaptiveCellSize(window.innerWidth));
        setCompactViewport(window.innerWidth < 768);
      }, 120);
    };
    update();
    const device = navigator as Navigator & { deviceMemory?: number };
    const policyTimer = window.setTimeout(() => setConserveResources(
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4) ||
        (device.deviceMemory !== undefined && device.deviceMemory <= 4),
      ), 0);
    const observer = new ResizeObserver(update);
    observer.observe(document.documentElement);
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(policyTimer);
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  const config = useMemo(
    () => ({
      ...HERO_ASCII_PRESET,
      renderMode: "dither" as const,
      cellSize,
      bgMode: "blurred" as const,
      bgBlur: 12,
      bgOpacity: 90,
      invert: false,
      edgeEmphasis: 0,
      tint: "#7c9cff",
      tintOpacity: 22,
      overlayBlend: "soft-light" as GlobalCompositeOperation,
      animStyle: "shimmer" as const,
      animated: !conserveResources,
      pfx: {
        ...HERO_ASCII_PRESET.pfx,
        vignette: { enabled: true, intensity: 38 },
        // Full-viewport blur and halftone copies are expensive at animation
        // cadence. Dither remains animated; the surrounding glass supplies
        // the perceived glow.
        bloom: { enabled: false, intensity: 0 },
        halftone: { enabled: false, intensity: 0 },
      },
    }),
    [cellSize, conserveResources],
  );

  return (
    <div className="site-ascii-backdrop" aria-hidden="true">
      <AsciiArtCanvas
        config={config}
        sourceImage="/ascii-editor/demos/generated/ref-068.webp"
        frameRate={conserveResources ? 1 : compactViewport ? 12 : 18}
        pauseWhenOffscreen={false}
        className="h-[100dvh] w-[100dvw]"
      />
    </div>
  );
}
