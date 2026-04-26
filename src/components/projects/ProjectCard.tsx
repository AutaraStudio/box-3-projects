/**
 * ProjectCard
 * ===========
 * Image + meta row (N°### · Project name) for the projects listing.
 *
 * v1: non-clickable (no project detail page in v2 yet). Wrap in <a>
 * later when the detail route lands.
 *
 * The image gets the on-scroll reveal via IntersectionObserver — a
 * subtle scale + translate + fade. The meta text uses SplitText so
 * the chars roll on hover (and on scroll if revealOnScroll is on).
 */

"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import SplitText from "@/components/split-text/SplitText";
import { urlFor } from "@/sanity/lib/image";
import type { ProjectListItem } from "@/sanity/queries/projects";

import "./ProjectCard.css";

interface ProjectCardProps {
  project: ProjectListItem;
  /** 1-indexed position in the listing — drives the N°### prefix. */
  index: number;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  /* Reveal the image on scroll-into-view via the same approach
     SplitText uses — IntersectionObserver toggles `is-inview` and
     CSS handles the transform/opacity transition. */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add("is-inview");
            observer.unobserve(el);
          }
        }
      },
      { threshold: 0, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const num = String(index).padStart(3, "0");
  const src = project.featuredImage?.asset
    ? urlFor(project.featuredImage).width(1600).url()
    : null;
  const alt = project.featuredImage?.alt ?? project.title;

  return (
    <article ref={cardRef} className="project-card">
      <div className="project-card__image-wrap">
        {src ? (
          <Image
            src={src}
            alt={alt}
            width={1600}
            height={1067}
            sizes="(max-width: 64rem) 100vw, 50vw"
            className="project-card__image"
          />
        ) : null}
      </div>

      <div className="project-card__meta">
        <span className="project-card__num text-small text-caps">
          N°{num}
        </span>
        <span className="project-card__name text-large">
          <SplitText asWords>{project.title}</SplitText>
        </span>
      </div>
    </article>
  );
}
