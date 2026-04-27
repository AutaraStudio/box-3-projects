/**
 * Accordion
 * =========
 * Vertical list of disclosure items, ported from v1 to v2 tokens.
 *
 * Behaviour:
 *   - Only one item open at a time. Clicking the open item closes it.
 *   - Expand/collapse uses the CSS grid `grid-template-rows: 0fr → 1fr`
 *     trick driven by GSAP so we don't need a known content height.
 *   - The plus icon rotates 0° (closed) → 90° (hover hint) → 135°
 *     (open, so + becomes ×).
 *   - Inner content cross-fades shortly after the row begins to
 *     grow so the user isn't staring at empty space mid-expand.
 *
 * Usage:
 *   <Accordion
 *     idPrefix="project-client"
 *     defaultOpenKey="objective"
 *     items={[
 *       { key: "objective", label: "Objective", content: "…" },
 *       { key: "feedback",  label: "Client feedback", content: "…" },
 *     ]}
 *   />
 */

"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";

import "./Accordion.css";

const EASE = "cubic-bezier(0.19, 1, 0.22, 1)";
const DURATION_FAST = 0.2;
const DURATION_MODERATE = 0.4;
const DURATION_SLOW = 0.6;

export interface AccordionItem {
  key: string;
  label: string;
  /** Strings render inside a <p>; any other ReactNode renders as-is. */
  content: ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** ARIA id prefix for title / panel pairs. */
  idPrefix?: string;
  className?: string;
  /** Typography utility class applied to each item's title button.
   *  Defaults to `text-h5`; pass `text-main` etc. for compact use. */
  titleClassName?: string;
  /** Open this item at mount. Omit for fully-collapsed initial state. */
  defaultOpenKey?: string;
}

export default function Accordion({
  items,
  idPrefix = "acc",
  className,
  titleClassName = "text-h5",
  defaultOpenKey,
}: AccordionProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [openKey, setOpenKey] = useState<string | null>(
    defaultOpenKey ?? null,
  );

  /* Seed the default-open item visually at mount — no tween, just
     sets the row to 1fr so the panel is expanded on first paint. */
  useEffect(() => {
    if (!defaultOpenKey) return;
    const refs = itemRefs(defaultOpenKey);
    if (!refs) return;
    gsap.set(refs.panel, { gridTemplateRows: "1fr" });
    gsap.set(refs.inner, { opacity: 1 });
    gsap.set(refs.icon, { rotate: 135 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  function expand(key: string) {
    const refs = itemRefs(key);
    if (!refs) return;
    gsap.to(refs.panel, {
      gridTemplateRows: "1fr",
      ease: EASE,
      duration: DURATION_SLOW,
    });
    gsap.to(refs.icon, {
      rotate: 135,
      ease: EASE,
      duration: DURATION_SLOW,
      overwrite: true,
    });
    gsap.fromTo(
      refs.inner,
      { opacity: 0 },
      {
        opacity: 1,
        ease: EASE,
        duration: DURATION_MODERATE,
        delay: DURATION_FAST,
      },
    );
  }

  function collapse(key: string) {
    const refs = itemRefs(key);
    if (!refs) return;
    gsap.to(refs.panel, {
      gridTemplateRows: "0fr",
      ease: EASE,
      duration: DURATION_SLOW,
    });
    gsap.to(refs.icon, {
      rotate: 0,
      ease: EASE,
      duration: DURATION_SLOW,
      overwrite: true,
    });
    gsap.to(refs.inner, {
      opacity: 0,
      duration: DURATION_FAST,
      ease: EASE,
    });
  }

  function handleToggle(key: string) {
    const next = openKey === key ? null : key;
    if (openKey && openKey !== key) collapse(openKey);
    if (openKey === key) collapse(key);
    else expand(key);
    setOpenKey(next);
  }

  /* Hover hint — icon nudges to 90° on enter unless the item is
     already open. */
  function hintIn(key: string) {
    if (openKey === key) return;
    const refs = itemRefs(key);
    if (!refs) return;
    gsap.to(refs.icon, {
      rotate: 90,
      duration: DURATION_FAST,
      ease: EASE,
      overwrite: true,
    });
  }

  function hintOut(key: string) {
    if (openKey === key) return;
    const refs = itemRefs(key);
    if (!refs) return;
    gsap.to(refs.icon, {
      rotate: 0,
      duration: DURATION_FAST,
      ease: EASE,
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
                className={`accordion__title ${titleClassName}`}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => handleToggle(item.key)}
                onMouseEnter={() => hintIn(item.key)}
                onMouseLeave={() => hintOut(item.key)}
                onFocus={() => hintIn(item.key)}
                onBlur={() => hintOut(item.key)}
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
                <div className="accordion__body text-large">
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
