/**
 * Clean Delete Action
 * ===================
 * Replaces the default Sanity delete action with one that first
 * detaches the document from every other document that references it,
 * then deletes. Editors get a single "Delete" button that just works
 * — no "Delete all versions anyway" prompts, no dangling references,
 * no manual cleanup of partner / testimonial slots on parent pages.
 *
 * For each referring document we:
 *   - Remove array items whose `_ref` points at the target doc.
 *   - Unset single-reference fields whose `_ref` points at the target.
 *
 * The cleanup + delete run in a single Sanity transaction, so the
 * dataset never ends up in a half-cleaned state if anything fails.
 */

"use client";

import { useState } from "react";
import { TrashIcon } from "@sanity/icons";
import {
  useClient,
  type DocumentActionComponent,
  type DocumentActionDescription,
} from "sanity";

/**
 * Walk a document and yield the dot/keyed paths of every reference
 * that points at `targetId`. Supports nested arrays + objects.
 */
function* findReferencePaths(
  node: unknown,
  targetId: string,
  prefix = "",
): Generator<{ path: string; isArrayItem: boolean; key?: string }> {
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
        if (key) {
          yield {
            path: `${prefix.replace(/\.$/, "")}[_key=="${key}"]`,
            isArrayItem: true,
            key,
          };
        } else {
          yield {
            path: `${prefix.replace(/\.$/, "")}[${i}]`,
            isArrayItem: true,
          };
        }
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
      // single-reference field handled by parent recursion via the
      // key that holds this object; nothing to yield here.
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
        yield {
          path: `${prefix}${key}`,
          isArrayItem: false,
        };
      } else {
        yield* findReferencePaths(value, targetId, `${prefix}${key}.`);
      }
    }
  }
}

export const CleanDeleteAction: DocumentActionComponent = (
  props,
): DocumentActionDescription => {
  const { id, type, draft, published, onComplete } = props;
  const client = useClient({ apiVersion: "2024-12-01" });
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Strip the "drafts." prefix; the published-id is what other docs
  // reference (drafts are never referenced).
  const publishedId = id.replace(/^drafts\./, "");
  const title =
    (published as { title?: string; name?: string; author?: string } | null)
      ?.title ??
    (published as { name?: string } | null)?.name ??
    (published as { author?: string } | null)?.author ??
    (draft as { title?: string } | null)?.title ??
    "this document";

  const handle = async () => {
    setBusy(true);
    setError(null);
    try {
      // 1. Find every doc (published + drafts) that references this one.
      const referrers: Array<Record<string, unknown>> = await client.fetch(
        `*[references($id) && _id != $id && _id != $draftId]`,
        { id: publishedId, draftId: `drafts.${publishedId}` },
      );

      const tx = client.transaction();

      // 2. For each referrer, build unset operations for every ref
      //    that points at our target — array items by _key (or index)
      //    and single-reference fields by field path.
      for (const doc of referrers) {
        const docId = doc._id as string;
        const unsetPaths: string[] = [];
        for (const hit of findReferencePaths(doc, publishedId)) {
          unsetPaths.push(hit.path);
        }
        if (unsetPaths.length > 0) {
          tx.patch(docId, (p) => p.unset(unsetPaths));
        }
      }

      // 3. Delete the document itself (both draft + published variants).
      tx.delete(publishedId);
      tx.delete(`drafts.${publishedId}`);

      await tx.commit({ visibility: "async" });

      onComplete();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unknown error during delete",
      );
      setBusy(false);
    }
  };

  return {
    label: busy ? "Deleting…" : "Delete",
    icon: TrashIcon,
    tone: "critical",
    disabled: busy,
    onHandle: () => setOpen(true),
    dialog: open && {
      type: "confirm",
      tone: "critical",
      message: error
        ? `Delete failed: ${error}`
        : `Delete "${title}"? It will be removed from any pages or sections that reference it.`,
      onConfirm: handle,
      onCancel: () => {
        setOpen(false);
        onComplete();
      },
    },
  };
};
