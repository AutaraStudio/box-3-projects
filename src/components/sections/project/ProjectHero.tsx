/**
 * ProjectHero
 * ===========
 * Two-column hero mirroring reference/ref.html:
 *   Left column (sticky on desktop):
 *     - category tag
 *     - title
 *     - primary hero image with mask reveal
 *     - ruled stats table from Sanity `stats[]`
 *   Right column (scrolls normally):
 *     - gallery list (first 5 images)
 *     - project-team grid
 *
 * Content flows entirely from props — no hardcoded strings or images.
 * Theme inherited from the parent section wrapper (light).
 */

import Image from "next/image";

import Accordion, { type AccordionItem } from "@/components/ui/Accordion";
import { urlFor } from "@/sanity/lib/image";
import type {
  ProjectCategoryRef,
  ProjectImage,
  ProjectStat,
  TeamMemberRef,
} from "@/sanity/queries/project";
/* NOTE: ProjectImage is still imported for the right-column gallery
   (heroImages). The left-column featured image was removed so the
   stats grid can carry the column. */

import "./ProjectHero.css";

/* --------------------------------------------------------------------------
   Types
   -------------------------------------------------------------------------- */

export interface ProjectHeroProps {
  title: string;
  category?: ProjectCategoryRef;
  /** First 5 items render in the right-column gallery. */
  heroImages: ProjectImage[];
  stats: ProjectStat[];
  location: string;
  year: number;
  teamMembers: TeamMemberRef[];
  /** Project brief — rendered inside the right-column accordion. */
  clientObjective?: string;
  /** Client quote / feedback — rendered inside the accordion. */
  clientFeedback?: string;
}

/* --------------------------------------------------------------------------
   Component
   -------------------------------------------------------------------------- */

export default function ProjectHero({
  title,
  category,
  heroImages,
  stats,
  location,
  year,
  teamMembers,
  clientObjective,
  clientFeedback,
}: ProjectHeroProps) {
  /* Build accordion items from whichever client fields are
     populated — accordion is skipped entirely if neither field
     has content so the layout doesn't render empty dropdowns. */
  const accordionItems: AccordionItem[] = [];
  if (clientObjective) {
    accordionItems.push({
      key: "objective",
      label: "Objective",
      content: clientObjective,
    });
  }
  if (clientFeedback) {
    accordionItems.push({
      key: "feedback",
      label: "Client feedback",
      content: clientFeedback,
    });
  }
  /* Right-col gallery: first 5 images. */
  const galleryImages = heroImages.slice(0, 5);

  /* Left-column stat grid.
     Location + Year are always shown first, then every stat from
     Sanity in order. No cap — the left column was redesigned to
     anchor the stats at the bottom, so additional rows just extend
     the ledger downwards. */
  const heroStats: ProjectStat[] = [
    { _key: "location", label: "Location", value: location },
    { _key: "year", label: "Year", value: String(year) },
    ...stats,
  ];

  return (
    <section className="project-hero pt-section-xl">
      <div className="project-hero__inner container">
        {/* Left column — sticky on desktop. Header anchors to the top,
            a flexible spacer pushes the stats grid to the bottom. */}
        <div className="project-hero__col">
          <div className="project-hero__sticky">
            <div className="project-hero__content">
              <header className="project-hero__header">
                {category ? (
                  <p
                    className="project-hero__tag font-secondary text-text-xs tracking-caps uppercase"
                  >
                    <span className="project-hero__tag-label">
                      {category.title}
                    </span>
                  </p>
                ) : null}

                <h1
                  className="project-hero__title font-primary text-h3 leading-tight tracking-tight"
                >
                  {title}
                </h1>
              </header>

              <div className="project-hero__stats">
                <dl className="project-hero__stats-list">
                  {heroStats.map((stat) => (
                    <div
                      key={stat._key}
                      className="project-hero__stats-item"
                    >
                      <dt className="font-secondary text-text-xs tracking-caps uppercase project-hero__stats-label">
                        {stat.label}
                      </dt>
                      <dd className="project-hero__stats-value">
                        {stat.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Right column — gallery + team */}
        <div className="project-hero__col">
          <div className="project-hero__gallery">
            <ul className="project-hero__gallery-list">
              {galleryImages.map((image, index) => (
                <li
                  key={image.asset?._id ?? index}
                  className="project-hero__gallery-item"
                  data-image-reveal
                  data-image-reveal-delay={(index * 0.05).toFixed(2)}
                  data-parallax="trigger"
                  data-parallax-start="12"
                  data-parallax-end="-12"
                  data-parallax-disable="mobileLandscape"
                >
                  <div
                    className="project-hero__gallery-image-inner"
                    data-parallax="target"
                  >
                    {image.asset?.url ? (
                      <figure className="project-hero__gallery-image">
                        <Image
                          src={urlFor(image).width(1600).url()}
                          alt={image.alt ?? ""}
                          fill
                          sizes="(max-width: 999px) 100vw, 50vw"
                          className="project-hero__gallery-image-el"
                        />
                      </figure>
                    ) : (
                      <div
                        className="project-hero__gallery-image project-hero__gallery-image--placeholder"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {teamMembers.length > 0 ? (
            <div className="project-hero__team">
              <h2 className="project-hero__team-title font-primary text-h5 leading-snug tracking-tight">
                Project team
              </h2>
              <ul className="project-hero__team-list">
                {teamMembers.map((member) => {
                  const hasLink = Boolean(member.linkedinUrl);
                  const inner = (
                    <article
                      className={`project-hero__team-tile${
                        hasLink ? " project-hero__team-tile--link" : ""
                      }`}
                    >
                      <div
                        className="project-hero__team-media"
                        data-image-reveal
                      >
                        {member.image?.asset?.url ? (
                          <Image
                            src={urlFor(member.image).width(800).url()}
                            alt={member.image.alt ?? member.name}
                            fill
                            sizes="(max-width: 999px) 50vw, 25vw"
                            className="project-hero__team-image"
                          />
                        ) : (
                          <div
                            className="project-hero__team-image project-hero__team-image--placeholder"
                            aria-hidden="true"
                          />
                        )}
                        {hasLink ? (
                          <span
                            className="project-hero__team-linkedin"
                            aria-hidden="true"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              width="20"
                              height="20"
                              fill="currentColor"
                            >
                              <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                              <circle cx="4" cy="4" r="2" />
                            </svg>
                          </span>
                        ) : null}
                      </div>
                      <div className="project-hero__team-info">
                        <p className="project-hero__team-name font-primary text-h6 leading-normal">
                          {member.name}
                        </p>
                        {member.qualifications ? (
                          <p className="project-hero__team-qual font-secondary text-text-xs tracking-caps uppercase">
                            {member.qualifications}
                          </p>
                        ) : null}
                        {member.role ? (
                          <p className="project-hero__team-role font-secondary text-text-xs tracking-caps uppercase">
                            {member.role}
                          </p>
                        ) : null}
                      </div>
                    </article>
                  );

                  return (
                    <li key={member._id}>
                      {hasLink ? (
                        <a
                          className="project-hero__team-link"
                          href={member.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${member.name} on LinkedIn`}
                        >
                          {inner}
                        </a>
                      ) : (
                        inner
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}

          {/* Objective / Client feedback accordion — sits beneath
              the team grid in the right column. Rendered only when
              at least one of the fields is populated in Sanity. */}
          {accordionItems.length > 0 ? (
            <div className="project-hero__accordion">
              <Accordion
                idPrefix="project-client"
                items={accordionItems}
                defaultOpenKey={accordionItems[0]?.key}
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
