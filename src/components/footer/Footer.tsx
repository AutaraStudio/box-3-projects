/**
 * Footer
 * ======
 * Editorial site-wide footer. Layout (top to bottom):
 *
 *   ┌────────────────────────────────────────────────────────────┐
 *   │ Partners marquee — infinite, full-bleed checkerboard       │
 *   ├────────────────────────────────────────────────────────────┤
 *   │  PAGES · FEAT. PROJECTS · CONTACT · SOCIAL · LEGAL         │
 *   │  Copyright © …                                             │
 *   └────────────────────────────────────────────────────────────┘
 *
 * The partners marquee sits inside the footer (rather than as its
 * own section above it) so the brown band reads as one continuous
 * footer surface — a single hairline divider separates the marquee
 * from the columns.
 *
 * Always renders on the dark theme (brown bg + pink text) regardless
 * of the page theme above it. Async server component — loads the
 * partners singleton + SVGs server-side so the client gets a fully
 * resolved DOM (no marquee flicker on hydration).
 */

import SplitText from "@/components/split-text/SplitText";
import TransitionLink from "@/components/transition/TransitionLink";
import PartnersSection from "@/components/partners/PartnersSection";
import RevealStack from "@/components/ui/RevealStack";
import { loadPartners } from "@/lib/fetchPartners";

import "./Footer.css";

interface PageLink {
  label: string;
  href: string;
}

interface ExternalLink {
  label: string;
  href: string;
}

interface FeaturedProject {
  title: string;
  href: string;
}

interface FooterColumnLabels {
  pages?: string;
  featuredProjects?: string;
  contact?: string;
  social?: string;
  legal?: string;
}

interface FooterProps {
  pages: PageLink[];
  /** Optional — when provided, rendered as a "Featured Projects"
   *  column. Order is preserved as supplied. */
  featuredProjects?: FeaturedProject[];
  contact: {
    addressLines: string[];
    email: string;
    phone: string;
    /** href value, e.g. "tel:02080507815" */
    phoneHref: string;
  };
  social: ExternalLink[];
  legal: PageLink[];
  /** Brand label rendered in the copyright line. */
  brand?: string;
  /** Editable column titles + a11y labels — fall back to sensible defaults. */
  columnLabels?: FooterColumnLabels;
}

const FOOTER_LABEL_FALLBACK = {
  pages: "Pages",
  featuredProjects: "Featured Projects",
  contact: "Contact",
  social: "Social",
  legal: "Legal",
} as const;

export default async function Footer({
  pages,
  featuredProjects,
  contact,
  social,
  legal,
  brand = "Box 3 Projects",
  columnLabels,
}: FooterProps) {
  const labels = {
    pages: columnLabels?.pages ?? FOOTER_LABEL_FALLBACK.pages,
    featuredProjects:
      columnLabels?.featuredProjects ?? FOOTER_LABEL_FALLBACK.featuredProjects,
    contact: columnLabels?.contact ?? FOOTER_LABEL_FALLBACK.contact,
    social: columnLabels?.social ?? FOOTER_LABEL_FALLBACK.social,
    legal: columnLabels?.legal ?? FOOTER_LABEL_FALLBACK.legal,
  };
  const year = new Date().getFullYear();
  /* Pull the partners + their SVGs server-side. If the dataset has
     no partnersSection singleton, loadPartners returns sensible
     defaults and the marquee renders 0 cells (still 0px tall). */
  const partners = await loadPartners();

  return (
    <footer className="footer" data-theme="dark">
      {/* Partners marquee — full-bleed, infinite. Sits flush above
          the columns inside the same brown footer surface. */}
      {partners.partners.length > 0 ? (
        <PartnersSection
          heading={partners.heading}
          sectionLabel={partners.sectionLabel}
          partners={partners.partners}
        />
      ) : null}

      <div className="container footer__inner">
        <div className="footer__columns">
          {/* ── Pages ───────────────────────────────────────────── */}
          <section className="footer__column" aria-label={labels.pages}>
            <p className="footer__label text-small text-caps">{labels.pages}</p>
            <RevealStack as="ul" className="footer__list">
              {pages.map((page) => (
                <li key={page.href}>
                  <TransitionLink
                    href={page.href}
                    pageName={page.label}
                    className="footer__link link text-main"
                  >
                    <SplitText>{page.label}</SplitText>
                  </TransitionLink>
                </li>
              ))}
            </RevealStack>
          </section>

          {/* ── Featured Projects ───────────────────────────────── */}
          {featuredProjects && featuredProjects.length > 0 ? (
            <section
              className="footer__column"
              aria-label={labels.featuredProjects}
            >
              <p className="footer__label text-small text-caps">
                {labels.featuredProjects}
              </p>
              <RevealStack as="ul" className="footer__list">
                {featuredProjects.map((project) => (
                  <li key={project.href}>
                    <TransitionLink
                      href={project.href}
                      pageName={project.title}
                      className="footer__link link text-main"
                    >
                      <SplitText>{project.title}</SplitText>
                    </TransitionLink>
                  </li>
                ))}
              </RevealStack>
            </section>
          ) : null}

          {/* ── Contact ─────────────────────────────────────────── */}
          <section className="footer__column" aria-label={labels.contact}>
            <p className="footer__label text-small text-caps">{labels.contact}</p>
            <address className="footer__address text-main">
              {contact.addressLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </address>
            <RevealStack as="ul" className="footer__list">
              <li>
                <a
                  className="footer__link link text-main"
                  href={`mailto:${contact.email}`}
                >
                  <SplitText asWords>{contact.email}</SplitText>
                </a>
              </li>
              <li>
                <a
                  className="footer__link link text-main"
                  href={contact.phoneHref}
                >
                  <SplitText asWords>{contact.phone}</SplitText>
                </a>
              </li>
            </RevealStack>
          </section>

          {/* ── Social ──────────────────────────────────────────── */}
          <section className="footer__column" aria-label={labels.social}>
            <p className="footer__label text-small text-caps">{labels.social}</p>
            <RevealStack as="ul" className="footer__list">
              {social.map((item) => (
                <li key={item.href}>
                  <a
                    className="footer__link link text-main"
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <SplitText>{item.label}</SplitText>
                  </a>
                </li>
              ))}
            </RevealStack>
          </section>

          {/* ── Legal ───────────────────────────────────────────── */}
          <section className="footer__column" aria-label={labels.legal}>
            <p className="footer__label text-small text-caps">{labels.legal}</p>
            <RevealStack as="ul" className="footer__list">
              {legal.map((item) => (
                <li key={item.href}>
                  <TransitionLink
                    href={item.href}
                    pageName={item.label}
                    className="footer__link link text-main"
                  >
                    <SplitText>{item.label}</SplitText>
                  </TransitionLink>
                </li>
              ))}
            </RevealStack>
          </section>
        </div>

        {/* ── Bottom row — copyright ─────────────────────────────── */}
        <div className="footer__bottom">
          <p className="footer__copyright text-small text-caps">
            © {year} {brand}
          </p>
        </div>
      </div>
    </footer>
  );
}
