"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BookOpen,
  CircuitBoard,
  Cpu,
  GitBranch,
  GraduationCap,
  Layers3,
  Network,
  Mail,
  MapPin,
  RadioTower,
  Sparkles,
  Waves,
} from "lucide-react";
import type { ReactNode } from "react";

import { Hero } from "@/components/sections/hero";
import { Card, CardContent } from "@/components/ui/card";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassNav } from "@/components/ui/glass-nav";
import Globe from "@/components/ui/globe";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const experiences = [
  {
    index: "01",
    title: "Project Intern — Applied Cyber-Physical Systems",
    organization: "Center for System Design, National Institute of Technology Karnataka (NITK) Surathkal",
    meta: "On-site · June 2026 – Aug 2026",
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
    title: "Research Internship — Computer Vision for Marine Debris Detection",
    organization: "Sultan Qaboos University, Muscat, Oman",
    meta: "",
    icon: <Waves size={18} aria-hidden="true" />,
    bullets: [
      "Built a YOLOv8-based computer vision pipeline for real-time marine debris detection from drone imagery.",
      "Curated and annotated a custom floating-debris dataset, applying augmentation and transfer learning to exceed 90% detection accuracy.",
      "Optimized inference for NVIDIA Jetson Nano deployment and integrated detections with a live web dashboard.",
    ],
  },
];

const projects = [
  {
    title: "Digital Twin-Based Smart Transportation & Safety System",
    tech: ["ESP32", "Raspberry Pi", "MQTT", "CoAP", "ESP-NOW", "GSM"],
    icon: <Layers3 size={19} aria-hidden="true" />,
    description:
      "Architected an ongoing real-time digital-twin platform with 10+ sensor nodes; built a distributed 6-node ESP32 railway-crossing hazard-detection network with IR, smoke, and accident-detection sensors; integrated CoAP, MQTT, and ESP-NOW for edge communication; added a GSM emergency-response workflow and a Three.js-based interconnected digital-twin interface.",
  },
  {
    title: "Real-Time Energy Profiling System for IoT Devices",
    tech: ["STM32L476RG", "INA219", "ESP32-C3", "I2C"],
    icon: <Cpu size={19} aria-hidden="true" />,
    description:
      "Portable, low-cost energy profiling rig using an STM32L476RG master, INA219 power sensor, and ESP32-C3 device-under-test on a shared I2C bus; custom HAL + Arduino firmware measured voltage, current, power, and cumulative energy across five operating modes, identifying wireless communication as the dominant energy cost.",
  },
  {
    title: "Marine Debris Detection using YOLOv8",
    tech: ["Python", "OpenCV", "YOLOv8", "NVIDIA Jetson Nano"],
    icon: <Waves size={19} aria-hidden="true" />,
    description:
      "YOLOv8-based real-time marine-debris detection pipeline for drone imagery, built from a custom annotated dataset, optimized for Jetson Nano inference, and connected to a live web dashboard.",
    related: true,
  },
  {
    title: "Smart Medication Dispenser",
    tech: ["ESP32", "Embedded C", "AWS IoT Core"],
    icon: <CircuitBoard size={19} aria-hidden="true" />,
    description:
      "IoT-enabled dispenser with RTC-based scheduling, stepper-motor actuation, and cloud-based remote monitoring via AWS IoT Core for automated reminders and notifications — reduced medication errors by 85% in prototype testing.",
  },
  {
    title: "TruthSnap — Anti-Phishing Detection Tool",
    tech: ["Tesseract OCR", "Python", "NLP", "Computer Vision"],
    icon: <Sparkles size={19} aria-hidden="true" />,
    description:
      "Phishing-detection platform combining NLP, OCR, and computer vision to analyze suspicious URLs, page content, and visual threat indicators; 92% detection accuracy, Top 10 of 100+ teams at DevHost 2025.",
  },
  {
    title: "Kuldio — AI-Powered ESG Reporting Platform",
    tech: ["Python", "NLP", "Transformers"],
    icon: <BookOpen size={19} aria-hidden="true" />,
    description:
      "Transformer-based ESG compliance platform for EG Denmark, extracting, classifying, and reporting sustainability metrics from enterprise documents; automated the reporting pipeline and cut manual ESG reporting effort by 70%.",
  },
  {
    title: "VU Meter — Custom PCB Audio Visualizer",
    tech: ["LM3914", "PCB Design & Fabrication"],
    icon: <CircuitBoard size={19} aria-hidden="true" />,
    description:
      "Designed and fabricated a PCB-based audio visualizer with a 10-segment LED display — schematic capture, layout, assembly, and testing; optimized analog signal-conditioning for real-time visualization accuracy.",
  },
];

