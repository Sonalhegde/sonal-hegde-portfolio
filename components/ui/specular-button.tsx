"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SpecularButtonProps = Omit<HTMLMotionProps<"a">, "children"> & {
  children: ReactNode;
  icon?: ReactNode;
};

export function SpecularButton({ children, icon, className, ...props }: SpecularButtonProps) {
  return (
    <motion.a
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "specular-button inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium text-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c3f4ff] focus-visible:ring-offset-2 focus-visible:ring-offset-black",
        className,
      )}
      {...props}
    >
      <span className="specular-button-shine" aria-hidden="true" />
      <span className="relative z-10 inline-flex items-center gap-2">{icon}{children}</span>
    </motion.a>
  );
}
