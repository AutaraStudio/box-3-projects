import HomeHero from "@/components/sections/HomeHero";
import PartnersSection from "@/components/sections/PartnersSection";
import { sanityFetch } from "@/sanity/lib/fetch";
import { HOME_PAGE_QUERY, type HomePageData } from "@/sanity/queries/homePage";
import {
  PARTNERS_QUERY,
  type PartnersData,
  type ResolvedPartner,
} from "@/sanity/queries/partnersSection";

/** Fallback partners data when Sanity hasn't been populated yet. */
const DEFAULT_PARTNERS: PartnersData = {
  sectionLabel: "Our Partners",
  partners: [],
};

/* --------------------------------------------------------------------------
   SVG fetch + sanitise (server-side)
   --------------------------------------------------------------------------
   The PartnersSection marquee is a client component and cannot be async,
   so we resolve every partner SVG here on the server and pass the raw
   sanitised markup down as a prop. Inlining the SVG in the DOM is what
   allows currentColor to inherit from the parent element's color. */

/**
 * Fetches raw SVG markup from a Sanity CDN URL server-side.
 * Inlining SVG is required for currentColor to work —
 * an img tag cannot inherit CSS color from its parent.
 * Results revalidated hourly via Next.js fetch caching.
 */
async function fetchSvgContent(url: string): Promise<string> {
  if (!url) return "";
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return "";
    const text = await res.text();
    if (!text.includes("<svg")) return "";
    return sanitiseSvg(text);
  } catch {
    return "";
  }
}

/**
 * Replaces hardcoded fill/stroke colour values with currentColor
 * so CSS can control logo colour via the parent color property.
 * Preserves fill="none" and stroke="none" intentional values.
 */
function sanitiseSvg(svg: string): string {
  return svg
    .replace(/fill="(?!none|currentColor)[^"]*"/gi, 'fill="currentColor"')
    .replace(/stroke="(?!none|currentColor)[^"]*"/gi, 'stroke="currentColor"')
    .replace(/fill\s*:\s*(?!none|currentColor)[^;"]*/gi, "fill:currentColor")
    .replace(
      /stroke\s*:\s*(?!none|currentColor)[^;"]*/gi,
      "stroke:currentColor",
    )
    .replace(/stop-color\s*:\s*[^;"]*/gi, "stop-color:currentColor")
    .replace(
      /stop-color="(?!currentColor)[^"]*"/gi,
      'stop-color="currentColor"',
    );
}

export default async function Home() {
  const [homeData, partnersData] = await Promise.all([
    sanityFetch<HomePageData | null>({ query: HOME_PAGE_QUERY }),
    sanityFetch<PartnersData | null>({ query: PARTNERS_QUERY }),
  ]);

  const rawPartners = partnersData?.partners ?? DEFAULT_PARTNERS.partners;

  const resolvedPartners: ResolvedPartner[] = await Promise.all(
    rawPartners.map(async (partner) => ({
      _key: partner._key,
      name: partner.name,
      svgContent: await fetchSvgContent(partner.logo?.asset?.url ?? ""),
    })),
  );

  return (
    <main>
      <HomeHero
        heading={homeData?.heading ?? "Fit-Outs Done Differently"}
        tagline={
          homeData?.tagline ?? "London's trusted commercial fit-out partner."
        }
        image={homeData?.heroImage ?? null}
        imageAlt={homeData?.heroImage?.alt ?? "Hero background"}
      />
      <section
        data-nav-theme="light"
        style={{ height: "200vh", background: "var(--color-cream-300)" }}
        aria-hidden="true"
      />
      <PartnersSection
        sectionLabel={partnersData?.sectionLabel ?? DEFAULT_PARTNERS.sectionLabel}
        partners={resolvedPartners}
      />
    </main>
  );
}
