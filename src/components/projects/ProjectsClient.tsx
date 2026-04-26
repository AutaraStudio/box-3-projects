/**
 * ProjectsClient
 * ==============
 * Client wrapper that owns the filter (`activeSlug`) and view-mode
 * (`mode`) state for the projects index.
 *
 * Mode swap (grid ↔ list) — Vue `<Transition mode="out-in">` style:
 *   1. fade the current view out (0.3s)
 *   2. on complete, setState to swap which component is rendered
 *      (the old view actually unmounts; the new one mounts in its
 *      place — no two-views-in-DOM layout jolt)
 *   3. useLayoutEffect runs after React commits the new view; fades
 *      it in from opacity 0
 *
 * Filter behaviour is mode-aware:
 *   grid → cards regroup; Flip animates the layout diff
 *   list → rows stay; .is-active toggles greyscale on non-matches
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
  /* `mode` drives the filter UI (which tab reads as active);
     `renderedMode` drives which view component is mounted in the
     DOM. They diverge for the duration of the fade-out so the
     active tab updates immediately while the swap waits. */
  const [mode, setMode] = useState<ProjectsViewMode>("grid");
  const [renderedMode, setRenderedMode] =
    useState<ProjectsViewMode>("grid");

  const flipState = useRef<Flip.FlipState | null>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const pendingFadeIn = useRef(false);
  const modeAnimating = useRef(false);

  const gridProjects = activeSlug
    ? projects.filter((p) => p.category?.slug === activeSlug)
    : projects;

  const handleCategoryChange = (slug: string) => {
    if (slug === activeSlug) return;
    if (renderedMode === "grid" && typeof window !== "undefined") {
      flipState.current = Flip.getState(".project-card-wrap", {
        props: "opacity",
      });
    }
    setActiveSlug(slug);
  };

  const handleModeChange = (next: ProjectsViewMode) => {
    if (next === mode || modeAnimating.current) return;
    setMode(next);

    const view = viewRef.current;
    if (!view) {
      setRenderedMode(next);
      return;
    }

    modeAnimating.current = true;
    gsap.to(view, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.out",
      onComplete: () => {
        /* Schedule the React re-render. The useLayoutEffect below
           fires on the next render and runs the fade-in. */
        pendingFadeIn.current = true;
        setRenderedMode(next);
      },
    });
  };

  /* Filter Flip morph (grid mode only) — runs after activeSlug
     changes have committed. */
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

  /* Fade in the new view after it has mounted. */
  useLayoutEffect(() => {
    if (!pendingFadeIn.current) return;
    pendingFadeIn.current = false;
    const view = viewRef.current;
    if (!view) return;
    gsap.fromTo(
      view,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.4,
        ease: "power2.out",
        onComplete: () => {
          modeAnimating.current = false;
        },
      },
    );
  }, [renderedMode]);

  /* Page-enter animation — runs once on mount. */
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

      <div ref={viewRef} className="projects-view">
        {renderedMode === "grid" ? (
          <ProjectsGrid projects={gridProjects} />
        ) : (
          <ProjectsList projects={projects} activeSlug={activeSlug} />
        )}
      </div>
    </div>
  );
}
