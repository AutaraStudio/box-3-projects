/**
 * ImageStripHero
 * ==============
 * Hybrid editorial hero used on /about, /services, /sustainability
 * and /careers.
 *
 *   Desktop (>= 64rem): the original 3-image strip, scroll-driven.
 *     A title + CTA sits centred over a 3-image row. As the user
 *     scrolls past the 200vh trigger area, the centre image's width
 *     lerps from 50% of the container up to the viewport width and
 *     the title block fades out.
 *
 *   Mobile (< 64rem): a single portrait image beneath the title +
 *     CTA, wrapped in the standard RevealImage so it plays the same
 *     mask reveal as the rest of the site. No scrub.
 *
 * Both layouts render in the DOM; CSS hides whichever doesn't apply
 * at the current breakpoint, and the scroll-progress JS bails when
 * its target elements are not visible (offsetParent === null).
 */

"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

import Heading from "@/components/ui/Heading";
import Button from "@/components/ui/Button";
import RevealImage from "@/components/ui/RevealImage";
import { urlFor } from "@/sanity/lib/image";

import "./ImageStripHero.css";

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
  /* ── Desktop strip refs ─────────────────────────────────────── */
  const progressRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const refRef = useRef<HTMLDivElement>(null);
  const titleBlockRef = useRef<HTMLDivElement>(null);

  /* Scroll-driven progress for the desktop strip. The effect bails
     when the strip isn't visible (offsetParent === null) so the
     mobile layout doesn't pay any cost. */
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

    const stripActive = () => progressEl.offsetParent !== null;

    const measure = () => {
      refWidth = refEl.offsetWidth;
      winWidth = window.innerWidth;
    };

    const update = () => {
      ticking = false;
      if (!stripActive()) {
        if (titleEl) {
          titleEl.style.opacity = "";
          titleEl.style.visibility = "";
        }
        return;
      }
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

  /* ── Mobile portrait image ───────────────────────────────────── */
  const portraitImage = imageCentre ?? imageLeft ?? imageRight;
  const portraitSrc = portraitImage?.asset
    ? urlFor(portraitImage as { asset: { _id: string } })
        .width(1600)
        .url()
    : null;

  return (
    <section className="image-strip-hero">
      {/* Title + CTA — same block on both layouts. The desktop
          fade-out is scoped via the .image-strip-hero__inner class
          on the same element the JS targets. */}
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

      {/* ── Desktop: 3-image strip with scroll-driven scrub ────── */}
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

      {/* ── Mobile: single portrait image with mask reveal ─────── */}
      <div className="image-strip-hero__media">
        <RevealImage className="image-strip-hero__reveal">
          {portraitSrc ? (
            <Image
              src={portraitSrc}
              alt={portraitImage?.alt ?? ""}
              fill
              priority
              sizes="100vw"
              className="image-strip-hero__image-el"
            />
          ) : (
            <div
              className="image-strip-hero__image-placeholder"
              aria-hidden="true"
            />
          )}
        </RevealImage>
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
    ? urlFor(image as { asset: { _id: string } })
        .width(1920)
        .url()
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
