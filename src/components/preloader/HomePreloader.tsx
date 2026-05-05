"use client";

/**
 * HomePreloader
 * =============
 * One-shot pink overlay that fills the viewport on the very first
 * page load of a browser session, then morphs (top / left / width
 * / height) down to the exact bounds of the header logo box.
 *
 * No-flash strategy:
 *
 *   1. An inline <script> in the layout runs *synchronously* before
 *      any paint and sets `<html data-preloader="active">` (or
 *      "skip" if sessionStorage already says we've played). The
 *      preloader element is rendered in SSR as a full-viewport
 *      pink box; CSS only shows it while the attribute reads
 *      "active". Result: visitors with a clean session see pink
 *      from the very first frame; visitors who've already played
 *      see no flash at all.
 *
 *   2. This component reads the attribute on mount and runs the
 *      hold + morph + finish timeline if it's "active".
 *
 * sessionStorage key "box3:preloader-played" — once set, the
 * preloader is skipped for the rest of the session (refreshes,
 * internal nav, etc.).
 */

import { useEffect, useState } from "react";

import "./HomePreloader.css";

const SESSION_KEY = "box3:preloader-played";

/* Timing — keep in sync with HomePreloader.css transition duration. */
const HOLD_MS = 2000;
const MORPH_DURATION_MS = 1200;
/* Once the cover is sitting at the logo's bounds, the BOX 3 SVG
   fades in OVER it. The cover stays in place for the duration of
   the fade so we never see a transparent gap — both layers carry
   the same pink, then the letters appear in front. */
const REVEAL_MS = 500;
const SAFETY_BUFFER_MS = 100;

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export default function HomePreloader() {
  /* phase walk-through:
       full   — pink overlay fills the viewport (initial paint)
       morph  — overlay transitions down to the logo's bounds
       reveal — overlay sits at the logo bounds while the BOX 3
                SVG fades in over it (same pink, so no gap)
       done   — SVG is fully in; cover removed; React unmounts */
  const [phase, setPhase] = useState<"full" | "morph" | "reveal" | "done">(
    "full",
  );
  const [target, setTarget] = useState<TargetRect | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    /* The inline script may have already marked us "skip". Trust
       it as the source of truth so React doesn't fight the DOM. */
    const attr = document.documentElement.getAttribute("data-preloader");
    if (attr === "skip") {
      /* Already played this session — element should already be
         hidden by CSS; just take it out of the React tree too. */
      setPhase("done");
      return;
    }

    /* Belt-and-braces — if the inline script didn't run for any
       reason, double-check sessionStorage and bail. */
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") {
        document.documentElement.setAttribute("data-preloader", "skip");
        setPhase("done");
        return;
      }
    } catch {
      /* private mode — fall through to playing. */
    }

    /* Make sure the attribute is set so CSS shows the cover. */
    document.documentElement.setAttribute("data-preloader", "active");

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const finish = () => {
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* fine */
      }
      document.documentElement.setAttribute("data-preloader", "skip");
      setPhase("done");
    };

    if (reduceMotion) {
      finish();
      return;
    }

    /* Step 1 — hold for HOLD_MS. */
    const morphTimer = window.setTimeout(() => {
      const logo = document.querySelector<HTMLElement>(".header__home");
      if (!logo) {
        finish();
        return;
      }
      const r = logo.getBoundingClientRect();
      setTarget({
        top: r.top,
        left: r.left,
        width: r.width,
        height: r.height,
      });
      setPhase("morph");
    }, HOLD_MS);

    /* Step 2 — once morph completes, switch to reveal. The cover
       stays at the logo bounds; CSS releases the SVG's hidden
       state so its letters fade in over the pink. */
    const revealTimer = window.setTimeout(() => {
      document.documentElement.setAttribute("data-preloader", "reveal");
      setPhase("reveal");
    }, HOLD_MS + MORPH_DURATION_MS);

    /* Step 3 — after the SVG is fully in, remove the cover. Both
       layers are the same pink + the SVG's letters are now drawn
       on top, so unmounting the cover is visually invisible. */
    const finishTimer = window.setTimeout(
      finish,
      HOLD_MS + MORPH_DURATION_MS + REVEAL_MS + SAFETY_BUFFER_MS,
    );

    return () => {
      window.clearTimeout(morphTimer);
      window.clearTimeout(revealTimer);
      window.clearTimeout(finishTimer);
    };
  }, []);

  if (phase === "done") return null;

  /* Inline style holds the cover at the logo's bounds during
     both `morph` (the transition target) and `reveal` (where it
     sits still while the SVG fades in over it). */
  const style: React.CSSProperties =
    (phase === "morph" || phase === "reveal") && target
      ? {
          top: `${target.top}px`,
          left: `${target.left}px`,
          width: `${target.width}px`,
          height: `${target.height}px`,
        }
      : undefined as unknown as React.CSSProperties;

  return (
    <div
      className="home-preloader"
      data-phase={phase}
      style={style}
      aria-hidden="true"
    />
  );
}
