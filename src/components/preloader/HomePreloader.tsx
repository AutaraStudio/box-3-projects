"use client";

/**
 * HomePreloader
 * =============
 * One-shot pink overlay that fills the viewport on the very first
 * page load of a browser session, then morphs (top / left / width /
 * height) down to the exact bounds of the header logo box. While
 * it's playing, the actual logo SVG is hidden via CSS scoped to
 * `html[data-preloader="active"]`; once the morph completes, the
 * attribute is removed and the SVG fades in over the pink box —
 * seamless because the logo's own background is the same pink.
 *
 * sessionStorage gates re-plays so navigating around the site
 * (or refreshing a page) doesn't replay it.
 *
 * All motion is via CSS transitions on `top / left / width /
 * height` — no GSAP. CSS transitions tick reliably on this stack.
 */

import { useEffect, useState } from "react";

import "./HomePreloader.css";

const SESSION_KEY = "box3:preloader-played";
/* Slightly longer than the morph duration in CSS — gives the
   transition a few frames of safety before we unmount. */
const MEASURE_DELAY_MS = 350;
const MORPH_DURATION_MS = 1200;
const SAFETY_BUFFER_MS = 200;

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export default function HomePreloader() {
  /* phase:
       hidden — render nothing (already played this session)
       full   — overlay fills the viewport
       morph  — overlay transitioning to the logo's bounds
       done   — animation finished, unmount */
  const [phase, setPhase] = useState<"hidden" | "full" | "morph" | "done">(
    "hidden",
  );
  const [target, setTarget] = useState<TargetRect | null>(null);

  /* Decide-and-play. Runs ONCE on mount. */
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") {
        /* Already played this session — stay hidden. */
        return;
      }
    } catch {
      /* private mode — fall through to playing the preloader. */
    }

    /* Begin: cover the viewport. */
    setPhase("full");
    document.documentElement.setAttribute("data-preloader", "active");

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const finish = () => {
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* private mode — leave the flag unset. */
      }
      document.documentElement.removeAttribute("data-preloader");
      setPhase("done");
    };

    if (reduceMotion) {
      finish();
      return;
    }

    /* Wait for the header to lay out, then measure the logo box
       and switch the overlay into its morph state. The CSS
       transition takes over from there. */
    const measureTimer = window.setTimeout(() => {
      const logo = document.querySelector<HTMLElement>(".header__home");
      if (!logo) {
        finish();
        return;
      }
      const r = logo.getBoundingClientRect();
      setTarget({ top: r.top, left: r.left, width: r.width, height: r.height });
      setPhase("morph");
    }, MEASURE_DELAY_MS);

    /* End the run after the morph has had time to complete. */
    const finishTimer = window.setTimeout(
      finish,
      MEASURE_DELAY_MS + MORPH_DURATION_MS + SAFETY_BUFFER_MS,
    );

    return () => {
      window.clearTimeout(measureTimer);
      window.clearTimeout(finishTimer);
      document.documentElement.removeAttribute("data-preloader");
    };
  }, []);

  if (phase === "hidden" || phase === "done") return null;

  /* Inline style swaps between full-viewport and the logo box's
     exact pixel bounds. CSS transitions on top / left / width /
     height drive the morph. */
  const style: React.CSSProperties =
    phase === "morph" && target
      ? {
          top: `${target.top}px`,
          left: `${target.left}px`,
          width: `${target.width}px`,
          height: `${target.height}px`,
        }
      : {
          top: 0,
          left: 0,
          width: "100vw",
          /* svh handles iOS Safari's collapsing URL bar; falls
             back to vh for older browsers. */
          height: "100svh",
        };

  return (
    <div
      className="home-preloader"
      data-phase={phase}
      style={style}
      aria-hidden="true"
    />
  );
}
