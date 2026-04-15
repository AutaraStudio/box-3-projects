/**
 * PartnersSection
 * ===============
 * Infinite horizontal marquee of partner / brand logos rendered
 * as a 2-row checkerboard strip scrolling left to right forever.
 *
 * Row 1: logo, empty, logo, logo, empty, logo
 * Row 2: empty, logo, logo, empty, logo, logo
 *
 * A single "panel" is one 6×2 = 12-cell checkerboard. The track
 * contains three panels so the GSAP modulo modifier can wrap x
 * seamlessly at every panel boundary.
 *
 * Scroll-direction aware — scroll up flips the marquee timeScale
 * so the motion feels tied to reading direction. A gentle parallax
 * also drifts the whole scroll wrapper horizontally on page scroll.
 *
 * This is a client component: GSAP runs in the browser only.
 * SVG markup is fetched + sanitised server-side in page.tsx
 * and passed down as resolved `svgContent` strings — this keeps
 * inlined-SVG + currentColor working without async client code.
 */

"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ResolvedPartner } from "@/sanity/queries/partnersSection";

import "./PartnersSection.css";

gsap.registerPlugin(ScrollTrigger);

/* --------------------------------------------------------------------------
   Panel builder
   -------------------------------------------------------------------------- */

/**
 * Builds one panel of the 2-row checkerboard marquee.
 * Each panel = 12 cells (6 cols × 2 rows).
 * null = empty transparent slot.
 *
 * Row 1 null positions: cols 1 and 4
 * Row 2 null positions: cols 0 and 3
 *
 * Partners wrap via modulo if fewer than 8 are provided.
 */
function buildPanel(
  partners: ResolvedPartner[],
): Array<ResolvedPartner | null> {
  if (partners.length === 0) return [];
  const COLS = 6;
  const nullRow1 = [1, 4];
  const nullRow2 = [0, 3];
  const panel: Array<ResolvedPartner | null> = [];
  let pIndex = 0;

  /* Row 1 */
  for (let col = 0; col < COLS; col++) {
    if (nullRow1.includes(col)) {
      panel.push(null);
    } else {
      panel.push(partners[pIndex % partners.length]);
      pIndex++;
    }
  }
  /* Row 2 */
  for (let col = 0; col < COLS; col++) {
    if (nullRow2.includes(col)) {
      panel.push(null);
    } else {
      panel.push(partners[pIndex % partners.length]);
      pIndex++;
    }
  }

  return panel; /* 12 cells total */
}

/* --------------------------------------------------------------------------
   Types
   -------------------------------------------------------------------------- */

interface PartnersProps {
  /** Label passed from Sanity — kept on the props surface even though
   *  it is not currently rendered, so the schema stays wired. */
  sectionLabel: string;
  partners: ResolvedPartner[];
}

/* --------------------------------------------------------------------------
   Component
   -------------------------------------------------------------------------- */

export default function PartnersSection({ partners }: PartnersProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  /* Build one checkerboard panel, then triple it for seamless looping */
  const panel = buildPanel(partners);
  const triplePanel = [...panel, ...panel, ...panel];

  useEffect(() => {
    const section = sectionRef.current;
    const scroll = scrollRef.current;
    const track = trackRef.current;
    if (!section || !scroll || !track) return;

    let animation: gsap.core.Tween | null = null;
    let scrollTween: gsap.core.Tween | null = null;
    let directionTrigger: ScrollTrigger | null = null;

    /*
     * Measure after paint so the grid has its final dimensions.
     * requestAnimationFrame ensures layout is complete before
     * we read scrollWidth — prevents incorrect panelWidth on load.
     */
    const raf = requestAnimationFrame(() => {
      const panelWidth = track.scrollWidth / 3;

      if (panelWidth === 0) return;

      const speedFactor = (panelWidth / window.innerWidth) * 25;

      /*
       * Positive modulo helper — JavaScript % returns negative
       * values for negative numbers which causes a visible jump
       * at the loop point. This always returns a positive remainder.
       */
      const posMod = (n: number, m: number): number =>
        ((n % m) + m) % m;

      animation = gsap.to(track, {
        x: -panelWidth,
        repeat: -1,
        duration: speedFactor,
        ease: "none",
        modifiers: {
          x: gsap.utils.unitize(
            (x) => -posMod(-parseFloat(x), panelWidth),
          ),
        },
      });

      /* Reverse on scroll up, forward on scroll down */
      directionTrigger = ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          if (animation) {
            animation.timeScale(self.direction === 1 ? 1 : -1);
          }
        },
      });

      /* Subtle parallax drift */
      const scrollSpeed = 8;
      scrollTween = gsap.fromTo(
        scroll,
        { x: `${scrollSpeed}vw` },
        {
          x: `-${scrollSpeed}vw`,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 0,
          },
        },
      );
    });

    return () => {
      cancelAnimationFrame(raf);
      directionTrigger?.kill();
      scrollTween?.scrollTrigger?.kill();
      scrollTween?.kill();
      animation?.kill();
    };
  }, [partners]);

  return (
    <section
      ref={sectionRef}
      data-theme="dark"
      data-nav-theme="dark"
      className="bg-[var(--theme-bg)] overflow-hidden"
      style={{
        paddingTop: "var(--section-space-md)",
        paddingBottom: "var(--space-9)",
      }}
    >
      {/* Scroll drift wrapper — GSAP animates x on page scroll */}
      <div
        ref={scrollRef}
        data-marquee-scroll=""
        className="partners-marquee-scroll"
      >
        {/* Infinite track — GSAP animates x for the loop */}
        <div
          ref={trackRef}
          data-marquee-track=""
          className="partners-marquee-track"
        >
          {triplePanel.map((item, index) =>
            item === null ? (
              /* Empty slot — transparent, section bg shows through */
              <div
                key={`empty-${index}`}
                className="partners-marquee-item partners-marquee-item--empty"
                aria-hidden="true"
              />
            ) : (
              /* Logo card */
              <div
                key={`${item._key}-${index}`}
                className="partners-marquee-item"
                role="img"
                aria-label={item.name}
              >
                {item.svgContent ? (
                  /*
                   * dangerouslySetInnerHTML is intentional.
                   * SVG must be inlined for currentColor to work.
                   * Content comes from Sanity CDN only, and is
                   * sanitised server-side before reaching here.
                   */
                  <div
                    className="partners-marquee-svg"
                    aria-hidden="true"
                    dangerouslySetInnerHTML={{ __html: item.svgContent }}
                  />
                ) : (
                  <div
                    className="partners-marquee-svg"
                    aria-hidden="true"
                  />
                )}
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
