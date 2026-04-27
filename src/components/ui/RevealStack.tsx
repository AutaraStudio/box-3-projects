/**
 * RevealStack
 * ===========
 * Wraps any list-style block. Each direct child fades + slides in
 * with a stagger when the wrapper enters the viewport. Companion
 * to <Heading> — same IntersectionObserver pattern, applied to a
 * stack of items rather than the words inside a single label.
 *
 *   <RevealStack as="ul" className="project-hero__expertise-list">
 *     <li>…</li>
 *     <li>…</li>
 *   </RevealStack>
 *
 * Renders as the supplied `as` tag (defaults to a div), forwards
 * className, and adds the `reveal-stack` class which the global
 * CSS uses to drive the transition. Each child gets a
 * `--reveal-index` custom property at mount so the stagger is
 * automatic — no per-item index plumbing needed at the call-site.
 *
 * The observer fires once and unobserves, so a stack never
 * re-animates on subsequent scrolls.
 */

"use client";

import {
  createElement,
  useEffect,
  useRef,
  type ElementType,
  type ReactNode,
} from "react";

import { awaitTransitionEnd } from "@/components/transition/transitionState";

import "./RevealStack.css";

type StackTag = "div" | "ul" | "ol" | "dl" | "section" | "nav";

interface RevealStackProps {
  as?: StackTag;
  /** CSS selector for the staggered children. Defaults to direct
   *  children. Use this to skip non-stagger elements (e.g. headers)
   *  inside the wrapper. */
  childSelector?: string;
  /** Tweak when the observer fires. Default fires when the wrapper
   *  is 10% above the bottom of the viewport. */
  rootMargin?: string;
  /** Disable the reveal — useful when the stack lives inside an
   *  already-animated container. */
  reveal?: boolean;
  className?: string;
  children: ReactNode;
}

export default function RevealStack({
  as = "div",
  childSelector,
  rootMargin = "0px 0px -10% 0px",
  reveal = true,
  className,
  children,
}: RevealStackProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!reveal) return;
    const el = ref.current;
    if (!el) return;

    const items = childSelector
      ? Array.from(el.querySelectorAll<HTMLElement>(childSelector))
      : (Array.from(el.children) as HTMLElement[]);
    items.forEach((child, index) => {
      child.style.setProperty("--reveal-index", String(index));
    });

    let observer: IntersectionObserver | null = null;
    let cancelled = false;

    /* Defer observing until any in-flight page transition has
       ended. If the new page mounted behind the still-covering
       transition panel, the observer would otherwise fire
       immediately (the element IS in the viewport geometrically)
       and the reveal animation would play hidden. */
    awaitTransitionEnd().then(() => {
      if (cancelled) return;
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              el.classList.add("is-revealed");
              observer?.unobserve(el);
            }
          }
        },
        { threshold: 0, rootMargin },
      );
      observer.observe(el);
    });

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, [reveal, childSelector, rootMargin]);

  return createElement(
    as,
    {
      ref,
      className: `reveal-stack${className ? ` ${className}` : ""}${
        !reveal ? " is-revealed" : ""
      }`,
    },
    children,
  );
}
