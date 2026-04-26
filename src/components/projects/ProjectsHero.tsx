/**
 * ProjectsHero
 * ============
 * Cinematic hero matching the editorial reference's structure:
 *
 *   <h1 class="projects-hero__title">
 *     <span class="projects-hero__row">                     (h-100%, items-stretch)
 *       <span class="projects-hero__title-text text-display">Projects</span>
 *       <span class="projects-hero__counter text-h3">       (relative, h-100%)
 *         <span class="…spacer">(NNN)</span>                (invisible — reserves W)
 *         <span class="…visible">(NNN)</span>               (absolute top:0 left:0)
 *       </span>
 *     </span>
 *   </h1>
 *
 * Sizes come from v2 typography utilities — `.text-display` for the
 * title, `.text-h3` for the counter — instead of inline rem values
 * so the page stays on the token scale. The counter pins to the
 * top-left of an h-full container so it sits at the cap-line of the
 * giant title rather than the baseline.
 */

import SplitText from "@/components/split-text/SplitText";

import "./ProjectsHero.css";

interface ProjectsHeroProps {
  /** Heading text — defaults to "Projects". */
  title?: string;
  /** Total number of projects, rendered as a "(NNN)" pinned superscript. */
  count: number;
}

export default function ProjectsHero({
  title = "Projects",
  count,
}: ProjectsHeroProps) {
  const padded = `(${String(count).padStart(3, "0")})`;
  return (
    <section className="projects-hero-section">
      <div className="container projects-hero">
        <h1 className="projects-hero__title">
          <span className="projects-hero__row">
            <span className="projects-hero__title-text text-display">
              <SplitText revealOnScroll>{title}</SplitText>
            </span>
            <span className="projects-hero__counter text-h3">
              <span
                className="projects-hero__counter-spacer"
                aria-hidden="true"
              >
                {padded}
              </span>
              <span className="projects-hero__counter-visible">
                <SplitText revealOnScroll>{padded}</SplitText>
              </span>
            </span>
          </span>
        </h1>
      </div>
    </section>
  );
}
