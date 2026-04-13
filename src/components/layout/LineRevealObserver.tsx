/**
 * LineRevealObserver
 * ==================
 * Global observer for decorative line elements that animate via
 * GSAP scaleY (vertical) reveals. Watches the entire DOM for two
 * data attributes:
 *
 *   data-line-reveal-hero="top|bottom"
 *     Lines that animate immediately on page load (no ScrollTrigger).
 *     Direction value sets the transform origin.
 *
 *   data-line-reveal="top|bottom"
 *     Lines that animate on scroll via ScrollTrigger.
 *     Direction value sets the transform origin.
 *
 * Animation behaviour:
 *   - All lines: scaleY 0 → 1
 *   - "top"    → transformOrigin: "top center"    (grows downward)
 *   - "bottom" → transformOrigin: "bottom center" (grows upward)
 *   - willChange: "transform" set on start, cleared to "auto" on complete
 *
 * Per-element overrides via optional data attributes:
 *   data-line-duration, data-line-ease, data-line-delay
 *
 * A MutationObserver catches dynamically added elements for
 * client-side route transitions.
 *
 * All animation values sourced from @/config/animations.config.
 */

"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { duration, ease } from "@/config/animations.config";

gsap.registerPlugin(ScrollTrigger);

/** Selector strings for DOM scanning. */
const HERO_SELECTOR = "[data-line-reveal-hero]";
const SCROLL_SELECTOR = "[data-line-reveal]";

/** Resolve transform origin from direction attribute value. */
function resolveDirection(direction: string): {
  transformOrigin: string;
} {
  const d = direction.trim().toLowerCase();
  if (d === "bottom") {
    return { transformOrigin: "bottom center" };
  }
  return { transformOrigin: "top center" };
}

/** Read per-element overrides from data attributes, falling back to config tokens. */
function getOptions(el: Element) {
  return {
    delay: parseFloat(el.getAttribute("data-line-delay") || "0"),
    duration: parseFloat(el.getAttribute("data-line-duration") || String(duration.slow)),
    ease: el.getAttribute("data-line-ease") || ease.brand,
  };
}

interface LineRevealObserverProps {
  children: ReactNode;
}

export default function LineRevealObserver({ children }: LineRevealObserverProps) {
  const ctxRef = useRef<gsap.Context | null>(null);
  const processedElements = useRef<Set<Element>>(new Set());
  const mutationObserver = useRef<MutationObserver | null>(null);

  useEffect(() => {
    ctxRef.current = gsap.context(() => {});

    /**
     * Animate a single line element.
     * @param el      — The DOM element to animate
     * @param isHero  — true: fires immediately, false: fires on scroll
     */
    function animateElement(el: Element, isHero: boolean) {
      if (processedElements.current.has(el)) return;
      processedElements.current.add(el);

      const directionAttr = isHero
        ? el.getAttribute("data-line-reveal-hero")
        : el.getAttribute("data-line-reveal");

      const { transformOrigin } = resolveDirection(directionAttr || "top");
      const opts = getOptions(el);

      /* Set hidden initial state */
      gsap.set(el, {
        scaleY: 0,
        transformOrigin,
        willChange: "transform",
      });

      const tweenVars: gsap.TweenVars = {
        scaleY: 1,
        duration: opts.duration,
        ease: opts.ease,
        delay: opts.delay,
        onComplete: () => {
          (el as HTMLElement).style.willChange = "auto";
        },
      };

      ctxRef.current?.add(() => {
        if (isHero) {
          /* Hero lines fire immediately — no ScrollTrigger */
          gsap.to(el, tweenVars);
        } else {
          /* Scroll lines use ScrollTrigger, fire once */
          gsap.to(el, {
            ...tweenVars,
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              once: true,
            },
          });
        }
      });
    }

    /** Scan a root for hero line targets and process them. */
    function scanForHeroLines(root: Element | Document) {
      const targets = root.querySelectorAll(HERO_SELECTOR);
      targets.forEach((el) => animateElement(el, true));
    }

    /** Scan a root for scroll line targets and process them. */
    function scanForScrollLines(root: Element | Document) {
      const targets = root.querySelectorAll(SCROLL_SELECTOR);
      targets.forEach((el) => animateElement(el, false));
    }

    /** Scan for all line reveal targets. */
    function scanAll(root: Element | Document) {
      scanForHeroLines(root);
      scanForScrollLines(root);
    }

    /* --- MutationObserver — catches dynamically added elements --- */
    mutationObserver.current = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof Element) {
            if (node.hasAttribute("data-line-reveal-hero")) {
              animateElement(node, true);
            }
            if (node.hasAttribute("data-line-reveal")) {
              animateElement(node, false);
            }
            scanAll(node);
          }
        }
      }
    });

    /* Initial scan of existing DOM */
    scanAll(document);

    /* Start observing for new elements */
    mutationObserver.current.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      mutationObserver.current?.disconnect();
      ctxRef.current?.revert();
      processedElements.current.clear();
    };
  }, []);

  return <>{children}</>;
}
