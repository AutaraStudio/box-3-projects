/**
 * NavThemeObserver
 * ================
 * Watches the scroll position and updates the nav's data-theme attribute
 * based on which section is currently in view at the nav's vertical midpoint.
 *
 * Sections declare their desired nav theme via data-nav-theme="dark|light|..."
 * The first matching section (from top) wins.
 *
 * Runs on mount, scroll, and resize (debounced). Cleans up on unmount.
 */

"use client";

import { useEffect, type ReactNode } from "react";

interface NavThemeObserverProps {
  children: ReactNode;
}

export default function NavThemeObserver({ children }: NavThemeObserverProps) {
  useEffect(() => {
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;

    function updateNavTheme() {
      const nav = document.querySelector("[data-nav]") as HTMLElement | null;
      if (!nav) return;

      const navHeight = nav.getBoundingClientRect().height || 60;
      const offset = navHeight / 2;

      const sections = document.querySelectorAll("[data-nav-theme]");

      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= offset && rect.bottom >= offset) {
          const theme = section.getAttribute("data-nav-theme");
          if (theme) {
            nav.setAttribute("data-theme", theme);
          }
          break;
        }
      }
    }

    function onScroll() {
      updateNavTheme();
    }

    function onResize() {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateNavTheme, 100);
    }

    /* Run on mount */
    updateNavTheme();

    /* Listen for scroll — try Lenis first, fall back to native */
    const lenis = (window as unknown as { lenis?: { on: (event: string, fn: () => void) => void; off: (event: string, fn: () => void) => void } }).lenis;
    if (lenis) {
      lenis.on("scroll", onScroll);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      if (lenis) {
        lenis.off("scroll", onScroll);
      }
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (resizeTimer) clearTimeout(resizeTimer);
    };
  }, []);

  return <>{children}</>;
}
