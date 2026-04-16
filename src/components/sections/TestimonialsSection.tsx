/**
 * TestimonialsSection
 * ===================
 * Reusable client component. Consumes a list of resolved testimonials
 * (each with a partner name + inlined SVG logo) and renders a sliding
 * stack with prev/next controls.
 *
 * Animation model (ported from reference/ref.html):
 *   - Each quote's text is chunked into ~7-word lines, wrapped in a
 *     `.line-mask` / `.line-split` pair.
 *   - Each quote has its own paused GSAP timeline that fromTos the
 *     `.line-split` children from yPercent: 100 → 0 with opacity,
 *     stagger 0.05, duration 0.3.
 *   - On ScrollTrigger enter, quote[0]'s timeline plays, counter +
 *     info + sidebar fade in.
 *   - On nav: reverse the current timeline, then play the next.
 *     Counter, author info, and logo crossfade separately.
 *   - Arrow buttons have a scale-bg + slide-arrow hover tween with
 *     transform origins that flip based on prev/next and breakpoint.
 *
 * GSAP runs in the browser only — the partner logo SVGs are resolved
 * server-side and passed down as sanitised markup strings.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { duration as animDuration, ease } from "@/config/animations.config";
import {
  splitByRenderedLines,
  toWordTokens,
} from "@/lib/splitLines";
import type { ResolvedTestimonial } from "@/sanity/queries/testimonialsSection";

import "./TestimonialsSection.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* --------------------------------------------------------------------------
   Types
   -------------------------------------------------------------------------- */

interface TestimonialsSectionProps {
  /** Small label shown top-left e.g. "Testimonials". */
  sectionLabel?: string;
  /** Small monospace code shown top-right e.g. "[BOX3.1]". */
  reference?: string;
  /** Resolved testimonials — at least one required. */
  testimonials: ResolvedTestimonial[];
  /** Theme applied to the section. Defaults to "brand" (pink). */
  theme?: string;
}

/* --------------------------------------------------------------------------
   Helpers
   -------------------------------------------------------------------------- */

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/* --------------------------------------------------------------------------
   Arrow icon
   -------------------------------------------------------------------------- */

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

/* --------------------------------------------------------------------------
   Arrow button hover — ported from reference with token easings
   -------------------------------------------------------------------------- */

function wireArrowHover(btn: HTMLButtonElement): () => void {
  const bg = btn.querySelector<HTMLElement>(".testimonials-btn__bg");
  const arrowHover = btn.querySelector<HTMLElement>(
    ".testimonials-btn__arrow-hover",
  );
  if (!bg || !arrowHover) return () => {};

  const isPrev = btn.classList.contains("is-prev");
  const isLg = () => window.innerWidth >= 1024;

  let enterTl: gsap.core.Timeline | null = null;
  let leaveTl: gsap.core.Timeline | null = null;

  function getOrigins() {
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
  }

  function getInitOffset() {
    const lg = isLg();
    return lg
      ? { yPercent: isPrev ? 100 : -100, xPercent: 0 }
      : { xPercent: isPrev ? 100 : -100, yPercent: 0 };
  }

  function getLeaveOffset() {
    const lg = isLg();
    return lg
      ? { yPercent: isPrev ? -100 : 100 }
      : { xPercent: isPrev ? -100 : 100 };
  }

  gsap.set(bg, { scale: 0 });
  gsap.set(arrowHover, getInitOffset());

  const onEnter = () => {
    if (leaveTl && leaveTl.progress() > 0 && leaveTl.progress() < 0.5) {
      leaveTl.pause();
    }
    const origins = getOrigins();
    gsap.set([bg, arrowHover], { transformOrigin: origins.enter });
    gsap.set(arrowHover, getInitOffset());

    enterTl = gsap
      .timeline({ defaults: { ease: ease.splitText } })
      .to(bg, { scale: 1, duration: animDuration.normal })
      .to(
        arrowHover,
        { xPercent: 0, yPercent: 0, duration: animDuration.normal },
        0.1,
      );
  };

  const onLeave = () => {
    if (enterTl && enterTl.progress() > 0 && enterTl.progress() < 0.5) {
      enterTl.pause();
    }
    const origins = getOrigins();
    gsap.set([bg, arrowHover], { transformOrigin: origins.leave });

    leaveTl = gsap
      .timeline({ defaults: { ease: ease.splitText } })
      .to(bg, { scale: 0, duration: animDuration.normal })
      .to(
        arrowHover,
        { ...getLeaveOffset(), duration: animDuration.normal },
        0,
      );
  };

  btn.addEventListener("mouseenter", onEnter);
  btn.addEventListener("mouseleave", onLeave);

  return () => {
    btn.removeEventListener("mouseenter", onEnter);
    btn.removeEventListener("mouseleave", onLeave);
  };
}

