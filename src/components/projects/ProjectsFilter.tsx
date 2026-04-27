/**
 * ProjectsFilter
 * ==============
 * Sticky bar above the projects grid. Two groups laid out on a
 * 12-col grid that mirrors the editorial reference:
 *
 *   ┌──────┬─────────────┬──────┬───────────────────────────┐
 *   │      │ Grid · List │      │ FILTER · All · Hospi… …   │
 *   │ col1 │ cols 2–4    │ 5–6  │ cols 7–12                 │
 *   └──────┴─────────────┴──────┴───────────────────────────┘
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

import { type ReactNode, useEffect, useRef } from "react";
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
          className="projects-filter__group--mode"
          activeKey={mode}
          options={[
            { key: "grid", label: "Grid", icon: <GridIcon /> },
            { key: "list", label: "List", icon: <ListIcon /> },
          ]}
          onSelect={(k) => onModeChange(k as ProjectsViewMode)}
        />
        <FilterGroup
          className="projects-filter__group--category"
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
  icon?: ReactNode;
}

function FilterGroup({
  activeKey,
  options,
  legend,
  onSelect,
  className,
}: {
  activeKey: string;
  options: FilterOption[];
  legend?: string;
  onSelect: (key: string) => void;
  className?: string;
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
    <div
      className={`projects-filter__group${className ? " " + className : ""}`}
      ref={groupRef}
    >
      {legend ? (
        <p className="projects-filter__legend text-main">{legend}</p>
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
              className={`projects-filter__tab text-main${active ? " is-active" : ""}`}
              onClick={() => onSelect(opt.key)}
              aria-pressed={active}
            >
              <span
                className="projects-filter__indicator"
                data-tab-indicator={opt.key}
                aria-hidden="true"
              />
              <span className="projects-filter__label">
                {opt.icon ? (
                  <span
                    className="projects-filter__icon"
                    aria-hidden="true"
                  >
                    {opt.icon}
                  </span>
                ) : null}
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

/* --------------------------------------------------------------------------
   Mode-toggle icons — small currentColor SVGs sized to ride the
   text baseline of the tab label.
   -------------------------------------------------------------------------- */

function GridIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="currentColor"
      role="img"
      aria-label="Grid view"
    >
      <rect x="0" y="0" width="6" height="6" />
      <rect x="8" y="0" width="6" height="6" />
      <rect x="0" y="8" width="6" height="6" />
      <rect x="8" y="8" width="6" height="6" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="currentColor"
      role="img"
      aria-label="List view"
    >
      <rect x="0" y="2" width="14" height="1.5" />
      <rect x="0" y="6.25" width="14" height="1.5" />
      <rect x="0" y="10.5" width="14" height="1.5" />
    </svg>
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
