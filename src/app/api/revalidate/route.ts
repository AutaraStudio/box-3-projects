/**
 * /api/revalidate
 * ===============
 * Sanity webhook target. Sanity POSTs here whenever a document is
 * created, updated, or deleted; we map the doc's `_type` to the
 * page(s) that consume it and call `revalidatePath()` so the
 * Next.js ISR cache rebuilds those pages on the next request.
 *
 * The result: a client publishes a change in the studio, the
 * affected page is fresh on the next visit (~1s) — no waiting
 * for the ISR window, no redeploy.
 *
 * --- Setup --------------------------------------------------
 *
 * 1. Set a shared secret in the Netlify environment:
 *
 *      SANITY_REVALIDATE_SECRET=<long random string>
 *
 *    (Generate with `openssl rand -hex 32` or similar.)
 *
 * 2. In Sanity (https://www.sanity.io/manage → API → Webhooks):
 *
 *      Name        : Site revalidate
 *      URL         : https://<your-site>/api/revalidate
 *      Dataset     : production
 *      Trigger on  : Create, Update, Delete
 *      Filter      : (leave empty — we filter by _type below)
 *      HTTP method : POST
 *      Headers     : x-sanity-revalidate-secret: <same value as env>
 *      API version : 2024-12-01
 *      Projection  : { _type, slug }
 *
 *    The Projection trims the payload to the fields we read.
 *
 * --- Type → path map ───────────────────────────────────────
 *
 * Everything top-level is mapped to its own page. Site-wide
 * documents (siteSettings, partner) revalidate every top-level
 * route since the header + footer + partners marquee appear on
 * all of them.
 */

import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

const ALL_PAGES = [
  "/",
  "/about",
  "/services",
  "/projects",
  "/careers",
  "/sustainability",
  "/contact",
];

/** Map a Sanity document type onto the page paths that should
 *  be revalidated when it's published / updated / deleted. */
function pathsForType(type: string, slug?: string): string[] {
  switch (type) {
    /* Page singletons — revalidate just their own route. */
    case "homePage":
      return ["/"];
    case "aboutPage":
      return ["/about"];
    case "servicesPage":
      return ["/services"];
    case "projectsPage":
      return ["/projects"];
    case "careersPage":
      return ["/careers"];
    case "sustainabilityPage":
      return ["/sustainability"];
    case "contactPage":
      return ["/contact"];

    /* Global — header / footer / SEO defaults appear on every page.
       Partner-marquee heading lives here too. */
    case "siteSettings":
      return ALL_PAGES;

    /* Project documents — show up on the home (featured strip),
       /projects archive, and their own detail route. */
    case "project":
      return [
        "/",
        "/projects",
        ...(slug ? [`/projects/${slug}`] : []),
      ];
    case "projectCategory":
      return ["/projects"];

    /* Testimonials — surface on the home page (and any other page
       that adds the testimonials section in future). */
    case "testimonial":
      return ["/"];

    /* Partners — used in the global footer marquee. */
    case "partner":
      return ALL_PAGES;

    /* Team members — surface on /about. */
    case "teamMember":
      return ["/about"];

    /* Open vacancies — surface on /careers. */
    case "vacancy":
      return ["/careers"];

    /* Service / expertise documents — surface on /services. */
    case "expertise":
      return ["/services"];

    /* Anything else — be generous and revalidate the home page
       (cheap; covers any future doc type that shows up there). */
    default:
      return ["/"];
  }
}

export async function POST(req: NextRequest) {
  /* --- Auth --- */
  const expected = process.env.SANITY_REVALIDATE_SECRET;
  if (!expected) {
    return NextResponse.json(
      { error: "Server is not configured: SANITY_REVALIDATE_SECRET missing." },
      { status: 500 },
    );
  }
  const provided =
    req.headers.get("x-sanity-revalidate-secret") ||
    req.nextUrl.searchParams.get("secret") ||
    "";
  if (provided !== expected) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  /* --- Parse body --- */
  let body: { _type?: string; slug?: { current?: string } | string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Body must be JSON." },
      { status: 400 },
    );
  }

  const type = typeof body._type === "string" ? body._type : "";
  if (!type) {
    return NextResponse.json(
      { error: "Body must include _type." },
      { status: 400 },
    );
  }
  const slug =
    typeof body.slug === "string"
      ? body.slug
      : body.slug?.current ?? undefined;

  /* --- Revalidate --- */
  const paths = pathsForType(type, slug);
  for (const path of paths) {
    revalidatePath(path);
  }

  return NextResponse.json({
    revalidated: true,
    type,
    slug: slug ?? null,
    paths,
    now: Date.now(),
  });
}

/* GET is here for ad-hoc cache busting from a browser (with the
   secret in the URL). Useful for manual reset / debugging. */
export async function GET(req: NextRequest) {
  const expected = process.env.SANITY_REVALIDATE_SECRET;
  const provided = req.nextUrl.searchParams.get("secret") || "";
  if (!expected || provided !== expected) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  for (const path of ALL_PAGES) revalidatePath(path);
  return NextResponse.json({ revalidated: true, paths: ALL_PAGES });
}
