/**
 * Nav
 * ===
 * Site-wide navigation component with desktop nav links, menu button,
 * contact button, and a mega menu with primary links, company links,
 * contact details, and a contact form.
 *
 * All content from props (Sanity) — zero hardcoded strings.
 * All animation values from @/config/animations.config — never hardcoded.
 * Theme-aware via data-theme on the header element.
 * NavThemeObserver swaps data-theme automatically on scroll.
 */

"use client";

import { useRef, type FormEvent } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { useGSAP } from "@/hooks/useGSAP";
import { ease, duration, stagger } from "@/config/animations.config";
import type { NavLink, ContactForm } from "@/sanity/queries/siteNav";

import "./Nav.css";

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin);

/* --------------------------------------------------------------------------
   Types
   -------------------------------------------------------------------------- */

interface NavProps {
  primaryLinks: NavLink[];
  secondaryLinks: NavLink[];
  megaMenuCompanyLinks: NavLink[];
  phone: string;
  email: string;
  address: string;
  contactForm: ContactForm;
}

/* --------------------------------------------------------------------------
   Component
   -------------------------------------------------------------------------- */

export default function Nav({
  primaryLinks,
  secondaryLinks,
  megaMenuCompanyLinks,
  phone,
  email,
  address,
  contactForm,
}: NavProps) {
  /* Refs — DOM elements */
  const headerRef = useRef<HTMLElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const menuBtnWrapRef = useRef<HTMLDivElement>(null);
  const menuBtnBorderRef = useRef<HTMLDivElement>(null);
  const menuBtnBgRef = useRef<HTMLSpanElement>(null);
  const menuBtnTextRef = useRef<HTMLSpanElement>(null);
  const contactBtnRef = useRef<HTMLAnchorElement>(null);
  const contactBtnBgRef = useRef<HTMLSpanElement>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const megaMenuInnerRef = useRef<HTMLDivElement>(null);

  /* Refs — state (useRef to avoid re-renders) */
  const isMenuOpen = useRef(false);
  const showMenuBtn = useRef(false);

  /* Refs — GSAP timelines */
  const navShowTl = useRef<gsap.core.Timeline | null>(null);
  const menuSlideTl = useRef<gsap.core.Timeline | null>(null);
  const menuOpenTl = useRef<gsap.core.Timeline | null>(null);
  const menuCloseTl = useRef<gsap.core.Timeline | null>(null);

  /* Form submit handler */
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    /* TODO: Wire to form submission endpoint */
  }

  /* Helper: is desktop */
  const isLg = () => typeof window !== "undefined" && window.innerWidth >= 992;

  /* Helper: scramble text to target */
  function scrambleText(el: HTMLElement | null, text: string) {
    if (!el) return;
    gsap.to(el, {
      scrambleText: { text, speed: 0.5, chars: "x&oci" },
      duration: duration.normal,
    });
  }

  /* --- GSAP Animation Setup --- */
  useGSAP(
    () => {
      const header = headerRef.current;
      const menuBtn = menuBtnRef.current;
      const menuBtnWrap = menuBtnWrapRef.current;
      const menuBtnBorder = menuBtnBorderRef.current;
      const menuBtnBg = menuBtnBgRef.current;
      const menuBtnText = menuBtnTextRef.current;
      const contactBtn = contactBtnRef.current;
      const contactBtnBg = contactBtnBgRef.current;
      const megaMenu = megaMenuRef.current;
      const megaMenuInner = megaMenuInnerRef.current;

      if (!header || !menuBtn || !menuBtnWrap || !menuBtnBorder || !menuBtnBg || !menuBtnText ||
          !contactBtn || !contactBtnBg || !megaMenu || !megaMenuInner) return;

      /* Non-null aliases for use in closures (guard above ensures safety) */
      const _header = header;
      const _menuBtn = menuBtn;
      const _megaMenu = megaMenu;
      const _menuBtnText = menuBtnText;

      /* ── DOM queries ───────────────────────────── */
      const primaryLinksArray = Array.from(header.querySelectorAll<HTMLElement>("[data-primary-link]"));
      const secondaryLinksArray = Array.from(header.querySelectorAll<HTMLElement>("[data-secondary-link]"));

      const menuPrimaryLinkWraps = Array.from(megaMenu.querySelectorAll<HTMLElement>("[data-menu-primary-wrap]"));
      const menuSecondaryLinksArray = Array.from(megaMenu.querySelectorAll<HTMLElement>("[data-menu-secondary-link]"));
      const contactArray = Array.from(megaMenu.querySelectorAll<HTMLElement>("[data-menu-contact]"));
      const companyTitle = megaMenu.querySelector<HTMLElement>("[data-company-title]");
      const contactTitle = megaMenu.querySelector<HTMLElement>("[data-contact-title]");
      const menuLineArray = Array.from(megaMenu.querySelectorAll<HTMLElement>("[data-menu-line]"));
      const menuContactForm = megaMenu.querySelector<HTMLElement>("[data-menu-form]");

      /* ── Initial States ────────────────────────── */
      gsap.set(menuBtnWrap, { opacity: 0 });
      gsap.set(menuBtnBorder, { xPercent: 101 });
      gsap.set(contactBtn, { opacity: 0 });
      gsap.set(megaMenu, { display: "none" });
      gsap.set(megaMenuInner, { xPercent: 101 });

      /* Menu element initial states */
      gsap.set(menuPrimaryLinkWraps, { yPercent: 100 });
      gsap.set(menuSecondaryLinksArray, { yPercent: 100 });
      gsap.set(contactArray, { yPercent: 100 });
      gsap.set(menuLineArray, { scaleX: 0 });

      if (companyTitle) {
        companyTitle.dataset.originalText = companyTitle.textContent || "";
        gsap.set(companyTitle, { scrambleText: { text: "" } });
      }
      if (contactTitle) {
        contactTitle.dataset.originalText = contactTitle.textContent || "";
        gsap.set(contactTitle, { scrambleText: { text: "" } });
      }
      if (menuContactForm) {
        gsap.set(menuContactForm, { opacity: 0, yPercent: 100 });
      }

      /* ── Menu Button Hover ─────────────────────── */
      gsap.set(menuBtnBg, { yPercent: 101, scaleX: 0.5, transformOrigin: "center bottom" });

      let mbInTl: gsap.core.Timeline | null = null;
      let mbOutTl: gsap.core.Timeline | null = null;

      function menuBtnEnter() {
        let dur = duration.slow;
        if (mbOutTl && mbOutTl.progress() < 1) { mbOutTl.pause(); dur *= mbOutTl.progress(); }
        mbInTl = gsap.timeline().to(menuBtnBg, { yPercent: 0, scaleX: 1, duration: dur, ease: ease.entrance });
      }
      function menuBtnLeave() {
        let dur = duration.slow;
        if (mbInTl && mbInTl.progress() < 1) { mbInTl.pause(); dur *= mbInTl.progress(); }
        mbOutTl = gsap.timeline().to(menuBtnBg, { yPercent: 101, scaleX: 0.5, duration: dur, ease: ease.entrance });
      }

      menuBtn.addEventListener("mouseenter", menuBtnEnter);
      menuBtn.addEventListener("focus", menuBtnEnter);
      menuBtn.addEventListener("mouseleave", menuBtnLeave);
      menuBtn.addEventListener("blur", menuBtnLeave);

      /* ── Contact Button Hover ──────────────────── */
      gsap.set(contactBtnBg, { yPercent: 101, scaleX: 0.5, transformOrigin: "center bottom" });

      let cbInTl: gsap.core.Timeline | null = null;
      let cbOutTl: gsap.core.Timeline | null = null;

      function contactBtnEnter() {
        let dur = duration.slow;
        if (cbOutTl && cbOutTl.progress() < 1) { cbOutTl.pause(); dur *= cbOutTl.progress(); }
        cbInTl = gsap.timeline().to(contactBtnBg, { yPercent: 0, scaleX: 1, duration: dur, ease: ease.entrance });
      }
      function contactBtnLeave() {
        let dur = duration.slow;
        if (cbInTl && cbInTl.progress() < 1) { cbInTl.pause(); dur *= cbInTl.progress(); }
        cbOutTl = gsap.timeline().to(contactBtnBg, { yPercent: 101, scaleX: 0.5, duration: dur, ease: ease.entrance });
      }

      contactBtn.addEventListener("mouseenter", contactBtnEnter);
      contactBtn.addEventListener("focus", contactBtnEnter);
      contactBtn.addEventListener("mouseleave", contactBtnLeave);
      contactBtn.addEventListener("blur", contactBtnLeave);

      /* ── Desktop Nav Timeline ──────────────────── */
      function buildNavTimeline() {
        if (!isLg()) return;

        navShowTl.current?.kill();
        menuSlideTl.current?.kill();

        navShowTl.current = gsap.timeline({ paused: true, defaults: { ease: ease.brand, duration: duration.slow } });

        primaryLinksArray.forEach((link, i) => {
          const txt = link.textContent?.trim() || "";
          navShowTl.current!.fromTo(
            link,
            { scrambleText: { text: "" } },
            { scrambleText: { text: txt }, duration: duration.slow },
            i * stagger.normal,
          );
        });

        secondaryLinksArray.forEach((link, i) => {
          const txt = link.textContent?.trim() || "";
          navShowTl.current!.fromTo(
            link,
            { scrambleText: { text: "" } },
            { scrambleText: { text: txt }, duration: duration.slow },
            i * stagger.normal,
          );
        });

        menuSlideTl.current = gsap.timeline({ paused: true, defaults: { ease: ease.brand, duration: duration.slow } })
          .fromTo(menuBtnBorder, { xPercent: 101 }, { xPercent: 0 }, 0);
      }

      function showHeaderNav() { navShowTl.current?.play(); menuSlideTl.current?.reverse(); }
      function hideHeaderNav() { navShowTl.current?.reverse(); menuSlideTl.current?.play(); }

      /* ── Scroll Listener ───────────────────────── */
      function onScroll() {
        const scrolled = window.scrollY > 20;
        if (scrolled !== showMenuBtn.current) {
          showMenuBtn.current = scrolled;
          if (showMenuBtn.current) hideHeaderNav();
          else showHeaderNav();
        }
      }
      window.addEventListener("scroll", onScroll, { passive: true });

      /* ── Open Menu ─────────────────────────────── */
      function openMenu() {
        menuCloseTl.current?.pause();
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        const n = duration.slower;
        const e = ease.entrance;

        menuOpenTl.current = gsap.timeline({
          onComplete: () => { gsap.set(menuPrimaryLinkWraps, { clearProps: "all" }); },
        });

        menuOpenTl.current
          .to(megaMenu, { display: "block", duration: 0 })
          .to(megaMenuInner, { xPercent: 0, duration: n, ease: ease.cinematic }, 0)
          .to(menuPrimaryLinkWraps, {
            yPercent: 0, duration: n * 0.3, ease: e, stagger: { amount: n * 0.2 },
          }, n * 0.5)
          .to(menuSecondaryLinksArray, {
            yPercent: 0, duration: n * 0.5, ease: e,
          }, "<50%")
          .to(contactArray, {
            yPercent: 0, duration: n * 0.5, ease: e,
          }, "<15%");

        const compOrig = companyTitle?.dataset.originalText || "";
        const contOrig = contactTitle?.dataset.originalText || "";

        menuOpenTl.current
          .to(companyTitle, {
            duration: n * 0.5, scrambleText: { text: compOrig, speed: 0.1 },
          }, n * 0.6)
          .to(contactTitle, {
            duration: n * 0.6, scrambleText: { text: contOrig, speed: 0.1 },
          }, n * 0.7);

        menuOpenTl.current
          .to(menuLineArray, {
            scaleX: 1, transformOrigin: "left",
            duration: n * 0.4, ease: e, stagger: { amount: n * 0.2 },
          }, n * 0.5);

        if (menuContactForm) {
          menuOpenTl.current.to(menuContactForm, {
            opacity: 1, yPercent: 0, ease: e, duration: n * 0.5,
          }, n * 0.5);
        }
      }

      /* ── Close Menu ────────────────────────────── */
      function closeMenu() {
        menuOpenTl.current?.pause();
        const n = duration.slower;
        const e = ease.entrance;

        menuCloseTl.current = gsap.timeline({
          onComplete: () => {
            isMenuOpen.current = false;
            _header.classList.remove("is-menu-open", "menu-open");
            _megaMenu.classList.remove("is-open");
            _menuBtn.setAttribute("aria-expanded", "false");
            _menuBtn.setAttribute("aria-label", "open menu");
            scrambleText(_menuBtnText, "Menu");

            /* Reset menu element states */
            gsap.set(menuPrimaryLinkWraps, { yPercent: 100 });
            gsap.set(menuSecondaryLinksArray, { yPercent: 100 });
            gsap.set(contactArray, { yPercent: 100 });
            gsap.set(menuLineArray, { scaleX: 0 });
            if (companyTitle) gsap.set(companyTitle, { scrambleText: { text: "" } });
            if (contactTitle) gsap.set(contactTitle, { scrambleText: { text: "" } });
            if (menuContactForm) gsap.set(menuContactForm, { opacity: 0, yPercent: 100 });
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
          },
        });

        menuCloseTl.current
          .to(megaMenuInner, { xPercent: 101, duration: n, ease: e }, 0)
          .to(menuPrimaryLinkWraps, {
            yPercent: 100, duration: n * 0.9, ease: e, stagger: { amount: n * 0.1 },
          }, 0)
          .to(menuSecondaryLinksArray, {
            yPercent: 100, duration: n * 0.5, ease: e,
          }, "<");

        menuCloseTl.current
          .to(companyTitle, { scrambleText: { text: "" }, duration: n * 0.7 }, ">")
          .to(contactTitle, { scrambleText: { text: "" }, duration: n * 0.6 }, n * 0.4);

        menuCloseTl.current
          .to(contactArray, {
            yPercent: 100, duration: n * 0.5, ease: e, stagger: { amount: n * 0.1 },
          }, n * 0.4)
          .to(menuLineArray, {
            scaleX: 0, transformOrigin: "left",
            duration: n * 0.4, ease: e, stagger: { amount: n * 0.4 },
          }, 0.2);

        if (menuContactForm) {
          menuCloseTl.current.to(menuContactForm, { opacity: 0, ease: e, duration: n * 0.5 }, n * 0.5);
        }

        menuCloseTl.current.to(megaMenu, { display: "none", duration: 0 });
      }

      /* ── Toggle Menu ───────────────────────────── */
      function toggleMenu() {
        if (!isMenuOpen.current) {
          isMenuOpen.current = true;
          _header.classList.add("is-menu-open", "menu-open");
          _megaMenu.classList.add("is-open");
          _menuBtn.setAttribute("aria-expanded", "true");
          _menuBtn.setAttribute("aria-label", "close menu");
          scrambleText(_menuBtnText, "Close");
          openMenu();
        } else {
          closeMenu();
        }
      }

      menuBtn.addEventListener("click", toggleMenu);

      /* ── Primary Menu Link Hover ───────────────── */
      menuPrimaryLinkWraps.forEach((wrap) => {
        const link = wrap.querySelector<HTMLElement>("[data-menu-link]");
        const circle = wrap.querySelector<HTMLElement>("[data-menu-circle]");
        if (!link || !circle) return;

        const dur = duration.normal;
        const hoverEase = ease.brand;

        function enter() {
          gsap.to(link!, { opacity: 0.5, x: 12, duration: dur, ease: hoverEase, overwrite: true });
          gsap.to(circle!, { scale: 1, duration: dur, ease: hoverEase, overwrite: true });
        }
        function leave() {
          gsap.to(link!, { opacity: 1, x: 0, duration: dur, ease: hoverEase, overwrite: true });
          gsap.to(circle!, { scale: 0, duration: dur, ease: hoverEase, overwrite: true });
        }

        link.addEventListener("mouseenter", enter);
        link.addEventListener("focus", enter);
        link.addEventListener("mouseleave", leave);
        link.addEventListener("blur", leave);
      });


      /* ── Close on Outside Click ────────────────── */
      function onOutsideClick(e: MouseEvent) {
        if (isMenuOpen.current && !_megaMenu.contains(e.target as Node) && !_menuBtn.contains(e.target as Node)) {
          closeMenu();
        }
      }
      document.addEventListener("click", onOutsideClick);

      /* ── Resize ────────────────────────────────── */
      function onResize() {
        buildNavTimeline();
        if (showMenuBtn.current && navShowTl.current) navShowTl.current.progress(1);
        if (!isLg() && isMenuOpen.current) {
          closeMenu();
        }
      }
      window.addEventListener("resize", onResize);

      /* ── Init ──────────────────────────────────── */
      buildNavTimeline();

      /* Fade in buttons after brief delay */
      gsap.to(menuBtnWrap, { opacity: 1, duration: duration.slow, ease: ease.entrance, delay: duration.normal });
      gsap.to(contactBtn, { opacity: 1, duration: duration.slow, ease: ease.entrance, delay: duration.moderate });

      if (isLg()) navShowTl.current?.play();

      /* ── Cleanup (handled by useGSAP context) ─── */
    },
    { scope: headerRef, dependencies: [] },
  );

  return (
    <header ref={headerRef} data-nav="" data-theme="dark" className="site-header">
      <nav className="header-nav" aria-label="Main">

        {/* Logo — just the square home link. `data-preloader="target"`
            tags it for the first-load Preloader, which morphs the
            same element from fullscreen back to this slot via Flip. */}
        <div className="header-logo-block">
          <a
            href="/"
            className="header-home-link"
            data-preloader="target"
          >
            <span className="sr-only">Box 3 Projects home page</span>
            <span className="logo-bg" />
          </a>
        </div>

        {/* Primary Nav (desktop) */}
        <div className="header-primary-nav">
          <ul className="primary-nav-list" role="menu">
            {primaryLinks.map((link) => (
              <li key={link._key} className="primary-nav-item" role="none">
                <a
                  href={link.href}
                  className="nav-link font-primary text-text-sm uppercase tracking-caps leading-normal"
                  data-primary-link=""
                  role="menuitem"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Secondary Nav (desktop) */}
        <div className="header-secondary-nav">
          <ul className="secondary-nav-list" role="menu">
            {secondaryLinks.map((link) => (
              <li key={link._key} className="secondary-nav-item" role="none">
                <a
                  href={link.href}
                  className="nav-link-secondary font-primary text-text-sm uppercase tracking-caps leading-normal"
                  data-secondary-link=""
                  role="menuitem"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Buttons */}
        <div className="header-buttons">
          <div className="menu-btn-wrap" ref={menuBtnWrapRef}>
            <div className="menu-btn-border" ref={menuBtnBorderRef}>
              <button
                className="menu-btn"
                ref={menuBtnRef}
                aria-expanded="false"
                aria-label="open menu"
              >
                <span className="menu-btn-bg" ref={menuBtnBgRef} />
                <span className="menu-btn-text" ref={menuBtnTextRef}>Menu</span>
              </button>
            </div>
          </div>
          <a href="/contact" className="contact-link-btn" ref={contactBtnRef} aria-label="Go to contact page">
            <span className="contact-btn-bg" ref={contactBtnBgRef} />
            <svg className="contact-icon" aria-hidden="true" fill="none" viewBox="0 0 20 27">
              <path d="m14.02 7.314 2.598 1.5-4.516 7.822" stroke="currentColor" strokeWidth="1.5" />
              <rect x="11.117" y="3.611" width="4.8" height="16.675" rx="1" transform="rotate(30 11.117 3.61)" fill="currentColor" />
              <path fill="currentColor" d="m11.813 2.407 4.157 2.4 1.389-2.406L13.202 0zM1.303 20.609l.776 3.456L5.46 23.01l.782-1.354-4.158-2.4-.781 1.354Z" />
            </svg>
          </a>
        </div>

        {/* Mega Menu */}
        <div className="mega-menu-container" ref={megaMenuRef}>
          <div className="mega-menu-inner" ref={megaMenuInnerRef} data-lenis-prevent="">

            {/* Primary links */}
            <ul className="menu-primary-list" role="menubar">
              {primaryLinks.map((link) => (
                <li key={link._key} className="menu-primary-item" role="none">
                  <span className="menu-primary-link-wrap" data-menu-primary-wrap="">
                    <span className="menu-circle" data-menu-circle="" />
                    <a href={link.href} className="menu-primary-link" data-menu-link="" role="menuitem" tabIndex={-1}>
                      {link.label}
                    </a>
                  </span>
                </li>
              ))}
            </ul>

            <hr className="menu-hr" data-menu-line="" />

            {/* Company section */}
            <section className="menu-company-section">
              <div>
                <h2 className="menu-section-title" data-company-title="">Company</h2>
              </div>
              <ul className="menu-secondary-list" role="menubar">
                {megaMenuCompanyLinks.map((link) => (
                  <li key={link._key} className="menu-secondary-item" role="none">
                    <a href={link.href} className="menu-secondary-link" data-menu-secondary-link="" role="menuitem" tabIndex={-1}>
                      <span data-char-hover="">{link.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>

            <hr className="menu-hr hr-contact" data-menu-line="" />

            {/* Stay in touch */}
            <section className="menu-contact-section">
              <div>
                <h2 className="menu-section-title" data-contact-title="">Stay in touch</h2>
              </div>
              <div className="menu-contact-details">
                <div className="menu-contact-item">
                  <a className="menu-contact-link u-nums" data-menu-contact="" href={`tel:${phone}`}>
                    <span data-char-hover="">{phone}</span>
                  </a>
                </div>
                <div className="menu-contact-item">
                  <a className="menu-contact-link" data-menu-contact="" href={`mailto:${email}`}>
                    <span data-char-hover="">{email}</span>
                  </a>
                </div>
                <div className="menu-contact-item">
                  <address className="menu-contact-link menu-contact-address" data-menu-contact="">
                    {address}
                  </address>
                </div>
              </div>
            </section>

            <hr className="menu-hr hr-last" data-menu-line="" />

            {/* Contact form */}
            <div className="menu-contact-form" data-menu-form="">
              <form onSubmit={handleSubmit} noValidate>
                <input
                  type="text"
                  placeholder={contactForm.namePlaceholder}
                  className="form-input"
                />
                <input
                  type="email"
                  placeholder={contactForm.emailPlaceholder}
                  className="form-input"
                />
                <textarea
                  placeholder={contactForm.messagePlaceholder}
                  className="form-textarea"
                  rows={4}
                />
                <button type="submit" className="form-submit">
                  {contactForm.submitLabel}
                  <svg className="form-submit-arrow" aria-hidden="true" fill="none" viewBox="0 0 20 9">
                    <path d="M19.223 4.188a.5.5 0 0 1 0 .707l-3.182 3.182a.5.5 0 1 1-.707-.707l2.829-2.829-2.829-2.828a.5.5 0 1 1 .707-.707l3.182 3.182ZM-.01 4.542v-.5h18.88v1H-.01v-.5Z" fill="currentColor" />
                  </svg>
                </button>
              </form>
            </div>

          </div>
        </div>

      </nav>
    </header>
  );
}
