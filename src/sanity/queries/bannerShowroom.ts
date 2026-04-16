/**
 * Banner Showroom Query
 * =====================
 * Fetches the singleton bannerShowroom document.
 */

import { groq } from "next-sanity";

export const BANNER_SHOWROOM_QUERY = groq`
  *[_type == "bannerShowroom"][0] {
    sectionLabel,
    heading,
    cursorLabel,
    backgroundVideoUrl,
    modalVideoUrl
  }
`;

export interface BannerShowroomData {
  sectionLabel: string;
  heading: string;
  cursorLabel: string;
  backgroundVideoUrl?: string;
  modalVideoUrl?: string;
}
