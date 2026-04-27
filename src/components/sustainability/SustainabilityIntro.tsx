/**
 * SustainabilityIntro
 * ===================
 * Statement section directly beneath the hero. Same shape as
 * CareersIntro — display heading on the left, body paragraphs
 * on the right.
 */

import Heading from "@/components/ui/Heading";
import RevealStack from "@/components/ui/RevealStack";

import "./SustainabilityIntro.css";

interface SustainabilityIntroProps {
  heading: string;
  body: string;
}

export default function SustainabilityIntro({
  heading,
  body,
}: SustainabilityIntroProps) {
  const paragraphs = body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section className="sustainability-intro">
      <div className="container sustainability-intro__inner">
        <Heading
          as="h2"
          className="sustainability-intro__heading text-h1"
        >
          {heading}
        </Heading>
        <RevealStack as="div" className="sustainability-intro__body">
          {paragraphs.map((paragraph, i) => (
            <p
              key={i}
              className="sustainability-intro__paragraph text-large"
            >
              {paragraph}
            </p>
          ))}
        </RevealStack>
      </div>
    </section>
  );
}
