"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

import { usePrefersReducedMotion } from "@/components/effects/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

export function ScrollReveal({ className, ...props }: HTMLMotionProps<"div">) {
  const reducedMotion = usePrefersReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reducedMotion ? 4 : 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: reducedMotion ? 0.15 : 0.38, ease: [0.22, 1, 0.36, 1] }}
      className={cn(className)}
      {...props}
    />
  );
}
