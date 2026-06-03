import type { Metadata } from "next";
import localFont from "next/font/local";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import SmoothScroll from "@/components/scroll/SmoothScroll";
import ScrollResetOnRoute from "@/components/scroll/ScrollResetOnRoute";
import { SiteSettingsProvider } from "@/components/settings/SiteSettingsProvider";
import { PageTransitionProvider } from "@/components/transition/PageTransitionProvider";
import PageTransitionOverlay from "@/components/transition/PageTransitionOverlay";
import { MenuProvider } from "@/components/menu/MenuProvider";
import Header from "@/components/menu/Header";
import MenuOverlay from "@/components/menu/MenuOverlay";
import Footer from "@/components/footer/Footer";
import HomePreloader from "@/components/preloader/HomePreloader";
import HomeComingSoon from "@/components/home/HomeComingSoon";
import { sanityFetch } from "@/sanity/lib/fetch";
import { SITE_URL } from "@/lib/site";
import {
  FEATURED_PROJECTS_QUERY,
  type FeaturedProjectItem,
} from "@/sanity/queries/projects";
import {
  SITE_SETTINGS_QUERY,
  type SiteSettingsData,
  type SiteSettingsLink,
} from "@/sanity/queries/siteSettings";
import "../globals.css";

/* The site uses a single typeface — Neue Montreal — across body and
   headings. Hierarchy is built from size + weight (regular vs medium),
   not from a serif/sans pairing. Self-hosted woff2 from /public/fonts.
   Exposed as --font-sans on the <html> element. */
