"use client";

/**
 * ProjectGallery
 * ==============
 * Two-part section for the project detail page:
 *
 *   Part 1 — Scroll-driven explore. A single hero image starts at
 *     a small idle width and scales up to cover the viewport as the
 *     user scrolls the 300vh container. Headline text is composited
 *     in front and translated upward as the image grows.
 *
 *   Part 2 — Swiper lightbox. Clicking the image opens a modal
 *     carousel with keyboard, navigation buttons, and fraction
 *     pagination. Lightbox lives in the same file as an inline
 *     component so the gallery owns its own modal presentation.
 *
 * Scroll math is a faithful port of the reference:
 *   progress      — raw ScrollTrigger 0..1
 *   imageProgress — remapped so the image holds idle for the first
 *                   10% of scroll before ramping
 *   scale         — interpolates from idleRatio → coverScaleRatio
 *   clipX/clipY   — centre-origin letterbox inside the viewport
 *   globalTranslate — headline slides up as the image takes over
 *
 * All colour and sizing values flow through --theme-* / --space-*
 * tokens — no hardcoded values beyond one approved foreign literal
 * for the scroll reference width (see ProjectGallery.css).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Swiper as SwiperInstance } from "swiper";

import { useGSAP } from "@/hooks/useGSAP";
import { scrollTrigger } from "@/config/animations.config";
import { urlFor } from "@/sanity/lib/image";
import type { ProjectImage } from "@/sanity/queries/project";

import "./ProjectGallery.css";

gsap.registerPlugin(ScrollTrigger);

/* --------------------------------------------------------------------------
   Helpers
   -------------------------------------------------------------------------- */

const clamp = (min: number, max: number, v: number): number =>
  Math.min(Math.max(v, min), max);

const mapRange = (
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
  v: number,
): number => outMin + ((outMax - outMin) * (v - inMin)) / (inMax - inMin);

const IMAGE_ASPECT_RATIO = 16 / 9;

/* --------------------------------------------------------------------------
   Main
   -------------------------------------------------------------------------- */

export interface ProjectGalleryProps {
  images: ProjectImage[];
}

export function ProjectGallery({ images }: ProjectGalleryProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const parentRef = useRef<HTMLDivElement | null>(null);
  const childrenRef = useRef<HTMLDivElement | null>(null);
  const refRef = useRef<HTMLDivElement | null>(null);
  const mediaRef = useRef<HTMLDivElement | null>(null);

  /* Cached scroll-math values — kept in refs to avoid re-renders. */
  const idleRatioRef = useRef<number>(0.375);
  const coverScaleRatioRef = useRef<number>(1);

  const [lightboxOpen, setLightboxOpen] = useState(false);

  const recomputeRatios = useCallback(() => {
    const sectionEl = sectionRef.current;
    const refEl = refRef.current;
    if (!sectionEl || !refEl) return;
    const sectionWidth = sectionEl.offsetWidth;
    if (sectionWidth <= 0) return;
    idleRatioRef.current = refEl.offsetWidth / sectionWidth;
    coverScaleRatioRef.current = Math.max(
      1,
      window.innerHeight / (sectionWidth * IMAGE_ASPECT_RATIO),
    );
  }, []);

  /* Recompute on mount and on resize. */
  useEffect(() => {
    recomputeRatios();
    const sectionEl = sectionRef.current;
    if (!sectionEl || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => recomputeRatios());
    observer.observe(sectionEl);
    window.addEventListener("resize", recomputeRatios, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", recomputeRatios);
    };
  }, [recomputeRatios]);

  /* Scroll-driven scale + clip + translate. */
  useGSAP(
    () => {
      if (!sectionRef.current) return;

      gsap.to(
        {},
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: scrollTrigger.scrub.scrub,
            onUpdate: (self) => {
              const sectionEl = sectionRef.current;
              const parentEl = parentRef.current;
              const childrenEl = childrenRef.current;
              const mediaEl = mediaRef.current;
              if (!sectionEl || !parentEl || !childrenEl || !mediaEl) return;

              const progress = self.progress;
              const imageProgress = clamp(
                0,
                1,
                mapRange(0.1, 1, 0, 1, progress),
              );

              const idleRatio = idleRatioRef.current;
              const coverScaleRatio = coverScaleRatioRef.current;

              const scale = clamp(
                idleRatio,
                coverScaleRatio,
                mapRange(0, 1, idleRatio, coverScaleRatio, imageProgress),
              );

              const sectionWidth = sectionEl.offsetWidth;
              const scaledWidth = sectionWidth * scale;
              const scaledHeight = scaledWidth / IMAGE_ASPECT_RATIO;
              const clipX = Math.max(0, (sectionWidth - scaledWidth) / 2);
              const clipY = Math.max(
                0,
                (window.innerHeight - scaledHeight) / 2,
              );

              const globalTranslate = clamp(
                0,
                100,
                mapRange(0, 0.5, 100, 0, imageProgress),
              );

              mediaEl.style.transform = `scale(${scale})`;
              parentEl.style.clipPath = `inset(${clipY}px ${clipX}px ${clipY}px ${clipX}px)`;
              childrenEl.style.transform = `translate3d(0, ${-globalTranslate}%, 0)`;
              parentEl.style.transform = `translate3d(0, ${globalTranslate}%, 0)`;
            },
          },
        },
      );
    },
    { scope: sectionRef, dependencies: [] },
  );

  if (!images || images.length < 1) {
    return null;
  }

  const heroImage = images[0];
  const heroImageUrl = urlFor(heroImage)
    .width(1920)
    .quality(85)
    .auto("format")
    .url();

  return (
    <section
      ref={sectionRef}
      className="project-gallery"
      data-theme="dark"
      data-nav-theme="dark"
      aria-label="Project gallery"
    >
      <div className="project-gallery__explore">
        <div className="project-gallery__sticky">
          {/* Static heading — visible before image grows over it */}
          <h2 className="project-gallery__heading">
            Explore the project in pictures
          </h2>

          {/* Animated translate wrapper */}
          <div className="project-gallery__translate-parent" ref={parentRef}>
            <div
              className="project-gallery__translate-children"
              ref={childrenRef}
            >
              <p
                className="project-gallery__heading-dup"
                aria-hidden="true"
              >
                Explore the project in pictures
              </p>
            </div>

            {/* Reference element — measures idle width, invisible */}
            <div
              className="project-gallery__ref"
              ref={refRef}
              aria-hidden="true"
            >
              Explore the project in pictures
            </div>

            {/* Media element — scales up on scroll */}
            <div
              className="project-gallery__media"
              ref={mediaRef}
              style={{ aspectRatio: "16 / 9" }}
            >
              <button
                type="button"
                className="project-gallery__open-btn"
                onClick={() => setLightboxOpen(true)}
                aria-label="Open image gallery"
              />
              <Image
                src={heroImageUrl}
                alt={heroImage.alt ?? ""}
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {lightboxOpen ? (
        <ProjectGalleryLightbox
          images={images}
          onClose={() => setLightboxOpen(false)}
        />
      ) : null}
    </section>
  );
}

