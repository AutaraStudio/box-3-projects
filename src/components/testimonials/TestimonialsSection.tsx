"use client";

/**
 * TestimonialsSection
 * ===================
 * Editorial testimonials block. Section label + reference code
 * across the top, then a two-column grid: quote + counter +
 * author/role on the left; partner logo + prev/next controls on
 * the right (sidebar).
 *
 * Quote reveal: each quote is a separate block stacked absolutely
 * on top of each other; only the active one is visible (opacity 1).
 * The active quote uses `<SplitText asWords>` so its words animate
 * up out of overflow:hidden masks on a per-quote crossfade.
 *
 * Prev/next: each button has a circular bg that scales 0 → 1 on
 * hover and a duplicate arrow that slides in from the matching
 * edge — direction flips for prev vs. next, axis flips at the
 * desktop breakpoint (vertical desktop, horizontal mobile).
 *
 * SVG partner logos are inlined as sanitised markup server-side
 * (see fetchTestimonials) so they inherit `currentColor` from the
 * active theme.
 */

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

import SplitText from "@/components/split-text/SplitText";
import type { ResolvedTestimonial } from "@/sanity/queries/testimonialsSection";

import "./TestimonialsSection.css";

interface TestimonialsSectionProps {
  /** Small label shown top-left e.g. "Testimonials". */
  sectionLabel?: string;
  /** Small monospace code shown top-right e.g. "[BOX3.1]". */
  reference?: string;
  /** Resolved testimonials — at least one required. */
  testimonials: ResolvedTestimonial[];
  /** Theme applied to the section. Defaults to "pink". */
  theme?: string;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function ArrowIcon() {
  return (
    <svg
      className="testimonials-btn__arrow"
      viewBox="0 0 20 9"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M1 4.5H19M19 4.5L15 1M19 4.5L15 8"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}

/* Wires the prev/next button hover — bg scales 0→1, a duplicate
   arrow slides in from the edge that matches the prev/next side. */
function wireArrowHover(btn: HTMLButtonElement): () => void {
  const bg = btn.querySelector<HTMLElement>(".testimonials-btn__bg");
  const arrowHover = btn.querySelector<HTMLElement>(
    ".testimonials-btn__arrow-hover",
  );
  if (!bg || !arrowHover) return () => {};

  const isPrev = btn.classList.contains("is-prev");
  const isLg = () => window.innerWidth >= 1024;

  const initOffset = () =>
    isLg()
      ? { yPercent: isPrev ? 100 : -100, xPercent: 0 }
      : { xPercent: isPrev ? 100 : -100, yPercent: 0 };
  const leaveOffset = () =>
    isLg()
      ? { yPercent: isPrev ? -100 : 100 }
      : { xPercent: isPrev ? -100 : 100 };
  const origins = () => {
    const lg = isLg();
    return {
      enter: lg
        ? isPrev
          ? "bottom center"
          : "top center"
        : isPrev
          ? "right center"
          : "left center",
      leave: lg
        ? isPrev
          ? "top center"
          : "bottom center"
        : isPrev
          ? "left center"
          : "right center",
    };
  };

  gsap.set(bg, { scale: 0 });
  gsap.set(arrowHover, initOffset());

  let enterTl: gsap.core.Timeline | null = null;
  let leaveTl: gsap.core.Timeline | null = null;

  const onEnter = () => {
    leaveTl?.kill();
    const o = origins();
    gsap.set([bg, arrowHover], { transformOrigin: o.enter });
    gsap.set(arrowHover, initOffset());
    enterTl = gsap
      .timeline({ defaults: { ease: "expo.out", duration: 0.45 } })
      .to(bg, { scale: 1 })
      .to(arrowHover, { xPercent: 0, yPercent: 0 }, 0.05);
  };
  const onLeave = () => {
    enterTl?.kill();
    const o = origins();
    gsap.set([bg, arrowHover], { transformOrigin: o.leave });
    leaveTl = gsap
      .timeline({ defaults: { ease: "expo.out", duration: 0.45 } })
      .to(bg, { scale: 0 })
      .to(arrowHover, leaveOffset(), 0);
  };

  btn.addEventListener("mouseenter", onEnter);
  btn.addEventListener("mouseleave", onLeave);
  return () => {
    btn.removeEventListener("mouseenter", onEnter);
    btn.removeEventListener("mouseleave", onLeave);
  };
}

export default function TestimonialsSection({
  sectionLabel = "Testimonials",
  reference,
  testimonials,
  theme = "pink",
}: TestimonialsSectionProps) {
  const prevBtnRef = useRef<HTMLButtonElement>(null);
  const nextBtnRef = useRef<HTMLButtonElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const total = testimonials.length;
  const hasMultiple = total > 1;
  const current = testimonials[currentIndex];

  const goPrev = () =>
    setCurrentIndex((i) => (i - 1 + total) % total);
  const goNext = () => setCurrentIndex((i) => (i + 1) % total);

  /* Wire arrow hover on mount. */
  useEffect(() => {
    const cleanups: Array<() => void> = [];
    if (prevBtnRef.current) cleanups.push(wireArrowHover(prevBtnRef.current));
    if (nextBtnRef.current) cleanups.push(wireArrowHover(nextBtnRef.current));
    return () => cleanups.forEach((c) => c());
  }, [hasMultiple]);

  if (testimonials.length === 0) return null;

  return (
    <section
      className="testimonials-section"
      data-theme={theme}
      aria-label={sectionLabel}
    >
      <div className="container">
        <div className="testimonials-label-row">
          <h2 className="testimonials-label text-h4">{sectionLabel}</h2>
          {reference ? (
            <p
              className="testimonials-reference text-small text-caps"
              aria-hidden="true"
            >
              {reference}
            </p>
          ) : null}
        </div>
      </div>

      <hr className="testimonials-section__divider" aria-hidden="true" />

      <div className="container">
        <div className="testimonials-grid">
          {/* Quote block */}
          <div className="testimonials-quote-block">
            <div className="testimonials-stack">
              {testimonials.map((t, i) => (
                <blockquote
                  key={t._id}
                  className={`testimonials-quote${
                    i === currentIndex ? " is-active" : ""
                  }`}
                  aria-label={t.quote}
                  aria-hidden={i !== currentIndex}
                >
                  {/* SplitText with revealOnScroll on the first
                      paint; subsequent crossfades use the fade we
                      apply via .is-active. Each quote keeps its own
                      SplitText instance, keyed by id, so on quote
                      change React unmounts the old and mounts the
                      new. */}
                  <SplitText asWords revealOnScroll>
                    {t.quote}
                  </SplitText>
                </blockquote>
              ))}
            </div>

            {hasMultiple ? (
              <div className="testimonials-counter" aria-hidden="true">
                <span className="testimonials-counter__current">
                  {pad2(currentIndex + 1)}
                </span>
                <span>&nbsp;/&nbsp;</span>
                <span>{pad2(total)}</span>
              </div>
            ) : null}

            <div className="testimonials-info-stack">
              {testimonials.map((t, i) => (
                <div
                  key={t._id}
                  className={`testimonials-info${
                    i === currentIndex ? " is-active" : ""
                  }`}
                  aria-hidden={i !== currentIndex}
                >
                  <p className="testimonials-info__author text-main">
                    {t.author}
                    {t.title ? `, ${t.title}` : ""}
                  </p>
                  {t.partner ? (
                    <p className="testimonials-info__partner text-small text-caps">
                      {t.partner.name}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar — logo + controls. */}
          <div className="testimonials-sidebar">
            <div className="testimonials-logo-wrap">
              {current?.partner?.svgContent ? (
                <span
                  key={current._id}
                  className="testimonials-logo"
                  aria-label={current.partner.name}
                  role="img"
                  /* svgContent is sanitised server-side. */
                  dangerouslySetInnerHTML={{
                    __html: current.partner.svgContent,
                  }}
                />
              ) : null}
            </div>

            {hasMultiple ? (
              <div className="testimonials-controls">
                <button
                  ref={prevBtnRef}
                  className="testimonials-btn is-prev"
                  type="button"
                  aria-label="Previous testimonial"
                  onClick={goPrev}
                >
                  <ArrowIcon />
                  <span className="testimonials-btn__bg" aria-hidden="true" />
                  <span
                    className="testimonials-btn__arrow-hover"
                    aria-hidden="true"
                  >
                    <ArrowIcon />
                  </span>
                </button>
                <button
                  ref={nextBtnRef}
                  className="testimonials-btn"
                  type="button"
                  aria-label="Next testimonial"
                  onClick={goNext}
                >
                  <ArrowIcon />
                  <span className="testimonials-btn__bg" aria-hidden="true" />
                  <span
                    className="testimonials-btn__arrow-hover"
                    aria-hidden="true"
                  >
                    <ArrowIcon />
                  </span>
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <hr className="testimonials-section__divider" aria-hidden="true" />
    </section>
  );
}
