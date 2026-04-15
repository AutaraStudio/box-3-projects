/**
 * Button — global reusable button component.
 *
 * Renders as <a> when `href` is provided, <button> otherwise.
 * Fully theme-aware — all colours cascade in from --theme-btn-*
 * tokens via local --btn-* CSS custom properties set on the
 * variant modifier class. The component itself is theme-agnostic.
 *
 * Hover animation is a two-stage clip-path wipe, driven entirely
 * by CSS in Button.css — no GSAP involved.
 *
 * Char slide-up label hover is handled globally by
 * CharHoverObserver + CSS rules in globals.css. The label span
 * carries `data-char-hover=""` to opt in.
 */

import type { MouseEventHandler, ReactNode } from "react";

import { cn } from "@/lib/utils";

import "./Button.css";

/* --------------------------------------------------------------------------
   Types
   -------------------------------------------------------------------------- */

type ButtonVariant = "primary" | "secondary";
type ButtonSize = "sm" | "md" | "lg" | "xl";

export interface ButtonProps {
  /** Visual style. Defaults to "primary". */
  variant?: ButtonVariant;
  /** Scale. Defaults to "md". */
  size?: ButtonSize;
  /** Stretch to fill the container width. */
  full?: boolean;
  /** When provided, renders as an <a> with this href. */
  href?: string;
  /** Anchor target — only applies when rendered as <a>. */
  target?: "_blank" | "_self";
  /** Anchor rel attribute — useful for external links. */
  rel?: string;
  /** Click handler — only applies when rendered as <button>. */
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** Button type attribute — only applies when rendered as <button>. */
  type?: "button" | "submit" | "reset";
  /** Button contents — typically a short label. */
  children: ReactNode;
  /** Additional classes merged onto the root element. */
  className?: string;
  /** Accessible label override for icon-only or ambiguous buttons. */
  ariaLabel?: string;
  /** Optional icon rendered on the trailing edge. */
  icon?: ReactNode;
  /** Disables the control — visually dimmed, not interactive. */
  disabled?: boolean;
}

/* --------------------------------------------------------------------------
   Component
   -------------------------------------------------------------------------- */

export function Button({
  variant = "primary",
  size = "md",
  full = false,
  href,
  target,
  rel,
  onClick,
  type = "button",
  children,
  className,
  ariaLabel,
  icon,
  disabled = false,
}: ButtonProps) {
  const rootClassName = cn(
    "btn",
    `btn--${variant}`,
    `btn--${size}`,
    full && "btn--full",
    disabled && "btn--disabled",
    className,
  );

  const inner = (
    <span className="btn__inner">
      <span className="btn__bg" aria-hidden="true" />
      <span className="btn__panel" aria-hidden="true" />
      <span className="btn__hover" aria-hidden="true" />
      <span className="btn__label">
        <span data-char-hover="">{children}</span>
      </span>
      {icon ? (
        <span className="btn__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
    </span>
  );

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        className={rootClassName}
        aria-label={ariaLabel}
        aria-disabled={disabled || undefined}
      >
        {inner}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={rootClassName}
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      disabled={disabled}
    >
      {inner}
    </button>
  );
}

export default Button;
