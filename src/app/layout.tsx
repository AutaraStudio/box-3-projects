import type { Metadata } from "next";
import { PageTransitionProvider } from "@/components/transition/PageTransitionProvider";
import PageTransitionOverlay from "@/components/transition/PageTransitionOverlay";
import "./globals.css";

export const metadata: Metadata = {
  title: "Box 3 Projects",
  description: "Coming soon.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body data-theme="cream">
        <PageTransitionProvider>
          {children}
          <PageTransitionOverlay />
        </PageTransitionProvider>
      </body>
    </html>
  );
}
