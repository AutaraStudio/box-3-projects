/**
 * SplitText
 * =========
 * Wraps text in a paired-row structure for the editorial char (or
 * word) "roll-over" hover effect that the Osmo / Impronta references
 * use throughout. Renders:
 *
 *   <span class="split" aria-label="…">
 *     <span class="split__text" aria-hidden>
 *       <span class="split__mask">[char|word spans …]</span>
 *     </span>
 *     <span class="split__text split__text--clone" aria-hidden>
 *       <span class="split__mask">[char|word spans …]</span>
 *     </span>
 *   </span>
 *
 * Each char/word span carries `--index: N` inline so the parent
 * `.link` / `.button` hover rules can stagger the per-element
 * transition with `transition-delay: calc(var(--index) * 2.4ms)`.
 *
 * Two animation modes (independent — both can apply):
 *   - Hover:  CSS-driven via a `.link` ancestor (see SplitText.css)
 *   - Reveal: pass `revealOnScroll` to add `data-observe` and an
 *             IntersectionObserver that flips `is-inview` once the
 *             element crosses into the viewport. CSS handles the
 *             actual char/word slide-up via the per-token --index
 *             stagger.
 *
 * Usage:
 *   <a href="/about" className="link">
 *     <SplitText>About</SplitText>
 *   </a>
 *
 *   <h1>
 *     <SplitText revealOnScroll>Projects</SplitText>
 *   </h1>
 */

"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import "./SplitText.css";

interface SplitTextProps {
  children: string;
  /** Split on word boundaries instead of characters. Use for long
      phrases where a per-char stagger would feel chaotic. */
  asWords?: boolean;
  /** Reveal the chars / words on scroll-into-view rather than at
      mount. Adds `data-observe` and toggles `is-inview` on enter. */
  revealOnScroll?: boolean;
}

export default function SplitText({
  children,
  asWords = false,
  revealOnScroll = false,
}: SplitTextProps) {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const text = children;
  const tokens = asWords
    ? text.split(/(\s+)/).filter(Boolean)
    : Array.from(text);

  /* Scroll-reveal observer — only when opted in. Adds `is-inview`
     once any part of the element crosses the viewport bottom; the
     CSS transition handles the actual motion. Unobserves after the
     first hit so the reveal plays exactly once. */
  useEffect(() => {
    if (!revealOnScroll || typeof window === "undefined") return;
    const el = wrapperRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add("is-inview");
            observer.unobserve(el);
          }
        }
      },
      {
        threshold: 0,
        rootMargin: "0px 0px -10% 0px",
      },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [revealOnScroll]);

  /* One renderer used for both the visible row and the absolutely
     positioned clone — the per-token --index keeps the same stagger
     order on both sides. */
  const renderTokens = () =>
    tokens.map((token, i) => {
      if (asWords && /^\s+$/.test(token)) {
        return <span key={i}>{token}</span>;
      }
      const klass = asWords ? "word" : "char";
      return (
        <span
          key={i}
          className={klass}
          style={{ "--index": i } as CSSProperties}
        >
          {token === " " ? " " : token}
        </span>
      );
    });

  return (
    <span
      ref={wrapperRef}
      className="split"
      aria-label={text}
      data-observe={revealOnScroll ? "" : undefined}
    >
      <span className="split__text" aria-hidden="true">
        <span className="split__mask">{renderTokens()}</span>
      </span>
      <span className="split__text split__text--clone" aria-hidden="true">
        <span className="split__mask">{renderTokens()}</span>
      </span>
    </span>
  );
}
