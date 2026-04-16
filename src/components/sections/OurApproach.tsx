/**
 * OurApproach
 * ===========
 * Horizontally-scrolling "Our Process" section. The outer wrapper
 * is 700svh tall — that vertical scroll distance drives the inner
 * track's horizontal translate via a sticky 100svh container.
 *
 * Track composition (in order):
 *   1. Intro panel
 *   2. Lead image (step 1) → Slide 1
 *   3. Lead image (step 2) → Slide 2
 *   4. Lead image (step 3) → Slide 3
 *   5. Completion panel
 *
 * Animations (all via the section's `useGSAP` context — kill on unmount):
 *   - Main scrub: `x: -overflow` on the track
 *   - Progress bar: `scaleX 0 → 1` on the same scrub
 *   - Lead images: `xPercent -25 → 25` at scale 1.1, scrubbed via
 *     `containerAnimation` so they parallax inside the horizontal flow
 *   - Slide first images: `xPercent 20 → 0`, same containerAnimation
 *   - Completion strip: stagger fade-in via containerAnimation
 *
 * All colours / spacing / typography flow from the theme token
 * system. Custom CSS is limited to layout and the section's
 * unusual rem-based panel widths (the horizontal track NEEDS fixed
 * widths to drive the scroll distance — tokens don't apply here).
 *
 * Theme: dark (charcoal background, pink text). Add this to a page
 * with `data-theme="dark"` already on a parent and it'll inherit.
 */

"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useGSAP } from "@/hooks/useGSAP";
import { ease } from "@/config/animations.config";
import { urlFor } from "@/sanity/lib/image";
import type {
  OurApproachData,
  OurApproachImage,
} from "@/sanity/queries/ourApproachSection";

import "./OurApproach.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ------------------------------------------------------------------
   Helpers
   ------------------------------------------------------------------ */

function imgSrc(image: OurApproachImage | undefined, width: number) {
  if (!image?.asset?.url) return null;
  return urlFor(image).width(width).url();
}

/* ------------------------------------------------------------------
   Component
   ------------------------------------------------------------------ */

