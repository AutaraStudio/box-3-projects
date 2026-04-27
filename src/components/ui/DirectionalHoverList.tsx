/**
 * DirectionalHoverList
 * ====================
 * Reusable list primitive that ships a "directional hover tile":
 * on `mouseenter`, a tile slides in from the edge the cursor
 * crossed; on `mouseleave`, it slides out the way the cursor left.
 *
 * The primitive is layout-agnostic on purpose. Consumers compose
 * their own row content (columns, typography, images) inside
 * <DirectionalHoverItem>; this file only owns:
 *   - The list wrapper + bottom hairline.
 *   - Each item's hover-tile + top hairline.
 *   - The `mouseenter` / `mouseleave` direction maths.
 *
 * Adapted from a Webflow Osmo snippet. Translated to v2:
 *   - All colours via `--theme-*` tokens (tile uses
 *     `--theme-hover-bg`).
 *   - All spacing/typography via the existing utility scale —
 *     consumers decide their own row padding + col widths.
 *   - Hover handlers live on the React tree, scoped per-row, so
 *     mounting/unmounting cleans up automatically.
 *
 * Usage:
 *   <DirectionalHoverList axis="y" header={<Header />}>
 *     <DirectionalHoverItem href="/projects/foo" pageName="Foo">
 *       <span>N°001</span>
 *       <span>Project Foo</span>
 *       <span>2024</span>
 *     </DirectionalHoverItem>
 *   </DirectionalHoverList>
 *
 * Props:
 *   axis="y"   — vertical-only (top/bottom). Use for stacked rows.
 *   axis="x"   — horizontal-only (left/right). Use for inline rows.
 *   axis="all" — picks the closest of all 4 edges. Default.
 */

"use client";

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";

import TransitionLink from "@/components/transition/TransitionLink";

import "./DirectionalHoverList.css";

/* ── Reduced-motion gate ─────────────────────────────────────── */

/** Returns the user's current `prefers-reduced-motion` setting,
 *  re-rendering the component if the user toggles it. We read on
 *  mount so SSR sees `false` (no a11y media query available) and
 *  hydration matches; the effect then flips it if needed. */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mql.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/* ── Direction maths ─────────────────────────────────────────── */

type Axis = "y" | "x" | "all";
type Direction = "top" | "right" | "bottom" | "left";

/* Off-screen position for each direction — the tile snaps to one
   of these on enter/leave. translate3d to keep the GPU happy. */
const OFFSCREEN: Record<Direction, string> = {
  top: "translate3d(0, -100%, 0)",
  bottom: "translate3d(0, 100%, 0)",
  left: "translate3d(-100%, 0, 0)",
  right: "translate3d(100%, 0, 0)",
};

/** Given a mouse event + the row element, work out which edge the
 *  cursor crossed. For `axis="y"` we only care about top/bottom;
 *  same for `x`; `all` picks the closest of the four. */
function getDirection(
  event: ReactMouseEvent,
  el: HTMLElement,
  axis: Axis,
): Direction {
  const rect = el.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const w = rect.width;
  const h = rect.height;

  if (axis === "y") return y < h / 2 ? "top" : "bottom";
  if (axis === "x") return x < w / 2 ? "left" : "right";

  const distances: Record<Direction, number> = {
    top: y,
    right: w - x,
    bottom: h - y,
    left: x,
  };
  return (Object.entries(distances) as [Direction, number][]).reduce(
    (a, b) => (a[1] < b[1] ? a : b),
  )[0];
}

/* ── Hook (for bespoke row layouts) ──────────────────────────── */

interface UseDirectionalHoverOptions {
  axis?: Axis;
  /** When true, all handlers no-op. Hook this up to filter/disabled
   *  states so the tile doesn't fire on rows that aren't clickable. */
  disabled?: boolean;
}

interface UseDirectionalHoverResult<I extends HTMLElement> {
  itemRef: (node: I | null) => void;
  tileRef: (node: HTMLElement | null) => void;
  onMouseEnter: (event: ReactMouseEvent<I>) => void;
  onMouseLeave: (event: ReactMouseEvent<I>) => void;
}

/** Bring-your-own-markup variant. Drop the `tileRef` element
 *  somewhere inside your row, attach the handlers + `itemRef` to
 *  the row's root. Useful for retrofitting an existing list whose
 *  internal layout is already bespoke (e.g. a 12-col grid with an
 *  image cell). */
export function useDirectionalHover<I extends HTMLElement = HTMLElement>(
  options: UseDirectionalHoverOptions = {},
): UseDirectionalHoverResult<I> {
  const { axis: axisOverride, disabled } = options;
  const itemEl = useRef<I | null>(null);
  const tileEl = useRef<HTMLElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  return {
    itemRef: (node) => {
      itemEl.current = node;
    },
    tileRef: (node) => {
      tileEl.current = node;
    },
    onMouseEnter(event) {
      if (disabled || reducedMotion) return;
      const item = itemEl.current;
      const tile = tileEl.current;
      if (!item || !tile) return;
      const dir = getDirection(event, item, resolveAxis(item, axisOverride));
      tile.style.transition = "none";
      tile.style.transform = OFFSCREEN[dir];
      void tile.offsetHeight;
      tile.style.transition = "";
      tile.style.transform = "translate3d(0, 0, 0)";
    },
    onMouseLeave(event) {
      if (disabled || reducedMotion) return;
      const item = itemEl.current;
      const tile = tileEl.current;
      if (!item || !tile) return;
      const dir = getDirection(event, item, resolveAxis(item, axisOverride));
      tile.style.transform = OFFSCREEN[dir];
    },
  };
}

