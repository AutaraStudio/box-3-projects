/**
 * LegalPage
 * =========
 * Editorial layout for the Privacy Policy / Terms & Conditions
 * pages. 12-column grid on desktop: sticky TOC rail in the left
 * margin, numbered sections in the editorial column. Collapses to
 * a stacked layout with a disclosure-style TOC on mobile.
 *
 * The TOC tracks the currently-visible section via an
 * IntersectionObserver, paints an animated indicator next to the
 * active item, and routes clicks through the page's Lenis instance
 * so anchor jumps share the same smooth scrolling as the rest of
 * the site.
 *
 * Content is rendered through `@portabletext/react` with custom
 * components mapped to v2's design tokens.
 */

"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import { PortableText, type PortableTextComponents } from "@portabletext/react";

import Heading from "@/components/ui/Heading";
import { useSiteSettings } from "@/components/settings/SiteSettingsProvider";
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

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

const portableTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="legal-page__p">{children}</p>,
    h3: ({ children }) => <h3 className="legal-page__h3 text-h5">{children}</h3>,
    h4: ({ children }) => <h4 className="legal-page__h4 text-h6">{children}</h4>,
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
  const labels = useSiteSettings()?.legalPageLabels;
  const [activeId, setActiveId] = useState<string | null>(
    sections[0]?.anchorId ?? null,
  );
  const [progress, setProgress] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  const anchorIds = useMemo(() => sections.map((s) => s.anchorId), [sections]);

  /* Scroll-spy: pick the section whose top has most recently crossed
     the reading line (~25% from viewport top). Plain scroll listener
     beats IntersectionObserver here because the "currently reading"
     section is whichever heading is highest above the line — easy to
     compute, hard to express as observer thresholds. Also drives an
     overall reading-progress value used by the rail fill. */
  useEffect(() => {
    if (anchorIds.length === 0) return;

    const update = () => {
      const els = anchorIds
        .map((id) => sectionRefs.current.get(id))
        .filter((el): el is HTMLElement => Boolean(el));
      if (els.length === 0) return;

      const line = window.innerHeight * 0.25;
      let current = els[0]!.id;
      for (const el of els) {
        const top = el.getBoundingClientRect().top;
        if (top - line <= 0) current = el.id;
        else break;
      }
      setActiveId(current);

      const first = els[0]!.getBoundingClientRect().top + window.scrollY;
      const lastEl = els[els.length - 1]!;
      const last =
        lastEl.getBoundingClientRect().bottom + window.scrollY - window.innerHeight;
      const span = Math.max(1, last - first);
      const p = (window.scrollY - first) / span;
      setProgress(Math.min(1, Math.max(0, p)));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [anchorIds]);

  const handleTocClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, anchorId: string) => {
      if (typeof window === "undefined") return;
      const target = sectionRefs.current.get(anchorId);
      if (!target) return;

      event.preventDefault();
      setMobileOpen(false);

      /* Offset accounts for the fixed header + a little breathing
         room so the heading doesn't collide with the nav. */
      const headerVar = getComputedStyle(document.documentElement)
        .getPropertyValue("--header-bottom")
        .trim();
      const fontVar = getComputedStyle(document.documentElement)
        .getPropertyValue("--size-font")
        .trim();
      const fontPx = parseFloat(fontVar) || 16;
      const headerRem = parseFloat(headerVar) || 6;
      const offset = -(headerRem * fontPx + fontPx * 1.5);

      if (window.__lenis) {
        window.__lenis.scrollTo(target, { offset, duration: 1.1 });
      } else {
        const top =
          target.getBoundingClientRect().top + window.scrollY + offset;
        window.scrollTo({ top, behavior: "smooth" });
      }

      if (typeof history !== "undefined") {
        history.replaceState(null, "", `#${anchorId}`);
      }
    },
    [],
  );

  const setSectionRef = (anchorId: string) => (node: HTMLElement | null) => {
    if (node) sectionRefs.current.set(anchorId, node);
    else sectionRefs.current.delete(anchorId);
  };

  const activeIndex = Math.max(
    0,
    sections.findIndex((s) => s.anchorId === activeId),
  );

  return (
    <main className="legal-page">
      <div className="container legal-page__inner">
        <header className="legal-page__header">
          {eyebrow ? (
            <p className="legal-page__eyebrow text-small text-caps">
              {eyebrow}
            </p>
          ) : null}
          <Heading as="h1" className="legal-page__title text-display">
            {title}
          </Heading>
          {intro ? (
            <p className="legal-page__intro text-large">{intro}</p>
          ) : null}
          <dl className="legal-page__header-meta">
            <div className="legal-page__meta">
              <dt className="legal-page__meta-label text-small text-caps">
                {labels?.lastUpdatedLabel ?? "Last updated"}
              </dt>
              <dd className="legal-page__meta-value">
                <time dateTime={lastUpdated}>{formatDate(lastUpdated)}</time>
              </dd>
            </div>
            <div className="legal-page__meta">
              <dt className="legal-page__meta-label text-small text-caps">
                Sections
              </dt>
              <dd className="legal-page__meta-value">
                {pad2(sections.length)}
              </dd>
            </div>
            <div className="legal-page__meta">
              <dt className="legal-page__meta-label text-small text-caps">
                Reading time
              </dt>
              <dd className="legal-page__meta-value">
                ~{Math.max(1, Math.round(sections.length * 0.75))} min
              </dd>
            </div>
          </dl>
        </header>

        <div className="legal-page__body">
          <aside
            className="legal-page__toc"
            aria-label={labels?.tocAriaLabel ?? "Table of contents"}
          >
            {/* Mobile disclosure trigger. Desktop hides the
                button and shows the list permanently. */}
            <button
              type="button"
              className="legal-page__toc-toggle"
              aria-expanded={mobileOpen}
              aria-controls="legal-page-toc-list"
              onClick={() => setMobileOpen((open) => !open)}
            >
              <span className="legal-page__toc-toggle-label text-small text-caps">
                <span className="legal-page__toc-toggle-heading">
                  {tocHeading}
                </span>
                <span className="legal-page__toc-toggle-active">
                  {pad2(activeIndex + 1)} —{" "}
                  {sections[activeIndex]?.heading ?? ""}
                </span>
              </span>
              <span className="legal-page__toc-toggle-icon" aria-hidden="true" />
            </button>

            <div
              className="legal-page__toc-inner"
              data-open={mobileOpen || undefined}
            >
              <div className="legal-page__toc-head">
                <h2 className="legal-page__toc-heading text-small text-caps">
                  {tocHeading}
                </h2>
                <span
                  className="legal-page__toc-progress"
                  aria-hidden="true"
                  style={{ "--toc-progress": progress } as React.CSSProperties}
                >
                  <span className="legal-page__toc-progress-fill" />
                </span>
              </div>

              <div
                className="legal-page__toc-list-wrap"
                style={
                  {
                    "--toc-active-index": activeIndex,
                    "--toc-count": sections.length,
                  } as React.CSSProperties
                }
              >
                <span className="legal-page__toc-rail" aria-hidden="true">
                  <span className="legal-page__toc-rail-indicator" />
                </span>
                <ol
                  id="legal-page-toc-list"
                  className="legal-page__toc-list"
                >
                {sections.map((section, index) => {
                  const isActive = section.anchorId === activeId;
                  return (
                    <li key={section._key} className="legal-page__toc-item">
                      <a
                        href={`#${section.anchorId}`}
                        className="legal-page__toc-link"
                        data-active={isActive || undefined}
                        aria-current={isActive ? "true" : undefined}
                        onClick={(e) => handleTocClick(e, section.anchorId)}
                      >
                        <span className="legal-page__toc-index">
                          {pad2(index + 1)}
                        </span>
                        <span className="legal-page__toc-text">
                          {section.heading}
                        </span>
                      </a>
                    </li>
                  );
                })}
                </ol>
              </div>
            </div>
          </aside>

          <div className="legal-page__content">
            {sections.map((section, index) => (
              <section
                key={section._key}
                id={section.anchorId}
                ref={setSectionRef(section.anchorId)}
                className="legal-page__section"
                data-active={section.anchorId === activeId || undefined}
              >
                <header className="legal-page__section-header">
                  <span className="legal-page__section-index text-small text-caps">
                    {pad2(index + 1)} / {pad2(sections.length)}
                  </span>
                  <h2 className="legal-page__section-heading text-h3">
                    <a
                      href={`#${section.anchorId}`}
                      className="legal-page__section-anchor"
                      aria-label={`Link to ${section.heading}`}
                      onClick={(e) => handleTocClick(e, section.anchorId)}
                    >
                      {section.heading}
                    </a>
                  </h2>
                </header>
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
    </main>
  );
}
