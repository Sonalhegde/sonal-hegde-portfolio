"use client";

import { Component, Suspense, lazy, type ReactNode } from "react";

const Spline = lazy(() => import("@splinetool/react-spline"));

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

function SceneUnavailable() {
  return (
    <div className="flex h-full w-full items-center justify-center px-6 text-center" role="status">
      <p className="max-w-xs font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500">
        Interactive 3D scene unavailable
      </p>
    </div>
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

  componentDidCatch(error: Error) {
    console.error("Spline scene failed to load", error);
  }

  componentDidUpdate(previous: Readonly<{ children: ReactNode; scene: string }>) {
    if (previous.scene !== this.props.scene && this.state.failed) {
      this.setState({ failed: false });
    }
  }

  render() {
    return this.state.failed ? <SceneUnavailable /> : this.props.children;
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
