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

  useEffect(() => {
    let timer = 0;
    const update = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setCellSize(adaptiveCellSize(window.innerWidth)), 120);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(document.documentElement);
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.clearTimeout(timer);
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
      pfx: {
        ...HERO_ASCII_PRESET.pfx,
        vignette: { enabled: true, intensity: 38 },
        bloom: { enabled: true, intensity: 60 },
        halftone: { enabled: true, intensity: 40 },
      },
    }),
    [cellSize],
  );

  return (
    <div className="site-ascii-backdrop" aria-hidden="true">
      <AsciiArtCanvas
        config={config}
        sourceImage="/ascii-editor/demos/generated/ref-068.webp"
        frameRate={24}
        pauseWhenOffscreen={false}
        className="h-[100dvh] w-[100dvw]"
      />
    </div>
  );
}
