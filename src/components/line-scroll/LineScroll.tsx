/**
 * LineScroll
 * ==========
 * Editorial section. Pairs a short anchor word ("we") with a
 * vertical list of statements; the anchor scroll-parallaxes
 * alongside the list so it visually tracks the first line at
 * section entry and the last line at section exit.
 *
 * Animation:
 *  - Desktop only (≥64rem). Mobile / tablet show the layout
 *    static — the parallax doesn't read at narrow widths and
 *    the lines stack tighter beneath the anchor instead.
 *  - GSAP ScrollTrigger scrubs the anchor's `y` from 0 to
 *    (linesHeight − anchorHeight). Linear ease so motion is
 *    1:1 with scroll velocity.
 *  - Tween rebuilt on resize so the travel distance always
 *    matches the rendered list height after font / layout
 *    shifts.
 *
 * Defers ScrollTrigger creation until any in-flight page
 * transition has ended (same pattern as Heading / RevealStack /
 * RevealImage). Without this, a triggers initialised behind the
 * still-covering transition panel can measure against the wrong
 * `<main>` y-offset.
 */

"use client";

import { useEffect, useId, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { awaitTransitionEnd } from "@/components/transition/transitionState";

import "./LineScroll.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface LineScrollProps {
  /** Short anchor word — defaults to "we". */
  label?: string;
  /** Lines that read down the right column. */
  lines: string[];
  /** Optional small heading on the left of the bottom row. */
  bottomHeading?: string;
  /** Optional paragraph on the right of the bottom row. */
  bottomBody?: string;
  /** Theme applied to the section wrapper. Defaults to "dark". */
  theme?: "dark" | "cream" | "pink";
}

export default function LineScroll({
  label = "we",
  lines,
  bottomHeading,
  bottomBody,
  theme = "dark",
}: LineScrollProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<HTMLUListElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const instanceId = useId();

  useEffect(() => {
    const anchor = anchorRef.current;
    const linesEl = linesRef.current;
    const top = topRef.current;
    if (!anchor || !linesEl || !top) return;

    let ctx: gsap.Context | null = null;
    let cancelled = false;

    const build = () => {
      if (cancelled) return;
      ctx?.revert();
      ctx = gsap.context(() => {
        const mm = gsap.matchMedia();
        mm.add("(min-width: 64rem)", () => {
          gsap.set(anchor, { y: 0 });

          /* Snap-to-line behaviour. Instead of scrubbing the anchor
             continuously, sample the scroll progress and tween the
             anchor to whichever line's y-offset is currently active.
             Each line owns an equal slice of the trigger range. */
          const lineEls = Array.from(
            linesEl.querySelectorAll<HTMLElement>(".line-scroll__line"),
          );
          if (lineEls.length === 0) return;

          const targets = lineEls.map((el) => el.offsetTop);
          let lastIdx = -1;

          ScrollTrigger.create({
            id: `line-scroll-${instanceId}`,
            trigger: top,
            start: "center bottom",
            end: "center top",
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const idx = Math.min(
                targets.length - 1,
                Math.max(0, Math.floor(self.progress * targets.length)),
              );
              if (idx === lastIdx) return;
              lastIdx = idx;
              gsap.to(anchor, {
                y: targets[idx],
                duration: 0.45,
                ease: "power3.out",
                overwrite: true,
              });
            },
            onRefresh: () => {
              targets.length = 0;
              lineEls.forEach((el) => targets.push(el.offsetTop));
              lastIdx = -1;
            },
          });
        });
      }, sectionRef);
    };

    awaitTransitionEnd().then(build);

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", onResize);
      ctx?.revert();
    };
  }, [instanceId, label, lines, bottomHeading, bottomBody]);

  return (
    <section
      ref={sectionRef}
      className="line-scroll"
      data-theme={theme}
    >
      <div className="container">
        <div ref={topRef} className="line-scroll__top">
          <div ref={anchorRef} className="line-scroll__anchor">
            <h2 className="line-scroll__anchor-text text-h2">{label}</h2>
          </div>

          <div className="line-scroll__lines-cell">
            <ul ref={linesRef} className="line-scroll__lines">
              {lines.map((line, i) => (
                <li
                  key={`${i}-${line}`}
                  className="line-scroll__line text-h2"
                >
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {bottomHeading || bottomBody ? (
          <div className="line-scroll__bottom">
            {bottomHeading ? (
              <div className="line-scroll__bottom-heading-cell">
                <h3 className="line-scroll__bottom-heading text-small text-caps">
                  {bottomHeading}
                </h3>
              </div>
            ) : null}
            {bottomBody ? (
              <div className="line-scroll__bottom-body-cell">
                <p className="line-scroll__bottom-body text-large">
                  {bottomBody}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
