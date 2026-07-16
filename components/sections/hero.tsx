"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, FileText, GitBranch, Mail, Network, RadioTower } from "lucide-react";
import { useState } from "react";

import { GlitterName } from "@/components/effects/glitter-name";
import { RobotFace } from "@/components/effects/robot-face";
import { usePrefersReducedMotion } from "@/components/effects/use-prefers-reduced-motion";
import { Card } from "@/components/ui/card";
import { GlassButton } from "@/components/ui/glass-button";
import { SplineScene } from "@/components/ui/splite";
import { Spotlight } from "@/components/ui/spotlight";

const modes = ["ASCII", "3D"] as const;

export function Hero() {
  const [mode, setMode] = useState<(typeof modes)[number]>("ASCII");
  const reducedMotion = usePrefersReducedMotion();

  return (
    <section id="home" className="relative scroll-mt-28 px-3 pt-24 md:px-6 md:pt-28">
      <Card className="hero-card relative mx-auto min-h-[760px] w-full max-w-7xl overflow-hidden border-white/15 bg-[#07080c]/60 md:min-h-[700px]">
        <AnimatePresence mode="wait">
          {mode === "3D" && (
            <motion.div
              key="spline"
              className="absolute inset-0 left-[24%] bg-black/45"
              initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0.1 : 0.35 }}
            >
              <SplineScene
                scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                className="h-full w-full"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="hero-grid-overlay absolute inset-0" aria-hidden="true" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.92)_0%,rgba(0,0,0,.76)_45%,rgba(0,0,0,.14)_78%,rgba(0,0,0,.46)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#07080c] via-[#07080c]/70 to-transparent" />
        <Spotlight className="z-[2] from-[#c3f4ff]/45 via-[#B497CF]/20 to-transparent" size={360} springOptions={{ stiffness: 180, damping: 28, mass: 0.6 }} />

        <div className="absolute right-4 top-4 z-30 md:right-6 md:top-6">
          <div className="glass-panel flex rounded-full p-1" role="group" aria-label="Hero visual mode">
            {modes.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                className="geist-pixel-heading relative flex min-h-11 min-w-[68px] items-center justify-center rounded-full px-4 text-xs tracking-[0.12em] text-neutral-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B497CF]"
                aria-pressed={mode === item}
              >
                {mode === item && <motion.span layoutId="hero-mode-pill" className="absolute inset-0 rounded-full border border-white/20 bg-white/[0.13] shadow-[inset_0_1px_0_rgba(255,255,255,.28)]" transition={{ type: "spring", stiffness: 300, damping: 30 }} />}
                <span className="relative z-10">{item}</span>
              </button>
            ))}
          </div>
        </div>

        {mode === "ASCII" && <div className="absolute right-[5%] top-[23%] z-10 hidden lg:block"><RobotFace /></div>}

        <div className="relative z-20 flex min-h-[760px] items-end px-5 pb-8 pt-28 md:min-h-[700px] md:items-center md:px-12 md:pb-12 md:pt-24 lg:px-16">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, x: reducedMotion ? 0 : -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08, duration: 0.35 }} className="mb-6 flex flex-wrap items-center gap-3">
              <span className="glass-pill inline-flex min-h-9 items-center gap-2 px-3 text-[10px] uppercase tracking-[0.2em] text-neutral-300">
                <RadioTower size={13} className="text-[#c3f4ff]" aria-hidden="true" /> Embedded systems · Edge AI
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">node://mangalore.in</span>
            </motion.div>

            <GlitterName />
            <motion.p initial={{ opacity: 0, y: reducedMotion ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reducedMotion ? 0.1 : 1.05, duration: 0.35 }} className="geist-pixel-heading mt-5 text-base tracking-[0.04em] text-[#B497CF] sm:text-lg md:text-xl">
              Bridging Circuits, Code, and Cognition.
            </motion.p>
            <motion.p initial={{ opacity: 0, y: reducedMotion ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reducedMotion ? 0.12 : 1.14, duration: 0.35 }} className="mt-4 max-w-2xl text-base leading-7 text-neutral-200 md:text-lg md:leading-8">
              I turn sensor data and camera feeds into real-time decisions on constrained hardware — from firmware-level drivers to edge computer-vision pipelines.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: reducedMotion ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reducedMotion ? 0.14 : 1.24, duration: 0.35 }} className="mt-7 flex flex-wrap gap-3">
              <GlassButton href="#projects" icon={<ArrowDown size={16} aria-hidden="true" />}>Explore systems</GlassButton>
              <GlassButton href="/resume.pdf" target="_blank" rel="noopener noreferrer" download icon={<FileText size={16} aria-hidden="true" />}>View Résumé</GlassButton>
              <GlassButton href="https://github.com/sonalhegde" target="_blank" rel="noreferrer" icon={<GitBranch size={16} aria-hidden="true" />} aria-label="Open Sonal Hegde’s GitHub">GitHub</GlassButton>
              <GlassButton href="https://linkedin.com/in/sonalhegde" target="_blank" rel="noreferrer" icon={<Network size={16} aria-hidden="true" />} className="hidden sm:inline-flex" aria-label="Open Sonal Hegde’s LinkedIn">LinkedIn</GlassButton>
              <GlassButton href="mailto:sonalhhegde@gmail.com" icon={<Mail size={16} aria-hidden="true" />} className="hidden sm:inline-flex">Email</GlassButton>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-5 right-5 z-20 hidden items-center gap-4 md:flex">
          <span className="text-right font-mono text-[9px] uppercase leading-4 tracking-[0.18em] text-neutral-500">Visual layer<br />{mode === "ASCII" ? "Canvas2D / Site grid" : "Spline / WebGL"}</span>
          <span className="signal-bars" aria-hidden="true"><i /><i /><i /><i /></span>
        </div>
      </Card>
    </section>
  );
}
