/**
 * SplitTextObserver
 * =================
 * Global observer for elements with data-split-text attributes.
 * Uses GSAP SplitText to split text into lines, words, or characters
 * and animates them on scroll via IntersectionObserver.
 *
 * A MutationObserver catches dynamically added elements for
 * client-side route transitions.
 *
 * Supported attributes:
 *   data-split-text="lines|words|chars"
 *   data-split-delay="0.2" — custom delay in seconds
 *
 * All animation values sourced from @/config/animations.config.
 */

"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { fromPresets, stagger } from "@/config/animations.config";

gsap.registerPlugin(SplitText);

/** Map data-split-text values to preset + split type + stagger timing. */
const SPLIT_MAP = {
  lines: {
    preset: fromPresets.splitLine,
    type: "lines" as const,
    stagger: stagger.moderate,
  },
  words: {
    preset: fromPresets.splitWord,
    type: "words" as const,
    stagger: stagger.normal,
  },
  chars: {
    preset: fromPresets.splitChar,
    type: "chars" as const,
    stagger: stagger.tight,
  },
} as const;

type SplitType = keyof typeof SPLIT_MAP;

const INTERSECTION_THRESHOLD = 0.15;

interface SplitTextObserverProps {
  children: ReactNode;
}

export default function SplitTextObserver({ children }: SplitTextObserverProps) {
  const ctxRef = useRef<gsap.Context | null>(null);
  const splitInstances = useRef<SplitText[]>([]);
  const observedElements = useRef<Set<Element>>(new Set());
  const intersectionObserver = useRef<IntersectionObserver | null>(null);
  const mutationObserver = useRef<MutationObserver | null>(null);

  useEffect(() => {
    ctxRef.current = gsap.context(() => {});

    /** Split and animate an element when it enters the viewport. */
    function animateSplitText(el: Element) {
      const splitType = el.getAttribute("data-split-text") as SplitType | null;
      if (!splitType || !SPLIT_MAP[splitType]) return;

      const config = SPLIT_MAP[splitType];
      const delay = parseFloat(el.getAttribute("data-split-delay") || "0");

      ctxRef.current?.add(() => {
        const split = new SplitText(el, { type: config.type });
        splitInstances.current.push(split);

        /* Determine which split targets to animate */
        const targets =
          config.type === "lines"
            ? split.lines
            : config.type === "words"
              ? split.words
              : split.chars;

        gsap.from(targets, {
          ...config.preset,
          delay,
          stagger: config.stagger,
        });
      });
    }

    /** Register an element with the IntersectionObserver. */
    function observe(el: Element) {
      if (observedElements.current.has(el)) return;
      observedElements.current.add(el);
      intersectionObserver.current?.observe(el);
    }

    /** Scan a root element for all data-split-text targets. */
    function scanForSplitTargets(root: Element | Document) {
      const targets = root.querySelectorAll("[data-split-text]");
      targets.forEach(observe);
    }

    /* --- IntersectionObserver — triggers split animations on scroll --- */
    intersectionObserver.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          animateSplitText(entry.target);

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
            if (node.hasAttribute("data-split-text")) {
              observe(node);
            }
            scanForSplitTargets(node);
          }
        }
      }
    });

    /* Initial scan of existing DOM */
    scanForSplitTargets(document);

    /* Start observing for new elements */
    mutationObserver.current.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      intersectionObserver.current?.disconnect();
      mutationObserver.current?.disconnect();

      /* Revert all SplitText instances to restore original DOM */
      splitInstances.current.forEach((split) => split.revert());
      splitInstances.current = [];

      ctxRef.current?.revert();
      observedElements.current.clear();
    };
  }, []);

  return <>{children}</>;
}
