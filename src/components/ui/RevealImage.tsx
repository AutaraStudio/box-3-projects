/**
 * RevealImage
 * ===========
 * Editorial mask reveal for images. The wrapper is clip-path
 * collapsed from the bottom edge so nothing is visible; on entry
 * the clip expands top-to-bottom and the image inside scales from
 * 1.06 → 1, giving the photograph a measured, intentional reveal.
 *
 * Same observer pattern as Heading / RevealStack: fires once,
 * unobserves, and waits for an in-flight page transition to end
 * before observing so the animation isn't burnt behind the
 * transition panel.
 *
 *   <RevealImage>
 *     <Image src="/foo.jpg" alt="…" width={1600} height={1067} />
 *   </RevealImage>
 *
 * The wrapper is `position: relative; overflow: hidden;` and the
 * direct child takes the transform — drop any `<Image>`, `<img>`,
 * or `<figure>` inside; the only requirement is a single direct
 * child element.
 */

"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

import { awaitTransitionEnd } from "@/components/transition/transitionState";

import "./RevealImage.css";

interface RevealImageProps {
  children: ReactNode;
  /** Disable the reveal — useful when the image lives inside an
   *  already-animated container. */
  reveal?: boolean;
  /** rootMargin override for the IntersectionObserver. */
  rootMargin?: string;
  className?: string;
  /** Inline style passthrough — used to forward CSS custom
   *  properties (e.g. `--ratio`) to consumers that drive the
   *  wrapper's aspect ratio from JSX. */
  style?: CSSProperties;
}

export default function RevealImage({
  children,
  reveal = true,
  rootMargin = "0px 0px -10% 0px",
  className,
  style,
}: RevealImageProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!reveal) return;
    const el = ref.current;
    if (!el) return;

    let observer: IntersectionObserver | null = null;
    let cancelled = false;

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
  }, [reveal, rootMargin]);

  return (
    <div
      ref={ref}
      className={`reveal-image${className ? ` ${className}` : ""}${
        !reveal ? " is-revealed" : ""
      }`}
      style={style}
    >
      {children}
    </div>
  );
}
