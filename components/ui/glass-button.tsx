"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { type PointerEvent, type ReactNode, useState } from "react";

import { usePrefersReducedMotion } from "@/components/effects/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

type GlassButtonProps = Omit<HTMLMotionProps<"a">, "children"> & {
  children?: ReactNode;
  icon?: ReactNode;
  staticLabel?: boolean;
};

export function GlassButton({
  className,
  children,
  icon,
  staticLabel = false,
  ...props
}: GlassButtonProps) {
  const [pressed, setPressed] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const trackPointer = (event: PointerEvent<HTMLAnchorElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--btn-x", `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty("--btn-y", `${event.clientY - bounds.top}px`);
  };

  return (
    <motion.a
      whileHover={staticLabel || reducedMotion ? undefined : { scale: 1.025, y: -1 }}
      whileTap={staticLabel || reducedMotion ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      onPointerMove={trackPointer}
      onPointerDown={() => !staticLabel && setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      className={cn(
        "glass-pill glass-pill-interactive relative inline-flex min-h-11 items-center justify-center gap-2 px-4 text-sm font-medium text-[var(--text-primary)] transition-[border-color,background-color,box-shadow] duration-200 hover:border-[var(--glass-border-hover)] hover:bg-[var(--chip-bg)] hover:shadow-[0_0_0_1px_rgba(195,244,255,.18),0_10px_30px_-8px_rgba(30,111,255,.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-secondary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)] active:duration-75",
        pressed && "glass-pill-pressed",
        staticLabel && "cursor-default",
        className,
      )}
      {...props}
    >
      <span className="glass-pill-glow" aria-hidden="true" />
      <span className="relative z-10 inline-flex items-center gap-2">
        {icon}
        {children}
      </span>
    </motion.a>
  );
}
