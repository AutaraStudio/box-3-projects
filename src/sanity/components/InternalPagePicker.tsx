/**
 * InternalPagePicker
 * ==================
 * Custom input for the `internalPage` string field on the shared
 * `link` object (and the matching `*CtaInternalPage` fields on
 * careers / sustainability). Renders a dropdown that combines:
 *
 *   1. The site's top-level routes (hardcoded — see INTERNAL_PAGES).
 *   2. Every `legalPage` document, queried live from Sanity.
 *
 * Adding a new legal page in the studio means it appears in this
 * dropdown automatically — no schema edit required.
 *
 * Value stored is a string (the URL path, e.g. `/about` or
 * `/legal/privacy-policy`) — same shape as before, so the GROQ
 * coalesce(internalPage, href) projections need no change.
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import { Select, Stack, Text } from "@sanity/ui";
import { type StringInputProps, set, unset, useClient } from "sanity";

import { INTERNAL_PAGES } from "../schemas/objects/link";

type LegalPageSummary = {
  title?: string;
  slug?: string;
};

const NO_VALUE = "";

export function InternalPagePicker(props: StringInputProps) {
  const { value, onChange, elementProps } = props;
  const client = useClient({ apiVersion: "2024-06-01" });

  const [legalPages, setLegalPages] = useState<LegalPageSummary[]>([]);

  /* Pull every legalPage once on mount. Cheap query — there'll
     never be many of these, and the studio cache will reuse it
     across fields. */
  useEffect(() => {
    let cancelled = false;
    client
      .fetch<LegalPageSummary[]>(
        `*[_type == "legalPage" && defined(slug.current)] | order(title asc) {
          title,
          "slug": slug.current
        }`,
      )
      .then((data) => {
        if (!cancelled) setLegalPages(data ?? []);
      })
      .catch(() => {
        /* Non-fatal — the static page list still works. */
      });
    return () => {
      cancelled = true;
    };
  }, [client]);

  const options = useMemo(() => {
    const legal = legalPages
      .filter((p) => p.slug && p.title)
      .map((p) => ({
        title: `${p.title} (/legal/${p.slug})`,
        value: `/legal/${p.slug}`,
      }));
    return [...INTERNAL_PAGES, ...legal];
  }, [legalPages]);

  return (
    <Stack space={2}>
      <Select
        {...elementProps}
        value={value ?? NO_VALUE}
        onChange={(event) => {
          const next = event.currentTarget.value;
          onChange(next ? set(next) : unset());
        }}
      >
        <option value={NO_VALUE}>— Select a page —</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.title}
          </option>
        ))}
      </Select>
      {legalPages.length === 0 && (
        <Text size={1} muted>
          Tip: any new legal page you create will appear in this list automatically.
        </Text>
      )}
    </Stack>
  );
}
