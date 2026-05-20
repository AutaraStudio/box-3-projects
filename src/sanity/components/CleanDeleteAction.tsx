/**
 * Clean Delete Action
 * ===================
 * Replaces the default Sanity delete action with one that first
 * detaches the document from every other document that references it,
 * then deletes. Editors get a single "Delete" button that just works
 * — no "Delete all versions anyway" prompts, no dangling references,
 * no manual cleanup of partner / testimonial slots on parent pages.
 *
 * The dialog previews every place the document is currently used so
 * the editor can see exactly what will change before confirming.
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Card,
  Flex,
  Spinner,
  Stack,
  Text,
} from "@sanity/ui";
import { TrashIcon, WarningOutlineIcon } from "@sanity/icons";
import {
  useClient,
  useDocumentOperation,
  type DocumentActionComponent,
  type DocumentActionDescription,
} from "sanity";

/**
 * Human-friendly labels for doc types we know about. Anything not in
 * this map falls back to a camelCase → "Title Case" conversion so new
 * schemas still render sensibly without code changes.
 */
const TYPE_LABELS: Record<string, string> = {
  homePage: "Home page",
  aboutPage: "About page",
  servicesPage: "Services page",
  projectsPage: "Projects page",
  contactPage: "Contact page",
  careersPage: "Careers page",
  sustainabilityPage: "Sustainability page",
  legalPage: "Legal page",
  project: "Project",
  testimonial: "Testimonial",
  partner: "Partner",
  partnersSection: "Partners section",
  testimonialsSection: "Testimonials section",
  teamMember: "Team member",
  expertise: "Expertise",
  vacancy: "Vacancy",
  siteSettings: "Site settings",
};

function humaniseType(type: string): string {
  if (TYPE_LABELS[type]) return TYPE_LABELS[type];
  const spaced = type.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

interface Referrer {
  _id: string;
  _type: string;
  /** Best-guess label from a coalesce() in the query. */
  label?: string | null;
}

function referrerTitle(r: Referrer): string {
  if (r.label && r.label.trim()) return r.label.trim();
  return humaniseType(r._type);
}

/* Walks a document and yields the dot/keyed paths of every reference
   that points at `targetId`. Supports nested arrays + objects. */
function* findReferencePaths(
  node: unknown,
  targetId: string,
  prefix = "",
): Generator<string> {
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i += 1) {
      const item = node[i] as Record<string, unknown>;
      if (
        item &&
        typeof item === "object" &&
        (item as { _type?: string })._type === "reference" &&
        (item as { _ref?: string })._ref === targetId
      ) {
        const key = (item as { _key?: string })._key;
        const base = prefix.replace(/\.$/, "");
        yield key ? `${base}[_key=="${key}"]` : `${base}[${i}]`;
      } else if (item && typeof item === "object") {
        const key = (item as { _key?: string })._key;
        const nextPrefix = key
          ? `${prefix.replace(/\.$/, "")}[_key=="${key}"].`
          : `${prefix}[${i}].`;
        yield* findReferencePaths(item, targetId, nextPrefix);
      }
    }
  } else if (node && typeof node === "object") {
    const obj = node as Record<string, unknown>;
    if (
      obj._type === "reference" &&
      (obj._ref as string | undefined) === targetId
    ) {
      return;
    }
    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith("_")) continue;
      if (
        value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        (value as { _type?: string })._type === "reference" &&
        (value as { _ref?: string })._ref === targetId
      ) {
        yield `${prefix}${key}`;
      } else {
        yield* findReferencePaths(value, targetId, `${prefix}${key}.`);
      }
    }
  }
}

/* GROQ that coalesces the most likely human-readable field for each
   referrer. We pick `title` first (pages, projects), then `name`,
   then `author` (testimonials), then `sectionLabel`. */
const REFERRER_QUERY = `
  *[references($id) && _id != $id && _id != $draftId && !(_id in path("drafts.**"))] {
    _id,
    _type,
    "label": coalesce(title, name, author, sectionLabel, heading)
  }
`;

