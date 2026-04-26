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
 * No JS animation runs — everything is CSS transitions driven by the
 * hover state on a parent carrying the `.link` class. See
 * SplitText.css for the hover behaviour.
 *
 * Usage:
 *   <a href="/about" className="link">
 *     <SplitText>About</SplitText>
 *   </a>
 */

import type { CSSProperties } from "react";
import "./SplitText.css";

interface SplitTextProps {
  children: string;
  /** Split on word boundaries instead of characters. Use for long
      phrases where a per-char stagger would feel chaotic. */
  asWords?: boolean;
}

export default function SplitText({
  children,
  asWords = false,
}: SplitTextProps) {
  const text = children;
  const tokens = asWords
    ? text.split(/(\s+)/).filter(Boolean)
    : Array.from(text);

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
          {token === " " ? " " : token}
        </span>
      );
    });

  return (
    <span className="split" aria-label={text}>
      <span className="split__text" aria-hidden="true">
        <span className="split__mask">{renderTokens()}</span>
      </span>
      <span className="split__text split__text--clone" aria-hidden="true">
        <span className="split__mask">{renderTokens()}</span>
      </span>
    </span>
  );
}
