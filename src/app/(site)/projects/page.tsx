/**
 * /projects
 * =========
 * Projects index. Server component — pulls every project from
 * Sanity, renders the editorial hero (title + total counter) and
 * the alternating pair/wide grid of project cards.
 *
 * Stage 1 of the projects build: hero + grid wired to live data.
 * Stage 2 will add the sticky filter bar (categories from Sanity);
 * Stage 3 will add the Grid ↔ List mode toggle.
 */

import ProjectsHero from "@/components/projects/ProjectsHero";
import ProjectsGrid from "@/components/projects/ProjectsGrid";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  PROJECTS_LIST_QUERY,
  type ProjectListItem,
} from "@/sanity/queries/projects";

export const revalidate = 60;

export default async function ProjectsPage() {
  const projects = await sanityFetch<ProjectListItem[]>({
    query: PROJECTS_LIST_QUERY,
    revalidate: 60,
  });

  return (
    <main>
      <ProjectsHero count={projects.length} />
      <ProjectsGrid projects={projects} />
    </main>
  );
}
