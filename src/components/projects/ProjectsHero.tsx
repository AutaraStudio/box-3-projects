/**
 * ProjectsHero
 * ============
 * Editorial archive hero. Small caps label + display heading at
 * the top, then a sticky scroll-driven clip-path image wipe: the
 * overlay image (typically a sketch) starts fully visible covering
 * the base image, and as the wrapper scrubs through the viewport
 * the overlay's clip-path eats it away bottom→top, revealing the
 * base image (the photograph). The mask scales 1 → 1.1 across the
 * scrub, then drifts upward (yPercent 0 → 50) once the wrapper
 * exits for a parallax tail.
 *
 * Mobile: not sticky. Wrapper collapses to a 16:9 inline frame
 * and the same clip-path wipe scrubs from section top → centre.
 *
 * Animation initialisation defers until `awaitTransitionEnd()`
 * resolves so ScrollTriggers built behind the wipe panel measure
 * against the right `<main>` offset.
 *
 * Ported from master's `ApproachHeader` and converted to v2
 * conventions (theme tokens + spacing scale + typography utilities).
 */

"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import SplitText from "@/components/split-text/SplitText";
import { awaitTransitionEnd } from "@/components/transition/transitionState";

import "./ProjectsHero.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface HeroImage {
  src: string;
  alt?: string;
}

interface ProjectsHeroProps {
  /** Total project count — rendered as a "(NNN)" superscript pin. */
  count: number;
  /** Editorial section label above the heading. */
  label?: string;
  /** Display heading. */
  heading?: string;
  /** Base image — revealed beneath the overlay as it wipes away. */
  baseImage?: HeroImage;
  /** Overlay image — sits on top, wipes bottom-up on scroll. */
  overlayImage?: HeroImage;
}

export default function ProjectsHero({
  count,
  label = "Selected projects",
  heading = "Designed, built, delivered.",
  baseImage,
  overlayImage,
}: ProjectsHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLImageElement | HTMLDivElement | null>(null);

  /* ── Clip-path wipe + scale + parallax ─────────────────────── */
  useEffect(() => {
    const section = sectionRef.current;
    const wrapper = wrapperRef.current;
    const mask = maskRef.current;
    const overlay = overlayRef.current;
    if (!section || !wrapper || !mask || !overlay) return;

    let cancelled = false;
    let ctx: gsap.Context | null = null;

    awaitTransitionEnd().then(() => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        const isMobile = window.innerWidth <= 640;

        const reduceMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        if (reduceMotion) {
          /* Reduced motion — show the base image immediately, no
             scroll scrub. */
          gsap.set(overlay, { clipPath: "inset(0 0 100% 0)" });
          return;
        }

        /* 1. Clip-path wipe + mask scale, scrubbed across the
              wrapper's transit (or the whole section on mobile
              where the wrapper is short). */
        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: isMobile ? section : wrapper,
              scrub: true,
              start: "top top",
              end: isMobile ? "bottom center" : "bottom bottom",
              invalidateOnRefresh: true,
            },
          })
          .fromTo(
            overlay,
            { clipPath: "inset(0 0 0% 0)" },
            { clipPath: "inset(0 0 100% 0)" },
          )
          .fromTo(mask, { scale: 1 }, { scale: 1.1 }, 0);

        /* 2. Desktop only — once the wrapper has exited, the mask
              continues to drift upward as a parallax tail. */
        if (!isMobile) {
          gsap.fromTo(
            mask,
            { yPercent: 0 },
            {
              yPercent: 50,
              ease: "none",
              scrollTrigger: {
                trigger: section,
                scrub: true,
                start: "bottom bottom",
                end: "bottom top",
                invalidateOnRefresh: true,
              },
            },
          );
        }
      }, section);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [baseImage?.src, overlayImage?.src]);

  const padded = `(${String(count).padStart(3, "0")})`;

  return (
    <section
      ref={sectionRef}
      className="projects-hero"
      data-theme="cream"
      aria-label={label}
    >
      <div className="container projects-hero__head">
        <p className="projects-hero__label text-small text-caps">
          {label} <span className="projects-hero__count">{padded}</span>
        </p>
        <h1 className="projects-hero__heading text-h1">
          <SplitText asWords revealOnScroll>
            {heading}
          </SplitText>
        </h1>
      </div>

      <div ref={wrapperRef} className="projects-hero__wrapper">
        <div className="projects-hero__assets">
          <div ref={maskRef} className="projects-hero__mask">
            {/* Base image — revealed beneath the overlay. */}
            {baseImage?.src ? (
              <Image
                src={baseImage.src}
                alt={baseImage.alt ?? ""}
                fill
                priority
                sizes="100vw"
                className="projects-hero__image"
              />
            ) : (
              <div className="projects-hero__placeholder projects-hero__placeholder--base" />
            )}

            {/* Overlay image — sits on top, wipes away on scroll. */}
            {overlayImage?.src ? (
              <img
                ref={overlayRef as React.RefObject<HTMLImageElement>}
                src={overlayImage.src}
                alt={overlayImage.alt ?? ""}
                className="projects-hero__image projects-hero__image--overlay"
                style={{ clipPath: "inset(0 0 0% 0)" }}
              />
            ) : (
              <div
                ref={overlayRef as React.RefObject<HTMLDivElement>}
                className="projects-hero__placeholder projects-hero__placeholder--overlay"
                aria-hidden="true"
                style={{ clipPath: "inset(0 0 0% 0)" }}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
