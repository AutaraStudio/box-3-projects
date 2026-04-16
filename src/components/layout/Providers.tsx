/**
 * Providers
 * =========
 * Single wrapper that composes all global providers in the correct order.
 * Import this once in the root layout.
 *
 * Order matters:
 *   SmoothScroll (Lenis + ScrollTrigger) must wrap everything so
 *   scroll position is correct before downstream observers fire.
 *   HoverCursor sits outermost after SmoothScroll so its fixed
 *   cursor chip is in the DOM regardless of which subtree mounts.
 */

"use client";

import type { ReactNode } from "react";
import SmoothScroll from "./SmoothScroll";
import HoverCursor from "./HoverCursor";
import ParallaxObserver from "./ParallaxObserver";
import ImageRevealObserver from "./ImageRevealObserver";
import CharHoverObserver from "./CharHoverObserver";
import NavThemeObserver from "./NavThemeObserver";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SmoothScroll>
      <HoverCursor>
        <ParallaxObserver>
          <ImageRevealObserver>
            <CharHoverObserver>
              <NavThemeObserver>{children}</NavThemeObserver>
            </CharHoverObserver>
          </ImageRevealObserver>
        </ParallaxObserver>
      </HoverCursor>
    </SmoothScroll>
  );
}
