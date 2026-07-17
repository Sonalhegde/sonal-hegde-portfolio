"use client";

import { ArrowRight, MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

type LocationTagProps = {
  city: string;
  country: string;
  timeZone: string;
  className?: string;
};

function localTime(timeZone: string) {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZoneName: "short",
    }).formatToParts(new Date());
    const value = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((part) => part.type === type)?.value ?? "";
    return `${value("hour")}:${value("minute")} ${value("timeZoneName")}`.trim();
  } catch {
    return "Local time unavailable";
  }
}

export function LocationTag({
  city,
  country,
  timeZone,
  className,
}: LocationTagProps) {
  const [time, setTime] = useState("--:--");
  const label = useMemo(() => `${city}, ${country}`, [city, country]);

  useEffect(() => {
    const update = () => setTime(localTime(timeZone));
    update();
    const interval = window.setInterval(update, 1_000);
    return () => window.clearInterval(interval);
  }, [timeZone]);

  return (
    <div
      className={cn(
        "group inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-neutral-100 shadow-[0_8px_32px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-md transition-[border-color,background-color,box-shadow] duration-300 ease-out hover:border-cyan-400/40 hover:bg-white/[0.08] hover:shadow-[0_0_24px_rgba(34,211,238,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B497CF] focus-visible:ring-offset-2 focus-visible:ring-offset-black",
        className,
      )}
      tabIndex={0}
      role="status"
      aria-label={`${label}. Local time ${time}. Approximate IP-based location.`}
    >
      <span className="relative flex size-2 shrink-0" aria-hidden="true">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:animate-none" />
        <span className="relative inline-flex size-2 rounded-full bg-emerald-400 shadow-[0_0_9px_rgba(52,211,153,0.75)]" />
      </span>
      <MapPin size={15} className="shrink-0 text-[#c3f4ff]" aria-hidden="true" />
      <span className="relative h-5 min-w-[9.5rem] overflow-hidden whitespace-nowrap">
        <span className="absolute inset-0 flex items-center transition-all duration-300 ease-out group-hover:-translate-y-full group-hover:opacity-0 group-focus:-translate-y-full group-focus:opacity-0">
          {label}
        </span>
        <span className="absolute inset-0 flex translate-y-full items-center font-mono text-xs text-[#c3f4ff] opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus:translate-y-0 group-focus:opacity-100">
          {time}
        </span>
      </span>
      <ArrowRight
        size={14}
        className="shrink-0 text-neutral-400 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-rotate-45 group-focus:translate-x-0.5 group-focus:-rotate-45"
        aria-hidden="true"
      />
    </div>
  );
}
