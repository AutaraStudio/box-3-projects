/**
 * ProjectsFilter
 * ==============
 * Sticky bar above the projects grid. Renders an "All" tab plus one
 * tab per Sanity `projectCategory`, with the per-category project
 * count shown as a small "(NNN)" superscript.
 *
 * The active tab carries an underline indicator (`.projects-filter__indicator`).
 * When the user picks a different tab, GSAP Flip captures the
 * indicator's old + new positions, the React re-render swaps which
 * indicator is visible, and Flip animates the new one *from* the
 * old one's position — the underline morphs across the bar.
 *
 * The actual filter behaviour (hide non-matching cards, animate
 * card layout) is handled by the parent ProjectsClient which owns
 * the activeSlug state.
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

interface ProjectsFilterProps {
  categories: ProjectCategoryItem[];
  /** Empty string = "All". */
  activeSlug: string;
  /** Called when the user picks a category. */
  onChange: (slug: string) => void;
}

export default function ProjectsFilter({
  categories,
  activeSlug,
  onChange,
}: ProjectsFilterProps) {
  const formRef = useRef<HTMLDivElement>(null);
  const prevSlugRef = useRef(activeSlug);

  /* When activeSlug changes, find the OLD indicator and the NEW one
     and Flip the new one from the old one's position. The CSS
     handles which indicator is currently visible (.is-active). */
  useEffect(() => {
    const prev = prevSlugRef.current;
    if (prev === activeSlug) return;
    const form = formRef.current;
    if (!form) return;

    const oldEl = form.querySelector<HTMLElement>(
      `[data-tab-indicator="${cssEscape(prev)}"]`,
    );
    const newEl = form.querySelector<HTMLElement>(
      `[data-tab-indicator="${cssEscape(activeSlug)}"]`,
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

    prevSlugRef.current = activeSlug;
  }, [activeSlug]);

  return (
    <div className="projects-filter">
      <div className="container projects-filter__inner" ref={formRef}>
        <p className="projects-filter__legend text-small text-caps">Filter</p>
        <div className="projects-filter__tabs">
          <FilterTab
            slug=""
            label="All"
            active={activeSlug === ""}
            onSelect={onChange}
          />
          {categories.map((cat) => (
            <FilterTab
              key={cat._id}
              slug={cat.slug}
              label={cat.title}
              count={cat.count}
              active={activeSlug === cat.slug}
              onSelect={onChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface FilterTabProps {
  slug: string;
  label: string;
  count?: number;
  active: boolean;
  onSelect: (slug: string) => void;
}

function FilterTab({ slug, label, count, active, onSelect }: FilterTabProps) {
  const padded = count !== undefined ? String(count).padStart(3, "0") : null;
  return (
    <button
      type="button"
      className={`projects-filter__tab text-large${active ? " is-active" : ""}`}
      onClick={() => onSelect(slug)}
      aria-pressed={active}
    >
      <span
        className="projects-filter__indicator"
        data-tab-indicator={slug}
        aria-hidden="true"
      />
      <span className="projects-filter__label">
        {label}
        {padded ? (
          <sup className="projects-filter__count text-small">({padded})</sup>
        ) : null}
      </span>
    </button>
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
