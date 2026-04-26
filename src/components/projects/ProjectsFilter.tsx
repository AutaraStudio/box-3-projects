/**
 * ProjectsFilter
 * ==============
 * Sticky bar above the projects grid. Two groups:
 *
 *   ┌────────────────────────────────────────────────────────┐
 *   │  Grid · List          FILTER  All · Hospitality · …    │
 *   └────────────────────────────────────────────────────────┘
 *
 * Each group is a row of buttons; the active button carries a 1px
 * underline indicator. When the user picks a different option,
 * GSAP Flip captures both the OLD and NEW indicators (within that
 * group), the React re-render swaps which is visible, and Flip
 * animates the new one *from* the old one's position — the
 * underline morphs across the bar.
 *
 * The actual filter / mode behaviour (hide non-matching cards,
 * swap card layout) is handled by the parent ProjectsClient which
 * owns the activeSlug + mode state.
 */

"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";

import type { ProjectCategoryItem } from "@/sanity/queries/projects";

import "./ProjectsFilter.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(Flip);
}

export type ProjectsViewMode = "grid" | "list";

interface ProjectsFilterProps {
  categories: ProjectCategoryItem[];
  /** Empty string = "All". */
  activeSlug: string;
  /** Called when the user picks a category. */
  onCategoryChange: (slug: string) => void;
  mode: ProjectsViewMode;
  onModeChange: (mode: ProjectsViewMode) => void;
}

export default function ProjectsFilter({
  categories,
  activeSlug,
  onCategoryChange,
  mode,
  onModeChange,
}: ProjectsFilterProps) {
  return (
    <div className="projects-filter">
      <div className="container projects-filter__inner">
        <FilterGroup
          activeKey={mode}
          options={[
            { key: "grid", label: "Grid" },
            { key: "list", label: "List" },
          ]}
          onSelect={(k) => onModeChange(k as ProjectsViewMode)}
        />
        <FilterGroup
          activeKey={activeSlug}
          legend="Filter"
          options={[
            { key: "", label: "All" },
            ...categories.map((c) => ({
              key: c.slug,
              label: c.title,
              count: c.count,
            })),
          ]}
          onSelect={onCategoryChange}
        />
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
   FilterGroup
   --------------------------------------------------------------------------
   One row of tabs with a morphing underline. Each instance manages
   its own Flip animation when its activeKey changes — scoped to the
   group's ref so the mode group's indicator never tries to morph
   into the category group's. */

interface FilterOption {
  key: string;
  label: string;
  count?: number;
}

function FilterGroup({
  activeKey,
  options,
  legend,
  onSelect,
}: {
  activeKey: string;
  options: FilterOption[];
  legend?: string;
  onSelect: (key: string) => void;
}) {
  const groupRef = useRef<HTMLDivElement>(null);
  const prevKeyRef = useRef(activeKey);

  useEffect(() => {
    const prev = prevKeyRef.current;
    if (prev === activeKey) return;
    const group = groupRef.current;
    if (!group) return;

    const oldEl = group.querySelector<HTMLElement>(
      `[data-tab-indicator="${cssEscape(prev)}"]`,
    );
    const newEl = group.querySelector<HTMLElement>(
      `[data-tab-indicator="${cssEscape(activeKey)}"]`,
    );

    if (oldEl && newEl) {
      const state = Flip.getState([oldEl, newEl]);
      requestAnimationFrame(() => {
        Flip.from(state, {
          absolute: true,
          scale: true,
          duration: 0.5,
          ease: "expo.inOut",
        });
      });
    }

    prevKeyRef.current = activeKey;
  }, [activeKey]);

  return (
    <div className="projects-filter__group" ref={groupRef}>
      {legend ? (
        <p className="projects-filter__legend text-small text-caps">
          {legend}
        </p>
      ) : null}
      <div className="projects-filter__tabs">
        {options.map((opt) => {
          const padded =
            opt.count !== undefined
              ? String(opt.count).padStart(3, "0")
              : null;
          const active = activeKey === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              className={`projects-filter__tab text-large${active ? " is-active" : ""}`}
              onClick={() => onSelect(opt.key)}
              aria-pressed={active}
            >
              <span
                className="projects-filter__indicator"
                data-tab-indicator={opt.key}
                aria-hidden="true"
              />
              <span className="projects-filter__label">
                {opt.label}
                {padded ? (
                  <sup className="projects-filter__count text-small">
                    ({padded})
                  </sup>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* CSS.escape isn't available in older runtimes; handle the empty
   string case ourselves and fall through to the native impl. */
function cssEscape(value: string): string {
  if (value === "") return "";
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }
  return value.replace(/(["\\])/g, "\\$1");
}
