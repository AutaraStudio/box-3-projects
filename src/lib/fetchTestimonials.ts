/**
 * fetchTestimonials
 * =================
 * Server-side resolver for a `testimonialsSection` block. Takes the
 * raw GROQ shape (testimonials with a `partner.logoUrl` string) and
 * returns the same testimonials with each partner's logo URL
 * replaced by inlined sanitised SVG markup — ready for the
 * client-side TestimonialsSection to render via
 * `dangerouslySetInnerHTML`.
 *
 * Mirrors the loadPartners pipeline so the testimonial logos pick
 * up `currentColor` from the active theme.
 */

import { fetchSvgContent } from "@/lib/svgLoader";
import type {
  ResolvedTestimonial,
  ResolvedTestimonialsSection,
  TestimonialsSectionData,
} from "@/sanity/queries/testimonialsSection";

export async function resolveTestimonialsSection(
  section: TestimonialsSectionData | null | undefined,
): Promise<ResolvedTestimonialsSection | null> {
  if (!section || !section.testimonials || section.testimonials.length === 0) {
    return null;
  }

  const testimonials: ResolvedTestimonial[] = await Promise.all(
    section.testimonials.map(async (t) => {
      const svgContent = t.partner?.logoUrl
        ? await fetchSvgContent(t.partner.logoUrl)
        : "";
      return {
        _id: t._id,
        quote: t.quote,
        author: t.author,
        title: t.title,
        partner: t.partner
          ? { name: t.partner.name, svgContent }
          : undefined,
      };
    }),
  );

  return {
    sectionLabel: section.sectionLabel,
    reference: section.reference,
    testimonials,
  };
}
