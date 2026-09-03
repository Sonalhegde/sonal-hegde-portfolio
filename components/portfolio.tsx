/* eslint-disable @next/next/no-img-element */
"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Award,
  BookOpen,
  CircuitBoard,
  Cpu,
  ExternalLink,
  FileText,
  GitBranch as Github,
  GraduationCap,
  Layers3,
  Mail,
  Network,
  Network as Linkedin,
  RadioTower,
  Sparkles,
  Waves,
} from "lucide-react";
import type { ReactNode } from "react";

import { ResearchMap } from "@/components/effects/research-map";
import { usePrefersReducedMotion } from "@/components/effects/use-prefers-reduced-motion";
import { sitePath } from "@/lib/site-path";
import { Hero } from "@/components/sections/hero";
import { Card, CardContent } from "@/components/ui/card";
import { BorderGlow } from "@/components/ui/border-glow";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassNav } from "@/components/ui/glass-nav";
import { InstitutionBadge } from "@/components/ui/institution-badge";
import { MobileViewNotice } from "@/components/ui/mobile-view-notice";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Section } from "@/components/ui/section";
import { SiteAssistant } from "@/components/ui/site-assistant";

const GMAIL_COMPOSE = "https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=sonalhhegde@gmail.com&su=Portfolio%20Inquiry";
const MAILTO = "mailto:sonalhhegde@gmail.com";
const CV_PATH = sitePath("/cv");

const experiences = [
  {
    index: "01",
    title: "Project Intern — Applied Cyber-Physical Systems",
    organization: (
      <><span>Center for System Design · </span><InstitutionBadge icon="🇮🇳">National Institute of Technology Karnataka, Surathkal</InstitutionBadge></>
    ),
    icon: <RadioTower size={18} aria-hidden="true" />,
    bullets: [
      "Contributed to a digital-twin-based smart transportation research initiative spanning embedded firmware, real-time sensor networks, and cyber-physical systems integration.",
      "Designed a multi-node sensing architecture with 10+ heterogeneous sensors (LiDAR, ultrasonic, temperature, vibration) connected to ESP32 edge nodes and a Raspberry Pi controller.",
      "Implemented CoAP device-to-device communication and MQTT publish–subscribe messaging for centralized data aggregation and real-time control.",
      "Developed controller logic synchronizing physical assets with digital-twin models, improving reliability analysis and predictive-maintenance readiness.",
    ],
  },
  {
    index: "02",
    title: "Research Intern — Marine Debris Detection with YOLO26",
    organization: <InstitutionBadge icon="🇴🇲">Sultan Qaboos University, Muscat, Oman</InstitutionBadge>,
    icon: <Waves size={18} aria-hidden="true" />,
    bullets: [
      "Built and trained a YOLO26 computer-vision pipeline to detect and localize marine debris in drone imagery.",
      "Curated and annotated a custom floating-debris dataset, using augmentation and transfer learning to exceed 90% detection accuracy.",
      "Integrated detections with a live web dashboard for real-time monitoring.",
    ],
  },
];

