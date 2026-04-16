/**
 * SmoothScroll Provider
 * =====================
 * Initialises Lenis smooth scrolling and connects it to GSAP's
 * ScrollTrigger via a synchronised RAF loop. Wraps the entire
 * application — no visible UI, purely functional.
 *
 * Cleans up both Lenis and ScrollTrigger on unmount to prevent
 * memory leaks during hot reloads and route transitions.
 */

"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { duration } from "@/config/animations.config";

gsap.registerPlugin(ScrollTrigger);

interface SmoothScrollProps {
  children: ReactNode;
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: duration.slower,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
      infinite: false,
    });

    lenisRef.current = lenis;

    /* Expose the live instance on window under a namespaced key so
       other components (Preloader, PageTransition, etc.) can stop/
       start/scroll without prop-drilling or context. */
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    /* Connect Lenis scroll position to ScrollTrigger on every frame */
    lenis.on("scroll", ScrollTrigger.update);

    /* Synchronise Lenis with GSAP's ticker for frame-perfect scrolling */
    const onTick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(onTick);

    /* Disable GSAP's built-in lag smoothing to let Lenis handle timing */
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
      lenisRef.current = null;
      if (
        (window as unknown as { __lenis?: Lenis }).__lenis === lenis
      ) {
        delete (window as unknown as { __lenis?: Lenis }).__lenis;
      }
    };
  }, []);

  return <>{children}</>;
}
