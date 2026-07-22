"use client";

import { motion } from "framer-motion";
import { ArrowDown, FileText, GitBranch, Mail, Network, RadioTower } from "lucide-react";

import { GlitterName } from "@/components/effects/glitter-name";
import { usePrefersReducedMotion } from "@/components/effects/use-prefers-reduced-motion";
import { Card } from "@/components/ui/card";
import { BorderGlow } from "@/components/ui/border-glow";
import { GlassButton } from "@/components/ui/glass-button";
import { SplineScene } from "@/components/ui/splite";
import { Spotlight } from "@/components/ui/spotlight";
import { SpecularButton } from "@/components/ui/specular-button";

export function Hero() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <section id="home" className="relative scroll-mt-28 px-3 pt-24 md:px-6 md:pt-28">
      <Card className="hero-card relative mx-auto min-h-[780px] w-full max-w-7xl overflow-hidden border-white/15 bg-[#07080c]/60 md:min-h-[720px]">
        <div className="hero-robot-glow absolute right-0 top-12 z-[1] h-[34rem] w-full opacity-90 sm:inset-y-0 sm:top-0 sm:h-auto sm:w-[72%] lg:w-[60%]">
          <SplineScene
            scene="/hero-robot.splinecode"
            className="h-full w-full"
          />
        </div>

        <div className="hero-grid-overlay absolute inset-0" aria-hidden="true" />
        <div className="hero-text-scrim absolute inset-0 z-[2] bg-[linear-gradient(90deg,rgba(0,0,0,.94)_0%,rgba(0,0,0,.82)_42%,rgba(0,0,0,.24)_72%,rgba(0,0,0,.55)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 z-[2] h-44 bg-gradient-to-t from-[#07080c] via-[#07080c]/72 to-transparent" />
        <Spotlight className="z-[3] from-[#c3f4ff]/45 via-[#B497CF]/20 to-transparent" size={360} springOptions={{ stiffness: 180, damping: 28, mass: 0.6 }} />

        <div className="hero-copy-layer relative z-10 flex min-h-[780px] items-end px-5 pb-8 pt-28 md:min-h-[720px] md:items-center md:px-12 md:pb-12 md:pt-24 lg:px-16">
          <div className="hero-copy-panel min-w-0 max-w-3xl">
            <motion.div initial={{ opacity: 0, x: reducedMotion ? 0 : -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08, duration: 0.35 }} className="mb-6 flex flex-wrap items-center gap-3">
              <span className="glass-pill inline-flex min-h-9 items-center gap-2 px-3 text-[10px] uppercase tracking-[0.2em] text-neutral-300">
                <RadioTower size={13} className="text-[#c3f4ff]" aria-hidden="true" /> Embedded systems · Edge AI
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">node://india</span>
            </motion.div>

            <GlitterName />
            <motion.p initial={{ opacity: 0, y: reducedMotion ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reducedMotion ? 0.1 : 1.05, duration: 0.35 }} className="geist-pixel-heading mt-5 text-base tracking-[0.04em] text-[#B497CF] sm:text-lg md:text-xl">
              Bridging Circuits, Code, and Cognition.
            </motion.p>
            <motion.p initial={{ opacity: 0, y: reducedMotion ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reducedMotion ? 0.12 : 1.14, duration: 0.35 }} className="mt-4 max-w-2xl text-base leading-7 text-neutral-200 md:text-lg md:leading-8">
              I turn sensor data and camera feeds into reliable real-time decisions on constrained hardware — from firmware-level drivers to optimized edge computer-vision pipelines.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: reducedMotion ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reducedMotion ? 0.14 : 1.24, duration: 0.35 }} className="mt-7 flex flex-wrap gap-3">
              <SpecularButton href="#projects" icon={<ArrowDown size={16} aria-hidden="true" />}>Explore systems</SpecularButton>
              <GlassButton href="/cv" target="_blank" rel="noopener noreferrer" download="Sonal-Hegde-CV.pdf" icon={<FileText size={16} aria-hidden="true" />}>CV</GlassButton>
              <BorderGlow pill><GlassButton href="https://github.com/sonalhegde" target="_blank" rel="noreferrer" icon={<GitBranch size={16} aria-hidden="true" />} aria-label="Open Sonal Hegde’s GitHub">GitHub</GlassButton></BorderGlow>
              <BorderGlow pill className="hidden sm:inline-flex"><GlassButton href="https://linkedin.com/in/sonalhegde" target="_blank" rel="noreferrer" icon={<Network size={16} aria-hidden="true" />} aria-label="Open Sonal Hegde’s LinkedIn">LinkedIn</GlassButton></BorderGlow>
              <BorderGlow pill className="hidden sm:inline-flex"><GlassButton href="mailto:sonalhhegde@gmail.com" icon={<Mail size={16} aria-hidden="true" />}>Email</GlassButton></BorderGlow>
            </motion.div>
          </div>
        </div>

      </Card>
    </section>
  );
}
