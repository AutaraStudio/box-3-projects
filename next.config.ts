import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /* Serve Sanity images straight from its CDN (single resize +
       encode) instead of re-optimising them through Next. See
       src/sanity/lib/imageLoader.ts for why. */
    loader: "custom",
    loaderFile: "./src/sanity/lib/imageLoader.ts",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/images/uwutffn5/**",
      },
    ],
  },
};

export default nextConfig;
