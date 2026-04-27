/**
 * BulkTaggedUploaderTool
 * ======================
 * Sanity Studio top-nav tool for bulk-uploading images with a pre-set tag.
 *
 * Workflow for non-technical clients:
 *   1. Pick (or create) a tag — e.g. "project-oak-house"
 *   2. Drop a folder of images onto the drop zone
 *   3. Every uploaded asset is auto-tagged with the chosen tag, so the
 *      client never has to select-all-and-tag after the fact.
 *
 * Works with the existing `sanity-plugin-media` tag system:
 *   - Tags are `media.tag` documents
 *   - Asset tag references live at `opt.media.tags` on each asset,
 *     matching what the Media browser reads.
 *
 * Registered in studio.ts as a top-level Studio tool so it sits next
 * to "Structure" and "Media" in the Studio navbar.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Flex,
  Heading,
  Select,
  Stack,
  Text,
  TextInput,
} from "@sanity/ui";
import { useClient } from "sanity";

type MediaTag = {
  _id: string;
  /** The plugin stores the tag label on `name.current` (slug type). */
  name: string;
};

type UploadState =
  | { status: "idle" }
  | { status: "uploading"; completed: number; total: number }
  | { status: "done"; completed: number; errors: string[] };

/** Random URL-safe key — matches Sanity's `_key` convention. */
function randomKey(length = 12): string {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return out;
}

/** Slugify a user-typed tag label into the plugin's canonical form.
 *  The Media browser shows tags by `name.current`, and filter/search
 *  compares on that slug — so we produce stable, url-safe values. */
