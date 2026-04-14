/**
 * Footer
 * ======
 * Site-wide footer component with 12-column grid layout.
 * Left 6 cols: logo + copyright. Right 6 cols: nav subgrid.
 *
 * All content from props (Sanity) — zero hardcoded strings.
 * All animation values from @/config/animations.config — never hardcoded.
 * Theme-aware via data-theme="brand" on the footer element.
 * ScrambleText on all links matching the nav pattern exactly.
 * All typography via Tailwind utility classes — zero font declarations in CSS.
 */

"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { useGSAP } from "@/hooks/useGSAP";
import { duration } from "@/config/animations.config";
import type { FooterLink, SiteFooterData } from "@/sanity/queries/siteFooter";

import "./Footer.css";

gsap.registerPlugin(ScrambleTextPlugin);

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
  stayInTouchLabel: string;
  newsletterPlaceholder: string;
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
  stayInTouchLabel,
  newsletterPlaceholder,
  madeByLabel,
  madeByUrl,
  copyright,
}: FooterProps) {
  const footerRef = useRef<HTMLElement>(null);

  /* --- GSAP Animation Setup --- */
  useGSAP(
    () => {
      const footer = footerRef.current;
      if (!footer) return;

      /* ── ScrambleText hover on all footer links ── */
      const links = Array.from(
        footer.querySelectorAll<HTMLElement>("[data-footer-link]"),
      );

      function attachScrambleHover(el: HTMLElement) {
        if (!el.dataset.originalText) {
          el.dataset.originalText = el.textContent || "";
        }
        el.addEventListener("mouseenter", () => {
          const txt = el.dataset.originalText || "";
          gsap.to(el, {
            scrambleText: {
              text: txt,
              speed: txt.length * 0.1,
              chars: "x&oci",
            },
            duration: duration.slow,
          });
        });
      }

      links.forEach(attachScrambleHover);
    },
    { scope: footerRef, dependencies: [] },
  );

  return (
    <footer
      ref={footerRef}
      data-theme="brand"
      data-nav-theme="brand"
      className="footer-root"
    >
      {/* Logo */}
      <div className="footer-logo-wrap">
        <svg
          viewBox="0 0 421 420"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="footer-logo"
          aria-label="Box 3 Projects"
        >
          <defs>
            <rect id="plusV" x="205" width="11" height="420" />
            <rect
              id="plusH"
              x="420.5"
              y="204.5"
              width="11"
              height="420"
              transform="rotate(90 420.5 204.5)"
            />
            <path
              id="plus"
              d="M216 204.5H420.5V215.5H216V420H205V215.5H0.5V204.5H205V0H216V204.5Z"
            />
            <path
              id="circle"
              d="M210.756 34.2979C309.804 34.2979 390.098 114.592 390.098 213.64C390.098 312.688 309.804 392.981 210.756 392.981C111.708 392.981 31.4141 312.687 31.4141 213.64C31.4141 114.592 111.708 34.2979 210.756 34.2979ZM210.75 78.9922C136.385 78.9924 76.1008 139.277 76.1006 213.642C76.1006 288.007 136.385 348.292 210.75 348.292C285.115 348.292 345.4 288.007 345.4 213.642C345.4 139.277 285.115 78.9922 210.75 78.9922Z"
            />
            <mask id="maskForPlusV" maskUnits="userSpaceOnUse">
              <rect width="100%" height="100%" fill="white" />
              <use href="#circle" fill="black" />
            </mask>
            <mask id="maskForPlusH" maskUnits="userSpaceOnUse">
              <rect width="100%" height="100%" fill="white" />
              <use href="#circle" fill="black" />
            </mask>
            <mask id="maskForCircle" maskUnits="userSpaceOnUse">
              <rect width="100%" height="100%" fill="white" />
              <use href="#plusV" fill="black" />
              <use href="#plusH" fill="black" />
            </mask>
          </defs>
          <use href="#plusV" fill="currentColor" mask="url(#maskForPlusV)" />
          <use href="#plusH" fill="currentColor" mask="url(#maskForPlusH)" />
          <use
            href="#circle"
            fill="currentColor"
            mask="url(#maskForCircle)"
          />
        </svg>
      </div>

      {/* Mobile HR */}
      <hr className="footer-hr-mobile" aria-hidden="true" />

      {/* Nav subgrid */}
      <nav className="footer-nav" aria-label="Footer Navigation">
        {/* List 1 — primary */}
        <ul className="footer-list footer-list--primary" role="menu">
          {primaryLinks.map((link) => (
            <li key={link._key} className="overflow-hidden" role="none">
              <span>
                <a
                  href={link.href}
                  className="footer-link font-primary text-text-sm leading-relaxed uppercase tracking-caps"
                  data-footer-link=""
                  role="menuitem"
                >
                  {link.label}
                </a>
              </span>
            </li>
          ))}
        </ul>

        {/* List 2 — secondary */}
        <ul className="footer-list footer-list--primary" role="menu">
          {secondaryLinks.map((link) => (
            <li key={link._key} className="overflow-hidden" role="none">
              <span>
                <a
                  href={link.href}
                  className="footer-link font-primary text-text-sm leading-relaxed uppercase tracking-caps"
                  data-footer-link=""
                  role="menuitem"
                >
                  {link.label}
                </a>
              </span>
            </li>
          ))}
        </ul>

        {/* List 3 — misc (FAQ) */}
        <ul className="footer-list footer-list--misc" role="menu">
          {miscLinks.map((link) => (
            <li key={link._key} className="overflow-hidden" role="none">
              <span>
                <a
                  href={link.href}
                  className="footer-link font-primary text-text-sm leading-relaxed uppercase tracking-caps"
                  data-footer-link=""
                  role="menuitem"
                >
                  {link.label}
                </a>
              </span>
            </li>
          ))}
        </ul>

        {/* Contact + Newsletter */}
        <div className="footer-contact-col">
          <div className="footer-contact-row font-primary text-text-sm leading-relaxed uppercase tracking-caps">
            <span
              className="footer-link"
              data-footer-link=""
              data-original-text={stayInTouchLabel}
            >
              {stayInTouchLabel}
            </span>
            <span className="footer-pipe">|</span>
            <a
              href={`tel:${phone}`}
              className="footer-link u-nums"
              data-footer-link=""
            >
              {phone}
            </a>
          </div>
          <div className="footer-newsletter">
            <div className="footer-newsletter-inner">
              <label
                htmlFor="footer-email"
                className="footer-newsletter-label"
              >
                <input
                  id="footer-email"
                  type="email"
                  placeholder={newsletterPlaceholder}
                  className="footer-newsletter-input font-secondary text-text-sm leading-none"
                />
                <span className="sr-only">Email address for newsletter</span>
              </label>
              <button
                type="button"
                className="footer-newsletter-submit"
                aria-label="Subscribe to newsletter"
              >
                <svg
                  className="footer-newsletter-arrow"
                  aria-hidden="true"
                  fill="none"
                  viewBox="0 0 20 9"
                >
                  <path
                    d="M15.5 1L19 4.5M19 4.5L15.5 8M19 4.5H1"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Social */}
        <ul className="footer-social">
          {socialLinks.map((link) => (
            <li key={link._key}>
              <span>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link font-primary text-text-sm leading-relaxed uppercase tracking-caps"
                  data-footer-link=""
                >
                  {link.label}
                </a>
              </span>
            </li>
          ))}
        </ul>

        {/* Legal */}
        <ul className="footer-legal" role="menu">
          {legalLinks.map((link) => (
            <li key={link._key} className="overflow-hidden" role="none">
              <span>
                <a
                  href={link.href}
                  className="footer-link font-primary text-text-sm leading-relaxed uppercase tracking-caps"
                  data-footer-link=""
                  role="menuitem"
                >
                  {link.label}
                </a>
              </span>
            </li>
          ))}
          <li role="none">
            <span className="footer-made-by-desktop">
              <a
                href={madeByUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link font-primary text-text-sm leading-relaxed uppercase tracking-caps"
                data-footer-link=""
              >
                {madeByLabel}
              </a>
            </span>
          </li>
        </ul>
      </nav>

      {/* Mobile made-by */}
      <div className="footer-madeby-mobile">
        <span>
          <a
            href={madeByUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link font-primary text-text-sm leading-relaxed uppercase tracking-caps"
            data-footer-link=""
          >
            {madeByLabel}
          </a>
        </span>
      </div>

      {/* Copyright */}
      <div className="footer-copyright font-primary text-text-sm leading-relaxed uppercase tracking-caps">
        {copyright}
      </div>
    </footer>
  );
}
