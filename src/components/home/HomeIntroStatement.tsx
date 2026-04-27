/**
 * HomeIntroStatement
 * ==================
 * Editorial positioning block. Sits directly below the hero and
 * states what the studio is — before any imagery. Two-up: a
 * small caps label on the left, a stack of `text-large`
 * paragraphs on the right.
 *
 * Pure typography, no assets. Theme defaults to `cream`.
 */

import Heading from "@/components/ui/Heading";
import RevealStack from "@/components/ui/RevealStack";

import "./HomeIntroStatement.css";

interface HomeIntroStatementProps {
  label?: string;
  heading?: string;
  paragraphs: string[];
  theme?: "dark" | "cream" | "pink";
}

export default function HomeIntroStatement({
  label = "About",
  heading,
  paragraphs,
  theme = "cream",
}: HomeIntroStatementProps) {
  return (
    <section className="home-intro" data-theme={theme}>
      <div className="container home-intro__inner">
        <p className="home-intro__label text-small text-caps">{label}</p>

        <div className="home-intro__body">
          {heading ? (
            <Heading as="h2" className="home-intro__heading text-h3">
              {heading}
            </Heading>
          ) : null}

          <RevealStack className="home-intro__paragraphs">
            {paragraphs.map((p, i) => (
              <p key={i} className="home-intro__paragraph text-large">
                {p}
              </p>
            ))}
          </RevealStack>
        </div>
      </div>
    </section>
  );
}
