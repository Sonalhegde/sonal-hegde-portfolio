"use client";

import type { ComponentProps } from "react";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

export type AsciiRenderMode =
  | "characters"
  | "dither"
  | "mosaic"
  | "pixel"
  | "dots"
  | "cross"
  | "diamond"
  | "voxel"
  | "lego"
  | "mixed"
  | "lines"
  | "diagonal"
  | "braille"
  | "disco"
  | "hexdump"
  | "matrix"
  | "rings"
  | "hearts"
  | "stars"
  | "hexagons"
  | "triangles"
  | "bubbles"
  | "hatch"
  | "contour"
  | "halfblocks";

type PostEffect = {
  enabled: boolean;
  intensity: number;
};

export interface AsciiArtConfig {
  renderMode: AsciiRenderMode;
  bgMode: "blurred" | "solid" | "photo" | "none";
  bgBlur: number;
  bgOpacity: number;
  cellSize: number;
  coverage: number;
  invert: boolean;
  styleBlend: GlobalCompositeOperation;
  charSet: "standard" | "blocks" | "binary" | "custom" | string;
  customChars: string;
  brightness: number;
  contrast: number;
  edgeEmphasis: number;
  density: number;
  toneCurve: { x: number; y: number }[];
  tint: string;
  tintOpacity: number;
  overlayBlend: GlobalCompositeOperation;
  saturation: number;
  grayscale: number;
  blurType:
    | "off"
    | "gaussian"
    | "directional"
    | "tilt-shift"
    | "lens"
    | "progressive";
  blurAmount: number;
  blurAngle: number;
  directionalBothSides: boolean;
  tiltFocus: number;
  tiltPosition: number;
  tiltFeather: number;
  lensFocus: number;
  blurCenterX: number;
  blurCenterY: number;
  progressivePosition: number;
  progressiveReverse: boolean;
  pfx: Record<
    | "vignette"
    | "scanLines"
    | "chromatic"
    | "bloom"
    | "filmGrain"
    | "glitch"
    | "pixelate"
    | "halftone"
    | "filmDust",
    PostEffect
  >;
  animated: boolean;
  animStyle: "wave" | "pulse" | "shimmer" | "ripple" | "flicker";
  animSpeed: { enabled: boolean; intensity: number };
  animIntensity: { enabled: boolean; intensity: number };
  lights: {
    enabled: boolean;
    points: { x: number; y: number; radius: number; intensity: number }[];
  };
  mask: {
    enabled: boolean;
    tool: string;
    brushSize: number;
    showOverlay: boolean;
    invert: boolean;
    dataUrl: string | null;
    shapes: unknown[];
  };
}

export const HERO_ASCII_PRESET: AsciiArtConfig = {
  renderMode: "dither",
  bgMode: "solid",
  bgBlur: 12,
  bgOpacity: 90,
  cellSize: 14,
  coverage: 100,
  invert: true,
  styleBlend: "source-over",
  charSet: "standard",
  customChars: "",
  brightness: 0,
  contrast: 115,
  edgeEmphasis: 92,
  density: 0,
  toneCurve: [
    { x: 0, y: 0 },
    { x: 1, y: 1 },
  ],
  tint: "#1e6fff",
  tintOpacity: 48,
  overlayBlend: "multiply",
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
    bloom: { enabled: false, intensity: 25 },
    filmGrain: { enabled: false, intensity: 30 },
    glitch: { enabled: false, intensity: 20 },
    pixelate: { enabled: false, intensity: 15 },
    halftone: { enabled: false, intensity: 20 },
    filmDust: { enabled: false, intensity: 20 },
  },
  animated: true,
  animStyle: "flicker",
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

type Props = Omit<ComponentProps<"canvas">, "ref"> & {
  config: AsciiArtConfig;
  sourceImage: string;
  frameRate?: number;
  pauseWhenOffscreen?: boolean;
};

type Rgb = { r: number; g: number; b: number };

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const hash = (x: number, y: number, seed = 0) => {
  const value = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return value - Math.floor(value);
};

const canvas2d = (width: number, height: number) => {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  return canvas;
};

