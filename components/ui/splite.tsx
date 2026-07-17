"use client";

import { Component, Suspense, lazy, type ReactNode } from "react";

const Spline = lazy(() => import("@splinetool/react-spline"));
const RobotFallback = lazy(() =>
  import("@/components/effects/robot-3d").then((module) => ({ default: module.Robot3D })),
);

interface SplineSceneProps {
  scene: string;
  className?: string;
}

function SceneLoader() {
  return (
    <div className="flex h-full w-full items-center justify-center" aria-hidden="true">
      <span className="loader" />
    </div>
  );
}

function LocalRobotFallback() {
  return (
    <Suspense fallback={<SceneLoader />}>
      <RobotFallback />
    </Suspense>
  );
}

class SplineErrorBoundary extends Component<
  { children: ReactNode; scene: string },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    // The remote scene is decorative. A local robot keeps the portfolio usable
    // when Spline's CDN, CORS policy, or scene URL is temporarily unavailable.
  }

  componentDidUpdate(previous: Readonly<{ children: ReactNode; scene: string }>) {
    if (previous.scene !== this.props.scene && this.state.failed) {
      this.setState({ failed: false });
    }
  }

  render() {
    return this.state.failed ? <LocalRobotFallback /> : this.props.children;
  }
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  return (
    <SplineErrorBoundary scene={scene}>
      <Suspense fallback={<SceneLoader />}>
        <Spline scene={scene} className={className} />
      </Suspense>
    </SplineErrorBoundary>
  );
}
