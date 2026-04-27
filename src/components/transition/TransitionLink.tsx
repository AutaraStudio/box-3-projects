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

import { forwardRef, type AnchorHTMLAttributes, type MouseEvent } from "react";

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

const TransitionLink = forwardRef<HTMLAnchorElement, TransitionLinkProps>(
  function TransitionLink(
    { href, pageName, onClick, target, download, children, ...rest },
    ref,
  ) {
    const { triggerTransition } = usePageTransition();

    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(event);

      if (event.defaultPrevented) return;
      if (target === "_blank") return;
      if (download !== undefined) return;
      if (isModifiedEvent(event)) return;
      if (isExternal(href)) return;

      /* In-page anchor — scroll smoothly via Lenis if available,
         fall back to native scrollIntoView. Skip the page
         transition so the wipe panel doesn't fire on an anchor
         jump. URL hash is updated via history.pushState so the
         address bar reflects the new fragment without triggering
         a navigation. */
      if (href.startsWith("#")) {
        event.preventDefault();
        const targetEl = document.querySelector(href);
        if (targetEl instanceof HTMLElement) {
          if (window.__lenis) {
            window.__lenis.scrollTo(targetEl);
          } else {
            targetEl.scrollIntoView({ behavior: "smooth" });
          }
        }
        if (window.location.hash !== href) {
          window.history.pushState(null, "", href);
        }
        return;
      }

      event.preventDefault();
      void triggerTransition(href, pageName);
    };

    return (
      <a
        ref={ref}
        href={href}
        target={target}
        download={download}
        onClick={handleClick}
        {...rest}
      >
        {children}
      </a>
    );
  },
);

export default TransitionLink;
