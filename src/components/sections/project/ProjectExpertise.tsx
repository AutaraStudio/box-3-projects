/**
 * ProjectExpertise
 * =================
 * Ruled list section mirroring the reference "Awards and recognition"
 * layout. Each row is delineated by a top border; an enclosing bottom
 * border closes the list.
 *
 * Renders project.expertise[] from Sanity — a list of
 * { _id, title } references to the expertise collection. One row per
 * expertise tag.
 */

import type { ExpertiseRef } from "@/sanity/queries/project";

import "./ProjectExpertise.css";

/* --------------------------------------------------------------------------
   Props
   -------------------------------------------------------------------------- */

export interface ProjectExpertiseProps {
  expertise: ExpertiseRef[];
  heading?: string;
}

/* --------------------------------------------------------------------------
   Component
   -------------------------------------------------------------------------- */

export default function ProjectExpertise({
  expertise,
  heading = "Expertise",
}: ProjectExpertiseProps) {
  if (expertise.length === 0) return null;

  return (
    <section className="project-expertise">
      <div className="project-expertise__header container">
        <h2
          className="project-expertise__heading font-primary text-h4 font-medium leading-snug tracking-snug"
        >
          {heading}
        </h2>
      </div>
      <div className="project-expertise__inner container">
        <ul className="project-expertise__list">
          {expertise.map((item, index) => (
            <li
              key={item._id}
              className="project-expertise__item"
            >
              <span
                className="project-expertise__index font-secondary text-text-xs tracking-caps uppercase"
                aria-hidden="true"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="project-expertise__title font-primary text-h4 leading-snug tracking-snug">
                {item.title}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
