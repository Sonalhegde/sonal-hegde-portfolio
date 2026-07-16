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
      cellSize,
      bgOpacity: 100,
      tint: "#1e6fff",
      tintOpacity: 42,
      pfx: {
        ...HERO_ASCII_PRESET.pfx,
        vignette: { enabled: true, intensity: 52 },
      },
    }),
    [cellSize],
  );

  return (
    <div className="site-ascii-backdrop" aria-hidden="true">
      <AsciiArtCanvas
        config={config}
        sourceImage="/tower-source.png"
        frameRate={24}
        pauseWhenOffscreen={false}
        className="h-[100dvh] w-[100dvw]"
      />
    </div>
  );
}