export default function OurApproach({
  sectionLabel,
  intro,
  steps,
  completion,
}: OurApproachData) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  /* Refs for parallax targets. We collect them by index rather than
     keying on Sanity _key so the ref callback stays cheap. */
  const leadImageRefs = useRef<Array<HTMLDivElement | null>>([]);
  const slideFirstImageRefs = useRef<Array<HTMLDivElement | null>>([]);
  const completionStripRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const track = trackRef.current;
      const progress = progressRef.current;
      if (!section || !track || !progress) return;

      function build() {
        const overflow = track!.scrollWidth - window.innerWidth;
        if (overflow <= 0) return;

        /* ── Main horizontal drive ─────────────────────────────── */
        const mainTween = gsap.to(track, {
          x: -overflow,
          ease: ease.parallax,
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
          },
        });

        /* ── Progress bar ──────────────────────────────────────── */
        gsap.to(progress, {
          scaleX: 1,
          ease: ease.parallax,
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
          },
        });

        /* ── Lead-image parallax (xPercent -25 → 25, scale 1.1) ── */
        leadImageRefs.current.forEach((el) => {
          if (!el) return;
          const trigger = el.parentElement;
          if (!trigger) return;
          gsap
            .timeline({
              scrollTrigger: {
                trigger,
                start: "left right",
                end: "right left",
                containerAnimation: mainTween,
                scrub: true,
              },
            })
            .fromTo(
              el,
              { scale: 1.1, xPercent: -25 },
              { xPercent: 25, ease: ease.parallax },
            );
        });

        /* ── Slide first-image parallax (xPercent 20 → 0) ──────── */
        slideFirstImageRefs.current.forEach((img) => {
          if (!img) return;
          const trigger = img.closest("[data-approach-slide]");
          if (!trigger) return;
          gsap
            .timeline({
              scrollTrigger: {
                trigger,
                start: "left right",
                end: "right left",
                containerAnimation: mainTween,
                scrub: true,
              },
            })
            .fromTo(
              img,
              { xPercent: 20 },
              { xPercent: 0, ease: ease.parallax },
            );
        });

        /* ── Completion strip — stagger fade-in ─────────────────── */
        const strip = completionStripRef.current;
        if (strip && strip.children.length > 0) {
          gsap
            .timeline({
              scrollTrigger: {
                trigger: strip,
                start: "left center",
                end: "right right",
                containerAnimation: mainTween,
              },
            })
            .fromTo(
              strip.children,
              { autoAlpha: 0 },
              {
                autoAlpha: 1,
                stagger: 0.1,
                duration: 2,
                ease: ease.parallax,
              },
            );
        }
      }

      build();

      /* Re-init on resize — kill ScrollTriggers, reset track,
         rebuild from current viewport metrics. */
      let resizeTimer: ReturnType<typeof setTimeout> | null = null;
      function onResize() {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          ScrollTrigger.getAll().forEach((st) => st.kill());
          gsap.set(track, { x: 0 });
          build();
          ScrollTrigger.refresh();
        }, 250);
      }
      window.addEventListener("resize", onResize, { passive: true });

      return () => {
        if (resizeTimer) clearTimeout(resizeTimer);
        window.removeEventListener("resize", onResize);
      };
    },
    { scope: sectionRef, dependencies: [] },
  );

  return (
    <section
      ref={sectionRef}
      className="our-approach"
      data-theme="cream"
      data-nav-theme="cream"
      aria-label={sectionLabel}
    >
      <div className="our-approach__container">
        {/* Section label — sticky top-left. <p> rather than a heading
            so the actual h2/h3 hierarchy below stays semantically
            correct. */}
        <p className="our-approach__label font-secondary text-text-xs tracking-caps uppercase">
          {sectionLabel}
        </p>

        {/* Progress bar — sticky top */}
        <div
          className="our-approach__progress"
          aria-hidden="true"
        >
          <div
            ref={progressRef}
            className="our-approach__progress-bar"
          />
        </div>

        {/* Horizontal scroll track */}
        <div ref={trackRef} className="our-approach__track">
          {/* Intro panel */}
          <div className="our-approach__intro">
            <div className="our-approach__intro-inner">
              <h2 className="our-approach__intro-heading font-primary text-h2 leading-tight tracking-tight">
                {intro.heading}
              </h2>
              <p className="our-approach__intro-text font-secondary text-text-lg leading-snug">
                {intro.text}
              </p>
            </div>
          </div>

          {/* Steps — each is a [lead image] + [slide] pair */}
          {steps.map((step, index) => {
            const leadUrl = imgSrc(step.leadImage, 1920);
            const slideImageOne = step.slideImages?.[0];
            const slideImageTwo = step.slideImages?.[1];
            const slideOneUrl = imgSrc(slideImageOne, 1024);
            const slideTwoUrl = imgSrc(slideImageTwo, 1024);

            return (
              <div
                key={step._key}
                className="our-approach__step"
                data-approach-step={index + 1}
              >
                {/* Lead image — full-bleed, parallax */}
                <div
                  className="our-approach__asset"
                  data-approach-asset
                >
                  <div
                    ref={(el) => {
                      leadImageRefs.current[index] = el;
                    }}
                    className="our-approach__asset-inner"
                  >
                    {leadUrl ? (
                      <Image
                        src={leadUrl}
                        alt={step.leadImage?.alt ?? step.title}
                        fill
                        sizes="100vw"
                        className="our-approach__asset-image"
                      />
                    ) : (
                      <div
                        className="our-approach__asset-placeholder"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                </div>

                {/* Slide — text + 2 images */}
                <div
                  data-approach-slide
                  className={`our-approach__slide our-approach__slide--layout-${step.layout ?? "right"}`}
                >
                  <div className="our-approach__slide-inner">
                    <div className="our-approach__slide-text">
                      <p className="our-approach__slide-title font-secondary text-text-xs tracking-caps uppercase">
                        {step.title}
                      </p>
                      <h3 className="our-approach__slide-heading font-primary text-h3 leading-tight tracking-tight">
                        {step.heading}
                      </h3>
                      <p className="our-approach__slide-body font-secondary text-text-md leading-snug">
                        {step.text}
                      </p>
                    </div>
                    <div className="our-approach__slide-media">
                      <div
                        ref={(el) => {
                          slideFirstImageRefs.current[index] = el;
                        }}
                        className="our-approach__slide-image our-approach__slide-image--primary"
                      >
                        {slideOneUrl ? (
                          <img
                            src={slideOneUrl}
                            alt={slideImageOne?.alt ?? ""}
                            className="our-approach__slide-image-el"
                          />
                        ) : (
                          <div
                            className="our-approach__slide-image-el our-approach__slide-image--placeholder"
                            aria-hidden="true"
                          />
                        )}
                          </div>
                      <div className="our-approach__slide-image our-approach__slide-image--secondary">
                        {slideTwoUrl ? (
                          <img
                            src={slideTwoUrl}
                            alt={slideImageTwo?.alt ?? ""}
                            className="our-approach__slide-image-el"
                          />
                        ) : (
                          <div
                            className="our-approach__slide-image-el our-approach__slide-image--placeholder"
                            aria-hidden="true"
                          />
                        )}
                          </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Completion panel */}
          <div className="our-approach__completion">
            <div className="our-approach__completion-inner">
              <p className="our-approach__completion-title font-secondary text-text-xs tracking-caps uppercase">
                {completion.title}
              </p>
              <h3 className="our-approach__completion-heading font-primary text-h3 leading-tight tracking-tight">
                {completion.heading}
              </h3>
              <div
                ref={completionStripRef}
                className="our-approach__completion-strip"
              >
                {(completion.images ?? []).map((image) => {
                  const url = imgSrc(image, 768);
                  return (
                    <div
                      key={image._key}
                      className="our-approach__completion-image"
                    >
                      {url ? (
                        <img
                          src={url}
                          alt={image.alt ?? ""}
                          className="our-approach__completion-image-el"
                        />
                      ) : (
                        <div
                          className="our-approach__completion-image-el our-approach__slide-image--placeholder"
                          aria-hidden="true"
                        />
                      )}
                      </div>
                  );
                })}
              </div>
              <p className="our-approach__completion-body font-secondary text-text-md leading-snug">
                {completion.text}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
