/**
 * Shared server-side loader for the PartnersSection marquee.
 *
 * PartnersSection is a client component and cannot be async, so we
 * resolve every partner SVG on the server and pass the sanitised
 * markup down as a prop. Inlining the SVG in the DOM is what allows
 * currentColor to inherit from the parent element's color.
 */

import { fetchSvgContent } from "@/lib/svgLoader";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  PARTNERS_QUERY,
  type PartnersData,
  type ResolvedPartner,
} from "@/sanity/queries/partnersSection";

const DEFAULT_PARTNERS: PartnersData = {
  heading: "Trusted By",
  sectionLabel: "Our Partners",
  partners: [],
};

export interface LoadedPartners {
  heading: string;
  sectionLabel?: string;
  partners: ResolvedPartner[];
}

/** Fetches the Partners singleton and resolves every logo SVG. */
export async function loadPartners(): Promise<LoadedPartners> {
  const partnersData = await sanityFetch<PartnersData | null>({
    query: PARTNERS_QUERY,
  });

  const rawPartners = partnersData?.partners ?? DEFAULT_PARTNERS.partners;
  const resolvedPartners: ResolvedPartner[] = await Promise.all(
    rawPartners.map(async (partner) => ({
      _key: partner._id,
      name: partner.name,
      svgContent: await fetchSvgContent(partner.logoUrl ?? ""),
    })),
  );

  return {
    heading: partnersData?.heading ?? DEFAULT_PARTNERS.heading,
    sectionLabel: partnersData?.sectionLabel ?? DEFAULT_PARTNERS.sectionLabel,
    partners: resolvedPartners,
  };
}
