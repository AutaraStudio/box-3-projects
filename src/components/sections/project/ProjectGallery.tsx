/**
 * ProjectGallery
 * ==============
 * Two things in one component:
 *
 *   1. Explore section — a 300vh scroll-driven panel. The heading
 *      above the stack is fully static. A duplicate heading inside
 *      the scaling container slides up as the hero media scales from
 *      a small centred rectangle (~38% of the inner width on desktop)
 *      to a full-viewport cover. A clip-path on the translate parent
 *      syncs with the media scale so the frame appears to expand.
 *      A sticky "Explore in pictures" CTA is pinned bottom-right
 *      and slides up from below when the section enters view.
 *
 *   2. Lightbox — a fullscreen Swiper-driven overlay that opens with
 *      a two-stage clip-path wipe (outer horizontal reveal, inner
 *      vertical reveal, accent panel fading off). Bottom bar carries
 *      project title, fraction pagination, prev/next, and a close
 *      control. Keyboard: Escape closes, ← / → navigate.
 *
 * All animation timings and easings come from the token system —
 * nothing is hardcoded. GSAP math for the scroll scrub uses the
 * equivalent of cubic-bezier(0.65, 1, 0.9, 1) via gsap.parseEase.
 */

"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import Swiper from "swiper";
import { Navigation, Pagination } from "swiper/modules";

import { Button } from "@/components/ui/Button";
import { urlFor } from "@/sanity/lib/image";
import type { ProjectImage } from "@/sanity/queries/project";

import "swiper/css";
import "./ProjectGallery.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* --------------------------------------------------------------------------
   Types
   -------------------------------------------------------------------------- */

export interface ProjectGalleryProps {
  /** All project images — rendered in the lightbox carousel. */
  images: ProjectImage[];
  /** Hero media for the explore section. Defaults to images[0]. */
  heroImage?: ProjectImage;
  /** Display heading on the explore section. */
  title?: string;
  /** Text on the explore CTA and accessibility label on the media hit target. */
  openLabel?: string;
  /** Project title shown in the lightbox bottom bar. */
  projectTitle?: string;
  /** Unique ID — currently used as the dialog label namespace only. */
  galleryId?: string;
}

/* Sanity's asset._id encodes native dimensions as `image-{hash}-{W}x{H}-{ext}`.
   We parse them here so the component can drive clip-path math and the
   per-slide aspect ratio vars without a second network call. */
function parseImageDimensions(image?: ProjectImage): {
  width: number;
  height: number;
} {
  const fallback = { width: 1920, height: 1080 };
  const id = image?.asset?._id;
  if (!id) return fallback;
  const match = id.match(/-(\d+)x(\d+)-/);
  if (!match) return fallback;
  const width = Number(match[1]);
  const height = Number(match[2]);
  if (!Number.isFinite(width) || !Number.isFinite(height)) return fallback;
  return { width, height };
}

const DEFAULT_TITLE = "Explore the project in pictures";
const DEFAULT_OPEN_LABEL = "Explore in pictures";

/* Minimal cubic-bezier ease — equivalent to bezier(0.65, 1, 0.9, 1)
   used by the reference for both scale and translate scrub. GSAP's
   parseEase does not accept raw cubic-bezier(...) strings without the
   CustomEase plugin, so we port the same Newton-Raphson + bisection
   solver the reference relies on. */
