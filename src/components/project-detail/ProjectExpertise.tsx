/**
 * ProjectExpertise
 * ================
 * Editorial ruled list of expertise tags applied on the project.
 *
 *   ┌─ Expertise ──────────────────────────────────────────────┐
 *   │                                                          │
 *   │   01   Lighting design                                   │
 *   │   ──────────────────────────────────────────────────     │
 *   │   02   Acoustic engineering                              │
 *   │   ──────────────────────────────────────────────────     │
 *   │   03   Bespoke joinery                                   │
 *   │                                                          │
 *   └──────────────────────────────────────────────────────────┘
 *
 * Layout intent (refined from v1):
 *   - 2-col on desktop. Left: section label ("Expertise") in small
 *     caps, plus a count.  Right: the indexed list.
 *   - Mobile collapses to single column with the label on top.
 *   - Each row: a 2-digit padded index + expertise title, with a
 *     directional hover-tile sweeping in from the cursor's entry
 *     edge. Items are static (non-link) — the affordance is
 *     informational rather than navigational.
 *
 * Renders nothing if the project has no expertise tags.
 */

import {
  DirectionalHoverList,
  DirectionalHoverItem,
} from "@/components/ui/DirectionalHoverList";
import type { ProjectExpertiseRef } from "@/sanity/queries/projects";

import "./ProjectExpertise.css";

interface ProjectExpertiseProps {
  expertise: ProjectExpertiseRef[];
}

export default function ProjectExpertise({
  expertise,
}: ProjectExpertiseProps) {
  if (expertise.length === 0) return null;

  return (
    <section className="project-expertise" data-theme="cream">
      <div className="container project-expertise__inner">
        <header className="project-expertise__header">
          <p className="project-expertise__label text-small text-caps">
            Expertise
          </p>
          <p className="project-expertise__count text-small text-caps">
            ({String(expertise.length).padStart(2, "0")})
          </p>
        </header>

        <DirectionalHoverList
          axis="y"
          className="project-expertise__list"
        >
          {expertise.map((item, index) => (
            <DirectionalHoverItem
              key={item._id}
              className="project-expertise__row"
            >
              <span
                className="project-expertise__index text-small text-caps"
                aria-hidden="true"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="project-expertise__title text-h5">
                {item.title}
              </p>
            </DirectionalHoverItem>
          ))}
        </DirectionalHoverList>
      </div>
    </section>
  );
}
