/**
 * ServicesIntro
 * =============
 * Two-column statement on the services page. Heading on the left
 * (5fr), short body on the right (6fr) with a 1fr dead-space
 * gutter in between — same 5/1/6 grid the careers + sustainability
 * intros use, so the page rhythm reads coherently across the site.
 *
 * Mobile collapses to a single stacked column.
 */

import Heading from "@/components/ui/Heading";

import "./ServicesIntro.css";

interface ServicesIntroProps {
  heading: string;
  body: string;
}

export default function ServicesIntro({ heading, body }: ServicesIntroProps) {
  /* Body may be a multi-paragraph string with double-newline
     separators — split + render as separate <p> elements so each
     paragraph gets the spacing rhythm. */
  const paragraphs = body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  return (
    <section className="services-intro" data-theme="cream">
      <div className="container services-intro__inner">
        <Heading as="h2" className="services-intro__heading text-h2">
          {heading}
        </Heading>
        <div className="services-intro__body">
          {paragraphs.map((paragraph, i) => (
            <p key={i} className="services-intro__paragraph text-large">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
