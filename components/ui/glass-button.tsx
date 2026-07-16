"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

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
  return (
    <motion.a
      whileHover={staticLabel ? undefined : { scale: 1.03 }}
      whileTap={staticLabel ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "glass-pill inline-flex min-h-11 items-center justify-center gap-2 px-4 text-sm font-medium text-neutral-100 transition-[border-color,background-color] hover:border-white/30 hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B497CF] focus-visible:ring-offset-2 focus-visible:ring-offset-black",
        staticLabel && "cursor-default",
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </motion.a>
  );
}
