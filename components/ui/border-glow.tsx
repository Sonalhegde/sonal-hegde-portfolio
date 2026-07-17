"use client";

import type { PointerEvent, ReactNode } from "react";

import { cn } from "@/lib/utils";

export function BorderGlow({
  children,
  className,
  pill = false,
}: {
  children: ReactNode;
  className?: string;
  pill?: boolean;
}) {
  const trackPointer = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const style = event.currentTarget.style;
    style.setProperty("--glow-x", `${event.clientX - bounds.left}px`);
    style.setProperty("--glow-y", `${event.clientY - bounds.top}px`);
  };

  return (
    <div
      className={cn("border-glow", pill && "border-glow-pill", className)}
      onPointerMove={trackPointer}
    >
      {children}
    </div>
  );
}
