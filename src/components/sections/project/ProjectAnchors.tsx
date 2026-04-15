"use client";

/**
 * ProjectAnchors
 * ==============
 * Sticky secondary nav for the project detail page. Slides in once
 * the user scrolls past the #overview section and tracks the active
 * anchor as the user scrolls through the page.
 *
 * Behaviour is a faithful port of the reference implementation:
 *   - Slide-in toggle: IntersectionObserver on #overview
 *     (rootMargin mimics the reference's scroll-past trigger)
 *   - Active indicator: IntersectionObserver on each #section
 *     (rootMargin '-45px 0px -50% 0px' picks the section whose top
 *     is just above the centre of the viewport)
 *   - Smooth anchor scroll on click, offset by the anchor bar height.
 *
 * All theme values resolve via data-theme="light" on the root — the
 * bar always uses the light theme regardless of what's in view.
 */

import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import "./ProjectAnchors.css";

/* --------------------------------------------------------------------------
   Types
   -------------------------------------------------------------------------- */

export interface ProjectAnchorSection {
  /** DOM id of the in-page section (no leading hash). */
  id: string;
  /** Label shown in the anchor bar. */
  label: string;
}

export interface ProjectAnchorsProps {
  sections: ProjectAnchorSection[];
  projectTitle: string;
  projectLocation: string;
}

/* --------------------------------------------------------------------------
   Constants
   -------------------------------------------------------------------------- */

/**
 * Matches the CSS height token `var(--space-7)` = 3rem = 48px at 1440.
 * Used as the scroll offset when jumping to an anchor.
 */
const ANCHOR_BAR_OFFSET_PX = 48;

/* --------------------------------------------------------------------------
   Component
   -------------------------------------------------------------------------- */

export function ProjectAnchors({
  sections,
  projectTitle,
  projectLocation,
}: ProjectAnchorsProps) {
  const navRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(
    sections[0]?.id ?? null,
  );

  /* Slide-in toggle driven by #overview's intersection state. */
  useEffect(() => {
    const overview = document.getElementById("overview");
    if (!overview) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Visible when overview has scrolled OUT of view (not intersecting).
          setIsVisible(!entry.isIntersecting);
        });
      },
      { threshold: 0, rootMargin: "-80px 0px 0px 0px" },
    );
    observer.observe(overview);
    return () => observer.disconnect();
  }, []);

  /* Active-section tracker. */
  useEffect(() => {
    const observed: Element[] = [];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { threshold: 0, rootMargin: "-45px 0px -50% 0px" },
    );

    sections.forEach((section) => {
      const el = document.getElementById(section.id);
      if (!el) return;
      observer.observe(el);
      observed.push(el);
    });

    return () => {
      observed.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, [sections]);

  /* Smooth anchor scroll with offset. */
  const handleLinkClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
      event.preventDefault();
      const target = document.getElementById(targetId);
      if (!target) return;
      const top =
        target.getBoundingClientRect().top +
        window.scrollY -
        ANCHOR_BAR_OFFSET_PX;
      window.scrollTo({ top, behavior: "smooth" });
    },
    [],
  );

  return (
    <nav
      ref={navRef}
      className={cn("project-anchors", isVisible && "is-visible")}
      data-theme="light"
      data-nav-theme="light"
      aria-label="Project sections"
    >
      <div className="project-anchors__inner container">
        <div className="project-anchors__info">
          <p className="project-anchors__title">{projectTitle}</p>
          <p className="project-anchors__location">{projectLocation}</p>
        </div>
        <div className="project-anchors__nav">
          <ul className="project-anchors__list" role="list">
            {sections.map((section) => {
              const isActive = section.id === activeId;
              return (
                <li key={section.id} className="project-anchors__item">
                  <a
                    href={`#${section.id}`}
                    className={cn(
                      "project-anchors__link",
                      isActive && "is-active",
                    )}
                    aria-current={isActive ? "true" : undefined}
                    onClick={(event) => handleLinkClick(event, section.id)}
                  >
                    {section.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default ProjectAnchors;
