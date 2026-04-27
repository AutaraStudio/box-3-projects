/**
 * SustainabilityCertifications
 * ============================
 * Registry-style band — small caps section label across the top,
 * then a full-width list of standards / frameworks. Each row is
 * a tabular index + framework name in display copy, separated by
 * hairlines, with a directional hover-tile sweep that follows the
 * cursor's entry/exit edge.
 *
 * Items are rendered as static rows by default; if the editor
 * supplies an `href` for a framework (e.g. the standard's website),
 * the row becomes an external link. The directional hover applies
 * either way.
 */

import {
  DirectionalHoverList,
  DirectionalHoverItem,
} from "@/components/ui/DirectionalHoverList";

import "./SustainabilityCertifications.css";

interface SustainabilityCertificationsItem {
  label: string;
  href?: string;
}

interface SustainabilityCertificationsProps {
  label?: string;
  /** Backwards-compatible — accepts the legacy `string[]` shape OR
   *  the richer `{ label, href? }[]` shape. Strings are coerced to
   *  link-less rows so existing Sanity content keeps working. */
  items: Array<string | SustainabilityCertificationsItem>;
}

export default function SustainabilityCertifications({
  label = "Frameworks we follow",
  items,
}: SustainabilityCertificationsProps) {
  if (items.length === 0) return null;

  const normalised = items.map((item) =>
    typeof item === "string" ? { label: item } : item,
  );

  return (
    <section className="sustainability-certifications">
      <div className="container sustainability-certifications__inner">
        <p className="sustainability-certifications__label text-small text-caps">
          {label}
        </p>
        <DirectionalHoverList
          axis="y"
          className="sustainability-certifications__list"
        >
          {normalised.map((item, index) => {
            const indexLabel = String(index + 1).padStart(2, "0");
            const content = (
              <>
                <span className="sustainability-certifications__index text-small text-caps">
                  {indexLabel}
                </span>
                <span className="sustainability-certifications__value text-h3">
                  {item.label}
                </span>
              </>
            );
            return item.href ? (
              <DirectionalHoverItem
                key={item.label}
                href={item.href}
                external
                target="_blank"
                className="sustainability-certifications__row"
              >
                {content}
              </DirectionalHoverItem>
            ) : (
              <DirectionalHoverItem
                key={item.label}
                className="sustainability-certifications__row"
              >
                {content}
              </DirectionalHoverItem>
            );
          })}
        </DirectionalHoverList>
      </div>
    </section>
  );
}
