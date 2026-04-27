/**
 * ProcessTimeline
 * ===============
 * Sticky scroll-driven "orbit" of process steps. Adapted from
 * the supplied ScrollOrbit reference — same animation grammar:
 *
 *   1. Tall section (height = max(N, 6) × 0.7 × 100vh) with a
 *      position-sticky inner viewport that stays in view while
 *      the user scrolls through the section's height. NO PIN.
 *   2. Two backbone lines (top horizontal + vertical) draw in via
 *      `scaleX/Y 0 → 1` at the section start.
 *   3. Per-step horizontal "arm" lines branch out from the
 *      vertical backbone, drawing in left-to-right with a stagger.
 *   4. The `arms-wrap` translates Y from 0 → -(N-1)×spacing
 *      across ~65% of the timeline so each arm passes through the
 *      vertical centre of the sticky viewport.
 *   5. A per-frame `updateHighlight()` runs while translating,
 *      scaling each arm's dot up to ~2.75× when it sits at centre
 *      and easing content opacity from 0.3 → 1 in a transition
 *      band. Other arms remain dimmed but visible.
 *   6. Reverse-stagger draw-out as the section exits.
 *   7. Continuous glitch effect on the vertical line — random
 *      canvas-noise mask applied every 3-9 seconds, cleared
 *      after a beat. Adds CRT-screen aliveness between scroll
 *      events.
 *
 * Mobile (≤767px) fallback: section unsticks, canvas hides, and a
 * stacked text list takes over.
 */

"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Heading from "@/components/ui/Heading";
import { awaitTransitionEnd } from "@/components/transition/transitionState";

import "./ProcessTimeline.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** Vertical spacing between arms (rem). Generous on purpose so
 *  each step gets room for a large display-size step number plus
 *  title plus body without crowding its neighbours. */
const ARM_SPACING_REM = 20;

export interface ProcessStep {
  title: string;
  body: string;
}

interface ProcessTimelineProps {
  label?: string;
  heading: string;
  subheading?: string;
  steps: ProcessStep[];
  /** Theme applied to the section wrapper. Defaults to "dark" so
   *  the timeline reads as a tonal break, but pages can pass
   *  "cream" or "pink" when the surrounding rhythm needs a
   *  light field instead. */
  theme?: "dark" | "cream" | "pink";
}

/** Generates a 400×400 white-block noise data URL — used as a
 *  mask-image on the vertical line for an occasional glitch effect.
 *  Density `d` controls how many cells stay opaque vs transparent. */
function makeNoise(d = 0.2): string {
  const c = document.createElement("canvas");
  c.width = c.height = 400;
  const ctx = c.getContext("2d");
  if (!ctx) return "";
  for (let y = 0; y < 400; y += 100) {
    for (let x = 0; x < 400; x += 100) {
      if (Math.random() > d) {
        ctx.fillStyle = "white";
        ctx.fillRect(x, y, 100, 100);
      }
    }
  }
  return c.toDataURL();
}

