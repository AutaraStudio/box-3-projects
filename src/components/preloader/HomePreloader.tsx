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
const SAFETY_BUFFER_MS = 200;

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export default function HomePreloader() {
  /* Start in "full" so SSR renders the cover. The first useEffect
     immediately downgrades to "done" for sessions that have
     already played. The inline script in the layout has the SAME
     effect at the CSS layer (so the cover never paints in those
     sessions) — this React state is just keeping the React tree
     in sync with the DOM. */
  const [phase, setPhase] = useState<"full" | "morph" | "done">("full");
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

    /* Hold for HOLD_MS, then measure the logo + switch into
       morph state. CSS transitions on top/left/width/height
       handle the actual movement. */
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

    const finishTimer = window.setTimeout(
      finish,
      HOLD_MS + MORPH_DURATION_MS + SAFETY_BUFFER_MS,
    );

    return () => {
      window.clearTimeout(morphTimer);
      window.clearTimeout(finishTimer);
    };
  }, []);

  if (phase === "done") return null;

  const style: React.CSSProperties =
    phase === "morph" && target
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