function slugifyTag(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function BulkTaggedUploaderTool() {
  const client = useClient({ apiVersion: "2024-06-01" });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [tags, setTags] = useState<MediaTag[]>([]);
  const [loadingTags, setLoadingTags] = useState(true);

  /** The chosen tag document ID. Empty = show "create new" UI. */
  const [selectedTagId, setSelectedTagId] = useState<string>("");
  const [newTagInput, setNewTagInput] = useState("");
  const [creatingTag, setCreatingTag] = useState(false);

  const [isDragOver, setIsDragOver] = useState(false);
  const [upload, setUpload] = useState<UploadState>({ status: "idle" });

  /* Load existing tags once. */
  useEffect(() => {
    let cancelled = false;
    client
      .fetch<MediaTag[]>(
        `*[_type == "media.tag"]{ _id, "name": name.current } | order(name asc)`,
      )
      .then((data) => {
        if (cancelled) return;
        setTags(data);
      })
      .finally(() => {
        if (!cancelled) setLoadingTags(false);
      });
    return () => {
      cancelled = true;
    };
  }, [client]);

  const handleCreateTag = useCallback(async () => {
    const slug = slugifyTag(newTagInput);
    if (!slug) return;

    /* If a tag with this slug already exists, select it rather than duplicate. */
    const existing = tags.find((tag) => tag.name === slug);
    if (existing) {
      setSelectedTagId(existing._id);
      setNewTagInput("");
      return;
    }

    setCreatingTag(true);
    try {
      const created = await client.create({
        _type: "media.tag",
        name: { _type: "slug", current: slug },
      });
      const next: MediaTag = { _id: created._id, name: slug };
      setTags((prev) =>
        [...prev, next].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setSelectedTagId(created._id);
      setNewTagInput("");
    } finally {
      setCreatingTag(false);
    }
  }, [client, newTagInput, tags]);

  const handleFiles = useCallback(
    async (files: File[]) => {
      if (!selectedTagId) return;
      const imageFiles = files.filter((file) =>
        file.type.startsWith("image/"),
      );
      if (imageFiles.length === 0) return;

      setUpload({
        status: "uploading",
        completed: 0,
        total: imageFiles.length,
      });

      let completed = 0;
      const errors: string[] = [];

      /* Upload one file + attach the chosen tag. */
      const uploadOne = async (file: File) => {
        try {
          const asset = await client.assets.upload("image", file, {
            filename: file.name,
          });

          /* Attach the chosen tag to the freshly uploaded asset —
             same shape the plugin writes when tagging manually. */
          await client
            .patch(asset._id)
            .setIfMissing({ opt: {} })
            .setIfMissing({ "opt.media": {} })
            .setIfMissing({ "opt.media.tags": [] })
            .append("opt.media.tags", [
              {
                _key: randomKey(),
                _ref: selectedTagId,
                _type: "reference",
                _weak: true,
              },
            ])
            .commit();
        } catch (error) {
          errors.push(
            `${file.name}: ${
              error instanceof Error ? error.message : "upload failed"
            }`,
          );
        } finally {
          completed += 1;
          setUpload({
            status: "uploading",
            completed,
            total: imageFiles.length,
          });
        }
      };

      /* Bounded-concurrency pool.
         Sanity's asset endpoint throttles high parallelism — hundreds
         of simultaneous uploads stall silently ("stuck at 25"). A small
         pool (4) keeps requests flowing steadily without overwhelming
         the API. Tune CONCURRENCY upwards cautiously if needed. */
      const CONCURRENCY = 4;
      let cursor = 0;
      const worker = async () => {
        while (cursor < imageFiles.length) {
          const i = cursor++;
          await uploadOne(imageFiles[i]);
        }
      };
      await Promise.all(
        Array.from(
          { length: Math.min(CONCURRENCY, imageFiles.length) },
          worker,
        ),
      );

      setUpload({ status: "done", completed, errors });
    },
    [client, selectedTagId],
  );

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    if (!selectedTagId) return;
    const files = Array.from(event.dataTransfer.files ?? []);
    void handleFiles(files);
  };

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!isDragOver) setIsDragOver(true);
  };

  const onDragLeave = () => setIsDragOver(false);

  const onPickFiles = () => {
    if (!selectedTagId) return;
    fileInputRef.current?.click();
  };

  const onFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files ?? []);
    void handleFiles(files);
    event.currentTarget.value = "";
  };

  const resetForAnotherBatch = () => setUpload({ status: "idle" });

  const dropzoneDisabled = !selectedTagId;

  return (
    <Container padding={5} width={2}>
      <Stack space={5}>
        <Stack space={2}>
          <Heading size={3}>Bulk Upload</Heading>
          <Text muted>
            Pick a tag first, then drop a folder of images. Every image
            you upload here is automatically tagged — no need to select
            them all and tag afterwards.
          </Text>
        </Stack>

        {/* Tag picker */}
        <Card padding={4} radius={3} shadow={1}>
          <Stack space={4}>
            <Stack space={2}>
              <Text size={1} weight="semibold">
                1. Choose a tag
              </Text>
              <Text size={1} muted>
                Pick an existing tag, or create a new one below.
              </Text>
            </Stack>

            <Select
              value={selectedTagId}
              onChange={(event) => setSelectedTagId(event.currentTarget.value)}
              disabled={loadingTags}
            >
              <option value="">
                {loadingTags ? "Loading tags…" : "— Select a tag —"}
              </option>
              {tags.map((tag) => (
                <option key={tag._id} value={tag._id}>
                  {tag.name}
                </option>
              ))}
            </Select>

            <Stack space={2}>
              <Text size={1} weight="medium">
                Or create a new tag
              </Text>
              <Flex gap={2}>
                <Box flex={1}>
                  <TextInput
                    placeholder="e.g. project-oak-house"
                    value={newTagInput}
                    onChange={(event) =>
                      setNewTagInput(event.currentTarget.value)
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void handleCreateTag();
                      }
                    }}
                    disabled={creatingTag}
                  />
                </Box>
                <Button
                  tone="primary"
                  mode="ghost"
                  text={creatingTag ? "Creating…" : "Create tag"}
                  disabled={creatingTag || !slugifyTag(newTagInput)}
                  onClick={() => void handleCreateTag()}
                />
              </Flex>
              {newTagInput && slugifyTag(newTagInput) !== newTagInput && (
                <Text size={0} muted>
                  Tag will be saved as{" "}
                  <code>{slugifyTag(newTagInput) || "(empty)"}</code>
                </Text>
              )}
            </Stack>
          </Stack>
        </Card>

        {/* Drop zone */}
        <Card
          padding={6}
          radius={3}
          tone={isDragOver ? "primary" : "transparent"}
          border
          style={{
            borderStyle: "dashed",
            borderWidth: 2,
            cursor: dropzoneDisabled ? "not-allowed" : "pointer",
            opacity: dropzoneDisabled ? 0.5 : 1,
            transition: "background-color 120ms ease, opacity 120ms ease",
          }}
          onClick={onPickFiles}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
        >
          <Stack space={3} style={{ textAlign: "center" }}>
            <Text size={2} weight="semibold">
              2. Drop images here to upload
            </Text>
            <Text size={1} muted>
              {dropzoneDisabled
                ? "Pick a tag above first."
                : "Drop a folder of images — or click to browse. Every image will be tagged automatically."}
            </Text>

            {upload.status === "uploading" && (
              <Flex justify="center">
                <Text size={1} weight="medium">
                  Uploading & tagging {upload.completed} of {upload.total}…
                </Text>
              </Flex>
            )}

            {upload.status === "done" && (
              <Stack space={2}>
                <Flex justify="center" gap={2}>
                  <Badge tone="positive">
                    Uploaded {upload.completed} image
                    {upload.completed === 1 ? "" : "s"}
                  </Badge>
                  {upload.errors.length > 0 && (
                    <Badge tone="critical">
                      {upload.errors.length} failed
                    </Badge>
                  )}
                </Flex>
                {upload.errors.length > 0 && (
                  <Box>
                    <Text size={0} style={{ color: "var(--card-badge-critical-fg)" }}>
                      {upload.errors.join("; ")}
                    </Text>
                  </Box>
                )}
                <Flex justify="center">
                  <Button
                    mode="ghost"
                    tone="primary"
                    text="Upload another batch"
                    onClick={(event) => {
                      event.stopPropagation();
                      resetForAnotherBatch();
                    }}
                  />
                </Flex>
              </Stack>
            )}
          </Stack>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={onFileInputChange}
          />
        </Card>
      </Stack>
    </Container>
  );
}
