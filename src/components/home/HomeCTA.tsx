/**
 * HomeCTA
 * =======
 * Pinned, full-viewport closing panel. Starts on the `pink`
 * theme; as the user scrolls into the pinned range, a dark
 * wipe expands left-to-right across the section. The text
 * (and button) are duplicated into a clipped layer themed
 * `dark` whose `clip-path` opens in lockstep with the wipe —
 * so the type appears to read against whichever colour is
 * behind it at any given x-position.
 *
 * Adapted from `/reference/ref.html`. Layout + intent only —
 * every value goes through v2 tokens (theme + spacing +
 * typography). The reference's primary/secondary filled
 * buttons + skew-lerp hover are dropped in favour of the
 * site's editorial Button component for consistency.
 *
 * The base layer carries the real, focusable button. The
 * clip layer is `aria-hidden`, `pointer-events: none`, and
 * `tabindex="-1"` on its duplicate button so the second copy
 * never enters the a11y tree or the tab order — it exists
 * only as a visual reveal.
 *
 * `prefers-reduced-motion` short-circuits the wipe entirely
 * and leaves the section in its pink resting state, which
 * still reads as a complete CTA (heading + button visible).
 */

"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Button from "@/components/ui/Button";
import SplitText from "@/components/split-text/SplitText";

import "./HomeCTA.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface HomeCTAProps {
  /** Display heading. Pass `"line one\nline two"` for a multi-line
   *  heading; each line stacks as its own block. */
  heading: string;
  ctaLabel?: string;
  ctaHref?: string;
  ctaPageName?: string;
}

export default function HomeCTA({
  heading,
  ctaLabel = "Contact →",
  ctaHref = "/contact",
  ctaPageName = "Contact",
}: HomeCTAProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const wipeRef = useRef<HTMLDivElement>(null);
  const clipRef = useRef<HTMLDivElement>(null);

  const lines = heading.split("\n").filter((line) => line.trim().length > 0);

  useEffect(() => {
    const section = sectionRef.current;
    const wipe = wipeRef.current;
    const clip = clipRef.current;
    if (!section || !wipe || !clip) return;

    let ctx: gsap.Context | null = null;

    ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      /* Reduced-motion users skip the pin + scrub entirely. The
         pink resting state already reads as a finished CTA, so
         no further setup is needed. */
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(wipe, { width: "0%" });
        gsap.set(clip, { clipPath: "inset(0 100% 0 0)" });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=150%",
            scrub: 0.5,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        tl.to(wipe, { width: "100%", ease: "none" }, 0).to(
          clip,
          { clipPath: "inset(0 0% 0 0)", ease: "none" },
          0,
        );
      });
    }, section);

    return () => {
      ctx?.revert();
    };
  }, []);

  const Content = () => (
    <>
      <h2 className="home-cta__heading text-display">
        {lines.map((line, i) => (
          <span key={i} className="home-cta__heading-line">
            <SplitText asWords revealOnScroll>
              {line}
            </SplitText>
          </span>
        ))}
      </h2>
      <div className="home-cta__actions">
        <Button href={ctaHref} pageName={ctaPageName} size="xl">
          {ctaLabel}
        </Button>
      </div>
    </>
  );

  return (
    <section ref={sectionRef} className="home-cta" data-theme="pink">
      <div className="home-cta__stage">
        {/* Dark wipe — animates width 0% → 100% under scrub. */}
        <div
          ref={wipeRef}
          className="home-cta__wipe"
          data-theme="dark"
          aria-hidden="true"
        />

        {/* Base layer — pink theme cascades from the section, so
            heading + button render in the dark text colour. */}
        <div className="home-cta__layer home-cta__layer--base">
          <Content />
        </div>

        {/* Clip layer — same content, but themed `dark` so its
            text + button render in the pink text colour. The
            clip-path opens left-to-right in lockstep with the
            wipe. Hidden from a11y / tab order — purely visual. */}
        <div
          ref={clipRef}
          className="home-cta__layer home-cta__layer--clip"
          data-theme="dark"
          aria-hidden="true"
        >
          {/* Clip layer's SplitText omits `revealOnScroll` — the
              base layer already runs the word-slide-up reveal once.
              Its visual reveal is the clip-path itself, scrubbed
              by the wipe; firing a second IntersectionObserver
              here would double the animation. */}
          <h2 className="home-cta__heading text-display">
            {lines.map((line, i) => (
              <span key={i} className="home-cta__heading-line">
                <SplitText asWords>
                  {line}
                </SplitText>
              </span>
            ))}
          </h2>
          <div className="home-cta__actions">
            <span tabIndex={-1} aria-hidden="true">
              <Button href={ctaHref} pageName={ctaPageName} size="xl">
                {ctaLabel}
              </Button>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
