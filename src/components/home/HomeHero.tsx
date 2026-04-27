/**
 * HomeHero
 * ========
 * Full-viewport video hero. Looping background video with a dark
 * gradient overlay so light type can read against it. Bottom-row
 * editorial layout: short paragraph statement at the bottom-left,
 * "(scroll down)" affordance at the bottom-right.
 *
 * The hero's *visual* content sits in `.home-hero__fixed` —
 * `position: fixed` so it stays anchored to the viewport while
 * the user scrolls. The outer `<section>` is in normal flow at
 * `height: 100vh`, reserving the document-scroll budget. Once
 * the user scrolls past 100vh, the next section in DOM (with
 * its opaque themed background) scrolls up *over* the fixed
 * hero — the "slide over the hero" effect.
 *
 * Animations on scroll-into-the-section:
 *   - statement paragraph fades + scales (1 → 0, 1 → 0.92) under
 *     a GSAP scrub, ending at 40% of the section's transit so
 *     the type is gone before the next section arrives at the
 *     viewport top.
 *   - a brown darken layer fades in (0 → 0.7) across the full
 *     transit so the footage recedes into shadow.
 *   - the scroll-down indicator stays visible — it's a quiet
 *     UI affordance, not part of the editorial moment, so it
 *     doesn't fade with the statement.
 *
 * Reduced-motion users get the static layout.
 *
 * Video plays muted + autoplay + playsInline so iOS Safari and
 * mobile Chrome don't block it. `preload="metadata"` keeps the
 * initial payload small — the file streams progressively.
 */

"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import SplitText from "@/components/split-text/SplitText";
import { awaitTransitionEnd } from "@/components/transition/transitionState";

import "./HomeHero.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface HomeHeroProps {
  /** Looping background video URL. Defaults to the brand reel. */
  videoSrc?: string;
  /** Paragraph statement rendered bottom-left over the video.
   *  Body-size editorial commentary, not a display heading. */
  statement?: string;
  /** Bottom-right scroll affordance label. Defaults to
   *  "Scroll down". Wrapped in parentheses by the component. */
  scrollLabel?: string;
}

const DEFAULT_VIDEO =
  "https://box-3.b-cdn.net/47d7d53c-de685d0e.mp4";
const DEFAULT_STATEMENT =
  "Specialist commercial fit-outs in London.";

export default function HomeHero({
  videoSrc = DEFAULT_VIDEO,
  statement = DEFAULT_STATEMENT,
  scrollLabel = "Scroll down",
}: HomeHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const darkenRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    const darken = darkenRef.current;
    if (!section || !content || !darken) return;

    let ctx: gsap.Context | null = null;
    let cancelled = false;

    awaitTransitionEnd().then(() => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        const mm = gsap.matchMedia();
        mm.add("(prefers-reduced-motion: no-preference)", () => {
          /* Statement fade + scale. Ends at 40% of the section's
             height so the type is gone before the next section
             arrives at the viewport top. */
          gsap.fromTo(
            content,
            { opacity: 1, scale: 1 },
            {
              opacity: 0,
              scale: 0.92,
              ease: "none",
              scrollTrigger: {
                trigger: section,
                start: "top top",
                end: "+=40%",
                scrub: true,
                invalidateOnRefresh: true,
              },
            },
          );

          /* Darken layer — opaque brown that fades in across the
             full 100vh transit, so the footage recedes into
             shadow once the type has cleared. */
          gsap.fromTo(
            darken,
            { opacity: 0 },
            {
              opacity: 0.7,
              ease: "none",
              scrollTrigger: {
                trigger: section,
                start: "top top",
                end: "bottom top",
                scrub: true,
                invalidateOnRefresh: true,
              },
            },
          );
        });
      }, section);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  /* Programmatic scroll to the next section (top of the page +
     one viewport height). Routes through the active Lenis
     instance for smooth scrolling consistent with the rest of
     the site; falls back to native smooth scroll if Lenis
     hasn't booted yet. */
  const handleScrollDown = () => {
    if (typeof window === "undefined") return;
    const target = window.innerHeight;
    if (window.__lenis) {
      window.__lenis.scrollTo(target);
    } else {
      window.scrollTo({ top: target, behavior: "smooth" });
    }
  };

  return (
    <section ref={sectionRef} className="home-hero" data-theme="dark">
      <div className="home-hero__fixed">
        <video
          className="home-hero__video"
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
        <span className="home-hero__overlay" aria-hidden="true" />
        <span
          ref={darkenRef}
          className="home-hero__darken"
          aria-hidden="true"
        />

        <div className="container home-hero__inner">
          {/* Statement — bottom-left. Wrapped in `__content` so
              the GSAP fade+scale targets the paragraph alone,
              leaving the scroll-down affordance visible. */}
          <div ref={contentRef} className="home-hero__content">
            <p className="home-hero__statement text-display">
              <SplitText asWords revealOnScroll>
                {statement}
              </SplitText>
            </p>
          </div>

          {/* Scroll-down affordance — bottom-right. Stays visible
              through the fade because it's outside `__content`. */}
          <button
            type="button"
            className="home-hero__scroll text-small text-caps"
            onClick={handleScrollDown}
            aria-label={`${scrollLabel} to next section`}
          >
            ({scrollLabel})
          </button>
        </div>
      </div>
    </section>
  );
}
