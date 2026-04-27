/**
 * ProjectStats
 * ============
 * Stat grid below the hero — flexible label/value pairs sourced from
 * the project's `stats` array (Client, Size, Cost, Completed, etc.).
 * Renders nothing if the project has no stats.
 *
 * Layout: 2-col on mobile, 4-col on desktop. Each stat is a small
 * caps label above a `text-large` value so the row reads as a fact
 * sheet rather than a sentence.
 */

import type { ProjectStat } from "@/sanity/queries/projects";

import "./ProjectStats.css";

interface ProjectStatsProps {
  stats: ProjectStat[];
}

export default function ProjectStats({ stats }: ProjectStatsProps) {
  if (stats.length === 0) return null;

  return (
    <section className="project-stats">
      <div className="container">
        <dl className="project-stats__grid">
          {stats.map((stat) => (
            <div key={stat._key} className="project-stats__item">
              <dt className="project-stats__label text-small text-caps">
                {stat.label}
              </dt>
              <dd className="project-stats__value text-large">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
