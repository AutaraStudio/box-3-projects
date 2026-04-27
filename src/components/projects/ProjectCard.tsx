/**
 * ProjectCard
 * ===========
 * Image + meta row (N°### · Project name). Image renders at
 * `transform: scale(1.2)` by default; on card hover it scales to
 * 1.28 with a brightness boost — verbatim from the reference's
 * DynamicZone.css.
 *
 * v1: non-clickable (no project detail page in v2 yet). Wrap the
 * outer <article> in a TransitionLink later when the detail route
 * lands.
 *
 * Aspect ratio is set as a CSS custom property `--ratio` from the
 * project's Sanity image dimensions so each card preserves its
 * native portrait / landscape / panoramic shape.
 */

import Image from "next/image";

import SplitText from "@/components/split-text/SplitText";
import TransitionLink from "@/components/transition/TransitionLink";
import { urlFor } from "@/sanity/lib/image";
import type { ProjectListItem } from "@/sanity/queries/projects";

import "./ProjectCard.css";

interface ProjectCardProps {
  project: ProjectListItem;
  /** 1-indexed position in the listing — drives the N°### prefix. */
  index: number;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  const num = `N°${String(index).padStart(3, "0")}`;
  const dims = project.featuredImage?.asset?.metadata?.dimensions;
  const ratio = dims ? `${dims.width}/${dims.height}` : "3/2";
  const renderWidth = 1600;
  const renderHeight = dims
    ? Math.round(renderWidth * (dims.height / dims.width))
    : Math.round(renderWidth * (2 / 3));
  const src = project.featuredImage?.asset
    ? urlFor(project.featuredImage).width(renderWidth).url()
    : null;
  const alt = project.featuredImage?.alt ?? project.title;

  return (
    <TransitionLink
      href={`/projects/${project.slug}`}
      pageName={project.title}
      className="project-card"
      style={{ "--ratio": ratio } as React.CSSProperties}
    >
      <div className="project-card__image-wrap">
        <div className="project-card__image">
          {src ? (
            <Image
              src={src}
              alt={alt}
              width={renderWidth}
              height={renderHeight}
              sizes="(max-width: 64rem) 100vw, 50vw"
            />
          ) : null}
        </div>
      </div>

      <div className="project-card__text">
        <div className="project-card__meta-row">
          <span className="project-card__num text-small text-caps">
            {num}
          </span>
          {project.year ? (
            <span className="project-card__year text-small text-caps">
              {project.year}
            </span>
          ) : null}
        </div>
        <h3 className="project-card__title text-h4">
          <SplitText asWords>{project.title}</SplitText>
        </h3>
        {project.category?.title ? (
          <p className="project-card__category text-small text-caps">
            {project.category.title}
          </p>
        ) : null}
      </div>
    </TransitionLink>
  );
}
