/**
 * /projects
 * =========
 * Projects index. Server component — pulls every project + every
 * category from Sanity in parallel, then hands both arrays to the
 * client-side ProjectsClient which owns the filter state and
 * animates layout transitions with GSAP Flip.
 *
 * Stage 2 of the projects build: hero + sticky filter bar +
 * category-driven filter behaviour.
 * Stage 3 will add the Grid ↔ List mode toggle.
 */

import ProjectsHero from "@/components/projects/ProjectsHero";
import ProjectsClient from "@/components/projects/ProjectsClient";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  PROJECT_CATEGORIES_QUERY,
  PROJECTS_LIST_QUERY,
  type ProjectCategoryItem,
  type ProjectListItem,
} from "@/sanity/queries/projects";

export const revalidate = 60;

export default async function ProjectsPage() {
  const [projects, categories] = await Promise.all([
    sanityFetch<ProjectListItem[]>({
      query: PROJECTS_LIST_QUERY,
      revalidate: 60,
    }),
    sanityFetch<ProjectCategoryItem[]>({
      query: PROJECT_CATEGORIES_QUERY,
      revalidate: 60,
    }),
  ]);

  /* Drop categories that have no projects with featuredImage —
     they'd render as a tab with "(000)" and never match. */
  const usefulCategories = categories.filter((c) => c.count > 0);

  return (
    <main>
      <ProjectsHero count={projects.length} />
      <ProjectsClient projects={projects} categories={usefulCategories} />
    </main>
  );
}