/* --------------------------------------------------------------------------
   Component
   -------------------------------------------------------------------------- */

export default function TestimonialsSection({
  sectionLabel = "Testimonials",
  reference,
  testimonials,
  theme = "brand",
}: TestimonialsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const quoteBlockRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const counterCurrentRef = useRef<HTMLSpanElement>(null);
  const infoWrapRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const prevBtnRef = useRef<HTMLButtonElement>(null);
  const nextBtnRef = useRef<HTMLButtonElement>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(0);
  const animatingRef = useRef(false);
  const timelinesRef = useRef<gsap.core.Timeline[]>([]);

  /* Single-quote mode needs no controls / no crossfade work. */
  const hasMultiple = testimonials.length > 1;

  /* ── Build / re-build timelines whenever testimonials change ─────
     Fonts can shift wrap points, so we wait for document.fonts.ready
     before measuring — otherwise a late-loading brand font reflows
     the quote after we've already grouped word spans by offsetTop. */
  useEffect(() => {
    if (!quoteBlockRef.current) return;
    let disposed = false;

    const timelines: gsap.core.Timeline[] = [];
    let trigger: ScrollTrigger | null = null;

    const build = () => {
      if (disposed || !quoteBlockRef.current) return;

      const quoteEls = quoteBlockRef.current.querySelectorAll<HTMLElement>(
        "[data-testimonial-quote]",
      );

      quoteEls.forEach((el) => {
        const lines = splitByRenderedLines(
          el,
          "testimonials-line-mask",
          "testimonials-line-split",
        );
        if (lines.length === 0) return;
        gsap.set(lines, { yPercent: 100, opacity: 0 });
        const tl = gsap.timeline({ paused: true });
        tl.fromTo(
          lines,
          { yPercent: 100, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: animDuration.fast + 0.1, // ~0.3
            stagger: 0.05,
            ease: ease.splitText,
          },
        );
        timelines.push(tl);
      });
      timelinesRef.current = timelines;

      /* Play the first quote on scroll enter. Reveal counter + info
         + sidebar via CSS class toggles (CSS handles their transition). */
      trigger = ScrollTrigger.create({
        trigger: quoteBlockRef.current,
        start: "top 70%",
        once: true,
        onEnter: () => {
          quoteBlockRef.current?.classList.add("is-visible");
          counterRef.current?.classList.add("is-visible");
          infoWrapRef.current?.classList.add("is-visible");
          sidebarRef.current?.classList.add("is-visible");
          timelines[0]?.play();
        },
      });
    };

    const fontsReady =
      typeof document !== "undefined" && "fonts" in document
        ? (document as Document & { fonts: FontFaceSet }).fonts.ready
        : Promise.resolve();

    fontsReady.then(build);

    return () => {
      disposed = true;
      trigger?.kill();
      timelines.forEach((tl) => tl.kill());
      timelinesRef.current = [];
    };
  }, [testimonials]);

  /* ── Wire arrow button hover once on mount ─────────────────────── */
  useEffect(() => {
    const cleanups: Array<() => void> = [];
    if (prevBtnRef.current) cleanups.push(wireArrowHover(prevBtnRef.current));
    if (nextBtnRef.current) cleanups.push(wireArrowHover(nextBtnRef.current));
    return () => cleanups.forEach((fn) => fn());
  }, []);

  /* ── Navigation ────────────────────────────────────────────────── */
  const goTo = (next: number) => {
    if (animatingRef.current) return;
    const prev = currentIndexRef.current;
    if (next === prev) return;
    animatingRef.current = true;

    const prevTl = timelinesRef.current[prev];
    const nextTl = timelinesRef.current[next];

    /* Counter + logo fade — classes drive opacity transitions. */
    counterCurrentRef.current?.classList.add("is-fading");
    logoRef.current?.classList.add("is-fading");

    const halfMs = animDuration.fast * 1000; // ~200ms
    window.setTimeout(() => {
      currentIndexRef.current = next;
      setCurrentIndex(next);
      counterCurrentRef.current?.classList.remove("is-fading");
      logoRef.current?.classList.remove("is-fading");
    }, halfMs);

    /* Reverse current quote, then play next. */
    const prevReverse = prevTl?.reverse();
    Promise.resolve(prevReverse).then(() => {
      const playNext = nextTl?.play();
      Promise.resolve(playNext).then(() => {
        animatingRef.current = false;
      });
    });
  };

  const goNext = () => goTo((currentIndexRef.current + 1) % testimonials.length);
  const goPrev = () =>
    goTo(
      currentIndexRef.current === 0
        ? testimonials.length - 1
        : currentIndexRef.current - 1,
    );

  /* ── Render ────────────────────────────────────────────────────── */
  if (testimonials.length === 0) return null;

  const total = testimonials.length;
  const currentPartner = testimonials[currentIndex]?.partner;

  return (
    <section
      ref={sectionRef}
      className="testimonials-section"
      data-theme={theme}
      data-nav-theme={theme}
      aria-label={sectionLabel}
    >
      {/* Label row — the section label reads as a proper sub-heading
          (primary font, h4 size, tight tracking, sentence case). The
          reference code keeps its editorial monospace treatment. */}
      <div className="container">
        <div className="testimonials-label-row">
          <div className="font-primary text-h4 font-medium leading-tight tracking-tight">
            {sectionLabel}
          </div>
          {reference ? (
            <div
              className="font-secondary text-text-xs uppercase tracking-caps"
              aria-hidden="true"
            >
              {reference}
            </div>
          ) : null}
        </div>
      </div>

      {/* Full-bleed divider beneath the heading — sits outside the
          container so it stretches the full viewport width. */}
      <hr className="testimonials-section__divider" aria-hidden="true" />

      <div className="container">
        {/* Main grid — sidebar's vertical rule visually meets the full-
            bleed dividers above and below because the grid sits flush
            against both (zero margin on the <hr>s). */}
        <div className="testimonials-grid">
          {/* Quote block */}
          <div
            ref={quoteBlockRef}
            className="testimonials-quote-block"
          >
            <div className="testimonials-stack">
              {testimonials.map((t, i) => {
                const tokens = toWordTokens(t.quote);
                return (
                  <blockquote
                    key={t._id}
                    className="testimonials-quote"
                    data-testimonial-quote
                    data-index={i}
                    aria-label={t.quote}
                    aria-hidden={i !== currentIndex}
                  >
                    {/* Words render inline so the browser wraps at its
                        own natural break points. After paint the
                        effect groups them by `offsetTop` and rewraps
                        each line inside a `.line-mask` / `.line-split`
                        pair for the GSAP reveal. */}
                    {tokens.map((tok, wi) => (
                      <span
                        key={wi}
                        className="testimonials-word"
                        data-word
                      >
                        {tok.word}
                        {tok.trailingSpace ? " " : ""}
                      </span>
                    ))}
                  </blockquote>
                );
              })}
            </div>

            {hasMultiple ? (
              <div
                ref={counterRef}
                className="testimonials-counter"
                aria-hidden="true"
              >
                <span
                  ref={counterCurrentRef}
                  className="testimonials-counter__current"
                >
                  {pad2(currentIndex + 1)}
                </span>
                <span>&nbsp;/&nbsp;</span>
                <span>{pad2(total)}</span>
              </div>
            ) : null}

            <div ref={infoWrapRef} className="testimonials-info-stack">
              {testimonials.map((t, i) => (
                <div
                  key={t._id}
                  className={`testimonials-info${
                    i === currentIndex ? " is-active" : ""
                  }`}
                >
                  <div>
                    {t.author}, {t.title}
                  </div>
                  {t.partner ? <span>{t.partner.name}</span> : null}
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar: logo + controls */}
          <div ref={sidebarRef} className="testimonials-sidebar">
            <div className="testimonials-logo-wrap">
              <div
                ref={logoRef}
                className="testimonials-logo"
                aria-label={currentPartner?.name ?? ""}
                role={currentPartner ? "img" : undefined}
              >
                {currentPartner?.svgContent ? (
                  <span
                    aria-hidden="true"
                    /* SVG is sanitised server-side — fill/stroke already
                       coerced to currentColor. Safe to inline. */
                    dangerouslySetInnerHTML={{
                      __html: currentPartner.svgContent,
                    }}
                  />
                ) : null}
              </div>
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

      {/* Bottom full-bleed divider — meets the bottom of the sidebar's
          vertical rule so the line reads as terminating into the
          horizontal rule rather than ending in mid-air. */}
      <hr className="testimonials-section__divider" aria-hidden="true" />
    </section>
  );
}
