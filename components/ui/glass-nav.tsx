"use client";

import { motion } from "framer-motion";
import { CircuitBoard } from "lucide-react";
import { useEffect, useState } from "react";

const items = [
  { label: "Home", href: "#home" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Education", href: "#education" },
  { label: "Contact", href: "#contact" },
];

export function GlassNav() {
  const [active, setActive] = useState("home");
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const sections = items
      .map(({ href }) => document.querySelector(href))
      .filter(Boolean) as Element[];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
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
      <nav
        className="glass-panel pointer-events-auto mx-auto flex max-w-6xl items-center gap-3 rounded-full p-2"
        aria-label="Primary navigation"
      >
        <a
          href="#home"
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.07] text-[#c3f4ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B497CF]"
          aria-label="Sonal Hegde — home"
        >
          <CircuitBoard size={19} aria-hidden="true" />
        </a>
        <div
          className="no-scrollbar flex flex-1 items-center overflow-x-auto"
          onMouseLeave={() => setHovered(null)}
        >
          {items.map((item) => {
            const id = item.href.slice(1);
            const selected = displayActive === id;
            return (
              <a
                key={item.href}
                href={item.href}
                onMouseEnter={() => setHovered(id)}
                onFocus={() => setHovered(id)}
                onBlur={() => setHovered(null)}
                onClick={() => setActive(id)}
                className="geist-pixel-heading relative flex min-h-11 shrink-0 items-center justify-center rounded-full px-3.5 text-[12px] tracking-[0.08em] text-neutral-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B497CF] md:px-5 md:text-sm"
                aria-current={active === id ? "page" : undefined}
              >
                {selected && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full border border-white/20 bg-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_4px_18px_rgba(0,0,0,0.25)]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </a>
            );
          })}
        </div>
        <span className="hidden shrink-0 items-center gap-2 pr-3 text-[10px] uppercase tracking-[0.18em] text-neutral-500 lg:flex">
          <span className="status-dot" /> Available to build
        </span>
      </nav>
    </header>
  );
}
