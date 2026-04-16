/**
 * BannerShowroom
 * ==============
 * Sticky 200svh banner section. A muted looping background video
 * sits behind two editorial columns — heading on the left, address
 * + CTA on the right — separated by a horizontal rule that scales
 * in as the section scrubs through the viewport.
 *
 * The background video is clickable: it raises a fullscreen
 * VideoPlayer overlay with the featured video (separate URL,
 * unmuted, with custom controls).
 *
 * Hover-state UX:
 *   - Mousing over the background shows the global pink
 *     `HoverCursor` chip with the `cursorLabel` text (e.g. "Play")
 *   - This is driven entirely by `data-cursor-label` on the clickable
 *     area — no component-specific cursor wiring lives here
 *
 * Scroll animations (scrubbed):
 *   - Left column slides in from the right
 *   - Right column slides in from the left
 *   - Horizontal rule scales from 0 to 1 (left → right)
 *   - Background video scales up + fades down in opacity
 *
 * Theme: dark. All colours / typography / spacing are tokenised —
 * the panel widths + the decorative rule width are the only
 * hardcoded rem values (explained inline).
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useGSAP } from "@/hooks/useGSAP";
import { ease, duration } from "@/config/animations.config";
import type { BannerShowroomData } from "@/sanity/queries/bannerShowroom";

import "./BannerShowroom.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ------------------------------------------------------------------
   Component
   ------------------------------------------------------------------ */

export default function BannerShowroom({
  sectionLabel,
  heading,
  cursorLabel,
  backgroundVideoUrl,
  modalVideoUrl,
}: BannerShowroomData) {
  const sectionRef = useRef<HTMLElement>(null);
  const colOneRef = useRef<HTMLDivElement>(null);
  const borderRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLButtonElement>(null);

  const [playerOpen, setPlayerOpen] = useState(false);

  const openPlayer = useCallback(() => {
    if (!modalVideoUrl) return;
    setPlayerOpen(true);
  }, [modalVideoUrl]);

  const closePlayer = useCallback(() => {
    setPlayerOpen(false);
  }, []);

  /* ── Scroll-scrubbed entry animations ──────────────────────────── */
  useGSAP(
    () => {
      const section = sectionRef.current;
      const colOne = colOneRef.current;
      const border = borderRef.current;
      const bg = bgRef.current;
      if (!section || !colOne || !border || !bg) return;

      function build() {
        /* Coefficient based on viewport width so the column slide
           distance scales with the layout. Reference uses 1600 as
           the denominator; matches the design width of the demo. */
        const c = window.innerWidth / 1600;

        gsap
          .timeline({
            defaults: { ease: ease.parallax },
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "bottom bottom",
              scrub: true,
            },
          })
          .fromTo(colOne, { x: c * 65 }, { x: 0 }, 0)
          .fromTo(
            border,
            { scaleX: 0 },
            { scaleX: 1, transformOrigin: "left center" },
            0,
          )
          .fromTo(bg, { opacity: 0.7, scale: 0.55 }, { opacity: 0.3, scale: 1 }, 0);
      }

      build();

      let resizeTimer: ReturnType<typeof setTimeout> | null = null;
      function onResize() {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          ScrollTrigger.getAll().forEach((st) => st.kill());
          build();
          ScrollTrigger.refresh();
        }, 250);
      }
      window.addEventListener("resize", onResize, { passive: true });

      return () => {
        if (resizeTimer) clearTimeout(resizeTimer);
        window.removeEventListener("resize", onResize);
      };
    },
    { scope: sectionRef, dependencies: [] },
  );

  /* Preserve the heading's line breaks (entered as real newlines
     in Sanity) as explicit spans so the `.line-mask` wrapper gives
     each line its own overflow-clip container. */
  const headingLines = (heading ?? "").split("\n");

  return (
    <>
      <section
        ref={sectionRef}
        className="banner-showroom"
        data-theme="dark"
        data-nav-theme="dark"
        aria-label={sectionLabel}
      >
        <p className="banner-showroom__label font-primary text-h4 leading-snug tracking-tight">
          {sectionLabel}
        </p>

        <div className="banner-showroom__sticky">
          <div className="banner-showroom__container">
            {/* Border rule — scales in as section scrubs */}
            <div
              ref={borderRef}
              className="banner-showroom__border"
              aria-hidden="true"
            />

            {/* Content — heading only (address + CTA removed per
                design call; right column collapsed to keep the
                heading anchored on the left against the scrubbing
                video backdrop). */}
            <div className="banner-showroom__content">
              <div ref={colOneRef} className="banner-showroom__column">
                <h2
                  className="banner-showroom__heading font-primary text-h3 leading-tight tracking-tight"
                  aria-label={headingLines.join(" ")}
                >
                  {headingLines.map((line, i) => (
                    <span
                      key={i}
                      className="banner-showroom__line-mask"
                      aria-hidden="true"
                    >
                      <span className="banner-showroom__line">{line}</span>
                    </span>
                  ))}
                </h2>
              </div>
            </div>

            {/* Background video — clickable, hover-cursor-labelled.
                Renders as a <button> in both the video and placeholder
                cases so the `data-cursor-label` chip is always
                triggerable on hover, even before the client has
                pasted video URLs. */}
            <button
              ref={bgRef}
              type="button"
              className={`banner-showroom__background${
                backgroundVideoUrl
                  ? ""
                  : " banner-showroom__background--placeholder"
              }`}
              data-cursor-label={cursorLabel}
              onClick={openPlayer}
              aria-label={cursorLabel}
              disabled={!modalVideoUrl}
            >
              {backgroundVideoUrl ? (
                <video
                  className="banner-showroom__video"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  src={backgroundVideoUrl}
                />
              ) : null}
            </button>
          </div>
        </div>
      </section>

      {/* Fullscreen player overlay */}
      {modalVideoUrl ? (
        <VideoPlayer
          src={modalVideoUrl}
          open={playerOpen}
          onClose={closePlayer}
        />
      ) : null}
    </>
  );
}

