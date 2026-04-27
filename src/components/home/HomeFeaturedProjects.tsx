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

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Heading from "@/components/ui/Heading";
import RevealStack from "@/components/ui/RevealStack";
import RevealImage from "@/components/ui/RevealImage";
import SplitText from "@/components/split-text/SplitText";
import TransitionLink from "@/components/transition/TransitionLink";
import { awaitTransitionEnd } from "@/components/transition/transitionState";
import { urlFor } from "@/sanity/lib/image";
import type { ProjectListItem } from "@/sanity/queries/projects";

import "./HomeFeaturedProjects.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* Per-slot parallax ranges — symmetric around 0 so motion is
   visible the moment a card enters the viewport, not back-loaded
   to the end of the transit. Each card travels from `+rem` (just
   below its natural position) to `-rem` (just above it) as it
   crosses the viewport, scrub-locked to scroll. The amplitude
   varies per slot so adjacent cards drift at different rates,
   which is what reads as parallax against their neighbours. */
const PARALLAX_RANGES: Array<{ from: string; to: string }> = [
  { from: "2rem",   to: "-2rem"   }, // slot 4n+1 — wide left
  { from: "6rem",   to: "-6rem"   }, // slot 4n+2 — narrow right (most drift)
  { from: "1.5rem", to: "-1.5rem" }, // slot 4n+3 — narrow left
  { from: "5rem",   to: "-5rem"   }, // slot 4n+4 — wide right
];

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

  useEffect(() => {
    const sec = sectionRef.current;
    if (!sec) return;
    let ctx: gsap.Context | null = null;
    let cancelled = false;

    /* Same defer-until-transition-ends pattern used elsewhere on
       the site — without this, ScrollTriggers initialised behind
       the still-covering page transition panel would measure
       against the wrong main y-offset and fire incorrectly. */
    awaitTransitionEnd().then(() => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        const mm = gsap.matchMedia();
        /* Parallax only at tablet+ where the asymmetric grid is
           in play; mobile is a stack and parallax there reads as
           juddery rather than editorial. */
        mm.add("(min-width: 48rem)", () => {
          /* Parallax targets the inner card link, NOT the outer
             list item. The outer `.home-featured__item` is a
             direct child of `.reveal-stack`, which applies a
             `transition: transform 1s` for the reveal-on-mount
             animation — that transition would CSS-smooth every
             scroll-driven transform change, giving the parallax
             a ~1s lag. The inner card has no such transition. */
          const items = gsap.utils.toArray<HTMLElement>(
            ".home-featured__card",
            sec,
          );
          items.forEach((el, i) => {
            const range = PARALLAX_RANGES[i % PARALLAX_RANGES.length];
            gsap.fromTo(
              el,
              { y: range.from },
              {
                y: range.to,
                ease: "none",
                scrollTrigger: {
                  trigger: el,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: true,
                  invalidateOnRefresh: true,
                },
              },
            );
          });
        });
      }, sec);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [projects]);

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

            return (
              <li key={project._id} className="home-featured__item">
                <TransitionLink
                  href={`/projects/${project.slug}`}
                  pageName={project.title}
                  className="home-featured__card"
                >
                  <RevealImage className="home-featured__image">
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