export const CleanDeleteAction: DocumentActionComponent = (
  props,
): DocumentActionDescription => {
  const { id, type, draft, published, onComplete } = props;
  const client = useClient({ apiVersion: "2024-12-01" });
  const publishedId = id.replace(/^drafts\./, "");
  const { delete: deleteOp } = useDocumentOperation(publishedId, type);

  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [referrers, setReferrers] = useState<Referrer[] | null>(null);

  /* Author for testimonials, name for partners, title for the rest. */
  const pick = (doc: unknown): string | undefined => {
    if (!doc || typeof doc !== "object") return undefined;
    const d = doc as Record<string, string | undefined>;
    return d.author ?? d.name ?? d.title;
  };
  const docLabel = pick(published) ?? pick(draft) ?? "this document";

  /* Fetch the referrers list as soon as the dialog opens. */
  useEffect(() => {
    if (!open) {
      setReferrers(null);
      return;
    }
    let cancelled = false;
    client
      .fetch<Referrer[]>(REFERRER_QUERY, {
        id: publishedId,
        draftId: `drafts.${publishedId}`,
      })
      .then((rows) => {
        if (!cancelled) setReferrers(rows);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load references",
          );
          setReferrers([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [open, client, publishedId]);

  /* Group referrers by doc type for a tidier list. */
  const grouped = useMemo(() => {
    if (!referrers) return null;
    const map = new Map<string, Referrer[]>();
    for (const r of referrers) {
      const list = map.get(r._type) ?? [];
      list.push(r);
      map.set(r._type, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) =>
      humaniseType(a).localeCompare(humaniseType(b)),
    );
  }, [referrers]);

  const handle = async () => {
    setBusy(true);
    setError(null);
    try {
      /* Re-fetch the full docs so we can compute exact unset paths. */
      const fullDocs: Array<Record<string, unknown>> = await client.fetch(
        `*[references($id) && _id != $id && _id != $draftId]`,
        { id: publishedId, draftId: `drafts.${publishedId}` },
      );

      const tx = client.transaction();
      let touched = 0;
      for (const doc of fullDocs) {
        const docId = doc._id as string;
        const unsetPaths: string[] = [];
        for (const path of findReferencePaths(doc, publishedId)) {
          unsetPaths.push(path);
        }
        if (unsetPaths.length > 0) {
          tx.patch(docId, (p) => p.unset(unsetPaths));
          touched += 1;
        }
      }
      if (touched > 0) {
        await tx.commit({ visibility: "sync" });
      }

      deleteOp.execute();
      onComplete();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unknown error during delete",
      );
      setBusy(false);
    }
  };

  const referrerCount = referrers?.length ?? 0;

  return {
    label: busy ? "Deleting…" : "Delete",
    icon: TrashIcon,
    tone: "critical",
    disabled: busy,
    onHandle: () => setOpen(true),
    dialog: open && {
      type: "dialog",
      header: `Delete ${docLabel}`,
      onClose: () => {
        if (!busy) {
          setOpen(false);
          onComplete();
        }
      },
      content: (
        <Stack space={4} padding={1}>
          {referrers === null ? (
            <Flex align="center" justify="center" padding={4}>
              <Spinner muted />
              <Box marginLeft={3}>
                <Text muted size={1}>
                  Checking where this is used…
                </Text>
              </Box>
            </Flex>
          ) : referrerCount === 0 ? (
            <Card padding={3} radius={2} tone="primary">
              <Text size={1}>
                <strong>{docLabel}</strong> isn’t used anywhere — deleting it
                won’t affect any other pages or sections.
              </Text>
            </Card>
          ) : (
            <>
              <Card padding={3} radius={2} tone="caution">
                <Flex align="flex-start" gap={3}>
                  <Text size={2}>
                    <WarningOutlineIcon />
                  </Text>
                  <Box flex={1}>
                    <Text size={1}>
                      <strong>{docLabel}</strong> is currently used in{" "}
                      <strong>
                        {referrerCount}{" "}
                        {referrerCount === 1 ? "place" : "places"}
                      </strong>
                      . Deleting it will remove it from every location below.
                      The pages themselves stay intact — only the link to this
                      item is cleared.
                    </Text>
                  </Box>
                </Flex>
              </Card>

              <Stack space={2}>
                {grouped?.map(([docType, items]) => (
                  <Stack key={docType} space={2}>
                    <Flex align="center" gap={2}>
                      <Badge tone="primary" mode="outline">
                        {humaniseType(docType)}
                      </Badge>
                      <Text size={0} muted>
                        {items.length} {items.length === 1 ? "item" : "items"}
                      </Text>
                    </Flex>
                    <Stack space={1}>
                      {items.map((item) => (
                        <Card
                          key={item._id}
                          padding={3}
                          radius={2}
                          shadow={1}
                          tone="default"
                        >
                          <Text size={1} weight="medium">
                            {referrerTitle(item)}
                          </Text>
                        </Card>
                      ))}
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </>
          )}

          {error && (
            <Card padding={3} radius={2} tone="critical">
              <Text size={1}>
                <strong>Delete failed:</strong> {error}
              </Text>
            </Card>
          )}
        </Stack>
      ),
      footer: (
        <Flex justify="flex-end" gap={2} padding={2}>
          <Card
            as="button"
            padding={3}
            radius={2}
            tone="default"
            shadow={1}
            style={{ cursor: busy ? "not-allowed" : "pointer" }}
            disabled={busy}
            onClick={() => {
              if (!busy) {
                setOpen(false);
                onComplete();
              }
            }}
          >
            <Text size={1} weight="medium">
              Cancel
            </Text>
          </Card>
          <Card
            as="button"
            padding={3}
            radius={2}
            tone="critical"
            shadow={1}
            style={{ cursor: busy ? "not-allowed" : "pointer" }}
            disabled={busy || referrers === null}
            onClick={handle}
          >
            <Text size={1} weight="medium">
              {busy
                ? "Deleting…"
                : referrerCount > 0
                  ? `Delete and remove from ${referrerCount} ${
                      referrerCount === 1 ? "place" : "places"
                    }`
                  : "Delete"}
            </Text>
          </Card>
        </Flex>
      ),
    },
  };
};
