/**
 * ProjectsClient
 * ==============
 * Client-side wrapper for the projects listing. Owns:
 *   - `activeSlug`  — which category filter is selected
 *   - `mode`        — grid (alternating pair / wide) vs list
 *
 * Both interactions follow the same Flip pattern:
 *   1. User clicks → state captured BEFORE setState via
 *      Flip.getState(allCardWraps).
 *   2. setState triggers a re-render — ProjectsGrid regroups the
 *      visible cards (filter) and the data-mode attribute on the
 *      wrapper toggles which CSS layout applies.
 *   3. useLayoutEffect fires after the DOM updates; Flip.from
 *      animates the position diff and onEnter / onLeave handle
 *      cards added or removed by the filter.
 */

"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";

import ProjectsFilter, {
  type ProjectsViewMode,
} from "./ProjectsFilter";
import ProjectsGrid from "./ProjectsGrid";
import type {
  ProjectCategoryItem,
  ProjectListItem,
} from "@/sanity/queries/projects";

if (typeof window !== "undefined") {
  gsap.registerPlugin(Flip);
}

interface ProjectsClientProps {
  projects: ProjectListItem[];
  categories: ProjectCategoryItem[];
}

export default function ProjectsClient({
  projects,
  categories,
}: ProjectsClientProps) {
  const [activeSlug, setActiveSlug] = useState("");
  const [mode, setMode] = useState<ProjectsViewMode>("grid");
  const flipState = useRef<Flip.FlipState | null>(null);

  const filtered = activeSlug
    ? projects.filter((p) => p.category?.slug === activeSlug)
    : projects;

  /* Capture before setState — same pattern for category + mode
     changes since both move cards around. */
  const captureFlipState = () => {
    if (typeof window === "undefined") return;
    flipState.current = Flip.getState(".project-card-wrap", {
      props: "opacity",
    });
  };

  const handleCategoryChange = (slug: string) => {
    if (slug === activeSlug) return;
    captureFlipState();
    setActiveSlug(slug);
  };

  const handleModeChange = (next: ProjectsViewMode) => {
    if (next === mode) return;
    captureFlipState();
    setMode(next);
  };

  useLayoutEffect(() => {
    if (!flipState.current) return;
    Flip.from(flipState.current, {
      duration: 0.7,
      ease: "expo.inOut",
      absolute: false,
      nested: true,
      onEnter: (el) =>
        gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.4 }),
      onLeave: (el) => gsap.to(el, { opacity: 0, duration: 0.3 }),
    });
    flipState.current = null;
  }, [activeSlug, mode]);

  /* Page-enter animation — runs once on mount.
       hero-title: slides from x: 10vw, opacity 0 → 1 (1.2s power4.out)
       filter children: fade in (autoAlpha 0 → 1, 0.4s ease none)
     Direct port of B1z_zFWV.js's onEnter timeline. */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const tl = gsap.timeline({
      defaults: { duration: 1.2, ease: "power4.out" },
    });
    tl.from(".projects-hero__title", { x: "10vw", autoAlpha: 0 });
    tl.from(
      ".projects-filter__group",
      { autoAlpha: 0, ease: "none", duration: 0.4 },
      0,
    );
    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div className="projects-content">
      {/* Filter floats over the projects via an absolutely positioned
          aside — the bar inside is sticky and stays pinned at
          top: var(--space-6) as the user scrolls. The aside itself
          contributes no flow height so the cards start at the top
          of this container, exactly as the editorial reference does.
          pointer-events: none on the aside lets clicks reach the
          cards beneath; the bar inside re-enables interaction. */}
      <aside className="projects-content__filter-aside">
        <ProjectsFilter
          categories={categories}
          activeSlug={activeSlug}
          onCategoryChange={handleCategoryChange}
          mode={mode}
          onModeChange={handleModeChange}
        />
      </aside>
      <div data-mode={mode} className="projects-mode-wrap">
        <ProjectsGrid projects={filtered} />
      </div>
    </div>
  );
}