const projects = [
  {
    title: "Digital Twin-Based Smart Transportation & Safety System",
    tech: ["ESP32", "Raspberry Pi", "MQTT", "CoAP", "ESP-NOW", "GSM"],
    icon: <Layers3 size={19} aria-hidden="true" />,
    description: "Architected an ongoing real-time digital-twin platform with 10+ sensor nodes; built a distributed 6-node ESP32 railway-crossing hazard-detection network with IR, smoke, and accident-detection sensors; integrated CoAP, MQTT, and ESP-NOW; added a GSM emergency-response workflow and a Three.js interconnected twin.",
  },
  {
    title: "Real-Time Energy Profiling System for IoT Devices",
    tech: ["STM32L476RG", "INA219", "ESP32-C3", "I2C"],
    icon: <Cpu size={19} aria-hidden="true" />,
    description: "Built a portable, low-cost profiling rig with an STM32L476RG master, INA219 sensor, and ESP32-C3 device-under-test on shared I2C. Custom firmware measured voltage, current, power, and cumulative energy across five modes, identifying wireless communication as the dominant cost.",
  },
  {
    title: "Marine Debris Detection using YOLO26",
    tech: ["Python", "OpenCV", "YOLO26", "PyTorch"],
    icon: <Waves size={19} aria-hidden="true" />,
    description: "YOLO26 real-time marine-debris detection for drone imagery, built from a custom annotated dataset and connected to a live web dashboard.",
    related: true,
  },
  {
    title: "Smart Medication Dispenser",
    tech: ["ESP32", "Embedded C", "AWS IoT Core"],
    icon: <CircuitBoard size={19} aria-hidden="true" />,
    description: "IoT-enabled dispenser with RTC scheduling, stepper-motor actuation, and AWS IoT Core remote monitoring for automated reminders and notifications — reducing medication errors by 85% in prototype testing.",
  },
  {
    title: "TruthSnap — Anti-Phishing Detection Tool",
    tech: ["Tesseract OCR", "Python", "NLP", "Computer Vision"],
    icon: <Sparkles size={19} aria-hidden="true" />,
    description: "Phishing-detection platform combining NLP, OCR, and computer vision to analyze URLs, page content, and visual threat indicators; achieved 92% detection accuracy and placed Top 10 of 100+ teams at DevHost 2025.",
  },
  {
    title: "Kuldio — AI-Powered ESG Reporting Platform",
    tech: ["Python", "NLP", "Transformers"],
    icon: <BookOpen size={19} aria-hidden="true" />,
    description: "Transformer-based ESG compliance platform for EG Denmark that extracts, classifies, and reports sustainability metrics from enterprise documents, cutting manual reporting effort by 70%.",
  },
  {
    title: "VU Meter — Custom PCB Audio Visualizer",
    tech: ["LM3914", "PCB Design & Fabrication"],
    icon: <CircuitBoard size={19} aria-hidden="true" />,
    description: "Designed and fabricated a PCB audio visualizer with a 10-segment LED display, covering schematic capture, layout, assembly, testing, and analog signal-conditioning optimization.",
  },
];

const skillGroups = [
  { title: "Programming", items: ["Python", "C++", "Embedded C", "Java", "JavaScript", "MATLAB", "Unix Shell"] },
  { title: "Embedded & Hardware", items: ["ESP32", "STM32", "Arduino", "Raspberry Pi", "FreeRTOS", "UART", "SPI", "I2C", "CAN", "PCB Design"] },
  { title: "Networks & IoT", items: ["MQTT", "CoAP", "HTTP / REST", "BLE", "Wi-Fi", "Zigbee", "ESP-NOW", "AWS IoT Core"] },
  { title: "AI / ML", items: ["PyTorch", "Hugging Face Transformers", "OpenCV", "YOLO26", "NLP", "Edge AI"] },
  { title: "Web & Tools", items: ["Three.js", "Anime.js", "WebGL", "Git / GitHub", "Blender"] },
];

const profileKeywords = ["Embedded Systems", "Edge AI", "Computer Vision", "Real-Time Systems", "IoT", "Firmware", "TinyML", "Computer Networks", "Model Optimization", "Rapid Prototyping"];
const professionalSkills = ["Leadership", "Project Management", "Rapid Prototyping", "Research & Development", "Cross-functional Collaboration", "Technical Communication"];

interface Certification {
  title: string;
  issuer: string;
  issuerLogoUrl: string;
  dateIssued: string;
  credentialUrl?: string;
  featured?: boolean;
}

