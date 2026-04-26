/**
 * Line Scroll Section Query
 * =========================
 * GROQ query and TS interface for the singleton Line Scroll Section
 * document.
 */

import { groq } from "next-sanity";

export const LINE_SCROLL_QUERY = groq`
  *[_type == "lineScrollSection"][0] {
    label,
    lines,
    bottomHeading,
    bottomBody
  }
`;

export interface LineScrollData {
  label: string;
  lines: string[];
  bottomHeading?: string;
  bottomBody?: string;
}
