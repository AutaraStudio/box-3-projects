/**
 * FeaturedProjects
 * ================
 * Home-page "selected projects" band. Renders an alternating row
 * layout — text column + full-height featured image — for each
 * project selected in the Sanity singleton, with a full-width
 * "Explore all projects" button beneath the list.
 *
 * Row anatomy (mirrors the Tower 42 project-detail hero):
 *   - Tag (category.title, uppercase caps label)
 *   - Title (project title, text-h1)
 *   - Ruled stats grid — Location / Year + any per-project stats
 *   - "View project" button → /projects/{slug}
 *   - Featured image, ~100svh on desktop
 *
 * Alternation:
 *   - First project (and every odd index): text-left / image-right
 *   - Second project (and every even index): image-left / text-right
 *
 * Theme: cream. Both `data-theme` and `data-nav-theme` are cream
 * so the nav swaps as the section scrolls past.
 */

import Image from "next/image";

import { Button } from "@/components/ui/Button";
import { urlFor } from "@/sanity/lib/image";
import type {
  FeaturedProject,
  FeaturedProjectsData,
} from "@/sanity/queries/featuredProjectsSection";
import type { ProjectStat } from "@/sanity/queries/project";

import "./FeaturedProjects.css";

/* ------------------------------------------------------------------
   Helpers
   ------------------------------------------------------------------ */

/** Build the stats list for a single row — Location + Year are
 *  always shown first, then every stat the project carries from
 *  Sanity. Mirrors the ProjectHero layout so the home-page row
 *  reads consistently with the detail page. */
function buildStats(project: FeaturedProject): ProjectStat[] {
  const base: ProjectStat[] = [
    { _key: "location", label: "Location", value: project.location },
    { _key: "year", label: "Year", value: String(project.year) },
  ];
  return [...base, ...(project.stats ?? [])];
}

/* ------------------------------------------------------------------
   Component
   ------------------------------------------------------------------ */

export default function FeaturedProjects({
  sectionLabel,
  ctaLabel,
  ctaHref,
  projects,
}: FeaturedProjectsData) {
  if (!projects || projects.length === 0) return null;

  return (
    <section
      className="featured-projects"
      data-theme="dark"
      data-nav-theme="dark"
      aria-label={sectionLabel ?? "Featured projects"}
    >
      {sectionLabel ? (
        <>
          <div className="featured-projects__header container">
            <h2 className="featured-projects__heading font-primary text-h4 font-medium leading-snug tracking-tight">
              {sectionLabel}
            </h2>
          </div>
          <hr className="featured-projects__divider" aria-hidden="true" />
        </>
      ) : null}

      {projects.map((project, index) => {
        const heroStats = buildStats(project);
        const href = `/projects/${project.slug}`;
        const imageUrl = project.featuredImage?.asset?.url
          ? urlFor(project.featuredImage).width(1600).url()
          : null;
        /* First row (index 0) = image on the right; even indices
           flip so the layout alternates cleanly. */
        const isImageRight = index % 2 === 0;

        return (
          <article
            key={project._id}
            className={`featured-projects__row${
              isImageRight
                ? " featured-projects__row--image-right"
                : " featured-projects__row--image-left"
            }`}
          >
            <div className="featured-projects__content">
              <div className="featured-projects__header">
                {project.category ? (
                  <p className="featured-projects__tag font-secondary text-text-xs tracking-caps uppercase">
                    {project.category.title}
                  </p>
                ) : null}
                <h2 className="featured-projects__title font-primary text-h3 leading-tight tracking-tight">
                  {project.title}
                </h2>
              </div>

              <dl className="featured-projects__stats">
                {heroStats.map((stat) => (
                  <div key={stat._key} className="featured-projects__stats-item">
                    <dt className="featured-projects__stats-label font-secondary text-text-xs tracking-caps uppercase">
                      {stat.label}
                    </dt>
                    <dd className="featured-projects__stats-value font-primary">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="featured-projects__cta">
                <Button href={href} variant="primary" size="lg">
                  View project
                </Button>
              </div>
            </div>

            <div
              className="featured-projects__media"
              data-image-reveal
              data-parallax="trigger"
              data-parallax-start="12"
              data-parallax-end="-12"
              data-parallax-disable="mobileLandscape"
            >
              <div
                className="featured-projects__media-inner"
                data-parallax="target"
              >
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={project.featuredImage?.alt ?? project.title}
                    fill
                    sizes="(max-width: 999px) 100vw, 50vw"
                    className="featured-projects__media-image"
                  />
                ) : (
                  <div
                    className="featured-projects__media-placeholder"
                    aria-hidden="true"
                  />
                )}
              </div>
            </div>
          </article>
        );
      })}

      <div className="featured-projects__footer">
        <Button href={ctaHref} variant="primary" size="xl" full>
          {ctaLabel}
        </Button>
      </div>
    </section>
  );
}
