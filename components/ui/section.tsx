import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export function Section({ className, children, ...props }: ComponentProps<"section">) {
  return (
    <section className={cn("page-section scroll-mt-28", className)} {...props}>
      <div className="section-scrim">{children}</div>
    </section>
  );
}
