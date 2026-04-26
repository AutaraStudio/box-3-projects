/**
 * Studio root layout
 * ==================
 * Isolated layout for the embedded Sanity Studio at /studio.
 * Deliberately minimal — no globals.css (Studio brings its own
 * styles), no Header / Menu / SmoothScroll providers, no theme
 * tokens. Studio renders in its own clean tree so the site's
 * fixed UI doesn't bleed in.
 *
 * Re-exports the metadata + viewport helpers required by
 * next-sanity. They live here (server component) because the
 * Studio page itself is a client component.
 */

export { metadata, viewport } from "next-sanity/studio";

export default function StudioRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
