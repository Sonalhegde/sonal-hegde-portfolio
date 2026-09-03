"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { type PointerEvent, type ReactNode, useState } from "react";

import { usePrefersReducedMotion } from "@/components/effects/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

type SpecularButtonProps = Omit<HTMLMotionProps<"a">, "children"> & {
  children: ReactNode;
  icon?: ReactNode;
};

export function SpecularButton({ children, icon, className, ...props }: SpecularButtonProps) {
  const [pressed, setPressed] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const trackPointer = (event: PointerEvent<HTMLAnchorElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--btn-x", `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty("--btn-y", `${event.clientY - bounds.top}px`);
  };

  return (
    <motion.a
      whileHover={reducedMotion ? undefined : { scale: 1.03, y: -1 }}
      whileTap={reducedMotion ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      onPointerMove={trackPointer}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      className={cn(
        "specular-button relative inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium text-[var(--text-primary)] transition-shadow duration-200 hover:shadow-[0_0_0_1px_rgba(195,244,255,.3),0_14px_36px_-10px_rgba(34,211,238,.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-highlight)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)] active:duration-75",
        pressed && "glass-pill-pressed",
        className,
      )}
      {...props}
    >
      <span className="glass-pill-glow" aria-hidden="true" />
      <span className="specular-button-shine" aria-hidden="true" />
      <span className="relative z-10 inline-flex items-center gap-2">{icon}{children}</span>
    </motion.a>
  );
}