const neueMontreal = localFont({
  src: [
    { path: "../../../public/fonts/NeueMontreal-Light.woff2", weight: "300", style: "normal" },
    { path: "../../../public/fonts/NeueMontreal-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../../public/fonts/NeueMontreal-Italic.woff2", weight: "400", style: "italic" },
    { path: "../../../public/fonts/NeueMontreal-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../../public/fonts/NeueMontreal-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-sans",
  display: "swap",
});

/* ─────────────────────────────────────────────────────────────────
   Fallback content
   ─────────────────────────────────────────────────────────────────
   Sensible defaults used when the Site Settings document hasn't
   been authored / published yet. Once the editor populates the
   singleton in Sanity, the live values take over automatically. */

const FALLBACK = {
  brandName: "Box 3 Projects",
  headerPrimary: [
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Projects", href: "/projects" },
    { label: "Sustainability", href: "/sustainability" },
  ],
  headerSecondary: [
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],
  menuPrimary: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Projects", href: "/projects" },
  ],
  menuMore: [
    { label: "Services", href: "/services" },
    { label: "Careers", href: "/careers" },
    { label: "Sustainability", href: "/sustainability" },
    { label: "Contact", href: "/contact" },
  ],
  footerPages: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Projects", href: "/projects" },
    { label: "Careers", href: "/careers" },
    { label: "Sustainability", href: "/sustainability" },
  ],
  social: [
    { label: "Instagram", href: "https://www.instagram.com/box3projects/" },
    { label: "LinkedIn", href: "https://www.linkedin.com/company/box3-projects/" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/legal/privacy-policy" },
    { label: "Terms & Conditions", href: "/legal/terms-and-conditions" },
  ],
  addressLines: ["Level 5, 55 Broadway,", "London SW1H 0BD."],
  email: "hello@box3projects.co.uk",
  phone: "+44 (0)20 8050 7815",
  phoneHref: "tel:02080507815",
} as const;

/* generateMetadata so the root <title> + <meta description> can
   pull from siteSettings.seoTitle / seoDescription instead of
   being hardcoded. Per-page generateMetadata still overrides
   these where it's defined. */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await sanityFetch<SiteSettingsData | null>({
    query: SITE_SETTINGS_QUERY,
  });

  const title = settings?.seoTitle?.trim() || FALLBACK.brandName;
  const description = settings?.seoDescription?.trim() || "Coming soon.";
  /* Prefer a Site Settings → SEO image if the editor sets one; otherwise
     fall back to the brand card shipped in /public. Either way there's
     always a valid 1200×630 share image, so the card is never broken. */
  const ogImage = settings?.seoOgImageUrl?.trim() || "/box-3-og-img.png";

  return {
    /* Resolves relative metadata (canonical, OG/Twitter image paths)
       against the live origin. Per-page generateMetadata still
       overrides title/description below it. */
    metadataBase: new URL(SITE_URL),
    title,
    description,
    icons: {
      icon: [{ url: "/box3-favicon.png", type: "image/png" }],
      shortcut: "/box3-favicon.png",
      apple: "/box3-favicon.png",
    },
    /* Google Search Console site-ownership token — renders
       <meta name="google-site-verification" …> into the server <head>. */
    verification: {
      google: "olDepRAvS3FnD-rT29wY5ERZv8ivpEYvQnloT9NJCSQ",
    },
    /* Site-level social card. Pages that don't set their own
       openGraph/twitter inherit these, so every URL shares a valid
       card. The image comes from Site Settings → SEO (seoOgImage);
       when it's empty we omit images rather than ship a broken link. */
    openGraph: {
      type: "website",
      siteName: FALLBACK.brandName,
      url: SITE_URL,
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

/* Coerce a Sanity link array (which may be null / undefined / partial)
   into a non-empty list of `{ label, href }`. Drops malformed entries
   (no label or href) so a half-authored doc can't break the nav. */
function coerceLinks(
  fromCms: SiteSettingsLink[] | undefined,
  fallback: ReadonlyArray<{ label: string; href: string }>,
): Array<{ label: string; href: string }> {
  const cleaned = (fromCms ?? [])
    .filter((l): l is SiteSettingsLink => !!l && !!l.label && !!l.href)
    .map(({ label, href }) => ({ label, href }));
  return cleaned.length > 0 ? cleaned : Array.from(fallback);
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [featuredFromCms, settings] = await Promise.all([
    sanityFetch<FeaturedProjectItem[]>({
      query: FEATURED_PROJECTS_QUERY,
    }),
    sanityFetch<SiteSettingsData | null>({
      query: SITE_SETTINGS_QUERY,
    }),
  ]);

  const featuredProjects = featuredFromCms.map((p) => ({
    title: p.title,
    href: `/projects/${p.slug}`,
  }));

  /* Resolve every editable surface — fall back to the FALLBACK
     defaults whenever the Sanity field is empty so the site keeps
     rendering during initial setup. */
  const brand = settings?.brandName?.trim() || FALLBACK.brandName;
  const headerPrimary = coerceLinks(
    settings?.headerPrimaryLinks,
    FALLBACK.headerPrimary,
  );
  const headerSecondary = coerceLinks(
    settings?.headerSecondaryLinks,
    FALLBACK.headerSecondary,
  );
  const menuPrimary = coerceLinks(
    settings?.menuPrimaryLinks,
    FALLBACK.menuPrimary,
  );
  const menuMore = coerceLinks(settings?.menuMoreLinks, FALLBACK.menuMore);
  const footerPages = coerceLinks(settings?.footerPages, FALLBACK.footerPages);
  const footerSocial = coerceLinks(settings?.footerSocial, FALLBACK.social);
  const footerLegal = coerceLinks(settings?.footerLegal, FALLBACK.legal);

  const contact = {
    addressLines:
      settings?.addressLines && settings.addressLines.length > 0
        ? settings.addressLines
        : Array.from(FALLBACK.addressLines),
    email: settings?.email || FALLBACK.email,
    phone: settings?.phone || FALLBACK.phone,
    phoneHref: settings?.phoneHref || FALLBACK.phoneHref,
  };

  return (
    <html
      lang="en"
      className={neueMontreal.variable}
      suppressHydrationWarning
    >
      {/* Google Analytics (GA4) — shared component, also mounted in
          the (guide) layout. Excluded from (studio). */}
      <GoogleAnalytics />
      <body data-theme="cream">
        {settings?.comingSoon ? (
          /* Site-wide kill switch — when Coming soon is ON in
             Site Settings, every route renders the holding page
             only. Header, footer, menu, preloader and the page's
             own content are all skipped so the URL the visitor
             typed (/, /about, /careers, anything) yields the same
             holding view. Toggle OFF in Site Settings to bring
             the full site back. */
          <main>
            <HomeComingSoon
              heading={settings.comingSoonHeading || undefined}
              body={settings.comingSoonBody || undefined}
            />
          </main>
        ) : (
          <>
            {/* Synchronous flag for the home preloader — must run
                before any paint so the dark cover (rendered in SSR
                below) is either visible from the very first frame OR
                never paints at all. Sets <html data-preloader> based
                on sessionStorage; the CSS gate in HomePreloader.css
                uses that attribute to decide whether to show the
                cover. */}
            <script
              dangerouslySetInnerHTML={{
                __html: `(function(){try{var k="box3:preloader-played";var played=sessionStorage.getItem(k)==="1";document.documentElement.setAttribute("data-preloader",played?"skip":"active");}catch(e){document.documentElement.setAttribute("data-preloader","active");}})();`,
              }}
            />
            <SmoothScroll>
              <ScrollResetOnRoute />
              <SiteSettingsProvider value={settings}>
              <PageTransitionProvider>
                <MenuProvider>
                  {/* Plays once per session: a dark cover holds a
                      beat, then morphs to the header logo's bounds.
                      Header logo glyphs are hidden via CSS while
                      data-preloader=active is set on <html>. */}
                  <HomePreloader />
                  <Header
                    brand={brand}
                    primaryLinks={headerPrimary}
                    secondaryLinks={headerSecondary}
                  />
                  {children}
                  <Footer
                    pages={footerPages}
                    featuredProjects={featuredProjects}
                    contact={contact}
                    social={footerSocial}
                    legal={footerLegal}
                    brand={brand}
                    columnLabels={settings?.footerLabels}
                  />
                  <MenuOverlay
                    primaryLinks={menuPrimary}
                    moreLinks={menuMore}
                    contact={contact}
                  />
                  <PageTransitionOverlay />
                </MenuProvider>
              </PageTransitionProvider>
              </SiteSettingsProvider>
            </SmoothScroll>
          </>
        )}
      </body>
    </html>
  );
}
