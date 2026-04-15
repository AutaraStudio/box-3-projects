/**
 * CharHoverObserver
 * =================
 * Global observer that finds all elements with data-char-hover
 * and splits their text content into individual character <span>
 * elements with staggered CSS transition-delays.
 *
 * This enables the character slide-up hover animation defined
 * in globals.css — pure CSS transitions, no GSAP on hover.
 *
 * A MutationObserver catches dynamically added elements for
 * client-side route transitions.
 *
 * Usage:
 *   Add data-char-hover="" to any text element.
 *   The animation triggers automatically via CSS on
 *   hover of the nearest <a>, <button>, or
 *   [data-char-hover-trigger] ancestor.
 */

"use client";

import { useEffect, type ReactNode } from "react";

const STAGGER_INCREMENT = 0.02; /* seconds between each char */
const SELECTOR = "[data-char-hover]";

interface CharHoverObserverProps {
  children: ReactNode;
}

export default function CharHoverObserver({
  children,
}: CharHoverObserverProps) {
  useEffect(() => {
    const processed = new WeakSet<Element>();

    function splitChars(el: Element) {
      if (processed.has(el)) return;
      processed.add(el);

      const text = el.textContent ?? "";
      el.textContent = "";

      [...text].forEach((char, index) => {
        const span = document.createElement("span");
        span.textContent = char;
        span.style.transitionDelay = `${index * STAGGER_INCREMENT}s`;
        if (char === " ") {
          span.style.whiteSpace = "pre";
        }
        el.appendChild(span);
      });
    }

    function scanAndSplit(root: Element | Document) {
      root.querySelectorAll(SELECTOR).forEach(splitChars);
    }

    /* Initial scan */
    scanAndSplit(document);

    /* Watch for dynamically added elements */
    const mo = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof Element) {
            if (node.hasAttribute("data-char-hover")) {
              splitChars(node);
            }
            scanAndSplit(node);
          }
        }
      }
    });

    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
    };
  }, []);

  return <>{children}</>;
}
