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

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

import { awaitTransitionEnd } from "@/components/transition/transitionState";

import "./SplitText.css";

/* A regular U+0020 space inside an `inline-block` char span can
   collapse to zero width depending on surrounding whitespace.
   We swap any whitespace-only char for a non-breaking space
   (U+00A0) so the gap between words stays visible when text is
   split per-char. Word-mode keeps the original whitespace so
   line-wrap behaviour stays natural. */
const NBSP = " ";

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
     first hit so the reveal plays exactly once.
     Defers observing until any in-flight page transition has
     ended — otherwise the chars reveal behind the still-covering
     transition panel and the animation is invisible to the user. */
  useEffect(() => {
    if (!revealOnScroll || typeof window === "undefined") return;
    const el = wrapperRef.current;
    if (!el) return;

    let observer: IntersectionObserver | null = null;
    let cancelled = false;

    awaitTransitionEnd().then(() => {
      if (cancelled) return;
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              el.classList.add("is-inview");
              observer?.unobserve(el);
            }
          }
        },
        {
          threshold: 0,
          rootMargin: "0px 0px -10% 0px",
        },
      );
      observer.observe(el);
    });

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, [revealOnScroll]);

  /* One renderer used for both the visible row and the absolutely
     positioned clone — the per-token --index keeps the same stagger
     order on both sides.
     Two-span structure (outer + __inner): the outer is the per-
     token shell (positioning + index var); the inner is the
     element that gets translated by the hover / reveal rules.
     Per-word masking is applied via CSS to `.word` only; chars rely
     on the outer .split__mask for vertical clipping (see CSS).
     CHAR-MODE LINE-BREAK FIX: each `.char` is `display: inline-
     block`, and the browser treats every inline-block boundary as
     a valid break opportunity — so without grouping, char-mode
     headings can break between any two adjacent characters within
     a word ("re-used" snapping to "r" + "e-used"). We wrap each
     run of non-whitespace chars in a `.char-group` (inline-block,
     white-space: nowrap) so the browser only breaks at the
     whitespace tokens between groups, never inside a word. */
  const renderTokens = (): ReactNode[] => {
    if (asWords) {
      return tokens.map((token, i) => {
        if (/^\s+$/.test(token)) {
          return <span key={i}>{token}</span>;
        }
        return (
          <span
            key={i}
            className="word"
            style={{ "--index": i } as CSSProperties}
          >
            <span className="word__inner">{token}</span>
          </span>
        );
      });
    }

    /* Char mode — group consecutive chars per word so line-breaks
       can only occur at whitespace, never mid-word. */
    const out: ReactNode[] = [];
    let group: { char: string; idx: number }[] = [];

    const flushGroup = (key: string) => {
      if (group.length === 0) return;
      out.push(
        <span key={key} className="char-group">
          {group.map((c) => (
            <span
              key={c.idx}
              className="char"
              style={{ "--index": c.idx } as CSSProperties}
            >
              <span className="char__inner">{c.char}</span>
            </span>
          ))}
        </span>,
      );
      group = [];
    };

    tokens.forEach((char, i) => {
      if (/\s/.test(char)) {
        /* Flush whatever non-whitespace chars came before, then
           emit the whitespace as a plain text node — a regular
           space (not NBSP) so the browser treats this position
           as a valid break opportunity between word groups. */
        flushGroup(`g-${i}`);
        out.push(<span key={`s-${i}`}>{char}</span>);
      } else {
        group.push({ char, idx: i });
      }
    });
    flushGroup("g-end");

    return out;
  };

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
