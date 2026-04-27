/**
 * Vacancies query
 * ===============
 * Returns every open vacancy ordered newest-first. The careers
 * page filters by `isOpen` server-side so closed roles never
 * reach the client.
 */

import { groq } from "next-sanity";

/* Treat docs with an undefined `isOpen` flag as open — older
   vacancy documents predate the field and would otherwise be
   filtered out. New docs default to isOpen=true via the
   schema's initialValue, so the only way to be hidden is an
   explicit `isOpen: false`. */
export const VACANCIES_QUERY = groq`
  *[_type == "vacancy" && isOpen != false]
    | order(publishedAt desc, title asc) {
      _id,
      title,
      discipline,
      location,
      employmentType,
      salaryMin,
      salaryMax,
      summary,
      applyUrl,
      publishedAt
    }
`;

export interface VacancyItem {
  _id: string;
  title: string;
  discipline: string;
  location: string;
  employmentType: string;
  salaryMin?: number;
  salaryMax?: number;
  summary?: string;
  applyUrl?: string;
  publishedAt: string;
}