/* --------------------------------------------------------------------------
   Lightbox — inline modal carousel
   -------------------------------------------------------------------------- */

interface ProjectGalleryLightboxProps {
  images: ProjectImage[];
  onClose: () => void;
}

function ProjectGalleryLightbox({
  images,
  onClose,
}: ProjectGalleryLightboxProps) {
  const swiperElRef = useRef<HTMLDivElement | null>(null);
  const paginationRef = useRef<HTMLDivElement | null>(null);
  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);
  const swiperInstanceRef = useRef<SwiperInstance | null>(null);

  /* Lock scroll and toggle the global has-gallery-open flag. */
  useEffect(() => {
    const html = document.documentElement;
    const prevOverflow = document.body.style.overflow;
    html.classList.add("has-gallery-open");
    document.body.style.overflow = "hidden";
    return () => {
      html.classList.remove("has-gallery-open");
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  /* Initialise Swiper. Dynamic import keeps it out of the initial bundle. */
  useEffect(() => {
    let cancelled = false;
    let instance: SwiperInstance | null = null;

    async function init() {
      if (!swiperElRef.current) return;

      const [{ default: Swiper }, { Navigation, Pagination }] =
        await Promise.all([
          import("swiper"),
          import("swiper/modules"),
          import("swiper/css"),
        ]);

      if (cancelled || !swiperElRef.current) return;

      instance = new Swiper(swiperElRef.current, {
        modules: [Navigation, Pagination],
        loop: true,
        speed: 400,
        slidesPerView: "auto",
        spaceBetween: 20,
        navigation: {
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        },
        pagination: {
          el: paginationRef.current,
          type: "fraction",
          renderFraction: (currentClass: string, totalClass: string) =>
            `<span class="${currentClass}"></span>` +
            `<span style="margin:0 4px">/</span>` +
            `<span class="${totalClass}"></span>`,
        },
      });
      swiperInstanceRef.current = instance;
    }

    init();

    return () => {
      cancelled = true;
      if (instance) {
        instance.destroy(true, true);
      }
      swiperInstanceRef.current = null;
    };
  }, []);

  /* Keyboard: Escape closes, arrow keys navigate. */
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      const swiper = swiperInstanceRef.current;
      if (!swiper) return;
      if (event.key === "ArrowLeft") {
        swiper.slidePrev();
      } else if (event.key === "ArrowRight") {
        swiper.slideNext();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="project-gallery-lightbox is-open"
      data-theme="dark"
      role="dialog"
      aria-modal="true"
      aria-label="Project image gallery"
    >
      <div className="project-gallery-lightbox__top">
        <div
          ref={paginationRef}
          className="project-gallery-lightbox__pagination"
        />
        <button
          type="button"
          className="project-gallery-lightbox__close"
          onClick={onClose}
          aria-label="Close gallery"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          <span className="font-secondary text-text-xs uppercase tracking-caps">
            Close
          </span>
        </button>
      </div>

      <div className="project-gallery-lightbox__swiper">
        <div className="swiper" ref={swiperElRef}>
          <div className="swiper-wrapper">
            {images.map((img, i) => (
              <div
                key={`${img.asset?._id ?? "slide"}-${i}`}
                className="swiper-slide"
              >
                <img
                  src={urlFor(img).width(1920).quality(85).auto("format").url()}
                  alt={img.alt ?? ""}
                  loading={i === 0 ? "eager" : "lazy"}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="project-gallery-lightbox__nav">
        <button
          ref={prevRef}
          type="button"
          className="project-gallery-lightbox__nav-btn"
          aria-label="Previous image"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          ref={nextRef}
          type="button"
          className="project-gallery-lightbox__nav-btn"
          aria-label="Next image"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default ProjectGallery;
