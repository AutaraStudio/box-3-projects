"use client";

/**
 * ProjectHero
 * ===========
 * Opening section of the project detail page.
 *
 * Layout:
 *   - Desktop: 12-column grid. Left 5 cols are sticky (category tag,
 *     title, hero portrait, stats). Right 7 cols are a gallery stack
 *     followed by the project team grid.
 *   - Mobile: single column, sticky disabled.
 *
 * Animation hooks are all data-attributes, picked up by the global
 * providers in src/components/layout/Providers.tsx:
 *   - data-split-text="lines" on the h1
 *   - data-animate="clip-reveal" on every image
 *   - data-animate="fade-up" with staggered delay on each team card
 *
 * All colour and sizing values flow through --theme-* / --space-*
 * tokens — no hardcoded values.
 */

import Image from "next/image";

import { urlFor } from "@/sanity/lib/image";
import type {
  ProjectImage,
  ProjectStat,
  TeamMemberRef,
} from "@/sanity/queries/project";

import "./ProjectHero.css";

/* --------------------------------------------------------------------------
   Props
   -------------------------------------------------------------------------- */

export interface ProjectHeroProps {
  title: string;
  category?: { title: string };
  heroImage?: ProjectImage;
  heroImages: ProjectImage[];
  stats: ProjectStat[];
  location: string;
  year: number;
  teamMembers: TeamMemberRef[];
}

/* --------------------------------------------------------------------------
   Team card — inline so the hero owns its presentation.
   -------------------------------------------------------------------------- */

interface ProjectTeamCardProps {
  member: TeamMemberRef;
  index: number;
}

function ProjectTeamCard({ member, index }: ProjectTeamCardProps) {
  const staggerDelay = String(index * 0.08);
  const hasImage = Boolean(member.image?.asset?.url);
  const imageUrl = hasImage
    ? urlFor(member.image as ProjectImage)
        .width(600)
        .height(400)
        .quality(85)
        .auto("format")
        .url()
    : null;

  const media = (
    <div className="team-card__media">
      {hasImage && imageUrl ? (
        <Image
          src={imageUrl}
          alt={member.name}
          fill
          className="object-cover"
          sizes="20vw"
        />
      ) : (
        <div className="team-card__placeholder" />
      )}
      {member.linkedinUrl ? (
        <span className="team-card__linkedin" aria-hidden="true">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
            <circle cx="4" cy="4" r="2" />
          </svg>
        </span>
      ) : null}
    </div>
  );

  const info = (
    <div className="team-card__info">
      <p className="team-card__name font-primary text-h6">{member.name}</p>
      {member.qualifications ? (
        <p
          className="team-card__quals font-secondary text-text-xs uppercase tracking-caps"
          style={{ color: "var(--theme-text-muted)" }}
        >
          {member.qualifications}
        </p>
      ) : null}
      <p
        className="team-card__role font-secondary text-text-sm"
        style={{ color: "var(--theme-text-muted)" }}
      >
        {member.role}
      </p>
    </div>
  );

  if (member.linkedinUrl) {
    return (
      <a
        className="team-card team-card--link"
        data-animate="fade-up"
        data-animate-delay={staggerDelay}
        href={member.linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        {media}
        {info}
      </a>
    );
  }

  return (
    <article
      className="team-card"
      data-animate="fade-up"
      data-animate-delay={staggerDelay}
    >
      {media}
      {info}
    </article>
  );
}

/* --------------------------------------------------------------------------
   Main
   -------------------------------------------------------------------------- */

export function ProjectHero({
  title,
  category,
  heroImage,
  heroImages,
  stats,
  teamMembers,
}: ProjectHeroProps) {
  const heroImageUrl = heroImage
    ? urlFor(heroImage).width(900).quality(85).auto("format").url()
    : null;

  return (
    <section
      className="project-hero py-section-xl"
      data-theme="light"
      data-nav-theme="light"
      aria-label="Project overview"
    >
      <div className="project-hero__grid container">
        {/* ------------------------------ Left column --------------------- */}
        <div className="project-hero__left">
          {category ? (
            <p
              className="font-secondary text-text-xs uppercase tracking-caps"
              style={{ color: "var(--theme-text-muted)" }}
            >
              {category.title}
            </p>
          ) : null}

          <h1
            data-split-text="lines"
            className="font-primary text-h3 tracking-snug leading-snug"
          >
            {title}
          </h1>

          {heroImage && heroImageUrl ? (
            <div
              className="project-hero__image-wrap"
              data-animate="clip-reveal"
            >
              <div className="project-hero__image-inner">
                <Image
                  src={heroImageUrl}
                  alt={heroImage.alt ?? ""}
                  fill
                  className="object-cover"
                  sizes="40vw"
                  priority
                />
              </div>
            </div>
          ) : null}

          {stats.length > 0 ? (
            <dl className="project-hero__stats">
              {stats.map((stat) => (
                <div key={stat._key} className="project-hero__stat">
                  <dt
                    className="font-secondary text-text-xs uppercase tracking-caps"
                    style={{ color: "var(--theme-text-muted)" }}
                  >
                    {stat.label}
                  </dt>
                  <dd className="font-primary text-text-sm">{stat.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>

        {/* ------------------------------ Right column -------------------- */}
        <div className="project-hero__right">
          <div className="project-hero__images">
            {heroImages.map((img, i) => {
              const url = urlFor(img)
                .width(1200)
                .quality(85)
                .auto("format")
                .url();
              return (
                <div
                  // Sanity images don't carry a stable key in the projection,
                  // so index is used intentionally — the list is append-only
                  // during a render and order is meaningful to the layout.
                  key={`${img.asset?._id ?? "img"}-${i}`}
                  className="project-hero__gallery-item"
                  data-animate="clip-reveal"
                  data-animate-delay={String(i * 0.1)}
                >
                  <Image
                    src={url}
                    alt={img.alt ?? ""}
                    fill
                    className="object-cover"
                    sizes="55vw"
                    priority={i === 0}
                    loading={i === 0 ? "eager" : "lazy"}
                  />
                </div>
              );
            })}
          </div>

          {teamMembers.length > 0 ? (
            <div className="project-hero__team">
              <p
                className="font-secondary text-text-xs uppercase tracking-caps"
                style={{
                  color: "var(--theme-text-muted)",
                  marginBottom: "var(--space-4)",
                }}
              >
                Project Team
              </p>
              <div className="project-hero__team-grid">
                {teamMembers.map((member, i) => (
                  <ProjectTeamCard
                    key={member._id}
                    member={member}
                    index={i}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default ProjectHero;
