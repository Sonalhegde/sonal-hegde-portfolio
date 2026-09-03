import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { feature } from "topojson-client";
import type { GeometryObject, Topology } from "topojson-specification";
import worldTopology from "world-atlas/land-110m.json";

import { useDeviceMode } from "@/components/effects/use-device-mode";

type VisitorLocation = {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

type VisitorSummary = {
  status: "loading" | "ready" | "unavailable";
  locations: VisitorLocation[];
  totalVisitors: number;
  cityCount: number;
};

const SUMMARY_LOADING: VisitorSummary = { status: "loading", locations: [], totalVisitors: 0, cityCount: 0 };
const SUMMARY_UNAVAILABLE: VisitorSummary = { status: "unavailable", locations: [], totalVisitors: 0, cityCount: 0 };
const SESSION_STORAGE_KEY = "portfolio-visitor-session";

// City-pointer view: label the portfolio base at city granularity (Mangalore),
// never the finer-grained town level.
const BASE_CITY: [number, number] = [74.856, 12.9141];
const BASE_LABEL = "Mangalore, India";
const topology = worldTopology as unknown as Topology;
const land = feature(topology, topology.objects.land as GeometryObject);

// Stable per-browser session id so the server can dedupe page reloads. When
// storage is unavailable the server falls back to IP+day dedupe.
function visitorSessionId() {
  try {
    const existing = localStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(SESSION_STORAGE_KEY, id);
    return id;
  } catch {
    return "";
  }
}

// The static (GitHub Pages) build has no API routes; when a server deployment
// exists elsewhere it can be pointed at via NEXT_PUBLIC_VISITORS_API_URL.
function visitorsApiBase() {
  const configured = process.env.NEXT_PUBLIC_VISITORS_API_URL?.trim().replace(/\/+$/, "");
  return configured || "";
}

function parseSummary(payload: unknown): VisitorSummary | null {
  if (typeof payload !== "object" || payload === null) return null;
  const data = payload as Record<string, unknown>;
  if (data.available !== true || !Array.isArray(data.locations)) return null;
  const totalVisitors = Number(data.totalVisitors);
  const cityCount = Number(data.cityCount);
  if (!Number.isInteger(totalVisitors) || totalVisitors < 0 || !Number.isInteger(cityCount) || cityCount < 0) return null;

  const locations: VisitorLocation[] = [];
  const seen = new Set<string>();
  for (const entry of data.locations) {
    if (typeof entry !== "object" || entry === null) continue;
    const location = entry as Record<string, unknown>;
    const city = typeof location.city === "string" ? location.city.trim().slice(0, 80) : "";
    const country = typeof location.country === "string" ? location.country.trim().slice(0, 80) : "";
    const timezone = typeof location.timezone === "string" ? location.timezone.trim().slice(0, 80) : "";
    const latitude = Number(location.latitude);
    const longitude = Number(location.longitude);
    if (!city || !country || !timezone || !Number.isFinite(latitude) || !Number.isFinite(longitude)) continue;
    const key = `${city.toLowerCase()}|${country.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    locations.push({ city, country, latitude, longitude, timezone });
    if (locations.length >= 24) break;
  }

  return {
    status: "ready",
    locations,
    totalVisitors,
    cityCount,
  };
}

async function fetchVisitorSummary(signal: AbortSignal) {
  const base = visitorsApiBase();
  // Record the visit (server dedupes by session + IP + day), then read the real
  // totals. No client-side geolocation, no fabricated numbers: if the API is
  // unreachable the UI shows an explicit unavailable state.
  try {
    await fetch(`${base}/api/visitors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: visitorSessionId() }),
      signal,
      keepalive: true,
    });
  } catch (error) {
    if (signal.aborted) throw error;
  }

  const response = await fetch(`${base}/api/visitors`, { signal, cache: "no-store" });
  const contentType = response.headers.get("content-type") ?? "";
  if (!response.ok || !contentType.includes("application/json")) throw new Error("Visitor summary unavailable");
  const summary = parseSummary(await response.json());
  if (!summary) throw new Error("Visitor summary unavailable");
  return summary;
}

function readMapPalette() {
  const style = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback;
  return {
    land: read("--map-land", "rgba(195,244,255,.13)"),
    landStroke: read("--map-land-stroke", "rgba(195,244,255,.46)"),
    graticule: read("--map-graticule", "rgba(30,111,255,.16)"),
    sphereFill: read("--map-sphere-fill", "rgba(20,32,54,.9)"),
    sphereFill2: read("--map-sphere-fill-2", "rgba(6,10,18,.88)"),
    sphereFill3: read("--map-sphere-fill-3", "rgba(2,4,8,.94)"),
    label: read("--map-label", "rgba(245,246,250,.96)"),
    marker: read("--map-marker", "rgba(195,244,255,1)"),
    visitor: read("--map-visitor", "rgba(52,211,153,1)"),
  };
}

