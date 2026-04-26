/**
 * MenuOverlay
 * ===========
 * Full-viewport modal that animates open from the top-right corner
 * (where the Header trigger sits). Layout mirrors the editorial
 * reference: 12-column × 3-row grid that fills the modal height.
 *
 *   ┌───────────┬──────────────────────────┬───────────┐
 *   │   PAGES   │ ─ row 1 ─ Featured #1    │  SOCIAL   │
 *   │  (3 × 2)  │                          │  (2 × 2)  │
 *   │           │ ─ row 2 ─ Featured #2    │           │
 *   ├───────────┼──────────────────────────┼───────────┤
 *   │  CONTACT  │ ─ row 3 ─ Featured #3    │  LEGAL    │
 *   └───────────┴──────────────────────────┴───────────┘
 *
 * Each featured-project cell carries left + right border lines and
 * has its content anchored top (label + title) and bottom (View
 * Project + details table) so the typography pulls towards the
 * column lines.
 *
 * Always rendered with `data-theme="dark"` so brown bg + pink text
 * apply regardless of the host page theme. Closes on Escape (handled
 * in MenuProvider) and when any internal nav link is clicked. Every
 * link/button text runs through SplitText so the editorial char
 * roll-over hover applies site-wide.
 */

"use client";

import SplitText from "@/components/split-text/SplitText";
import TransitionLink from "@/components/transition/TransitionLink";
import { useMenu } from "./MenuProvider";
import "./MenuOverlay.css";

interface PageLink {
  label: string;
  href: string;
}

interface ProjectDetail {
  label: string;
  value: string;
}

interface FeaturedProject {
  title: string;
  href: string;
  /** Up to 4 label/value rows shown beneath the project title. */
  details: ProjectDetail[];
}

interface ExternalLink {
  label: string;
  href: string;
}

interface MenuOverlayProps {
  pages: PageLink[];
  /** Up to 3 — fills one row each in the middle column. */
  featuredProjects: FeaturedProject[];
  contact: {
    addressLines: string[];
    email: string;
    phone: string;
    /** href value, e.g. "tel:02080507815" */
    phoneHref: string;
  };
  social: ExternalLink[];
  legal: PageLink[];
}

export default function MenuOverlay({
  pages,
  featuredProjects,
  contact,
  social,
  legal,
}: MenuOverlayProps) {
  const { isOpen, close } = useMenu();
  const projects = featuredProjects.slice(0, 3);

  return (
    <aside
      id="site-menu"
      className="menu-overlay"
      data-theme="dark"
      data-open={isOpen}
      aria-hidden={!isOpen}
    >
      <div className="menu-overlay__grid">
        {/* ── Pages — left col, spans 3×2 ───────────────────────── */}
        <nav className="menu-overlay__pages" aria-label="Pages">
          <p className="menu-overlay__label text-small text-caps">Pages</p>
          <ul className="menu-overlay__page-list">
            {pages.map((page) => (
              <li key={page.href}>
                <TransitionLink
                  href={page.href}
                  pageName={page.label}
                  className="menu-overlay__page-link link text-h3"
                  onClick={close}
                >
                  <SplitText>{page.label}</SplitText>
                </TransitionLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* ── Featured project 1 — middle, row 1 ───────────────── */}
        {projects[0] && (
          <FeaturedProjectBlock project={projects[0]} onLinkClick={close} />
        )}

        {/* ── Social — right col, spans 2×2 ────────────────────── */}
        <section className="menu-overlay__social" aria-label="Social">
          <p className="menu-overlay__label text-small text-caps">Social</p>
          <ul className="menu-overlay__simple-list">
            {social.map((item) => (
              <li key={item.href}>
                <a
                  className="menu-overlay__plain-link link text-large"
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SplitText>{item.label}</SplitText>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Featured project 2 — middle, row 2 ───────────────── */}
        {projects[1] && (
          <FeaturedProjectBlock project={projects[1]} onLinkClick={close} />
        )}

        {/* ── Contact — left col, row 3 ────────────────────────── */}
        <section className="menu-overlay__contact" aria-label="Contact us">
          <p className="menu-overlay__label text-small text-caps">Contact us</p>
          <address className="menu-overlay__address text-large">
            {contact.addressLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </address>
          <a
            className="menu-overlay__contact-link link text-large"
            href={`mailto:${contact.email}`}
          >
            <SplitText asWords>{contact.email}</SplitText>
          </a>
          <a
            className="menu-overlay__contact-link link text-large"
            href={contact.phoneHref}
          >
            <SplitText asWords>{contact.phone}</SplitText>
          </a>
        </section>

        {/* ── Featured project 3 — middle, row 3 ───────────────── */}
        {projects[2] && (
          <FeaturedProjectBlock project={projects[2]} onLinkClick={close} />
        )}

        {/* ── Legal — right col, row 3 ─────────────────────────── */}
        <section className="menu-overlay__legal" aria-label="Legal">
          <p className="menu-overlay__label text-small text-caps">Legal</p>
          <ul className="menu-overlay__simple-list">
            {legal.map((item) => (
              <li key={item.href}>
                <TransitionLink
                  href={item.href}
                  pageName={item.label}
                  className="menu-overlay__plain-link link text-small"
                  onClick={close}
                >
                  <SplitText asWords>{item.label}</SplitText>
                </TransitionLink>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </aside>
  );
}

/* --------------------------------------------------------------------------
   FeaturedProjectBlock
   --------------------------------------------------------------------------
   One row of the middle column. Top: small label + project title.
   Bottom (anchored): View Project link + 2-col label/value details.
   The cell carries left + right border lines so the column reads as
   a continuous editorial spine. */

function FeaturedProjectBlock({
  project,
  onLinkClick,
}: {
  project: FeaturedProject;
  onLinkClick: () => void;
}) {
  return (
    <article className="menu-overlay__project">
      <div className="menu-overlay__project-inner">
        <header className="menu-overlay__project-head">
          <p className="menu-overlay__label text-small text-caps">
            Featured Project
          </p>
          <h3 className="menu-overlay__project-title text-h3">
            <TransitionLink
              href={project.href}
              pageName={project.title}
              onClick={onLinkClick}
              className="menu-overlay__plain-link link"
            >
              <SplitText>{project.title}</SplitText>
            </TransitionLink>
          </h3>
        </header>

        <div className="menu-overlay__project-foot">
          <TransitionLink
            href={project.href}
            pageName={project.title}
            className="menu-overlay__view-link link text-large"
            onClick={onLinkClick}
          >
            <SplitText asWords>View Project →</SplitText>
          </TransitionLink>

          <dl className="menu-overlay__details">
            {project.details.slice(0, 4).map((detail) => (
              <div key={detail.label} className="menu-overlay__detail-row">
                <dt className="text-small text-caps">{detail.label}</dt>
                <dd className="text-small">{detail.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </article>
  );
}
