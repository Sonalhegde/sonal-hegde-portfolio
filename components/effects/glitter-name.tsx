"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { usePrefersReducedMotion } from "@/components/effects/use-prefers-reduced-motion";

const NAME = Array.from("Sonal Hegde");
const SCRAMBLE_CHARS = "!<>-_\\/[]{}—=+*^?#";
const LETTER_DELAY = 52;
const SCRAMBLE_FRAMES = 8;
const FRAME_MS = 25;
const SPARKS = [
  { x: -20, y: -18, delay: 0.02, glyph: "+" },
  { x: 18, y: -22, delay: 0.08, glyph: "✦" },
  { x: 23, y: 9, delay: 0.04, glyph: "+" },
  { x: -16, y: 18, delay: 0.1, glyph: "·" },
];

export function GlitterName() {
  const reducedMotion = usePrefersReducedMotion();
  const [letters, setLetters] = useState(NAME);
  const [locked, setLocked] = useState(() => NAME.map(() => false));

  useEffect(() => {
    const timers: number[] = [];
    if (reducedMotion) {
      const timer = window.setTimeout(() => {
        setLetters(NAME);
        setLocked(NAME.map(() => true));
      }, 0);
      return () => window.clearTimeout(timer);
    }

    timers.push(window.setTimeout(() => setLocked(NAME.map((character) => character === " ")), 0));
    NAME.forEach((finalCharacter, index) => {
      if (finalCharacter === " ") return;
      const timeout = window.setTimeout(() => {
        let frame = 0;
        const interval = window.setInterval(() => {
          if (frame >= SCRAMBLE_FRAMES) {
            window.clearInterval(interval);
            setLetters((current) => current.map((character, position) => position === index ? finalCharacter : character));
            setLocked((current) => current.map((value, position) => position === index ? true : value));
            return;
          }
          setLetters((current) => current.map((character, position) => position === index ? SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)] : character));
          frame += 1;
        }, FRAME_MS);
        timers.push(interval);
      }, 180 + index * LETTER_DELAY);
      timers.push(timeout);
    });
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [reducedMotion]);

  return (
    <h1 aria-label="Sonal Hegde" className="geist-pixel-heading metallic-name relative flex flex-nowrap whitespace-nowrap text-[clamp(2.25rem,10.5vw,3rem)] leading-[0.9] tracking-[-0.06em] sm:text-[clamp(3.35rem,9vw,7.6rem)] sm:leading-[0.84]">
      {letters.map((letter, index) => {
        const landed = reducedMotion || locked[index];
        return (
          <motion.span
            key={index}
            className="relative inline-block"
            aria-hidden="true"
            initial={false}
            animate={{
              opacity: landed ? 1 : 0.42,
              y: landed ? 0 : reducedMotion ? 0 : 12,
              rotate: landed || reducedMotion ? 0 : index % 2 ? 2.5 : -2.5,
              filter: landed ? "blur(0px)" : "blur(0.7px)",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
          >
            {letter === " " ? "\u00A0" : letter}
            {!reducedMotion && landed && NAME[index] !== " " && SPARKS.slice(0, 3 + (index % 2)).map((spark, sparkIndex) => (
              <motion.i
                key={`${index}-${sparkIndex}`}
                className="pointer-events-none absolute left-1/2 top-1/2 not-italic text-[9px] text-[#c3f4ff] drop-shadow-[0_0_7px_#B497CF]"
                initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0], x: [0, spark.x], y: [0, spark.y], scale: [0, 1, 0.2] }}
                transition={{ duration: 0.5, delay: spark.delay, ease: "easeOut" }}
              >
                {spark.glyph}
              </motion.i>
            ))}
          </motion.span>
        );
      })}
    </h1>
  );
}
