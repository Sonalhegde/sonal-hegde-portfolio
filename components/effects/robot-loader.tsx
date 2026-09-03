"use client";

// Dedicated robot loading state: an assembling silhouette with a shimmer sweep
// and an orbiting build ring. Pure CSS animations, reduced-motion aware. The
// real robot fades in over it once ready (see .robot-stage transitions).
export function RobotLoader({ label = "Assembling robot" }: { label?: string }) {
  return (
    <div className="robot-loader" role="status" aria-label={label}>
      <span className="robot-loader__ring" aria-hidden="true" />
      <span className="robot-loader__ring robot-loader__ring--slow" aria-hidden="true" />
      <svg className="robot-lite__figure robot-loader__silhouette" viewBox="0 0 200 260" aria-hidden="true" focusable="false">
        <g fill="currentColor">
          <rect x="52" y="14" width="96" height="70" rx="30" />
          <rect x="90" y="78" width="20" height="20" rx="6" opacity="0.7" />
          <rect x="62" y="96" width="76" height="88" rx="24" opacity="0.85" />
          <rect x="34" y="106" width="18" height="88" rx="9" opacity="0.55" />
          <rect x="148" y="106" width="18" height="88" rx="9" opacity="0.55" />
          <rect x="72" y="182" width="22" height="48" rx="10" opacity="0.6" />
          <rect x="106" y="182" width="22" height="48" rx="10" opacity="0.6" />
          <rect x="64" y="228" width="34" height="14" rx="7" opacity="0.7" />
          <rect x="102" y="228" width="34" height="14" rx="7" opacity="0.7" />
        </g>
      </svg>
      <span className="robot-loader__shimmer" aria-hidden="true" />
    </div>
  );
}
