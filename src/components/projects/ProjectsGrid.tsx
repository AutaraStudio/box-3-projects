/**
 * ProjectsGrid
 * ============
 * Three-up project grid for the /projects archive. Same layout as
 * HomeFeaturedProjects — every card sits at the same 4:5 aspect
 * ratio, distributed evenly across three columns at tablet+.
 *
 * Cards parallax against each other on scroll: each card eases
 * from `+rem` to `-rem` over its viewport transit, with the
 * amplitude varying per-slot in a 4-card cycle so adjacent cards
 * drift at different rates. Tablet+ only — mobile is a single
 * stacked column where parallax reads as juddery.
 *
 * The animation initialisation defers until `awaitTransitionEnd()`
 * resolves so ScrollTriggers built behind the still-covering page
 * transition panel don't measure against the wrong main offset.
 */

"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import ProjectCard from "./ProjectCard";
import RevealStack from "@/components/ui/RevealStack";
import { awaitTransitionEnd } from "@/components/transition/transitionState";
import type { ProjectListItem } from "@/sanity/queries/projects";

import "./ProjectsGrid.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* Per-slot parallax ranges — symmetric around 0 so motion is
   visible the moment a card enters the viewport. Amplitudes vary
   per slot so neighbouring cards drift at different rates, which
   is what reads as parallax. */
const PARALLAX_RANGES: Array<{ from: string; to: string }> = [
  { from: "2rem", to: "-2rem" },
  { from: "6rem", to: "-6rem" },
  { from: "1.5rem", to: "-1.5rem" },
  { from: "5rem", to: "-5rem" },
];

interface ProjectsGridProps {
  projects: ProjectListItem[];
}

export default function ProjectsGrid({ projects }: ProjectsGridProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sec = sectionRef.current;
    if (!sec) return;
    let ctx: gsap.Context | null = null;
    let cancelled = false;

    awaitTransitionEnd().then(() => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        const mm = gsap.matchMedia();
        mm.add("(min-width: 48rem)", () => {
          /* Target the inner card link, NOT the outer grid item.
             The wrap is a child of `.reveal-stack` (RevealStack)
             which applies its own reveal transition; smoothing
             that with the parallax transform creates a ~1s lag. */
          const items = gsap.utils.toArray<HTMLElement>(
            ".project-card",
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

  return (
    <div ref={sectionRef} className="projects-grid">
      <div className="container">
        <RevealStack
          childSelector=".project-card-wrap"
          className="projects-grid__row"
        >
          {projects.map((project, i) => (
            <div key={project._id} className="project-card-wrap">
              <ProjectCard project={project} index={i + 1} />
            </div>
          ))}
        </RevealStack>
      </div>
    </div>
  );
}