export function ResearchMap() {
  const shellRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const locationsRef = useRef<VisitorLocation[]>([]);
  const clockRef = useRef<HTMLSpanElement>(null);
  const deviceMode = useDeviceMode();
  const liteModeRef = useRef(deviceMode === "lite");
  const [summary, setSummary] = useState<VisitorSummary>(SUMMARY_LOADING);
  const currentVisitor = summary.locations[0] ?? null;

  useEffect(() => {
    liteModeRef.current = deviceMode === "lite";
  }, [deviceMode]);

  useEffect(() => {
    const controller = new AbortController();
    fetchVisitorSummary(controller.signal)
      .then((nextSummary) => {
        if (controller.signal.aborted) return;
        setSummary(nextSummary);
      })
      .catch(() => {
        if (!controller.signal.aborted) setSummary(SUMMARY_UNAVAILABLE);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    locationsRef.current = summary.locations;
  }, [summary.locations]);

  useEffect(() => {
    if (!currentVisitor) return;
    const update = () => {
      if (!clockRef.current || document.hidden) return;
      clockRef.current.textContent = new Intl.DateTimeFormat("en-GB", {
        timeZone: currentVisitor.timezone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(new Date());
    };
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [currentVisitor]);

  useEffect(() => {
    const shell = shellRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!shell || !canvas || !context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const rotation = { lambda: -BASE_CITY[0], phi: -BASE_CITY[1] };
    const drag = { active: false, lastX: 0, lastY: 0, velocity: 0 };
    const projection = d3.geoOrthographic().precision(0.4);
    const path = d3.geoPath(projection, context);
    const graticule = d3.geoGraticule10();

    // Canvas palette follows the active theme via CSS custom properties.
    const themePaletteRef = { current: readMapPalette() };
    const themeObserver = new MutationObserver(() => {
      themePaletteRef.current = readMapPalette();
      draw();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    let width = 900;
    let height = 430;
    let scale = 1;
    let frame = 0;
    let visible = true;
    let lastFrame = 0;
    let autoRotate = true;
    let resumeTimer = 0;

    const applyProjection = () => {
      const radius = Math.min(width, height) / 2 - 14;
      scale = Math.max(radius, 40);
      projection.scale(scale).translate([width / 2, height / 2]).rotate([rotation.lambda, rotation.phi]);
    };

    const marker = (coordinates: [number, number], label: string, color: string, now: number, align: CanvasTextAlign) => {
      const centerDistance = d3.geoDistance(coordinates, [-rotation.lambda, -rotation.phi]);
      if (centerDistance > Math.PI / 2) return;
      const point = projection(coordinates);
      if (!point) return;
      const pulse = reducedMotion.matches ? 0.35 : (Math.sin(now * 0.004) + 1) / 2;
      const fade = Math.max(0, Math.cos(centerDistance));
      const glow = context.createRadialGradient(point[0], point[1], 0, point[0], point[1], 8 + pulse * 8);
      glow.addColorStop(0, color);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      context.globalAlpha = fade;
      context.fillStyle = glow;
      context.beginPath();
      context.arc(point[0], point[1], 16, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = color;
      context.beginPath();
      context.arc(point[0], point[1], 3, 0, Math.PI * 2);
      context.fill();
      context.textAlign = align;
      context.font = "600 10px ui-monospace, SFMono-Regular, Consolas, monospace";
      context.fillStyle = themePaletteRef.current.label;
      context.fillText(label, point[0] + (align === "right" ? -12 : 12), point[1] - 8);
      context.globalAlpha = 1;
    };

    const draw = (now = 0) => {
      applyProjection();
      context.clearRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height / 2;

      const backdrop = context.createRadialGradient(cx, cy * 0.85, scale * 0.2, cx, cy, scale * 1.35);
      backdrop.addColorStop(0, "rgba(30,111,255,.16)");
      backdrop.addColorStop(1, "rgba(180,151,207,0)");
      context.fillStyle = backdrop;
      context.fillRect(0, 0, width, height);

      context.beginPath(); path({ type: "Sphere" });
      const palette = themePaletteRef.current;
      const sphereFill = context.createRadialGradient(cx - scale * 0.32, cy - scale * 0.32, scale * 0.1, cx, cy, scale * 1.05);
      sphereFill.addColorStop(0, palette.sphereFill);
      sphereFill.addColorStop(0.6, palette.sphereFill2);
      sphereFill.addColorStop(1, palette.sphereFill3);
      context.fillStyle = sphereFill;
      context.fill();
      context.strokeStyle = "rgba(195,244,255,.28)";
      context.lineWidth = 1.1;
      context.stroke();

      context.save();
      context.beginPath(); path({ type: "Sphere" }); context.clip();
      context.beginPath(); path(graticule);
      context.strokeStyle = palette.graticule; context.lineWidth = 0.6; context.stroke();
      context.beginPath(); path(land);
      context.fillStyle = palette.land; context.fill();
      context.strokeStyle = palette.landStroke; context.lineWidth = 0.8; context.stroke();
      context.restore();

      context.beginPath(); path({ type: "Sphere" });
      const rim = context.createRadialGradient(cx, cy, scale * 0.86, cx, cy, scale);
      rim.addColorStop(0, "rgba(0,0,0,0)");
      rim.addColorStop(1, "rgba(195,244,255,.18)");
      context.strokeStyle = rim as unknown as string;
      context.lineWidth = 3;
      context.stroke();

      marker(BASE_CITY, BASE_LABEL, themePaletteRef.current.marker, now, "left");
      locationsRef.current.forEach((location, index) => {
        marker([location.longitude, location.latitude], `${location.city}, ${location.country}`, themePaletteRef.current.visitor, now + index * 140, "right");
      });
    };

    let resizeTimer = 0;
    const measureAndResize = () => {
      const rect = shell.getBoundingClientRect();
      width = Math.max(280, Math.round(rect.width));
      height = Math.max(280, Math.round(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };
    measureAndResize();

    const resize = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(measureAndResize, 120);
    });
    resize.observe(shell);

    const canAnimate = () => visible && !document.hidden;
    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };
    const animate = (now: number) => {
      if (!canAnimate()) {
        frame = 0;
        return;
      }
      if (now - lastFrame >= 1000 / 30) {
        lastFrame = now;
        // Lite devices render a static globe: no auto-rotation loop, and the
        // render loop parks itself whenever nothing is actively dragging.
        const rotating = autoRotate && !reducedMotion.matches && !liteModeRef.current && !drag.active;
        if (rotating) rotation.lambda += 0.045;
        else if (drag.active) {
          rotation.lambda += drag.velocity;
          drag.velocity *= 0.92;
        }
        draw(now);
        if (!rotating && !drag.active) {
          frame = 0;
          return;
        }
      }
      frame = requestAnimationFrame(animate);
    };
    const start = () => {
      if (canAnimate() && frame === 0) frame = requestAnimationFrame(animate);
    };

    const onPointerDown = (event: PointerEvent) => {
      drag.active = true;
      drag.lastX = event.clientX;
      drag.lastY = event.clientY;
      drag.velocity = 0;
      autoRotate = false;
      window.clearTimeout(resumeTimer);
      canvas.setPointerCapture?.(event.pointerId);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!drag.active) return;
      const dx = event.clientX - drag.lastX;
      const dy = event.clientY - drag.lastY;
      rotation.lambda += dx * 0.28;
      rotation.phi = Math.max(-85, Math.min(85, rotation.phi - dy * 0.28));
      drag.velocity = dx * 0.28;
      drag.lastX = event.clientX;
      drag.lastY = event.clientY;
      draw();
      start();
    };
    const onPointerUp = () => {
      drag.active = false;
      window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(() => {
        if (!liteModeRef.current) autoRotate = true;
      }, 2600);
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("pointerleave", onPointerUp);

    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start(); else stop();
    }, { rootMargin: "100px" });
    intersection.observe(canvas);
    const onVisibilityChange = () => { if (document.hidden) stop(); else start(); };
    document.addEventListener("visibilitychange", onVisibilityChange);
    start();

    return () => {
      stop();
      window.clearTimeout(resizeTimer);
      window.clearTimeout(resumeTimer);
      resize.disconnect();
      intersection.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("pointerleave", onPointerUp);
    };
  }, []);

  return (
    <figure ref={shellRef} className="research-map-shell relative overflow-hidden">
      <canvas
        ref={canvasRef}
        className="h-full w-full cursor-grab touch-none active:cursor-grabbing"
        role="img"
        aria-label="Interactive rotating globe centered on Mangalore, India — Sonal's portfolio base — with recent approximate visitor locations. Drag to rotate."
      />
      <div className="pointer-events-none absolute inset-x-4 top-4 flex flex-wrap items-center justify-between gap-2 font-mono text-[9px] uppercase tracking-[0.14em] text-neutral-500 sm:text-[10px]">
        <span>Drag to rotate</span>
        <span className="visitor-chip rounded-full px-2 py-1">
          {summary.status === "loading" && "Visitor stats loading…"}
          {summary.status === "unavailable" && "Visitor stats unavailable"}
          {summary.status === "ready" && (summary.totalVisitors > 0
            ? `${summary.totalVisitors.toLocaleString()} visits · ${summary.cityCount} cities`
            : "No visitor data yet")}
        </span>
      </div>
      <div className="pointer-events-none absolute inset-x-4 bottom-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-black/55 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.1em] text-neutral-400 backdrop-blur-md">
        <span><span className="mr-2 inline-block size-2 rounded-full bg-[#c3f4ff] shadow-[0_0_10px_#c3f4ff]" />Mangalore, India</span>
        {currentVisitor ? <span><span className="mr-2 inline-block size-2 animate-pulse rounded-full bg-emerald-400" />{currentVisitor.city}, {currentVisitor.country} · <span ref={clockRef}>--:--:--</span> {currentVisitor.timezone}</span> : summary.status === "ready" ? <span>No visitor data yet</span> : summary.status === "loading" ? <span>Checking visitor signal…</span> : <span>Visitor signal unavailable</span>}
      </div>
      <figcaption className="sr-only">Approximate visitor locations are derived from IP data without requesting precise device location or storing personal information.</figcaption>
    </figure>
  );
}
