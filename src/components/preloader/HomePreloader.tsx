"use client";

/**
 * HomePreloader
 * =============
 * Editorial one-shot intro.
 *
 * Sequence:
 *   1. A dark (brown) full-viewport cover paints from the first
 *      frame. An inline script in the layout sets
 *      `<html data-preloader>` synchronously so there's no flash
 *      before this React tree hydrates.
 *   2. After a short hold, the pink logo border draws on — two
 *      half-perimeter strokes from opposite corners.
 *   3. The pink background slides up from below to fill the
 *      bordered box.
 *   4. The b·o·x·3 glyphs stagger in over the fill, filled white —
 *      a small lift + fade per glyph.
 *   5. The dismantle: the glyphs stagger back out, the pink
 *      background fades out, then the pink border undraws.
 *   6. On the still-dark cover, the statement reads in word by word
 *      (pink text), holds, then animates out.
 *   7. The dark cover morphs onto the header's home square,
 *      recolours brown → pink, then the b·o·x·3 glyphs stagger up
 *      into place — handing off to the (identical) header logo.
 *
 * Pacing is cinematic — each beat is given room to land and read,
 * with two held moments for weight (the finished logo, the
 * statement) and durations long enough for the easings to express.
 * The easing is a small cohesive vocabulary (see the timeline).
 *
 * Structure: `.home-preloader__cover` is the visible dark backdrop
 * and the thing that morphs in step 7. `.home-preloader__box` is a
 * sibling — a centred, fixed-size stage for the border / fill /
 * glyphs — so the cover's morph never distorts the mark. Both land
 * on the header logo's exact bounds for a seamless hand-off.
 *
 * sessionStorage gates the whole thing — once played, the rest of
 * the session sees no preloader at all. `prefers-reduced-motion`
 * skips straight to the finished state.
 */

