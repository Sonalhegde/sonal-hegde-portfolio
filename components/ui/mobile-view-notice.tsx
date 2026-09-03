"use client";

import { Laptop, X } from "lucide-react";
import { useState } from "react";

export function MobileViewNotice() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <aside className="mobile-view-notice glass-panel md:hidden" aria-label="Viewing recommendation">
      <Laptop size={17} className="shrink-0 text-[var(--accent-highlight)]" aria-hidden="true" />
      <p className="min-w-0 flex-1">
        You’re on the streamlined mobile experience — tap the robot! Open on desktop for the full 3D lab.
      </p>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="flex size-11 shrink-0 items-center justify-center rounded-full text-[var(--text-muted)] hover:bg-[var(--chip-bg)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-secondary)]"
        aria-label="Dismiss viewing recommendation"
      >
        <X size={15} aria-hidden="true" />
      </button>
    </aside>
  );
}
