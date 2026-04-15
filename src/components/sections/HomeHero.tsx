/**
 * HomeHero
 * ========
 * Full-viewport hero section for the home page. Dark theme with
 * decorative animated lines, a display heading, and a tagline.
 *
 * Includes a canvas placeholder for the dither engine and a
 * background image served from Sanity.
 *
 * All content received via props — zero hardcoded strings or images.
 * All animation values from @/config/animations.config — never hardcoded.
 * All colours via --theme-* tokens (dark theme applied to outer wrapper).
 */

"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { SanityImageSource } from "@sanity/image-url";

import { useGSAP } from "@/hooks/useGSAP";
import { urlFor } from "@/sanity/lib/image";
import { ease, duration, scrollTrigger } from "@/config/animations.config";

import "./HomeHero.css";

gsap.registerPlugin(ScrollTrigger);

/* --------------------------------------------------------------------------
   Types
   -------------------------------------------------------------------------- */

interface HomeHeroProps {
  /** Main hero heading text */
  heading: string;
  /** Tagline text below the heading */
  tagline: string;
  /** Sanity image asset reference (null before Sanity is wired up) */
  image: SanityImageSource | null;
  /** Alt text for the hero background image */
  imageAlt: string;
}

/* --------------------------------------------------------------------------
   Component
   -------------------------------------------------------------------------- */

export default function HomeHero({
  heading,
  tagline,
  image,
  imageAlt,
}: HomeHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);

  /* Resolve image URL from Sanity for both Next.js Image and data-src.
     Falls back to null when Sanity image is not yet provided. */
  const imageUrl = image
    ? urlFor(image).width(1920).quality(85).auto("format").url()
    : null;

  /* --- Scroll Fade Animation ---
     Scrubs opacity and scale on hero elements as the user scrolls past. */
  useGSAP(
    () => {
      if (!sectionRef.current) return;

      const fadeScaleTargets = sectionRef.current.querySelectorAll(
        "[data-hero-scroll-fade-scale]"
      );
      const fadeTargets = sectionRef.current.querySelectorAll(
        "[data-hero-scroll-fade]"
      );

      /* Fade + scale down elements */
      if (fadeScaleTargets.length > 0) {
        gsap.to(fadeScaleTargets, {
          opacity: 0,
          scale: 0.96,
          y: -20,
          ease: ease.parallax,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: scrollTrigger.scrubPanel.scrub,
          },
        });
      }

      /* Fade out only elements */
      if (fadeTargets.length > 0) {
        gsap.to(fadeTargets, {
          opacity: 0,
          ease: ease.parallax,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: scrollTrigger.scrubPanel.scrub,
          },
        });
      }
    },
    { scope: sectionRef, dependencies: [] }
  );

  return (
    <section
      ref={sectionRef}
      data-theme="dark"
      data-nav-theme="dark"
      data-hero-sticky=""
      className="relative h-[100svh] overflow-hidden"
    >
      {/* --- Dither Canvas Placeholder --- */}
      <canvas
        id="hero-dither-canvas"
        aria-hidden="true"
        className="absolute inset-0 z-[2] h-full w-full pointer-events-none"
      />

      {/* --- Dither Background Image --- */}
      <div
        data-dither=""
        className="absolute inset-0 h-full w-full"
      >
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            priority
            className="object-cover"
            sizes="100vw"
            data-src={imageUrl}
          />
        )}

      </div>

      {/* --- Dark Overlay --- */}
      <div data-overlay="dark" aria-hidden="true" />

      {/* --- Container --- */}
      <div className="container relative z-[30] h-full">
        {/* --- Hero Grid --- */}
        <div className="home-hero-grid">
          {/* Line 1 — grows downward from top */}
          <div
            data-hero-scroll-fade=""
            aria-hidden="true"
            className="line-wrap-1 u-line-wrap"
          >
            <div
              style={{ "--number": 80 } as React.CSSProperties}
              data-line-reveal-hero="top"
              className="home-hero-line is-top"
            />
          </div>

          {/* Line 2 — grows downward from top */}
          <div
            data-hero-scroll-fade=""
            aria-hidden="true"
            className="line-wrap-2 u-line-wrap"
          >
            <div
              style={{ "--number": 80 } as React.CSSProperties}
              data-line-reveal-hero="top"
              className="home-hero-line is-top"
            />
          </div>

          {/* Tagline — temporarily hidden */}
          {/* <div className="hero-tagline">
            <p
              data-hero-scroll-fade-scale=""
              data-split-text="lines"
              className="u-max-w-ch-20 font-secondary text-text-lg uppercase font-regular leading-snug text-[var(--theme-text)]"
            >
              {tagline}
            </p>
          </div> */}

          {/* Title — temporarily hidden */}
          {/* <div
            data-hero-scroll-fade-scale=""
            className="hero-title flex flex-col justify-end"
          >
            <h1
              data-split-text="lines"
              className="text-display font-primary font-bold leading-none tracking-display text-[var(--theme-text)]"
            >
              {heading}
            </h1>
          </div> */}

          {/* Line 3 — static, bottom-aligned */}
          <div
            data-hero-scroll-fade=""
            aria-hidden="true"
            className="line-wrap-3 u-line-wrap"
          >
            <div
              style={{ "--number": 65 } as React.CSSProperties}
              className="home-hero-line is-bottom"
            />
          </div>

          {/* Line 4 — grows upward from bottom */}
          <div
            data-hero-scroll-fade=""
            aria-hidden="true"
            className="line-wrap-4 u-line-wrap"
          >
            <div
              style={{ "--number": 80 } as React.CSSProperties}
              data-line-reveal-hero="bottom"
              className="home-hero-line is-bottom"
            />
          </div>

          {/* Line 5 — grows upward from bottom */}
          <div
            data-hero-scroll-fade=""
            aria-hidden="true"
            className="line-wrap-5 u-line-wrap"
          >
            <div
              style={{ "--number": 80 } as React.CSSProperties}
              data-line-reveal-hero="bottom"
              className="home-hero-line is-bottom"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
