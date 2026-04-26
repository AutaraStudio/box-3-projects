import LineScroll from "@/components/sections/LineScroll";
import PartnersSection from "@/components/sections/PartnersSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import { loadPartners } from "@/lib/fetchPartners";
import { resolveTestimonialsSection } from "@/lib/fetchTestimonials";
import { sanityFetch } from "@/sanity/lib/fetch";
import { HOME_PAGE_QUERY, type HomePageData } from "@/sanity/queries/homePage";
import {
  LINE_SCROLL_QUERY,
  type LineScrollData,
} from "@/sanity/queries/lineScrollSection";

export default async function Home() {
  const [homeData, lineScroll, partners] = await Promise.all([
    sanityFetch<HomePageData | null>({ query: HOME_PAGE_QUERY }),
    sanityFetch<LineScrollData | null>({ query: LINE_SCROLL_QUERY }),
    loadPartners(),
  ]);

  const testimonials = await resolveTestimonialsSection(
    homeData?.testimonialsSection,
  );

  return (
    <main>
      <section aria-hidden="true" style={{ height: "100vh" }} />
      {lineScroll ? (
        <LineScroll
          label={lineScroll.label}
          lines={lineScroll.lines}
          bottomHeading={lineScroll.bottomHeading}
          bottomBody={lineScroll.bottomBody}
        />
      ) : null}
      {testimonials ? (
        <TestimonialsSection
          sectionLabel={testimonials.sectionLabel}
          reference={testimonials.reference}
          testimonials={testimonials.testimonials}
          theme="cream"
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
