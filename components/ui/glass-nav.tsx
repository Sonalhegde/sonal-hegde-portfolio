"use client";

import gsap from "gsap";
import { CircuitBoard, FileText, Mail, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const items = [
  { label: "Home", href: "#home" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Certs", href: "#certifications" },
  { label: "Education", href: "#education" },
  { label: "Contact", href: "#contact" },
];

export function GlassNav() {
  const navRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState("home");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced && navRef.current) {
      const context = gsap.context(() => {
        gsap.fromTo("[data-pill-nav]", { y: -18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.62, ease: "power3.out", stagger: 0.045 });
      }, navRef);
      return () => context.revert();
    }
  }, []);

  useEffect(() => {
    const sections = items.map(({ href }) => document.querySelector(href)).filter(Boolean) as Element[];
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target.id) setActive(visible.target.id);
    }, { rootMargin: "-25% 0px -60%", threshold: [0.05, 0.35, 0.6] });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <header ref={navRef} className="pointer-events-none fixed inset-x-0 top-0 z-[90] px-3 pt-3 md:px-6 md:pt-5">
      <nav className="glass-panel pointer-events-auto relative mx-auto flex max-w-7xl items-center gap-2 rounded-full p-2" aria-label="Primary navigation">
        <a data-pill-nav href="#home" className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.07] text-[#c3f4ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B497CF]" aria-label="Sonal Hegde — home">
          <CircuitBoard size={19} aria-hidden="true" />
        </a>
        <div className="hidden flex-1 items-center md:flex">
          {items.map((item) => {
            const id = item.href.slice(1);
            return <a data-pill-nav key={item.href} href={item.href} aria-current={active === id ? "page" : undefined} className={`pill-nav-link geist-pixel-heading ${active === id ? "active" : ""}`}>{item.label}</a>;
          })}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <a data-pill-nav href="mailto:sonalhhegde@gmail.com" className="hidden size-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-neutral-300 hover:border-[#B497CF]/40 hover:text-[#c3f4ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B497CF] sm:flex" aria-label="Email Sonal Hegde"><Mail size={17} /></a>
          <a data-pill-nav href="/cv" target="_blank" rel="noopener noreferrer" download="Sonal-Hegde-CV.pdf" className="flex min-h-11 items-center gap-2 rounded-full border border-[#B497CF]/30 bg-[#B497CF]/10 px-3 text-xs font-medium text-neutral-100 hover:border-[#B497CF]/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B497CF] md:px-4"><FileText size={15} /><span className="hidden lg:inline">CV</span></a>
          <button type="button" className="flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-neutral-200 md:hidden" aria-expanded={open} aria-controls="mobile-pill-menu" aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen((value) => !value)}>{open ? <X size={19} /> : <Menu size={19} />}</button>
        </div>
        {open && <div id="mobile-pill-menu" className="glass-panel absolute inset-x-0 top-[calc(100%+.55rem)] z-[100] grid rounded-3xl p-2 md:hidden">{items.map((item) => { const id = item.href.slice(1); return <a key={item.href} href={item.href} onClick={() => setOpen(false)} className={`pill-nav-mobile ${active === id ? "active" : ""}`}>{item.label}</a>; })}</div>}
      </nav>
    </header>
  );
}
