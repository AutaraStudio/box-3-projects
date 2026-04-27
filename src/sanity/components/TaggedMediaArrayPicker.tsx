/**
 * TaggedMediaArrayPicker
 * ======================
 * Custom input for image array fields. Adds a "Pick multiple from
 * library" button above the default array UI. The button opens a
 * dialog where the client picks a tag (from the `sanity-plugin-media`
 * tag system) and selects multiple images at once — a one-shot
 * workaround for Sanity's native "add items one at a time" limitation.
 *
 * This does NOT replace the native array UI. Single-pick and direct
 * upload still work via the standard "Add item" button below.
 *
 * Usage:
 *
 *   defineField({
 *     name: "additionalImages",
 *     type: "array",
 *     of: [{ type: "image", fields: [alt] }],
 *     components: { input: TaggedMediaArrayPicker },
 *   })
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import imageUrlBuilder from "@sanity/image-url";
import {
  Badge,
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  Grid,
  Select,
  Spinner,
  Stack,
  Text,
} from "@sanity/ui";
import {
  type ArrayOfObjectsInputProps,
  insert,
  setIfMissing,
  useClient,
} from "sanity";

type MediaTag = {
  _id: string;
  name: string;
};

type LibraryAsset = {
  assetId: string;
  originalFilename?: string;
};

/** Random URL-safe key matching Sanity's `_key` convention. */
function randomKey(length = 12): string {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return out;
}

