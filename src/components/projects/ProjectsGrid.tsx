/**
 * ProjectsGrid
 * ============
 * Renders the project listing in the editorial alternating-section
 * pattern from the reference:
 *
 *   pair  →  wide  →  pair  →  wide  →  …
 *
 *   pair section  = 2 cards in a 12-col grid:
 *                   col-span-5            (card A, left)
 *                   col-span-5 col-start-8 (card B, right)
 *   wide section  = 1 card centred in the grid:
 *                   col-span-8 col-start-3
 *
 * The grouping is computed up front so the JSX is a flat list of
 * sections, each typed pair/wide. Sections themselves get the v2
 * container + 12-col grid utility (.container + .grid-12).
 */

import ProjectCard from "./ProjectCard";
import type { ProjectListItem } from "@/sanity/queries/projects";

import "./ProjectsGrid.css";

interface PairSection {
  type: "pair";
  items: [ProjectListItem, ProjectListItem];
  /** Starting 1-indexed position of the first card in this section. */
  startIndex: number;
}

interface WideSection {
  type: "wide";
  items: [ProjectListItem];
  startIndex: number;
}

type Section = PairSection | WideSection;

function groupIntoSections(projects: ProjectListItem[]): Section[] {
  const sections: Section[] = [];
  let i = 0;
  let pairFlag = true;
  while (i < projects.length) {
    if (pairFlag && i + 1 < projects.length) {
      sections.push({
        type: "pair",
        items: [projects[i], projects[i + 1]],
        startIndex: i + 1,
      });
      i += 2;
    } else {
      sections.push({
        type: "wide",
        items: [projects[i]],
        startIndex: i + 1,
      });
      i += 1;
    }
    pairFlag = !pairFlag;
  }
  return sections;
}

interface ProjectsGridProps {
  projects: ProjectListItem[];
}

export default function ProjectsGrid({ projects }: ProjectsGridProps) {
  const sections = groupIntoSections(projects);

  return (
    <div className="projects-grid">
      {sections.map((section, sectionIndex) => {
        if (section.type === "pair") {
          const [a, b] = section.items;
          return (
            <section
              key={`section-${sectionIndex}`}
              className="projects-grid__section projects-grid__section--pair"
            >
              <div className="container">
                <div className="projects-grid__row">
                  <div
                    className="projects-grid__cell projects-grid__cell--left project-card-wrap"
                    data-flip-id={a._id}
                    data-cat={a.category?.slug ?? ""}
                  >
                    <ProjectCard project={a} index={section.startIndex} />
                  </div>
                  <div
                    className="projects-grid__cell projects-grid__cell--right project-card-wrap"
                    data-flip-id={b._id}
                    data-cat={b.category?.slug ?? ""}
                  >
                    <ProjectCard project={b} index={section.startIndex + 1} />
                  </div>
                </div>
              </div>
            </section>
          );
        }
        const [only] = section.items;
        return (
          <section
            key={`section-${sectionIndex}`}
            className="projects-grid__section projects-grid__section--wide"
          >
            <div className="container">
              <div className="projects-grid__row">
                <div
                  className="projects-grid__cell projects-grid__cell--wide project-card-wrap"
                  data-flip-id={only._id}
                  data-cat={only.category?.slug ?? ""}
                >
                  <ProjectCard project={only} index={section.startIndex} />
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
