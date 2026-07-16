"use client";

import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { feature } from "topojson-client";
import type { GeometryObject, Topology } from "topojson-specification";
import worldTopology from "world-atlas/land-110m.json";

type Place = {
  name: string;
  detail: string;
  coordinates: [number, number];
  align: CanvasTextAlign;
};

const PLACES: Place[] = [
  { name: "Mangalore", detail: "Home node", coordinates: [74.856, 12.9141], align: "right" },
  { name: "NITK Surathkal", detail: "Cyber-physical systems", coordinates: [74.7937, 13.0108], align: "left" },
  { name: "Sultan Qaboos University", detail: "Marine debris · edge AI", coordinates: [58.1691, 23.6004], align: "right" },
];

const topology = worldTopology as unknown as Topology;
const land = feature(topology, topology.objects.land as GeometryObject);

export function ResearchMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const projection = d3.geoNaturalEarth1();
    const path = d3.geoPath(projection, context);
    const graticule = d3.geoGraticule10();
    let width = 900;
    let height = 430;
    let frame = 0;
    let running = true;
    let visible = true;

    const drawRoute = (from: [number, number], to: [number, number], phase: number) => {
      const interpolate = d3.geoInterpolate(from, to);
      context.beginPath();
      for (let step = 0; step <= 80; step += 1) {
        const point = projection(interpolate(step / 80));
        if (!point) continue;
        if (step === 0) context.moveTo(point[0], point[1]);
        else context.lineTo(point[0], point[1]);
      }
      context.setLineDash([4, 6]);
      context.lineDashOffset = -phase;
      context.strokeStyle = "rgba(180,151,207,.7)";
      context.lineWidth = 1.2;
      context.stroke();
      context.setLineDash([]);
    };

    const draw = (now = 0) => {
      context.clearRect(0, 0, width, height);
      const backdrop = context.createLinearGradient(0, 0, width, height);
      backdrop.addColorStop(0, "rgba(30,111,255,.08)");
      backdrop.addColorStop(0.55, "rgba(7,8,12,.12)");
      backdrop.addColorStop(1, "rgba(180,151,207,.08)");
      context.fillStyle = backdrop;
      context.fillRect(0, 0, width, height);

      context.beginPath();
      path({ type: "Sphere" });
      context.fillStyle = "rgba(4,7,12,.62)";
      context.fill();
      context.strokeStyle = "rgba(195,244,255,.2)";
      context.lineWidth = 1;
      context.stroke();

      context.beginPath();
      path(graticule);
      context.strokeStyle = "rgba(30,111,255,.14)";
      context.lineWidth = 0.65;
      context.stroke();

      context.beginPath();
      path(land);
      context.fillStyle = "rgba(195,244,255,.1)";
      context.fill();
      context.strokeStyle = "rgba(195,244,255,.42)";
      context.lineWidth = 0.65;
      context.stroke();

      const phase = reducedMotion.matches ? 0 : now * 0.018;
      drawRoute(PLACES[0].coordinates, PLACES[1].coordinates, phase);
      drawRoute(PLACES[0].coordinates, PLACES[2].coordinates, phase);

      PLACES.forEach((place, index) => {
        const point = projection(place.coordinates);
        if (!point) return;
        const pulse = reducedMotion.matches ? 0 : (Math.sin(now * 0.003 + index * 1.8) + 1) / 2;
        const glow = context.createRadialGradient(point[0], point[1], 0, point[0], point[1], 7 + pulse * 5);
        glow.addColorStop(0, index === 0 ? "rgba(255,255,255,1)" : "rgba(195,244,255,.95)");
        glow.addColorStop(0.24, index === 2 ? "rgba(180,151,207,.82)" : "rgba(30,111,255,.72)");
        glow.addColorStop(1, "rgba(30,111,255,0)");
        context.fillStyle = glow;
        context.beginPath();
        context.arc(point[0], point[1], 12, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = "#f5f6fa";
        context.beginPath();
        context.arc(point[0], point[1], index === 0 ? 2.8 : 2.2, 0, Math.PI * 2);
        context.fill();

        const offsetX = place.align === "right" ? -13 : 13;
        const offsetY = index === 1 ? 25 : -9;
        context.textAlign = place.align;
        context.font = "600 10px ui-monospace, SFMono-Regular, Consolas, monospace";
        context.fillStyle = "rgba(245,246,250,.95)";
        context.fillText(place.name, point[0] + offsetX, point[1] + offsetY);
        context.font = "8px ui-monospace, SFMono-Regular, Consolas, monospace";
        context.fillStyle = "rgba(163,168,184,.9)";
        context.fillText(place.detail, point[0] + offsetX, point[1] + offsetY + 13);
      });
    };

    const resize = new ResizeObserver(([entry]) => {
      width = Math.max(300, Math.round(entry.contentRect.width));
      height = Math.max(300, Math.round(entry.contentRect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      projection.fitExtent([[18, 18], [width - 18, height - 18]], { type: "Sphere" });
      draw();
    });
    resize.observe(canvas);

    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    }, { rootMargin: "100px" });
    intersection.observe(canvas);

    const animate = (now: number) => {
      frame = requestAnimationFrame(animate);
      if (running && visible) draw(now);
    };
    if (!reducedMotion.matches) frame = requestAnimationFrame(animate);

    const onVisibility = () => {
      running = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <figure className="research-map-shell">
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        role="img"
        aria-label="World map linking Sonal's home base in Mangalore with NITK Surathkal and Sultan Qaboos University in Oman"
      />
      <figcaption className="sr-only">
        Research map showing Mangalore, NITK Surathkal, and Sultan Qaboos University in Muscat, Oman.
      </figcaption>
    </figure>
  );
}
