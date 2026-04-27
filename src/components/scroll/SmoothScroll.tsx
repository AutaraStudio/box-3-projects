/**
 * SmoothScroll
 * ============
 * Boots Lenis once at app mount and ties it into GSAP's ticker so any
 * future ScrollTrigger work stays in sync without extra setup.
 *
 * The active Lenis instance is exposed on `window.__lenis` so other
 * code (e.g. PageTransitionOverlay) can pause/resume scrolling and
 * jump-to-top through the same instance instead of fighting it with
 * `window.scrollTo`.
 *
 * Defaults match the Osmo reference — slightly slower lerp than
 * Lenis's built-in default for an editorial pull, and a small wheel
 * boost so trackpad scroll feels alive.
 */

"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import "lenis/dist/lenis.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.165,
      wheelMultiplier: 1.25,
    });

    window.__lenis = lenis;

    /* Drive Lenis from GSAP's ticker so a single rAF loop powers both
       smooth scroll and any tween/scroll-trigger work. lagSmoothing(0)
       keeps the ticker honest after tab-switch / blur. */
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    /* Bridge Lenis ↔ ScrollTrigger. Without this, ScrollTrigger only
       polls scroll position on its own cadence and any scrub-locked
       tween appears to lag — motion only catches up once Lenis stops
       moving. Updating on every Lenis scroll event keeps scrub-locked
       parallax / pin animations 1:1 with the smooth-scroll output. */
    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    return () => {
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(raf);
      lenis.destroy();
      if (window.__lenis === lenis) delete window.__lenis;
    };
  }, []);

  return <>{children}</>;
}
