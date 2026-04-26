/**
 * ProjectsClient
 * ==============
 * Client-side wrapper for the projects listing. Owns the
 * `activeSlug` filter state, renders the sticky filter bar +
 * grid, and animates the card layout transition with GSAP Flip
 * whenever the filter changes.
 *
 * Pattern:
 *   1. User clicks a tab → filter state captured BEFORE setState
 *      via Flip.getState(allCards).
 *   2. setState triggers a re-render with the filtered list →
 *      ProjectsGrid regroups the visible cards into the alternating
 *      pair / wide pattern; React reconciles by stable key.
 *   3. useLayoutEffect fires after the DOM updates; Flip.from
 *      animates the position diff (moves) + opacity for newly
 *      added or removed cards (onEnter / onLeave).
 *
 * The page (server) fetches all projects + categories once and
 * passes both arrays here. Filtering is purely client-side.
 */

"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";

import ProjectsFilter from "./ProjectsFilter";
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
  const flipState = useRef<Flip.FlipState | null>(null);

  /* Compute the filtered list — preserving the original order. */
  const filtered = activeSlug
    ? projects.filter((p) => p.category?.slug === activeSlug)
    : projects;

  /* Capture state right before the React render that will move /
     remove cards. Click handler runs synchronously, then setState
     schedules the re-render. The captured state lives in a ref
     until useLayoutEffect picks it up after the DOM updates. */
  const handleChange = (slug: string) => {
    if (slug === activeSlug) return;
    if (typeof window !== "undefined") {
      flipState.current = Flip.getState(".project-card-wrap", {
        props: "opacity",
      });
    }
    setActiveSlug(slug);
  };

  useLayoutEffect(() => {
    if (!flipState.current) return;
    Flip.from(flipState.current, {
      duration: 0.7,
      ease: "expo.out",
      absolute: false,
      onEnter: (el) =>
        gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.4 }),
      onLeave: (el) => gsap.to(el, { opacity: 0, duration: 0.3 }),
    });
    flipState.current = null;
  }, [activeSlug]);

  return (
    <>
      <ProjectsFilter
        categories={categories}
        activeSlug={activeSlug}
        onChange={handleChange}
      />
      <ProjectsGrid projects={filtered} />
    </>
  );
}
