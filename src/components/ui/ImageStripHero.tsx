/**
 * ImageStripHero
 * ==============
 * Reusable scroll-driven hero — port of the Populous Zf
 * (CareersHero) class to v2 conventions.
 *
 *   ┌───────────────────────────────────────────────────────┐
 *   │                                                       │
 *   │            HERO TITLE  (centred, large)               │
 *   │            [ CTA button ]                             │
 *   │                                                       │
 *   ├───────────────────────────────────────────────────────┤
 *   │  ┌─────────┐    ┌────────────────┐    ┌─────────┐    │
 *   │  │  left   │    │     centre     │    │  right  │    │
 *   │  │  ~33%   │    │     ~50% →     │    │  ~33%   │    │
 *   │  └─────────┘    └────────────────┘    └─────────┘    │
 *   └───────────────────────────────────────────────────────┘
 *
 * As the user scrolls, the centre image's width lerps from its
 * "ref" width (50% of the container) up to the full viewport
 * width. The title block fades to invisible across the same
 * range.
 *
 * Used by /careers and /sustainability — both pages share the
 * same hero language, just with different titles + image sets.
 */

"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

import Heading from "@/components/ui/Heading";
import Button from "@/components/ui/Button";
import { urlFor } from "@/sanity/lib/image";

import "./ImageStripHero.css";

/* Same shape as the page-level hero image fields — kept here so
   any consumer with a `{ asset, alt }` blob (Sanity image type)
   can pass it in directly. */
export interface ImageStripHeroImage {
  asset?: {
    _id: string;
    url: string;
    metadata?: {
      dimensions: {
        width: number;
        height: number;
        aspectRatio: number;
      };
    };
  };
  alt?: string;
}

interface ImageStripHeroProps {
  title: string;
  ctaLabel?: string;
  ctaHref?: string;
  imageLeft?: ImageStripHeroImage;
  imageCentre?: ImageStripHeroImage;
  imageRight?: ImageStripHeroImage;
}

export default function ImageStripHero({
  title,
  ctaLabel,
  ctaHref = "#",
  imageLeft,
  imageCentre,
  imageRight,
}: ImageStripHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const refRef = useRef<HTMLDivElement>(null);
  const titleBlockRef = useRef<HTMLDivElement>(null);

  /* Mark touch devices so CSS can hide the side images +
     simplify the centre layout (one full-width image). */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(any-pointer: coarse)").matches) {
      document.documentElement.classList.add("is-touch-device");
    }
  }, []);

  /* Scroll-driven progress — writes --item-width to the
     section and fades the title block out. */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const progressEl = progressRef.current;
    const areaEl = areaRef.current;
    const refEl = refRef.current;
    const titleEl = titleBlockRef.current;
    if (!progressEl || !areaEl || !refEl) return;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const clamp = (v: number, lo: number, hi: number) =>
      Math.min(hi, Math.max(lo, v));

    let refWidth = refEl.offsetWidth;
    let winWidth = window.innerWidth;
    let ticking = false;

    const measure = () => {
      refWidth = refEl.offsetWidth;
      winWidth = window.innerWidth;
    };

    const update = () => {
      ticking = false;
      const rect = areaEl.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height + vh;
      const seen = vh - rect.top;
      const progress = clamp(seen / total, 0, 1);

      const w = lerp(refWidth, winWidth, progress);
      progressEl.style.setProperty("--item-width", `${Math.round(w)}px`);

      if (titleEl) {
        titleEl.style.opacity = String(1 - progress);
        titleEl.style.visibility = progress >= 1 ? "hidden" : "visible";
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    const onResize = () => {
      requestAnimationFrame(() => {
        measure();
        update();
      });
    };

    requestAnimationFrame(measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <section ref={sectionRef} className="image-strip-hero">
      {/* Title + CTA — sits centred above the image strip. */}
      <div ref={titleBlockRef} className="image-strip-hero__inner">
        <div className="image-strip-hero__content">
          <Heading
            as="h1"
            className="image-strip-hero__title text-display"
            asWords={false}
          >
            {title}
          </Heading>
          {ctaLabel ? (
            <Button href={ctaHref} size="md">
              {ctaLabel}
            </Button>
          ) : null}
        </div>
      </div>

      {/* Image strip + scroll-progress trigger area. */}
      <div ref={progressRef} className="image-strip-hero__progress">
        <div
          ref={areaRef}
          className="image-strip-hero__progress-area"
          aria-hidden="true"
        />
        <div
          ref={refRef}
          className="image-strip-hero__progress-ref"
          aria-hidden="true"
        />
        <div className="image-strip-hero__progress-inner">
          <ul className="image-strip-hero__listing">
            <HeroItem image={imageLeft} />
            <HeroItem image={imageCentre} fluid />
            <HeroItem image={imageRight} />
          </ul>
        </div>
      </div>
    </section>
  );
}

function HeroItem({
  image,
  fluid = false,
}: {
  image?: ImageStripHeroImage;
  fluid?: boolean;
}) {
  const src = image?.asset
    ? urlFor(image as { asset: { _id: string } }).width(1920).url()
    : null;
  const alt = image?.alt ?? "";
  return (
    <li>
      <div
        className={`image-strip-hero__item${fluid ? " image-strip-hero__item--fluid" : ""}`}
      >
        <div className="image-strip-hero__image">
          {src ? (
            <Image
              src={src}
              alt={alt}
              fill
              sizes="(max-width: 64rem) 100vw, 50vw"
              className="image-strip-hero__image-el"
              priority={fluid}
            />
          ) : (
            <div
              className="image-strip-hero__image-placeholder"
              aria-hidden="true"
            />
          )}
        </div>
      </div>
    </li>
  );
}
