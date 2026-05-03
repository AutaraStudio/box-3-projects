/**
 * /projects
 * =========
 * Projects index. Server component — pulls every project from
 * Sanity, then renders the hero (sketch → photo image wipe) +
 * a three-up parallax grid. No filters or list-view toggle on
 * the archive itself; categories are surfaced inside each
 * project's detail page.
 *
 * The hero's two images are static assets in `/public` — the
 * sketch overlay sits on top and wipes bottom-up on scroll to
 * reveal the photograph beneath.
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
    <main className="projects-page">
      <ProjectsHero
        count={projects.length}
        baseImage={{
          src: "/reveal.webp",
          alt: "Completed fit-out — finished space",
        }}
        overlayImage={{
          src: "/sketch.webp",
          alt: "Initial sketch — line drawing",
        }}
      />
      <ProjectsGrid projects={projects} />
    </main>
  );
}
