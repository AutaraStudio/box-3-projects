"use client";

/**
 * HomePreloader
 * =============
 * Editorial one-shot intro that plays the very first time a
 * visitor lands on the site in their browser session.
 *
 *   1. Pink full-viewport cover paints from the first frame
 *      (an inline script in the layout sets <html data-preloader>
 *      synchronously so there's no flash before this React tree
 *      hydrates).
 *
 *   2. Brand statement reveals word-by-word as each word's inner
 *      span slides up out of an overflow:hidden mask. Per-word
 *      stagger via the `--i` custom property.
 *
 *   3. Brief hold so the visitor can read the line.
 *
 *   4. Words exit upward (same per-word stagger, slightly
 *      tighter), then the cover morphs (top/left/width/height)
 *      down to the exact bounds of the header logo box.
 *
 *   5. Cover lowers below the header so the BOX 3 letters in
 *      the logo SVG can stagger in over it (B → O → X → 3).
 *
 *   6. Cover unmounts; the SVG's pink rect underneath is
 *      identical so the hand-off is invisible.
 *
 * sessionStorage gates the whole thing — once played, the rest
 * of the session sees no preloader at all.
 */

import { useEffect, useState } from "react";

import "./HomePreloader.css";

const SESSION_KEY = "box3:preloader-played";
const STATEMENT =
  "Your project is our priority, and we're committed to excellence from start to finish.";

/* Timing — keep in sync with the per-phase rules in
   HomePreloader.css. The pre/post pauses are deliberate so the
   intro reads as a series of considered beats rather than one
   continuous rush. */
const INITIAL_HOLD_MS = 500;     // pink cover, no text yet
const WORDS_IN_MS = 1400;        // words slide in (per-word stagger)
const WORDS_HOLD_MS = 1500;      // words at rest, fully readable
const WORDS_OUT_MS = 1300;       // words slide upward + out (stagger × 13 + ease)
const POST_WORDS_HOLD_MS = 600;  // cover, no text — settle before morph
const MORPH_MS = 1200;           // cover collapses to logo bounds
const REVEAL_MS = 800;           // BOX 3 letters stagger in over cover
const SAFETY_BUFFER_MS = 100;

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

type Phase =
  | "full"
  | "words-in"
  | "words-hold"
  | "words-out"
  | "morph"
  | "reveal"
  | "done";

export default function HomePreloader() {
  const [phase, setPhase] = useState<Phase>("full");
  const [target, setTarget] = useState<TargetRect | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    /* Inline script may have already marked us "skip" — trust it. */
    if (document.documentElement.getAttribute("data-preloader") === "skip") {
      setPhase("done");
      return;
    }

    /* Belt-and-braces — sessionStorage check in case the inline
       script didn't run for some reason. */
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") {
        document.documentElement.setAttribute("data-preloader", "skip");
        setPhase("done");
        return;
      }
    } catch {
      /* private mode — fall through. */
    }

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

    const timers: number[] = [];

    /* Cumulative timeline — readable + easy to retune. Each step
       fires at the running total, then advances the cursor. */
    let t = 0;

    /* Step 1 — initial pause on the bare pink cover. rAF inside the
       first tick so the SSR initial-state paints before the words
       transition fires. */
    t += INITIAL_HOLD_MS;
    timers.push(
      window.setTimeout(() => {
        requestAnimationFrame(() => setPhase("words-in"));
      }, t),
    );

    /* Step 2 — words at rest (long enough to actually read). */
    t += WORDS_IN_MS;
    timers.push(window.setTimeout(() => setPhase("words-hold"), t));

    /* Step 3 — words slide out (upwards). */
    t += WORDS_HOLD_MS;
    timers.push(window.setTimeout(() => setPhase("words-out"), t));

    /* Step 4 — words gone, brief settle on bare cover before the
       morph begins. */
    t += WORDS_OUT_MS;
    timers.push(
      window.setTimeout(() => {
        /* Phase still words-out; we're just holding the cover empty.
           No phase change needed — text is already off-screen. */
      }, t),
    );

    /* Step 5 — measure the logo + start the morph. */
    t += POST_WORDS_HOLD_MS;
    timers.push(
      window.setTimeout(() => {
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
      }, t),
    );

    /* Step 6 — cover sits at the logo bounds, BOX 3 letters
       stagger in. */
    t += MORPH_MS;
    timers.push(
      window.setTimeout(() => {
        document.documentElement.setAttribute("data-preloader", "reveal");
        setPhase("reveal");
      }, t),
    );

    /* Step 7 — finish + unmount. */
    t += REVEAL_MS + SAFETY_BUFFER_MS;
    timers.push(window.setTimeout(finish, t));

    return () => {
      for (const id of timers) window.clearTimeout(id);
    };
  }, []);

  if (phase === "done") return null;

  /* Inline style holds the cover at the logo's bounds during
     `morph` + `reveal`. */
  const style: React.CSSProperties =
    (phase === "morph" || phase === "reveal") && target
      ? {
          top: `${target.top}px`,
          left: `${target.left}px`,
          width: `${target.width}px`,
          height: `${target.height}px`,
        }
      : (undefined as unknown as React.CSSProperties);

  /* Split the brand statement into words with trailing whitespace
     baked into each span so the words travel with their gaps when
     wrapped into masks. */
  const words = STATEMENT.trim().split(/\s+/);

  return (
    <div
      className="home-preloader"
      data-phase={phase}
      style={style}
      aria-hidden="true"
    >
      <p className="home-preloader__text">
        {words.map((word, i) => (
          <span key={i} className="home-preloader__word">
            <span
              className="home-preloader__word-inner"
              style={{ ["--i" as string]: i } as React.CSSProperties}
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
