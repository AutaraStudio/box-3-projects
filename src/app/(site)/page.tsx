/**
 * Home page
 * =========
 * Server component. Pulls the `homePage` Sanity singleton + the
 * featured projects list, then renders each section in order.
 *
 * Every editable surface flows from Sanity. The `FALLBACK` block
 * below holds the launch copy used whenever a field is empty —
 * the editor can therefore re-author one section at a time without
 * the rest of the page going blank.
 */

import HomeHero from "@/components/home/HomeHero";
import HomeStatement from "@/components/home/HomeStatement";
import HomeFeaturedProjects from "@/components/home/HomeFeaturedProjects";
import HomeCTA from "@/components/home/HomeCTA";
import EditorialImageBlock from "@/components/ui/EditorialImageBlock";
import ServicesList from "@/components/services/ServicesList";
import SustainabilityStats from "@/components/sustainability/SustainabilityStats";
import TestimonialsSection from "@/components/testimonials/TestimonialsSection";
import { resolveTestimonialsSection } from "@/lib/fetchTestimonials";
import { sanityFetch } from "@/sanity/lib/fetch";
import { urlFor } from "@/sanity/lib/image";
import {
  HOME_FEATURED_PROJECTS_QUERY,
  type ProjectListItem,
} from "@/sanity/queries/projects";
import {
  HOME_PAGE_QUERY,
  type HomeImage,
  type HomeLink,
  type HomePageData,
} from "@/sanity/queries/homePage";

/* Revalidate hourly so featured-flag toggles + new projects
   surface without a redeploy. */
export const revalidate = 3600;

/* ─────────────────────────────────────────────────────────────────
   Fallback content
   ─────────────────────────────────────────────────────────────────
   Used whenever a Sanity field is empty so the page never renders
   a blank section. Editors can populate the homePage doc one field
   at a time without breaking what's already on screen. */
const FALLBACK = {
  hero: {
    videoUrl: "https://box-3.b-cdn.net/47d7d53c-de685d0e.mp4",
    statement: "Specialist commercial fit-outs in London.",
    scrollLabel: "Scroll down",
    ctaLabel: "View projects →",
    ctaHref: "/projects",
    ctaPageName: "Projects",
  },
  statement: {
    label: "About",
    heading:
      "At Box 3, we craft inspiring workspaces that empower businesses to thrive — commercial fit-outs where quality, innovation, and communication shape every engagement, delivered with the detail and dedication of a much larger firm.",
    body: "Specialising in commercial projects up to £10m across London, with a track record built on repeat business and lasting client relationships.",
    ctaLabel: "More about Box 3 →",
    ctaHref: "/about",
    ctaPageName: "About",
  },
  introducing: {
    label: "Introducing",
    heading: "Building sustainable relationships.",
    body:
      "We're BOX3 Projects, a client-focused fit-out company tailored specifically to commercial projects up to £10m. We transform your workspace into a dynamic, functional environment that reflects your brand and maximises productivity.\n\n" +
      "What sets us apart is an unwavering commitment to our clients. We believe in fostering strong, sustainable relationships and working closely with you at every stage of the project — and your project is our priority, from start to finish.",
    fallbackAlt: "Box 3 office interior",
    ctaLabel: "How we work →",
    ctaHref: "/services",
    ctaPageName: "Services",
  },
  services: {
    label: "What we do",
    heading: "Design and build, end to end.",
    items: [
      {
        title: "Design & Build",
        description:
          "Single-team delivery from first sketch to handover. One contract, one accountability.",
      },
      {
        title: "Cat A fit-out",
        description:
          "Foundational interior to industrial standards. Tier 1 partners turn around landlord spaces fast.",
      },
      {
        title: "Cat B fit-out",
        description:
          "Full design integration — planting, flooring, furniture — that turns a white box into a working environment.",
      },
      {
        title: "Hybrid",
        description:
          "Reshaping traditional layouts into modern, flexible spaces. Conference rooms, hot desking, immersion rooms.",
      },
      {
        title: "Dilapidations",
        description:
          "End-of-lease restoration delivered swiftly and cost-effectively, without compromising on quality.",
      },
      {
        title: "Refurb in occupation",
        description:
          "Live-environment works that don't disrupt the business operating around them.",
      },
    ],
    ctaLabel: "Explore services →",
    ctaHref: "/services",
    ctaPageName: "Services",
  },
  featured: {
    label: "Featured",
    heading: "Recent work.",
  },
  stats: {
    label: "By the numbers",
    heading: "Track record built on repeat work.",
    items: [
      {
        value: "90%",
        label: "of new work comes from clients we've delivered for before",
        footnote: "repeat business, calendar year 2025",
      },
      {
        value: "100%",
        label: "of projects delivered on time and on budget",
        footnote: "across every brief to date",
      },
      {
        value: "180+",
        label: "years of combined fit-out expertise across the team",
        footnote: "leadership + project leads",
      },
      {
        value: "£10m",
        label: "project ceiling, with PI / EL / PL insurance to match",
        footnote: "London + South East",
      },
    ],
  },
  why: {
    label: "Why Box 3",
    heading: "After 18 years in corporate, we built something different.",
    body:
      "We left after 18 years inside a large corporate environment to establish Box 3, driven by our passion for the smaller projects that often go overlooked. We recognised those projects deserved the same level of detail and dedication typically reserved for larger ones.\n\n" +
      "We may be a smaller company, but we deliver the expertise and professionalism you'd expect from a much larger firm — built on integrity, innovation, and lasting relationships.",
    fallbackAlt: "Box 3 founders Bobby English and Scott Howard",
    ctaLabel: "Meet the team →",
    ctaHref: "/about",
    ctaPageName: "About",
  },
  finalCta: {
    heading: "Have a question?\nWant to work with us?",
    ctaLabel: "Contact →",
    ctaHref: "/contact",
    ctaPageName: "Contact",
  },
} as const;

