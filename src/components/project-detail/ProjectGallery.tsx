/**
 * ProjectGallery
 * ==============
 * Two-part section, ported from v1 (master) — only the underlying
 * tokens are translated to v2 equivalents.
 *
 *   1. Explore section — a 300svh scroll-driven panel.
 *      A static heading sits in the centre. A duplicate of the
 *      heading inside a clip-path container slides up as the hero
 *      media scales from a small centred rectangle (~37.5% of the
 *      inner width on desktop) up to a full-viewport cover. The
 *      clip-path on the translate parent expands in lock-step with
 *      the media scale so the frame appears to grow with it. A
 *      sticky "Explore in pictures" CTA pinned bottom-right slides
 *      up from below when the section enters view.
 *
 *   2. Lightbox — fullscreen Swiper-driven overlay with a two-stage
 *      clip-path wipe (outer horizontal, then inner vertical, with
 *      an accent panel fading off). Bottom bar: project title,
 *      fraction pagination, prev/next, and a close control.
 *      Keyboard: Escape closes; ← / → navigate.
 *
 * Animation timings are inlined as constants at the top of the file
 * — no token system covers them yet. Eases reference v2's standard
 * editorial cubic-bezier(0.19, 1, 0.22, 1).
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

import Button from "@/components/ui/Button";
import Heading from "@/components/ui/Heading";
import { urlFor } from "@/sanity/lib/image";
import type { ProjectImage } from "@/sanity/queries/projects";

import "swiper/css";
import "./ProjectGallery.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* --------------------------------------------------------------------------
   Constants
   -------------------------------------------------------------------------- */

const DEFAULT_TITLE = "Explore the project in pictures";
const DEFAULT_OPEN_LABEL = "Explore in pictures";

interface ProjectGalleryProps {
  /** All project images — render in the lightbox carousel + the
   *  Explore section's hero (defaults to images[0]). */
  images: ProjectImage[];
  /** Hero media for the explore section. Defaults to images[0]. */
  heroImage?: ProjectImage;
  /** Display heading on the explore section. */
  title?: string;
  /** Lightbox CTA + media hit-target accessibility label. */
  openLabel?: string;
  /** Project title shown in the lightbox bottom bar. */
  projectTitle?: string;
  /** Optional ID — used as dialog label namespace only. */
  galleryId?: string;
}

/* --------------------------------------------------------------------------
   Helpers
   -------------------------------------------------------------------------- */

/* Sanity asset._id encodes native dimensions as
   `image-{hash}-{W}x{H}-{ext}`. Parse them so we can drive
   per-slide aspect ratio + clip-path math without a second
   network call. */
function parseImageDimensions(image?: ProjectImage): {
  width: number;
  height: number;
} {
  const fallback = { width: 1920, height: 1080 };
  const id = image?.asset?._id;
  if (!id) return fallback;
  const match = id.match(/-(\d+)x(\d+)-/);
  if (!match) return fallback;
  const w = Number(match[1]);
  const h = Number(match[2]);
  if (!Number.isFinite(w) || !Number.isFinite(h)) return fallback;
  return { width: w, height: h };
}

