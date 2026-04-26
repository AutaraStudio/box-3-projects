/**
 * TransitionLink
 * ==============
 * Drop-in replacement for next/link that runs the page transition
 * before navigating. For external links, modified clicks (cmd/ctrl/
 * middle-click), download links, and target=_blank links it falls
 * through to the browser's default behaviour so multi-tab + middle-
 * click open-in-new-tab keep working.
 *
 * Pass an optional `pageName` to show a label in the wipe panel.
 */

"use client";

import { type AnchorHTMLAttributes, type MouseEvent } from "react";

import { usePageTransition } from "./PageTransitionProvider";

interface TransitionLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  pageName?: string;
}

function isModifiedEvent(event: MouseEvent<HTMLAnchorElement>) {
  return (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  );
}

function isExternal(href: string) {
  return (
    /^https?:\/\//.test(href) ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  );
}

export default function TransitionLink({
  href,
  pageName,
  onClick,
  target,
  download,
  children,
  ...rest
}: TransitionLinkProps) {
  const { triggerTransition } = usePageTransition();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);

    if (event.defaultPrevented) return;
    if (target === "_blank") return;
    if (download !== undefined) return;
    if (isModifiedEvent(event)) return;
    if (isExternal(href)) return;

    event.preventDefault();
    void triggerTransition(href, pageName);
  };

  return (
    <a href={href} target={target} download={download} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
