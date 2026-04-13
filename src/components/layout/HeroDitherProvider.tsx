/**
 * HeroDitherProvider
 * ==================
 * Initialises the hero DitherEngine once the canvas and hero section are
 * present in the DOM, and tears it down cleanly on unmount.
 *
 * Renders its children transparently — exists solely to manage the engine
 * lifecycle as part of the global provider chain.
 *
 * Mount order note: because this component is the innermost provider, its
 * children (including HomeHero) will be present in the DOM by the time the
 * useEffect fires. The MutationObserver is a safety-net for future cases
 * where the hero might render asynchronously.
 */

"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { DitherEngine } from "@/lib/dither/DitherEngine";

interface HeroDitherProviderProps {
  children: ReactNode;
}

export default function HeroDitherProvider({ children }: HeroDitherProviderProps) {
  const engineRef = useRef<DitherEngine | null>(null);

  useEffect(() => {
    let observer: MutationObserver | null = null;

    function tryInit(): boolean {
      const canvas  = document.getElementById("hero-dither-canvas") as HTMLCanvasElement | null;
      const section = document.querySelector("[data-hero-sticky]") as HTMLElement | null;

      if (!canvas || !section) return false;
      if (engineRef.current) return true; // already initialised

      const engine       = new DitherEngine(canvas, section);
      engineRef.current  = engine;

      engine.registerAll().catch(err => {
        console.warn("[HeroDitherProvider] registerAll failed:", err);
      });

      return true;
    }

    if (!tryInit()) {
      // Elements not yet in the DOM — wait for them
      observer = new MutationObserver(() => {
        if (tryInit()) {
          observer?.disconnect();
          observer = null;
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      observer?.disconnect();
      observer = null;
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
