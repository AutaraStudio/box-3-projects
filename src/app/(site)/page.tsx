import HomeHero from "@/components/sections/HomeHero";
import PartnersSection from "@/components/sections/PartnersSection";
import { sanityFetch } from "@/sanity/lib/fetch";
import { HOME_PAGE_QUERY, type HomePageData } from "@/sanity/queries/homePage";
import {
  PARTNERS_QUERY,
  type PartnersData,
} from "@/sanity/queries/partnersSection";

/** Fallback partners data when Sanity hasn't been populated yet. */
const DEFAULT_PARTNERS: PartnersData = {
  sectionLabel: "Our Partners",
  partners: [],
};

export default async function Home() {
  const [homeData, partnersData] = await Promise.all([
    sanityFetch<HomePageData | null>({ query: HOME_PAGE_QUERY }),
    sanityFetch<PartnersData | null>({ query: PARTNERS_QUERY }),
  ]);

  const partners = partnersData ?? DEFAULT_PARTNERS;

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
        sectionLabel={partners.sectionLabel}
        partners={partners.partners}
      />
    </main>
  );
}
