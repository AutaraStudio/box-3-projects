/**
 * ProjectsClient
 * ==============
 * Client wrapper that owns the filter (`activeSlug`) and view-mode
 * (`mode`) state for the projects index.
 *
 * Both the grid and the list views render side-by-side in the DOM —
 * one is `display: none` based on `data-mode` on the wrapper. Mode
 * changes use a fade-out/fade-in transition (Vue out-in style)
 * rather than a Flip layout morph because the two views have
 * fundamentally different DOM structures.
 *
 * Filter behaviour is mode-aware:
 *   - Grid: cards regroup into the alternating pair/wide pattern
 *           and Flip animates the layout diff.
 *   - List: rows stay rendered but flip to inactive (greyscale +
 *           reduced opacity + no pointer events) when they don't
 *           match the active filter. No layout change.
 */

"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";

import ProjectsFilter, {
  type ProjectsViewMode,
} from "./ProjectsFilter";
import ProjectsGrid from "./ProjectsGrid";
import ProjectsList from "./ProjectsList";
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
  const gridViewRef = useRef<HTMLDivElement>(null);
  const listViewRef = useRef<HTMLDivElement>(null);
  const modeAnimating = useRef(false);

  /* Grid receives a pre-filtered list — non-matching cards are
     removed from the DOM, layout regroups around what remains.
     List always receives the full set; per-row .is-active toggles
     greyscale for non-matching items. */
  const gridProjects = activeSlug
    ? projects.filter((p) => p.category?.slug === activeSlug)
    : projects;

  const handleCategoryChange = (slug: string) => {
    if (slug === activeSlug) return;
    /* Capture grid state for the Flip morph — only useful in grid
       mode. List mode handles filter changes via CSS class swap. */
    if (mode === "grid" && typeof window !== "undefined") {
      flipState.current = Flip.getState(".project-card-wrap", {
        props: "opacity",
      });
    }
    setActiveSlug(slug);
  };

  const handleModeChange = (next: ProjectsViewMode) => {
    if (next === mode || modeAnimating.current) return;

    /* Out-in fade — fade current view, swap, fade in new. Each
       view renders independently so a layout morph wouldn't make
       sense; the fade reads as a clean view swap. */
    const outEl =
      mode === "grid" ? gridViewRef.current : listViewRef.current;
    const inEl =
      next === "grid" ? gridViewRef.current : listViewRef.current;
    if (!outEl || !inEl) {
      setMode(next);
      return;
    }

    modeAnimating.current = true;
    gsap
      .timeline({
        onComplete: () => {
          modeAnimating.current = false;
        },
      })
      .to(outEl, { opacity: 0, duration: 0.3, ease: "power2.out" })
      .add(() => {
        setMode(next);
        gsap.set(outEl, { opacity: 1 });
        gsap.set(inEl, { opacity: 0 });
      })
      .to(inEl, { opacity: 1, duration: 0.4, ease: "power2.out" });
  };

  /* Flip morph for filter changes in grid mode. Skipped in list
     mode (no layout change to animate). */
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
  }, [activeSlug]);

  /* Page-enter animation — runs once on mount.
       hero-title:        from x: 10vw, autoAlpha 0 (1.2s power4.out)
       filter group:      autoAlpha 0 → 1 (0.4s ease none, t=0)
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
      <aside className="projects-content__filter-aside">
        <ProjectsFilter
          categories={categories}
          activeSlug={activeSlug}
          onCategoryChange={handleCategoryChange}
          mode={mode}
          onModeChange={handleModeChange}
        />
      </aside>

      <div
        ref={gridViewRef}
        className="projects-view"
        data-active={mode === "grid"}
      >
        <ProjectsGrid projects={gridProjects} />
      </div>

      <div
        ref={listViewRef}
        className="projects-view"
        data-active={mode === "list"}
      >
        <ProjectsList projects={projects} activeSlug={activeSlug} />
      </div>
    </div>
  );
}