// Issuer-hosted marks are used without alteration. LinkedIn's public profile did not
// expose verifiable issue dates, so these are the user-approved year-only fallbacks.
// TODO: replace the year-only values and add credentialUrl when verified records are available.
const certifications: Certification[] = [
  { title: "Atlassian Certified Product Management Professional", issuer: "LinkedIn Learning & Atlassian", issuerLogoUrl: sitePath("/certifications/atlassian.ico"), dateIssued: "2026", featured: true },
  { title: "McKinsey Forward Program", issuer: "McKinsey.org", issuerLogoUrl: sitePath("/certifications/mckinsey.ico"), dateIssued: "2026" },
  { title: "Network Security Fundamentals", issuer: "Palo Alto Networks", issuerLogoUrl: sitePath("/certifications/palo-alto.ico"), dateIssued: "2026", featured: true },
  { title: "Introduction to MCP (Model Context Protocol)", issuer: "Anthropic", issuerLogoUrl: sitePath("/certifications/anthropic.ico"), dateIssued: "2026" },
  { title: "AI on Jetson Nano", issuer: "NVIDIA", issuerLogoUrl: sitePath("/certifications/nvidia.ico"), dateIssued: "2025" },
  { title: "AWS IoT Devices", issuer: "Amazon Web Services", issuerLogoUrl: sitePath("/certifications/aws.ico"), dateIssued: "2025" },
  { title: "Networking Basics", issuer: "Cisco", issuerLogoUrl: sitePath("/certifications/cisco.ico"), dateIssued: "2025", featured: true },
  { title: "Data Science & Analytics", issuer: "HP LIFE", issuerLogoUrl: sitePath("/certifications/hp-life.ico"), dateIssued: "2025" },
  { title: "Time Series Analysis", issuer: "Infosys", issuerLogoUrl: "https://www.infosys.com/favicon.ico", dateIssued: "2025" },
];

