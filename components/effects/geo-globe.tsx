"use client";

import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { feature } from "topojson-client";
import type { GeometryObject, Topology } from "topojson-specification";
import worldTopology from "world-atlas/land-110m.json";

import { LocationTag } from "@/components/ui/location-tag";

const MANGALORE: [number, number] = [74.856, 12.9141];
const TARGET_ROTATION: [number, number, number] = [-MANGALORE[0], -MANGALORE[1], 0];
type LonLat = [number, number];

type VisitorLocation = {
  city: string;
  country: string;
  timeZone: string;
  coordinates: LonLat;
};

type GeoApiPayload = Record<string, unknown> & {
  timezone?: string | { id?: string };
};

function parseVisitorLocation(payload: GeoApiPayload): VisitorLocation {
  const city = typeof payload.city === "string" ? payload.city.trim() : "";
  const countryValue = payload.country_name ?? payload.country;
  const country = typeof countryValue === "string" ? countryValue.trim() : "";
  const latitude = Number(payload.latitude);
  const longitude = Number(payload.longitude);
  const timeZone =
    typeof payload.timezone === "string"
      ? payload.timezone
      : typeof payload.timezone?.id === "string"
        ? payload.timezone.id
        : "";

  if (
    !city ||
    !country ||
    !timeZone ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180
  ) {
    throw new Error("Incomplete approximate location response");
  }
  new Intl.DateTimeFormat("en-US", { timeZone }).format(new Date());

  return { city, country, timeZone, coordinates: [longitude, latitude] };
}

async function approximateVisitorLocation(signal: AbortSignal) {
  try {
    const response = await fetch("https://ipwho.is/", {
      signal,
      cache: "no-store",
      referrerPolicy: "no-referrer",
    });
    if (!response.ok) throw new Error("Primary location service unavailable");
    const payload = (await response.json()) as GeoApiPayload & { success?: boolean };
    if (payload.success === false) throw new Error("Primary location lookup failed");
    return parseVisitorLocation(payload);
  } catch (error) {
    if (signal.aborted) throw error;
    const response = await fetch("https://ipapi.co/json/", {
      signal,
      cache: "no-store",
      referrerPolicy: "no-referrer",
    });
    if (!response.ok) throw new Error("Fallback location service unavailable");
    return parseVisitorLocation((await response.json()) as GeoApiPayload);
  }
}

function sampleLine(line: number[][], spacing = 0.055): LonLat[] {
  const sampled: LonLat[] = [];
  for (let index = 1; index < line.length; index += 1) {
    const start = line[index - 1] as LonLat;
    const end = line[index] as LonLat;
    const interpolate = d3.geoInterpolate(start, end);
    const count = Math.max(1, Math.ceil(d3.geoDistance(start, end) / spacing));
    for (let step = 0; step < count; step += 1) sampled.push(interpolate(step / count));
  }
  return sampled;
}

function geometryLines(geometry: GeoJSON.Geometry): number[][][] {
  switch (geometry.type) {
    case "LineString": return [geometry.coordinates];
    case "MultiLineString": return geometry.coordinates;
    case "Polygon": return geometry.coordinates;
    case "MultiPolygon": return geometry.coordinates.flat();
    case "GeometryCollection": return geometry.geometries.flatMap(geometryLines);
    default: return [];
  }
}

const topology = worldTopology as unknown as Topology;
const landFeature = feature(topology, topology.objects.land as GeometryObject);
const landGeometry = landFeature.type === "Feature" ? landFeature.geometry : null;
const LAND_POINTS = landGeometry ? geometryLines(landGeometry).flatMap((line) => sampleLine(line, 0.042)) : [];
const GRATICULE_POINTS = geometryLines(d3.geoGraticule10()).flatMap((line) => sampleLine(line, 0.072));

function visible(point: LonLat, rotation: [number, number, number]) {
  return d3.geoDistance(point, [-rotation[0], -rotation[1]]) < Math.PI / 2;
}

