/**
 * HomeIntro
 * =========
 * Brand-theme intro block for the home page, rendered directly below
 * the hero. Content is Sanity-driven via `homeIntroSection`.
 *
 * Text reveal:
 *   Body + both supporting points render as inline word spans and
 *   get split by rendered line after fonts load (same shared util
 *   as TestimonialsSection). All resulting line-split elements go
 *   into a single GSAP tween with a 0.05s stagger so the reveal
 *   flows from the top of the big paragraph through to the bottom
 *   of the last supporting paragraph in one orchestrated sweep.
 *
 * Staircase effect:
 *   Three stacked horizontal bars at the bottom of the section,
 *   each with a different width (narrowest on top, widest on the
 *   bottom). On scroll each bar scales from 0 → 1 along its left
 *   edge, staggered from the bottom up — the widest bar fills first.
 *   Bars fill with `--home-intro-stair-fill` (defaults to
 *   `--color-cream-500`) so the staircase reads as the neighbouring
 *   cream section emerging from beneath the brand block.
 */

"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { duration as animDuration, ease } from "@/config/animations.config";
import { splitByRenderedLines, toWordTokens } from "@/lib/splitLines";
import type { HomeIntroPoint } from "@/sanity/queries/homeIntroSection";

import "./HomeIntro.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface HomeIntroProps {
  body: string;
  points?: HomeIntroPoint[];
}

/* Fractions of the section width each bar reaches when fully revealed.
   Arithmetic progression so every step up the staircase advances the
   same horizontal distance: bottom bar stops at exactly halfway (3/6),
   middle at 2/6, top at 1/6. Each bar's right edge is therefore
   evenly spaced from its neighbour. */
const STAIR_FRACTIONS = [1 / 6, 2 / 6, 3 / 6] as const;

export default function HomeIntro({ body, points = [] }: HomeIntroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const pointsRef = useRef<HTMLUListElement>(null);
  const stairsWrapRef = useRef<HTMLDivElement>(null);

  /* ── Staircase ───────────────────────────────────────────── */
  useEffect(() => {
    const section = sectionRef.current;
    const wrap = stairsWrapRef.current;
    if (!section || !wrap) return;

    const stairs = Array.from(
      wrap.querySelectorAll<HTMLElement>("[data-stair]"),
    );
    if (stairs.length === 0) return;

    const setWidths = () => {
      const w = section.offsetWidth;
      for (const stair of stairs) {
        const f = parseFloat(stair.dataset.stair ?? "0");
        stair.style.width = `${Math.round(f * w)}px`;
      }
    };
    setWidths();

    gsap.set(stairs, { scaleX: 0, transformOrigin: "left center" });

    const tween = gsap.to(stairs, {
      scaleX: 1,
      ease: "none",
      stagger: { each: 0.1, from: "end", ease: "power2.inOut" },
      scrollTrigger: {
        trigger: section,
        start: "bottom bottom",
        end: "bottom 40%",
        scrub: true,
      },
    });

    const onResize = () => {
      setWidths();
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [body]);

  /* ── Orchestrated line-split reveal (body + points) ──────── */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let disposed = false;
    let tween: gsap.core.Tween | null = null;
    let trigger: ScrollTrigger | null = null;

    const build = () => {
      if (disposed) return;

      /* Collect every element that needs line-splitting: the body
         paragraph first, then each supporting point in order. */
      const targets: HTMLElement[] = [];
      if (bodyRef.current) targets.push(bodyRef.current);
      if (pointsRef.current) {
        targets.push(
          ...Array.from(
            pointsRef.current.querySelectorAll<HTMLElement>(
              "[data-home-intro-text]",
            ),
          ),
        );
      }

      const allLines: HTMLElement[] = [];
      for (const el of targets) {
        const lines = splitByRenderedLines(
          el,
          "home-intro__line-mask",
          "home-intro__line-split",
        );
        allLines.push(...lines);
      }
      if (allLines.length === 0) return;

      gsap.set(allLines, { yPercent: 100, opacity: 0 });

      /* Match TestimonialsSection exactly — same duration, stagger,
         and ease so the two reveals feel like one design system. */
      tween = gsap.fromTo(
        allLines,
        { yPercent: 100, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: animDuration.fast + 0.1, // ~0.3s
          stagger: 0.05,
          ease: ease.splitText,
          paused: true,
        },
      );

      trigger = ScrollTrigger.create({
        trigger: section,
        start: "top 80%",
        once: true,
        onEnter: () => {
          tween?.play();
        },
      });
    };

    const fontsReady =
      typeof document !== "undefined" && "fonts" in document
        ? (document as Document & { fonts: FontFaceSet }).fonts.ready
        : Promise.resolve();

    fontsReady.then(build);

    return () => {
      disposed = true;
      trigger?.kill();
      tween?.kill();
    };
  }, [body, points.length]);

  const bodyTokens = toWordTokens(body);

  return (
    <section
      ref={sectionRef}
      className="home-intro"
      data-theme="brand"
      data-nav-theme="brand"
      aria-label="Introduction"
    >
      <p
        ref={bodyRef}
        className="home-intro__body"
        aria-label={body}
      >
        {bodyTokens.map((tok, i) => (
          <span key={i} className="home-intro__word" data-word>
            {tok.word}
            {tok.trailingSpace ? " " : ""}
          </span>
        ))}
      </p>

      {points.length > 0 ? (
        <ul ref={pointsRef} className="home-intro__points">
          {points.map((p) => {
            const tokens = toWordTokens(p.text);
            return (
              <li key={p._key} className="home-intro__point">
                {/* Inner wrapper carries the `data-home-intro-text`
                    attribute — the reveal effect queries this so the
                    split happens inside the same element it animates,
                    without disturbing the `<li>`'s layout classes. */}
                <span
                  className="home-intro__point-text"
                  data-home-intro-text
                  aria-label={p.text}
                >
                  {tokens.map((tok, i) => (
                    <span key={i} className="home-intro__word" data-word>
                      {tok.word}
                      {tok.trailingSpace ? " " : ""}
                    </span>
                  ))}
                </span>
              </li>
            );
          })}
        </ul>
      ) : null}

      <div ref={stairsWrapRef} className="home-intro__stairs" aria-hidden="true">
        {STAIR_FRACTIONS.map((fraction, i) => (
          <div
            key={i}
            className="home-intro__stair"
            data-stair={fraction}
          />
        ))}
      </div>
    </section>
  );
}
