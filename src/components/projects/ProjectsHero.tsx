/**
 * ProjectsHero
 * ============
 * Cinematic hero matching the editorial reference exactly:
 *
 *   <h1 class="hero-title title-big">
 *     <span class="hero-row">                       (h-100%, items-stretch)
 *       <span class="hero-title-text">Projects</span>
 *       <span class="hero-counter">                  (relative, h-100%)
 *         <span class="spacer">(NNN)</span>          (invisible — reserves W-space)
 *         <span class="visible">(NNN)</span>         (absolute top:0 left:0)
 *       </span>
 *     </span>
 *   </h1>
 *
 * The counter doesn't sit on the baseline — it pins to the top-left
 * of an h-full container so it lines up with the cap-line of the
 * giant "Projects" title.
 *
 * Page-enter animation runs in ProjectsClient (slides title in from
 * x: 10vw); we just expose the elements via class names.
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
            <span className="projects-hero__title-text">
              <SplitText revealOnScroll>{title}</SplitText>
            </span>
            <span className="projects-hero__counter">
              {/* Spacer — invisible copy that reserves the horizontal
                  space so the visible absolute one has a width to
                  pin against. */}
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
