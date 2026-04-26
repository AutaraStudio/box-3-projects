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

import SplitText from "@/components/split-text/SplitText";
import { useMenu } from "./MenuProvider";
import "./Header.css";

interface HeaderProps {
  /** Text to render in the logo square. Replace with an SVG mark later. */
  logoText?: string;
}

export default function Header({ logoText = "BOX 3" }: HeaderProps) {
  const { isOpen, toggle } = useMenu();
  const triggerLabel = isOpen ? "Close" : "Menu";

  return (
    /* No data-theme override — the header inherits the page's
       active theme so the corner squares blend with the body
       background instead of always rendering as brown blocks. */
    <header className="header">
      <a className="header__square link text-h6 text-caps" href="/">
        <SplitText>{logoText}</SplitText>
      </a>
      <button
        type="button"
        className="header__square header__square--button link text-h6 text-caps"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls="site-menu"
      >
        {/* Re-key on label so React unmounts the previous SplitText
            and the new chars start from a clean per-token --index. */}
        <SplitText key={triggerLabel}>{triggerLabel}</SplitText>
      </button>
    </header>
  );
}
