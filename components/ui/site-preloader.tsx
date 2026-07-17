"use client";

import { useEffect, useState } from "react";

const DOTS = Array.from({ length: 12 });

export function SitePreloader() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const startedAt = performance.now();
    let exitTimer = 0;
    let removeTimer = 0;

    const finish = () => {
      const remaining = Math.max(0, 700 - (performance.now() - startedAt));
      window.clearTimeout(exitTimer);
      exitTimer = window.setTimeout(() => {
        setLeaving(true);
        removeTimer = window.setTimeout(() => setVisible(false), 520);
      }, remaining);
    };

    document.documentElement.classList.add("site-loading");
    window.addEventListener("spline-ready", finish, { once: true });
    window.addEventListener("spline-error", finish, { once: true });

    // Never trap a visitor behind a decorative scene on a slow connection.
    const safetyTimer = window.setTimeout(finish, 10_000);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(removeTimer);
      window.clearTimeout(safetyTimer);
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
    <div className={`site-preloader${leaving ? " is-leaving" : ""}`} role="status" aria-label="Loading Sonal Hegde's portfolio">
      <div className="site-preloader__halo" aria-hidden="true">
        {DOTS.map((_, index) => (
          <span key={index} style={{ "--dot-index": index } as React.CSSProperties} />
        ))}
      </div>
      <p aria-hidden="true">Initializing portfolio</p>
    </div>
  );
}
