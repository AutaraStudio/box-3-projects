/**
 * PartnersSection
 * ===============
 * Infinite horizontal marquee of partner / brand logos rendered as
 * a 2-row checkerboard strip scrolling left to right forever.
 *
 *   Row 1: logo · empty · logo · logo · empty · logo
 *   Row 2: empty · logo · logo · empty · logo · logo
 *
 * One panel = 6 cols × 2 rows = 12 cells. The track contains three
 * panels so the GSAP modulo modifier can wrap `x` seamlessly at
 * every panel boundary without a visible jump.
 *
 * Scroll-direction aware — scrolling up flips the marquee timeScale
 * so the motion feels tied to reading direction. A subtle parallax
 * also drifts the whole scroll wrapper horizontally on page scroll.
 *
 * Client component — GSAP runs in the browser only. SVG markup is
 * fetched + sanitised server-side by lib/fetchPartners.ts and passed
 * down as resolved `svgContent` strings, which keeps inlined-SVG +
 * `currentColor` working without async client code.
 */

"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Heading from "@/components/ui/Heading";
import type { ResolvedPartner } from "@/sanity/queries/partnersSection";

import "./PartnersSection.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* --------------------------------------------------------------------------
   Panel builder
   --------------------------------------------------------------------------
   Builds one panel of the 2-row checkerboard. 12 cells total — the
   `null` slots are transparent, so the page bg shows through and you
   get the editorial stagger from the reference. Partners cycle via
   modulo if fewer than 8 are supplied, so the marquee never has gaps. */

function buildPanel(
  partners: ResolvedPartner[],
): Array<ResolvedPartner | null> {
  if (partners.length === 0) return [];
  const COLS = 6;
  const nullRow1 = [1, 4];
  const nullRow2 = [0, 3];
  const panel: Array<ResolvedPartner | null> = [];
  let pIndex = 0;

  for (let col = 0; col < COLS; col++) {
    if (nullRow1.includes(col)) panel.push(null);
    else panel.push(partners[pIndex++ % partners.length]);
  }
  for (let col = 0; col < COLS; col++) {
    if (nullRow2.includes(col)) panel.push(null);
    else panel.push(partners[pIndex++ % partners.length]);
  }

  return panel;
}

/* --------------------------------------------------------------------------
   Component
   -------------------------------------------------------------------------- */

interface PartnersSectionProps {
  /** Top-left heading rendered above the marquee. */
  heading: string;
  /** Kept on the prop surface for future / Sanity parity even if it
   *  isn't currently rendered. */
  sectionLabel?: string;
  partners: ResolvedPartner[];
}

export default function PartnersSection({
  heading,
  partners,
}: PartnersSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  /* Build one checkerboard panel, then triple it for seamless looping. */
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

    /* Wait one frame so the grid has its final layout before we read
       scrollWidth — without this, panelWidth can come back as 0 on
       first paint and the loop never starts. */
    const raf = requestAnimationFrame(() => {
      const panelWidth = track.scrollWidth / 3;
      if (panelWidth === 0) return;

      /* Marquee duration = how many seconds it takes to slide one
         full panel width. Tied loosely to viewport so wider screens
         don't feel sluggish. */
      const speedFactor = (panelWidth / window.innerWidth) * 25;

      /* JavaScript's % returns negative values for negative inputs
         which would cause a visible jump at the loop seam. This
         positive-modulo helper keeps x wrapping seamlessly. */
      const posMod = (n: number, m: number): number => ((n % m) + m) % m;

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

      /* Reverse on scroll up, forward on scroll down — ties motion
         to reading direction without breaking the loop. */
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

      /* Subtle horizontal parallax — the whole scroll wrapper drifts
         a little as the section moves through the viewport. */
      const parallaxVw = 8;
      scrollTween = gsap.fromTo(
        scroll,
        { x: `${parallaxVw}vw` },
        {
          x: `-${parallaxVw}vw`,
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
      className="partners-section"
      data-theme="dark"
    >
      <div className="container partners-section__header">
        <Heading as="h2" className="partners-section__heading text-h4">
          {heading}
        </Heading>
      </div>
      <hr className="partners-section__divider" aria-hidden="true" />

      {/* Scroll-drift wrapper — GSAP animates x on page scroll. */}
      <div ref={scrollRef} className="partners-section__scroll">
        {/* Infinite track — GSAP animates x for the loop. */}
        <div ref={trackRef} className="partners-section__track">
          {triplePanel.map((item, index) =>
            item === null ? (
              <div
                key={`empty-${index}`}
                className="partners-section__cell partners-section__cell--empty"
                aria-hidden="true"
              />
            ) : (
              <div
                key={`${item._key}-${index}`}
                className="partners-section__cell"
                role="img"
                aria-label={item.name}
              >
                {item.svgContent ? (
                  /* Inlining is intentional — currentColor only works
                     when the SVG is rendered directly in the DOM.
                     Content is fetched + sanitised server-side, so
                     no untrusted markup reaches this point. */
                  <div
                    className="partners-section__svg"
                    aria-hidden="true"
                    dangerouslySetInnerHTML={{ __html: item.svgContent }}
                  />
                ) : (
                  <div className="partners-section__svg" aria-hidden="true" />
                )}
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
