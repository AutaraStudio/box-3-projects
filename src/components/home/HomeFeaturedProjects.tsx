/**
 * HomeFeaturedProjects
 * ====================
 * Masonry-style showcase of featured projects on the home page.
 * Cards pack into two columns via CSS columns; aspect ratios
 * alternate (portrait / landscape) so the columns interlock with
 * varying heights — gives the section the editorial magazine
 * feel of a curated spread rather than a uniform grid.
 *
 *   ┌─ Featured ───────────────────────────────────────────────┐
 *   │  Recent work.                                            │
 *   │                                                          │
 *   │  ┌───────────┐                                           │
 *   │  │  Image 1  │   ┌─────────────┐                         │
 *   │  │ (portrait)│   │   Image 2   │                         │
 *   │  │           │   │ (landscape) │                         │
 *   │  └───────────┘   └─────────────┘                         │
 *   │  N°001 / Title    N°002 / Title                          │
 *   │                                                          │
 *   │                  ┌───────────┐                           │
 *   │  ┌────────────┐  │  Image 4  │                           │
 *   │  │  Image 3   │  │ (portrait)│                           │
 *   │  │ (landscape)│  │           │                           │
 *   │  └────────────┘  └───────────┘                           │
 *   │  N°003 / Title    N°004 / Title                          │
 *   └──────────────────────────────────────────────────────────┘
 *
 * Mobile: collapses to a single column. CSS columns degrade
 * cleanly — `column-count: 1` is just stacked flow.
 */

"use client";

import { useRef } from "react";
import Image from "next/image";

import Heading from "@/components/ui/Heading";
import RevealStack from "@/components/ui/RevealStack";
import RevealImage from "@/components/ui/RevealImage";
import SplitText from "@/components/split-text/SplitText";
import TransitionLink from "@/components/transition/TransitionLink";
import { urlFor } from "@/sanity/lib/image";
import type { ProjectListItem } from "@/sanity/queries/projects";

import "./HomeFeaturedProjects.css";

interface HomeFeaturedProjectsProps {
  label?: string;
  heading?: string;
  projects: ProjectListItem[];
}

export default function HomeFeaturedProjects({
  label = "Featured",
  heading = "Recent work.",
  projects,
}: HomeFeaturedProjectsProps) {
  const sectionRef = useRef<HTMLElement>(null);

  if (projects.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="home-featured"
      data-theme="cream"
    >
      <div className="container home-featured__inner">
        <header className="home-featured__head">
          <p className="home-featured__label text-small text-caps">
            {label}
          </p>
          <Heading as="h2" className="home-featured__heading text-h2">
            {heading}
          </Heading>
        </header>

        <RevealStack as="ul" className="home-featured__list">
          {projects.map((project, i) => {
            const num = `N°${String(i + 1).padStart(3, "0")}`;
            const src = project.featuredImage?.asset
              ? urlFor(project.featuredImage).width(1600).url()
              : null;
            const alt = project.featuredImage?.alt ?? project.title;
            /* Native aspect from Sanity dims — drives the image
               wrapper's aspect-ratio so each card renders at the
               source image's true shape (no cropping, no padding). */
            const dims = project.featuredImage?.asset?.metadata?.dimensions;
            const ratio = dims ? `${dims.width}/${dims.height}` : "4/5";

            return (
              <li key={project._id} className="home-featured__item">
                <TransitionLink
                  href={`/projects/${project.slug}`}
                  pageName={project.title}
                  className="home-featured__card"
                >
                  <RevealImage
                    className="home-featured__image"
                    style={{ "--ratio": ratio } as React.CSSProperties}
                  >
                    {src ? (
                      <Image
                        src={src}
                        alt={alt}
                        fill
                        sizes="(max-width: 48rem) 100vw, 50vw"
                        style={{ objectFit: "cover" }}
                      />
                    ) : null}
                  </RevealImage>
                  <div className="home-featured__text">
                    <div className="home-featured__meta-row">
                      <span className="home-featured__num text-small text-caps">
                        {num}
                      </span>
                      {project.year ? (
                        <span className="home-featured__year text-small text-caps">
                          {project.year}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="home-featured__title text-h4">
                      <SplitText asWords>{project.title}</SplitText>
                    </h3>
                    {project.category?.title ? (
                      <p className="home-featured__category text-small text-caps">
                        {project.category.title}
                      </p>
                    ) : null}
                  </div>
                </TransitionLink>
              </li>
            );
          })}
        </RevealStack>
      </div>
    </section>
  );
}
