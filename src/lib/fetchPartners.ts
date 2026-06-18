/**
 * Server-side partners loader
 * ===========================
 * `<PartnersSection>` is a client component and can't be async, so
 * we resolve every partner SVG on the server and pass the sanitised
 * markup down as a prop. Inlining the SVG in the DOM is what allows
 * `currentColor` to inherit from the parent element's `color`.
 *
 * The Partners collection is the single source of truth — every
 * partner doc is rendered in its drag order. The heading shown
 * above the marquee comes from Site Settings → Partners marquee
 * (one field, not a whole singleton).
 */

import { fetchSvgContent, parseSvgAspectRatio } from "@/lib/svgLoader";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  PARTNERS_QUERY,
  type PartnerItem,
  type ResolvedPartner,
} from "@/sanity/queries/partners";
import {
  SITE_SETTINGS_QUERY,
  type SiteSettingsData,
} from "@/sanity/queries/siteSettings";

const DEFAULT_HEADING = "Trusted By";

/** Aspect ratio used when a logo's SVG has no readable viewBox — a
 *  typical wordmark shape, so it still sizes sensibly. */
const DEFAULT_LOGO_RATIO = 3;

export interface LoadedPartners {
  heading: string;
  partners: ResolvedPartner[];
}

/** Fetches every partner doc in drag order + resolves each logo SVG. */
export async function loadPartners(): Promise<LoadedPartners> {
  const [partners, settings] = await Promise.all([
    sanityFetch<PartnerItem[] | null>({ query: PARTNERS_QUERY }),
    sanityFetch<SiteSettingsData | null>({ query: SITE_SETTINGS_QUERY }),
  ]);

  const rawPartners = partners ?? [];
  const resolvedPartners: ResolvedPartner[] = await Promise.all(
    rawPartners.map(async (partner) => {
      const svgContent = await fetchSvgContent(partner.logoUrl ?? "");
      return {
        _key: partner._id,
        name: partner.name,
        svgContent,
        aspectRatio: parseSvgAspectRatio(svgContent) ?? DEFAULT_LOGO_RATIO,
      };
    }),
  );

  return {
    heading: settings?.partnersHeading?.trim() || DEFAULT_HEADING,
    partners: resolvedPartners,
  };
}
