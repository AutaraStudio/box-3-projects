/**
 * Approach Header Section Query
 * =============================
 * GROQ query + types for the sticky scroll-driven image wipe
 * section that sits after OurApproach on the home page.
 */

import { groq } from "next-sanity";

export const APPROACH_HEADER_QUERY = groq`
  *[_type == "approachHeaderSection"][0] {
    label,
    heading,
    image1 {
      asset->{ _id, url },
      alt,
      hotspot,
      crop
    },
    image2 {
      asset->{ _id, url },
      alt,
      hotspot,
      crop
    }
  }
`;

export interface ApproachHeaderImage {
  asset?: { _id: string; url: string };
  alt?: string;
  hotspot?: { x: number; y: number };
  crop?: { top: number; bottom: number; left: number; right: number };
}

export interface ApproachHeaderData {
  label?: string;
  heading: string;
  image1?: ApproachHeaderImage;
  image2?: ApproachHeaderImage;
}
