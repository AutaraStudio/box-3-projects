import BannerShowroom from "@/components/sections/BannerShowroom";
import FeaturedProjects from "@/components/sections/FeaturedProjects";
import HomeHero from "@/components/sections/HomeHero";
import PartnersSection from "@/components/sections/PartnersSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import { loadPartners } from "@/lib/fetchPartners";
import { resolveTestimonialsSection } from "@/lib/fetchTestimonials";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  BANNER_SHOWROOM_QUERY,
  type BannerShowroomData,
} from "@/sanity/queries/bannerShowroom";
import {
  FEATURED_PROJECTS_QUERY,
  type FeaturedProjectsData,
} from "@/sanity/queries/featuredProjectsSection";
import { HOME_PAGE_QUERY, type HomePageData } from "@/sanity/queries/homePage";

export default async function Home() {
  const [homeData, featured, showroom, partners] = await Promise.all([
    sanityFetch<HomePageData | null>({ query: HOME_PAGE_QUERY }),
    sanityFetch<FeaturedProjectsData | null>({
      query: FEATURED_PROJECTS_QUERY,
    }),
    sanityFetch<BannerShowroomData | null>({ query: BANNER_SHOWROOM_QUERY }),
    loadPartners(),
  ]);

  /* Testimonials section is optional on the home page — resolve the
     embedded section to inlined SVG logos (or null if missing). */
  const testimonials = await resolveTestimonialsSection(
    homeData?.testimonialsSection,
  );

  // Temporary holding page — restore the full composition (HomeHero,
  // BannerShowroom, FeaturedProjects, Testimonials, Partners) when ready.
  void homeData;
  void featured;
  void showroom;
  void partners;
  void testimonials;

  return (
    <main>
      <section
        data-theme="dark"
        data-nav-theme="dark"
        style={{
          minHeight: "100svh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--theme-bg)",
          color: "var(--theme-text)",
          paddingInline: "var(--space-6)",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "44rem" }}>
          <h1 className="font-secondary font-size-h1 font-weight-regular line-height-tight">
            Site updating
          </h1>
          <p
            className="font-primary font-size-body-l font-weight-regular line-height-body"
            style={{ marginTop: "var(--space-4)" }}
          >
            We&rsquo;re refreshing things behind the scenes. Please check back
            shortly.
          </p>
        </div>
      </section>
    </main>
  );
}
