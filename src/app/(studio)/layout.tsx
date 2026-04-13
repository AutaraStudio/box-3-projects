/**
 * Studio Root Layout
 * ==================
 * Isolated root layout for the Sanity Studio route group.
 * Does NOT import globals.css or any project stylesheets —
 * the Studio provides its own styling via @sanity/ui.
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sanity Studio",
};

export const dynamic = "force-dynamic";

export default function StudioRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
