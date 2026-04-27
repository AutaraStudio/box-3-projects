import HomeHero from "@/components/home/HomeHero";
import HomeStatement from "@/components/home/HomeStatement";
import HomeFeaturedProjects from "@/components/home/HomeFeaturedProjects";
import HomeCTA from "@/components/home/HomeCTA";
import EditorialImageBlock from "@/components/ui/EditorialImageBlock";
import ServicesList from "@/components/services/ServicesList";
import SustainabilityStats from "@/components/sustainability/SustainabilityStats";
import type { SustainabilityStatItem } from "@/sanity/queries/sustainabilityPage";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  HOME_FEATURED_PROJECTS_QUERY,
  type ProjectListItem,
} from "@/sanity/queries/projects";

/* Revalidate hourly so featured-flag toggles + new projects
   surface without a redeploy. */
export const revalidate = 3600;

/* Service categories — sourced from the Box3 capability statement
   (page 4). Hardcoded for now; promote to a Sanity homePage doc if
   the editor needs to manage these from the studio. */
const SERVICES = [
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
];

/* Track-record stats — pulled from the Box3 capability statement
   (pages 3 + 5). Reuses the SustainabilityStats component since
   the staircase pattern is generic; the BEM prefix is the only
   place "sustainability" surfaces and that's just an internal
   class name. SustainabilityStats caps at 4 items by design. */
const HOME_STATS: SustainabilityStatItem[] = [
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
];

/* The site-wide footer (with partners marquee) renders below via
   `(site)/layout.tsx`. */
export default async function Home() {
  const featured = await sanityFetch<ProjectListItem[] | null>({
    query: HOME_FEATURED_PROJECTS_QUERY,
    revalidate: 3600,
  });

  /* Stand-in images for the editorial image blocks until the
     editor adds dedicated home imagery via Sanity. Pulls from the
     featured projects so the page never renders empty placeholders.
     Swap to a homePage Sanity doc when content is ready. */
  const projects = featured ?? [];
  const introImage = projects[0]?.featuredImage;
  const whyImage = projects[projects.length - 1]?.featuredImage;

  return (
    <main>
      <HomeHero />

      <HomeStatement
        label="About"
        heading="At Box 3, we craft inspiring workspaces that empower businesses to thrive — commercial fit-outs where quality, innovation, and communication shape every engagement, delivered with the detail and dedication of a much larger firm."
        body="Specialising in commercial projects up to £10m across London, with a track record built on repeat business and lasting client relationships."
        ctaLabel="More about Box 3 →"
        ctaHref="/about"
        ctaPageName="About"
      />

      <EditorialImageBlock
        label="Introducing"
        heading="Building sustainable relationships."
        body={
          "We're BOX3 Projects, a client-focused fit-out company tailored specifically to commercial projects up to £10m. We transform your workspace into a dynamic, functional environment that reflects your brand and maximises productivity.\n\n" +
          "What sets us apart is an unwavering commitment to our clients. We believe in fostering strong, sustainable relationships and working closely with you at every stage of the project — and your project is our priority, from start to finish."
        }
        image={introImage}
        fallbackAlt="Box 3 office interior"
        ctaLabel="How we work →"
        ctaHref="/services"
        ctaPageName="Services"
      />

      <ServicesList
        label="What we do"
        items={SERVICES}
        ctaLabel="Explore services →"
        ctaHref="/services"
        ctaPageName="Services"
      />

      <HomeFeaturedProjects projects={projects} />

      <SustainabilityStats
        label="By the numbers"
        heading="Track record built on repeat work."
        items={HOME_STATS}
      />

      <EditorialImageBlock
        label="Why Box 3"
        heading="After 18 years in corporate, we built something different."
        body={
          "We left after 18 years inside a large corporate environment to establish Box 3, driven by our passion for the smaller projects that often go overlooked. We recognised those projects deserved the same level of detail and dedication typically reserved for larger ones.\n\n" +
          "We may be a smaller company, but we deliver the expertise and professionalism you'd expect from a much larger firm — built on integrity, innovation, and lasting relationships."
        }
        image={whyImage}
        fallbackAlt="Box 3 founders Bobby English and Scott Howard"
        ctaLabel="Meet the team →"
        ctaHref="/about"
        ctaPageName="About"
      />

      <HomeCTA
        heading={"Have a question?\nWant to work with us?"}
        ctaLabel="Contact →"
      />
    </main>
  );
}
