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
 *   2. Two messages reveal in sequence, each animated word-by-word
 *      via a per-word blur + opacity fade (per-word stagger via
 *      `--i`):
 *
 *        a. The brand line — "Box 3 Projects".
 *        b. The longer statement — "Your project is our priority…"
 *
 *      Each round runs the same in → hold → out beat. Between
 *      rounds the spans are unmounted (key swap) and remounted at
 *      the default blurred-and-transparent state so round two
 *      fades in cleanly without inheriting round one's exit state.
 *
 *   3. After the second message exits, the pink cover morphs
 *      (top/left/width/height) down to the exact bounds of the
 *      header logo box.
 *
 *   4. Cover lowers below the header so the BOX 3 letters in the
 *      logo SVG can stagger in over it (B → O → X → 3).
 *
 *   5. Cover unmounts; the SVG's pink rect underneath is identical
 *      so the hand-off is invisible.
 *
 * sessionStorage gates the whole thing — once played, the rest
 * of the session sees no preloader at all.
 */

import { useEffect, useState } from "react";

import "./HomePreloader.css";

const SESSION_KEY = "box3:preloader-played";

/* The two messages in order. Round one is the punchy brand line;
   round two is the editorial statement. */
const MESSAGES = [
  "Box 3 Projects",
  "Your project is our priority, and we're committed to excellence from start to finish.",
];

/* Timing — keep in sync with the per-phase rules in
   HomePreloader.css. Reveal is now a per-word blur + opacity fade
   (no slide), so each round can run noticeably tighter than the
   previous mask-and-translate version. Each round's "in" duration
   must comfortably cover (word-count × stagger) + the per-word
   transition: 30ms × N + 500ms in, 22ms × N + 400ms out. */
const INITIAL_HOLD_MS = 350;     // pink cover, no text yet
const M1_IN_MS = 700;            // "Box 3 Projects" — 3 words (3×30+500=590)
const M1_HOLD_MS = 550;          // round 1 fully visible
const M1_OUT_MS = 550;           // round 1 fades away (3×22+400=466)
const BETWEEN_MS = 200;          // bare cover between rounds
const M2_IN_MS = 1000;           // long statement — 13 words (13×30+500=890)
const M2_HOLD_MS = 1100;         // round 2 fully visible
const M2_OUT_MS = 800;           // round 2 fades away (13×22+400=686)
const POST_WORDS_HOLD_MS = 400;  // cover, no text — settle before morph
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
  | "m1-in"
  | "m1-hold"
  | "m1-out"
  | "between"
  | "m2-in"
  | "m2-hold"
  | "m2-out"
  | "morph"
  | "reveal"
  | "done";

/* Phase → which message the text element should render. */
function activeMessageIndex(phase: Phase): 0 | 1 {
  if (
    phase === "between" ||
    phase === "m2-in" ||
    phase === "m2-hold" ||
    phase === "m2-out"
  ) {
    return 1;
  }
  return 0;
}

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

    /* Step 1 — initial pause on bare cover. rAF inside the first
       tick so the SSR-painted blurred-and-transparent state commits
       before the round-one transition fires. */
    t += INITIAL_HOLD_MS;
    timers.push(
      window.setTimeout(() => {
        requestAnimationFrame(() => setPhase("m1-in"));
      }, t),
    );

    /* Step 2 — round 1 hold. */
    t += M1_IN_MS;
    timers.push(window.setTimeout(() => setPhase("m1-hold"), t));

    /* Step 3 — round 1 fades out. */
    t += M1_HOLD_MS;
    timers.push(window.setTimeout(() => setPhase("m1-out"), t));

    /* Step 4 — swap to round 2. Phase becomes "between" which has
       no per-phase rule, so the freshly mounted round-two spans
       sit at the default blurred-and-transparent state ready to
       fade in. The <p key={messageIndex}> swap forces a clean
       unmount/mount cycle so the new spans start without inheriting
       any in-flight transition from round one. */
    t += M1_OUT_MS;
    timers.push(window.setTimeout(() => setPhase("between"), t));

    /* Step 5 — fire round 2's words-in. rAF for the same reason as
       step 1: let the default state paint before transitioning. */
    t += BETWEEN_MS;
    timers.push(
      window.setTimeout(() => {
        requestAnimationFrame(() => setPhase("m2-in"));
      }, t),
    );

    /* Step 6 — round 2 hold. */
    t += M2_IN_MS;
    timers.push(window.setTimeout(() => setPhase("m2-hold"), t));

    /* Step 7 — round 2 fades out. */
    t += M2_HOLD_MS;
    timers.push(window.setTimeout(() => setPhase("m2-out"), t));

    /* Step 8 — measure the logo + start the morph (after a brief
       settle on the bare cover). */
    t += M2_OUT_MS + POST_WORDS_HOLD_MS;
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

    /* Step 9 — reveal: BOX 3 letters stagger in over the cover. */
    t += MORPH_MS;
    timers.push(
      window.setTimeout(() => {
        document.documentElement.setAttribute("data-preloader", "reveal");
        setPhase("reveal");
      }, t),
    );

    /* Step 10 — finish + unmount. */
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

  const messageIndex = activeMessageIndex(phase);
  const words = MESSAGES[messageIndex].trim().split(/\s+/);

  return (
    <div
      className="home-preloader"
      data-phase={phase}
      style={style}
      aria-hidden="true"
    >
      {/* The key swap on messageIndex change forces React to unmount
          round one's spans and mount round two's afresh, so they
          start at the off-screen-below default ready to slide up. */}
      <p className="home-preloader__text" key={messageIndex}>
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