export default function ProcessTimeline({
  label = "Process",
  heading,
  subheading,
  steps,
  theme = "dark",
}: ProcessTimelineProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const topLineRef = useRef<HTMLDivElement>(null);
  const vertLineRef = useRef<HTMLDivElement>(null);
  const armsRef = useRef<HTMLDivElement>(null);

  const N = steps.length;
  /* Scroll budget — section height = budgetMultiplier × 100vh.
     Floor at 6 so even short timelines have enough scroll room
     for the draw-in / translate / draw-out phases to read. */
  const budgetMultiplier = Math.max(N, 6) * 0.7;

  useEffect(() => {
    const section = sectionRef.current;
    const sticky = stickyRef.current;
    const topLine = topLineRef.current;
    const vertLine = vertLineRef.current;
    const armsWrap = armsRef.current;
    if (!section || !sticky || !topLine || !vertLine || !armsWrap) return;
    if (N === 0) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) return;

    let cancelled = false;
    let cleanupInner: (() => void) | undefined;

    awaitTransitionEnd().then(() => {
      if (cancelled) return;

      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        const rem = parseFloat(
          getComputedStyle(document.documentElement).fontSize,
        );
        const armSpacing = ARM_SPACING_REM * rem;
        const totalTravel = (N - 1) * armSpacing;

        const armLines = gsap.utils.toArray<HTMLElement>(
          section.querySelectorAll("[data-orbit-line]"),
        );
        const armDots = gsap.utils.toArray<HTMLElement>(
          section.querySelectorAll("[data-orbit-dot]"),
        );
        const armContents = gsap.utils.toArray<HTMLElement>(
          section.querySelectorAll("[data-orbit-content]"),
        );

        /* ── Initial hidden state ── */
        gsap.set(vertLine, {
          scaleY: 0,
          transformOrigin: "center top",
        });
        gsap.set(topLine, {
          scaleX: 0,
          transformOrigin: "left center",
        });
        gsap.set(armLines, {
          scaleX: 0,
          transformOrigin: "left center",
        });
        gsap.set(armDots, { opacity: 0, scale: 1 });
        gsap.set(armContents, { opacity: 0.3 });
        gsap.set(armsWrap, { y: 0, force3D: true });

        /* ── Highlight calc — runs every frame during translate.
             Distance from active centre is in pixels; normalised
             against arm spacing so the same maths works at any
             viewport size. */
        const posProxy = { y: 0 };
        const INACTIVE_OPACITY = 0.3;
        const ACTIVE_DOT_SCALE = 22 / 8;

        function updateHighlight() {
          const curY = posProxy.y;
          armContents.forEach((el, i) => {
            const dist = Math.abs(i * armSpacing + curY);
            const norm = dist / armSpacing;
            let contentOpacity: number;
            let dotScale: number;
            if (norm <= 0.4) {
              /* At centre — full colour, large dot. */
              contentOpacity = 1;
              dotScale = ACTIVE_DOT_SCALE;
            } else if (norm <= 0.75) {
              /* Transition band — ease both. */
              const f = (norm - 0.4) / 0.35;
              contentOpacity = 1 - f * (1 - INACTIVE_OPACITY);
              dotScale = ACTIVE_DOT_SCALE - f * (ACTIVE_DOT_SCALE - 1);
            } else {
              contentOpacity = INACTIVE_OPACITY;
              dotScale = 1;
            }
            gsap.set(el, { opacity: contentOpacity });
            gsap.set(armDots[i], { scale: dotScale });
          });
        }

        /* ── Scrubbed timeline. Section provides scroll budget via
             its CSS height; sticky inner keeps the canvas in view. */
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });

        /* Phase 1 — DRAW IN (0.00 → 0.10) */
        tl.to(topLine,
          { scaleX: 1, duration: 0.08, ease: "none" },
          0.0,
        );
        tl.to(vertLine,
          { scaleY: 1, duration: 0.08, ease: "none" },
          0.01,
        );
        tl.to(armLines, {
          scaleX: 1,
          duration: 0.08,
          ease: "none",
          stagger: { each: 0.016, from: "start" },
        }, 0.02);

        /* Phase 2 — DOT + TEXT REVEAL (~0.10 → 0.13) */
        tl.to(armDots, {
          opacity: 1,
          duration: 0.025,
          ease: "none",
          stagger: 0.002,
        }, `>${-0.1}`);
        tl.to(armContents, {
          opacity: (i: number) => (i === 0 ? 1 : INACTIVE_OPACITY),
          duration: 0.025,
          stagger: 0.002,
        }, "<0.01");

        /* Phase 3 — TRANSLATE (0.13 → 0.78) */
        tl.to(posProxy, {
          y: -totalTravel,
          ease: "linear",
          duration: 0.65,
          immediateRender: false,
          onUpdate: updateHighlight,
        });
        tl.to(armsWrap, {
          y: -totalTravel,
          ease: "linear",
          duration: 0.65,
          immediateRender: false,
        }, "<");

        /* Phase 4 — DRAW OUT (~0.78 → end) */
        tl.to([...armContents, ...armDots], {
          opacity: 0,
          duration: 0.04,
          stagger: 0.001,
        });
        tl.to([...armLines].reverse(), {
          scaleX: 0,
          duration: 0.05,
          ease: "none",
          stagger: { each: 0.008, from: "start" },
        }, "<0.02");
        tl.to(vertLine,
          { scaleY: 0, duration: 0.08, ease: "none" },
          "<0.02",
        );
        tl.to(topLine,
          { scaleX: 0, duration: 0.08, ease: "none" },
          "<",
        );

        /* ── Glitch — periodically slap a random noise mask on the
             vertical line, then clear it. Adds CRT-screen
             "aliveness" between scroll events. */
        const lineNoise = () => {
          const u = makeNoise(gsap.utils.random(0.1, 0.35));
          vertLine.style.maskImage = `url(${u})`;
          vertLine.style.webkitMaskImage = `url(${u})`;
        };
        const lineClear = () => {
          vertLine.style.maskImage = "none";
          vertLine.style.webkitMaskImage = "none";
        };
        const glitchTl = gsap.timeline({ repeat: -1 });
        glitchTl
          .to({}, {
            delay: gsap.utils.random(3, 9),
            duration: gsap.utils.random(0.15, 0.4),
          })
          .call(lineNoise)
          .to({}, { duration: gsap.utils.random(0.04, 0.15) })
          .call(lineNoise)
          .to({}, { duration: gsap.utils.random(0.06, 0.12) })
          .call(lineClear);

        ScrollTrigger.refresh();

        return () => {
          lineClear();
          glitchTl.kill();
          tl.kill();
          gsap.killTweensOf(armLines);
          gsap.killTweensOf(armDots);
          gsap.killTweensOf(armContents);
          gsap.killTweensOf(vertLine);
          gsap.killTweensOf(topLine);
          gsap.killTweensOf(armsWrap);
        };
      });

      cleanupInner = () => mm.revert();
    });

    return () => {
      cancelled = true;
      cleanupInner?.();
    };
  }, [N]);

  if (N === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="process-timeline"
      data-theme={theme}
      style={{ height: `${budgetMultiplier * 100}vh` } as CSSProperties}
    >
      {/* Heading — in normal flow at the top of the section.
          Heading on the left (h2 + label eyebrow), subheading on
          the right, bottom-aligned per the reference. Stacks
          vertically on mobile. Scrolls past as the user enters;
          the sticky canvas takes over from there. */}
      <div className="process-timeline__heading-wrap">
        <div className="process-timeline__heading-inner">
          <p className="process-timeline__label text-small text-caps">
            {label}
          </p>
          <Heading
            as="h2"
            className="process-timeline__heading text-h2"
          >
            {heading}
          </Heading>
        </div>
        {subheading && (
          <div className="process-timeline__heading-inner">
            <p className="process-timeline__subheading text-large">
              {subheading}
            </p>
          </div>
        )}
      </div>

      {/* Sticky viewport — stays in view through the section's
          height while the timeline animates. */}
      <div ref={stickyRef} className="process-timeline__sticky">
        <div className="process-timeline__canvas">
          {/* Top horizontal line — `scaleX 0 → 1` from left. */}
          <div
            ref={topLineRef}
            className="process-timeline__top-line"
            aria-hidden="true"
          />
          {/* Vertical line — `scaleY 0 → 1` from top. The glitch
              tween mounts a periodic mask-image on this element. */}
          <div
            ref={vertLineRef}
            className="process-timeline__vert-line"
            aria-hidden="true"
          />

          {/* Arms wrap — translates Y on scroll so each arm passes
              through the viewport's vertical centre in turn. */}
          <div
            ref={armsRef}
            className="process-timeline__arms-wrap"
          >
            {steps.map((step, i) => (
              <div
                key={i}
                className="process-timeline__arm"
                style={{ top: `${i * ARM_SPACING_REM}rem` }}
              >
                <div
                  data-orbit-line
                  className="process-timeline__arm-line"
                  aria-hidden="true"
                />
                <div
                  data-orbit-dot
                  className="process-timeline__arm-dot"
                  aria-hidden="true"
                />
                <div
                  data-orbit-content
                  className="process-timeline__arm-content"
                >
                  {/* Left side — small caps chapter eyebrow + title
                      stacked, anchored to the start of the row. */}
                  <div className="process-timeline__arm-lede">
                    <p className="process-timeline__arm-num text-small text-caps">
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <h3 className="process-timeline__arm-title text-h4">
                      {step.title}
                    </h3>
                  </div>
                  {/* Right side — body paragraph at the far end
                      of the row. */}
                  <p className="process-timeline__arm-body text-large">
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile fallback (≤767px) — stacked list, no animation. */}
      <ul className="process-timeline__mobile-list">
        {steps.map((step, i) => (
          <li
            key={i}
            className="process-timeline__mobile-item"
          >
            <p className="process-timeline__mobile-num text-small text-caps">
              {String(i + 1).padStart(2, "0")}
            </p>
            <h3 className="process-timeline__mobile-title text-h4">
              {step.title}
            </h3>
            <p className="process-timeline__mobile-body text-large">
              {step.body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
