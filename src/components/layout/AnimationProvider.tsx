/**
 * AnimationProvider
 * =================
 * Global scroll-triggered animation observer. Watches the DOM for
 * elements with data-animate attributes and triggers GSAP animations
 * when they enter the viewport via IntersectionObserver.
 *
 * A MutationObserver catches dynamically added elements so animations
 * work with client-side route transitions and lazy-loaded content.
 *
 * Supported attributes:
 *   data-animate="fade-up|fade-in|fade-down|clip-reveal|scale-reveal"
 *   data-animate-delay="0.2"    — custom delay in seconds
 *   data-animate-stagger="0.1"  — stagger children on parent element
 *
 * All animation values sourced from @/config/animations.config.
 */

"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { fromPresets, stagger as staggerConfig } from "@/config/animations.config";

/** Map data-animate values to their corresponding animation presets. */
const ANIMATION_MAP: Record<string, (typeof fromPresets)[keyof typeof fromPresets]> = {
  "fade-up": fromPresets.fadeUp,
  "fade-in": fromPresets.fadeIn,
  "fade-down": fromPresets.fadeDown,
  "clip-reveal": fromPresets.clipReveal,
  "scale-reveal": fromPresets.scaleReveal,
};

/** Threshold at which an element is considered "in view". */
const INTERSECTION_THRESHOLD = 0.15;

interface AnimationProviderProps {
  children: ReactNode;
}

export default function AnimationProvider({ children }: AnimationProviderProps) {
  const ctxRef = useRef<gsap.Context | null>(null);
  const observedElements = useRef<Set<Element>>(new Set());
  const intersectionObserver = useRef<IntersectionObserver | null>(null);
  const mutationObserver = useRef<MutationObserver | null>(null);

  useEffect(() => {
    ctxRef.current = gsap.context(() => {});

    /** Animate a single element using its data-animate preset. */
    function animateElement(el: Element) {
      const animationType = el.getAttribute("data-animate");
      if (!animationType || !ANIMATION_MAP[animationType]) return;

      const preset = ANIMATION_MAP[animationType];
      const delay = parseFloat(el.getAttribute("data-animate-delay") || "0");
      const staggerValue = parseFloat(el.getAttribute("data-animate-stagger") || "0");

      /* If the element has a stagger value, animate its direct children */
      if (staggerValue > 0) {
        const targets = el.children;
        if (targets.length > 0) {
          ctxRef.current?.add(() => {
            gsap.from(targets, {
              ...preset,
              delay,
              stagger: staggerValue,
            });
          });
          return;
        }
      }

      ctxRef.current?.add(() => {
        gsap.from(el, {
          ...preset,
          delay,
        });
      });
    }

    /** Register an element with the IntersectionObserver. */
    function observe(el: Element) {
      if (observedElements.current.has(el)) return;
      observedElements.current.add(el);

      /* Set initial hidden state so there's no flash of unstyled content */
      gsap.set(el, { visibility: "hidden" });

      intersectionObserver.current?.observe(el);
    }

    /** Scan a root element for all data-animate targets. */
    function scanForAnimateTargets(root: Element | Document) {
      const targets = root.querySelectorAll("[data-animate]");
      targets.forEach(observe);
    }

    /* --- IntersectionObserver — triggers animations on scroll --- */
    intersectionObserver.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          /* Make visible and animate */
          gsap.set(entry.target, { visibility: "visible" });
          animateElement(entry.target);

          /* Unobserve — each element only animates once */
          intersectionObserver.current?.unobserve(entry.target);
          observedElements.current.delete(entry.target);
        });
      },
      { threshold: INTERSECTION_THRESHOLD }
    );

    /* --- MutationObserver — catches dynamically added elements --- */
    mutationObserver.current = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof Element) {
            if (node.hasAttribute("data-animate")) {
              observe(node);
            }
            scanForAnimateTargets(node);
          }
        }
      }
    });

    /* Initial scan of existing DOM */
    scanForAnimateTargets(document);

    /* Start observing for new elements */
    mutationObserver.current.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      intersectionObserver.current?.disconnect();
      mutationObserver.current?.disconnect();
      ctxRef.current?.revert();
      observedElements.current.clear();
    };
  }, []);

  return <>{children}</>;
}
