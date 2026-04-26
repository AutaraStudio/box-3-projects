/**
 * LineScroll
 * ==========
 * Reusable section component. Pairs an anchor word with a vertical
 * list of lines; the anchor scroll-parallaxes alongside the list so
 * it visually tracks the first line at section entry and the last
 * line at section exit. Includes an optional bottom row (small
 * heading + paragraph) for supporting copy.
 *
 * Animation:
 *  - Desktop only (≥64rem). Mobile/tablet show the layout statically.
 *  - GSAP ScrollTrigger scrubs the anchor's `y` from 0 to
 *    (linesHeight − anchorHeight), so the anchor reads as travelling
 *    from the first line to the last line as the section passes
 *    through the viewport. Linear ease so motion tracks scroll
 *    velocity 1:1.
 *  - Tween rebuilt on resize so the travel distance always matches
 *    the rendered list height after font/layout shifts.
 */

"use client";

import { useEffect, useId, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import "./LineScroll.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface LineScrollProps {
  /** The short anchor word (e.g. "we"). */
  label: string;
  /** Lines that read down the right column. */
  lines: string[];
  /** Optional small heading on the left of the bottom row. */
  bottomHeading?: string;
  /** Optional paragraph on the right of the bottom row. */
  bottomBody?: string;
  /** Theme applied to the section wrapper. Defaults to "dark". */
  theme?: string;
}

export default function LineScroll({
  label,
  lines,
  bottomHeading,
  bottomBody,
  theme = "dark",
}: LineScrollProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<HTMLUListElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  /* Stable id so multiple instances on the same page each get a
     unique ScrollTrigger id and don't fight over the same trigger. */
  const instanceId = useId();

  useEffect(() => {
    const anchor = anchorRef.current;
    const linesEl = linesRef.current;
    const top = topRef.current;
    if (!anchor || !linesEl || !top) return;

    let ctx: gsap.Context | null = null;

    const build = () => {
      ctx?.revert();
      ctx = gsap.context(() => {
        const mm = gsap.matchMedia();
        mm.add("(min-width: 1024px)", () => {
          /* Reset any previous transform so offsetHeight reflects the
             real laid-out height, not a translated copy. */
          gsap.set(anchor, { y: 0 });
          const distance = linesEl.offsetHeight - anchor.offsetHeight;
          if (distance <= 0) return;

          gsap.fromTo(
            anchor,
            { y: 0 },
            {
              y: distance,
              ease: "none",
              scrollTrigger: {
                id: `line-scroll-${instanceId}`,
                trigger: top,
                start: "center bottom",
                end: "center top",
                scrub: true,
                invalidateOnRefresh: true,
              },
            },
          );
        });
      }, sectionRef);
    };

    build();

    /* Rebuild on resize so the parallax distance always matches the
       current list height (font load, viewport change, etc.). */
    const onResize = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      ctx?.revert();
    };
  }, [instanceId, label, lines, bottomHeading, bottomBody]);

  return (
    <section
      ref={sectionRef}
      className="line-scroll"
      data-theme={theme}
      data-nav-theme={theme}
    >
      <div className="container">
        <div ref={topRef} className="line-scroll__top">
          <div ref={anchorRef} className="line-scroll__anchor">
            <h2 className="line-scroll__anchor-text">{label}</h2>
          </div>

          <div className="line-scroll__lines-cell">
            <ul ref={linesRef} className="line-scroll__lines">
              {lines.map((line, i) => (
                <li key={`${i}-${line}`} className="line-scroll__line">
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {(bottomHeading || bottomBody) && (
          <div className="line-scroll__bottom">
            {bottomHeading ? (
              <div className="line-scroll__bottom-heading-cell">
                <h3 className="line-scroll__bottom-heading">
                  {bottomHeading}
                </h3>
              </div>
            ) : null}
            {bottomBody ? (
              <div className="line-scroll__bottom-body-cell">
                <p className="line-scroll__bottom-body">{bottomBody}</p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
