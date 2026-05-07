/**
 * ImageStripHero
 * ==============
 * Editorial hero used on /about, /services, /sustainability and
 * /careers. Centred title + CTA above a single portrait image
 * that plays the standard mask-reveal on scroll-in.
 *
 *   ┌───────────────────────────────────────────────────────┐
 *   │                                                       │
 *   │            HERO TITLE  (centred, large)               │
 *   │            [ CTA button ]                             │
 *   │                                                       │
 *   ├───────────────────────────────────────────────────────┤
 *   │              ┌────────────────┐                       │
 *   │              │                │                       │
 *   │              │   portrait     │  <- RevealImage       │
 *   │              │                │                       │
 *   │              └────────────────┘                       │
 *   └───────────────────────────────────────────────────────┘
 *
 * Image priority falls back gracefully so existing Sanity docs
 * keep rendering: imageCentre → imageLeft → imageRight. The
 * left / right fields are still accepted on the props so older
 * pages don't have to be updated immediately.
 */

import Image from "next/image";

import Heading from "@/components/ui/Heading";
import Button from "@/components/ui/Button";
import RevealImage from "@/components/ui/RevealImage";
import { urlFor } from "@/sanity/lib/image";

import "./ImageStripHero.css";

export interface ImageStripHeroImage {
  asset?: {
    _id: string;
    url: string;
    metadata?: {
      dimensions: {
        width: number;
        height: number;
        aspectRatio: number;
      };
    };
  };
  alt?: string;
}

interface ImageStripHeroProps {
  title: string;
  ctaLabel?: string;
  ctaHref?: string;
  /** Primary hero image. Renders portrait (3:4). */
  imageCentre?: ImageStripHeroImage;
  /** Legacy slots — retained for backwards compatibility with
   *  existing Sanity docs. Used as fallbacks if `imageCentre` is
   *  empty so a half-authored page still has something to show. */
  imageLeft?: ImageStripHeroImage;
  imageRight?: ImageStripHeroImage;
}

export default function ImageStripHero({
  title,
  ctaLabel,
  ctaHref = "#",
  imageCentre,
  imageLeft,
  imageRight,
}: ImageStripHeroProps) {
  const heroImage = imageCentre ?? imageLeft ?? imageRight;
  const src = heroImage?.asset
    ? urlFor(heroImage as { asset: { _id: string } })
        .width(1600)
        .url()
    : null;

  return (
    <section className="image-strip-hero">
      <div className="image-strip-hero__inner">
        <div className="image-strip-hero__content">
          <Heading
            as="h1"
            className="image-strip-hero__title text-display"
            asWords={false}
          >
            {title}
          </Heading>
          {ctaLabel ? (
            <Button href={ctaHref} size="md">
              {ctaLabel}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="image-strip-hero__media">
        <RevealImage className="image-strip-hero__reveal">
          {src ? (
            <Image
              src={src}
              alt={heroImage?.alt ?? ""}
              fill
              priority
              sizes="(max-width: 64rem) 100vw, 50vw"
              className="image-strip-hero__image-el"
            />
          ) : (
            <div
              className="image-strip-hero__image-placeholder"
              aria-hidden="true"
            />
          )}
        </RevealImage>
      </div>
    </section>
  );
}
