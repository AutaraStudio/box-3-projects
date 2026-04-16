/**
 * Shared server-side resolver for a testimonialsSection.
 *
 * Takes the raw GROQ shape returned by the TESTIMONIALS_SECTION_PROJECTION
 * and converts each testimonial's partner logo URL into inlined,
 * sanitised SVG markup — mirrors the same pipeline used by
 * fetchPartners. The resolved section can then be passed as a prop
 * straight to the client-side TestimonialsSection component.
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
