/**
 * HomeApproach
 * ============
 * Typographic editorial block. Asymmetric two-column layout —
 * left column carries a numbered "principles" list (acts as a
 * margin annotation), right column carries the headline +
 * paragraph + CTA.
 *
 * Pure typography, no assets. Theme defaults to `pink` so the
 * page reads as a colour beat between the cream IntroStatement
 * and the cream Featured grid.
 */

import Button from "@/components/ui/Button";
import Heading from "@/components/ui/Heading";
import RevealStack from "@/components/ui/RevealStack";

import "./HomeApproach.css";

interface HomeApproachProps {
  label?: string;
  principles: string[];
  heading: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
  theme?: "dark" | "cream" | "pink";
}

export default function HomeApproach({
  label = "Approach",
  principles,
  heading,
  body,
  ctaLabel = "More about Box 3 →",
  ctaHref = "/about",
  theme = "pink",
}: HomeApproachProps) {
  return (
    <section className="home-approach" data-theme={theme}>
      <div className="container home-approach__inner">
        <aside className="home-approach__aside">
          <p className="home-approach__label text-small text-caps">
            {label}
          </p>
          <RevealStack
            as="ol"
            className="home-approach__principles"
          >
            {principles.map((line, i) => (
              <li
                key={i}
                className="home-approach__principle text-main"
              >
                <span className="home-approach__num text-small text-caps">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="home-approach__principle-text">
                  {line}
                </span>
              </li>
            ))}
          </RevealStack>
        </aside>

        <div className="home-approach__body">
          <Heading as="h2" className="home-approach__heading text-h2">
            {heading}
          </Heading>
          <p className="home-approach__paragraph text-large">{body}</p>
          <div className="home-approach__cta">
            <Button href={ctaHref} pageName="About" size="lg">
              {ctaLabel}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
