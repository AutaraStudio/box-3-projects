/**
 * ServicesList
 * ============
 * Editorial registry of service categories — full-width rows,
 * each with a tabular index, the service title, and a one-line
 * description. Built on the shared <DirectionalHoverList>
 * primitive so the hover-tile + hairlines match the rest of the
 * site's lists (sustainability certifications, project expertise).
 *
 *   ┌─ What we do ─────────────────────────────────────────────┐
 *   │  01   Office fit-out (Cat B)        — design + build...  │
 *   │  02   Office refurb (Cat A)         — fast turnaround... │
 *   │  03   Design & Build                — end-to-end...      │
 *   │  ...                                                     │
 *   └──────────────────────────────────────────────────────────┘
 *
 * Items are rendered as static rows by default. If the editor
 * supplies an `href` on a service (e.g. linking to a detail page
 * or an anchor on /projects), the row becomes a link.
 */

import Button from "@/components/ui/Button";
import Heading from "@/components/ui/Heading";
import {
  DirectionalHoverList,
  DirectionalHoverItem,
} from "@/components/ui/DirectionalHoverList";

import "./ServicesList.css";

export interface ServiceItem {
  title: string;
  description: string;
  href?: string;
}

interface ServicesListProps {
  label?: string;
  /** Optional display heading above the registry. Renders via
   *  <Heading> so it gets the SplitText word-stagger reveal.
   *  Existing call-sites without a heading stay unaffected. */
  heading?: string;
  items: ServiceItem[];
  /** Optional CTA below the list. Both must be set for it to
   *  render — keeps existing call-sites unaffected. */
  ctaLabel?: string;
  ctaHref?: string;
  ctaPageName?: string;
}

export default function ServicesList({
  label = "What we do",
  heading,
  items,
  ctaLabel,
  ctaHref,
  ctaPageName,
}: ServicesListProps) {
  if (items.length === 0) return null;

  return (
    <section className="services-list" data-theme="cream">
      <div className="container services-list__inner">
        <header className="services-list__head">
          <p className="services-list__label text-small text-caps">
            {label}
          </p>
          {heading ? (
            <Heading as="h2" className="services-list__heading text-h2">
              {heading}
            </Heading>
          ) : null}
        </header>
        <DirectionalHoverList
          axis="y"
          className="services-list__list"
        >
          {items.map((item, index) => {
            const indexLabel = String(index + 1).padStart(2, "0");
            const content = (
              <>
                <span className="services-list__index text-small text-caps">
                  {indexLabel}
                </span>
                <span className="services-list__title text-h3">
                  {item.title}
                </span>
                <span className="services-list__description text-main">
                  {item.description}
                </span>
              </>
            );
            return item.href ? (
              <DirectionalHoverItem
                key={item.title}
                href={item.href}
                className="services-list__row"
              >
                {content}
              </DirectionalHoverItem>
            ) : (
              <DirectionalHoverItem
                key={item.title}
                className="services-list__row"
              >
                {content}
              </DirectionalHoverItem>
            );
          })}
        </DirectionalHoverList>

        {ctaLabel && ctaHref ? (
          <div className="services-list__cta">
            <Button href={ctaHref} pageName={ctaPageName} size="lg">
              {ctaLabel}
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
