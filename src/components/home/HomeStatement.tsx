/**
 * HomeStatement
 * =============
 * Editorial intro block beneath the hero. Uses the same 12-col
 * grid arrangement as the previous LineScroll section — small
 * caps label on the left, statement sentence + supporting line
 * on the right — but without the scroll-tracking "we" anchor.
 *
 * Two stacked rows:
 *   row 1: label (col 5) · heading sentence (col 6+)
 *   row 2: ·              · supporting sentence (col 6+)
 *
 * Mobile collapses both rows to single-column flow.
 */

import Button from "@/components/ui/Button";
import Heading from "@/components/ui/Heading";

import "./HomeStatement.css";

interface HomeStatementProps {
  label?: string;
  heading: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
  ctaPageName?: string;
  theme?: "dark" | "cream" | "pink";
}

export default function HomeStatement({
  label = "About",
  heading,
  body,
  ctaLabel,
  ctaHref,
  ctaPageName,
  theme = "dark",
}: HomeStatementProps) {
  return (
    <section className="home-statement" data-theme={theme}>
      <div className="container home-statement__inner">
        <div className="home-statement__label-cell">
          <p className="home-statement__label text-small text-caps">
            {label}
          </p>
        </div>

        <div className="home-statement__content">
          <Heading
            as="h2"
            className="home-statement__heading text-h2"
          >
            {heading}
          </Heading>
          <p className="home-statement__body text-large">{body}</p>
          {ctaLabel && ctaHref ? (
            <div className="home-statement__cta">
              <Button href={ctaHref} pageName={ctaPageName} size="lg">
                {ctaLabel}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
