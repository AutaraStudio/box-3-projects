/**
 * EditorialImageBlock
 * ===================
 * Reusable image-led feature band. Editorial label + display
 * heading on top, then a 8/4 split: large image on the left
 * (clip-path reveal) and a body paragraph stack on the right.
 *
 *   ┌────────────────────────────────────────────────────────┐
 *   │  LABEL                                                 │
 *   │                                                        │
 *   │  Display heading wrapping at a comfortable measure.    │
 *   │                                                        │
 *   │  ┌───────────────────────────────────┐ ┌────────────┐  │
 *   │  │                                   │ │ body       │  │
 *   │  │       LARGE IMAGE                 │ │ paragraph  │  │
 *   │  │      (clip-path reveal)           │ │ on the     │  │
 *   │  └───────────────────────────────────┘ │ right      │  │
 *   │                                        └────────────┘  │
 *   └────────────────────────────────────────────────────────┘
 *
 * Used on /careers (Culture section) and /sustainability — same
 * pattern, different content. Editor blob shape mirrors any
 * page-level Sanity image type, so call-sites can pass the
 * fetched data straight in.
 */

"use client";

import { useRef } from "react";
import Image from "next/image";

import Button from "@/components/ui/Button";
import Heading from "@/components/ui/Heading";
import RevealImage from "@/components/ui/RevealImage";
import RevealStack from "@/components/ui/RevealStack";
import { urlFor } from "@/sanity/lib/image";

import "./EditorialImageBlock.css";

export interface EditorialImageBlockImage {
  asset?: {
    _id: string;
    url: string;
    metadata?: {
      dimensions: { width: number; height: number; aspectRatio: number };
    };
  };
  alt?: string;
}

interface EditorialImageBlockProps {
  /** Small caps eyebrow label above the heading. */
  label?: string;
  /** Display heading. Renders via the SplitText reveal. */
  heading?: string;
  /** Body paragraphs. Blank lines split into separate <p>s. */
  body?: string;
  image?: EditorialImageBlockImage;
  /** Optional fallback alt text used when the image asset has none. */
  fallbackAlt?: string;
  /** Optional CTA below the body paragraphs. All three must be set
   *  for the button to render — otherwise the section keeps its
   *  existing image-only layout (so existing call-sites are
   *  unaffected). */
  ctaLabel?: string;
  ctaHref?: string;
  ctaPageName?: string;
}

export default function EditorialImageBlock({
  label,
  heading,
  body,
  image,
  fallbackAlt,
  ctaLabel,
  ctaHref,
  ctaPageName,
}: EditorialImageBlockProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  if (!heading && !body && !image) return null;

  const dims = image?.asset?.metadata?.dimensions;
  const renderWidth = 2400;
  const renderHeight = dims
    ? Math.round(renderWidth * (dims.height / dims.width))
    : Math.round(renderWidth * (3 / 4));
  const src = image?.asset
    ? urlFor(image as { asset: { _id: string } }).width(renderWidth).url()
    : null;
  const alt = image?.alt ?? fallbackAlt ?? "";
  /* Pass the image's native aspect to CSS so the slot shape
     follows the source until max-height: 100vh clamps it. */
  const ratio = dims ? `${dims.width} / ${dims.height}` : "4 / 3";

  const paragraphs = body
    ? body
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean)
    : [];

  return (
    <section ref={sectionRef} className="editorial-image-block">
      <div className="container editorial-image-block__inner">
        <header className="editorial-image-block__head">
          {label ? (
            <p className="editorial-image-block__label text-small text-caps">
              {label}
            </p>
          ) : null}
          {heading ? (
            <Heading
              as="h2"
              className="editorial-image-block__heading text-h1"
            >
              {heading}
            </Heading>
          ) : null}
        </header>

        <div className="editorial-image-block__media-row">
          {src ? (
            <RevealImage
              className="editorial-image-block__media"
              style={{ "--ratio": ratio } as React.CSSProperties}
            >
              <Image
                src={src}
                alt={alt}
                width={renderWidth}
                height={renderHeight}
                sizes="(max-width: 64rem) 100vw, 66vw"
                className="editorial-image-block__image-el"
              />
            </RevealImage>
          ) : (
            <div
              className="editorial-image-block__media editorial-image-block__media--placeholder"
              aria-hidden="true"
            />
          )}

          {paragraphs.length > 0 || (ctaLabel && ctaHref) ? (
            <div ref={bodyRef} className="editorial-image-block__body-track">
              <RevealStack as="div" className="editorial-image-block__body">
                {paragraphs.map((paragraph, i) => (
                  <p
                    key={i}
                    className="editorial-image-block__paragraph text-large"
                  >
                    {paragraph}
                  </p>
                ))}
                {ctaLabel && ctaHref ? (
                  <div className="editorial-image-block__cta">
                    <Button
                      href={ctaHref}
                      pageName={ctaPageName}
                      size="lg"
                    >
                      {ctaLabel}
                    </Button>
                  </div>
                ) : null}
              </RevealStack>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
