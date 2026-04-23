/**
 * RelatedProjects
 * ===============
 * "Other articles" grid, ported from reference/ref.html.
 *
 * Each tile is a 16-column grid on desktop:
 *   - columns 1–4: media (3:2)
 *   - columns 5–16: tag, title, view-more CTA
 * Hover fills the tile with the accent colour, inverts the text, and
 * slides the trailing "View more" label into view.
 *
 * Trailing CTA button wraps to a /projects overview page.
 */

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { urlFor } from "@/sanity/lib/image";
import type { RelatedProject } from "@/sanity/queries/projectDetail";

import "./RelatedProjects.css";

/* --------------------------------------------------------------------------
   Props
   -------------------------------------------------------------------------- */

export interface RelatedProjectsProps {
  projects: RelatedProject[];
  heading?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

/* --------------------------------------------------------------------------
   Component
   -------------------------------------------------------------------------- */

export default function RelatedProjects({
  projects,
  heading = "More projects",
  ctaLabel = "View All Projects",
  ctaHref = "/projects",
}: RelatedProjectsProps) {
  if (projects.length === 0) return null;

  const visible = projects.slice(0, 5);

  return (
    <section className="related-projects">
      <div className="related-projects__header container">
        <h2
          className="related-projects__heading font-primary text-h4 font-medium leading-snug tracking-snug"
        >
          {heading}
        </h2>
      </div>

      <ul className="related-projects__list">
        {visible.map((project) => {
          const href = `/projects/${project.slug}`;
          const image = project.featuredImage;
          return (
            <li
              key={project._id}
              className="related-projects__item"
            >
              <article className="related-projects__tile">
                <Link
                  href={href}
                  className="related-projects__tile-link"
                  aria-label={project.title}
                >
                  <span className="sr-only">{project.title}</span>
                </Link>
                <div className="related-projects__tile-inner">
                  <div className="related-projects__media" data-image-reveal>
                    {image?.asset?.url ? (
                      <Image
                        src={image.asset.url}
                        alt={image.alt ?? project.title}
                        fill
                        sizes="(max-width: 699px) 100vw, 25vw"
                        className="related-projects__media-image"
                      />
                    ) : (
                      <div
                        className="related-projects__media-placeholder"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div className="related-projects__info">
                    <div className="related-projects__head font-secondary text-text-xs tracking-caps uppercase">
                      <div className="related-projects__tag">
                        {project.category?.title ? (
                          <ul className="related-projects__tag-list">
                            <li>{project.category.title}</li>
                          </ul>
                        ) : null}
                      </div>
                      <span className="related-projects__date">
                        {project.year}
                      </span>
                    </div>
                    <p
                      className="related-projects__title font-primary text-h4 leading-snug tracking-snug"
                      aria-hidden="true"
                    >
                      {project.title}
                    </p>
                    <div className="related-projects__foot">
                      <p
                        className="related-projects__cta font-secondary text-text-md"
                        aria-hidden="true"
                      >
                        <span className="related-projects__cta-label">
                          View more
                        </span>
                        <span className="related-projects__cta-icon">
                          <svg
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                <span
                  className="related-projects__hover"
                  aria-hidden="true"
                />
              </article>
            </li>
          );
        })}
      </ul>

      <div className="related-projects__footer container">
        <div className="related-projects__cta-btn">
          <Button href={ctaHref} variant="primary" size="md" full>
            {ctaLabel}
          </Button>
        </div>
      </div>
    </section>
  );
}
