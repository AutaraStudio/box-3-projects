/**
 * splitLines
 * ==========
 * Shared post-layout line-split helper. Used by any component that
 * wants to animate text as horizontal masked reveals without
 * pre-computing line breaks (which drifts when fonts load or the
 * viewport resizes).
 *
 * Usage:
 *   1. Render the source text as inline word spans carrying the
 *      `[data-word]` attribute (see `toWordTokens` for shape).
 *   2. After `document.fonts.ready`, call `splitByRenderedLines(el,
 *      maskClass, splitClass)`. It groups word spans by their
 *      rendered `offsetTop`, wraps each group in a mask/split pair,
 *      and returns the new `.split` elements for GSAP to target.
 *
 * The mask should be `display: block; overflow: clip`; the split
 * should be `display: block` with a tiny negative margin-bottom +
 * matching padding-bottom so descenders aren't clipped by the mask
 * (see TestimonialsSection.css / HomeIntro.css).
 */

export interface WordToken {
  word: string;
  trailingSpace: boolean;
}

/** Split a string into word tokens with trailing-space metadata. */
export function toWordTokens(text: string): WordToken[] {
  const parts = text.split(/\s+/).filter(Boolean);
  return parts.map((word, i) => ({
    word,
    trailingSpace: i < parts.length - 1,
  }));
}

/** Groups `[data-word]` spans inside `root` by their rendered
 *  `offsetTop`, wraps each group in a `<span class={maskClass}><span
 *  class={splitClass}>…</span></span>`, and replaces `root`'s
 *  children with the new structure. Returns the new `.split`
 *  elements so callers can drive GSAP against them. */
export function splitByRenderedLines(
  root: HTMLElement,
  maskClass: string,
  splitClass: string,
): HTMLElement[] {
  const wordEls = Array.from(root.querySelectorAll<HTMLElement>("[data-word]"));
  if (wordEls.length === 0) return [];

  const lines: HTMLElement[][] = [];
  let current: HTMLElement[] = [];
  let currentTop: number | null = null;

  for (const el of wordEls) {
    const top = el.offsetTop;
    if (currentTop === null || Math.abs(top - currentTop) < 2) {
      current.push(el);
      currentTop = top;
    } else {
      if (current.length) lines.push(current);
      current = [el];
      currentTop = top;
    }
  }
  if (current.length) lines.push(current);

  const splits: HTMLElement[] = [];
  const rebuilt = lines.map((line) => {
    const mask = document.createElement("span");
    mask.className = maskClass;
    const split = document.createElement("span");
    split.className = splitClass;
    for (const w of line) split.appendChild(w);
    mask.appendChild(split);
    splits.push(split);
    return mask;
  });

  root.replaceChildren(...rebuilt);
  return splits;
}