/* ── List wrapper ────────────────────────────────────────────── */

interface DirectionalHoverListProps {
  /** Axis applied to every item inside this list. */
  axis?: Axis;
  /** Optional header row rendered above the items. Use for column
   *  labels (e.g. "Award · Client · Year"). */
  header?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function DirectionalHoverList({
  axis = "y",
  header,
  className,
  children,
}: DirectionalHoverListProps) {
  return (
    <div
      className={`dhover-list${className ? ` ${className}` : ""}`}
      data-axis={axis}
    >
      {header ? (
        <div className="dhover-list__header">{header}</div>
      ) : null}
      <ul className="dhover-list__items">{children}</ul>
      {/* Bottom hairline closes the run — top hairlines on each
          row handle the rest of the rule lines. */}
      <span className="dhover-list__rule" aria-hidden="true" />
    </div>
  );
}

/* ── Item ────────────────────────────────────────────────────── */

interface BaseItemProps {
  /** Override the list-level axis for a single row. Rare. */
  axis?: Axis;
  className?: string;
  children: ReactNode;
}

interface AnchorItemProps extends BaseItemProps {
  /** Internal route — routes through <TransitionLink>. */
  href: string;
  /** Hint name forwarded to the page-transition overlay. */
  pageName?: string;
  external?: false;
  target?: never;
  rel?: never;
}

interface ExternalItemProps extends BaseItemProps {
  href: string;
  external: true;
  target?: "_blank" | "_self";
  rel?: string;
  pageName?: never;
}

interface StaticItemProps extends BaseItemProps {
  href?: never;
  external?: never;
  target?: never;
  rel?: never;
  pageName?: never;
}

type DirectionalHoverItemProps =
  | AnchorItemProps
  | ExternalItemProps
  | StaticItemProps;

function resolveAxis(el: HTMLElement | null, override?: Axis): Axis {
  if (override) return override;
  const list = el?.closest("[data-axis]") as HTMLElement | null;
  const value = list?.dataset.axis;
  if (value === "y" || value === "x" || value === "all") return value;
  return "y";
}

export function DirectionalHoverItem(props: DirectionalHoverItemProps) {
  const { axis: axisOverride, className, children } = props;

  const itemRef = useRef<HTMLLIElement | null>(null);
  const tileRef = useRef<HTMLSpanElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  function handleEnter(event: ReactMouseEvent<HTMLLIElement>) {
    if (reducedMotion) return;
    const item = itemRef.current;
    const tile = tileRef.current;
    if (!item || !tile) return;
    const dir = getDirection(event, item, resolveAxis(item, axisOverride));
    /* Snap the tile off-screen in the entry direction WITHOUT a
       transition, then re-enable transitions on the next frame
       and slide to centre. The `void offsetHeight` forces a
       layout flush so the second transform is treated as a new
       animation, not just a continuation. */
    tile.style.transition = "none";
    tile.style.transform = OFFSCREEN[dir];
    void tile.offsetHeight;
    tile.style.transition = "";
    tile.style.transform = "translate3d(0, 0, 0)";
  }

  function handleLeave(event: ReactMouseEvent<HTMLLIElement>) {
    if (reducedMotion) return;
    const item = itemRef.current;
    const tile = tileRef.current;
    if (!item || !tile) return;
    const dir = getDirection(event, item, resolveAxis(item, axisOverride));
    /* Leave keeps the existing transition so the tile slides
       smoothly off in the exit direction. */
    tile.style.transform = OFFSCREEN[dir];
  }

  /* The <li> is the hover target (its rect is what `getDirection`
     measures); the link/static element sits on top of the tile +
     rule via z-index from the CSS. */
  const tile = (
    <span
      ref={tileRef}
      className="dhover-list__tile"
      aria-hidden="true"
    />
  );
  const rule = (
    <span
      className="dhover-list__rule dhover-list__rule--top"
      aria-hidden="true"
    />
  );

  const contentClass = `dhover-list__content${className ? ` ${className}` : ""}`;

  /* Internal link — routes through TransitionLink. */
  if ("href" in props && props.href && !("external" in props && props.external)) {
    const internal = props as AnchorItemProps;
    return (
      <li
        ref={itemRef}
        className="dhover-list__item"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        {tile}
        {rule}
        <TransitionLink
          href={internal.href}
          pageName={internal.pageName}
          className={contentClass}
        >
          {children}
        </TransitionLink>
      </li>
    );
  }

  /* External link — plain anchor with safe rel defaults. */
  if ("href" in props && props.href) {
    const ext = props as ExternalItemProps;
    return (
      <li
        ref={itemRef}
        className="dhover-list__item"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        {tile}
        {rule}
        <a
          href={ext.href}
          target={ext.target}
          rel={ext.rel ?? (ext.target === "_blank" ? "noopener noreferrer" : undefined)}
          className={contentClass}
        >
          {children}
        </a>
      </li>
    );
  }

  /* Static row — no link, just the affordance + content. Use
     when the row is informational but you still want the
     directional tile sweep on hover. Wraps in a <div> rather
     than a <span> so consumers can put block-level content
     (paragraphs, headings) inside the row without invalid HTML. */
  return (
    <li
      ref={itemRef}
      className="dhover-list__item"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {tile}
      {rule}
      <div className={contentClass}>{children}</div>
    </li>
  );
}
