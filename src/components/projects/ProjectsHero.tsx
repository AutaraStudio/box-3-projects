/**
 * ProjectsHero
 * ============
 * Hero of the projects listing page — a single inline-flex row with
 * the giant title "Projects" and a small counter superscript "(NNN)"
 * showing the total number of projects in the dataset.
 *
 * Both pieces use SplitText with `revealOnScroll` so the chars
 * stagger up from below the mask line as the hero enters view.
 */

import SplitText from "@/components/split-text/SplitText";

import "./ProjectsHero.css";

interface ProjectsHeroProps {
  /** Heading text — defaults to "Projects". */
  title?: string;
  /** Total number of projects, rendered as a "(NNN)" superscript. */
  count: number;
}

export default function ProjectsHero({
  title = "Projects",
  count,
}: ProjectsHeroProps) {
  const padded = String(count).padStart(3, "0");
  return (
    <section className="projects-hero">
      <div className="container">
        <h1 className="projects-hero__row">
          <span className="projects-hero__title">
            <SplitText revealOnScroll>{title}</SplitText>
          </span>
          <sup className="projects-hero__counter">
            <SplitText revealOnScroll>{`(${padded})`}</SplitText>
          </sup>
        </h1>
      </div>
    </section>
  );
}
