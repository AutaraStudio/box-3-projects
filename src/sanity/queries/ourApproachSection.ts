/**
 * Our Approach Section Query
 * ==========================
 * Fetches the singleton ourApproachSection document with all steps,
 * the intro, and the completion panel. Image references are kept
 * lightweight — the consumer component resolves them through urlFor().
 */

import { groq } from "next-sanity";


export const OUR_APPROACH_QUERY = groq`
  *[_type == "ourApproachSection"][0] {
    sectionLabel,
    intro {
      heading,
      text
    },
    steps[] {
      _key,
      title,
      heading,
      text,
      layout,
      leadImage {
        ...,
        asset->{ _id, url }
      },
      slideImages[] {
        _key,
        ...,
        asset->{ _id, url }
      }
    },
    completion {
      title,
      heading,
      text,
      images[] {
        _key,
        ...,
        asset->{ _id, url }
      }
    }
  }
`;

/* ------------------------------------------------------------------
   Types
   ------------------------------------------------------------------ */

export interface OurApproachImage {
  _key?: string;
  alt?: string;
  asset?: {
    _id: string;
    url: string;
  };
}

export interface ApproachStep {
  _key: string;
  title: string;
  heading: string;
  text: string;
  /** Where the image column sits relative to the text column. */
  layout: "left" | "right";
  leadImage?: OurApproachImage;
  slideImages?: OurApproachImage[];
}

export interface ApproachIntro {
  heading: string;
  text: string;
}

export interface ApproachCompletion {
  title: string;
  heading: string;
  text: string;
  images?: OurApproachImage[];
}

export interface OurApproachData {
  sectionLabel: string;
  intro: ApproachIntro;
  steps: ApproachStep[];
  completion: ApproachCompletion;
}
