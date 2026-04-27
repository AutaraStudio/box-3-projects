/**
 * SustainabilityPrinciples
 * ========================
 * Numbered principles list — sticky label on the left, indexed
 * items on the right with a heading + body. Same shape as the
 * careers "Why work with us" pattern, intentionally — both are
 * commitments-as-list.
 *
 * Anchor id="principles" — matches the hero CTA so "Our
 * principles" jumps here.
 */

import Heading from "@/components/ui/Heading";
import RevealStack from "@/components/ui/RevealStack";
import type { SustainabilityPillarItem } from "@/sanity/queries/sustainabilityPage";

import "./SustainabilityPrinciples.css";

interface SustainabilityPrinciplesProps {
  label?: string;
  heading?: string;
  intro?: string;
  items: SustainabilityPillarItem[];
}

export default function SustainabilityPrinciples({
  label = "Principles",
  heading,
  intro,
  items,
}: SustainabilityPrinciplesProps) {
  if (items.length === 0) return null;

  return (
    <section id="principles" className="sustainability-principles">
      <div className="container sustainability-principles__inner">
        <aside className="sustainability-principles__aside">
          <p className="sustainability-principles__label text-small text-caps">
            {label}
          </p>
          {heading ? (
            <Heading
              as="h2"
              className="sustainability-principles__heading text-h3"
            >
              {heading}
            </Heading>
          ) : null}
          {intro ? (
            <p className="sustainability-principles__intro text-large">
              {intro}
            </p>
          ) : null}
        </aside>

        <RevealStack
          as="ul"
          childSelector=".sustainability-principles__item"
          className="sustainability-principles__list"
        >
          {items.map((item, index) => (
            <li key={item.title} className="sustainability-principles__item">
              <span
                className="sustainability-principles__index text-small text-caps"
                aria-hidden="true"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="sustainability-principles__content">
                <Heading
                  as="h3"
                  className="sustainability-principles__title text-h4"
                >
                  {item.title}
                </Heading>
                <p className="sustainability-principles__body text-large">
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </RevealStack>
      </div>
    </section>
  );
}