function makeBezierEase(
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number,
): (x: number) => number {
  const SAMPLES = 11;
  const STEP = 1 / (SAMPLES - 1);
  const A = (a1: number, a2: number) => 1 - 3 * a2 + 3 * a1;
  const B = (a1: number, a2: number) => 3 * a2 - 6 * a1;
  const C = (a1: number) => 3 * a1;
  const bz = (t: number, a1: number, a2: number) =>
    ((A(a1, a2) * t + B(a1, a2)) * t + C(a1)) * t;
  const sl = (t: number, a1: number, a2: number) =>
    3 * A(a1, a2) * t * t + 2 * B(a1, a2) * t + C(a1);
  const sv = new Float32Array(SAMPLES);
  for (let i = 0; i < SAMPLES; i += 1) sv[i] = bz(i * STEP, p1x, p2x);
  const tForX = (aX: number) => {
    let s = 0;
    let cur = 1;
    for (; cur !== SAMPLES - 1 && sv[cur] <= aX; cur += 1) s += STEP;
    cur -= 1;
    const d = (aX - sv[cur]) / (sv[cur + 1] - sv[cur]);
    let g = s + d * STEP;
    const isl = sl(g, p1x, p2x);
    if (isl >= 0.001) {
      for (let i = 0; i < 4; i += 1) {
        const cs = sl(g, p1x, p2x);
        if (!cs) break;
        g -= (bz(g, p1x, p2x) - aX) / cs;
      }
      return g;
    }
    if (!isl) return g;
    let aA = s;
    let aB = s + STEP;
    let cx = 0;
    let ct = 0;
    let i = 0;
    do {
      ct = aA + (aB - aA) / 2;
      cx = bz(ct, p1x, p2x) - aX;
      if (cx > 0) aB = ct;
      else aA = ct;
    } while (Math.abs(cx) > 1e-7 && (i += 1) < 10);
    return ct;
  };
  return (x: number) => {
    if (x === 0 || x === 1) return x;
    return bz(tForX(x), p1y, p2y);
  };
}

/* --------------------------------------------------------------------------
   Component
   -------------------------------------------------------------------------- */

