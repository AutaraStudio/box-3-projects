import BannerShowroom from "@/components/sections/BannerShowroom";
import FeaturedProjects from "@/components/sections/FeaturedProjects";
import HomeHero from "@/components/sections/HomeHero";
import HomeIntro from "@/components/sections/HomeIntro";
import OurApproach from "@/components/sections/OurApproach";
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
import {
  HOME_INTRO_QUERY,
  type HomeIntroData,
} from "@/sanity/queries/homeIntroSection";
import { HOME_PAGE_QUERY, type HomePageData } from "@/sanity/queries/homePage";
import {
  OUR_APPROACH_QUERY,
  type OurApproachData,
} from "@/sanity/queries/ourApproachSection";

export default async function Home() {
  const [homeData, intro, approach, featured, showroom, partners] = await Promise.all([
    sanityFetch<HomePageData | null>({ query: HOME_PAGE_QUERY }),
    sanityFetch<HomeIntroData | null>({ query: HOME_INTRO_QUERY }),
    sanityFetch<OurApproachData | null>({ query: OUR_APPROACH_QUERY }),
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
      {intro ? (
        <HomeIntro body={intro.body} points={intro.points ?? []} />
      ) : null}
      {showroom ? (
        <BannerShowroom
          sectionLabel={showroom.sectionLabel}
          heading={showroom.heading}
          cursorLabel={showroom.cursorLabel}
          backgroundVideoUrl={showroom.backgroundVideoUrl}
          modalVideoUrl={showroom.modalVideoUrl}
        />
      ) : null}
      {featured && featured.projects && featured.projects.length > 0 ? (
        <FeaturedProjects
          sectionLabel={featured.sectionLabel}
          ctaLabel={featured.ctaLabel}
          ctaHref={featured.ctaHref}
          projects={featured.projects}
        />
      ) : null}
      {approach ? (
        <OurApproach
          sectionLabel={approach.sectionLabel}
          intro={approach.intro}
          steps={approach.steps}
          completion={approach.completion}
        />
      ) : null}
      {testimonials ? (
        <TestimonialsSection
          sectionLabel={testimonials.sectionLabel}
          reference={testimonials.reference}
          testimonials={testimonials.testimonials}
        />
      ) : null}
      <PartnersSection
        heading={partners.heading}
        sectionLabel={partners.sectionLabel}
        partners={partners.partners}
      />
    </main>
  );
}
