/**
 * Header
 * ======
 * Two fixed squares — top-left logo, top-right menu trigger. The
 * trigger toggles the menu via the shared MenuProvider context.
 *
 * The trigger label flips between "Menu" and "Close" so users always
 * know what they're clicking. Both squares carry `data-theme="dark"`
 * so they read brown bg + pink text regardless of the underlying
 * page theme. Both labels run through SplitText so they pick up the
 * site-wide editorial char roll-over hover effect.
 */

"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import SplitText from "@/components/split-text/SplitText";
import { useMenu } from "./MenuProvider";
import "./Header.css";

/* Routes that opt into the scroll-driven header backdrop fill.
   Exact match only — only the projects archive page uses the
   sticky filter bar that the backdrop pairs with; project detail
   pages have their own dark hero and don't need the fill. */
const BACKDROP_ROUTES = new Set(["/projects"]);

function shouldFillBackdrop(pathname: string): boolean {
  return BACKDROP_ROUTES.has(pathname);
}

interface HeaderProps {
  /** Text to render in the logo square. Replace with an SVG mark later. */
  logoText?: string;
}

export default function Header({ logoText = "BOX 3" }: HeaderProps) {
  const { isOpen, toggle } = useMenu();
  const triggerLabel = isOpen ? "Close" : "Menu";

  /* Scroll state — used to fade in a full-width backdrop behind
     the header squares once the user has moved off the very top of
     the page. We listen on window scroll (Lenis writes through to
     window.scrollY) so this works regardless of smooth-scroll
     state. The backdrop fade only activates on routes that opt in
     via BACKDROP_ROUTES; everywhere else the squares float over
     the content unbacked. */
  const pathname = usePathname();
  const backdropEnabled = shouldFillBackdrop(pathname);

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    if (!backdropEnabled) {
      /* Reset the scrolled flag when navigating off a backdrop
         route so the backdrop drops to its transparent state
         immediately on the next render. */
      setScrolled(false);
      return;
    }
    const SCROLL_THRESHOLD = 8;
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [backdropEnabled]);

  return (
    <header
      className={`header${
        backdropEnabled && scrolled ? " is-scrolled" : ""
      }${isOpen ? " is-menu-open" : ""}`}
    >
      {/* Backdrop spans the full header — transparent at top of page,
          fades to the page (body) theme bg once the user scrolls. No
          data-theme attribute so it inherits the body's theme bg. */}
      <span className="header__backdrop" aria-hidden="true" />
      <a
        className="header__square link text-h6 text-caps"
        href="/"
        data-theme="dark"
      >
        <SplitText>{logoText}</SplitText>
      </a>
      <button
        type="button"
        className="header__square header__square--button link text-h6 text-caps"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls="site-menu"
        data-theme="dark"
      >
        {/* Re-key on label so React unmounts the previous SplitText
            and the new chars start from a clean per-token --index. */}
        <SplitText key={triggerLabel}>{triggerLabel}</SplitText>
      </button>
    </header>
  );
}
