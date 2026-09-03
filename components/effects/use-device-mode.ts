"use client";

import { useSyncExternalStore } from "react";

export type DeviceMode = "full" | "lite";

const MODE_OVERRIDE_KEY = "device-mode-override";

type NavigatorWithSignals = Navigator & {
  deviceMemory?: number;
  userAgentData?: { mobile?: boolean };
};

let currentMode: DeviceMode = "full";
const listeners = new Set<() => void>();
let initialized = false;

function emit() {
  listeners.forEach((listener) => listener());
}

// One shared capability snapshot for the whole app: UA / UA-CH mobile signal,
// touch-pointer capability, low memory/CPU, and the OS reduced-motion setting.
// Viewport width is deliberately NOT a signal — a narrow desktop window is not
// a phone. Reduced motion drops to lite on every device.
function computeDeviceMode(): DeviceMode {
  if (typeof window === "undefined") return "full";
  try {
    if (localStorage.getItem(MODE_OVERRIDE_KEY) === "lite") return "lite";
  } catch {
    // Storage unavailable — fall through to live signals.
  }
  // QA hook: force the lite experience via ?mode=lite for testing on desktop.
  try {
    if (new URLSearchParams(window.location.search).get("mode") === "lite") return "lite";
  } catch {
    // Ignore malformed URLs.
  }

  const navigatorWithSignals = navigator as NavigatorWithSignals;
  if (navigatorWithSignals.userAgentData?.mobile) return "lite";
  if (/Android|iPhone|iPod|IEMobile|Opera Mini/i.test(navigator.userAgent)) return "lite";
  if (window.matchMedia("(pointer: coarse)").matches || window.matchMedia("(hover: none)").matches) return "lite";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "lite";
  if (navigatorWithSignals.deviceMemory !== undefined && navigatorWithSignals.deviceMemory <= 4) return "lite";
  if (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4) return "lite";
  return "full";
}

// One-way runtime downgrade: if the main thread is consistently slow shortly
// after load, drop to the lite experience regardless of reported capability.
function measureFrameBudget() {
  let samples = 0;
  const deltas: number[] = [];
  let previous = performance.now();
  const tick = (now: number) => {
    deltas.push(now - previous);
    previous = now;
    samples += 1;
    if (samples < 30) {
      requestAnimationFrame(tick);
      return;
    }
    const sorted = [...deltas].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    if (median > 40 && currentMode === "full") {
      currentMode = "lite";
      emit();
    }
  };
  requestAnimationFrame(tick);
}

function ensureInitialized() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  currentMode = computeDeviceMode();
  const recompute = () => {
    const next = computeDeviceMode();
    if (next !== currentMode) {
      currentMode = next;
      emit();
    }
  };
  for (const query of ["(pointer: coarse)", "(hover: none)", "(prefers-reduced-motion: reduce)"]) {
    window.matchMedia(query).addEventListener("change", recompute);
  }
  window.setTimeout(measureFrameBudget, 1500);
}

function subscribe(onStoreChange: () => void) {
  ensureInitialized();
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

function getSnapshot(): DeviceMode {
  ensureInitialized();
  return currentMode;
}

function getServerSnapshot(): DeviceMode {
  return "full";
}

/** "full" renders the desktop experience; "lite" the reduced-fidelity one. */
export function useDeviceMode(): DeviceMode {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
