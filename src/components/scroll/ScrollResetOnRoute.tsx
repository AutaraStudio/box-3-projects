"use client";

/**
 * ScrollResetOnRoute
 * ==================
 * Forces every route change to start at the top.
 *
 * The wipe-panel transition (PageTransitionOverlay) already resets
 * scroll for click-driven navigation, but pathname can also change
 * via browser back/forward, direct URL hits, or any other history
 * mutation that doesn't go through TransitionLink. Without this
 * effect those landings keep the previous page's scroll position
 * (Lenis holds its own offset, and the browser's scroll
 * restoration adds another layer on top).
 *
 * Behaviour:
 *   - Disables `history.scrollRestoration` once on mount so the UA
 *     stops trying to restore positions on history navigation.
 *   - Snaps Lenis (immediate + force) and the native window scroll
 *     back to 0 on every pathname change.
 */

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollResetOnRoute() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const lenis = window.__lenis;
    if (lenis && typeof lenis.scrollTo === "function") {
      lenis.scrollTo(0, { immediate: true, force: true });
    }
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return null;
}
