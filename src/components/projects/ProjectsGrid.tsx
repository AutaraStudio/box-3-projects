/**
 * ProjectsGrid
 * ============
 * Three-up project grid for the /projects archive. Same layout as
 * HomeFeaturedProjects — every card sits at the same 4:5 aspect
 * ratio, distributed evenly across three columns at tablet+.
 */

"use client";

import { useRef } from "react";

import ProjectCard from "./ProjectCard";
import RevealStack from "@/components/ui/RevealStack";
import type { ProjectListItem } from "@/sanity/queries/projects";

import "./ProjectsGrid.css";

interface ProjectsGridProps {
  projects: ProjectListItem[];
}

export default function ProjectsGrid({ projects }: ProjectsGridProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={sectionRef} className="projects-grid">
      <div className="container">
        <RevealStack
          childSelector=".project-card-wrap"
          className="projects-grid__row"
        >
          {projects.map((project, i) => (
            <div key={project._id} className="project-card-wrap">
              <ProjectCard project={project} index={i + 1} />
            </div>
          ))}
        </RevealStack>
      </div>
    </div>
  );
}
