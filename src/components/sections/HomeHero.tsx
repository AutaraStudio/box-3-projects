/**
 * HomeHero
 * ========
 * Full-viewport hero section for the home page. Night theme with
 * decorative animated lines, a display heading, a tagline, and a
 * full-bleed background image served from Sanity.
 *
 * All content received via props — zero hardcoded strings or images.
 * All colours via --theme-* tokens (night theme applied to outer wrapper).
 */

import Image from "next/image";
import type { SanityImageSource } from "@sanity/image-url";

import { urlFor } from "@/sanity/lib/image";

import "./HomeHero.css";

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
  const imageUrl = image
    ? urlFor(image).width(1920).quality(85).auto("format").url()
    : null;

  /* Break the heading after the first word so it renders as two
     lines ("Fit-Outs" / "Done Differently"). Single-word headings
     render unchanged. */
  const [headingFirstWord, ...headingRest] = heading.split(" ");
  const headingRemainder = headingRest.join(" ");

  return (
    <section
      data-theme="night"
      data-nav-theme="night"
      className="relative h-[100svh] overflow-hidden"
    >
      {/* --- Background Image --- */}
      <div className="absolute inset-0 h-full w-full">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        )}
      </div>

      {/* --- Overlay --- */}
      <div data-overlay="medium" aria-hidden="true" />

      {/* --- Container --- */}
      <div className="container relative z-[30] h-full">
        {/* --- Hero Grid --- */}
        <div className="home-hero-grid">
          {/* Line 1 — grows downward from top */}
          <div aria-hidden="true" className="line-wrap-1 u-line-wrap">
            <div
              style={{ "--number": 80 } as React.CSSProperties}
              className="home-hero-line is-top"
            />
          </div>

          {/* Line 2 — grows downward from top */}
          <div aria-hidden="true" className="line-wrap-2 u-line-wrap">
            <div
              style={{ "--number": 80 } as React.CSSProperties}
              className="home-hero-line is-top"
            />
          </div>

          {/* Tagline */}
          <div className="hero-tagline">
            <p
              className="u-max-w-ch-20 font-secondary text-text-lg uppercase font-regular leading-snug text-[var(--theme-text)]"
            >
              {tagline}
            </p>
          </div>

          {/* Title */}
          <div className="hero-title flex flex-col justify-end">
            <h1
              className="hero-title__h1 text-display font-primary font-bold leading-none tracking-display text-[var(--theme-text)]"
            >
              {headingFirstWord}
              {headingRemainder ? (
                <>
                  <br />
                  {headingRemainder}
                </>
              ) : null}
            </h1>
          </div>

          {/* Line 3 — static, bottom-aligned */}
          <div aria-hidden="true" className="line-wrap-3 u-line-wrap">
            <div
              style={{ "--number": 65 } as React.CSSProperties}
              className="home-hero-line is-bottom"
            />
          </div>

          {/* Line 4 — grows upward from bottom */}
          <div aria-hidden="true" className="line-wrap-4 u-line-wrap">
            <div
              style={{ "--number": 80 } as React.CSSProperties}
              className="home-hero-line is-bottom"
            />
          </div>

          {/* Line 5 — grows upward from bottom */}
          <div aria-hidden="true" className="line-wrap-5 u-line-wrap">
            <div
              style={{ "--number": 80 } as React.CSSProperties}
              className="home-hero-line is-bottom"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
