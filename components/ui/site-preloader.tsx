"use client";

import { useEffect, useState } from "react";

const PHASES = [
  "Waking the signal layer",
  "Routing the sensor graph",
  "Calibrating the edge scene",
];

export function SitePreloader() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [progress, setProgress] = useState(12);

  useEffect(() => {
    const startedAt = performance.now();
    let exitTimer = 0;
    let removeTimer = 0;
    let progressTimer = 0;
    let phaseTimer = 0;

    const finish = () => {
      const remaining = Math.max(0, 900 - (performance.now() - startedAt));
      window.clearTimeout(exitTimer);
      exitTimer = window.setTimeout(() => {
        setProgress(100);
        setLeaving(true);
        removeTimer = window.setTimeout(() => setVisible(false), 420);
      }, remaining);
    };

    document.documentElement.classList.add("site-loading");
    progressTimer = window.setInterval(() => {
      setProgress((current) => Math.min(92, current + Math.max(1, Math.round((92 - current) * 0.08))));
    }, 90);
    phaseTimer = window.setInterval(() => setPhaseIndex((current) => (current + 1) % PHASES.length), 420);

    // The intro is a visual handshake, not a gate. It exits quickly even when the
    // optional WebGL scene is still loading or a visitor is on a low-power device.
    const minimumTimer = window.setTimeout(finish, 900);
    window.addEventListener("spline-ready", finish, { once: true });
    window.addEventListener("spline-error", finish, { once: true });

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(removeTimer);
      window.clearTimeout(minimumTimer);
      window.clearInterval(progressTimer);
      window.clearInterval(phaseTimer);
      window.removeEventListener("spline-ready", finish);
      window.removeEventListener("spline-error", finish);
      document.documentElement.classList.remove("site-loading");
    };
  }, []);

  useEffect(() => {
    if (!visible) document.documentElement.classList.remove("site-loading");
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={`site-preloader${leaving ? " is-leaving" : ""}`}
      role="status"
      aria-live="polite"
      aria-label="Loading Sonal Hegde's portfolio"
    >
      <div className="site-preloader__field" aria-hidden="true" />
      <div className="site-preloader__frame">
        <div className="site-preloader__topline">
          <span className="site-preloader__eyebrow">SONAL HEGDE / PORTFOLIO</span>
          <span className="site-preloader__status"><i /> ONLINE</span>
        </div>

        <div className="site-preloader__identity">
          <div className="site-preloader__monogram">SH</div>
          <div>
            <p className="site-preloader__kicker">Embedded systems · Edge AI</p>
            <h1>Sonal Hegde</h1>
          </div>
        </div>

        <div className="site-preloader__telemetry">
          <span>01 / SIGNAL</span>
          <span>02 / SYSTEMS</span>
          <span>03 / RESPONSE</span>
        </div>

        <div className="site-preloader__progress" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>
        <div className="site-preloader__footer">
          <span>{PHASES[phaseIndex]}</span>
          <strong>{String(progress).padStart(3, "0")}%</strong>
        </div>
      </div>
    </div>
  );
}