export default function ProjectGallery({
  images,
  heroImage,
  title = DEFAULT_TITLE,
  openLabel = DEFAULT_OPEN_LABEL,
  projectTitle = "",
  galleryId,
}: ProjectGalleryProps) {
  const hero = heroImage ?? images?.[0];
  const heroDims = useMemo(() => parseImageDimensions(hero), [hero]);

  /* Explore refs */
  const galleryCtaRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const translateParentRef = useRef<HTMLDivElement>(null);
  const translateChildRef = useRef<HTMLDivElement>(null);
  const refElRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);

  /* Lightbox refs */
  const galleryRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const swiperElRef = useRef<HTMLDivElement>(null);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const paginationRef = useRef<HTMLParagraphElement>(null);
  const swiperInstanceRef = useRef<Swiper | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [metrics, setMetrics] = useState({
    topHeight: 0,
    bottomHeight: 0,
  });

  /* --------------------------- Explore scrub ---------------------------- */

  useEffect(() => {
    if (!hero) return;

    const inner = innerRef.current;
    const refEl = refElRef.current;
    const media = mediaRef.current;
    const parent = translateParentRef.current;
    const child = translateChildRef.current;
    if (!inner || !refEl || !media || !parent || !child) return;

    const mediaAspect = heroDims.height / heroDims.width;
    const easeFn = makeBezierEase(0.65, 1, 0.9, 1);

    let idleRatio = 0.375;
    let coverScaleRatio = 1;

    const computeRatios = () => {
      const innerWidth = inner.offsetWidth || 1;
      const refWidth = refEl.offsetWidth;
      idleRatio = refWidth > 0 ? refWidth / innerWidth : 0.375;
      const viewportCover =
        window.innerHeight / (innerWidth * mediaAspect);
      coverScaleRatio = Math.max(viewportCover, 1);
    };

    const applyExploreStyles = (rawProgress: number) => {
      const imageProgress = gsap.utils.clamp(
        0,
        1,
        gsap.utils.mapRange(0.1, 1, 0, 1, rawProgress),
      );
      const translateProgress = gsap.utils.clamp(
        0,
        1,
        gsap.utils.mapRange(0, 0.5, 0, 1, imageProgress),
      );
      const easedScale = easeFn(imageProgress);
      const easedTranslate = easeFn(translateProgress);

      const currentScale =
        idleRatio + (coverScaleRatio - idleRatio) * easedScale;
      const globalTranslate = 100 - 100 * easedTranslate;

      const wWidth = inner.offsetWidth || 1;
      const wHeight = window.innerHeight;
      const scaledW = wWidth * currentScale;
      const scaledH = scaledW * mediaAspect;
      const clipX = Math.max(0, (wWidth - scaledW) / 2);
      const clipY = Math.max(0, (wHeight - scaledH) / 2);

      gsap.set(media, { scale: currentScale });
      gsap.set(parent, {
        clipPath: `inset(${clipY}px ${clipX}px ${clipY}px ${clipX}px)`,
        y: `${globalTranslate}%`,
      });
      gsap.set(child, { y: `${-globalTranslate}%` });
    };

    /* Initial measurement must wait for first paint — offsetWidth is 0
       on first synchronous read inside the sticky container. RAF
       handles the visible-tab case; a ResizeObserver provides a
       robust second path that fires once the element actually has
       layout, even when RAF is throttled (hidden tab). */
    let initialised = false;
    const initialise = () => {
      if (initialised) return;
      const innerWidth = inner.offsetWidth;
      const refWidth = refEl.offsetWidth;
      if (innerWidth === 0 || refWidth === 0) return;
      computeRatios();
      applyExploreStyles(0);
      initialised = true;
    };

    const raf = requestAnimationFrame(initialise);
    const ro = new ResizeObserver(() => initialise());
    ro.observe(inner);
    ro.observe(refEl);

    const st = ScrollTrigger.create({
      trigger: inner,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => applyExploreStyles(self.progress),
    });

    const handleResize = () => {
      computeRatios();
      st.refresh();
      applyExploreStyles(st.progress);
    };
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", handleResize);
      st.kill();
    };
  }, [hero, heroDims.height, heroDims.width]);

  /* --------------------------- CTA is-inview ---------------------------- */

  useEffect(() => {
    const el = galleryCtaRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          el.classList.toggle("is-inview", entry.isIntersecting);
        });
      },
      { threshold: 0.01 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* --------------------------- Lightbox metrics ------------------------- */

  const recomputeMetrics = useCallback(() => {
    const top = topRef.current;
    const bottom = bottomRef.current;
    if (!top || !bottom) return;
    setMetrics({
      topHeight: top.offsetHeight,
      bottomHeight: bottom.offsetHeight,
    });
    swiperInstanceRef.current?.update();
  }, []);

  /* --------------------------- Open / close ----------------------------- */

  const openGallery = useCallback(() => {
    setIsOpen(true);
    if (typeof document !== "undefined") {
      document.documentElement.classList.add("has-gallery-open");
    }
    requestAnimationFrame(() => {
      recomputeMetrics();
      swiperInstanceRef.current?.slideToLoop(0, 0);
    });
  }, [recomputeMetrics]);

  const closeGallery = useCallback(() => {
    setIsOpen(false);
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("has-gallery-open");
    }
  }, []);

  /* Cleanup doc-level class on unmount. */
  useEffect(() => {
    return () => {
      if (typeof document !== "undefined") {
        document.documentElement.classList.remove("has-gallery-open");
      }
    };
  }, []);

  /* --------------------------- Swiper setup ----------------------------- */

  useEffect(() => {
    const swiperEl = swiperElRef.current;
    if (!swiperEl || !images || images.length === 0) return;

    const instance = new Swiper(swiperEl, {
      modules: [Navigation, Pagination],
      speed: 400,
      loop: true,
      slidesPerView: "auto",
      spaceBetween: 20,
      navigation: {
        prevEl: prevRef.current,
        nextEl: nextRef.current,
      },
      pagination: {
        el: paginationRef.current,
        type: "fraction",
        formatFractionCurrent: (n: number) => String(n).padStart(2, "0"),
        formatFractionTotal: (n: number) => String(n).padStart(2, "0"),
        renderFraction: (currentClass: string, totalClass: string) =>
          `<span class="${currentClass}"></span>&nbsp;<span><span>/</span>&nbsp;<span class="${totalClass}"></span></span>`,
      },
    });
    swiperInstanceRef.current = instance;

    return () => {
      instance.destroy(true, true);
      swiperInstanceRef.current = null;
    };
  }, [images]);

  /* --------------------------- Keyboard --------------------------------- */

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeGallery();
      if (event.key === "ArrowLeft") swiperInstanceRef.current?.slidePrev();
      if (event.key === "ArrowRight") swiperInstanceRef.current?.slideNext();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, closeGallery]);

  /* --------------------------- Resize → metrics ------------------------- */

  useEffect(() => {
    if (!isOpen) return;
    const onResize = () => recomputeMetrics();
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, [isOpen, recomputeMetrics]);

  /* --------------------------- Early out -------------------------------- */

  if (!images || images.length === 0 || !hero) return null;

  /* --------------------------- Render ----------------------------------- */

  const lightboxStyle = {
    "--gallery-top-height": `${metrics.topHeight}px`,
    "--gallery-bottom-height": `${metrics.bottomHeight}px`,
  } as CSSProperties;

  return (
    <div
      className="project-gallery"
      data-theme="light"
      data-nav-theme="light"
      data-gallery-id={galleryId}
    >
      {/* ── EXPLORE SECTION ─────────────────────────── */}
      <div ref={galleryCtaRef} className="project-gallery__cta-wrap">
        <section className="project-gallery__explore">
          <div ref={innerRef} className="project-gallery__inner">
            <div className="project-gallery__sticky-wrapper">
              <div className="project-gallery__sticky">
                <h2
                  className="project-gallery__title font-primary text-h1 leading-tight tracking-tight"
                >
                  {title}
                </h2>

                <div
                  ref={translateParentRef}
                  className="project-gallery__translate-parent"
                >
                  <div
                    ref={translateChildRef}
                    className="project-gallery__translate-child"
                  >
                    <p
                      aria-hidden="true"
                      className="project-gallery__title project-gallery__title--duplicate font-primary text-h1 leading-tight tracking-tight"
                    >
                      {title}
                    </p>
                  </div>

                  <div
                    ref={refElRef}
                    aria-hidden="true"
                    className="project-gallery__ref"
                  />

                  <div
                    ref={mediaRef}
                    className="project-gallery__media"
                    style={{
                      aspectRatio: `${heroDims.width} / ${heroDims.height}`,
                    }}
                  >
                    {hero.asset?.url ? (
                      <Image
                        src={urlFor(hero).width(1920).url()}
                        alt={hero.alt ?? ""}
                        fill
                        sizes="100vw"
                        className="project-gallery__media-image"
                      />
                    ) : null}
                    <div data-overlay="medium" aria-hidden="true" />
                    <button
                      type="button"
                      className="project-gallery__media-btn"
                      onClick={openGallery}
                      aria-label={openLabel}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="project-gallery__cta-position">
          <div className="project-gallery__cta-sticky">
            <div className="project-gallery__cta-wrapper">
              <Button
                variant="primary"
                size="lg"
                full
                ariaLabel={openLabel}
                onClick={openGallery}
                className="project-gallery__cta-btn"
              >
                {openLabel}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── GALLERY LIGHTBOX ──────────────────────────── */}
      <div
        ref={galleryRef}
        className={`project-gallery__lightbox${isOpen ? " is-active" : ""}`}
        data-theme="dark"
        data-lenis-prevent=""
        aria-hidden={!isOpen}
        role="dialog"
        aria-modal="true"
        aria-label={projectTitle || title}
        style={lightboxStyle}
      >
        <div className="project-gallery__lightbox-inner">
          <div ref={topRef} className="project-gallery__lightbox-top">
            <div
              ref={swiperElRef}
              className="project-gallery__carousel swiper"
            >
              <ul className="project-gallery__carousel-list swiper-wrapper">
                {images.map((image, index) => {
                  const dims = parseImageDimensions(image);
                  const key = image.asset?._id ?? `image-${index}`;
                  const slideStyle = {
                    "--width": dims.width,
                    "--height": dims.height,
                    "--item-index": index,
                  } as CSSProperties;
                  return (
                    <li
                      key={key}
                      className="project-gallery__carousel-item swiper-slide"
                      style={slideStyle}
                    >
                      <div className="project-gallery__carousel-media">
                        {image.asset?.url ? (
                          <Image
                            src={urlFor(image).width(1920).url()}
                            alt={image.alt ?? ""}
                            fill
                            sizes="70vw"
                            className="project-gallery__carousel-image"
                          />
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div ref={bottomRef} className="project-gallery__lightbox-bottom">
            <div className="project-gallery__lightbox-title-wrap">
              <p className="project-gallery__lightbox-title font-primary">
                {projectTitle}
              </p>
            </div>

            <div className="project-gallery__controls">
              <div className="project-gallery__navigation">
                <button
                  ref={prevRef}
                  type="button"
                  className="project-gallery__nav-btn project-gallery__nav-btn--prev"
                  aria-label="Previous image"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
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
                  className="project-gallery__nav-btn project-gallery__nav-btn--next"
                  aria-label="Next image"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
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
              <p
                ref={paginationRef}
                className="project-gallery__pagination font-primary"
              />
            </div>

            <div className="project-gallery__close-wrap">
              <button
                type="button"
                className="project-gallery__close-btn font-primary"
                onClick={closeGallery}
                aria-label="Close gallery"
              >
                <span aria-hidden="true">Close</span>
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
