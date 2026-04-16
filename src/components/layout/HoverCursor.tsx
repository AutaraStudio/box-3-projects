/**
 * HoverCursor
 * ===========
 * Global custom cursor that appears over any element carrying a
 * `data-cursor-label="…"` attribute. The label text is read from
 * the attribute so any component can opt in to this effect without
 * component-specific wiring.
 *
 * All DOM manipulation is imperative — no React state is used for
 * visibility or label text. This avoids re-render flicker on every
 * mousemove and keeps the effect cheap. The chip is rendered once
 * at provider level (fixed position, z: 100) and follows the
 * pointer via a GSAP ticker + lerp.
 *
 * The native system cursor is hidden only on `[data-cursor-label]`
 * elements via CSS in globals.css — everywhere else the standard
 * cursor is preserved. Mobile / touch devices are opted out
 * automatically.
 *
 * Usage:
 *   <button data-cursor-label="Play">Open video</button>
 *   <div data-cursor-label="Read more">…</div>
 */

"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";

import "./HoverCursor.css";

const SELECTOR = "[data-cursor-label]";
/* How quickly the chip catches up to the pointer per frame.
   0.18 is snappy without feeling glued. */
const LERP_FACTOR = 0.18;

interface HoverCursorProps {
  children: ReactNode;
}

export default function HoverCursor({ children }: HoverCursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const labelEl = labelRef.current;
    if (!cursor || !labelEl) return;

    /* Skip on touch / coarse pointer devices — hover-driven cursor
       has no meaning without a physical cursor. */
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!mq.matches) return;

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const pos = { x: mouse.x, y: mouse.y };
    let currentLabel = "";
    let currentVisible = false;

    function setLabel(next: string) {
      if (next === currentLabel) return;
      currentLabel = next;
      if (labelEl) labelEl.textContent = next;
    }

    function setVisible(next: boolean) {
      if (next === currentVisible) return;
      currentVisible = next;
      if (cursor) cursor.classList.toggle("is-visible", next);
    }

    function onMove(event: MouseEvent) {
      mouse.x = event.clientX;
      mouse.y = event.clientY;

      /* Walk up from the hovered element to find the nearest
         [data-cursor-label] ancestor. Using the event target lets
         nested elements (e.g. a <video> inside a wrapper div) pick
         up the label from their parent. */
      const target = event.target as Element | null;
      const host = target?.closest?.(SELECTOR) as HTMLElement | null;
      if (host) {
        setLabel(host.getAttribute("data-cursor-label") || "");
        setVisible(true);
      } else {
        setVisible(false);
      }
    }

    function onLeave() {
      setVisible(false);
    }

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);

    /* Lerp the cursor toward the mouse on every GSAP tick. Using
       the ticker keeps this frame-synced with ScrollTrigger + Lenis
       without spinning up a separate RAF loop. */
    function tick() {
      pos.x = pos.x + (mouse.x - pos.x) * LERP_FACTOR;
      pos.y = pos.y + (mouse.y - pos.y) * LERP_FACTOR;
      if (cursor) {
        cursor.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      }
    }
    gsap.ticker.add(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      gsap.ticker.remove(tick);
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="hover-cursor"
        aria-hidden="true"
      >
        <span
          ref={labelRef}
          className="hover-cursor__label font-secondary text-text-xs tracking-caps uppercase"
        />
      </div>
      {children}
    </>
  );
}
