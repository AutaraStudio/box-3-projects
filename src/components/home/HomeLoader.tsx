"use client";

/**
 * HomeLoader
 * ==========
 * One-shot intro overlay that plays the first time the visitor
 * lands on the home page in a session. Pink full-viewport cover
 * with the brand statement revealing word-by-word, a brief held
 * beat, then a smooth slide-up to reveal the page beneath.
 *
 * All motion lives in CSS keyframes (HomeLoader.css) — keyframes
 * tick reliably on this stack where GSAP timelines have been
 * dropping their ticks. The component just gates visibility,
 * locks scroll, and switches the cover into its exit state at
 * the right moment.
 *
 * Sequencing (rough):
 *   0.0s   words slide up out of overflow:hidden masks (per-word
 *          stagger via --i)
 *   ~1.3s  reveal complete
 *   +0.6s  hold
 *   +0.8s  cover sweeps up
 *   ~2.7s  total — overlay unmounts, scroll resumes
 *
 * sessionStorage gates the loader so it plays once per browser-
 * tab session (refreshing the home mid-session doesn't replay).
 */

import { useEffect, useRef, useState } from "react";

import "./HomeLoader.css";

interface HomeLoaderProps {
  message: string;
}

const SESSION_KEY = "box3:home-loader-played";

/* Per-word stagger × words + cover-exit + small buffer = total
   time the loader is on screen. Tuned to keep words on screen
   long enough to read but not feel slow. */
const REVEAL_DURATION_MS = 1300;
const HOLD_MS = 600;
const COVER_EXIT_MS = 800;

export default function HomeLoader({ message }: HomeLoaderProps) {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  /* Decide whether to play. Runs ONCE on mount. If the loader has
     already played in this tab session we skip — the home page
     renders straight to its hero. */
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") {
        setVisible(false);
      }
    } catch {
      /* sessionStorage can throw in private mode — fall through
         to playing the loader. */
    }
  }, []);

  /* Run the timeline. CSS handles the visual motion; this effect
     only orchestrates the timing + scroll lock + final unmount. */
  useEffect(() => {
    if (!visible) return;

    /* Lock page scroll while the loader is up via a body-level
       data-attribute (CSS handles `overflow: hidden` in
       globals.css). We avoid `lenis.stop()` because pausing Lenis
       has been observed to halt the GSAP ticker driving its raf
       on this stack. */
    document.documentElement.setAttribute("data-loader", "true");

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const totalMs = reduceMotion
      ? 0
      : REVEAL_DURATION_MS + HOLD_MS + COVER_EXIT_MS;

    const startExitAt = REVEAL_DURATION_MS + HOLD_MS;

    /* Mid-timeline: switch the cover into its exit state. CSS
       keyframes scoped to [data-state="exit"] sweep it up. */
    const exitTimer = window.setTimeout(() => {
      setExiting(true);
    }, startExitAt);

    /* End: persist the session flag, unmount, restore scroll. */
    const finishTimer = window.setTimeout(
      () => {
        try {
          sessionStorage.setItem(SESSION_KEY, "1");
        } catch {
          /* private mode — fine. */
        }
        document.documentElement.removeAttribute("data-loader");
        setVisible(false);
      },
      totalMs,
    );

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(finishTimer);
      document.documentElement.removeAttribute("data-loader");
    };
  }, [visible]);

  if (!visible) return null;

  /* Split the message into word spans + per-word masks. The CSS
     keyframe + per-word stagger via --i drive the wipe. */
  const words = message.trim().split(/\s+/);

  return (
    <div
      ref={rootRef}
      className="home-loader"
      data-theme="pink"
      data-state={exiting ? "exit" : "in"}
      aria-hidden="true"
    >
      <p className="home-loader__text text-h2">
        {words.map((word, i) => (
          <span key={i} className="home-loader__word">
            <span
              className="home-loader__word-inner"
              style={{ ["--i" as string]: i }}
            >
              {word}
              {i < words.length - 1 ? " " : ""}
            </span>
          </span>
        ))}
      </p>
    </div>
  );
}
