/**
 * Providers
 * =========
 * Single wrapper that composes all global providers in the correct order.
 * Import this once in the root layout — it handles smooth scrolling,
 * scroll-triggered animations, SplitText observers, line reveals,
 * nav theme detection, and the hero dither engine.
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
import NavThemeObserver from "./NavThemeObserver";
import CharHoverObserver from "./CharHoverObserver";
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
            <NavThemeObserver>
              <CharHoverObserver>
                <HeroDitherProvider>{children}</HeroDitherProvider>
              </CharHoverObserver>
            </NavThemeObserver>
          </LineRevealObserver>
        </SplitTextObserver>
      </AnimationProvider>
    </SmoothScroll>
  );
}