/* ------------------------------------------------------------------
   Inline VideoPlayer — fullscreen modal with custom controls
   ------------------------------------------------------------------ */

interface VideoPlayerProps {
  src: string;
  open: boolean;
  onClose: () => void;
}

function formatTime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const mm = String(Math.floor(total / 60)).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function VideoPlayer({ src, open, onClose }: VideoPlayerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rangeRef = useRef<HTMLInputElement>(null);
  const progressRef = useRef<HTMLProgressElement>(null);

  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [time, setTime] = useState(0);

  /* Open / close transitions via GSAP — matches the rest of the
     site's animation tokens rather than plain CSS. */
  useEffect(() => {
    const root = rootRef.current;
    const video = videoRef.current;
    if (!root || !video) return;

    if (open) {
      document.documentElement.classList.add("has-player-open");
      gsap.fromTo(
        root,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: duration.normal, ease: ease.entrance },
      );
      video.play().catch(() => {
        /* Autoplay with sound is blocked on initial user gesture
           chains — swallow the rejection; user can tap Play. */
      });
      setIsPaused(false);
    } else {
      gsap.to(root, {
        autoAlpha: 0,
        duration: duration.normal,
        ease: ease.exit,
        onComplete: () => {
          video.pause();
          video.currentTime = 0;
          document.documentElement.classList.remove("has-player-open");
        },
      });
    }
  }, [open]);

  /* Escape closes */
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  /* Close on fullscreen-exit (iOS) + when video ends */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onEnded = () => onClose();
    const onIOSEnd = () => onClose();
    video.addEventListener("ended", onEnded);
    video.addEventListener("webkitendfullscreen", onIOSEnd);
    return () => {
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("webkitendfullscreen", onIOSEnd);
    };
  }, [onClose]);

  /* Sync timeline + range with currentTime via requestAnimationFrame.
     Using GSAP ticker would add it to the global frame loop, but this
     is scoped enough to use plain RAF. */
  useEffect(() => {
    const video = videoRef.current;
    const range = rangeRef.current;
    const progress = progressRef.current;
    if (!video || !range || !progress) return;
    let raf = 0;
    function tick() {
      if (video && range && progress && !Number.isNaN(video.duration)) {
        range.value = String(video.currentTime);
        progress.value = video.currentTime;
        setTime(video.currentTime);
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* On metadata: set max on range + progress */
  useEffect(() => {
    const video = videoRef.current;
    const range = rangeRef.current;
    const progress = progressRef.current;
    if (!video || !range || !progress) return;
    function onReady() {
      if (video && range && progress && video.duration) {
        range.max = String(video.duration);
        progress.max = video.duration;
      }
    }
    video.addEventListener("canplay", onReady);
    return () => video.removeEventListener("canplay", onReady);
  }, []);

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused || video.ended) {
      video.play();
      setIsPaused(false);
    } else {
      video.pause();
      setIsPaused(true);
    }
  }

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }

  function onScrub(event: React.ChangeEvent<HTMLInputElement>) {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Number(event.target.value);
  }

  return (
    <div
      ref={rootRef}
      className={`banner-showroom__player${open ? " is-open" : ""}`}
      data-theme="dark"
      data-lenis-prevent=""
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
      style={{ opacity: 0, visibility: "hidden" }}
    >
      <video
        ref={videoRef}
        className="banner-showroom__player-video"
        src={src}
        playsInline
        disablePictureInPicture
      />

      <button
        type="button"
        className="banner-showroom__player-close"
        onClick={onClose}
        aria-label="Close video"
      >
        <svg
          viewBox="0 0 13 13"
          width="14"
          height="14"
          fill="none"
          aria-hidden="true"
        >
          <path d="M0.35 11.67 11.67 0.35" stroke="currentColor" strokeWidth="1" />
          <path d="M0.35 0.35 11.67 11.67" stroke="currentColor" strokeWidth="1" />
        </svg>
      </button>

      <div className="banner-showroom__player-controls">
        <button
          type="button"
          className="banner-showroom__player-btn banner-showroom__player-btn--pause font-secondary text-text-xs tracking-caps uppercase"
          onClick={togglePlay}
        >
          {isPaused ? "Play" : "Pause"}
        </button>

        <div className="banner-showroom__player-timeline">
          <input
            ref={rangeRef}
            type="range"
            className="banner-showroom__player-range"
            min={0}
            step={0.01}
            defaultValue={0}
            onChange={onScrub}
            aria-label="Video progress"
          />
          <progress
            ref={progressRef}
            className="banner-showroom__player-progress"
            value={0}
            max={100}
          />
        </div>

        <p className="banner-showroom__player-time font-secondary text-text-xs tracking-caps uppercase u-nums">
          {formatTime(time)}
        </p>

        <button
          type="button"
          className="banner-showroom__player-btn banner-showroom__player-btn--mute font-secondary text-text-xs tracking-caps uppercase"
          onClick={toggleMute}
        >
          {isMuted ? "Unmute" : "Mute"}
        </button>
      </div>
    </div>
  );
}