function SectionHeading({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) {
  return (
    <div className="mb-10 grid gap-4 md:mb-14 md:grid-cols-[minmax(0,1fr)_minmax(260px,.65fr)] md:items-end">
      <div><p className="section-kicker">{eyebrow}</p><h2 className="geist-pixel-heading mt-3 text-3xl tracking-[-0.03em] text-[var(--text-primary)] sm:text-4xl md:text-5xl">{title}</h2></div>
      {copy && <p className="text-sm leading-6 text-[var(--text-muted)] md:text-base md:leading-7">{copy}</p>}
    </div>
  );
}

function TechTag({ children }: { children: ReactNode }) {
  return <span className="rounded-full border border-[var(--card-border)] bg-[var(--chip-bg)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--text-body)]">{children}</span>;
}

export function Portfolio() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className="relative overflow-clip">
      <div className="ambient-grid" aria-hidden="true" />
      <GlassNav />
      <main>
        <Hero />

        <Section id="about">
          <ScrollReveal>
            <SectionHeading eyebrow="Profile // 00" title="Research prototypes, end to end." />
            <Card className="overflow-hidden">
              <CardContent className="grid gap-8 p-6 md:grid-cols-[1.35fr_.65fr] md:p-10">
                <div className="max-w-4xl text-base leading-8 text-[var(--text-primary)] md:text-lg md:leading-9">
                  <p>I’m Sonal Hegde, an Electronics and Communication Engineering undergraduate focused on embedded systems and edge AI, based in India. I design and validate end-to-end systems that turn sensor data and camera feeds into reliable, real-time decisions on constrained hardware — from firmware-level drivers and networked sensor nodes to optimized computer-vision pipelines.</p>
                  <p className="mt-4 text-[var(--text-muted)]">My recent work spans applied cyber-physical systems at <InstitutionBadge icon="🇮🇳">National Institute of Technology Karnataka, Surathkal</InstitutionBadge> and edge-deployed marine-debris detection with YOLO26 through work carried out at <InstitutionBadge icon="🇴🇲">Sultan Qaboos University</InstitutionBadge>. I am also developing a deeper interest in computer networks and in the coordination of distributed systems at scale.</p>
                  <p className="mt-4 text-[var(--text-muted)]">I am pursuing a B.Tech in Electronics & Communication Engineering, expected in 2028. I am open to internships and early-career opportunities in embedded engineering, edge AI, cyber-physical systems, IoT, and computer networks, as well as technology consulting and product-development roles where I can translate complex technical problems into robust, scalable products.</p>
                  <div className="mt-7 flex flex-wrap gap-2">{profileKeywords.map((item) => <TechTag key={item}>{item}</TechTag>)}</div>
                </div>
                <div className="lab-readout rounded-2xl border border-[var(--card-border)] bg-[var(--chip-bg-strong)] p-5 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-3"><span>Currently exploring</span><span className="text-[var(--accent-highlight)]">Active</span></div>
                  <div className="mt-5 flex items-center gap-3 rounded-xl border border-[#1e6fff]/30 bg-[#1e6fff]/10 p-4 text-[var(--text-primary)]"><Network size={17} className="text-[var(--accent-highlight)]" /><span>Computer Networks</span></div>
                  <dl className="mt-5 grid gap-3"><div className="flex justify-between gap-4"><dt>Programming</dt><dd className="text-right text-[var(--text-body)]">Python · C++ · C · Java · JavaScript</dd></div><div className="flex justify-between gap-4"><dt>Problem solving</dt><dd className="text-[var(--text-body)]">DSA · OOP</dd></div><div className="flex justify-between gap-4"><dt>Embedded</dt><dd className="text-right text-[var(--text-body)]">ESP32 · STM32 · FreeRTOS</dd></div><div className="flex justify-between gap-4"><dt>Networks</dt><dd className="text-right text-[var(--text-body)]">MQTT · CoAP · REST · BLE</dd></div><div className="flex justify-between gap-4"><dt>AI / Vision</dt><dd className="text-right text-[var(--text-body)]">PyTorch · YOLO26 · OpenCV</dd></div><div className="flex justify-between gap-4"><dt>Dev tools</dt><dd className="text-right text-[var(--text-body)]">Docker · Git · Linux · Three.js</dd></div></dl>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </Section>

        <Section id="experience">
          <ScrollReveal>
            <SectionHeading eyebrow="Experience // 01" title="Applied research in the field." copy="Cyber-physical infrastructure and edge computer vision, built in academic research environments across India and Oman." />
            <div className="grid gap-5 md:gap-7">
              {experiences.map((experience) => (
                <Card key={experience.index} className="group relative overflow-hidden transition-colors hover:border-[var(--accent-soft-strong)]">
                  <CardContent className="grid gap-6 p-6 md:grid-cols-[72px_minmax(0,1fr)] md:p-8">
                    <div className="flex size-12 items-center justify-center rounded-2xl border border-[var(--accent-soft-strong)] bg-[var(--accent-soft)] text-[var(--accent-highlight)] md:size-16">{experience.icon}</div>
                    <div><div><h3 className="text-xl font-medium tracking-[-0.02em] text-[var(--text-primary)] md:text-2xl">{experience.title}</h3><div className="mt-2 max-w-3xl text-sm leading-6 text-[var(--accent-secondary)]">{experience.organization}</div></div>
                      <ul className="mt-6 grid gap-3 text-sm leading-6 text-[var(--text-muted)] md:text-[15px]">{experience.bullets.map((bullet) => <li key={bullet} className="flex gap-3"><span className="mt-[10px] size-1 shrink-0 rounded-full bg-[#c3f4ff] shadow-[0_0_8px_#c3f4ff]" /><span>{bullet}</span></li>)}</ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollReveal>
        </Section>

        <Section id="projects">
          <ScrollReveal>
            <SectionHeading eyebrow="Projects // 02" title="Seven systems. One through-line." copy="Each build connects hardware, communication, intelligence, or the human interface around a real physical problem." />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project, index) => (
                <motion.article key={project.title} whileHover={reducedMotion ? undefined : { y: -4 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }} className={index === 0 ? "md:col-span-2 xl:col-span-2" : ""}>
                  <BorderGlow className="h-full"><Card className="project-card group h-full min-h-[330px] overflow-hidden"><CardContent className="flex h-full flex-col p-6 md:p-7"><div className="flex items-center justify-between"><span className="flex size-11 items-center justify-center rounded-2xl border border-[var(--card-border)] bg-[var(--chip-bg)] text-[var(--accent-highlight)] transition-colors group-hover:border-[var(--accent-soft-strong)] group-hover:bg-[var(--accent-soft)]">{project.icon}</span><span className="font-mono text-[10px] tracking-[0.2em] text-[var(--text-faint)]">{String(index + 1).padStart(2, "0")} / 07</span></div><h3 className="mt-7 text-xl font-medium leading-7 tracking-[-0.025em] text-[var(--text-primary)] md:text-2xl">{project.title}</h3><p className="mt-4 flex-1 text-sm leading-6 text-[var(--text-muted)]">{project.description}</p><div className="mt-6 flex flex-wrap gap-2">{project.tech.map((item) => <TechTag key={item}>{item}</TechTag>)}</div>{project.related && <a href="#experience" className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-[var(--accent-secondary)] hover:text-[var(--accent-highlight)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-secondary)]">Related Oman internship <ArrowUpRight size={13} /></a>}</CardContent></Card></BorderGlow>
                </motion.article>
              ))}
            </div>
          </ScrollReveal>
        </Section>

        <Section id="certifications">
          <ScrollReveal>
            <SectionHeading eyebrow="Credentials // 03" title="Certifications." copy="Credential titles are drawn from the CV. Years are shown at the requested year-only granularity; exact issue dates and verification links can be added when available." />
            <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {certifications.map((certification) => (
                <BorderGlow key={certification.title} className="h-full"><Card className={certification.featured ? "cert-card featured h-full sm:row-span-1" : "cert-card h-full"}>
                  <CardContent className="flex h-full flex-col p-6">
                    <div className="flex items-start justify-between gap-4">
                      <span className="relative flex size-12 items-center justify-center overflow-hidden rounded-xl border border-[var(--card-border)] bg-white/90 p-2 text-[#1e6fff]">
                        <Award size={22} aria-hidden="true" />
                        <img src={certification.issuerLogoUrl} alt={`${certification.issuer} logo`} loading="lazy" decoding="async" referrerPolicy="no-referrer" className="absolute inset-2 h-8 w-8 object-contain" onError={(event) => { event.currentTarget.style.display = "none"; }} />
                      </span>
                      {certification.featured && <span className="rounded-full border border-[var(--accent-soft-strong)] bg-[var(--accent-soft)] px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--accent-highlight)]">Industry recognized</span>}
                    </div>
                    <h3 className="mt-6 text-lg font-medium leading-6 text-[var(--text-primary)]">{certification.title}</h3><p className="mt-3 text-sm text-[var(--accent-secondary)]">{certification.issuer}</p><p className="mt-2 flex-1 text-[11px] text-[var(--text-muted)]">Issued {certification.dateIssued}</p>
                    {certification.credentialUrl && <a href={certification.credentialUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-xs text-[var(--accent-highlight)]">Verify credential <ExternalLink size={12} /></a>}
                  </CardContent>
                </Card></BorderGlow>
              ))}
            </div>
          </ScrollReveal>
        </Section>

        <Section id="education">
          <ScrollReveal>
            <SectionHeading eyebrow="Education // 04" title="The engineering foundation." />
            <div className="grid gap-4">
              {[
                { title: "B.Tech, Electronics & Communication Engineering", school: "NMAM Institute of Technology · affiliated to Nitte, Deemed to be University · Karnataka", meta: "Expected 2028" },
                { title: "Pre-University — PCMC", school: "Jnanasudha PU College, Karkala", meta: "2022–2024 · 95%" },
                { title: "SSLC", school: "Christ King School", meta: "2021–2022 · 97.28%" },
              ].map((entry) => <BorderGlow key={entry.title}><Card className="overflow-hidden"><CardContent className="grid items-center gap-5 p-6 md:grid-cols-[auto_minmax(0,1fr)_auto] md:p-8"><div className="flex size-14 items-center justify-center rounded-2xl border border-[var(--accent-soft-strong)] bg-[var(--accent-soft)] text-[var(--accent-highlight)]"><GraduationCap size={24} /></div><div><h3 className="text-lg font-medium text-[var(--text-primary)] md:text-xl">{entry.title}</h3><p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{entry.school}</p></div><div className="glass-pill w-fit px-4 py-3 font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--accent-secondary)]">{entry.meta}</div></CardContent></Card></BorderGlow>)}
            </div>
          </ScrollReveal>
        </Section>

        <Section id="skills">
          <ScrollReveal>
            <SectionHeading eyebrow="Toolchain // 05" title="From buses to browsers." copy="A compact working stack for instrumenting, connecting, modeling, and presenting cyber-physical systems." />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{skillGroups.map((group, index) => <Card key={group.title} className={index === 1 ? "xl:row-span-2" : ""}><CardContent className="p-6"><div className="flex items-center justify-between"><h3 className="geist-pixel-heading text-sm tracking-[0.08em] text-[var(--text-primary)]">{group.title}</h3><span className="font-mono text-[9px] text-[var(--text-faint)]">0{index + 1}</span></div><div className="mt-5 flex flex-wrap gap-2">{group.items.map((item) => <TechTag key={item}>{item}</TechTag>)}</div></CardContent></Card>)}</div>
          </ScrollReveal>
        </Section>

        <Section id="professional-skills">
          <ScrollReveal>
            <SectionHeading eyebrow="Practice // 06" title="Skills beyond the stack." copy="Professional habits that help research prototypes move from an idea to a shared, testable system." />
            <Card><CardContent className="flex flex-wrap gap-3 p-6 md:p-9">{professionalSkills.map((skill) => <span key={skill} className="glass-pill inline-flex min-h-11 items-center px-4 text-sm text-[var(--text-primary)]">{skill}</span>)}</CardContent></Card>
          </ScrollReveal>
        </Section>

        <Section id="contact">
          <ScrollReveal>
            <Card className="contact-card relative overflow-hidden"><CardContent className="relative z-10 grid gap-8 p-7 md:grid-cols-[1fr_auto] md:items-end md:p-12"><div><p className="section-kicker">Signal open // 07</p><h2 className="geist-pixel-heading mt-4 max-w-3xl text-3xl tracking-[-0.03em] text-[var(--text-primary)] sm:text-4xl md:text-5xl">Let’s build something that senses, thinks, and responds.</h2><a href={MAILTO} className="mt-6 inline-block text-sm text-[var(--text-body)] underline decoration-white/20 underline-offset-4 hover:text-[var(--accent-highlight)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-secondary)]">sonalhhegde@gmail.com</a><a href={GMAIL_COMPOSE} target="_blank" rel="noopener noreferrer" className="ml-4 inline-flex items-center gap-1.5 text-xs text-[var(--accent-secondary)] hover:text-[var(--accent-highlight)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-secondary)]">Open in Gmail <ExternalLink size={11} /></a></div><div className="flex flex-wrap gap-3 md:max-w-[360px] md:justify-end"><GlassButton href="https://github.com/sonalhegde" target="_blank" rel="noreferrer" icon={<Github size={17} />}>GitHub</GlassButton><GlassButton href="https://linkedin.com/in/sonalhegde" target="_blank" rel="noreferrer" icon={<Linkedin size={17} />}>LinkedIn</GlassButton><GlassButton href={MAILTO} icon={<Mail size={17} />}>Email</GlassButton><GlassButton href={CV_PATH} target="_blank" rel="noopener noreferrer" download="Sonal-Hegde-CV.pdf" icon={<FileText size={17} />}>CV</GlassButton></div></CardContent></Card>
          </ScrollReveal>
        </Section>

        <Section id="location" className="pb-12 md:pb-20">
          <ScrollReveal>
            <ResearchMap />
          </ScrollReveal>
        </Section>
      </main>

      <footer className="mx-auto max-w-7xl px-6 pb-28"><div className="flex flex-col items-center justify-between gap-3 border-t border-[var(--card-border)] pt-6 text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)] sm:flex-row"><span>© 2026 Sonal Hegde</span><span>Circuits · Code · Cognition</span></div></footer>
      <MobileViewNotice />
      <SiteAssistant />
    </div>
  );
}
