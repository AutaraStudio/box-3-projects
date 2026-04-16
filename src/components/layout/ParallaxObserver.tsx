/**
 * ParallaxObserver
 * ================
 * Global parallax system built on GSAP + ScrollTrigger. Scans the
 * DOM for `[data-parallax="trigger"]` elements and creates a scrub
 * tween per trigger, animating its yPercent or xPercent as the
 * trigger passes through the viewport.
 *
 * Ported from the Osmo global parallax setup — adapted for React
 * lifecycle (MutationObserver picks up SPA route changes) and wired
 * to the project's existing SmoothScroll (Lenis + ScrollTrigger).
 *
 * ---------------------------------------------------------------
 * DATA ATTRIBUTES
 * ---------------------------------------------------------------
 * Required on each parallax trigger:
 *   data-parallax="trigger"
 *
 * Optional — target a child instead of animating the trigger itself:
 *   data-parallax="target"        (on a descendant of the trigger)
 *
 * Optional tuning (all live on the trigger):
 *   data-parallax-direction="horizontal|vertical"   default: vertical
 *   data-parallax-start="20"                        default: 20  (%)
 *   data-parallax-end="-20"                         default: -20 (%)
 *   data-parallax-scroll-start="top bottom"         default: top bottom
 *   data-parallax-scroll-end="bottom top"           default: bottom top
 *   data-parallax-scrub="true|<seconds>"            default: true
 *   data-parallax-disable="mobile|mobileLandscape|tablet"
 *
 * Start/end values are percentages of the element's own size. With
 * direction="vertical" they map to yPercent; horizontal maps to
 * xPercent. Scrub as a number is the GSAP lag in seconds (bigger =
 * lazier). `true` is the tightest default and pairs well with Lenis.
 *
 * `data-parallax-disable` uses matchMedia; GSAP handles the resize
 * teardown/recreation automatically.
 *
 * ---------------------------------------------------------------
 * MASK PATTERN (image-in-a-frame)
 * ---------------------------------------------------------------
 *   <div class="mask" data-parallax="trigger"   <!-- overflow:hidden, relative -->
 *        style="overflow:hidden; position:relative; height:100%">
 *     <div data-parallax="target"                <!-- height:120%, absolute -->
 *          style="position:absolute; inset:0; height:120%">
 *       <img src="..." style="width:100%; height:100%; object-fit:cover"/>
 *     </div>
 *   </div>
 *
 * The target's extra height gives the image room to translate
 * without ever exposing a blank gap inside the mask.
 */

"use client";

import { useEffect, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const TRIGGER_SELECTOR = '[data-parallax="trigger"]';
const TARGET_SELECTOR = '[data-parallax="target"]';

type DisableBreakpoint = "mobile" | "mobileLandscape" | "tablet";

interface ParallaxObserverProps {
  children: ReactNode;
}

export default function ParallaxObserver({ children }: ParallaxObserverProps) {
  useEffect(() => {
    /* A WeakSet keeps track of triggers we've already tweened so the
       MutationObserver doesn't double-register the same element. It
       also lets garbage collection drop detached nodes without a
       manual cleanup pass. */
    const processed = new WeakSet<Element>();
    const mm = gsap.matchMedia();

    mm.add(
      {
        isMobile: "(max-width: 479px)",
        isMobileLandscape: "(max-width: 767px)",
        isTablet: "(max-width: 991px)",
        isDesktop: "(min-width: 992px)",
      },
      (context) => {
        const conditions = (context.conditions ?? {}) as Record<
          string,
          boolean
        >;
        const isMobile = !!conditions.isMobile;
        const isMobileLandscape = !!conditions.isMobileLandscape;
        const isTablet = !!conditions.isTablet;

        function shouldSkip(el: Element): boolean {
          const disable = el.getAttribute(
            "data-parallax-disable",
          ) as DisableBreakpoint | null;
          if (!disable) return false;
          if (disable === "mobile" && isMobile) return true;
          if (disable === "mobileLandscape" && isMobileLandscape) return true;
          if (disable === "tablet" && isTablet) return true;
          return false;
        }

        const ctx = gsap.context(() => {
          /** Create the scrub tween for a single trigger. */
          function buildTween(trigger: Element) {
            if (processed.has(trigger)) return;
            if (shouldSkip(trigger)) return;
            processed.add(trigger);

            const target = trigger.querySelector(TARGET_SELECTOR) ?? trigger;

            const direction =
              trigger.getAttribute("data-parallax-direction") || "vertical";
            const prop = direction === "horizontal" ? "xPercent" : "yPercent";

            const scrubAttr = trigger.getAttribute("data-parallax-scrub");
            const scrub = scrubAttr ? parseFloat(scrubAttr) : true;

            const startAttr = trigger.getAttribute("data-parallax-start");
            const startVal = startAttr !== null ? parseFloat(startAttr) : 20;

            const endAttr = trigger.getAttribute("data-parallax-end");
            const endVal = endAttr !== null ? parseFloat(endAttr) : -20;

            /* clamp() prevents the trigger from "popping" when the
               page loads partway through the animation range — GSAP
               keeps the progress inside [0, 1] at all times. */
            const scrollStartRaw =
              trigger.getAttribute("data-parallax-scroll-start") ||
              "top bottom";
            const scrollStart = `clamp(${scrollStartRaw})`;

            const scrollEndRaw =
              trigger.getAttribute("data-parallax-scroll-end") || "bottom top";
            const scrollEnd = `clamp(${scrollEndRaw})`;

            gsap.fromTo(
              target,
              { [prop]: startVal },
              {
                [prop]: endVal,
                ease: "none",
                scrollTrigger: {
                  trigger,
                  start: scrollStart,
                  end: scrollEnd,
                  scrub,
                },
              },
            );
          }

          /* Initial scan */
          document.querySelectorAll(TRIGGER_SELECTOR).forEach(buildTween);

          /* SPA route transitions and lazy-mounted content: pick up
             any triggers that appear after the initial scan. */
          const mo = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
              for (const node of mutation.addedNodes) {
                if (!(node instanceof Element)) continue;
                if (node.matches?.(TRIGGER_SELECTOR)) buildTween(node);
                node
                  .querySelectorAll?.(TRIGGER_SELECTOR)
                  .forEach(buildTween);
              }
            }
          });
          mo.observe(document.body, { childList: true, subtree: true });

          /* gsap.context tracks this return function and invokes it
             on ctx.revert(), which matchMedia calls when the
             breakpoint changes or the root effect unmounts. */
          return () => mo.disconnect();
        });

        return () => ctx.revert();
      },
    );

    return () => mm.revert();
  }, []);

  return <>{children}</>;
}
