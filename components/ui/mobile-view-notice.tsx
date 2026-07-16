"use client";

import { Laptop, X } from "lucide-react";
import { useState } from "react";

export function MobileViewNotice() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <aside className="mobile-view-notice glass-panel md:hidden" aria-label="Viewing recommendation">
      <Laptop size={17} className="shrink-0 text-[#c3f4ff]" aria-hidden="true" />
      <p className="min-w-0 flex-1">
        Mobile-ready. For the full 3D lab experience, switch to a laptop or desktop.
      </p>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="flex size-11 shrink-0 items-center justify-center rounded-full text-neutral-400 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B497CF]"
        aria-label="Dismiss viewing recommendation"
      >
        <X size={15} aria-hidden="true" />
      </button>
    </aside>
  );
}
