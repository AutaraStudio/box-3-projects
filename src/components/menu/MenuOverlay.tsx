"use client";

/**
 * MenuOverlay
 * ===========
 * Slide-in side panel triggered from the header's Menu button.
 * Layout (top → bottom):
 *
 *   - Large primary links     (Home, About, Projects)
 *   - hr divider
 *   - "More" section: small links for the rest of the site
 *   - hr divider
 *   - "Stay in touch" — phone, email, address
 *   - hr divider
 *   - Contact form: Name / Email / Message / Submit
 *
 * Animations (GSAP):
 *   1. Panel slides from translateX(101%) → 0
 *   2. Each text row reveals up from translateY(100%) (parent has
 *      overflow:hidden, so the slide creates a wipe)
 *   3. hr lines scale-x from 0 → 1
 *   4. Form fades + slides in last
 *
 * Reverse plays on close. Reduced-motion users get instant
 * show/hide via gsap.matchMedia.
 *
 * Carries data-theme="cream" so the panel reads cream/brown,
 * contrasting with the dark header.
 */

import { useEffect, useRef, useState, type FormEvent } from "react";
import { gsap } from "gsap";
import TransitionLink from "@/components/transition/TransitionLink";
import SplitText from "@/components/split-text/SplitText";
import Button from "@/components/ui/Button";
import { useSiteSettings } from "@/components/settings/SiteSettingsProvider";
import { useMenu } from "./MenuProvider";
import "./MenuOverlay.css";

const FALLBACK_MENU_LABELS = {
  moreSectionTitle: "More",
  stayInTouchTitle: "Stay in touch",
  namePlaceholder: "Name",
  emailPlaceholder: "Email",
  messagePlaceholder: "Message",
  submitLabel: "Submit",
  submittedLabel: "Thanks — we'll be in touch",
  siteMenuAriaLabel: "Site menu",
  scrimAriaLabel: "Close menu",
} as const;

interface MenuLink {
  label: string;
  href: string;
}

interface MenuOverlayProps {
  primaryLinks: MenuLink[];
  moreLinks: MenuLink[];
  contact: {
    addressLines: string[];
    email: string;
    phone: string;
    phoneHref: string;
  };
}