/* ─────────────────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────────────────── */

/** Pick the first non-empty string from a list of candidates. */
function firstFilled(...values: Array<string | undefined>): string {
  for (const v of values) {
    if (typeof v === "string" && v.trim().length > 0) return v;
  }
  return "";
}

/** Normalise a Sanity link object to a `{ label, href, pageName }`
 *  triple, falling back to the supplied defaults when the doc field
 *  is missing or partially populated. */
function resolveLink(
  cms: HomeLink | undefined,
  fallback: { label: string; href: string; pageName: string },
) {
  return {
    label: firstFilled(cms?.label, fallback.label),
    href: firstFilled(cms?.href, fallback.href),
    pageName: firstFilled(cms?.pageName, cms?.label, fallback.pageName),
  };
}

/* ─────────────────────────────────────────────────────────────────
   Component
   ───────────────────────────────────────────────────────────────── */

export default async function Home() {
  const [featured, home] = await Promise.all([
    sanityFetch<ProjectListItem[] | null>({
      query: HOME_FEATURED_PROJECTS_QUERY,
      revalidate: 3600,
    }),
    sanityFetch<HomePageData | null>({
      query: HOME_PAGE_QUERY,
      revalidate: 3600,
    }),
  ]);

  /* Resolve testimonial partner logos to inlined SVG markup so they
     pick up `currentColor` from the active theme. */
  const testimonials = await resolveTestimonialsSection(
    home?.testimonialsSection,
  );

  const projects = featured ?? [];

  /* Image fallbacks — the editorial blocks need an image; if the
     Sanity field is empty we use a featured project's photo so the
     page never renders an empty frame. */
  const introImage: HomeImage | { asset?: undefined; alt?: string } | undefined =
    home?.introducingImage?.asset?.url
      ? home.introducingImage
      : projects[0]?.featuredImage;
  const whyImage: HomeImage | { asset?: undefined; alt?: string } | undefined =
    home?.whyImage?.asset?.url
      ? home.whyImage
      : projects[projects.length - 1]?.featuredImage;

  /* Resolved links for each section. Each FALLBACK.section keeps
     ctaLabel / ctaHref / ctaPageName as separate keys, so we
     project them into the `{ label, href, pageName }` shape that
     resolveLink expects. */
  const heroCta = resolveLink(home?.heroCta, {
    label: FALLBACK.hero.ctaLabel,
    href: FALLBACK.hero.ctaHref,
    pageName: FALLBACK.hero.ctaPageName,
  });
  const statementCta = resolveLink(home?.statementCta, {
    label: FALLBACK.statement.ctaLabel,
    href: FALLBACK.statement.ctaHref,
    pageName: FALLBACK.statement.ctaPageName,
  });
  const introCta = resolveLink(home?.introducingCta, {
    label: FALLBACK.introducing.ctaLabel,
    href: FALLBACK.introducing.ctaHref,
    pageName: FALLBACK.introducing.ctaPageName,
  });
  const servicesCta = resolveLink(home?.servicesCta, {
    label: FALLBACK.services.ctaLabel,
    href: FALLBACK.services.ctaHref,
    pageName: FALLBACK.services.ctaPageName,
  });
  const whyCta = resolveLink(home?.whyCta, {
    label: FALLBACK.why.ctaLabel,
    href: FALLBACK.why.ctaHref,
    pageName: FALLBACK.why.ctaPageName,
  });
  const finalCta = resolveLink(home?.finalCtaButton, {
    label: FALLBACK.finalCta.ctaLabel,
    href: FALLBACK.finalCta.ctaHref,
    pageName: FALLBACK.finalCta.ctaPageName,
  });

  /* Service items — fall back to the launch list if Sanity is empty
     OR if entries are missing required fields. */
  const cmsServices =
    home?.servicesItems
      ?.filter((s) => s?.title)
      .map((s) => ({
        title: s.title ?? "",
        description: s.description ?? "",
      })) ?? [];
  const services =
    cmsServices.length > 0 ? cmsServices : [...FALLBACK.services.items];

  /* Stats — same pattern. Cap at 4 in the layout. */
  const cmsStats =
    home?.statsItems
      ?.filter((s) => s?.value)
      .map((s) => ({
        value: s.value ?? "",
        label: s.label ?? "",
        footnote: s.footnote,
      })) ?? [];
  const stats = cmsStats.length > 0 ? cmsStats : [...FALLBACK.stats.items];

  return (
    <main>
      <HomeHero
        mediaType={home?.heroMediaType ?? "video"}
        videoSrc={firstFilled(home?.heroVideoUrl, FALLBACK.hero.videoUrl)}
        imageSrc={
          home?.heroImage?.asset?.url
            ? urlFor(home.heroImage).width(2400).quality(85).url()
            : undefined
        }
        imageAlt={home?.heroImage?.alt ?? ""}
        statement={firstFilled(home?.heroStatement, FALLBACK.hero.statement)}
        scrollLabel={firstFilled(
          home?.heroScrollLabel,
          FALLBACK.hero.scrollLabel,
        )}
        ctaLabel={heroCta.label}
        ctaHref={heroCta.href}
        ctaPageName={heroCta.pageName}
      />

      <HomeStatement
        label={firstFilled(home?.statementLabel, FALLBACK.statement.label)}
        heading={firstFilled(home?.statementHeading, FALLBACK.statement.heading)}
        body={firstFilled(home?.statementBody, FALLBACK.statement.body)}
        ctaLabel={statementCta.label}
        ctaHref={statementCta.href}
        ctaPageName={statementCta.pageName}
      />

      <EditorialImageBlock
        label={firstFilled(home?.introducingLabel, FALLBACK.introducing.label)}
        heading={firstFilled(
          home?.introducingHeading,
          FALLBACK.introducing.heading,
        )}
        body={firstFilled(home?.introducingBody, FALLBACK.introducing.body)}
        image={introImage as never}
        fallbackAlt={firstFilled(
          home?.introducingImage?.alt,
          FALLBACK.introducing.fallbackAlt,
        )}
        ctaLabel={introCta.label}
        ctaHref={introCta.href}
        ctaPageName={introCta.pageName}
      />

      <ServicesList
        label={firstFilled(home?.servicesLabel, FALLBACK.services.label)}
        heading={firstFilled(home?.servicesHeading, FALLBACK.services.heading)}
        items={services}
        ctaLabel={servicesCta.label}
        ctaHref={servicesCta.href}
        ctaPageName={servicesCta.pageName}
      />

      <HomeFeaturedProjects
        label={firstFilled(home?.featuredLabel, FALLBACK.featured.label)}
        heading={firstFilled(home?.featuredHeading, FALLBACK.featured.heading)}
        projects={projects}
      />

      {testimonials ? (
        <TestimonialsSection
          sectionLabel={testimonials.sectionLabel}
          reference={testimonials.reference}
          testimonials={testimonials.testimonials}
          theme="pink"
        />
      ) : null}

      <SustainabilityStats
        label={firstFilled(home?.statsLabel, FALLBACK.stats.label)}
        heading={firstFilled(home?.statsHeading, FALLBACK.stats.heading)}
        items={stats}
      />

      <EditorialImageBlock
        label={firstFilled(home?.whyLabel, FALLBACK.why.label)}
        heading={firstFilled(home?.whyHeading, FALLBACK.why.heading)}
        body={firstFilled(home?.whyBody, FALLBACK.why.body)}
        image={whyImage as never}
        fallbackAlt={firstFilled(home?.whyImage?.alt, FALLBACK.why.fallbackAlt)}
        ctaLabel={whyCta.label}
        ctaHref={whyCta.href}
        ctaPageName={whyCta.pageName}
      />

      <HomeCTA
        heading={firstFilled(home?.finalCtaHeading, FALLBACK.finalCta.heading)}
        ctaLabel={finalCta.label}
        ctaHref={finalCta.href}
        ctaPageName={finalCta.pageName}
      />
    </main>
  );
}
