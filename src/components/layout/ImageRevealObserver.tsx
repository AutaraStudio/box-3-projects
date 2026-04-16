/**
 * ImageRevealObserver
 * ===================
 * Global observer for the site-wide image reveal effect. Any element
 * carrying `data-image-reveal` starts with a pink (or theme-aware)
 * overlay that fades away the first time its top crosses the vertical
 * centre of the viewport, revealing the media beneath.
 *
 * The visual behaviour lives in `globals.css` under "Image reveal" —
 * this observer only toggles the `data-revealed` attribute, which
 * triggers the transition. Tuned for a long, gentle 2.4s fade.
 *
 * Optional overrides via data attributes:
 *   data-image-reveal-delay="0.2"  — delay in seconds before reveal
 *
 * The root margin shrinks the effective viewport to its top half so
 * the reveal fires exactly when the element's top edge crosses the
 * centre line. Threshold 0 means any pixel crossing triggers.
 *
 * A MutationObserver catches dynamically added elements for
 * client-side route transitions.
 */

"use client";

import { useEffect, useRef, type ReactNode } from "react";

const SELECTOR = "[data-image-reveal]";
/* Shrink the bottom half of the viewport — element is "intersecting"
   once its top crosses the horizontal centre line. */
const ROOT_MARGIN = "0px 0px -50% 0px";
const INTERSECTION_THRESHOLD = 0;

interface ImageRevealObserverProps {
  children: ReactNode;
}

export default function ImageRevealObserver({
  children,
}: ImageRevealObserverProps) {
  const intersectionObserver = useRef<IntersectionObserver | null>(null);
  const mutationObserver = useRef<MutationObserver | null>(null);
  const observed = useRef<Set<Element>>(new Set());

  useEffect(() => {
    function reveal(el: Element) {
      const delay = parseFloat(
        el.getAttribute("data-image-reveal-delay") || "0",
      );
      if (delay > 0) {
        window.setTimeout(() => {
          el.setAttribute("data-revealed", "true");
        }, delay * 1000);
      } else {
        el.setAttribute("data-revealed", "true");
      }
    }

    function observe(el: Element) {
      if (observed.current.has(el)) return;
      if (el.hasAttribute("data-revealed")) return;
      observed.current.add(el);
      intersectionObserver.current?.observe(el);
    }

    function scan(root: Element | Document) {
      root.querySelectorAll(SELECTOR).forEach(observe);
    }

    intersectionObserver.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          reveal(entry.target);
          intersectionObserver.current?.unobserve(entry.target);
          observed.current.delete(entry.target);
        });
      },
      { threshold: INTERSECTION_THRESHOLD, rootMargin: ROOT_MARGIN },
    );

    mutationObserver.current = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof Element) {
            if (node.matches?.(SELECTOR)) observe(node);
            scan(node);
          }
        }
      }
    });

    scan(document);
    mutationObserver.current.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      intersectionObserver.current?.disconnect();
      mutationObserver.current?.disconnect();
      observed.current.clear();
    };
  }, []);

  return <>{children}</>;
}
