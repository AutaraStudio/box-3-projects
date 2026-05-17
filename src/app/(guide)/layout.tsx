/**
 * Guide layout
 * ============
 * Deliberately minimal — no site header, no footer, no preloader,
 * no Sanity fetches. This route group exists for internal pages
 * like /content-guide that are about the site, not part of the
 * site's public storytelling. Loads the same typeface and global
 * tokens as the rest of the site so the page still feels of-a-piece.
 */

import localFont from "next/font/local";

import "../globals.css";

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

export default function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={neueMontreal.variable}>
      <body data-theme="cream">{children}</body>
    </html>
  );
}