function drawCover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  context.drawImage(
    image,
    (width - drawWidth) / 2,
    (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
}

function rgbString(color: Rgb, alpha = 1) {
  return `rgba(${color.r},${color.g},${color.b},${alpha})`;
}

function drawPolygon(
  context: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  sides: number,
  rotation = -Math.PI / 2,
) {
  context.beginPath();
  for (let index = 0; index < sides; index += 1) {
    const angle = rotation + (index / sides) * Math.PI * 2;
    const px = cx + Math.cos(angle) * radius;
    const py = cy + Math.sin(angle) * radius;
    if (index === 0) context.moveTo(px, py);
    else context.lineTo(px, py);
  }
  context.closePath();
}

function drawHeart(
  context: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
) {
  const top = cy - size * 0.22;
  context.beginPath();
  context.moveTo(cx, cy + size * 0.45);
  context.bezierCurveTo(
    cx - size * 0.72,
    cy,
    cx - size * 0.48,
    top - size * 0.5,
    cx,
    top,
  );
  context.bezierCurveTo(
    cx + size * 0.48,
    top - size * 0.5,
    cx + size * 0.72,
    cy,
    cx,
    cy + size * 0.45,
  );
  context.closePath();
}

function drawStar(
  context: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
) {
  context.beginPath();
  for (let index = 0; index < 10; index += 1) {
    const angle = -Math.PI / 2 + (index / 10) * Math.PI * 2;
    const r = index % 2 === 0 ? radius : radius * 0.42;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.closePath();
}

function toneMap(value: number, curve: AsciiArtConfig["toneCurve"]) {
  const sorted = [...curve].sort((a, b) => a.x - b.x);
  for (let index = 1; index < sorted.length; index += 1) {
    if (value <= sorted[index].x) {
      const before = sorted[index - 1];
      const after = sorted[index];
      const progress = (value - before.x) / Math.max(0.0001, after.x - before.x);
      return clamp(before.y + (after.y - before.y) * progress);
    }
  }
  return clamp(sorted.at(-1)?.y ?? value);
}

function animationMod(
  config: AsciiArtConfig,
  row: number,
  column: number,
  rows: number,
  columns: number,
  time: number,
  pointer: { x: number; y: number },
) {
  if (!config.animated) return { scale: 1, alpha: 1, offsetY: 0 };
  const speed = config.animSpeed.enabled ? config.animSpeed.intensity / 50 : 1;
  const intensity = config.animIntensity.enabled
    ? config.animIntensity.intensity / 100
    : 0.25;
  const t = time * 0.001 * speed;
  if (config.animStyle === "wave") {
    const wave = Math.sin(column * 0.28 + row * 0.08 - t * 2.4);
    return { scale: 1 + wave * intensity * 0.3, alpha: 1, offsetY: wave * intensity * 4 };
  }
  if (config.animStyle === "pulse") {
    const pulse = (Math.sin(t * 2.2) + 1) / 2;
    return { scale: 1 - intensity * 0.15 + pulse * intensity * 0.3, alpha: 0.8 + pulse * 0.2, offsetY: 0 };
  }
  if (config.animStyle === "shimmer") {
    const shimmer = (Math.sin(column * 0.34 + row * 0.16 - t * 3.5) + 1) / 2;
    return { scale: 0.9 + shimmer * intensity * 0.35, alpha: 0.72 + shimmer * 0.28, offsetY: 0 };
  }
  if (config.animStyle === "ripple") {
    const dx = column / columns - pointer.x;
    const dy = row / rows - pointer.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const ripple = Math.sin(distance * 36 - t * 5) * Math.exp(-distance * 1.5);
    return { scale: 1 + ripple * intensity * 0.45, alpha: 0.8 + Math.abs(ripple) * 0.2, offsetY: 0 };
  }
  const frame = Math.floor(t * 12);
  const noise = hash(column, row, frame) * 2 - 1;
  return {
    scale: 1 + noise * intensity * 0.18,
    alpha: clamp(1 + noise * intensity * 0.35, 0.38, 1),
    offsetY: 0,
  };
}

function drawCell(
  context: CanvasRenderingContext2D,
  mode: AsciiRenderMode,
  x: number,
  y: number,
  cell: number,
  amount: number,
  color: Rgb,
  row: number,
  column: number,
  rows: number,
  columns: number,
  time: number,
  config: AsciiArtConfig,
  luminance: Float32Array,
) {
  const centerX = x + cell / 2;
  const centerY = y + cell / 2;
  const size = Math.max(0.4, cell * clamp(amount) * (1 + config.density / 100));
  const fill = rgbString(color);
  context.fillStyle = fill;
  context.strokeStyle = fill;
  context.lineCap = "round";
  context.lineJoin = "round";

  if (mode === "mixed") {
    const mixed: AsciiRenderMode[] = ["dots", "diamond", "cross"];
    return drawCell(
      context,
      mixed[Math.floor(hash(column, row, 11) * mixed.length)],
      x,
      y,
      cell,
      amount,
      color,
      row,
      column,
      rows,
      columns,
      time,
      config,
      luminance,
    );
  }

  if (mode === "characters" || mode === "hexdump" || mode === "braille" || mode === "matrix") {
    let characters = " .:-=+*#%@";
    if (config.charSet === "blocks") characters = " ░▒▓█";
    else if (config.charSet === "binary") characters = "01";
    else if (config.charSet === "custom" && config.customChars) characters = config.customChars;
    else if (!['standard', 'blocks', 'binary', 'custom'].includes(config.charSet)) characters = config.charSet;
    let glyph = characters[Math.min(characters.length - 1, Math.floor(amount * characters.length))] || "·";
    if (mode === "hexdump") glyph = "0123456789ABCDEF"[Math.min(15, Math.floor(amount * 16))];
    if (mode === "braille") {
      let bits = 0;
      for (let dot = 0; dot < 8; dot += 1) {
        if (hash(column * 8 + dot, row, 3) < amount) bits |= 1 << dot;
      }
      glyph = String.fromCharCode(0x2800 + bits);
    }
    if (mode === "matrix") {
      const head = (time * 0.007 + column * 0.67) % rows;
      const distance = (head - row + rows) % rows;
      if (distance > Math.max(4, rows * 0.16)) return;
      glyph = "01<>[]{}#@"[Math.floor(hash(column, row, Math.floor(time / 180)) * 10)];
      context.fillStyle = distance < 1.4 ? "#c3f4ff" : `rgba(118,255,176,${clamp(1 - distance / 9)})`;
    }
    context.font = `${Math.max(7, cell * 0.95)}px ui-monospace, SFMono-Regular, Consolas, monospace`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(glyph, centerX, centerY + cell * 0.04);
    return;
  }

  if (mode === "dither") {
    const threshold = (BAYER[row % 4][column % 4] + 0.5) / 16;
    if (amount > threshold) context.fillRect(x, y, cell + 0.4, cell + 0.4);
    return;
  }

  if (mode === "pixel") {
    context.fillRect(centerX - size / 2, centerY - size / 2, size + 0.25, size + 0.25);
    return;
  }

  if (mode === "mosaic") {
    context.beginPath();
    context.roundRect(centerX - size / 2, centerY - size / 2, size, size, Math.min(3, size * 0.2));
    context.fill();
    return;
  }

  if (mode === "dots" || mode === "bubbles" || mode === "disco") {
    if (mode === "disco") {
      const hue = (time * 0.06 + column * 11 + row * 7) % 360;
      context.fillStyle = `hsla(${hue},88%,64%,${0.45 + amount * 0.55})`;
    }
    context.beginPath();
    context.arc(centerX, centerY, size * 0.5, 0, Math.PI * 2);
    context.fill();
    if (mode === "bubbles") {
      context.strokeStyle = "rgba(255,255,255,.72)";
      context.lineWidth = Math.max(0.5, size * 0.08);
      context.beginPath();
      context.arc(centerX - size * 0.14, centerY - size * 0.14, size * 0.23, Math.PI * 1.05, Math.PI * 1.55);
      context.stroke();
    }
    return;
  }

  if (mode === "cross") {
    context.lineWidth = Math.max(0.7, size * 0.18);
    context.beginPath();
    context.moveTo(centerX - size / 2, centerY);
    context.lineTo(centerX + size / 2, centerY);
    context.moveTo(centerX, centerY - size / 2);
    context.lineTo(centerX, centerY + size / 2);
    context.stroke();
    return;
  }

  if (mode === "diamond") {
    context.save();
    context.translate(centerX, centerY);
    context.rotate(Math.PI / 4);
    context.fillRect(-size * 0.36, -size * 0.36, size * 0.72, size * 0.72);
    context.restore();
    return;
  }

  if (mode === "voxel") {
    const half = size * 0.38;
    context.fillStyle = rgbString({ r: Math.min(255, color.r + 35), g: Math.min(255, color.g + 35), b: Math.min(255, color.b + 35) });
    context.beginPath();
    context.moveTo(centerX, centerY - half);
    context.lineTo(centerX + half, centerY - half * 0.45);
    context.lineTo(centerX, centerY);
    context.lineTo(centerX - half, centerY - half * 0.45);
    context.closePath();
    context.fill();
    context.fillStyle = fill;
    context.beginPath();
    context.moveTo(centerX - half, centerY - half * 0.45);
    context.lineTo(centerX, centerY);
    context.lineTo(centerX, centerY + half);
    context.lineTo(centerX - half, centerY + half * 0.45);
    context.closePath();
    context.fill();
    context.fillStyle = rgbString({ r: color.r * 0.55, g: color.g * 0.55, b: color.b * 0.55 });
    context.beginPath();
    context.moveTo(centerX + half, centerY - half * 0.45);
    context.lineTo(centerX, centerY);
    context.lineTo(centerX, centerY + half);
    context.lineTo(centerX + half, centerY + half * 0.45);
    context.closePath();
    context.fill();
    return;
  }

  if (mode === "lego") {
    context.beginPath();
    context.roundRect(centerX - size / 2, centerY - size / 2, size, size, size * 0.16);
    context.fill();
    context.fillStyle = "rgba(255,255,255,.38)";
    context.beginPath();
    context.arc(centerX, centerY - size * 0.08, size * 0.18, 0, Math.PI * 2);
    context.fill();
    return;
  }

  if (mode === "lines" || mode === "diagonal") {
    context.lineWidth = Math.max(0.7, size * 0.13);
    context.beginPath();
    if (mode === "diagonal") {
      context.moveTo(centerX - size / 2, centerY + size / 2);
      context.lineTo(centerX + size / 2, centerY - size / 2);
    } else if (hash(column, row, 4) > 0.5) {
      context.moveTo(centerX, centerY - size / 2);
      context.lineTo(centerX, centerY + size / 2);
    } else {
      context.moveTo(centerX - size / 2, centerY);
      context.lineTo(centerX + size / 2, centerY);
    }
    context.stroke();
    return;
  }

  if (mode === "rings") {
    context.lineWidth = Math.max(0.6, size * 0.09);
    for (let ring = 1; ring <= 2; ring += 1) {
      context.beginPath();
      context.arc(centerX, centerY, (size * ring) / 4, 0, Math.PI * 2);
      context.stroke();
    }
    return;
  }

  if (mode === "hearts") {
    drawHeart(context, centerX, centerY, size);
    context.fill();
    return;
  }

  if (mode === "stars") {
    drawStar(context, centerX, centerY, size / 2);
    context.fill();
    return;
  }

  if (mode === "hexagons" || mode === "triangles") {
    const offsetX = mode === "hexagons" && row % 2 ? cell * 0.5 : 0;
    drawPolygon(
      context,
      centerX + offsetX,
      centerY,
      size * 0.52,
      mode === "hexagons" ? 6 : 3,
      mode === "triangles" ? hash(column, row, 9) * Math.PI * 2 : 0,
    );
    context.fill();
    return;
  }

  if (mode === "hatch") {
    context.lineWidth = Math.max(0.5, cell * 0.07);
    const strokes = Math.max(1, Math.ceil(amount * 3));
    for (let stroke = 0; stroke < strokes; stroke += 1) {
      const shift = (stroke - (strokes - 1) / 2) * cell * 0.23;
      context.beginPath();
      context.moveTo(x + shift, y + cell);
      context.lineTo(x + cell + shift, y);
      context.stroke();
    }
    return;
  }

  if (mode === "contour") {
    const index = row * columns + column;
    const right = column + 1 < columns ? luminance[index + 1] : luminance[index];
    const down = row + 1 < rows ? luminance[index + columns] : luminance[index];
    const band = Math.floor(luminance[index] * 7);
    context.lineWidth = Math.max(0.6, cell * 0.1);
    context.beginPath();
    if (Math.floor(right * 7) !== band) {
      context.moveTo(x + cell, y);
      context.lineTo(x + cell, y + cell);
    }
    if (Math.floor(down * 7) !== band) {
      context.moveTo(x, y + cell);
      context.lineTo(x + cell, y + cell);
    }
    context.stroke();
    return;
  }

  if (mode === "halfblocks") {
    const nextRow = Math.min(rows - 1, row + 1);
    const lower = luminance[nextRow * columns + column];
    context.font = `${cell * 1.15}px ui-monospace, monospace`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.globalAlpha *= 0.45 + lower * 0.55;
    context.fillText(amount > lower ? "▀" : "▄", centerX, centerY);
  }
}

function applyVariableBlur(
  canvas: HTMLCanvasElement,
  config: AsciiArtConfig,
  width: number,
  height: number,
) {
  if (config.blurType === "off" || config.blurAmount <= 0) return;
  const blurPx = Math.max(0.5, config.blurAmount * 0.09);
  const context = canvas.getContext("2d")!;
  const source = canvas2d(width, height);
  source.getContext("2d")!.drawImage(canvas, 0, 0);
  if (config.blurType === "gaussian") {
    context.clearRect(0, 0, width, height);
    context.filter = `blur(${blurPx}px)`;
    context.drawImage(source, 0, 0);
    context.filter = "none";
    return;
  }
  if (config.blurType === "directional") {
    const angle = (config.blurAngle * Math.PI) / 180;
    const passes = 8;
    context.clearRect(0, 0, width, height);
    for (let pass = 0; pass < passes; pass += 1) {
      const normalized = config.directionalBothSides
        ? pass / (passes - 1) - 0.5
        : pass / (passes - 1);
      context.globalAlpha = 1 / passes;
      context.drawImage(
        source,
        Math.cos(angle) * blurPx * normalized * 2,
        Math.sin(angle) * blurPx * normalized * 2,
      );
    }
    context.globalAlpha = 1;
    return;
  }

  const blurred = canvas2d(width, height);
  const blurredContext = blurred.getContext("2d")!;
  blurredContext.filter = `blur(${blurPx}px)`;
  blurredContext.drawImage(source, 0, 0);
  blurredContext.filter = "none";
  const mask = canvas2d(width, height);
  const maskContext = mask.getContext("2d")!;
  let gradient: CanvasGradient;
  if (config.blurType === "lens") {
    const cx = (config.blurCenterX / 100) * width;
    const cy = (config.blurCenterY / 100) * height;
    const focus = (config.lensFocus / 100) * Math.min(width, height) * 0.72;
    gradient = maskContext.createRadialGradient(cx, cy, focus * 0.65, cx, cy, focus * 1.55);
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(1, "rgba(0,0,0,1)");
  } else {
    gradient = maskContext.createLinearGradient(0, 0, 0, height);
    if (config.blurType === "tilt-shift") {
      const center = config.tiltPosition / 100;
      const half = config.tiltFeather / 200;
      gradient.addColorStop(0, "rgba(0,0,0,1)");
      gradient.addColorStop(clamp(center - half), "rgba(0,0,0,0)");
      gradient.addColorStop(clamp(center + half), "rgba(0,0,0,0)");
      gradient.addColorStop(1, "rgba(0,0,0,1)");
    } else {
      const position = config.progressivePosition / 100;
      const reverse = config.progressiveReverse;
      gradient.addColorStop(0, reverse ? "rgba(0,0,0,1)" : "rgba(0,0,0,0)");
      gradient.addColorStop(position, reverse ? "rgba(0,0,0,.78)" : "rgba(0,0,0,.22)");
      gradient.addColorStop(1, reverse ? "rgba(0,0,0,0)" : "rgba(0,0,0,1)");
    }
  }
  maskContext.fillStyle = gradient;
  maskContext.fillRect(0, 0, width, height);
  blurredContext.globalCompositeOperation = "destination-in";
  blurredContext.drawImage(mask, 0, 0);
  blurredContext.globalCompositeOperation = "source-over";
  context.clearRect(0, 0, width, height);
  context.drawImage(source, 0, 0);
  context.drawImage(blurred, 0, 0);
}

function applyPostEffects(
  canvas: HTMLCanvasElement,
  config: AsciiArtConfig,
  width: number,
  height: number,
  sample: ImageData,
  time: number,
) {
  const context = canvas.getContext("2d", { willReadFrequently: true })!;
  if (config.pfx.scanLines.enabled) {
    context.fillStyle = `rgba(0,0,0,${config.pfx.scanLines.intensity / 250})`;
    for (let y = 0; y < height; y += 4) context.fillRect(0, y, width, 1);
  }
  if (config.pfx.vignette.enabled) {
    const amount = config.pfx.vignette.intensity / 100;
    const vignette = context.createRadialGradient(
      width / 2,
      height / 2,
      Math.min(width, height) * 0.12,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.72,
    );
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, `rgba(0,0,0,${amount * 0.92})`);
    context.fillStyle = vignette;
    context.fillRect(0, 0, width, height);
  }
  if (config.pfx.bloom.enabled) {
    const bloom = canvas2d(width, height);
    const bloomContext = bloom.getContext("2d")!;
    bloomContext.filter = `brightness(155%) contrast(180%) blur(${1 + config.pfx.bloom.intensity * 0.08}px)`;
    bloomContext.drawImage(canvas, 0, 0);
    context.save();
    context.globalCompositeOperation = "screen";
    context.globalAlpha = config.pfx.bloom.intensity / 180;
    context.drawImage(bloom, 0, 0);
    context.restore();
  }
  if (config.pfx.chromatic.enabled) {
    const amount = config.pfx.chromatic.intensity * 0.08;
    const copy = canvas2d(width, height);
    copy.getContext("2d")!.drawImage(canvas, 0, 0);
    context.save();
    context.globalCompositeOperation = "screen";
    context.globalAlpha = 0.18;
    context.drawImage(copy, amount, 0);
    context.drawImage(copy, -amount, 0);
    context.restore();
  }
  if (config.pfx.filmGrain.enabled) {
    const alpha = config.pfx.filmGrain.intensity / 1000;
    context.save();
    context.globalCompositeOperation = "screen";
    for (let index = 0; index < width * height * 0.002; index += 1) {
      context.fillStyle = `rgba(255,255,255,${alpha * hash(index, Math.floor(time / 30))})`;
      context.fillRect(hash(index, 2) * width, hash(index, 4) * height, 1, 1);
    }
    context.restore();
  }
  if (config.pfx.glitch.enabled) {
    const copy = canvas2d(width, height);
    copy.getContext("2d")!.drawImage(canvas, 0, 0);
    const slices = Math.ceil(config.pfx.glitch.intensity / 8);
    for (let slice = 0; slice < slices; slice += 1) {
      const y = hash(slice, Math.floor(time / 90)) * height;
      const sliceHeight = 2 + hash(slice, 4) * 10;
      const offset = (hash(slice, 9, Math.floor(time / 90)) - 0.5) * config.pfx.glitch.intensity;
      context.drawImage(copy, 0, y, width, sliceHeight, offset, y, width, sliceHeight);
    }
  }
  if (config.pfx.halftone.enabled) {
    const columns = sample.width;
    const rows = sample.height;
    context.save();
    context.globalCompositeOperation = "multiply";
    context.fillStyle = `rgba(0,0,0,${config.pfx.halftone.intensity / 250})`;
    const stepX = width / columns;
    const stepY = height / rows;
    for (let row = 0; row < rows; row += 2) {
      for (let column = 0; column < columns; column += 2) {
        const index = (row * columns + column) * 4;
        const lum = (sample.data[index] + sample.data[index + 1] + sample.data[index + 2]) / 765;
        context.beginPath();
        context.arc(column * stepX, row * stepY, (1 - lum) * Math.min(stepX, stepY), 0, Math.PI * 2);
        context.fill();
      }
    }
    context.restore();
  }
  if (config.pfx.pixelate.enabled) {
    const block = Math.max(2, Math.round(2 + config.pfx.pixelate.intensity * 0.18));
    const tiny = canvas2d(Math.ceil(width / block), Math.ceil(height / block));
    tiny.getContext("2d")!.drawImage(canvas, 0, 0, tiny.width, tiny.height);
    context.imageSmoothingEnabled = false;
    context.clearRect(0, 0, width, height);
    context.drawImage(tiny, 0, 0, tiny.width, tiny.height, 0, 0, width, height);
    context.imageSmoothingEnabled = true;
  }
  if (config.pfx.filmDust.enabled) {
    context.save();
    context.strokeStyle = `rgba(255,255,255,${config.pfx.filmDust.intensity / 230})`;
    const specks = Math.ceil(config.pfx.filmDust.intensity / 3);
    for (let index = 0; index < specks; index += 1) {
      const x = hash(index, Math.floor(time / 180)) * width;
      const y = hash(index, 3, Math.floor(time / 180)) * height;
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x + (hash(index, 6) - 0.5) * 4, y + 3 + hash(index, 7) * 18);
      context.stroke();
    }
    context.restore();
  }
}