export default function MenuOverlay({
  primaryLinks,
  moreLinks,
  contact,
}: MenuOverlayProps) {
  const { isOpen, close } = useMenu();
  const settings = useSiteSettings();
  const labels = {
    moreSectionTitle:
      settings?.menuLabels?.moreSectionTitle ??
      FALLBACK_MENU_LABELS.moreSectionTitle,
    stayInTouchTitle:
      settings?.menuLabels?.stayInTouchTitle ??
      FALLBACK_MENU_LABELS.stayInTouchTitle,
    namePlaceholder:
      settings?.menuLabels?.namePlaceholder ??
      FALLBACK_MENU_LABELS.namePlaceholder,
    emailPlaceholder:
      settings?.menuLabels?.emailPlaceholder ??
      FALLBACK_MENU_LABELS.emailPlaceholder,
    messagePlaceholder:
      settings?.menuLabels?.messagePlaceholder ??
      FALLBACK_MENU_LABELS.messagePlaceholder,
    submitLabel:
      settings?.menuLabels?.submitLabel ?? FALLBACK_MENU_LABELS.submitLabel,
    submittedLabel:
      settings?.menuLabels?.submittedLabel ??
      FALLBACK_MENU_LABELS.submittedLabel,
    siteMenuAriaLabel:
      settings?.menuLabels?.siteMenuAriaLabel ??
      FALLBACK_MENU_LABELS.siteMenuAriaLabel,
    scrimAriaLabel:
      settings?.menuLabels?.scrimAriaLabel ??
      FALLBACK_MENU_LABELS.scrimAriaLabel,
  };
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  /* Build the open/close timeline once on mount and reuse it.
     We always run forward on `open`, reverse on `close`. */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const wrapper = wrapperRef.current;
    const panel = panelRef.current;
    if (!wrapper || !panel) return;

    const primary = panel.querySelectorAll<HTMLElement>(".menu-overlay__primary-link-inner");
    const more = panel.querySelectorAll<HTMLElement>(".menu-overlay__more-link");
    const lines = panel.querySelectorAll<HTMLElement>(".menu-overlay__hr");
    const contactRows = panel.querySelectorAll<HTMLElement>(".menu-overlay__contact-row");
    const form = panel.querySelector<HTMLElement>(".menu-overlay__form");
    const scrim = wrapper.querySelector<HTMLElement>(".menu-overlay__scrim");

    const mm = gsap.matchMedia();

    /* Show/hide the wrapper imperatively from the timeline's
       open + reverse-complete callbacks, not from in-timeline
       set tweens — those re-fire on reverse and fight the
       intended state. */
    const showWrapper = () => {
      wrapper.style.display = "block";
    };
    const hideWrapper = () => {
      wrapper.style.display = "none";
    };

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      hideWrapper();
      gsap.set(panel, { xPercent: 101 });
      gsap.set([primary, more, contactRows, form], { yPercent: 100, opacity: 1 });
      gsap.set(lines, { scaleX: 0, transformOrigin: "0% 50%" });
      if (form) gsap.set(form, { opacity: 0 });
      if (scrim) gsap.set(scrim, { opacity: 0 });

      const tl = gsap.timeline({
        paused: true,
        onStart: showWrapper,
        onReverseComplete: hideWrapper,
      });
      if (scrim) {
        tl.to(scrim, { opacity: 1, duration: 0.4, ease: "power2.out" }, 0);
      }
      tl.to(panel, { xPercent: 0, duration: 0.7, ease: "expo.inOut" }, 0)
        .to(
          primary,
          { yPercent: 0, duration: 0.7, ease: "expo.out", stagger: 0.06 },
          "-=0.35",
        )
        .to(
          lines,
          { scaleX: 1, duration: 0.6, ease: "expo.out", stagger: 0.05 },
          "-=0.5",
        )
        .to(
          more,
          { yPercent: 0, duration: 0.5, ease: "expo.out", stagger: 0.04 },
          "-=0.5",
        )
        .to(
          contactRows,
          { yPercent: 0, duration: 0.5, ease: "expo.out", stagger: 0.04 },
          "-=0.4",
        )
        .to(
          form,
          { yPercent: 0, opacity: 1, duration: 0.5, ease: "expo.out" },
          "-=0.3",
        );

      tlRef.current = tl;
    });

    mm.add("(prefers-reduced-motion: reduce)", () => {
      hideWrapper();
      gsap.set(panel, { xPercent: 0 });
      gsap.set([primary, more, contactRows, form], { yPercent: 0, opacity: 1 });
      gsap.set(lines, { scaleX: 1 });
      if (scrim) gsap.set(scrim, { opacity: 1 });

      const tl = gsap.timeline({
        paused: true,
        onStart: showWrapper,
        onReverseComplete: hideWrapper,
      });
      /* Empty timeline with non-zero duration so reverse
         actually plays and onReverseComplete fires. */
      tl.to({}, { duration: 0.01 });

      tlRef.current = tl;
    });

    return () => {
      mm.revert();
      tlRef.current = null;
    };
  }, []);

  /* Drive the timeline from React state. Reverse plays at ~2.5×
     speed so closing feels snappy compared to the editorial open.
     We also force the wrapper display imperatively here as a
     belt-and-braces alongside the timeline's onStart — GSAP's
     ticker has been intermittently dropping the onStart fire in
     this stack, leaving the wrapper hidden. */
  useEffect(() => {
    const tl = tlRef.current;
    if (!tl) return;
    const wrapper = wrapperRef.current;
    if (isOpen) {
      if (wrapper) wrapper.style.display = "block";
      tl.timeScale(1);
      tl.play();
    } else {
      tl.timeScale(2.5);
      tl.reverse();
    }
  }, [isOpen]);

  /* Local form state — purely UI for now, no backend wired up.
     Submit clears + shows a confirmation; replace with a real
     handler when the contact endpoint exists. */
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    /* TODO: wire to real contact endpoint when available. */
    setSent(true);
    setForm({ name: "", email: "", message: "" });
    window.setTimeout(() => setSent(false), 4000);
  }

  return (
    <div
      ref={wrapperRef}
      className="menu-overlay"
      id="site-menu"
      role="dialog"
      aria-modal="true"
      aria-label={labels.siteMenuAriaLabel}
      aria-hidden={!isOpen}
    >
      {/* Scrim — semi-transparent dim over the page beneath the
          slide-in panel. Click-to-close so users can dismiss the
          menu without aiming for the Close button. */}
      <button
        type="button"
        className="menu-overlay__scrim"
        aria-label={labels.scrimAriaLabel}
        tabIndex={isOpen ? 0 : -1}
        onClick={close}
      />
      <div
        ref={panelRef}
        className="menu-overlay__panel"
        data-theme="dark"
        data-lenis-prevent
      >
        {/* Primary links — large editorial type with global
            SplitText roll-over hover via the `.link` class. */}
        <ul className="menu-overlay__primary" role="menu">
          {primaryLinks.map((l) => (
            <li key={l.href} className="menu-overlay__primary-link" role="none">
              <span className="menu-overlay__primary-link-inner">
                <TransitionLink
                  href={l.href}
                  pageName={l.label}
                  className="menu-overlay__primary-anchor link"
                  role="menuitem"
                  onClick={close}
                >
                  <SplitText asWords>{l.label}</SplitText>
                </TransitionLink>
              </span>
            </li>
          ))}
        </ul>

        <hr className="menu-overlay__hr" />

        {/* More links — Services, Careers, Sustainability, Contact. */}
        <section className="menu-overlay__section">
          <h2 className="menu-overlay__section-title text-small text-caps">
            {labels.moreSectionTitle}
          </h2>
          <ul className="menu-overlay__more" role="menu">
            {moreLinks.map((l) => (
              <li key={l.href} className="menu-overlay__more-item" role="none">
                <TransitionLink
                  href={l.href}
                  pageName={l.label}
                  className="menu-overlay__more-link link"
                  role="menuitem"
                  onClick={close}
                >
                  <SplitText asWords>{l.label}</SplitText>
                </TransitionLink>
              </li>
            ))}
          </ul>
        </section>

        <hr className="menu-overlay__hr" />

        {/* Stay in touch. */}
        <section className="menu-overlay__section menu-overlay__section--contact">
          <h2 className="menu-overlay__section-title text-small text-caps">
            {labels.stayInTouchTitle}
          </h2>
          <div className="menu-overlay__contact">
            <div className="menu-overlay__contact-line">
              <a
                className="menu-overlay__contact-row link"
                href={contact.phoneHref}
              >
                <SplitText asWords>{contact.phone}</SplitText>
              </a>
            </div>
            <div className="menu-overlay__contact-line">
              <a
                className="menu-overlay__contact-row link"
                href={`mailto:${contact.email}`}
              >
                <SplitText asWords>{contact.email}</SplitText>
              </a>
            </div>
            <div className="menu-overlay__contact-line">
              <address className="menu-overlay__contact-row menu-overlay__address">
                {contact.addressLines.map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < contact.addressLines.length - 1 && <br />}
                  </span>
                ))}
              </address>
            </div>
          </div>
        </section>

        <hr className="menu-overlay__hr" />

        {/* Contact form. */}
        <form className="menu-overlay__form" onSubmit={onSubmit} noValidate>
          <label className="menu-overlay__field">
            <span className="menu-overlay__field-label text-small text-caps">
              {labels.namePlaceholder}
            </span>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="menu-overlay__input"
            />
          </label>
          <label className="menu-overlay__field">
            <span className="menu-overlay__field-label text-small text-caps">
              {labels.emailPlaceholder}
            </span>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="menu-overlay__input"
            />
          </label>
          <label className="menu-overlay__field">
            <span className="menu-overlay__field-label text-small text-caps">
              {labels.messagePlaceholder}
            </span>
            <textarea
              required
              rows={3}
              value={form.message}
              onChange={(e) =>
                setForm((f) => ({ ...f, message: e.target.value }))
              }
              className="menu-overlay__input menu-overlay__input--textarea"
            />
          </label>
          <div className="menu-overlay__submit-row">
            <Button type="submit" size="md">
              {sent ? labels.submittedLabel : labels.submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
