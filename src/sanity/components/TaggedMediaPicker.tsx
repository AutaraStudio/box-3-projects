/**
 * TaggedMediaPicker
 * =================
 * Custom input for single-value image fields. Adds a "Pick from
 * library" button above the default image input. The button opens
 * a dialog where the client picks a tag (from the `sanity-plugin-media`
 * tag system) and clicks an image thumbnail to set the field.
 *
 * Twin of TaggedMediaArrayPicker (which is multi-select for arrays).
 * This one is single-select for individual image fields like
 * featuredImage, teamMember.image, and homePage.heroImage.
 *
 * The native image input (upload + Select) still works underneath —
 * this is purely an additional convenience button.
 *
 * Usage:
 *
 *   defineField({
 *     name: "heroImage",
 *     type: "image",
 *     components: { input: TaggedMediaPicker },
 *   })
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import imageUrlBuilder from "@sanity/image-url";
import {
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
  type ObjectInputProps,
  set,
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function TaggedMediaPicker(props: ObjectInputProps<any>) {
  const { onChange, renderDefault } = props;
  const client = useClient({ apiVersion: "2024-06-01" });
  const builder = useMemo(() => imageUrlBuilder(client), [client]);

  const [open, setOpen] = useState(false);

  const [tags, setTags] = useState<MediaTag[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState<string>("");

  const [assets, setAssets] = useState<LibraryAsset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);

  /* Load tags when the dialog opens. */
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

  /* Load assets when the chosen tag changes. */
  useEffect(() => {
    if (!open || !selectedTagId) return;

    let cancelled = false;
    setLoadingAssets(true);
    setAssets([]);

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

  const handleSelectAsset = (assetId: string) => {
    onChange([
      setIfMissing({ _type: "image" }),
      set({ _type: "reference", _ref: assetId }, ["asset"]),
    ]);
    setOpen(false);
  };

  return (
    <Stack space={3}>
      <Flex gap={2}>
        <Button
          mode="ghost"
          tone="primary"
          text="Pick from library"
          onClick={() => setOpen(true)}
        />
      </Flex>

      {renderDefault(props)}

      {open && (
        <Dialog
          id="tagged-media-picker"
          header="Pick an image by tag"
          onClose={() => setOpen(false)}
          width={2}
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
                      {assets.map((asset) => (
                        <Card
                          key={asset.assetId}
                          padding={0}
                          radius={2}
                          shadow={1}
                          style={{
                            cursor: "pointer",
                            overflow: "hidden",
                          }}
                          onClick={() => handleSelectAsset(asset.assetId)}
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
                            }}
                          />
                        </Card>
                      ))}
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
