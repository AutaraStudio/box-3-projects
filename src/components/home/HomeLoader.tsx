"use client";

/**
 * HomeLoader
 * ==========
 * One-shot editorial intro overlay. Plays the first time a
 * visitor lands on the home page in their browser-tab session.
 *
 * Pink full-viewport cover, brand statement fades up smoothly,
 * a brief held beat, then the cover sweeps up off the top of the
 * viewport to reveal the page beneath.
 *
 * All motion is in CSS keyframes (HomeLoader.css). This component
 * just gates visibility, locks page scroll, switches the cover
 * into its exit state at the right moment, and unmounts when
 * the animation completes.
 *
 * sessionStorage key "box3:home-loader-played" — once set, the
 * loader is skipped for the rest of the session.
 */

import { useEffect, useRef, useState } from "react";

import "./HomeLoader.css";

interface HomeLoaderProps {
  message: string;
}

const SESSION_KEY = "box3:home-loader-played";

/* Timing — keep in sync with HomeLoader.css. */
const TEXT_IN_DELAY_MS = 150;
const TEXT_IN_MS = 1000;
const HOLD_MS = 500;
const COVER_OUT_MS = 950;

const ENTER_DURATION_MS = TEXT_IN_DELAY_MS + TEXT_IN_MS + HOLD_MS;
const TOTAL_MS = ENTER_DURATION_MS + COVER_OUT_MS;

export default function HomeLoader({ message }: HomeLoaderProps) {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  /* Skip the loader when sessionStorage already records a play. */
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") {
        setVisible(false);
      }
    } catch {
      /* private mode — fall through to playing the loader. */
    }
  }, []);

  useEffect(() => {
    if (!visible) return;

    /* Lock scroll while the loader is up. CSS in globals.css
       reads `data-loader` on <html> and applies overflow:hidden
       to <body>. We avoid `lenis.stop()` because it has been
       observed to halt the GSAP ticker on this stack. */
    document.documentElement.setAttribute("data-loader", "true");

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* fine */
      }
      document.documentElement.removeAttribute("data-loader");
      setVisible(false);
      return;
    }

    /* Switch the cover into its exit state once the enter
       sequence has settled. CSS keyframes scoped to
       [data-state="exit"] then sweep the cover off-screen and
       fade the text out alongside it. */
    const exitTimer = window.setTimeout(() => {
      setExiting(true);
    }, ENTER_DURATION_MS);

    const finishTimer = window.setTimeout(() => {
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* fine */
      }
      document.documentElement.removeAttribute("data-loader");
      setVisible(false);
    }, TOTAL_MS);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(finishTimer);
      document.documentElement.removeAttribute("data-loader");
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      ref={rootRef}
      className="home-loader"
      data-theme="pink"
      data-state={exiting ? "exit" : "in"}
      aria-hidden="true"
    >
      <p className="home-loader__text text-h2">{message}</p>
    </div>
  );
}
