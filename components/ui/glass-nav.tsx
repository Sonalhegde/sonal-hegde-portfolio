"use client";

import { motion } from "framer-motion";
import { CircuitBoard, FileText, Mail } from "lucide-react";
import { useEffect, useState } from "react";

const items = [
  { label: "Home", href: "#home" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Education", href: "#education" },
  { label: "Certs", href: "#certifications" },
  { label: "Contact", href: "#contact" },
];

export function GlassNav() {
  const [active, setActive] = useState("home");
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const sections = items.map(({ href }) => document.querySelector(href)).filter(Boolean) as Element[];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-25% 0px -60%", threshold: [0.05, 0.35, 0.6] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const displayActive = hovered ?? active;

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-6 md:pt-5">
      <nav className="glass-panel pointer-events-auto mx-auto flex max-w-7xl items-center gap-2 rounded-full p-2" aria-label="Primary navigation">
        <a href="#home" className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.07] text-[#c3f4ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B497CF]" aria-label="Sonal Hegde — home">
          <CircuitBoard size={19} aria-hidden="true" />
        </a>
        <div className="no-scrollbar flex flex-1 items-center overflow-x-auto" onMouseLeave={() => setHovered(null)}>
          {items.map((item) => {
            const id = item.href.slice(1);
            const selected = displayActive === id;
            return (
              <a key={item.href} href={item.href} onMouseEnter={() => setHovered(id)} onFocus={() => setHovered(id)} onBlur={() => setHovered(null)} onClick={() => setActive(id)} className="geist-pixel-heading relative flex min-h-11 shrink-0 items-center justify-center rounded-full px-3 text-[11px] tracking-[0.07em] text-neutral-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B497CF] md:px-4 md:text-xs" aria-current={active === id ? "page" : undefined}>
                {selected && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full border border-white/20 bg-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_4px_18px_rgba(0,0,0,0.25)]" transition={{ type: "spring", stiffness: 300, damping: 30 }} />}
                <span className="relative z-10">{item.label}</span>
              </a>
            );
          })}
        </div>
        <a href="mailto:sonalhhegde@gmail.com" className="hidden size-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-neutral-300 hover:border-[#B497CF]/40 hover:text-[#c3f4ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B497CF] sm:flex" aria-label="Email Sonal Hegde"><Mail size={17} /></a>
        <motion.a href="/resume.pdf" target="_blank" rel="noopener noreferrer" download whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-[#B497CF]/30 bg-[#B497CF]/10 px-3 text-xs font-medium text-neutral-100 hover:border-[#B497CF]/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B497CF] md:px-4">
          <FileText size={15} aria-hidden="true" /><span className="hidden lg:inline">Résumé</span>
        </motion.a>
      </nav>
    </header>
  );
}
