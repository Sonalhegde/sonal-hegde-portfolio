"use client";

import { motion, useReducedMotion } from "framer-motion";

const SPARKS = [
  { x: -20, y: -18, delay: 0.02, glyph: "+" },
  { x: 18, y: -22, delay: 0.08, glyph: "✦" },
  { x: 23, y: 9, delay: 0.04, glyph: "+" },
  { x: -16, y: 18, delay: 0.1, glyph: "·" },
];

export function GlitterName() {
  const reducedMotion = useReducedMotion();
  const letters = Array.from("Sonal Hegde");

  return (
    <motion.h1
      aria-label="Sonal Hegde"
      className="geist-pixel-heading metallic-name relative flex flex-wrap text-[clamp(3.35rem,9vw,7.6rem)] leading-[0.84] tracking-[-0.06em]"
      initial="hidden"
      animate="shown"
      variants={{
        hidden: {},
        shown: {
          transition: {
            staggerChildren: reducedMotion ? 0.015 : 0.052,
            delayChildren: 0.18,
          },
        },
      }}
    >
      {letters.map((letter, index) => (
        <motion.span
          key={`${letter}-${index}`}
          className="relative inline-block"
          aria-hidden="true"
          variants={{
            hidden: {
              opacity: 0,
              y: reducedMotion ? 3 : 12,
              rotate: reducedMotion ? 0 : index % 2 ? 2.5 : -2.5,
            },
            shown: {
              opacity: 1,
              y: 0,
              rotate: 0,
              transition: { type: "spring", stiffness: 300, damping: 26 },
            },
          }}
        >
          {letter === " " ? "\u00A0" : letter}
          {!reducedMotion &&
            letter !== " " &&
            SPARKS.slice(0, 3 + (index % 2)).map((spark, sparkIndex) => (
              <motion.i
                key={sparkIndex}
                className="pointer-events-none absolute left-1/2 top-1/2 not-italic text-[9px] text-[#c3f4ff] drop-shadow-[0_0_7px_#B497CF]"
                initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  x: [0, spark.x],
                  y: [0, spark.y],
                  scale: [0, 1, 0.2],
                }}
                transition={{
                  duration: 0.5,
                  delay: 0.18 + index * 0.052 + spark.delay,
                  ease: "easeOut",
                }}
              >
                {spark.glyph}
              </motion.i>
            ))}
        </motion.span>
      ))}
    </motion.h1>
  );
}
