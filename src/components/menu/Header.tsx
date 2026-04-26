/**
 * Header
 * ======
 * Two fixed squares — top-left logo, top-right menu trigger. The
 * trigger toggles the menu via the shared MenuProvider context.
 *
 * The trigger label flips between "Menu" and "Close" so users always
 * know what they're clicking. Both squares carry `data-theme="dark"`
 * so they read brown bg + pink text regardless of the underlying
 * page theme.
 */

"use client";

import { useMenu } from "./MenuProvider";
import "./Header.css";

interface HeaderProps {
  /** Text to render in the logo square. Replace with an SVG mark later. */
  logoText?: string;
}

export default function Header({ logoText = "BOX 3" }: HeaderProps) {
  const { isOpen, toggle } = useMenu();

  return (
    <header className="header" data-theme="dark">
      <a className="header__square text-h6 text-caps" href="/">
        {logoText}
      </a>
      <button
        type="button"
        className="header__square header__square--button text-h6 text-caps"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls="site-menu"
      >
        {isOpen ? "Close" : "Menu"}
      </button>
    </header>
  );
}
