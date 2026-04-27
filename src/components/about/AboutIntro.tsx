/**
 * AboutIntro
 * ==========
 * Two-column statement on the about page. Heading on the left
 * (5fr), short body on the right (6fr) with a 1fr dead-space
 * gutter in between — same 5/1/6 grid the other intro sections
 * use, so the page rhythm reads coherently across the site.
 *
 * Mobile collapses to a single stacked column.
 */

import Heading from "@/components/ui/Heading";

import "./AboutIntro.css";

interface AboutIntroProps {
  heading: string;
  body: string;
}

export default function AboutIntro({ heading, body }: AboutIntroProps) {
  /* Body may be a multi-paragraph string with double-newline
     separators — split + render as separate <p> elements so each
     paragraph gets its own spacing rhythm. */
  const paragraphs = body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section className="about-intro" data-theme="cream">
      <div className="container about-intro__inner">
        <Heading as="h2" className="about-intro__heading text-h2">
          {heading}
        </Heading>
        <div className="about-intro__body">
          {paragraphs.map((paragraph, i) => (
            <p key={i} className="about-intro__paragraph text-large">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