export function TaggedMediaArrayPicker(props: ArrayOfObjectsInputProps) {
  const { onChange, renderDefault } = props;
  const client = useClient({ apiVersion: "2024-06-01" });
  const builder = useMemo(() => imageUrlBuilder(client), [client]);

  const [open, setOpen] = useState(false);

  const [tags, setTags] = useState<MediaTag[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState<string>("");

  const [assets, setAssets] = useState<LibraryAsset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);

  const [selectedAssetIds, setSelectedAssetIds] = useState<Set<string>>(
    new Set(),
  );

  /* Load tags once the dialog opens. */
  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setLoadingTags(true);
    client
      .fetch<MediaTag[]>(
        `*[_type == "media.tag"]{ _id, "name": name.current } | order(name asc)`,
      )
      .then((data) => {
        if (cancelled) return;
        setTags(data);
        if (data.length && !selectedTagId) {
          setSelectedTagId(data[0]._id);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingTags(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, client, selectedTagId]);

  /* Load assets whenever the chosen tag changes. */
  useEffect(() => {
    if (!open || !selectedTagId) return;

    let cancelled = false;
    setLoadingAssets(true);
    setAssets([]);
    setSelectedAssetIds(new Set());

    client
      .fetch<LibraryAsset[]>(
        `*[_type == "sanity.imageAsset" && references($tagId)]{
          "assetId": _id,
          originalFilename
        } | order(originalFilename asc)`,
        { tagId: selectedTagId },
      )
      .then((data) => {
        if (cancelled) return;
        setAssets(data);
      })
      .finally(() => {
        if (!cancelled) setLoadingAssets(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, client, selectedTagId]);

  const toggleAsset = (assetId: string) => {
    setSelectedAssetIds((prev) => {
      const next = new Set(prev);
      if (next.has(assetId)) next.delete(assetId);
      else next.add(assetId);
      return next;
    });
  };

  const selectAllInTag = () => {
    setSelectedAssetIds(new Set(assets.map((a) => a.assetId)));
  };

  const clearSelection = () => setSelectedAssetIds(new Set());

  const commitSelection = () => {
    if (selectedAssetIds.size === 0) {
      setOpen(false);
      return;
    }

    const newItems = Array.from(selectedAssetIds).map((assetId) => ({
      _type: "image",
      _key: randomKey(),
      asset: { _type: "reference", _ref: assetId },
    }));

    onChange([setIfMissing([]), insert(newItems, "after", [-1])]);

    /* Reset and close. */
    setSelectedAssetIds(new Set());
    setOpen(false);
  };

  return (
    <Stack space={3}>
      <Flex gap={2}>
        <Button
          mode="default"
          tone="primary"
          text="Pick multiple from library"
          onClick={() => setOpen(true)}
        />
      </Flex>

      {renderDefault(props)}

      {open && (
        <Dialog
          id="tagged-media-array-picker"
          header="Pick multiple images by tag"
          onClose={() => setOpen(false)}
          width={2}
          footer={
            <Flex justify="space-between" align="center" padding={3} gap={3}>
              <Flex align="center" gap={2}>
                <Badge tone="primary">
                  {selectedAssetIds.size} selected
                </Badge>
                {selectedAssetIds.size > 0 && (
                  <Button
                    mode="bleed"
                    text="Clear"
                    onClick={clearSelection}
                  />
                )}
              </Flex>
              <Flex gap={2}>
                <Button
                  mode="ghost"
                  text="Cancel"
                  onClick={() => setOpen(false)}
                />
                <Button
                  tone="primary"
                  text={`Add ${selectedAssetIds.size} image${
                    selectedAssetIds.size === 1 ? "" : "s"
                  }`}
                  disabled={selectedAssetIds.size === 0}
                  onClick={commitSelection}
                />
              </Flex>
            </Flex>
          }
        >
          <Box padding={4}>
            <Stack space={4}>
              {loadingTags && (
                <Flex justify="center" padding={4}>
                  <Spinner />
                </Flex>
              )}

              {!loadingTags && tags.length === 0 && (
                <Text muted>
                  No tags found in the Media library yet. Tag some
                  images first via the Media tab or the Bulk Upload
                  tool.
                </Text>
              )}

              {!loadingTags && tags.length > 0 && (
                <>
                  <Flex gap={3} align="flex-end" wrap="wrap">
                    <Box flex={1}>
                      <Stack space={2}>
                        <Text size={1} weight="medium">
                          Tag
                        </Text>
                        <Select
                          value={selectedTagId}
                          onChange={(event) =>
                            setSelectedTagId(event.currentTarget.value)
                          }
                        >
                          {tags.map((tag) => (
                            <option key={tag._id} value={tag._id}>
                              {tag.name}
                            </option>
                          ))}
                        </Select>
                      </Stack>
                    </Box>
                    {assets.length > 0 && (
                      <Button
                        mode="ghost"
                        text="Select all"
                        onClick={selectAllInTag}
                      />
                    )}
                  </Flex>

                  {loadingAssets && (
                    <Flex justify="center" padding={4}>
                      <Spinner />
                    </Flex>
                  )}

                  {!loadingAssets && assets.length === 0 && (
                    <Text muted>No images have this tag yet.</Text>
                  )}

                  {!loadingAssets && assets.length > 0 && (
                    <Grid columns={[2, 3, 4, 5]} gap={3}>
                      {assets.map((asset) => {
                        const isSelected = selectedAssetIds.has(
                          asset.assetId,
                        );
                        return (
                          <Card
                            key={asset.assetId}
                            padding={0}
                            radius={2}
                            shadow={isSelected ? 3 : 1}
                            tone={isSelected ? "primary" : "default"}
                            style={{
                              cursor: "pointer",
                              overflow: "hidden",
                              outline: isSelected
                                ? "3px solid var(--card-focus-ring-color)"
                                : "none",
                              outlineOffset: "-3px",
                            }}
                            onClick={() => toggleAsset(asset.assetId)}
                          >
                            <img
                              src={builder
                                .image(asset.assetId)
                                .width(400)
                                .height(400)
                                .fit("crop")
                                .url()}
                              alt={asset.originalFilename ?? ""}
                              style={{
                                display: "block",
                                width: "100%",
                                aspectRatio: "1 / 1",
                                objectFit: "cover",
                                opacity: isSelected ? 0.85 : 1,
                              }}
                            />
                          </Card>
                        );
                      })}
                    </Grid>
                  )}
                </>
              )}
            </Stack>
          </Box>
        </Dialog>
      )}
    </Stack>
  );
}
