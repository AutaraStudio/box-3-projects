import ContactHero from "@/components/sections/ContactHero";
import ContactSection from "@/components/sections/ContactSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import PartnersSection from "@/components/sections/PartnersSection";
import { loadPartners } from "@/lib/fetchPartners";
import { resolveTestimonialsSection } from "@/lib/fetchTestimonials";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  CONTACT_PAGE_QUERY,
  type ContactPageData,
} from "@/sanity/queries/contactPage";

export const metadata = {
  title: "Contact — Box 3 Projects",
  description: "Get in touch with our team to discuss your next project.",
};

export default async function ContactPage() {
  const [data, partners] = await Promise.all([
    sanityFetch<ContactPageData | null>({ query: CONTACT_PAGE_QUERY }),
    loadPartners(),
  ]);

  const testimonials = await resolveTestimonialsSection(
    data?.testimonialsSection,
  );

  return (
    <main>
      <ContactHero heading={data?.heading ?? "Let's Connect"} />
      <ContactSection
        tabs={data?.tabs}
        formFields={data?.formFields}
        submitLabel={data?.submitLabel}
        infoHeading={data?.infoHeading}
        address={data?.address}
        phone={data?.phone}
        email={data?.email}
        infoImage={data?.infoImage ?? null}
        infoImageAlt={data?.infoImage?.alt}
      />
      {testimonials ? (
        <TestimonialsSection
          sectionLabel={testimonials.sectionLabel}
          reference={testimonials.reference}
          testimonials={testimonials.testimonials}
          theme="brand"
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
