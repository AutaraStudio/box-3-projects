/**
 * Banner Showroom Schema
 * ======================
 * Singleton document for the "Showroom" banner — a sticky 200svh
 * section with a background video behind an editorial heading +
 * address + CTA, which the user can click to open a fullscreen
 * video player.
 *
 * Two video URLs are stored: one for the ambient looping background
 * (muted, auto-playing) and one for the featured fullscreen play
 * (with sound + controls). Client can paste direct MP4 URLs from
 * their video host (Vimeo's progressive_redirect, Cloudflare
 * Stream, S3, etc.) — Studio uploads for video aren't ideal at
 * this size.
 */

import { defineField, defineType } from "sanity";

export default defineType({
  name: "bannerShowroom",
  title: "Showroom Banner Section",
  type: "document",
  groups: [
    { name: "label", title: "Section Label", default: true },
    { name: "copy", title: "Copy" },
    { name: "video", title: "Video" },
  ],
  fields: [
    defineField({
      name: "sectionLabel",
      title: "Section label",
      description:
        'Small uppercase label at the top of the section, e.g. "Showroom".',
      type: "string",
      group: "label",
      validation: (rule) => rule.required(),
    }),

    /* ── Copy ─────────────────────────────────────────────── */
    defineField({
      name: "heading",
      title: "Heading",
      description:
        "Two-line editorial headline. Use a real line break (Shift + Enter) to control where the line wraps.",
      type: "text",
      rows: 2,
      group: "copy",
      validation: (rule) => rule.required(),
    }),

    /* ── Video ────────────────────────────────────────────── */
    defineField({
      name: "cursorLabel",
      title: "Cursor label",
      description:
        'Text shown inside the pink cursor chip when the user hovers the background video, e.g. "Play".',
      type: "string",
      group: "video",
      initialValue: "Play",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "backgroundVideoUrl",
      title: "Background video (direct MP4 URL)",
      description:
        "Direct MP4 URL for the ambient muted looping background video. Paste the progressive_redirect / direct file link from your video host (Vimeo, Cloudflare Stream, S3, etc.).",
      type: "url",
      group: "video",
      validation: (rule) =>
        rule.uri({ scheme: ["https", "http"], allowRelative: false }),
    }),
    defineField({
      name: "modalVideoUrl",
      title: "Fullscreen video (direct MP4 URL)",
      description:
        "Direct MP4 URL for the featured fullscreen video opened when the background is clicked. Same format as above.",
      type: "url",
      group: "video",
      validation: (rule) =>
        rule.uri({ scheme: ["https", "http"], allowRelative: false }),
    }),
  ],
  preview: {
    select: { title: "sectionLabel", subtitle: "heading" },
    prepare: ({ title, subtitle }) => ({
      title: "Showroom Banner Section",
      subtitle: title || subtitle,
    }),
  },
});
