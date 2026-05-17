"use client";

/**
 * VideoOverlay
 * ============
 * Full-viewport modal that plays one walkthrough video at a time.
 * Mounted by the parent <ContentGuide> when a section's "Watch"
 * button is clicked, unmounted on close.
 *
 * Close affordances:
 *   - ESC key
 *   - Click the dim backdrop
 *   - Click the explicit ✕ button
 *
 * While open, the body's overflow is locked so the page underneath
 * can't scroll behind the modal.
 */

import { useEffect, useRef } from "react";

import "./VideoOverlay.css";

interface VideoOverlayProps {
  src: string;
  title: string;
  onClose: () => void;
}

export default function VideoOverlay({ src, title, onClose }: VideoOverlayProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);

    /* Lock page scroll while open so the user can't accidentally
       wheel the underlying guide while focused on the video. */
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    /* Move focus to the close button for keyboard-only users. */
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="video-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="video-overlay__inner"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="video-overlay__header">
          <h2 className="video-overlay__title text-h4">{title}</h2>
          <button
            ref={closeButtonRef}
            type="button"
            className="video-overlay__close"
            onClick={onClose}
            aria-label="Close video"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="video-overlay__player">
          <video
            key={src}
            className="video-overlay__video"
            controls
            autoPlay
            playsInline
            preload="metadata"
          >
            <source src={src} type="video/mp4" />
            Your browser doesn&rsquo;t support embedded video. Open
            the link directly: <a href={src}>{src}</a>
          </video>
        </div>
      </div>
    </div>
  );
}
