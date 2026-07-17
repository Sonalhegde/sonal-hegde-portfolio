"use client";

import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { feature } from "topojson-client";
import type { GeometryObject, Topology } from "topojson-specification";
import worldTopology from "world-atlas/land-110m.json";

type VisitorLocation = {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

type GeoPayload = {
  success?: boolean;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string | { id?: string };
};

const KARKALA: [number, number] = [74.992, 13.2143];
const topology = worldTopology as unknown as Topology;
const land = feature(topology, topology.objects.land as GeometryObject);

function parseLocation(payload: GeoPayload): VisitorLocation | null {
  const timezone = typeof payload.timezone === "string" ? payload.timezone : payload.timezone?.id;
  if (!payload.city || !payload.country || !timezone || !Number.isFinite(payload.latitude) || !Number.isFinite(payload.longitude)) return null;
  return {
    city: payload.city,
    country: payload.country,
    latitude: payload.latitude as number,
    longitude: payload.longitude as number,
    timezone,
  };
}

async function fetchVisitorLocation(signal: AbortSignal) {
  for (const url of ["https://ipwho.is/", "https://ipapi.co/json/"]) {
    try {
      const response = await fetch(url, { signal, cache: "no-store" });
      if (!response.ok) continue;
      const location = parseLocation((await response.json()) as GeoPayload);
      if (location) return location;
    } catch (error) {
      if (signal.aborted) throw error;
    }
  }
  return null;
}

export function ResearchMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const visitorRef = useRef<VisitorLocation | null>(null);
  const [visitor, setVisitor] = useState<VisitorLocation | null>(null);
  const [localTime, setLocalTime] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetchVisitorLocation(controller.signal).then((location) => {
      if (!location) return;
      visitorRef.current = location;
      setVisitor(location);
    }).catch(() => undefined);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!visitor) return;
    const update = () => setLocalTime(new Intl.DateTimeFormat("en-GB", {
      timeZone: visitor.timezone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date()));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [visitor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const projection = d3.geoNaturalEarth1();
    const path = d3.geoPath(projection, context);
    const graticule = d3.geoGraticule10();
    let width = 900;
    let height = 430;
    let frame = 0;
    let visible = true;

    const marker = (coordinates: [number, number], label: string, color: string, now: number, align: CanvasTextAlign) => {
      const point = projection(coordinates);
      if (!point) return;
      const pulse = reducedMotion.matches ? 0.35 : (Math.sin(now * 0.004) + 1) / 2;
      const glow = context.createRadialGradient(point[0], point[1], 0, point[0], point[1], 8 + pulse * 8);
      glow.addColorStop(0, color);
      glow.addColorStop(1, "rgba(0,0,0,0)");
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
      context.fillStyle = "rgba(245,246,250,.96)";
      context.fillText(label, point[0] + (align === "right" ? -12 : 12), point[1] - 8);
    };

    const draw = (now = 0) => {
      context.clearRect(0, 0, width, height);
      const background = context.createLinearGradient(0, 0, width, height);
      background.addColorStop(0, "rgba(30,111,255,.1)");
      background.addColorStop(1, "rgba(180,151,207,.08)");
      context.fillStyle = background;
      context.fillRect(0, 0, width, height);
      context.beginPath(); path({ type: "Sphere" });
      context.fillStyle = "rgba(4,7,12,.66)"; context.fill();
      context.strokeStyle = "rgba(195,244,255,.2)"; context.stroke();
      context.beginPath(); path(graticule);
      context.strokeStyle = "rgba(30,111,255,.14)"; context.lineWidth = 0.65; context.stroke();
      context.beginPath(); path(land);
      context.fillStyle = "rgba(195,244,255,.1)"; context.fill();
      context.strokeStyle = "rgba(195,244,255,.42)"; context.stroke();
      marker(KARKALA, "Karkala · portfolio base", "rgba(195,244,255,1)", now, "left");
      const current = visitorRef.current;
      if (current) marker([current.longitude, current.latitude], "Visitor signal", "rgba(52,211,153,1)", now + 800, "right");
    };

    const resize = new ResizeObserver(([entry]) => {
      width = Math.max(300, Math.round(entry.contentRect.width));
      height = Math.max(300, Math.round(entry.contentRect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      projection.fitExtent([[18, 18], [width - 18, height - 18]], { type: "Sphere" });
      draw();
    });
    resize.observe(canvas);
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { rootMargin: "100px" });
    intersection.observe(canvas);
    const animate = (now: number) => { frame = requestAnimationFrame(animate); if (visible && !document.hidden) draw(now); };
    if (!reducedMotion.matches) frame = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(frame); resize.disconnect(); intersection.disconnect(); };
  }, []);

  return (
    <figure className="research-map-shell relative overflow-hidden">
      <canvas ref={canvasRef} className="h-full w-full" role="img" aria-label="World map showing Sonal's portfolio base in Karkala and the current visitor's approximate IP-based location" />
      <div className="pointer-events-none absolute inset-x-4 bottom-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-black/55 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.1em] text-neutral-400 backdrop-blur-md">
        <span><span className="mr-2 inline-block size-2 rounded-full bg-[#c3f4ff] shadow-[0_0_10px_#c3f4ff]" />Karkala, India</span>
        {visitor ? <span><span className="mr-2 inline-block size-2 animate-pulse rounded-full bg-emerald-400" />{visitor.city}, {visitor.country} · {localTime} {visitor.timezone}</span> : <span>Visitor signal unavailable</span>}
      </div>
      <figcaption className="sr-only">Approximate visitor location is derived from IP data without requesting precise device location or storing personal information.</figcaption>
    </figure>
  );
}
