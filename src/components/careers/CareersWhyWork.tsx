/**
 * CareersWhyWork
 * ==============
 * Editorial 4-item list. Section label on the left, the items
 * stack on the right with a hairline between each. Every item
 * is a heading + paragraph pair. Ports the Populous "Why work
 * with us" pattern to v2 conventions.
 *
 *   ┌────────────────────────────────────────────────────────┐
 *   │  Why work with us       ┌────────────────────────────┐ │
 *   │                         │ 01  Culture                │ │
 *   │                         │     Body paragraph…        │ │
 *   │                         │ ─────────────────────────  │ │
 *   │                         │ 02  End-to-end ownership   │ │
 *   │                         │     Body paragraph…        │ │
 *   │                         │ ─────────────────────────  │ │
 *   │                         │ …                          │ │
 *   │                         └────────────────────────────┘ │
 *   └────────────────────────────────────────────────────────┘
 *
 * Items reveal one-by-one via RevealStack as the section enters
 * the viewport. Each title gets the SplitText word-stagger via
 * the <Heading> component.
 */

import Button from "@/components/ui/Button";
import Heading from "@/components/ui/Heading";
import RevealStack from "@/components/ui/RevealStack";
import type { CareersWhyWorkItem } from "@/sanity/queries/careersPage";

import "./CareersWhyWork.css";

interface CareersWhyWorkProps {
  heading?: string;
  items: CareersWhyWorkItem[];
  /** Optional CTA below the list. Both must be set for the
   *  button to render — keeps existing call-sites unaffected. */
  ctaLabel?: string;
  ctaHref?: string;
  ctaPageName?: string;
}

export default function CareersWhyWork({
  heading = "Why work with us",
  items,
  ctaLabel,
  ctaHref,
  ctaPageName,
}: CareersWhyWorkProps) {
  if (items.length === 0) return null;

  return (
    <section className="careers-why">
      <div className="container careers-why__inner">
        <header className="careers-why__head">
          <p className="careers-why__label text-small text-caps">
            {heading}
          </p>
        </header>

        <RevealStack
          as="ul"
          childSelector=".careers-why__item"
          className="careers-why__list"
        >
          {items.map((item, index) => (
            <li key={item.title} className="careers-why__item">
              <span
                className="careers-why__index text-small text-caps"
                aria-hidden="true"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="careers-why__content">
                <Heading
                  as="h3"
                  className="careers-why__title text-h3"
                >
                  {item.title}
                </Heading>
                <p className="careers-why__body text-large">{item.body}</p>
              </div>
            </li>
          ))}
        </RevealStack>

        {ctaLabel && ctaHref ? (
          <div className="careers-why__cta">
            <Button href={ctaHref} pageName={ctaPageName} size="lg">
              {ctaLabel}
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
