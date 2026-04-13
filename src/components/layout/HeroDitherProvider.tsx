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

/**
 * Resolve a CSS custom property token to its computed rgb() value.
 * Appends a temporary element to the given parent (which should be
 * the themed section) so it inherits the correct data-theme scope.
 */
function resolveColor(token: string, parent: HTMLElement): string {
  const el = document.createElement("div");
  el.style.cssText = "position:absolute;visibility:hidden;width:1px;height:1px";
  parent.appendChild(el);
  el.style.color = `var(${token})`;
  const resolved = getComputedStyle(el).color;
  parent.removeChild(el);
  console.log(`[DitherEngine] ${token} →`, resolved);
  return resolved;
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

      const inkColor = resolveColor("--theme-dither-ink", section);
      const bgColor  = resolveColor("--theme-dither-bg", section);

      const engine       = new DitherEngine(canvas, section, { inkColor, bgColor });
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
