/**
 * ProjectsGrid
 * ============
 * Single 12-col CSS grid carrying every project card in the listing.
 * Cards are placed via a 4-slot asymmetric pattern (mirrors the home
 * featured layout) — wide left → narrow right (drops down) → narrow
 * left (indented) → wide right (drops slightly), repeating.
 *
 * Each card is wrapped in a `.project-card-wrap` div carrying
 * `data-flip-id` and `data-cat` — these markers are the contract with
 * `ProjectsClient`'s Flip animation (filter morph + grid↔list swap).
 * The wrap classnames + data attributes MUST stay intact for Flip
 * to capture / replay the layout state correctly.
 */

import ProjectCard from "./ProjectCard";
import RevealStack from "@/components/ui/RevealStack";
import type { ProjectListItem } from "@/sanity/queries/projects";

import "./ProjectsGrid.css";

interface ProjectsGridProps {
  projects: ProjectListItem[];
}

export default function ProjectsGrid({ projects }: ProjectsGridProps) {
  return (
    <div className="projects-grid">
      <div className="container">
        <RevealStack
          childSelector=".project-card-wrap"
          className="projects-grid__row"
        >
          {projects.map((project, i) => (
            <div
              key={project._id}
              className="project-card-wrap"
              data-flip-id={project._id}
              data-cat={project.category?.slug ?? ""}
            >
              <ProjectCard project={project} index={i + 1} />
            </div>
          ))}
        </RevealStack>
      </div>
    </div>
  );
}
