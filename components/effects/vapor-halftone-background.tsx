"use client";

import { useMemo } from "react";

import {
  AsciiArtCanvas,
  type AsciiArtConfig,
} from "@/components/effects/ascii-art-canvas";
import { cn } from "@/lib/utils";

export type VaporBackgroundMode = "blur" | "color" | "photo" | "none";

export type VaporHalftoneConfig = Omit<AsciiArtConfig, "bgMode"> & {
  bgMode: VaporBackgroundMode;
};

type VaporHalftoneOverrides = Partial<Omit<VaporHalftoneConfig, "pfx">> & {
  pfx?: Partial<VaporHalftoneConfig["pfx"]>;
};

export const DEFAULT_VAPOR_HALFTONE_CONFIG: VaporHalftoneConfig = {
  renderMode: "dither",
  bgMode: "blur",
  bgBlur: 12,
  bgOpacity: 90,
  cellSize: 10,
  coverage: 100,
  invert: false,
  styleBlend: "source-over",
  charSet: "standard",
  customChars: "",
  brightness: 0,
  contrast: 115,
  edgeEmphasis: 0,
  density: 0,
  toneCurve: [
    { x: 0, y: 0 },
    { x: 1, y: 1 },
  ],
  tint: "#7c9cff",
  tintOpacity: 22,
  overlayBlend: "soft-light",
  saturation: 100,
  grayscale: 0,
  blurType: "off",
  blurAmount: 35,
  blurAngle: 0,
  directionalBothSides: false,
  tiltFocus: 35,
  tiltPosition: 50,
  tiltFeather: 15,
  lensFocus: 40,
  blurCenterX: 50,
  blurCenterY: 50,
  progressivePosition: 55,
  progressiveReverse: false,
  pfx: {
    vignette: { enabled: true, intensity: 38 },
    scanLines: { enabled: false, intensity: 40 },
    chromatic: { enabled: false, intensity: 15 },
    bloom: { enabled: true, intensity: 60 },
    filmGrain: { enabled: false, intensity: 30 },
    glitch: { enabled: false, intensity: 20 },
    pixelate: { enabled: false, intensity: 15 },
    halftone: { enabled: true, intensity: 40 },
    filmDust: { enabled: false, intensity: 20 },
  },
  animated: true,
  animStyle: "shimmer",
  animSpeed: { enabled: true, intensity: 100 },
  animIntensity: { enabled: true, intensity: 60 },
  lights: { enabled: false, points: [] },
  mask: {
    enabled: false,
    tool: "freehand",
    brushSize: 30,
    showOverlay: false,
    invert: false,
    dataUrl: null,
    shapes: [],
  },
};

const MODE_MAP: Record<VaporBackgroundMode, AsciiArtConfig["bgMode"]> = {
  blur: "blurred",
  color: "solid",
  photo: "photo",
  none: "none",
};

type VaporHalftoneBackgroundProps = {
  imageSrc?: string;
  config?: VaporHalftoneOverrides;
  className?: string;
  frameRate?: number;
};

export function VaporHalftoneBackground({
  imageSrc = "/ascii-editor/demos/generated/ref-068.webp",
  config: overrides,
  className,
  frameRate = 24,
}: VaporHalftoneBackgroundProps) {
  const config = useMemo<AsciiArtConfig>(() => {
    const merged: VaporHalftoneConfig = {
      ...DEFAULT_VAPOR_HALFTONE_CONFIG,
      ...overrides,
      pfx: {
        ...DEFAULT_VAPOR_HALFTONE_CONFIG.pfx,
        ...overrides?.pfx,
      },
    };

    return {
      ...merged,
      bgMode: MODE_MAP[merged.bgMode],
    };
  }, [overrides]);

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      aria-hidden="true"
    >
      <AsciiArtCanvas
        config={config}
        sourceImage={imageSrc}
        frameRate={frameRate}
        pauseWhenOffscreen
        className="absolute inset-0 h-full w-full opacity-70"
      />
    </div>
  );
}
