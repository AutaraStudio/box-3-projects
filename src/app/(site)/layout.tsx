import type { Metadata } from "next";
import PageTransition from "@/components/layout/PageTransition";
import Providers from "@/components/layout/Providers";
import "../globals.css";

export const metadata: Metadata = {
  title: "Box 3 Projects — Commercial Fit-Outs Done Differently",
  description:
    "London's trusted commercial fit-out partner. Delivering exceptional spaces for forward-thinking businesses.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body data-theme="light">
        {/* Route-change overlay — fixed full-viewport div that fades
            in before navigation fires and fades out once the new
            route has painted. */}
        <PageTransition />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
