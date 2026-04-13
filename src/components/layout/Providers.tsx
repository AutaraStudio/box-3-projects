/**
 * Providers
 * =========
 * Single wrapper that composes all global providers in the correct order.
 * Import this once in the root layout — it handles smooth scrolling,
 * scroll-triggered animations, and SplitText observers.
 *
 * Order matters:
 *   SmoothScroll (Lenis + ScrollTrigger) must wrap everything so
 *   scroll position is correct before animation observers fire.
 */

"use client";

import type { ReactNode } from "react";
import SmoothScroll from "./SmoothScroll";
import AnimationProvider from "./AnimationProvider";
import SplitTextObserver from "./SplitTextObserver";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SmoothScroll>
      <AnimationProvider>
        <SplitTextObserver>{children}</SplitTextObserver>
      </AnimationProvider>
    </SmoothScroll>
  );
}
