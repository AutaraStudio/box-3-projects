/**
 * SustainabilityIntro
 * ===================
 * Statement section directly beneath the hero. Same shape as
 * CareersIntro — display heading on the left, body paragraphs
 * on the right.
 */

import Image from "next/image";

import Heading from "@/components/ui/Heading";
import RevealStack from "@/components/ui/RevealStack";

import "./SustainabilityIntro.css";

interface SustainabilityIntroProps {
  heading: string;
  body: string;
  /** Accreditation badges shown beneath the heading. Resolved by the
   *  page (Sanity image or the built-in default). */
  image?: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
}

export default function SustainabilityIntro({
  heading,
  body,
  image,
}: SustainabilityIntroProps) {
  const paragraphs = body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section className="sustainability-intro">
      <div className="container sustainability-intro__inner">
        <div className="sustainability-intro__lead">
          <Heading
            as="h2"
            className="sustainability-intro__heading text-h1"
          >
            {heading}
          </Heading>
          {image ? (
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              sizes="16rem"
              className="sustainability-intro__badges"
            />
          ) : null}
        </div>
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
