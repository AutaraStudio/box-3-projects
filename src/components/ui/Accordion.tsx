/**
 * Accordion — reusable disclosure list.
 *
 * Pattern: a stack of items separated by top/bottom hairlines. Only
 * one item can be open at a time — clicking a closed item opens it
 * and closes whichever was open before. Clicking the open item
 * closes it back to the collapsed state.
 *
 * The expand/collapse transition uses CSS Grid's
 * `grid-template-rows: 0fr → 1fr` trick, driven by GSAP so the
 * easing is consistent with the rest of the site's animation
 * tokens. The content fades in shortly after the row animation
 * begins so readers aren't staring at blank space while the row
 * grows.
 *
 * The plus / close icon is a single SVG that rotates 0° → 135°
 * when open (so the + becomes an ×). On hover it hints with a
 * 90° rotation.
 *
 * No "Learn more" affordance is rendered inside — each item is
 * just { label, content }. Content is rendered as plain text by
 * default; pass any ReactNode to render richer content.
 *
 * Usage:
 *   <Accordion
 *     items={[
 *       { key: "objective", label: "Objective", content: "…" },
 *       { key: "feedback",  label: "Client feedback", content: "…" },
 *     ]}
 *   />
 */

"use client";

import { useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";

import { useGSAP } from "@/hooks/useGSAP";
import { ease, duration } from "@/config/animations.config";

import "./Accordion.css";

/* ------------------------------------------------------------------
   Types
   ------------------------------------------------------------------ */

export interface AccordionItem {
  /** Stable key — used as React key and for the ARIA controls id. */
  key: string;
  /** Label on the title row. */
  label: string;
  /** Panel content. Text strings render inside a <p>; any other
   *  ReactNode renders as-is. */
  content: ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** Optional id prefix for the title / panel ARIA ids. */
  idPrefix?: string;
  /** Extra class on the root. */
  className?: string;
  /** Key of an item that should be open at mount. If omitted, all
   *  items start collapsed. Use this for "first item open by
   *  default" UX without requiring consumer state. */
  defaultOpenKey?: string;
}

/* ------------------------------------------------------------------
   Component
   ------------------------------------------------------------------ */

export function Accordion({
  items,
  idPrefix = "acc",
  className,
  defaultOpenKey,
}: AccordionProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [openKey, setOpenKey] = useState<string | null>(defaultOpenKey ?? null);

  /* Scope GSAP to the root so tweens are cleaned up on unmount.
     Also seed the initial open item's visual state — without a
     tween — so it's expanded at mount rather than flashing closed
     and waiting for a user click. */
  useGSAP(
    () => {
      if (!defaultOpenKey) return;
      const refs = itemRefs(defaultOpenKey);
      if (!refs) return;
      gsap.set(refs.panel, { gridTemplateRows: "1fr" });
      gsap.set(refs.inner, { opacity: 1 });
      gsap.set(refs.icon, { rotate: 135 });
    },
    { scope: rootRef, dependencies: [defaultOpenKey] },
  );

  function handleToggle(key: string) {
    const nextOpen = openKey === key ? null : key;

    /* Close the currently-open item first (if any, and not the one
       being clicked — which is handled by the nextOpen logic). */
    if (openKey && openKey !== key) collapseItem(openKey);
    if (openKey === key) collapseItem(key);
    else expandItem(key);

    setOpenKey(nextOpen);
  }

  function itemRefs(key: string) {
    const root = rootRef.current;
    if (!root) return null;
    const panel = root.querySelector<HTMLDivElement>(
      `[data-accordion-panel="${key}"]`,
    );
    const inner = root.querySelector<HTMLDivElement>(
      `[data-accordion-inner="${key}"]`,
    );
    const icon = root.querySelector<HTMLElement>(
      `[data-accordion-icon="${key}"]`,
    );
    if (!panel || !inner || !icon) return null;
    return { panel, inner, icon };
  }

  function expandItem(key: string) {
    const refs = itemRefs(key);
    if (!refs) return;
    gsap.to(refs.panel, {
      gridTemplateRows: "1fr",
      ease: ease.brand,
      duration: duration.slow,
    });
    gsap.to(refs.icon, {
      rotate: 135,
      ease: ease.brand,
      duration: duration.slow,
      overwrite: true,
    });
    gsap.fromTo(
      refs.inner,
      { opacity: 0 },
      {
        opacity: 1,
        ease: ease.brand,
        duration: duration.moderate,
        delay: duration.fast,
      },
    );
  }

  function collapseItem(key: string) {
    const refs = itemRefs(key);
    if (!refs) return;
    gsap.to(refs.panel, {
      gridTemplateRows: "0fr",
      ease: ease.brand,
      duration: duration.slow,
    });
    gsap.to(refs.icon, {
      rotate: 0,
      ease: ease.brand,
      duration: duration.slow,
      overwrite: true,
    });
    gsap.to(refs.inner, {
      opacity: 0,
      duration: duration.fast,
      ease: ease.brand,
    });
  }

  /* Hover hints — icon nudges to 90° on mouseenter unless the item
     is open or mid-animation. */
  function handleHoverEnter(key: string) {
    if (openKey === key) return;
    const refs = itemRefs(key);
    if (!refs) return;
    gsap.to(refs.icon, {
      rotate: 90,
      duration: duration.fast,
      ease: ease.brand,
      overwrite: true,
    });
  }

  function handleHoverLeave(key: string) {
    if (openKey === key) return;
    const refs = itemRefs(key);
    if (!refs) return;
    gsap.to(refs.icon, {
      rotate: 0,
      duration: duration.fast,
      ease: ease.brand,
      overwrite: true,
    });
  }

  return (
    <div
      ref={rootRef}
      className={`accordion${className ? ` ${className}` : ""}`}
    >
      {items.map((item) => {
        const isOpen = openKey === item.key;
        const titleId = `${idPrefix}-title-${item.key}`;
        const panelId = `${idPrefix}-panel-${item.key}`;
        return (
          <div key={item.key} className="accordion__item">
            <h5 className="accordion__heading">
              <button
                type="button"
                id={titleId}
                className="accordion__title font-primary text-h5 leading-snug tracking-snug"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => handleToggle(item.key)}
                onMouseEnter={() => handleHoverEnter(item.key)}
                onMouseLeave={() => handleHoverLeave(item.key)}
                onFocus={() => handleHoverEnter(item.key)}
                onBlur={() => handleHoverLeave(item.key)}
              >
                <span className="accordion__label">{item.label}</span>
                <span
                  className="accordion__icon"
                  data-accordion-icon={item.key}
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 18 18" fill="none">
                    <line
                      x1="9"
                      y1="1"
                      x2="9"
                      y2="17"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <line
                      x1="1"
                      y1="9"
                      x2="17"
                      y2="9"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                </span>
              </button>
            </h5>
            <div
              id={panelId}
              role="region"
              aria-labelledby={titleId}
              aria-hidden={!isOpen}
              className="accordion__panel"
              data-accordion-panel={item.key}
            >
              <div
                className="accordion__inner"
                data-accordion-inner={item.key}
              >
                <div className="accordion__body font-secondary text-text-md leading-snug">
                  {typeof item.content === "string" ? (
                    <p>{item.content}</p>
                  ) : (
                    item.content
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Accordion;