export function AsciiArtCanvas({
  config,
  sourceImage,
  className,
  frameRate = 30,
  pauseWhenOffscreen = true,
  ...props
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef({ x: 0.62, y: 0.46 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    let reducedMotion = media.matches;
    let visible = !document.hidden;
    let inViewport = true;
    let frame = 0;
    let lastFrame = 0;
    let width = 1;
    let height = 1;
    let maskImage: HTMLImageElement | null = null;

    const image = new Image();
    image.decoding = "async";
    image.src = sourceImage;

    if (config.mask.dataUrl) {
      maskImage = new Image();
      maskImage.src = config.mask.dataUrl;
    }

    const intersection = new IntersectionObserver(
      ([entry]) => {
        inViewport = entry.isIntersecting;
        visible = !document.hidden && (!pauseWhenOffscreen || inViewport);
        if (!visible && frame) {
          cancelAnimationFrame(frame);
          frame = 0;
        } else if (visible && frame === 0) {
          frame = requestAnimationFrame(loop);
        }
      },
      { rootMargin: "120px" },
    );
    intersection.observe(canvas);

    const onVisibilityChange = () => {
      visible = !document.hidden && (!pauseWhenOffscreen || inViewport);
      if (!visible && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else if (visible && frame === 0 && !reducedMotion) {
        frame = requestAnimationFrame(loop);
      } else if (visible && image.complete) {
        render(performance.now());
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    let resizeTimer = 0;
    const resize = new ResizeObserver(([entry]) => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
      width = Math.max(1, Math.round(entry.contentRect.width));
      height = Math.max(1, Math.round(entry.contentRect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, isTouch ? 1.15 : 1.6);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (image.complete) render(performance.now());
      }, 120);
    });
    resize.observe(canvas);

    const onPointerMove = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      pointerRef.current = {
        x: clamp((event.clientX - bounds.left) / bounds.width),
        y: clamp((event.clientY - bounds.top) / bounds.height),
      };
    };
    canvas.parentElement?.addEventListener("pointermove", onPointerMove);

    const onMotionChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
      if (image.complete) render(performance.now());
    };
    media.addEventListener("change", onMotionChange);

    function render(time: number) {
      if (!image.complete || !image.naturalWidth || width <= 1 || height <= 1) return;
      const cell = Math.max(config.cellSize, isTouch ? 12 : 5);
      const columns = Math.ceil(width / cell) + 2;
      const rows = Math.ceil(height / cell);
      const photo = canvas2d(width, height);
      const photoContext = photo.getContext("2d", { willReadFrequently: true })!;
      drawCover(photoContext, image, width, height);

      const sampleCanvas = canvas2d(columns, rows);
      const sampleContext = sampleCanvas.getContext("2d", { willReadFrequently: true })!;
      sampleContext.imageSmoothingEnabled = true;
      sampleContext.drawImage(photo, 0, 0, columns, rows);
      const sample = sampleContext.getImageData(0, 0, columns, rows);
      const luminance = new Float32Array(columns * rows);
      for (let index = 0; index < luminance.length; index += 1) {
        const offset = index * 4;
        luminance[index] =
          (sample.data[offset] * 0.2126 +
            sample.data[offset + 1] * 0.7152 +
            sample.data[offset + 2] * 0.0722) /
          255;
      }

      const background = canvas2d(width, height);
      const backgroundContext = background.getContext("2d")!;
      backgroundContext.globalAlpha = config.bgOpacity / 100;
      if (config.bgMode === "blurred") {
        backgroundContext.filter = `blur(${config.bgBlur}px)`;
        backgroundContext.drawImage(photo, -config.bgBlur, -config.bgBlur, width + config.bgBlur * 2, height + config.bgBlur * 2);
      } else if (config.bgMode === "photo") {
        backgroundContext.drawImage(photo, 0, 0);
      } else if (config.bgMode === "solid") {
        backgroundContext.fillStyle = config.tint;
        backgroundContext.fillRect(0, 0, width, height);
        backgroundContext.fillStyle = "rgba(1,3,9,.76)";
        backgroundContext.fillRect(0, 0, width, height);
      }
      backgroundContext.globalAlpha = 1;

      const shapes = canvas2d(width, height);
      const shapesContext = shapes.getContext("2d")!;
      shapesContext.globalCompositeOperation = config.styleBlend;
      const emphasis = config.edgeEmphasis / 100;
      const drift = reducedMotion ? 0 : ((time * 0.005) % (cell * 2)) - cell;

      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          if (hash(column, row, 1) > config.coverage / 100) continue;
          const index = row * columns + column;
          const offset = index * 4;
          const left = luminance[row * columns + Math.max(0, column - 1)];
          const right = luminance[row * columns + Math.min(columns - 1, column + 1)];
          const up = luminance[Math.max(0, row - 1) * columns + column];
          const down = luminance[Math.min(rows - 1, row + 1) * columns + column];
          const edge = clamp(Math.hypot(right - left, down - up) * 2.2);
          let amount = toneMap(luminance[index], config.toneCurve);
          if (config.invert) amount = 1 - amount;
          amount = clamp(amount * (1 - emphasis * 0.22) + edge * emphasis);
          const motion = animationMod(config, row, column, rows, columns, time, pointerRef.current);
          amount = clamp(amount * motion.scale);
          const color = {
            r: sample.data[offset],
            g: sample.data[offset + 1],
            b: sample.data[offset + 2],
          };
          shapesContext.save();
          shapesContext.globalAlpha = motion.alpha;
          const x = column * cell - cell + drift;
          const y = row * cell + motion.offsetY;
          drawCell(
            shapesContext,
            config.renderMode,
            x,
            y,
            cell,
            amount,
            color,
            row,
            column,
            rows,
            columns,
            time,
            config,
            luminance,
          );
          shapesContext.restore();
        }
      }

      const processed = canvas2d(width, height);
      const processedContext = processed.getContext("2d")!;
      processedContext.drawImage(background, 0, 0);
      processedContext.filter = `brightness(${100 + config.brightness}%) contrast(${config.contrast}%) saturate(${config.saturation}%) grayscale(${config.grayscale}%)`;
      processedContext.drawImage(shapes, 0, 0);
      processedContext.filter = "none";
      processedContext.save();
      processedContext.globalCompositeOperation = config.overlayBlend;
      processedContext.globalAlpha = config.tintOpacity / 100;
      processedContext.fillStyle = config.tint;
      processedContext.fillRect(0, 0, width, height);
      processedContext.restore();

      applyVariableBlur(processed, config, width, height);
      applyPostEffects(processed, config, width, height, sample, time);

      if (config.lights.enabled) {
        const lightContext = processed.getContext("2d")!;
        lightContext.save();
        lightContext.globalCompositeOperation = "lighter";
        config.lights.points.forEach((point) => {
          const radius = point.radius * Math.min(width, height);
          const gradient = lightContext.createRadialGradient(
            point.x * width,
            point.y * height,
            0,
            point.x * width,
            point.y * height,
            radius,
          );
          gradient.addColorStop(0, `rgba(195,244,255,${point.intensity})`);
          gradient.addColorStop(1, "rgba(180,151,207,0)");
          lightContext.fillStyle = gradient;
          lightContext.fillRect(0, 0, width, height);
        });
        lightContext.restore();
      }

      if (config.mask.enabled && maskImage?.complete) {
        const reveal = canvas2d(width, height);
        const revealContext = reveal.getContext("2d")!;
        revealContext.drawImage(photo, 0, 0);
        revealContext.globalCompositeOperation = config.mask.invert
          ? "destination-out"
          : "destination-in";
        revealContext.drawImage(maskImage, 0, 0, width, height);
        revealContext.globalCompositeOperation = "source-over";
        processed.getContext("2d")!.drawImage(reveal, 0, 0);
      }

      context!.clearRect(0, 0, width, height);
      context!.drawImage(processed, 0, 0);
    }

    function loop(time: number) {
      if (!visible) {
        frame = 0;
        return;
      }
      const shouldAnimate = (config.animated || config.renderMode === "matrix") && !reducedMotion;
      if (time - lastFrame >= 1000 / Math.max(1, frameRate) || !shouldAnimate) {
        lastFrame = time;
        render(time);
      }
      if (shouldAnimate) frame = requestAnimationFrame(loop);
      else frame = 0;
    }

    const onImageReady = () => {
      render(performance.now());
      if ((config.animated || config.renderMode === "matrix") && !reducedMotion) {
        if (frame === 0) frame = requestAnimationFrame(loop);
      }
    };
    image.addEventListener("load", onImageReady);
    if (image.complete) onImageReady();

    return () => {
      cancelAnimationFrame(frame);
      intersection.disconnect();
      resize.disconnect();
      window.clearTimeout(resizeTimer);
      media.removeEventListener("change", onMotionChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      canvas.parentElement?.removeEventListener("pointermove", onPointerMove);
      image.removeEventListener("load", onImageReady);
    };
  }, [config, frameRate, pauseWhenOffscreen, sourceImage]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("pointer-events-none h-full w-full", className)}
      aria-hidden="true"
      {...props}
    />
  );
}
