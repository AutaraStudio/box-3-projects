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
   HomePreloader.css. */
const WORDS_IN_MS = 1400;
const WORDS_HOLD_MS = 700;
const WORDS_OUT_MS = 950;
const MORPH_MS = 1200;
const REVEAL_MS = 800;
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

    /* Step 1 — words slide in. requestAnimationFrame so the
       initial-state styles paint before the transition fires. */
    timers.push(
      window.setTimeout(() => {
        requestAnimationFrame(() => setPhase("words-in"));
      }, 60),
    );

    /* Step 2 — words at rest. */
    timers.push(
      window.setTimeout(() => setPhase("words-hold"), WORDS_IN_MS),
    );

    /* Step 3 — words slide out (upwards). */
    timers.push(
      window.setTimeout(
        () => setPhase("words-out"),
        WORDS_IN_MS + WORDS_HOLD_MS,
      ),
    );

    /* Step 4 — measure the logo + start the morph. */
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
      }, WORDS_IN_MS + WORDS_HOLD_MS + WORDS_OUT_MS),
    );

    /* Step 5 — cover sits at the logo bounds, BOX 3 letters
       stagger in. */
    timers.push(
      window.setTimeout(
        () => {
          document.documentElement.setAttribute("data-preloader", "reveal");
          setPhase("reveal");
        },
        WORDS_IN_MS + WORDS_HOLD_MS + WORDS_OUT_MS + MORPH_MS,
      ),
    );

    /* Step 6 — finish + unmount. */
    timers.push(
      window.setTimeout(
        finish,
        WORDS_IN_MS +
          WORDS_HOLD_MS +
          WORDS_OUT_MS +
          MORPH_MS +
          REVEAL_MS +
          SAFETY_BUFFER_MS,
      ),
    );

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
