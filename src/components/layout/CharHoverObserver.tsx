/**
 * CharHoverObserver
 * =================
 * Global observer for the site-wide char slide-up hover effect.
 * Any element carrying `data-char-hover=""` is split into one
 * `<span>` per character, with each span given a staggered
 * `transition-delay`. CSS in `globals.css` drives the actual hover
 * animation — this observer only owns the splitting + staggering.
 *
 * The containing link or button (or `[data-char-hover-trigger]`) is
 * the hover target — on hover, every character slides up by 1.3em.
 *
 * Important constraints (don't break these):
 *   - The element's text must NOT change after mount. The observer
 *     splits once on first sight; subsequent text updates would
 *     leave the old character spans in place.
 *   - Do not add `data-char-hover` inside elements that rewrite
 *     their children at runtime (e.g. GSAP ScrambleText targets).
 *
 * A MutationObserver catches dynamically added elements for
 * client-side route transitions.
 */

"use client";

import { useEffect, useRef, type ReactNode } from "react";

const SELECTOR = "[data-char-hover]";
/* Per-character stagger — small enough to feel continuous, large
   enough that the end characters visibly trail the start. Tuned by
   eye; lives here rather than the global token scale because it's
   specific to this effect. */
const STAGGER_SECONDS = 0.015;

interface CharHoverObserverProps {
  children: ReactNode;
}

function splitElement(el: HTMLElement) {
  /* Idempotent — skip if already split. */
  if (el.dataset.charHoverSplit === "true") return;

  const text = el.textContent ?? "";
  if (!text) return;

  /* Rebuild innerHTML as one span per character. Whitespace is
     preserved via the stylesheet's `white-space: pre` rule on the
     span, so we can safely include spaces as their own spans. */
  const chars = Array.from(text);
  el.textContent = "";
  chars.forEach((ch, i) => {
    const span = document.createElement("span");
    span.textContent = ch;
    span.style.transitionDelay = `${(i * STAGGER_SECONDS).toFixed(3)}s`;
    el.appendChild(span);
  });

  el.dataset.charHoverSplit = "true";
}

export default function CharHoverObserver({
  children,
}: CharHoverObserverProps) {
  const mutationObserver = useRef<MutationObserver | null>(null);

  useEffect(() => {
    function scan(root: Element | Document) {
      root.querySelectorAll<HTMLElement>(SELECTOR).forEach(splitElement);
    }

    mutationObserver.current = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLElement) {
            if (node.matches?.(SELECTOR)) splitElement(node);
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
      mutationObserver.current?.disconnect();
    };
  }, []);

  return <>{children}</>;
}
