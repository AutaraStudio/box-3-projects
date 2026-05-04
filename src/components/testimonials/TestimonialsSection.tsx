"use client";

/**
 * TestimonialsSection
 * ===================
 * Editorial testimonials block. Section label + reference code
 * across the top, then a two-column grid: sidebar (logo + prev/next
 * controls) on the left straddling a vertical rule; quote + counter
 * + author/role on the right.
 *
 * Quote reveal: each quote sits in the same grid cell. After the
 * browser has laid them out (and the editorial font has loaded),
 * we group each quote's word spans by their rendered `offsetTop`
 * and wrap each group in a mask + line span. CSS transitions then
 * slide each line up from translateY(100%) to 0 (with a per-line
 * stagger via `--line-index`) when the quote becomes active —
 * giving a true line-by-line reveal rather than a uniform fade.
 *
 * Prev/next: each button has a circular bg that scales 0 → 1 from
 * the matching edge on hover and a duplicate arrow that slides in
 * from the same edge. Direction flips for prev vs. next; axis
 * flips at the desktop breakpoint (vertical on desktop, horizontal
 * on mobile).
 *
 * SVG partner logos are inlined as sanitised markup server-side
 * (see fetchTestimonials) so they inherit `currentColor`.
 */

import { useEffect, useRef, useState } from "react";

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

export default function TestimonialsSection({
  sectionLabel = "Testimonials",
  reference,
  testimonials,
  theme = "pink",
}: TestimonialsSectionProps) {
  const stackRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const total = testimonials.length;
  const hasMultiple = total > 1;
  const current = testimonials[currentIndex];

  const goPrev = () =>
    setCurrentIndex((i) => (i - 1 + total) % total);
  const goNext = () => setCurrentIndex((i) => (i + 1) % total);

  /* After mount: group each quote's word spans by their rendered
     offsetTop and wrap each line in a mask + inner pair so CSS
     can slide each line independently. Re-runs on resize so wrap
     points stay accurate when the viewport changes. Defers until
     `document.fonts.ready` so a late-loading font reflow doesn't
     leave the line groups computed against the fallback metrics. */
  useEffect(() => {
    const stack = stackRef.current;
    if (!stack) return;

    let cancelled = false;
    let timer: number | null = null;

    const buildLines = () => {
      if (cancelled) return;
      const quotes = stack.querySelectorAll<HTMLElement>(
        "[data-testimonial-quote]",
      );
      quotes.forEach((quote) => {
        /* If we've already wrapped, restore the original word-span
           tree so re-layout starts clean. */
        const original = quote.getAttribute("data-original-html");
        if (original !== null) quote.innerHTML = original;
        else quote.setAttribute("data-original-html", quote.innerHTML);

        const words = Array.from(
          quote.querySelectorAll<HTMLElement>("[data-word]"),
        );
        if (words.length === 0) return;

        /* Group spans by their rendered offsetTop. Within ~3px is
           still considered the same line — guards against sub-pixel
           drift on font swaps. */
        const groups: HTMLElement[][] = [];
        let lastTop: number | null = null;
        words.forEach((w) => {
          const top = w.offsetTop;
          if (lastTop === null || Math.abs(top - lastTop) > 3) {
            groups.push([w]);
            lastTop = top;
          } else {
            groups[groups.length - 1].push(w);
          }
        });

        /* Replace the quote's children with line-mask wrappers. */
        const frag = document.createDocumentFragment();
        groups.forEach((group, lineIndex) => {
          const mask = document.createElement("span");
          mask.className = "testimonials-line-mask";
          const split = document.createElement("span");
          split.className = "testimonials-line-split";
          split.style.setProperty("--line-index", String(lineIndex));
          group.forEach((w) => split.appendChild(w));
          mask.appendChild(split);
          frag.appendChild(mask);
        });
        quote.innerHTML = "";
        quote.appendChild(frag);
      });
    };

    const run = () => {
      if (typeof document.fonts?.ready?.then === "function") {
        document.fonts.ready.then(buildLines);
      } else {
        buildLines();
      }
    };

    run();
    const onResize = () => {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(run, 200);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, [testimonials]);

  if (testimonials.length === 0) return null;

  return (
    <section
      className="testimonials-section"
      data-theme={theme}
      aria-label={sectionLabel}
    >
      <div className="container">
        <div className="testimonials-label-row">
          <h2 className="testimonials-label text-h3">{sectionLabel}</h2>
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
            <div ref={stackRef} className="testimonials-stack">
              {testimonials.map((t, i) => {
                /* Split into words and bake the trailing space INTO
                   each span so when the line-grouping pass moves
                   the spans into a new parent the whitespace
                   travels with them — preserves the visible spacing
                   between words on the rendered line. */
                const words = t.quote.trim().split(/\s+/);
                return (
                  <blockquote
                    key={t._id}
                    className={`testimonials-quote text-h3${
                      i === currentIndex ? " is-active" : ""
                    }`}
                    data-testimonial-quote
                    aria-label={t.quote}
                    aria-hidden={i !== currentIndex}
                  >
                    {words.map((word, wi) => (
                      <span
                        key={wi}
                        className="testimonials-word"
                        data-word
                      >
                        {word}
                        {wi < words.length - 1 ? " " : ""}
                      </span>
                    ))}
                  </blockquote>
                );
              })}
            </div>

            {/* Bottom row — author/role on the left, counter on
                the right end. They share a baseline so the
                editorial caps and small-caps numerals read as a
                single row of meta below the quote. */}
            <div className="testimonials-bottom-row">
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

              {hasMultiple ? (
                <div className="testimonials-counter" aria-hidden="true">
                  <span className="testimonials-counter__current">
                    {pad2(currentIndex + 1)}
                  </span>
                  <span>&nbsp;/&nbsp;</span>
                  <span>{pad2(total)}</span>
                </div>
              ) : null}
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
