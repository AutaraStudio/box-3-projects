/**
 * Footer
 * ======
 * Two-half editorial footer.
 *   Left 6 cols: two sub-columns of nav links with section headings
 *                (Index / Company / Social / Legal).
 *   Right 6 cols: contact details (phone, email, address).
 * Full-width hairline divider + copyright line at the bottom.
 *
 * All content from props (Sanity) — zero hardcoded strings.
 * Theme-aware via data-theme="brand" on the footer element.
 * Server component — link hover is handled globally by
 * CharHoverObserver + CSS.
 */

import type { FooterLink } from "@/sanity/queries/siteFooter";

import "./Footer.css";

/* --------------------------------------------------------------------------
   Types
   -------------------------------------------------------------------------- */

interface FooterProps {
  primaryLinks: FooterLink[];
  secondaryLinks: FooterLink[];
  miscLinks: FooterLink[];
  socialLinks: FooterLink[];
  legalLinks: FooterLink[];
  phone: string;
  email: string;
  address: string;
  stayInTouchLabel: string;
  newsletterPlaceholder: string;
  contactHeading: string;
  madeByLabel: string;
  madeByUrl: string;
  copyright: string;
}

/* --------------------------------------------------------------------------
   Component
   -------------------------------------------------------------------------- */

export default function Footer({
  primaryLinks,
  secondaryLinks,
  miscLinks,
  socialLinks,
  legalLinks,
  phone,
  email,
  address,
  contactHeading,
  madeByLabel,
  madeByUrl,
  copyright,
}: FooterProps) {
  return (
    <footer
      data-theme="brand"
      data-nav-theme="brand"
      className="footer-root"
    >
      <div className="container">
        <div className="footer-body">
          {/* ── Left: two sub-columns ── */}
          <div className="footer-left">
            {/* Sub-col 1: Index + Company */}
            <div className="footer-sub-col">
              <div className="footer-link-group">
                <span className="footer-col-heading">Index</span>
                {primaryLinks.map((link) => (
                  <a
                    key={link._key}
                    href={link.href}
                    className="footer-link font-primary text-text-sm uppercase tracking-caps leading-normal"
                    role="menuitem"
                  >
                    <span data-char-hover="">{link.label}</span>
                  </a>
                ))}
              </div>

              <div className="footer-link-group">
                <span className="footer-col-heading">Company</span>
                {secondaryLinks.map((link) => (
                  <a
                    key={link._key}
                    href={link.href}
                    className="footer-link font-primary text-text-sm uppercase tracking-caps leading-normal"
                    role="menuitem"
                  >
                    <span data-char-hover="">{link.label}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Sub-col 2: Social + Legal */}
            <div className="footer-sub-col">
              <div className="footer-link-group">
                <span className="footer-col-heading">Social</span>
                {miscLinks.map((link) => (
                  <a
                    key={link._key}
                    href={link.href}
                    className="footer-link font-primary text-text-sm uppercase tracking-caps leading-normal"
                    role="menuitem"
                  >
                    <span data-char-hover="">{link.label}</span>
                  </a>
                ))}
                {socialLinks.map((link) => (
                  <a
                    key={link._key}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-link font-primary text-text-sm uppercase tracking-caps leading-normal"
                  >
                    <span data-char-hover="">{link.label}</span>
                  </a>
                ))}
              </div>

              <div className="footer-link-group">
                <span className="footer-col-heading">Legal</span>
                {legalLinks.map((link) => (
                  <a
                    key={link._key}
                    href={link.href}
                    className="footer-link font-primary text-text-sm uppercase tracking-caps leading-normal"
                    role="menuitem"
                  >
                    <span data-char-hover="">{link.label}</span>
                  </a>
                ))}
                <a
                  href={madeByUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link font-primary text-text-sm uppercase tracking-caps leading-normal"
                >
                  <span data-char-hover="">{madeByLabel}</span>
                </a>
              </div>
            </div>
          </div>

          {/* ── Right: contact details ── */}
          <div className="footer-right">
            <div className="footer-contact">
              <span className="footer-contact-heading">{contactHeading}</span>
              <a
                href={`tel:${phone}`}
                className="footer-contact-detail u-nums"
              >
                {phone}
              </a>
              <a
                href={`mailto:${email}`}
                className="footer-contact-detail"
              >
                {email}
              </a>
              <address className="footer-contact-detail">
                {address.split("\n").map((line, i) => (
                  <span key={i} style={{ display: "block" }}>
                    {line}
                  </span>
                ))}
              </address>
            </div>
          </div>
        </div>

        {/* ── Divider ── */}
        <hr className="footer-divider" aria-hidden="true" />

        {/* ── Copyright ── */}
        <p className="footer-copyright">{copyright}</p>
      </div>
    </footer>
  );
}
