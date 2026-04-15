/**
 * RelatedProjects
 * ===============
 * Server component. Renders the "More Projects" grid at the bottom
 * of a project detail page. Data is pre-fetched by the page — this
 * component is purely presentational.
 *
 * Image URLs come directly from `project.featuredImage.asset.url`
 * (dereferenced in the query), so urlFor() is not used here.
 *
 * Animation hooks:
 *   - data-animate="fade-up" on the header
 *   - data-animate="fade-up" with staggered delay on each card
 */

import Image from "next/image";

import Button from "@/components/ui/Button";
import type { RelatedProject } from "@/sanity/queries/projectDetail";

import "./RelatedProjects.css";

export interface RelatedProjectsProps {
  projects: RelatedProject[];
}

export function RelatedProjects({ projects }: RelatedProjectsProps) {
  if (!projects || projects.length === 0) {
    return null;
  }

  return (
    <section
      className="related-projects"
      data-theme="light"
      data-nav-theme="light"
      aria-label="More projects"
    >
      <div className="container">
        <div className="related-projects__header" data-animate="fade-up">
          <h2 className="related-projects__heading">More Projects</h2>
        </div>

        <ul className="related-projects__list" role="list">
          {projects.map((project, i) => (
            <li
              key={project._id}
              data-animate="fade-up"
              data-animate-delay={String(i * 0.08)}
            >
              <a
                href={`/projects/${project.slug}`}
                className="project-card"
                aria-label={project.title}
              >
                <div className="project-card__media">
                  <div className="project-card__media-inner">
                    {project.featuredImage?.asset?.url ? (
                      <Image
                        src={project.featuredImage.asset.url}
                        alt={project.featuredImage.alt ?? project.title}
                        fill
                        className="object-cover project-card__img"
                        sizes="(max-width: 767px) 100vw, (max-width: 991px) 50vw, 20vw"
                        loading="lazy"
                      />
                    ) : (
                      <div className="project-card__placeholder" />
                    )}
                    <div data-overlay="medium" aria-hidden="true" />
                  </div>
                </div>

                <div className="project-card__info">
                  {project.category ? (
                    <p
                      className="project-card__category font-secondary text-text-xs uppercase tracking-caps"
                      style={{ color: "var(--theme-text-muted)" }}
                    >
                      {project.category.title}
                    </p>
                  ) : null}
                  <p className="project-card__title font-primary text-h5 tracking-snug leading-snug">
                    {project.title}
                  </p>
                  <p
                    className="project-card__meta font-secondary text-text-xs"
                    style={{ color: "var(--theme-text-muted)" }}
                  >
                    {project.location}, {project.year}
                  </p>
                </div>
              </a>
            </li>
          ))}
        </ul>

        <div className="related-projects__footer">
          <Button href="/projects" variant="secondary" size="md">
            View All Projects
          </Button>
        </div>
      </div>
    </section>
  );
}

export default RelatedProjects;
