/**
 * Heading
 * =======
 * Semantic heading tag + SplitText reveal-on-scroll, in one component.
 *
 *   <Heading as="h1" className="text-display">Projects</Heading>
 *   <Heading as="h3">Project team</Heading>
 *
 * The reveal uses the existing SplitText machinery — `revealOnScroll`
 * is on by default, so any heading rendered in the viewport reveals
 * on mount, and any heading below the fold reveals as it scrolls
 * into view. The IntersectionObserver fires once and unobserves,
 * so a heading never re-animates on subsequent scrolls.
 *
 * Props:
 *   as       — semantic level (h1–h6). Defaults to h2.
 *   asWords  — split on word boundaries (default) or per-character.
 *              Words feel right for most headings; per-char is too
 *              busy at display sizes. Override with `asWords={false}`
 *              for short single-word headings where you want the
 *              char stagger.
 *   reveal   — opt out of the reveal animation if the heading sits
 *              inside something else that already animates (or for
 *              hero copy that should be static).
 *   className — utility classes (`text-display`, `text-h2`, etc.).
 */

"use client";

import { createElement } from "react";

import SplitText from "@/components/split-text/SplitText";

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

interface HeadingProps {
  as?: HeadingTag;
  className?: string;
  asWords?: boolean;
  reveal?: boolean;
  children: string;
}

export default function Heading({
  as = "h2",
  className,
  asWords = true,
  reveal = true,
  children,
}: HeadingProps) {
  const inner = reveal ? (
    <SplitText asWords={asWords} revealOnScroll>
      {children}
    </SplitText>
  ) : (
    children
  );
  return createElement(as, { className }, inner);
}
