/**
 * SustainabilityLegacy
 * ====================
 * 3-up grid of recent / signature sustainable projects. Each tile
 * is image + project name + year (with optional in-progress copy)
 * and links through to the project detail page.
 *
 *   ┌────────────────────────────────────────────────────┐
 *   │  RECENT WORK                                       │
 *   │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
 *   │  │ image    │  │ image    │  │ image    │          │
 *   │  └──────────┘  └──────────┘  └──────────┘          │
 *   │  Project name  Project name  Project name          │
 *   │  2024          2023          2025                  │
 *   └────────────────────────────────────────────────────┘
 *
 * Renders nothing if no items are passed.
 */

import Image from "next/image";

import Heading from "@/components/ui/Heading";
import RevealImage from "@/components/ui/RevealImage";
import RevealStack from "@/components/ui/RevealStack";
import TransitionLink from "@/components/transition/TransitionLink";
import { urlFor } from "@/sanity/lib/image";
import type { SustainabilityLegacyItem } from "@/sanity/queries/sustainabilityPage";

import "./SustainabilityLegacy.css";

interface SustainabilityLegacyProps {
  label?: string;
  items: SustainabilityLegacyItem[];
}

export default function SustainabilityLegacy({
  label = "Recent work",
  items,
}: SustainabilityLegacyProps) {
  if (items.length === 0) return null;

  return (
    <section className="sustainability-legacy">
      <div className="container sustainability-legacy__inner">
        <header className="sustainability-legacy__head">
          <p className="sustainability-legacy__label text-small text-caps">
            {label}
          </p>
          <Heading
            as="h2"
            className="sustainability-legacy__heading text-h3"
          >
            Built for the long term.
          </Heading>
        </header>

        <RevealStack
          as="ul"
          childSelector=".sustainability-legacy__item"
          className="sustainability-legacy__list"
        >
          {items.map((item, index) => (
            <LegacyTile key={index} item={item} />
          ))}
        </RevealStack>
      </div>
    </section>
  );
}

function LegacyTile({ item }: { item: SustainabilityLegacyItem }) {
  const project = item.project;
  /* Resolve the right image — explicit override wins, otherwise
     the linked project's featuredImage. */
  const image = item.image?.asset ? item.image : project?.featuredImage;
  const src = image?.asset
    ? urlFor(image as { asset: { _id: string } }).width(1600).url()
    : null;
  const alt = image?.alt ?? project?.title ?? "";
  const title = project?.title ?? "Untitled project";
  const year = item.yearLabel ?? (project?.year ? String(project.year) : null);
  const href = project?.slug ? `/projects/${project.slug}` : null;

  const tile = (
    <article className="sustainability-legacy__card">
      {src ? (
        <RevealImage className="sustainability-legacy__media">
          <Image
            src={src}
            alt={alt}
            width={1600}
            height={1067}
            sizes="(max-width: 64rem) 100vw, 33vw"
            className="sustainability-legacy__image"
          />
        </RevealImage>
      ) : (
        <div
          className="sustainability-legacy__media sustainability-legacy__media--placeholder"
          aria-hidden="true"
        />
      )}
      <div className="sustainability-legacy__meta">
        <h3 className="sustainability-legacy__title text-h5">{title}</h3>
        {year ? (
          <p className="sustainability-legacy__year text-small text-caps">
            {year}
          </p>
        ) : null}
      </div>
    </article>
  );

  return (
    <li className="sustainability-legacy__item">
      {href ? (
        <TransitionLink
          href={href}
          pageName={title}
          className="sustainability-legacy__link"
        >
          {tile}
        </TransitionLink>
      ) : (
        tile
      )}
    </li>
  );
}