export function GeoGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const visitorMarkerRef = useRef<HTMLDivElement>(null);
  const visitorRef = useRef<VisitorLocation | null>(null);
  const redrawRef = useRef<() => void>(() => undefined);
  const [visitor, setVisitor] = useState<VisitorLocation | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 9_000);
    let active = true;

    approximateVisitorLocation(controller.signal)
      .then((location) => {
        if (!active) return;
        visitorRef.current = location;
        setVisitor(location);
        window.requestAnimationFrame(() => redrawRef.current());
      })
      .catch(() => undefined)
      .finally(() => window.clearTimeout(timeout));

    return () => {
      active = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const projection = d3.geoOrthographic().clipAngle(90).precision(0.4);
    let width = 640;
    let height = 640;
    let baseScale = 250;
    let zoom = 1;
    let rotation: [number, number, number] = reducedMotion.matches ? [...TARGET_ROTATION] : [12, -8, 0];
    let velocity: [number, number] = [0, 0];
    let dragging = false;
    let introComplete = reducedMotion.matches;
    let introStarted = performance.now();
    let lastTime = introStarted;
    let lastInteraction = 0;
    let frame = 0;
    let pulse = 0;
    const touches = new Map<number, { x: number; y: number }>();
    let pinchDistance = 0;
    let pinchZoom = 1;

    const updateProjection = () => {
      projection
        .translate([width / 2, height / 2])
        .scale(baseScale * zoom)
        .rotate(rotation);
    };

    const drawPoint = (point: LonLat, color: string, baseRadius: number) => {
      if (!visible(point, rotation)) return;
      const projected = projection(point);
      if (!projected) return;
      const distance = d3.geoDistance(point, [-rotation[0], -rotation[1]]);
      const depth = Math.max(0, Math.cos(distance));
      context.globalAlpha = 0.12 + depth * 0.82;
      context.fillStyle = color;
      context.beginPath();
      context.arc(projected[0], projected[1], baseRadius * (0.55 + depth * 0.75), 0, Math.PI * 2);
      context.fill();
    };

    const draw = () => {
      updateProjection();
      context.clearRect(0, 0, width, height);
      const radius = projection.scale();
      const halo = context.createRadialGradient(width / 2, height / 2, radius * 0.55, width / 2, height / 2, radius * 1.06);
      halo.addColorStop(0, "rgba(30,111,255,0.025)");
      halo.addColorStop(0.88, "rgba(30,111,255,0.08)");
      halo.addColorStop(1, "rgba(195,244,255,0)");
      context.fillStyle = halo;
      context.beginPath();
      context.arc(width / 2, height / 2, radius * 1.06, 0, Math.PI * 2);
      context.fill();

      context.strokeStyle = "rgba(195,244,255,0.22)";
      context.lineWidth = 1;
      context.beginPath();
      context.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
      context.stroke();

      GRATICULE_POINTS.forEach((point) => drawPoint(point, "#1e6fff", 0.82));
      LAND_POINTS.forEach((point) => drawPoint(point, "#c3f4ff", 1.25));
      context.globalAlpha = 1;

      if (visible(MANGALORE, rotation)) {
        const location = projection(MANGALORE);
        if (location) {
          const markerRadius = reducedMotion.matches ? 12 : 12 + Math.sin(pulse) * 3;
          const glow = context.createRadialGradient(location[0], location[1], 0, location[0], location[1], markerRadius);
          glow.addColorStop(0, "rgba(255,255,255,.98)");
          glow.addColorStop(0.18, "rgba(180,151,207,.95)");
          glow.addColorStop(1, "rgba(180,151,207,0)");
          context.fillStyle = glow;
          context.beginPath();
          context.arc(location[0], location[1], markerRadius, 0, Math.PI * 2);
          context.fill();
          context.fillStyle = "#fff";
          context.beginPath();
          context.arc(location[0], location[1], 2.7, 0, Math.PI * 2);
          context.fill();
        }
      }

      const visitorLocation = visitorRef.current;
      const visitorMarker = visitorMarkerRef.current;
      if (visitorLocation && visible(visitorLocation.coordinates, rotation)) {
        const location = projection(visitorLocation.coordinates);
        if (location) {
          const markerRadius = reducedMotion.matches ? 11 : 11 + Math.sin(pulse * 1.12) * 3;
          const glow = context.createRadialGradient(location[0], location[1], 0, location[0], location[1], markerRadius);
          glow.addColorStop(0, "rgba(255,255,255,.98)");
          glow.addColorStop(0.16, "rgba(52,211,153,.95)");
          glow.addColorStop(1, "rgba(52,211,153,0)");
          context.fillStyle = glow;
          context.beginPath();
          context.arc(location[0], location[1], markerRadius, 0, Math.PI * 2);
          context.fill();
          context.fillStyle = "#34d399";
          context.beginPath();
          context.arc(location[0], location[1], 2.8, 0, Math.PI * 2);
          context.fill();

          if (visitorMarker) {
            const placeLeft = location[0] > width * 0.62;
            visitorMarker.style.left = `${location[0] + (placeLeft ? -18 : 18)}px`;
            visitorMarker.style.top = `${location[1]}px`;
            visitorMarker.style.transform = `translate(${placeLeft ? "-100%" : "0"}, -50%)`;
            visitorMarker.style.opacity = "1";
            visitorMarker.style.pointerEvents = "auto";
          }
        }
      } else if (visitorMarker) {
        visitorMarker.style.opacity = "0";
        visitorMarker.style.pointerEvents = "none";
      }
    };
    redrawRef.current = draw;

    const resize = new ResizeObserver(([entry]) => {
      width = Math.max(300, Math.round(entry.contentRect.width));
      height = Math.max(360, Math.round(entry.contentRect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      baseScale = Math.min(width, height) * 0.38;
      draw();
    });
    resize.observe(canvas);

    const drag = d3.drag<HTMLCanvasElement, unknown>()
      .on("start", () => {
        dragging = true;
        velocity = [0, 0];
        lastInteraction = performance.now();
      })
      .on("drag", (event) => {
        const sensitivity = 0.32 / zoom;
        const dx = event.dx * sensitivity;
        const dy = -event.dy * sensitivity;
        rotation = [rotation[0] + dx, Math.max(-82, Math.min(82, rotation[1] + dy)), 0];
        velocity = [dx, dy];
        draw();
      })
      .on("end", () => {
        dragging = false;
        lastInteraction = performance.now();
      });
    d3.select(canvas).call(drag);

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      zoom = Math.max(0.72, Math.min(1.48, zoom * Math.exp(-event.deltaY * 0.001)));
      lastInteraction = performance.now();
      draw();
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        canvas.setPointerCapture(event.pointerId);
        touches.set(event.pointerId, { x: event.clientX, y: event.clientY });
        if (touches.size === 2) {
          const [a, b] = [...touches.values()];
          pinchDistance = Math.hypot(a.x - b.x, a.y - b.y);
          pinchZoom = zoom;
        }
      }
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!touches.has(event.pointerId)) return;
      touches.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (touches.size === 2) {
        const [a, b] = [...touches.values()];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        zoom = Math.max(0.72, Math.min(1.48, pinchZoom * (distance / Math.max(1, pinchDistance))));
        lastInteraction = performance.now();
        draw();
      }
    };
    const onPointerUp = (event: PointerEvent) => {
      touches.delete(event.pointerId);
      pinchDistance = 0;
    };
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);

    const animate = (now: number) => {
      const delta = Math.min(32, now - lastTime);
      lastTime = now;
      if (!introComplete) {
        const progress = Math.min(1, (now - introStarted) / 2000);
        const eased = d3.easeCubicInOut(progress);
        rotation = [
          12 + (TARGET_ROTATION[0] - 12) * eased,
          -8 + (TARGET_ROTATION[1] + 8) * eased,
          0,
        ];
        introComplete = progress >= 1;
      } else if (!dragging && !reducedMotion.matches) {
        rotation[0] += velocity[0];
        rotation[1] = Math.max(-82, Math.min(82, rotation[1] + velocity[1]));
        velocity = [velocity[0] * 0.94, velocity[1] * 0.94];
        if (now - lastInteraction > 1500 && Math.abs(velocity[0]) < 0.01) rotation[0] += 0.018 * (delta / 16.67);
      }
      pulse += delta * 0.004;
      draw();
      if (!reducedMotion.matches) frame = requestAnimationFrame(animate);
      else frame = 0;
    };
    if (!reducedMotion.matches) frame = requestAnimationFrame(animate);
    else draw();

    const onMotionChange = () => {
      if (reducedMotion.matches) {
        cancelAnimationFrame(frame);
        frame = 0;
        rotation = [...TARGET_ROTATION];
        velocity = [0, 0];
        introComplete = true;
        draw();
      } else {
        introStarted = performance.now();
        introComplete = false;
        lastTime = introStarted;
        if (!frame) frame = requestAnimationFrame(animate);
      }
    };
    reducedMotion.addEventListener("change", onMotionChange);

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      d3.select(canvas).on(".drag", null);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      reducedMotion.removeEventListener("change", onMotionChange);
      redrawRef.current = () => undefined;
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-[60rem]">
      <div className="geo-globe-shell">
        <canvas
          ref={canvasRef}
          className="h-full w-full touch-none cursor-grab active:cursor-grabbing"
          role="img"
          aria-label="Interactive dotted globe showing Mangalore and, when available, the visitor's approximate IP-based location. Drag to rotate and scroll or pinch to zoom."
        />
        {visitor ? (
          <div
            ref={visitorMarkerRef}
            className="absolute z-10 opacity-0 transition-opacity duration-300"
          >
            <LocationTag
              city={visitor.city}
              country={visitor.country}
              timeZone={visitor.timeZone}
            />
          </div>
        ) : null}
      </div>
      {visitor ? (
        <p className="-mt-6 text-center text-[10px] uppercase tracking-[0.14em] text-neutral-500">
          Showing your approximate IP-based location · no precise location permission requested
        </p>
      ) : null}
    </div>
  );
}
