"use client";

import { useEffect, useRef } from "react";

function useLookAt(faceRef: React.RefObject<HTMLDivElement | null>, maxOffsetPx = 6) {
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = window.matchMedia("(pointer: coarse)");
    const clampedOffset = Math.min(6, Math.max(0, maxOffsetPx));
    let pointerSeen = false;

    const onMove = (event: PointerEvent) => {
      if (reducedMotion.matches || coarsePointer.matches) return;
      pointerSeen = true;
      const rect = faceRef.current?.getBoundingClientRect();
      if (!rect) return;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = event.clientX - cx;
      const dy = event.clientY - cy;
      const dist = Math.min(Math.hypot(dx, dy), 400);
      const angle = Math.atan2(dy, dx);
      target.current = {
        x: Math.cos(angle) * (dist / 400) * clampedOffset,
        y: Math.sin(angle) * (dist / 400) * clampedOffset,
      };
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    const startedAt = performance.now();
    const tick = (now: number) => {
      if (reducedMotion.matches) {
        target.current = { x: 0, y: 0 };
      } else if (coarsePointer.matches || !pointerSeen) {
        const phase = (now - startedAt) / 1900;
        target.current = {
          x: Math.sin(phase) * clampedOffset * 0.62,
          y: Math.sin(phase * 0.67 + 0.8) * clampedOffset * 0.38,
        };
      }
      current.current.x += (target.current.x - current.current.x) * 0.15;
      current.current.y += (target.current.y - current.current.y) * 0.15;
      faceRef.current?.style.setProperty("--look-x", `${current.current.x.toFixed(2)}px`);
      faceRef.current?.style.setProperty("--look-y", `${current.current.y.toFixed(2)}px`);
      faceRef.current?.style.setProperty("--head-tilt", `${(current.current.x * 0.45).toFixed(2)}deg`);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [faceRef, maxOffsetPx]);

  return current;
}

export function RobotFace() {
  const faceRef = useRef<HTMLDivElement>(null);
  useLookAt(faceRef, 6);

  return (
    <div className="robot-shell" aria-label="Cursor-reactive robot observer">
      <div ref={faceRef} className="robot-face">
        <span className="robot-antenna" aria-hidden="true"><i /></span>
        <div className="robot-brow" aria-hidden="true"><span>OPTIC.01</span><span>ONLINE</span></div>
        <div className="robot-eyes" aria-hidden="true">
          <span className="robot-eye"><i className="robot-pupil" /></span>
          <span className="robot-eye"><i className="robot-pupil" /></span>
        </div>
        <div className="robot-mouth" aria-hidden="true"><i /><i /><i /><i /><i /></div>
      </div>
      <span className="robot-label">Pointer telemetry</span>
    </div>
  );
}
