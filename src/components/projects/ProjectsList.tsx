/**
 * ProjectsList
 * ============
 * List-view of the projects index — a flat <ul> of full-width row
 * cards. Each row has three columns on desktop:
 *   col-1  N°XXX
 *   col-9  Project name (h2, large)
 *   col-2  Image (right side, h-full)
 *
 * On mobile the columns collapse to a single stack with image first
 * (via order: -1), then a small "N° · Name" pretitle, then the
 * large h2 title.
 *
 * Filter behaviour matches the reference: rows STAY rendered but
 * become inactive (.active=false → greyscale + reduced opacity +
 * pointer-events:none) when they don't match the active filter.
 * That's distinct from the grid view which hides non-matching cards.
 */

"use client";

import Image from "next/image";

import SplitText from "@/components/split-text/SplitText";
import { urlFor } from "@/sanity/lib/image";
import type { ProjectListItem } from "@/sanity/queries/projects";

import "./ProjectsList.css";

interface ProjectsListProps {
  projects: ProjectListItem[];
  /** Empty string = "All". Non-matching rows go inactive. */
  activeSlug: string;
}

export default function ProjectsList({
  projects,
  activeSlug,
}: ProjectsListProps) {
  return (
    <ul className="projects-list">
      {projects.map((project, i) => (
        <ProjectRow
          key={project._id}
          project={project}
          index={i + 1}
          active={!activeSlug || project.category?.slug === activeSlug}
        />
      ))}
    </ul>
  );
}

interface ProjectRowProps {
  project: ProjectListItem;
  index: number;
  active: boolean;
}

function ProjectRow({ project, index, active }: ProjectRowProps) {
  const num = `N°${String(index).padStart(3, "0")}`;
  const src = project.featuredImage?.asset
    ? urlFor(project.featuredImage).width(600).url()
    : null;
  const alt = project.featuredImage?.alt ?? project.title;

  return (
    <li className="projects-list__item" data-cat={project.category?.slug ?? ""}>
      <article
        className={`projects-list__row${active ? " is-active" : ""}`}
        aria-disabled={!active}
      >
        <div className="container projects-list__row-inner">
          <div className="projects-list__pretitle">
            <span className="projects-list__num">{num}</span>
            {/* Mobile-only echo of the project name next to the
                number — reference shows both the small label and
                the giant h2 title on small screens. */}
            <span className="projects-list__pretitle-name">
              {project.title}
            </span>
          </div>

          <div className="projects-list__content">
            <h2 className="projects-list__title">
              <SplitText asWords>{project.title}</SplitText>
            </h2>
          </div>

          <div className="projects-list__image">
            {src ? (
              /* `fill` makes the image absolutely fill its
                 (relative) wrap regardless of the source's intrinsic
                 aspect ratio — without this, portrait Sanity images
                 render taller than the 14rem row and visually
                 overflow into the next one. */
              <Image
                src={src}
                alt={alt}
                fill
                sizes="(max-width: 64rem) 100vw, 16vw"
                style={{ objectFit: "cover" }}
              />
            ) : null}
          </div>
        </div>
      </article>
    </li>
  );
}
