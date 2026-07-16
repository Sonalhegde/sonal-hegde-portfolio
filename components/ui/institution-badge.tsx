import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function InstitutionBadge({
  children,
  icon,
  className,
}: {
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("institution-badge", className)}>
      {icon && <span aria-hidden="true">{icon}</span>}
      <strong>{children}</strong>
    </span>
  );
}
