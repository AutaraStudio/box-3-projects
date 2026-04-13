/**
 * Providers
 * =========
 * Single wrapper that composes all global providers in the correct order.
 * Import this once in the root layout — it handles smooth scrolling,
 * scroll-triggered animations, SplitText observers, and line reveals.
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
import LineRevealObserver from "./LineRevealObserver";
import HeroDitherProvider from "./HeroDitherProvider";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SmoothScroll>
      <AnimationProvider>
        <SplitTextObserver>
          <LineRevealObserver>
            <HeroDitherProvider>{children}</HeroDitherProvider>
          </LineRevealObserver>
        </SplitTextObserver>
      </AnimationProvider>
    </SmoothScroll>
  );
}
