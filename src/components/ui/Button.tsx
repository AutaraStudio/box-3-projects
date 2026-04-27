/**
 * Button
 * ======
 * Global text button with a sliding underline + SplitText char
 * roll-over hover. Lifted from the editorial "View Project →"
 * pattern in the MenuOverlay so the same affordance is available
 * everywhere on the site.
 *
 * Polymorphic — renders as:
 *   - <TransitionLink>  when an internal `href` is supplied
 *   - <a>               when an external `href` is supplied (http(s),
 *                       mailto, tel, target=_blank). TransitionLink
 *                       falls through to a real anchor for these
 *                       internally, so we just use <a> directly to
 *                       skip an unnecessary client component.
 *   - <button>          otherwise (use `onClick`)
 *
 * Composes a SplitText (asWords by default — char stagger feels
 * chaotic for short labels with punctuation) so the label gets the
 * site's editorial roll-over hover treatment via the `.link` class.
 *
 * Usage:
 *   <Button href="/projects/foo">View Project →</Button>
 *   <Button onClick={openLightbox} icon={<ArrowIcon />}>Open</Button>
 *   <Button href="https://instagram.com/...">Instagram ↗</Button>
 */

import type { MouseEventHandler, ReactNode } from "react";

import SplitText from "@/components/split-text/SplitText";
import TransitionLink from "@/components/transition/TransitionLink";

import "./Button.css";

type ButtonSize = "sm" | "md" | "lg" | "xl";

/** Maps the Button size prop onto a v2 typography utility class.
 *  Picked so each step is a perceptual jump:
 *    sm  → text-small  (0.875rem)  — fine-print CTAs, footer
 *    md  → text-main   (1rem)      — DEFAULT
 *    lg  → text-large  (1.25rem)   — section CTAs
 *    xl  → text-h5     (1.5rem)    — hero / display CTAs */
const SIZE_TYPOGRAPHY: Record<ButtonSize, string> = {
  sm: "text-small",
  md: "text-main",
  lg: "text-large",
  xl: "text-h5",
};

interface BaseProps {
  /** Label text. Wrapped in SplitText for the char roll hover. */
  children: string;
  /** Optional trailing icon — sits to the right of the label. */
  icon?: ReactNode;
  /** Override the SplitText split. Defaults to `words`; use `chars`
   *  for very short single-word labels. */
  split?: "words" | "chars";
  /** Size step. Defaults to "md". */
  size?: ButtonSize;
  className?: string;
  ariaLabel?: string;
}

interface AsLinkProps extends BaseProps {
  href: string;
  /** Hint name used by the page-transition overlay. */
  pageName?: string;
  target?: "_blank" | "_self";
  rel?: string;
  /** Optional click hook even for link variants — useful for closing
   *  a menu or modal at the same time as the navigation kicks off. */
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  type?: never;
  disabled?: never;
}

interface AsButtonProps extends BaseProps {
  href?: never;
  pageName?: never;
  target?: never;
  rel?: never;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export type ButtonProps = AsLinkProps | AsButtonProps;

const EXTERNAL = /^(https?:\/\/|mailto:|tel:)/;

export default function Button(props: ButtonProps) {
  const {
    children,
    icon,
    split = "words",
    size = "md",
    className,
    ariaLabel,
  } = props;

  const rootClass = `btn btn--${size} link ${SIZE_TYPOGRAPHY[size]} text-caps${
    className ? ` ${className}` : ""
  }`;

  const inner = (
    <>
      <span className="btn__label">
        {split === "words" ? (
          <SplitText asWords>{children}</SplitText>
        ) : (
          <SplitText>{children}</SplitText>
        )}
      </span>
      {icon ? (
        <span className="btn__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="btn__underline" aria-hidden="true" />
    </>
  );

  /* Link variants */
  if ("href" in props && props.href) {
    const isExternal =
      EXTERNAL.test(props.href) || props.target === "_blank";
    if (isExternal) {
      return (
        <a
          className={rootClass}
          href={props.href}
          target={props.target}
          rel={props.rel ?? (props.target === "_blank" ? "noopener noreferrer" : undefined)}
          aria-label={ariaLabel}
          onClick={props.onClick}
        >
          {inner}
        </a>
      );
    }
    return (
      <TransitionLink
        className={rootClass}
        href={props.href}
        pageName={props.pageName}
        aria-label={ariaLabel}
        onClick={props.onClick}
      >
        {inner}
      </TransitionLink>
    );
  }

  /* Button variant */
  return (
    <button
      type={(props as AsButtonProps).type ?? "button"}
      className={rootClass}
      onClick={(props as AsButtonProps).onClick}
      disabled={(props as AsButtonProps).disabled}
      aria-label={ariaLabel}
    >
      {inner}
    </button>
  );
}
