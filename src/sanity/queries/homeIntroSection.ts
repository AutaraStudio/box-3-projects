/**
 * Home Intro Section Query
 * ========================
 * GROQ query + types for the dark-themed intro block that renders
 * directly below the home page hero.
 */

import { groq } from "next-sanity";

export const HOME_INTRO_QUERY = groq`
  *[_type == "homeIntroSection"][0] {
    body,
    points[] {
      _key,
      text
    }
  }
`;

export interface HomeIntroPoint {
  _key: string;
  text: string;
}

export interface HomeIntroData {
  body: string;
  points?: HomeIntroPoint[];
}