const skillGroups = [
  {
    title: "Programming",
    items: ["Python", "C++", "Embedded C", "Java", "JavaScript", "MATLAB", "Unix Shell"],
  },
  {
    title: "Embedded & Hardware",
    items: ["ESP32", "STM32", "Arduino", "Raspberry Pi", "FreeRTOS", "UART", "SPI", "I2C", "CAN", "PCB Design"],
  },
  {
    title: "Networks & IoT",
    items: ["MQTT", "CoAP", "HTTP / REST", "BLE", "Wi-Fi", "Zigbee", "ESP-NOW", "AWS IoT Core"],
  },
  {
    title: "AI / ML",
    items: ["PyTorch", "Hugging Face Transformers", "OpenCV", "YOLOv8", "NLP", "Edge AI"],
  },
  {
    title: "Web & Tools",
    items: ["Three.js", "Anime.js", "WebGL", "Git / GitHub", "Blender"],
  },
];

function SectionHeading({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
}) {
  return (
    <div className="mb-10 grid gap-4 md:mb-14 md:grid-cols-[minmax(0,1fr)_minmax(260px,.65fr)] md:items-end">
      <div>
        <p className="section-kicker">{eyebrow}</p>
        <h2 className="geist-pixel-heading mt-3 text-3xl tracking-[-0.03em] text-neutral-50 sm:text-4xl md:text-5xl">
          {title}
        </h2>
      </div>
      {copy && <p className="text-sm leading-6 text-neutral-400 md:text-base md:leading-7">{copy}</p>}
    </div>
  );
}

function TechTag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.045] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-neutral-400">
      {children}
    </span>
  );
}

