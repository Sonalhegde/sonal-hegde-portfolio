"use client";

import { useCallback, useState } from "react";

// Reduced-fidelity robot for lite-mode devices: a single inline SVG driven by
// CSS keyframe loops (idle bob, sway, blink) with a tap-triggered wave. No
// WebGL, no per-frame JS, no network asset — the whole variant is a few KB.
export function RobotLite() {
  const [waving, setWaving] = useState(false);

  const triggerWave = useCallback(() => {
    setWaving(true);
    window.setTimeout(() => setWaving(false), 1600);
  }, []);

  return (
    <button
      type="button"
      className={`robot-lite${waving ? " is-waving" : ""}`}
      onClick={triggerWave}
      aria-label="Sonal's robot mascot. Tap to make it wave."
    >
      <span className="robot-lite__halo" aria-hidden="true" />
      <svg
        className="robot-lite__figure"
        viewBox="0 0 200 260"
        role="img"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="robot-lite-body" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--robot-lite-body-hi, #2a3140)" />
            <stop offset="0.55" stopColor="var(--robot-lite-body, #141925)" />
            <stop offset="1" stopColor="var(--robot-lite-body-lo, #05070d)" />
          </linearGradient>
          <linearGradient id="robot-lite-joint" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--robot-lite-joint-hi, #3d475c)" />
            <stop offset="1" stopColor="var(--robot-lite-joint, #11151e)" />
          </linearGradient>
          <radialGradient id="robot-lite-visor" cx="0.5" cy="0.42" r="0.75">
            <stop offset="0" stopColor="var(--robot-lite-visor-hi, #10233a)" />
            <stop offset="1" stopColor="var(--robot-lite-visor, #02040a)" />
          </radialGradient>
        </defs>

        {/* shadow */}
        <ellipse className="robot-lite__shadow" cx="100" cy="248" rx="52" ry="8" />

        {/* left arm (background) */}
        <g className="robot-lite__arm robot-lite__arm--left">
          <rect x="34" y="106" width="18" height="52" rx="9" fill="url(#robot-lite-joint)" />
          <rect x="36" y="152" width="14" height="42" rx="7" fill="url(#robot-lite-body)" />
        </g>

        {/* right arm — pivot group for the wave gesture */}
        <g className="robot-lite__arm robot-lite__arm--right">
          <rect x="148" y="106" width="18" height="52" rx="9" fill="url(#robot-lite-joint)" />
          <rect x="150" y="152" width="14" height="42" rx="7" fill="url(#robot-lite-body)" />
        </g>

        {/* torso */}
        <rect x="62" y="96" width="76" height="88" rx="24" fill="url(#robot-lite-body)" />
        <rect x="76" y="112" width="48" height="26" rx="10" fill="url(#robot-lite-visor)" opacity="0.8" />
        <circle className="robot-lite__chest-light" cx="100" cy="125" r="5" />

        {/* neck + head */}
        <rect x="90" y="78" width="20" height="20" rx="6" fill="url(#robot-lite-joint)" />
        <g className="robot-lite__head">
          <rect x="52" y="14" width="96" height="70" rx="30" fill="url(#robot-lite-body)" />
          <rect x="62" y="28" width="76" height="40" rx="18" fill="url(#robot-lite-visor)" />
          <g className="robot-lite__eyes">
            <rect x="74" y="45" width="12" height="6" rx="3" />
            <rect x="94" y="45" width="12" height="6" rx="3" />
            <rect x="114" y="45" width="12" height="6" rx="3" />
          </g>
          <line x1="100" y1="14" x2="100" y2="4" stroke="url(#robot-lite-joint)" strokeWidth="3" />
          <circle className="robot-lite__antenna" cx="100" cy="4" r="4" />
        </g>

        {/* legs */}
        <rect x="72" y="182" width="22" height="48" rx="10" fill="url(#robot-lite-joint)" />
        <rect x="106" y="182" width="22" height="48" rx="10" fill="url(#robot-lite-joint)" />
        <rect x="64" y="228" width="34" height="14" rx="7" fill="url(#robot-lite-body)" />
        <rect x="102" y="228" width="34" height="14" rx="7" fill="url(#robot-lite-body)" />
      </svg>
    </button>
  );
}