/* Cubic-bezier ease equivalent to (0.65, 1, 0.9, 1) — used by both
   the scale and translate scrub. GSAP's parseEase doesn't accept
   raw cubic-bezier strings without CustomEase, so we port the
   Newton-Raphson solver from the reference. */
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

  /* ── Explore scrub ──────────────────────────────────────────── */

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

    const apply = (rawProgress: number) => {
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

    /* offsetWidth is 0 on first synchronous read inside the sticky
       container — RAF + ResizeObserver give us two paths to the
       first measurement, so even hidden tabs (RAF throttled) settle
       once the element actually has layout. */
    let initialised = false;
    const initialise = () => {
      if (initialised) return;
      const w = inner.offsetWidth;
      const r = refEl.offsetWidth;
      if (w === 0 || r === 0) return;
      computeRatios();
      apply(0);
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
      onUpdate: (self) => apply(self.progress),
    });

    const handleResize = () => {
      computeRatios();
      st.refresh();
      apply(st.progress);
    };
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", handleResize);
      st.kill();
    };
  }, [hero, heroDims.height, heroDims.width]);

  /* ── Lightbox metrics ───────────────────────────────────────── */

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

  /* ── Open / close ───────────────────────────────────────────── */

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
    /* Keep <html> locked until the close animation finishes —
       removing it instantly would let the page jump back to its
       scroll position before the lightbox has visibly retracted.
       Total close duration: 0.6s clip-path + a small buffer for
       carousel slide stagger. */
    if (typeof document !== "undefined") {
      const html = document.documentElement;
      window.setTimeout(() => {
        html.classList.remove("has-gallery-open");
      }, 800);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (typeof document !== "undefined") {
        document.documentElement.classList.remove("has-gallery-open");
      }
    };
  }, []);

  /* ── Swiper setup ───────────────────────────────────────────── */

  useEffect(() => {
    const swiperEl = swiperElRef.current;
    if (!swiperEl || !images || images.length === 0) return;

    const instance = new Swiper(swiperEl, {
      modules: [Navigation, Pagination],
      speed: 400,
      loop: true,
      slidesPerView: "auto",
      spaceBetween: 20,
      /* Observer watches DOM mutations + image load events so
         Swiper re-measures slide widths once images arrive — without
         this, cloned loop slides can render at zero width until the
         user interacts. */
      observer: true,
      observeParents: true,
      observeSlideChildren: true,
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

  /* ── Keyboard ───────────────────────────────────────────────── */

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

  /* ── Resize → metrics ───────────────────────────────────────── */

  useEffect(() => {
    if (!isOpen) return;
    const onResize = () => recomputeMetrics();
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, [isOpen, recomputeMetrics]);

  /* ── Early out ──────────────────────────────────────────────── */

  if (!images || images.length === 0 || !hero) return null;

  /* ── Render ─────────────────────────────────────────────────── */

  const lightboxStyle = {
    "--gallery-top-height": `${metrics.topHeight}px`,
    "--gallery-bottom-height": `${metrics.bottomHeight}px`,
  } as CSSProperties;

  return (
    <div
      className="project-gallery"
      data-theme="dark"
      data-gallery-id={galleryId}
    >
      {/* ── EXPLORE SECTION ────────────────────────────────────── */}
      <div className="project-gallery__cta-wrap">
        <section className="project-gallery__explore">
          <div ref={innerRef} className="project-gallery__inner">
            <div className="project-gallery__sticky-wrapper">
              <div className="project-gallery__sticky">
                <Heading
                  as="h2"
                  className="project-gallery__title text-h1"
                >
                  {title}
                </Heading>

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
                      className="project-gallery__title project-gallery__title--duplicate text-h1"
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
                    <span
                      className="project-gallery__media-overlay"
                      aria-hidden="true"
                    />
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

        {/* Sticky CTA removed — the hero media itself is the
            click target (.project-gallery__media-btn is a full-
            cover transparent button), so the explicit "Explore
            in pictures" pill is redundant. */}
      </div>

      {/* ── LIGHTBOX ───────────────────────────────────────────── */}
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
                  /* Suffix with index — the featured image is
                     also passed in via additionalImages from the
                     page, so asset._id alone could collide. */
                  const key = `${image.asset?._id ?? "image"}-${index}`;
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
                          /* Plain <img> — Next's Image with `fill`
                             inside Swiper's cloned loop slides can
                             render at zero height until the first
                             interaction. Eager loading kicks off
                             the Sanity fetch immediately so images
                             are cached by the time the lightbox
                             opens. */
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={urlFor(image).width(1920).url()}
                            alt={image.alt ?? ""}
                            width={dims.width}
                            height={dims.height}
                            loading="eager"
                            decoding="async"
                            className="project-gallery__carousel-image"
                            onLoad={() => {
                              swiperInstanceRef.current?.update();
                            }}
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
            {/* Left: project title — anchors the bar. */}
            <p className="project-gallery__lightbox-title text-h5">
              {projectTitle}
            </p>

            {/* Right: one tidy control cluster. Counter → nav arrows
                → close, all baseline-aligned, consistent sizing. */}
            <div className="project-gallery__cluster">
              <p
                ref={paginationRef}
                className="project-gallery__pagination text-main"
              />
              <div className="project-gallery__navigation">
                <button
                  ref={prevRef}
                  type="button"
                  className="project-gallery__nav-btn"
                  aria-label="Previous image"
                >
                  <ArrowIcon direction="left" />
                </button>
                <button
                  ref={nextRef}
                  type="button"
                  className="project-gallery__nav-btn"
                  aria-label="Next image"
                >
                  <ArrowIcon direction="right" />
                </button>
              </div>
              <Button
                size="sm"
                onClick={closeGallery}
                ariaLabel="Close gallery"
                icon={<CloseIcon />}
                className="project-gallery__close"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
   Icons
   -------------------------------------------------------------------------- */

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transform: direction === "left" ? "rotate(180deg)" : undefined,
      }}
      aria-hidden="true"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="13 6 19 12 13 18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}
