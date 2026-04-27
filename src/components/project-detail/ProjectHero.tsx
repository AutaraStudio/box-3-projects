/**
 * ProjectHero
 * ===========
 * Two-column hero ported from v1 (master). Visual structure is
 * preserved verbatim from the v1 source — only the underlying
 * styling tokens have been swapped for v2 equivalents.
 *
 *   Left column (sticky on desktop, anchored to viewport bottom):
 *     - category tag
 *     - <h1> title
 *     - ruled stats ledger (Location, Year, then every Sanity stat)
 *
 *   Right column (scrolls):
 *     - 5-image gallery (featured image + first 4 additionals,
 *       3:2 aspect lock, padding-top 45svh so the first image
 *       enters near the viewport midline)
 *     - Project team grid (member tiles with image, name,
 *       qualifications, role, optional LinkedIn link)
 *
 * The right-column accordion (Objective / Client feedback) from
 * v1 isn't included here — those copy blocks ride in the
 * ProjectInfo section below, which is the v2 placement.
 */

import Image from "next/image";

import Accordion, { type AccordionItem } from "@/components/ui/Accordion";
import Heading from "@/components/ui/Heading";
import RevealImage from "@/components/ui/RevealImage";
import RevealStack from "@/components/ui/RevealStack";
import {
  DirectionalHoverList,
  DirectionalHoverItem,
} from "@/components/ui/DirectionalHoverList";
import { urlFor } from "@/sanity/lib/image";
import type { ProjectDetail, ProjectStat } from "@/sanity/queries/projects";

import "./ProjectHero.css";

interface ProjectHeroProps {
  project: ProjectDetail;
}

