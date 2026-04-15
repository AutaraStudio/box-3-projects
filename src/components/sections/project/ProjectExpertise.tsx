/**
 * ProjectExpertise
 * ================
 * Server component. Renders the "Expertise & Services" list for a
 * project — numbered, rule-separated, editorial. Empty / missing
 * arrays short-circuit to null so the section disappears entirely.
 *
 * All animation hooks are data-attributes, driven by the global
 * AnimationProvider:
 *   - data-animate="fade-up" on the header
 *   - data-animate="fade-up" with staggered delay on each item
 */

import type { ExpertiseRef } from "@/sanity/queries/project";

import "./ProjectExpertise.css";

export interface ProjectExpertiseProps {
  expertise: ExpertiseRef[];
}

export function ProjectExpertise({ expertise }: ProjectExpertiseProps) {
  if (!expertise || expertise.length === 0) {
    return null;
  }

  return (
    <section
      className="project-expertise"
      data-theme="cream"
      data-nav-theme="light"
      aria-label="Expertise and services"
    >
      <div className="container">
        <div className="project-expertise__header" data-animate="fade-up">
          <h2 className="project-expertise__heading">
            Expertise &amp; Services
          </h2>
        </div>
        <ul className="project-expertise__list" role="list">
          {expertise.map((item, i) => (
            <li
              key={item._id}
              className="project-expertise__item"
              data-animate="fade-up"
              data-animate-delay={String(i * 0.06)}
            >
              <span className="project-expertise__number">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="project-expertise__title">{item.title}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default ProjectExpertise;
