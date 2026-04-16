/**
 * ApproachHeader
 * ==============
 * Editorial section with a large heading and a sticky scroll-driven
 * image wipe. Reusable — content is Sanity-driven via the
 * `approachHeaderSection` singleton.
 *
 * Scroll effects (desktop):
 *   1. Heading reveals via the shared line-split util.
 *   2. Wrapper is 200svh — the assets frame sticks at the top.
 *   3. GSAP scrubs the overlay image's `clip-path` from
 *      `inset(0 0 0% 0)` → `inset(0 0 100% 0)` (wipes bottom→top),
 *      while simultaneously scaling the mask 1→1.1.
 *   4. After the wrapper exits, a parallax drift moves the mask
 *      upward (yPercent 0→50).
 *
 * Mobile: no sticky, images sit inline in a 16:9 aspect frame,
 * clip-path wipe scrubs from section top → section centre.
 */

"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { urlFor } from "@/sanity/lib/image";
import type { ApproachHeaderImage } from "@/sanity/queries/approachHeaderSection";

import "./ApproachHeader.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ApproachHeaderProps {
  label?: string;
  heading: string;
  image1?: ApproachHeaderImage;
  image2?: ApproachHeaderImage;
}

export default function ApproachHeader({
  label = "Our approach",
  heading,
  image1,
  image2,
}: ApproachHeaderProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLImageElement>(null);

  const img1Url = image1?.asset?.url
    ? urlFor(image1).width(1440).url()
    : null;
  const img2Url = image2?.asset?.url
    ? urlFor(image2).width(1440).url()
    : null;

  /* ── Clip-path wipe + scale + parallax ───────────────────── */
  useEffect(() => {
    const section = sectionRef.current;
    const wrapper = wrapperRef.current;
    const mask = maskRef.current;
    const overlay = overlayRef.current;
    if (!section || !wrapper || !mask || !overlay) return;

    const isMobile = window.innerWidth <= 640;
    const tweens: (gsap.core.Tween | gsap.core.Timeline)[] = [];

    /* 1. Clip-path wipe + scale */
    const wipeTl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: isMobile ? section : wrapper,
        scrub: true,
        start: "top top",
        end: isMobile ? "bottom center" : "bottom bottom",
      },
    });
    wipeTl
      .fromTo(
        overlay,
        { clipPath: "inset(0 0 0% 0)" },
        { clipPath: "inset(0 0 100% 0)" },
      )
      .fromTo(mask, { scale: 1 }, { scale: 1.1 }, 0);
    tweens.push(wipeTl);

    /* 2. Parallax drift (desktop only) */
    if (!isMobile) {
      const parTl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          scrub: true,
          start: "bottom bottom",
          end: "bottom top",
        },
      });
      parTl.fromTo(mask, { yPercent: 0 }, { yPercent: 50 }, 0);
      tweens.push(parTl);
    }

    return () => {
      for (const t of tweens) {
        if ("scrollTrigger" in t && t.scrollTrigger) t.scrollTrigger.kill();
        t.kill();
      }
    };
  }, [img1Url, img2Url]);

  return (
    <section
      ref={sectionRef}
      className="approach-header"
      data-theme="cream"
      data-nav-theme="cream"
      aria-label={label}
    >
      <div className="approach-header__container">
        {label ? (
          <p className="approach-header__label">{label}</p>
        ) : null}

        <p className="approach-header__heading">
          {heading}
        </p>

        <div ref={wrapperRef} className="approach-header__wrapper">
          <div className="approach-header__assets">
            <div ref={maskRef} className="approach-header__mask">
              {/* Base image (revealed after wipe) */}
              {img1Url ? (
                <Image
                  src={img1Url}
                  alt={image1?.alt ?? ""}
                  fill
                  sizes="100vw"
                  className="approach-header__image"
                />
              ) : (
                <div className="approach-header__placeholder" aria-hidden="true" />
              )}

              {/* Overlay image (wiped away on scroll) */}
              {img2Url ? (
                <img
                  ref={overlayRef}
                  src={img2Url}
                  alt={image2?.alt ?? ""}
                  className="approach-header__image approach-header__image--overlay"
                  style={{ clipPath: "inset(0 0 0% 0)" }}
                />
              ) : (
                <div
                  ref={overlayRef as React.RefObject<HTMLDivElement>}
                  className="approach-header__placeholder approach-header__image--overlay"
                  aria-hidden="true"
                  style={{ clipPath: "inset(0 0 0% 0)" }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
