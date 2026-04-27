/**
 * CareersIntro
 * ============
 * Sits directly beneath the careers hero. A large statement
 * heading on the left (or centred at narrow widths) with an
 * intro paragraph carrying the studio voice on the right.
 *
 * Heading uses the SplitText reveal-on-view; the body
 * paragraphs reveal as a stack so multi-paragraph copy
 * staggers in.
 */

import Heading from "@/components/ui/Heading";
import RevealStack from "@/components/ui/RevealStack";

import "./CareersIntro.css";

interface CareersIntroProps {
  heading: string;
  body: string;
}

export default function CareersIntro({ heading, body }: CareersIntroProps) {
  /* Split the body on blank lines so editor-supplied paragraphs
     render as separate <p> elements with staggered reveal. */
  const paragraphs = body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section className="careers-intro">
      <div className="container careers-intro__inner">
        <Heading as="h2" className="careers-intro__heading text-h1">
          {heading}
        </Heading>
        <RevealStack as="div" className="careers-intro__body">
          {paragraphs.map((paragraph, i) => (
            <p key={i} className="careers-intro__paragraph text-large">
              {paragraph}
            </p>
          ))}
        </RevealStack>
      </div>
    </section>
  );
}
