/**
 * LegalPage
 * =========
 * Editorial layout for legal documents (privacy policy, terms &
 * conditions). Two-column on desktop: a sticky table of contents
 * on the left, the main rich-text body on the right.
 *
 * All content received via props from a `legalPage` Sanity doc.
 */

import { PortableText, type PortableTextComponents } from "@portabletext/react";

import type { LegalPageSection } from "@/sanity/queries/legalPage";

import "./LegalPage.css";

interface LegalPageProps {
  title: string;
  eyebrow?: string;
  lastUpdated: string;
  intro?: string;
  tocHeading?: string;
  sections: LegalPageSection[];
}

/* Format an ISO date (YYYY-MM-DD) as "07 May 2026". Server-rendered,
   so locale is fixed to en-GB for stable output. */
function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

const portableTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="legal-page__p">{children}</p>,
    h3: ({ children }) => <h3 className="legal-page__h3">{children}</h3>,
    h4: ({ children }) => <h4 className="legal-page__h4">{children}</h4>,
    blockquote: ({ children }) => (
      <blockquote className="legal-page__quote">{children}</blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="legal-page__list legal-page__list--bullet">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="legal-page__list legal-page__list--number">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="legal-page__li">{children}</li>,
    number: ({ children }) => <li className="legal-page__li">{children}</li>,
  },
  marks: {
    link: ({ value, children }) => {
      const href = (value?.href as string | undefined) ?? "#";
      const isExternal = /^https?:\/\//.test(href);
      return (
        <a
          href={href}
          className="legal-page__link"
          {...(isExternal
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {children}
        </a>
      );
    },
    strong: ({ children }) => (
      <strong className="legal-page__strong">{children}</strong>
    ),
    em: ({ children }) => <em className="legal-page__em">{children}</em>,
    underline: ({ children }) => (
      <span className="legal-page__underline">{children}</span>
    ),
  },
};

export default function LegalPage({
  title,
  eyebrow,
  lastUpdated,
  intro,
  tocHeading = "Contents",
  sections,
}: LegalPageProps) {
  return (
    <section
      className="legal-page"
      data-theme="cream"
      data-nav-theme="cream"
    >
      <div className="container is--m legal-page__container">
        {/* ── Header ─────────────────────────────────────── */}
        <header className="legal-page__header">
          {eyebrow ? (
            <div className="legal-page__eyebrow font-secondary">
              {eyebrow}
            </div>
          ) : null}
          <h1 className="legal-page__title font-primary font-medium">
            {title}
          </h1>
          <div className="legal-page__meta font-secondary">
            <span className="legal-page__meta-label">Last updated</span>
            <time dateTime={lastUpdated} className="legal-page__meta-value">
              {formatDate(lastUpdated)}
            </time>
          </div>
          {intro ? (
            <p className="legal-page__intro font-secondary">{intro}</p>
          ) : null}
        </header>

        {/* ── Body: TOC + sections ───────────────────────── */}
        <div className="legal-page__body">
          <aside className="legal-page__toc" aria-label="Table of contents">
            <div className="legal-page__toc-inner">
              <h2 className="legal-page__toc-heading font-secondary">
                {tocHeading}
              </h2>
              <ol className="legal-page__toc-list">
                {sections.map((section, index) => (
                  <li key={section._key} className="legal-page__toc-item">
                    <a
                      href={`#${section.anchorId}`}
                      className="legal-page__toc-link"
                    >
                      <span className="legal-page__toc-index">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="legal-page__toc-text">
                        {section.heading}
                      </span>
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </aside>

          <div className="legal-page__content">
            {sections.map((section, index) => (
              <section
                key={section._key}
                id={section.anchorId}
                className="legal-page__section"
              >
                <div className="legal-page__section-label font-secondary">
                  <span>§ {String(index + 1).padStart(2, "0")}</span>
                </div>
                <h2 className="legal-page__section-heading font-primary font-medium">
                  {section.heading}
                </h2>
                <div className="legal-page__section-body">
                  <PortableText
                    value={section.body}
                    components={portableTextComponents}
                  />
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