export function Portfolio() {
  return (
    <div className="relative isolate overflow-clip">
      <div className="ambient-grid" aria-hidden="true" />
      <GlassNav />
      <main>
        <Hero />

        <section id="about" className="page-section scroll-mt-28">
          <ScrollReveal>
            <SectionHeading eyebrow="Profile // 00" title="Research prototypes, end to end." />
            <Card className="overflow-hidden">
              <CardContent className="grid gap-8 p-6 md:grid-cols-[1.25fr_.75fr] md:p-10">
                <div className="max-w-3xl text-lg leading-8 text-neutral-300 md:text-xl md:leading-9">
                  <p>
                    Sonal is an Electronics & Communication Engineering undergraduate focused on embedded systems,
                    IoT, cyber-physical systems, edge AI, and digital-twin research.
                  </p>
                  <p className="mt-4 text-neutral-400">
                    Her work moves across the full prototype stack — from firmware and multi-node sensor networks to
                    real-time integration, validation, and the interfaces that make physical systems observable.
                  </p>
                </div>
                <div className="lab-readout rounded-2xl border border-white/10 bg-black/30 p-5 font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-500">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span>System focus</span><span className="text-[#c3f4ff]">Active</span>
                  </div>
                  <dl className="mt-4 grid gap-3">
                    <div className="flex justify-between gap-4"><dt>Physical layer</dt><dd className="text-neutral-300">Sensors + PCB</dd></div>
                    <div className="flex justify-between gap-4"><dt>Edge layer</dt><dd className="text-neutral-300">Firmware + AI</dd></div>
                    <div className="flex justify-between gap-4"><dt>Network layer</dt><dd className="text-neutral-300">CoAP + MQTT</dd></div>
                    <div className="flex justify-between gap-4"><dt>Twin layer</dt><dd className="text-neutral-300">Realtime models</dd></div>
                  </dl>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </section>

        <section id="experience" className="page-section scroll-mt-28">
          <ScrollReveal>
            <SectionHeading
              eyebrow="Experience // 01"
              title="Applied research in the field."
              copy="Cyber-physical infrastructure and edge computer vision, built in academic research environments across India and Oman."
            />
            <div className="relative grid gap-5 before:absolute before:bottom-8 before:left-[25px] before:top-8 before:w-px before:bg-gradient-to-b before:from-[#B497CF]/70 before:via-[#c3f4ff]/30 before:to-transparent md:gap-7 md:before:left-[31px]">
              {experiences.map((experience) => (
                <Card key={experience.index} className="group relative ml-3 overflow-hidden transition-colors hover:border-[#B497CF]/35 md:ml-5">
                  <CardContent className="grid gap-6 p-6 md:grid-cols-[72px_minmax(0,1fr)] md:p-8">
                    <div className="relative z-10 flex size-12 items-center justify-center rounded-2xl border border-[#B497CF]/30 bg-[#B497CF]/10 text-[#c3f4ff] md:size-16">
                      {experience.icon}
                      <span className="absolute -right-3 -top-3 font-mono text-[9px] text-neutral-600">{experience.index}</span>
                    </div>
                    <div>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-medium tracking-[-0.02em] text-neutral-100 md:text-2xl">{experience.title}</h3>
                          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#B497CF]">{experience.organization}</p>
                        </div>
                        {experience.meta && <span className="glass-pill px-3 py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-neutral-400">{experience.meta}</span>}
                      </div>
                      <ul className="mt-6 grid gap-3 text-sm leading-6 text-neutral-400 md:text-[15px]">
                        {experience.bullets.map((bullet) => (
                          <li key={bullet} className="flex gap-3">
                            <span className="mt-[10px] size-1 shrink-0 rounded-full bg-[#c3f4ff] shadow-[0_0_8px_#c3f4ff]" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollReveal>
        </section>

        <section id="projects" className="page-section scroll-mt-28">
          <ScrollReveal>
            <SectionHeading
              eyebrow="Projects // 02"
              title="Seven systems. One through-line."
              copy="Each build connects hardware, communication, intelligence, or the human interface around a real physical problem."
            />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project, index) => (
                <motion.article
                  key={project.title}
                  whileHover={{ y: -5, scale: 1.005 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className={index === 0 ? "md:col-span-2 xl:col-span-2" : ""}
                >
                  <Card className="project-card group h-full min-h-[330px] overflow-hidden">
                    <CardContent className="flex h-full flex-col p-6 md:p-7">
                      <div className="flex items-center justify-between">
                        <span className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-[#c3f4ff] transition-colors group-hover:border-[#B497CF]/40 group-hover:bg-[#B497CF]/10">
                          {project.icon}
                        </span>
                        <span className="font-mono text-[10px] tracking-[0.2em] text-neutral-600">{String(index + 1).padStart(2, "0")} / 07</span>
                      </div>
                      <h3 className="mt-7 text-xl font-medium leading-7 tracking-[-0.025em] text-neutral-100 md:text-2xl">{project.title}</h3>
                      <p className="mt-4 flex-1 text-sm leading-6 text-neutral-400">{project.description}</p>
                      <div className="mt-6 flex flex-wrap gap-2">
                        {project.tech.map((item) => <TechTag key={item}>{item}</TechTag>)}
                      </div>
                      {project.related && (
                        <a href="#experience" className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-[#B497CF] hover:text-[#c3f4ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B497CF]">
                          Related Oman internship <ArrowUpRight size={13} aria-hidden="true" />
                        </a>
                      )}
                    </CardContent>
                  </Card>
                </motion.article>
              ))}
            </div>
          </ScrollReveal>
        </section>

        <section id="education" className="page-section scroll-mt-28">
          <ScrollReveal>
            <SectionHeading eyebrow="Education // 03" title="The engineering foundation." />
            <Card className="overflow-hidden">
              <CardContent className="grid items-center gap-6 p-6 md:grid-cols-[auto_minmax(0,1fr)_auto] md:p-9">
                <div className="flex size-14 items-center justify-center rounded-2xl border border-[#B497CF]/30 bg-[#B497CF]/10 text-[#c3f4ff] md:size-16">
                  <GraduationCap size={25} aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-xl font-medium text-neutral-100 md:text-2xl">B.Tech, Electronics & Communication Engineering</h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-400">NMAM Institute of Technology · affiliated to Nitte, Deemed to be University · Karnataka</p>
                </div>
                <div className="glass-pill w-fit px-4 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-[#B497CF]">Expected 2028</div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </section>

        <section id="skills" className="page-section scroll-mt-28">
          <ScrollReveal>
            <SectionHeading
              eyebrow="Toolchain // 04"
              title="From buses to browsers."
              copy="A compact working stack for instrumenting, connecting, modeling, and presenting cyber-physical systems."
            />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {skillGroups.map((group, index) => (
                <Card key={group.title} className={index === 1 ? "xl:row-span-2" : ""}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="geist-pixel-heading text-sm tracking-[0.08em] text-neutral-200">{group.title}</h3>
                      <span className="font-mono text-[9px] text-neutral-600">0{index + 1}</span>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {group.items.map((item) => <TechTag key={item}>{item}</TechTag>)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollReveal>
        </section>

        <section id="contact" className="page-section scroll-mt-28">
          <ScrollReveal>
            <Card className="contact-card relative overflow-hidden">
              <CardContent className="relative z-10 grid gap-8 p-7 md:grid-cols-[1fr_auto] md:items-end md:p-12">
                <div>
                  <p className="section-kicker">Signal open // 05</p>
                  <h2 className="geist-pixel-heading mt-4 max-w-3xl text-3xl tracking-[-0.03em] text-neutral-50 sm:text-4xl md:text-5xl">
                    Let’s build something that senses, thinks, and responds.
                  </h2>
                  <a href="mailto:sonalhhegde@gmail.com" className="mt-6 inline-block text-sm text-neutral-400 underline decoration-white/20 underline-offset-4 hover:text-[#c3f4ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B497CF]">
                    sonalhhegde@gmail.com
                  </a>
                </div>
                <div className="flex flex-wrap gap-3 md:max-w-[260px] md:justify-end">
                  <GlassButton href="https://github.com/sonalhegde" target="_blank" rel="noreferrer" icon={<GitBranch size={17} aria-hidden="true" />}>GitHub</GlassButton>
                  <GlassButton href="https://linkedin.com/in/sonalhegde" target="_blank" rel="noreferrer" icon={<Network size={17} aria-hidden="true" />}>LinkedIn</GlassButton>
                  <GlassButton href="mailto:sonalhhegde@gmail.com" icon={<Mail size={17} aria-hidden="true" />}>Email</GlassButton>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </section>

        <footer className="relative overflow-hidden px-3 pb-8 pt-14 md:px-6 md:pb-10 md:pt-24">
          <div className="mx-auto max-w-7xl border-t border-white/10 pt-12 text-center">
            <p className="section-kicker justify-center">Location node // online</p>
            <h2 className="geist-pixel-heading mt-4 text-3xl text-neutral-100 md:text-5xl">Based in Mangalore, India</h2>
            <Globe />
            <div className="relative z-10 -mt-10 flex justify-center">
              <GlassButton staticLabel role="note" icon={<MapPin size={16} aria-hidden="true" />}>
                Mangalore, Karnataka, India
              </GlassButton>
            </div>
            <div className="mt-16 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-[10px] uppercase tracking-[0.14em] text-neutral-600 sm:flex-row">
              <span>© 2026 Sonal Hegde</span>
              <span>Circuits · Code · Cognition</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