export default function ProjectHero({ project }: ProjectHeroProps) {
  const galleryImages = [
    ...(project.featuredImage ? [project.featuredImage] : []),
    ...(project.additionalImages ?? []),
  ].slice(0, 5);

  const heroStats: ProjectStat[] = [
    { _key: "location", label: "Location", value: project.location },
    { _key: "year", label: "Year", value: String(project.year) },
    ...(project.stats ?? []),
  ];

  const team = project.team ?? [];
  const expertise = project.expertise ?? [];

  /* Build the accordion items from whichever client fields are
     populated. The whole accordion is omitted if neither field has
     content so the right column doesn't render an empty disclosure
     stack. */
  const accordionItems: AccordionItem[] = [];
  if (project.clientObjective) {
    accordionItems.push({
      key: "objective",
      label: "Objective",
      content: project.clientObjective,
    });
  }
  if (project.clientFeedback) {
    accordionItems.push({
      key: "feedback",
      label: "Client feedback",
      content: project.clientFeedback,
    });
  }

  return (
    <section className="project-hero" data-theme="dark">
      <div className="container project-hero__inner">
        {/* ── LEFT — sticky on desktop ─────────────────────────── */}
        <div className="project-hero__col">
          <div className="project-hero__sticky">
            <div className="project-hero__content">
              <header className="project-hero__header">
                {project.category ? (
                  <p className="project-hero__tag text-small text-caps">
                    <span className="project-hero__tag-label">
                      {project.category.title}
                    </span>
                  </p>
                ) : null}
                <Heading
                  as="h1"
                  className="project-hero__title text-h3"
                >
                  {project.title}
                </Heading>
              </header>

              <div className="project-hero__stats">
                <RevealStack
                  as="dl"
                  className="project-hero__stats-list"
                >
                  {heroStats.map((stat) => (
                    <div key={stat._key} className="project-hero__stats-item">
                      <dt className="project-hero__stats-label text-small text-caps">
                        {stat.label}
                      </dt>
                      <dd className="project-hero__stats-value text-main">
                        {stat.value}
                      </dd>
                    </div>
                  ))}
                </RevealStack>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT — scrolls ──────────────────────────────────── */}
        <div className="project-hero__col">
          <div className="project-hero__gallery">
            <ul className="project-hero__gallery-list">
              {galleryImages.map((image, index) => {
                const src = image.asset
                  ? urlFor(image).width(1600).url()
                  : null;
                return (
                  <li
                    /* The featured image may also appear inside
                       additionalImages, which would collide on
                       asset._id alone. Suffixing with the array
                       index guarantees uniqueness without losing
                       the asset id for stable identity across
                       re-orderings of the same set. */
                    key={`${image.asset?._id ?? "image"}-${index}`}
                    className="project-hero__gallery-item"
                  >
                    {src ? (
                      <RevealImage className="project-hero__gallery-image">
                        <Image
                          src={src}
                          alt={image.alt ?? ""}
                          fill
                          sizes="(max-width: 64rem) 100vw, 50vw"
                          className="project-hero__gallery-image-el"
                          priority={index === 0}
                        />
                      </RevealImage>
                    ) : (
                      <div
                        className="project-hero__gallery-image project-hero__gallery-image--placeholder"
                        aria-hidden="true"
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {expertise.length > 0 ? (
            <div className="project-hero__expertise">
              <Heading
                as="h2"
                className="project-hero__expertise-title text-h5"
              >
                Expertise
              </Heading>
              {/* Indexed registry with the directional hover-tile
                  affordance — same primitive used by the
                  sustainability page's certifications + principles
                  lists, so the language reads consistently. */}
              <DirectionalHoverList
                axis="y"
                className="project-hero__expertise-list"
              >
                {expertise.map((item, index) => (
                  <DirectionalHoverItem
                    key={item._id}
                    className="project-hero__expertise-row"
                  >
                    <span
                      className="project-hero__expertise-index text-small text-caps"
                      aria-hidden="true"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="project-hero__expertise-name text-main">
                      {item.title}
                    </p>
                  </DirectionalHoverItem>
                ))}
              </DirectionalHoverList>
            </div>
          ) : null}

          {team.length > 0 ? (
            <div className="project-hero__team">
              <Heading
                as="h2"
                className="project-hero__team-title text-h5"
              >
                Project team
              </Heading>
              <RevealStack as="ul" className="project-hero__team-list">
                {team.map((member) => {
                  const hasLink = Boolean(member.linkedinUrl);
                  const memberImg = member.image?.asset
                    ? urlFor(member.image).width(800).url()
                    : null;
                  const tile = (
                    <article
                      className={`project-hero__team-tile${
                        hasLink ? " project-hero__team-tile--link" : ""
                      }`}
                    >
                      <div className="project-hero__team-media">
                        {memberImg ? (
                          <Image
                            src={memberImg}
                            alt={member.image?.alt ?? member.name}
                            fill
                            sizes="(max-width: 64rem) 50vw, 25vw"
                            className="project-hero__team-image"
                          />
                        ) : (
                          <div
                            className="project-hero__team-image project-hero__team-image--placeholder"
                            aria-hidden="true"
                          />
                        )}
                      </div>
                      <div className="project-hero__team-info">
                        <p className="project-hero__team-name text-h6">
                          {member.name}
                        </p>
                        {member.qualifications ? (
                          <p className="project-hero__team-qual text-small text-caps">
                            {member.qualifications}
                          </p>
                        ) : null}
                        {member.role ? (
                          <p className="project-hero__team-role text-small text-caps">
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
                          {tile}
                        </a>
                      ) : (
                        tile
                      )}
                    </li>
                  );
                })}
              </RevealStack>
            </div>
          ) : null}

          {accordionItems.length > 0 ? (
            <div className="project-hero__accordion">
              <Heading
                as="h2"
                className="project-hero__accordion-title text-h5"
              >
                Brief
              </Heading>
              <Accordion
                idPrefix="project-client"
                items={accordionItems}
                /* Accordion default is text-h5; here we want the
                   click rows to read at the same scale as the
                   expertise list rows beneath, so swap the title
                   utility class to text-main. */
                titleClassName="text-main"
                defaultOpenKey={accordionItems[0]?.key}
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
