/**
 * RelatedProjects
 * ===============
 * "More projects" strip at the foot of a project detail page. Up to
 * 5 peers — same-category-first, then by year desc, with the current
 * project excluded. Renders nothing if there are no peers.
 *
 * Reuses the projects archive's <ProjectsList> in its all-active
 * state (empty activeSlug) so the visual language + hover behaviour
 * (TransitionLink rows, image hover scale, char roll-over) match the
 * archive's list view exactly. No bespoke layout / styling required.
 */

import ProjectsList from "@/components/projects/ProjectsList";
import Heading from "@/components/ui/Heading";
import type { RelatedProject } from "@/sanity/queries/projects";

import "./RelatedProjects.css";

interface RelatedProjectsProps {
  projects: RelatedProject[];
}

export default function RelatedProjects({ projects }: RelatedProjectsProps) {
  if (projects.length === 0) return null;

  return (
    <section className="related-projects">
      <div className="container related-projects__inner">
        <header className="related-projects__head">
          <Heading as="h2" className="related-projects__title text-h4">
            More projects
          </Heading>
        </header>

        <ProjectsList projects={projects} activeSlug="" />
      </div>
    </section>
  );
}