import { Fragment, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

import { LOGO_VIEWBOX, LOGO_GLYPHS } from "@/components/brand/logoPaths";
import { endPreloader } from "./preloaderState";

import "./HomePreloader.css";

const SESSION_KEY = "box3:preloader-played";

/* The statement beat — carried over from the earlier preloader
   build. The word count drives the stagger spread, so a noticeably
   longer or shorter line may want a small timing tweak in step 6. */
const STATEMENT =
  "Your project is our priority, and we're committed to excellence from start to finish.";

export default function HomePreloader() {
  const [done, setDone] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const borderRef = useRef<SVGSVGElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const marksRef = useRef<SVGSVGElement>(null);
  const statementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const html = document.documentElement;

    /* Side-effects-only "we're done here": mark the session as
       played, flip the attribute so the CSS gate hides the cover,
       and broadcast so parked reveal observers fire. Deliberately
       does NOT unmount — the markup is already `display:none` via
       the gate, and calling setState synchronously from an effect
       body trips React's cascading-render lint. */
    const settle = () => {
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* private mode — fine */
      }
      html.setAttribute("data-preloader", "skip");
      endPreloader();
    };

    /* Inline script may have already marked us "skip" — trust it. */
    if (html.getAttribute("data-preloader") === "skip") return;

    /* Belt-and-braces — sessionStorage check in case the inline
       script didn't run for some reason. */
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") {
        settle();
        return;
      }
    } catch {
      /* private mode — fall through. */
    }

    html.setAttribute("data-preloader", "active");

    /* Full finish — runs from the timeline's onComplete (i.e. NOT
       synchronously in the effect body), so unmounting is safe. */
    const finish = () => {
      settle();
      setDone(true);
    };

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) {
      settle();
      return;
    }

    const root = rootRef.current;
    const cover = coverRef.current;
    const box = boxRef.current;
    const border = borderRef.current;
    const fill = fillRef.current;
    const marks = marksRef.current;
    const statement = statementRef.current;
    if (!root || !cover || !box || !border || !fill || !marks || !statement) {
      settle();
      return;
    }

    const glyphs = Array.from(
      marks.querySelectorAll<SVGGElement>(".home-preloader__glyph"),
    );
    const borderPaths = Array.from(
      border.querySelectorAll<SVGPathElement>(".home-preloader__border-path"),
    );
    const statementWords = Array.from(
      statement.querySelectorAll<HTMLSpanElement>(
        ".home-preloader__statement-inner",
      ),
    );

    const ctx = gsap.context(() => {
      /* --- measure + pre-roll state ------------------------------ */

      /* The b·o·x·3 glyphs stagger in (step 4), out (step 5) and
         back in (step 7) — each glyph group lifts + fades via
         `transform-box: fill-box` (CSS). Park them below their rest
         line + hidden to start. */
      gsap.set(glyphs, { yPercent: 8, autoAlpha: 0 });

      /* The pink fill slides up from below in step 3. GSAP must own
         the transform outright — a CSS translateY(%) gets mis-parsed
         into a stray pixel `y` the slide can't undo — so set
         yPercent + opacity together here (CSS keeps it opacity 0
         pre-JS so there's no flash before this runs). */
      gsap.set(fill, { yPercent: 100, opacity: 1 });

      /* The two border half-strokes: measure each one's real length
         and set its dash so it starts fully un-drawn, opacity up
         alongside so there's no flash of a partly-drawn border.
         Lengths kept for the step-5 undraw.
         (`getTotalLength()` rather than the `pathLength` attribute,
         which browsers don't reliably honour for dash maths.) */
      const borderLengths = borderPaths.map((path) => {
        const len = path.getTotalLength();
        gsap.set(path, {
          strokeDasharray: len,
          strokeDashoffset: len,
          opacity: 1,
        });
        return len;
      });

      /* Statement words parked below their own mask line + hidden —
         the 50% travel + autoAlpha mirror the global SplitText
         reveal. GSAP owns the transform from here. */
      gsap.set(statementWords, { yPercent: 50, autoAlpha: 0 });

      /* Morph targets, measured before any transform is applied:
         the box's resting rect (for its uniform scale) and the
         header logo's bounds (where both the cover and the box
         land). */
      const boxRect = box.getBoundingClientRect();
      const headerLogo = document.querySelector<HTMLElement>(".header__home");
      const headerRect = headerLogo?.getBoundingClientRect();

      /* Pink, read from the theme token — GSAP can't tween a CSS
         `var()`, so it needs the resolved value to crossfade to. */
      const pink = getComputedStyle(html)
        .getPropertyValue("--color-pink")
        .trim();

      const tl = gsap.timeline({ onComplete: finish });
      /* Global pacing knob — bump up to speed the whole sequence,
         down to slow it. Durations + gaps below are tuned for 1×. */
      tl.timeScale(1);

      /* Easing vocabulary, kept cohesive: the border draws + undraws
         on a controlled `power2.inOut`, arrivals settle on
         `expo.out`, departures accelerate on `power2.in`, the morph
         rides a gentle `power3.inOut`, the colour crossfade a mild
         `power1.inOut`. Pacing is cinematic — each beat is given
         room to land and read before the next, and the durations
         are long enough that the eases actually express. Note the
         `<` positions where tightly-coupled pieces overlap. */

      /* 1 — a short hold on the dark cover. */
      tl.to({}, { duration: 0.6 });

      /* 2 — the pink logo border draws on first: two half-perimeter
         strokes from opposite corners, a controlled deliberate
         stroke. */
      tl.to(borderPaths, {
        strokeDashoffset: 0,
        duration: 1,
        ease: "power2.inOut",
      });

      /* 3 — a beat after the border, the pink background slides up
         from below to fill the bordered box. */
      tl.to(
        fill,
        { yPercent: 0, duration: 0.75, ease: "expo.out" },
        "+=0.35",
      );

      /* 4 — a beat after the fill settles, the b·o·x·3 glyphs
         stagger in over it, filled white: a small lift + fade per
         glyph. */
      tl.to(
        glyphs,
        {
          yPercent: 0,
          autoAlpha: 1,
          duration: 0.6,
          ease: "expo.out",
          stagger: 0.06,
        },
        "+=0.3",
      );

      /* 5a — the finished logo holds a beat (the first weighted
         moment), then the dismantle begins: glyphs stagger out. */
      tl.to(
        glyphs,
        {
          yPercent: -8,
          autoAlpha: 0,
          duration: 0.5,
          ease: "power2.in",
          stagger: 0.05,
        },
        "+=0.9",
      );

      /* 5b — the pink background fades out, overlapping the glyph
         exit. */
      tl.to(
        fill,
        { opacity: 0, duration: 0.6, ease: "power2.in" },
        "<+=0.2",
      );

      /* 5c — the pink border undraws — held until the fill is
         mostly gone so the pink stroke reads against the dark
         cover, not against the pink. */
      tl.to(
        borderPaths,
        {
          strokeDashoffset: (i: number) => borderLengths[i],
          duration: 0.85,
          ease: "power2.inOut",
        },
        "<+=0.4",
      );

      /* 6a — a breath on the bare dark cover, then the statement
         reads in word by word. */
      tl.to(
        statementWords,
        {
          yPercent: 0,
          autoAlpha: 1,
          duration: 0.7,
          ease: "expo.out",
          stagger: 0.04,
        },
        "+=0.5",
      );

      /* 6b — a held beat to let the statement read (the second
         weighted moment), then the words lift away + fade. */
      tl.to(
        statementWords,
        {
          yPercent: -50,
          autoAlpha: 0,
          duration: 0.5,
          ease: "power2.in",
          stagger: 0.03,
        },
        "+=1",
      );

      /* 7 — the hand-off. After a breath, the dark cover morphs onto
         the header's home square; the box (carrying the glyphs)
         morphs onto the same bounds in parallel; the square
         recolours brown → pink, overlapping the morph; then the
         glyphs stagger up into place. Skipped only if the header
         logo isn't in the DOM. */
      if (headerRect) {
        /* Reset the glyphs to their rest position + hidden. They
           fade straight in here with NO slide: at the small header
           scale a yPercent lift is only ~1–2px, which reads as a
           glitchy snap rather than an intentional slide — and it
           must land pixel-exact on the header logo's glyphs for a
           clean hand-off, so they just fade into their final spot. */
        tl.set(glyphs, { autoAlpha: 0, yPercent: 0 });

        /* Cover: resizes + repositions onto the header logo's exact
           bounds, rounding its corners to 11.5% as it goes so it
           lands matching the header logo's radius. A layout
           animation rather than a transform — keeps the rounding
           clean (no non-uniform-scale distortion). */
        tl.to(
          cover,
          {
            top: headerRect.top,
            left: headerRect.left,
            width: headerRect.width,
            height: headerRect.height,
            borderRadius: "11.5%",
            duration: 1,
            ease: "power3.inOut",
          },
          "+=0.5",
        );

        /* Box: a uniform scale + translate onto the same bounds, in
           parallel — so the glyphs ride along without distortion. */
        const morphScale = headerRect.width / boxRect.width;
        const morphX =
          headerRect.left +
          headerRect.width / 2 -
          (boxRect.left + boxRect.width / 2);
        const morphY =
          headerRect.top +
          headerRect.height / 2 -
          (boxRect.top + boxRect.height / 2);
        tl.to(
          box,
          {
            scale: morphScale,
            x: morphX,
            y: morphY,
            duration: 1,
            ease: "power3.inOut",
          },
          "<",
        );

        /* The collapsed square recolours brown → pink, overlapping
           the tail of the morph so there's no pause. */
        tl.to(
          cover,
          { backgroundColor: pink, duration: 0.55, ease: "power1.inOut" },
          "<+=0.5",
        );

        /* A beat after the recolour, the b·o·x·3 glyphs fade in,
           staggered, exactly where the header logo's glyphs sit —
           no slide, so the hand-off has nothing to snap. */
        tl.to(
          glyphs,
          {
            autoAlpha: 1,
            duration: 0.6,
            ease: "expo.out",
            stagger: 0.06,
          },
          "+=0.3",
        );
      }

      /* Final hold — let the handed-off mark register before the
         preloader unmounts and the (identical) header logo, which
         has been sitting underneath all along, takes over. */
      tl.to({}, { duration: 0.45 });
    }, root);

    return () => ctx.revert();
  }, []);

  if (done) return null;

  return (
    <div className="home-preloader" ref={rootRef} aria-hidden="true">
      {/* The visible dark backdrop — and the element that morphs to
          the header logo's bounds in step 7. A sibling of the box,
          never its ancestor, so the morph can't distort the mark. */}
      <div className="home-preloader__cover" ref={coverRef} />

      <div className="home-preloader__box" ref={boxRef}>
        {/* Pink background — slides up to fill the box (step 3),
            fades out again in step 5. */}
        <div className="home-preloader__fill" ref={fillRef} />

        <svg
          className="home-preloader__border"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          ref={borderRef}
        >
          {/* Two half-perimeter strokes from opposite corners,
              tracing the box's exact rounded-rect edge. The stroke
              is inset half its own width (0.3 of the 100-unit
              viewBox) so its OUTER edge sits flush on the box edge —
              the pink background sits exactly within it, no gap or
              overlap. Corner radius 11.2 = the box's 11.5% radius
              less the 0.3 inset.
              A — top-left → top edge → right edge → bottom-right.
              B — bottom-right → bottom edge → left edge → top-left.
              Both run clockwise, so the two pens sweep symmetrically. */}
          <path
            className="home-preloader__border-path"
            d="M11.5 0.3 L88.5 0.3 A11.2 11.2 0 0 1 99.7 11.5 L99.7 88.5 A11.2 11.2 0 0 1 88.5 99.7"
          />
          <path
            className="home-preloader__border-path"
            d="M88.5 99.7 L11.5 99.7 A11.2 11.2 0 0 1 0.3 88.5 L0.3 11.5 A11.2 11.2 0 0 1 11.5 0.3"
          />
        </svg>

        {/* The b·o·x·3 glyphs. Each glyph is its own <g> so the
            timeline can stagger them in + out. They appear filled
            white with a small per-glyph lift; the "o"'s counter is
            a true evenOdd cut-out. */}
        <svg
          className="home-preloader__marks"
          viewBox={LOGO_VIEWBOX}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          ref={marksRef}
        >
          {LOGO_GLYPHS.map((glyph) => (
            <g key={glyph.id} className="home-preloader__glyph">
              {glyph.paths.map((p, i) => (
                <path
                  key={i}
                  className="home-preloader__mark"
                  fillRule={p.evenOdd ? "evenodd" : undefined}
                  d={p.d}
                />
              ))}
            </g>
          ))}
        </svg>
      </div>

      {/* The statement (step 6) — reads in word by word on the dark
          cover. Each word is its own clip-mask so the inner can lift
          in and out. Sits after the box in the DOM so it stacks
          above it without needing a z-index. */}
      <div
        className="home-preloader__statement"
        ref={statementRef}
        aria-hidden="true"
      >
        <p className="home-preloader__statement-text">
          {STATEMENT.split(" ").map((word, i) => (
            <Fragment key={i}>
              {i > 0 ? " " : null}
              <span className="home-preloader__statement-word">
                <span className="home-preloader__statement-inner">
                  {word}
                </span>
              </span>
            </Fragment>
          ))}
        </p>
      </div>
    </div>
  );
}
