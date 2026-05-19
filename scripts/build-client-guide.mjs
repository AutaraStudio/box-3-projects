/**
 * Client editing guide — generates a Word doc walkthrough of
 * every editable surface in the Box 3 Sanity Studio.
 *
 * Usage:  node ./scripts/build-client-guide.mjs
 * Output: ./box-3-sanity-editing-guide.docx
 */

import fs from "node:fs";
import path from "node:path";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  LevelFormat,
  AlignmentType,
  ExternalHyperlink,
  PageBreak,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  BorderStyle,
} from "docx";

/* ── Video walkthrough URLs ──────────────────────────────────
   Paste the URL of each screen recording here and re-run the
   generator — the matching callout in the doc picks it up. Leave
   blank ("") and the callout renders with "Link coming soon" so the
   page still reads cleanly while you're still recording. */

const VIDEOS = {
  /* Step 3 of Getting started — short first-login + studio tour. */
  firstLogin: "",
  /* Editing & publishing — the click-edit-publish flow end to end. */
  publishFlow: "",
  /* Media library — bulk upload, tag, then pick from library on a
     document. The single most-asked-about workflow. */
  mediaWorkflow: "",
  /* Projects collection — drag rows to set the order on the site. */
  projectOrder: "",
  /* Tips & gotchas — setting an image hotspot so crops look right. */
  hotspotCropping: "",
  /* Tips & gotchas — rolling back to a previous published version. */
  versionRollback: "",
};

/* ── Style helpers ──────────────────────────────────────────── */

const BLUE = "2E75B6";
const GREEN = "2F7D49";
const GREY = "555555";
const LIGHT = "F4F1EE";
const VIDEO_BG = "EAF4ED";

const h = (text, level) =>
  new Paragraph({
    heading: level,
    children: [new TextRun({ text, font: "Arial" })],
  });

const p = (...runs) =>
  new Paragraph({
    spacing: { after: 120 },
    children: runs.map((r) =>
      typeof r === "string" ? new TextRun({ text: r, font: "Arial" }) : r,
    ),
  });

const lead = (text) =>
  new Paragraph({
    spacing: { after: 200 },
    children: [
      new TextRun({ text, font: "Arial", size: 26, color: GREY }),
    ],
  });

const bullet = (...runs) =>
  new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { after: 80 },
    children: runs.map((r) =>
      typeof r === "string" ? new TextRun({ text: r, font: "Arial" }) : r,
    ),
  });

const subBullet = (...runs) =>
  new Paragraph({
    numbering: { reference: "bullets", level: 1 },
    spacing: { after: 60 },
    children: runs.map((r) =>
      typeof r === "string" ? new TextRun({ text: r, font: "Arial" }) : r,
    ),
  });

const numbered = (...runs) =>
  new Paragraph({
    numbering: { reference: "numbers", level: 0 },
    spacing: { after: 80 },
    children: runs.map((r) =>
      typeof r === "string" ? new TextRun({ text: r, font: "Arial" }) : r,
    ),
  });

const bold = (text) =>
  new TextRun({ text, font: "Arial", bold: true });

const code = (text) =>
  new TextRun({
    text,
    font: "Consolas",
    size: 20,
    shading: { type: ShadingType.CLEAR, fill: LIGHT },
  });

const link = (text, url) =>
  new ExternalHyperlink({
    link: url,
    children: [
      new TextRun({
        text,
        font: "Arial",
        color: BLUE,
        underline: {},
      }),
    ],
  });

const callout = (label, body) => {
  const border = { style: BorderStyle.SINGLE, size: 6, color: BLUE };
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: { top: border, bottom: border, left: border, right: border },
            shading: { fill: LIGHT, type: ShadingType.CLEAR },
            margins: { top: 120, bottom: 120, left: 200, right: 200 },
            width: { size: 9360, type: WidthType.DXA },
            children: [
              new Paragraph({
                spacing: { after: 80 },
                children: [
                  new TextRun({
                    text: label,
                    font: "Arial",
                    bold: true,
                    color: BLUE,
                    size: 22,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun({ text: body, font: "Arial" })],
              }),
            ],
          }),
        ],
      }),
    ],
  });
};

/* Video-walkthrough callout — a slim green-edged block that points
   the reader at a short screen recording. If the URL is empty, we
   render a "Link coming soon" hint so the doc still reads cleanly
   while videos are still being recorded. */
const videoCallout = (label, body, url) => {
  const border = { style: BorderStyle.SINGLE, size: 6, color: GREEN };
  const heading = new Paragraph({
    spacing: { after: 80 },
    children: [
      new TextRun({
        text: `▶  ${label}`,
        font: "Arial",
        bold: true,
        color: GREEN,
        size: 22,
      }),
    ],
  });
  const bodyChildren = [new TextRun({ text: body, font: "Arial" })];
  if (url) {
    bodyChildren.push(new TextRun({ text: "  ", font: "Arial" }));
    bodyChildren.push(
      new ExternalHyperlink({
        link: url,
        children: [
          new TextRun({
            text: "Watch →",
            font: "Arial",
            bold: true,
            color: BLUE,
            underline: {},
          }),
        ],
      }),
    );
  } else {
    bodyChildren.push(
      new TextRun({
        text: "  (Video link coming soon — your studio team will send it.)",
        font: "Arial",
        italics: true,
        color: GREY,
      }),
    );
  }
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: { top: border, bottom: border, left: border, right: border },
            shading: { fill: VIDEO_BG, type: ShadingType.CLEAR },
            margins: { top: 120, bottom: 120, left: 200, right: 200 },
            width: { size: 9360, type: WidthType.DXA },
            children: [heading, new Paragraph({ children: bodyChildren })],
          }),
        ],
      }),
    ],
  });
};

const spacer = () =>
  new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: "" })] });

const pageBreak = () =>
  new Paragraph({ children: [new PageBreak()] });

/* ── Field documentation helper ──────────────────────────────
   Renders a field as: bold name + plain description, indented. */

const field = (name, description, note) => {
  const children = [
    new TextRun({ text: name, font: "Arial", bold: true }),
    new TextRun({ text: " — ", font: "Arial" }),
    new TextRun({ text: description, font: "Arial" }),
  ];
  if (note) {
    children.push(new TextRun({ text: " ", font: "Arial" }));
    children.push(
      new TextRun({
        text: note,
        font: "Arial",
        italics: true,
        color: GREY,
      }),
    );
  }
  return new Paragraph({
    numbering: { reference: "fields", level: 0 },
    spacing: { after: 100 },
    children,
  });
};

/* ── Content blocks ─────────────────────────────────────────── */

const cover = [
  new Paragraph({
    spacing: { before: 1800, after: 300 },
    alignment: AlignmentType.LEFT,
    children: [
      new TextRun({
        text: "Box 3 Projects",
        font: "Arial",
        size: 60,
        bold: true,
      }),
    ],
  }),
  new Paragraph({
    spacing: { after: 240 },
    children: [
      new TextRun({
        text: "Sanity Studio — editing guide",
        font: "Arial",
        size: 36,
        color: GREY,
      }),
    ],
  }),
  new Paragraph({
    spacing: { after: 800 },
    children: [
      new TextRun({
        text:
          "How to log in, edit content, upload images, and publish changes to box3projects.co.uk.",
        font: "Arial",
        size: 24,
        color: GREY,
      }),
    ],
  }),
  pageBreak(),
];

/* Section: Getting started */
const gettingStarted = [
  h("Getting started", HeadingLevel.HEADING_1),
  lead(
    "A short walkthrough so you can log in for the first time. Five minutes, then you're ready to edit.",
  ),

  h("Step 1 — Accept the invite", HeadingLevel.HEADING_2),
  numbered(
    "Open the email invitation from Sanity (it'll come from ",
    code("noreply@sanity.io"),
    ") and click ",
    bold("Accept invite"),
    ".",
  ),
  numbered(
    "Create your Sanity account. You can sign up with Google or with an email + password — whichever you prefer.",
  ),
  numbered(
    "Once you're in, you'll be added to the Box 3 Projects workspace as an editor.",
  ),

  h("Step 2 — Open the studio", HeadingLevel.HEADING_2),
  p(
    "The studio lives at this URL — bookmark it:",
  ),
  p(link("https://box-3-staging.netlify.app/studio", "https://box-3-staging.netlify.app/studio")),
  p(
    "If you're not signed in, the studio will prompt you. Use the same account you set up in Step 1.",
  ),

  h("Step 3 — Look around", HeadingLevel.HEADING_2),
  p(
    "Once you're in, you'll see a sidebar on the left with everything you can edit, and the document you click into opens on the right. Don't worry about clicking anything in here — nothing saves until you press ",
    bold("Publish"),
    ".",
  ),

  callout(
    "Drafts vs Published",
    "Every change you make is saved to a draft automatically. The live site doesn't update until you click the green Publish button at the bottom of the document. So you can edit freely and only publish when you're ready.",
  ),

  spacer(),
  videoCallout(
    "Video — first login + studio tour",
    "A 2-minute walkthrough showing how to sign in and the basics of where everything lives.",
    VIDEOS.firstLogin,
  ),

  pageBreak(),
];

/* Section: Studio overview */
const studioOverview = [
  h("How the studio is organised", HeadingLevel.HEADING_1),
  lead(
    "The sidebar groups everything into four areas. Here's what each one is for.",
  ),

  h("Site Settings", HeadingLevel.HEADING_2),
  p(
    "Site-wide stuff that appears on every page — brand name, header / footer links, contact info, default SEO, and every UI label across the site (button text, section titles, accessibility labels). You probably won't touch this often, but everything is editable.",
  ),

  h("Pages", HeadingLevel.HEADING_2),
  p(
    "One document per page on the site. Each page has tabs at the top of the editor (Hero, Intro, etc.) so you don't have to scroll past unrelated fields. Pages include:",
  ),
  bullet("Home Page"),
  bullet("About Page"),
  bullet("Services Page"),
  bullet("Projects Page (the listing — actual projects live in Collections)"),
  bullet("Careers Page"),
  bullet("Sustainability Page"),
  bullet("Contact Page"),
  bullet("Legal Pages (Privacy, Terms — you can add more)"),

  h("Collections", HeadingLevel.HEADING_2),
  p(
    "Repeatable content. Each collection is a list — add as many entries as you like, re-order, or hide individual entries.",
  ),
  bullet(bold("Projects"), " — every project case study"),
  bullet(bold("Project Categories"), " — used to filter projects (Cat A / Cat B / Hospitality, etc.)"),
  bullet(bold("Expertise"), " — disciplines listed on project pages"),
  bullet(bold("Team Members"), " — everyone shown on the About page"),
  bullet(bold("Partners"), " — the marquee logos"),
  bullet(bold("Testimonials"), " — client quotes used across the site"),
  bullet(bold("Vacancies"), " — open roles on the Careers page"),

  callout(
    "Tip — searching",
    "Use Cmd/Ctrl + K to jump to any document by name. Quicker than scrolling the sidebar once you have a lot of entries.",
  ),

  pageBreak(),
];

/* Section: Publishing workflow */
const publishing = [
  h("Editing & publishing", HeadingLevel.HEADING_1),
  lead("How to safely make a change and push it live."),

  h("The publish flow", HeadingLevel.HEADING_2),
  numbered("Click any document in the sidebar to open it."),
  numbered(
    "Make your changes. The studio auto-saves as you type — you'll see ",
    bold("Saved just now"),
    " at the bottom.",
  ),
  numbered(
    "When you're ready, click the green ",
    bold("Publish"),
    " button at the bottom of the document. The live site picks up the change within a minute or so.",
  ),
  numbered(
    "If you change your mind before publishing, click the three dots next to ",
    bold("Publish"),
    " and choose ",
    bold("Discard changes"),
    " to revert to the live version.",
  ),

  h("Reverting a published change", HeadingLevel.HEADING_2),
  p(
    "Sanity keeps every previous version. To roll back, open the document, click the clock icon in the top right, pick a previous version, and click ",
    bold("Restore"),
    ". That becomes the new draft — publish it like any other change.",
  ),

  h("Required fields", HeadingLevel.HEADING_2),
  p(
    "Some fields have a red asterisk — those are required. The studio won't let you publish a document with empty required fields. If publish is greyed out, look for a red error at the top of the document and fill in whatever's missing.",
  ),

  callout(
    "Yellow vs red warnings",
    "A yellow box means the studio doesn't recognise a field — usually because it was renamed or removed in an update. You can safely ignore it (or remove the field). A red box means there's a real validation error you need to fix before publishing.",
  ),

  spacer(),
  videoCallout(
    "Video — your first edit, end to end",
    "Open a document, change a heading, publish it, check the live site. Shows you the safe loop you'll use for every change.",
    VIDEOS.publishFlow,
  ),

  pageBreak(),
];

/* Section: Media library */
const mediaLibrary = [
  h("Media library", HeadingLevel.HEADING_1),
  lead(
    "How to upload images, tag them so they're easy to find, and pick them on a document.",
  ),

  h("Where the media lives", HeadingLevel.HEADING_2),
  p(
    "There's a ",
    bold("Media"),
    " tool in the top navigation of the studio. Click it to open the full library — every image ever uploaded to the site lives here.",
  ),

  h("Recommended workflow — bulk upload first, tag, then pick", HeadingLevel.HEADING_2),
  p(
    "This is the workflow we recommend for everything — projects, team photos, hero images. Doing it in this order saves a huge amount of time vs uploading inside each individual document.",
  ),
  numbered(
    bold("Open the Bulk Upload tool"),
    " in the top navigation of the studio.",
  ),
  numbered(
    bold("Pick — or create — a tag first"),
    ". Use the project name for project images (",
    code("carlton-gardens"),
    ", ",
    code("tower-42"),
    "), or a generic group for team photos (",
    code("team-members"),
    "). Tags are lowercase + hyphens.",
  ),
  numbered(
    bold("Drop in all the images at once"),
    ". The tool uploads in batches and applies the tag to every image automatically.",
  ),
  numbered(
    bold("Open the document you want to use them on"),
    " — say, a Project. Click the image field and choose ",
    bold("Pick from library"),
    ".",
  ),
  numbered(
    "The library opens already filtered to images with that tag, so you only see the ones you just uploaded. Pick the cover image, then come back and pick again for additional images, etc.",
  ),
  callout(
    "Why this is better than uploading inside the document",
    "Uploading inside a document attaches the image to that document only. If you later want to use the same shot somewhere else, you'd have to upload it again. Tagged images in the library are reusable, searchable, and never duplicated.",
  ),

  spacer(),
  videoCallout(
    "Video — bulk upload, tag, and pick from library",
    "The full workflow with a real folder of project photos: tag → drop → open the document → Pick from library.",
    VIDEOS.mediaWorkflow,
  ),

  h("Tag naming conventions", HeadingLevel.HEADING_3),
  bullet(bold("Project images"), " — use the project's slug, e.g. ", code("carlton-gardens"), ", ", code("tower-42")),
  bullet(bold("Team photos"), " — ", code("team-members")),
  bullet(bold("Page heroes"), " — ", code("home-hero"), ", ", code("about-hero"), ", ", code("careers-hero")),
  bullet(bold("Partner logos"), " — ", code("partner-logos")),
  bullet(bold("Misc / lifestyle"), " — ", code("studio"), ", ", code("site-photos")),

  h("Uploading new images", HeadingLevel.HEADING_2),
  p(
    "Two ways to upload:",
  ),
  numbered(
    bold("Bulk upload (recommended)"),
    " — there's a ",
    bold("Bulk Upload"),
    " tool in the top nav. Pick a tag first (e.g. ",
    code("carlton-gardens"),
    ", ",
    code("team-members"),
    "), drop your images in, and they're all uploaded with that tag attached. Use this for batches.",
  ),
  numbered(
    bold("Direct upload"),
    " — open the Media tool, drag images in. You'll need to add tags afterwards by clicking each image and editing its tags.",
  ),

  h("Tags — how they work", HeadingLevel.HEADING_2),
  p(
    "Tags are how the site finds the right images for the right places. They're lowercase, hyphenated keywords (",
    code("carlton-gardens"),
    ", ",
    code("team-members"),
    ", ",
    code("hero-images"),
    "). Pick a tag based on what the image is for or where it'll be used.",
  ),
  p(
    "When you're picking an image on a document — say, the hero image on the home page — you'll see a ",
    bold("Pick from library"),
    " button above the upload box. Clicking it filters the library to images with the matching tag, so you're not scrolling through everything.",
  ),
  p(
    "If a tag doesn't exist yet, you can create it on the fly when you tag an image.",
  ),

  callout(
    "Image sizing",
    "You don't need to resize images before uploading — Sanity auto-resizes for every breakpoint. But please don't upload anything bigger than ~5MB; smaller files = faster page loads. JPG or PNG both work fine. Aim for ~1600–2400px on the long edge for hero images.",
  ),

  h("Re-using an image elsewhere", HeadingLevel.HEADING_2),
  p(
    "When you pick an image for a document, it's a reference — the actual image lives in the library. So you can use the same image on multiple pages, and editing it once updates everywhere.",
  ),

  h("Deleting images", HeadingLevel.HEADING_2),
  p(
    "Open Media, click the image, click ",
    bold("Delete"),
    ". The studio will warn you if it's used somewhere. Only delete images that aren't referenced — otherwise the page using it will show a broken image.",
  ),

  pageBreak(),
];

/* Section: Site Settings */
const siteSettings = [
  h("Site Settings — every field", HeadingLevel.HEADING_1),
  lead(
    "Site-wide content used on every page. Organised into tabs at the top of the document.",
  ),

  h("Coming soon (site-wide kill switch)", HeadingLevel.HEADING_2),
  p(
    "Sits at the top of Site Settings. When ON, every page on the site — home, about, projects, careers, contact, legal, all of it — is replaced by the holding message. Useful for pre-launch holds or unscheduled maintenance. Turn OFF to bring the full site back.",
  ),
  field("Show coming-soon page", "Toggle. ON = every page renders the holding message only. OFF = normal site.", "Untick once you're live."),
  field("Holding heading", "The big editorial line, e.g. \"Site updating.\" Optional — defaults to a sensible value if blank."),
  field("Holding message", "Supporting paragraph beneath the heading."),
  callout(
    "What gets hidden",
    "Header, footer, side menu, and the preloader are all skipped while the kill switch is ON — visitors only see the holding page no matter which URL they typed.",
  ),

  h("Brand", HeadingLevel.HEADING_2),
  field("Brand name", "Used as the home logo's accessible name and in the footer copyright. Usually \"Box 3 Projects\".", "Don't change unless the brand renames."),

  h("Header", HeadingLevel.HEADING_2),
  callout(
    "How a link field works",
    "Every link field on the site (nav items, footer columns, CTAs, buttons) shares the same shape: a Label, then either an Internal page dropdown (Home / About / Services / etc.) or a Custom link text field for external URLs (https://…), email (mailto:…), phone (tel:…), or in-page anchors (#process). Use the dropdown for site pages — no need to type the slug. The Custom link field is only for things outside the dropdown. If both are set, the dropdown wins. There's also an optional Transition label shown briefly during the page-transition wipe.",
  ),
  field("Primary nav links", "First column of nav links beside the logo. Up to 6 entries."),
  field("Secondary nav links", "Second column of nav links — typically Careers / Contact. Up to 4 entries."),
  field("Side menu — primary links", "The big editorial links at the top of the slide-in side menu (Home / About / Projects)."),
  field("Side menu — \"More\" links", "Smaller links beneath the primary list inside the side menu."),

  h("Footer", HeadingLevel.HEADING_2),
  field("Footer — Pages column", "Links shown under the Pages heading."),
  field("Footer — Social column", "External links (Instagram, LinkedIn). Use full URLs starting with https://."),
  field("Footer — Legal column", "Privacy / Terms links."),

  h("Partners marquee", HeadingLevel.HEADING_2),
  p("The full-bleed band of partner logos at the foot of every page. Heading sits here; logos are managed via the Partners collection (drag to reorder)."),
  field("Marquee heading", "Heading shown above the marquee, e.g. \"Trusted By\". Default \"Trusted By\"."),

  h("Contact info", HeadingLevel.HEADING_2),
  p("Used in the footer and the side menu's \"Stay in touch\" block."),
  field("Address", "One entry per visual line. e.g. \"Level 5, 55 Broadway,\" then \"London SW1H 0BD.\""),
  field("Email", "Public contact email."),
  field("Phone (display)", "How the number reads on screen, with spaces — e.g. \"+44 (0)20 8050 7815\"."),
  field("Phone (tel: link)", "The dial-able version when someone taps the number on a phone. Format: tel:02080507815 (no spaces, with the tel: prefix)."),

  h("UI labels — Header", HeadingLevel.HEADING_2),
  p("Text on the header's Menu button and the contact icon's accessible name. Won't usually need editing."),
  field("Menu button (closed state)", "Text shown when the side menu is closed. Default \"Menu\"."),
  field("Menu button (open state)", "Text when the menu is open. Default \"Close\"."),
  field("Menu button — open description", "Screen-reader text. Default \"Open menu\"."),
  field("Menu button — close description", "Screen-reader text. Default \"Close menu\"."),
  field("Contact icon — description", "Screen-reader text for the icon-only contact button. Default \"Go to contact page\"."),

  h("UI labels — Side menu", HeadingLevel.HEADING_2),
  field("Secondary links section title", "Heading above the smaller link list. Default \"More\"."),
  field("Contact section title", "Heading above the address / phone / email block. Default \"Stay in touch\"."),
  field("Form — Name field label", "Default \"Name\"."),
  field("Form — Email field label", "Default \"Email\"."),
  field("Form — Message field label", "Default \"Message\"."),
  field("Form — Submit button label", "Default \"Submit\"."),
  field("Form — sent confirmation", "Replaces the submit button after sending. Default \"Thanks — we'll be in touch\"."),
  field("Menu wrapper description", "Screen-reader name for the slide-in menu. Default \"Site menu\"."),
  field("Click-out scrim description", "Screen-reader label on the dim overlay used to close the menu. Default \"Close menu\"."),

  h("UI labels — Footer column titles", HeadingLevel.HEADING_2),
  field("Pages column heading", "Default \"Pages\"."),
  field("Featured projects column heading", "Default \"Featured Projects\"."),
  field("Contact column heading", "Default \"Contact\"."),
  field("Social column heading", "Default \"Social\"."),
  field("Legal column heading", "Default \"Legal\"."),

  h("UI labels — Project detail", HeadingLevel.HEADING_2),
  p("These appear on every project page. Edit once, applies everywhere."),
  field("Location stat label", "Default \"Location\"."),
  field("Year stat label", "Default \"Year\"."),
  field("Expertise list heading", "Default \"Expertise\"."),
  field("Team grid heading", "Default \"Project team\"."),
  field("Brief block heading", "Default \"Brief\"."),
  field("Objective block label", "Long version. Default \"Client objective\"."),
  field("Client feedback label", "Long version. Default \"Client feedback\"."),
  field("Objective accordion label", "Shorter version used in the right-column accordion. Default \"Objective\"."),
  field("Client feedback accordion label", "Default \"Client feedback\"."),
  field("Explore section heading", "The big heading above the lightbox CTA. Default \"Explore the project in pictures\"."),
  field("View gallery button label", "Default \"View gallery\"."),
  field("Lightbox open description", "Screen-reader label for the full-cover transparent button on the hero media."),
  field("Related projects heading", "Default \"More projects\"."),
  field("Lightbox — previous arrow description", "Default \"Previous image\"."),
  field("Lightbox — next arrow description", "Default \"Next image\"."),
  field("Lightbox close button label", "Default \"Close\"."),
  field("Lightbox close — description", "Screen-reader label. Default \"Close gallery\"."),

  h("UI labels — Legal pages", HeadingLevel.HEADING_2),
  field("\"Last updated\" label", "Default \"Last updated\"."),
  field("Table of contents description", "Screen-reader label. Default \"Table of contents\"."),

  h("UI labels — Testimonials", HeadingLevel.HEADING_2),
  field("Previous testimonial label", "Default \"Previous testimonial\"."),
  field("Next testimonial label", "Default \"Next testimonial\"."),

  h("SEO defaults", HeadingLevel.HEADING_2),
  p("Used when a page doesn't override its own SEO."),
  field("Default page title", "Browser tab title used as a fallback. e.g. \"Box 3 Projects\"."),
  field("Default meta description", "1–2 sentence summary used for search snippets and social previews when a page doesn't set its own. Keep under 180 characters."),
  field("Default share image", "Image used when the site URL is shared on social. 1200×630px recommended."),

  pageBreak(),
];

/* Section: Pages overview + each page */
const pagesIntro = [
  h("Pages — every page on the site", HeadingLevel.HEADING_1),
  lead(
    "Each page has its own document with tabs grouping its fields. Click into a tab and you'll only see fields for that section.",
  ),
];

const homePage = [
  h("Home Page", HeadingLevel.HEADING_2),
  p(
    "Tabs: Hero · About statement · Introducing · Services · Featured projects · Stats · Why Box 3 · Testimonials · Final CTA · SEO.",
  ),

  h("Hero", HeadingLevel.HEADING_3),
  field("Background media", "Radio — Video (default) or Image. The matching field below appears once you pick."),
  field("Hero video URL", "Direct link to the looping background video file (.mp4). Used when Background media is set to Video."),
  field("Hero image", "Full-bleed background photo used when Background media is set to Image."),
  field("Hero statement", "The big editorial line that opens the site."),
  field("Scroll-down label", "Text near the bottom prompting scroll. Default \"Scroll down\"."),
  field("Hero CTA button", "Label + link + page name for the button beneath the statement. Leave the label empty to hide it."),

  h("About statement", HeadingLevel.HEADING_3),
  field("Section label", "Small caps eyebrow. Default \"About\"."),
  field("Heading", "The long opening paragraph."),
  field("Body", "Supporting paragraph beneath the heading."),
  field("CTA", "Link out to /about."),

  h("Introducing", HeadingLevel.HEADING_3),
  field("Section label", "Small caps eyebrow."),
  field("Heading", "Display heading."),
  field("Body", "Multi-paragraph copy. Use a blank line to break paragraphs."),
  field("CTA", "Link out — typically to /services."),

  h("Services", HeadingLevel.HEADING_3),
  field("Section label", "Eyebrow above the services strip."),
  field("Heading", "Display heading for the services band."),
  field("Items", "Each service card — title + short description. Re-order by dragging."),

  h("Featured projects", HeadingLevel.HEADING_3),
  field("Section label", "Eyebrow above the strip. Default \"Featured\"."),
  field("Heading", "Display heading above the project cards."),
  p(
    "The project cards beneath are pulled automatically from the ",
    bold("Projects"),
    " collection — the first six in the list order are shown. To change which projects appear (or in what order), open Projects in the sidebar and drag rows up or down. See ",
    bold("Projects (collection) — display order"),
    " further down for the full how-to.",
  ),

  h("Stats", HeadingLevel.HEADING_3),
  field("Section label", "Eyebrow."),
  field("Heading", "Display heading."),
  field("Items", "Each stat: a value + supporting label + optional footnote. e.g. 90% / of new work comes from clients we've delivered for before / Repeat business, calendar year 2025."),

  h("Why Box 3", HeadingLevel.HEADING_3),
  field("Section label", "Eyebrow."),
  field("Items", "Reasons to choose Box 3 — title + body each."),

  h("Testimonials", HeadingLevel.HEADING_3),
  field("Testimonials list", "Pick which testimonial documents appear here. Order is preserved."),

  h("Final CTA", HeadingLevel.HEADING_3),
  field("Heading", "The big closing line — supports a line break."),
  field("Button", "Label + href + page name."),

  h("SEO", HeadingLevel.HEADING_3),
  field("Browser tab title", "What appears in the browser tab + Google."),
  field("Meta description", "1–2 sentences for search snippets. Under 180 chars."),
];

const aboutPage = [
  h("About Page", HeadingLevel.HEADING_2),
  p("Tabs: Hero · Intro · Team section · Team categories · Closing block · SEO."),

  h("Hero", HeadingLevel.HEADING_3),
  field("Hero title", "The big display heading at the top of the page."),
  field("Hero CTA", "Optional CTA pinned beside the title — label + link + page name. Often points to #team to anchor down to the team grid."),
  field("Hero image — left / centre / right", "Three-image scroll-driven hero (same pattern as Careers + Sustainability). The centre image expands from ~50% width to full-bleed as the user scrolls."),

  h("Intro", HeadingLevel.HEADING_3),
  field("Intro heading", "Display heading directly under the hero."),
  field("Intro body", "Multi-paragraph copy. Use a blank line between paragraphs."),

  h("Team section", HeadingLevel.HEADING_3),
  field("Section label", "Eyebrow above the team grid."),
  field("Section heading", "Big heading."),
  field("Section intro", "One-paragraph intro shown above the grid."),

  h("Team categories", HeadingLevel.HEADING_3),
  p(
    "Team members are grouped into categories on the page. Each row here matches a category slug used on a Team Member document.",
  ),
  field("Category groups", "Each entry is a slug + display title. Re-order by dragging — that's the order the categories appear on the page."),
  subBullet(bold("Slug"), " — lowercase + hyphens, must match exactly what's set on the Team Member doc (e.g. \"leadership\", \"site-team\")."),
  subBullet(bold("Display title"), " — the heading shown on the page (e.g. \"Leadership\")."),
  field("Uncategorised group title", "Fallback heading for team members whose category isn't listed above. Default \"Team\"."),

  h("Closing block", HeadingLevel.HEADING_3),
  field("Section label", "Eyebrow."),
  field("Heading", "Display heading."),
  field("Body", "Multi-paragraph copy."),
  field("CTA button", "Label + href + page name."),

  h("SEO", HeadingLevel.HEADING_3),
  field("Browser tab title", ""),
  field("Meta description", ""),
];

const servicesPage = [
  h("Services Page", HeadingLevel.HEADING_2),
  p("Tabs: Hero · Intro · Services list · Editorial block · Track record · Process timeline · SEO."),
  h("Hero", HeadingLevel.HEADING_3),
  field("Hero title", "Display heading."),
  field("Hero CTA", "Optional CTA — label + link + page name. Often a fragment href like #process to scroll to a section."),
  field("Hero image — left / centre / right", "Three-image scroll-driven hero (same pattern as About + Careers + Sustainability). The centre image expands from ~50% width to full-bleed as the user scrolls."),
  h("Intro", HeadingLevel.HEADING_3),
  field("Intro heading", "Display heading."),
  field("Intro body", "Multi-paragraph. Blank line between paragraphs."),
  h("Services list", HeadingLevel.HEADING_3),
  field("Services", "Each service — title + description. Drag to reorder."),
  field("CTA button", "Label + link + page name beneath the services list."),
  h("Editorial block", HeadingLevel.HEADING_3),
  field("Section label", "Eyebrow."),
  field("Heading", "Display heading."),
  field("Body", "Long-form paragraph copy."),
  field("Image", "Editorial photograph beside / below the body."),
  field("CTA button", "Optional — label + link + page name."),
  h("Track record", HeadingLevel.HEADING_3),
  field("Section label", "Eyebrow."),
  field("Heading", "Display heading."),
  field("Stats", "Up to 4 stat cards (value + label + optional footnote)."),
  h("Process timeline", HeadingLevel.HEADING_3),
  field("Section label", "Eyebrow."),
  field("Heading", "Display heading."),
  field("Steps", "Each step — title + body. Order matters; drag to reorder."),
  h("SEO", HeadingLevel.HEADING_3),
  field("Browser tab title", ""),
  field("Meta description", ""),
];

const projectsPage = [
  h("Projects Page (the archive)", HeadingLevel.HEADING_2),
  p(
    "This is the page at /projects. Just the hero — the cards beneath are pulled automatically from the Projects collection.",
  ),
  field("Section label", "Eyebrow above the heading. Default \"Selected projects\"."),
  field("Heading", "The big editorial heading. Default \"Designed, built, delivered.\"."),
  field("Photograph (revealed)", "The image revealed beneath the sketch on scroll. Wide landscape, ~16:9 reads best."),
  field("Sketch overlay", "A line-drawing sketch sitting on top of the photograph that wipes away on scroll. Transparent background reads best."),
  field("Browser tab title", ""),
  field("Meta description", ""),
];

const careersPage = [
  h("Careers Page", HeadingLevel.HEADING_2),
  p(
    "Tabs: Hero · Intro · Why work with us · Culture · Vacancies list · Speculative block · Apply modal · SEO.",
  ),

  h("Hero", HeadingLevel.HEADING_3),
  field("Hero title", "Display heading."),
  field("CTA label", "Default \"See opportunities\"."),
  field("CTA link", "e.g. #jobs to scroll to the vacancies list."),
  field("Hero left / centre / right images", "Three-image hero — centre is the one that grows."),

  h("Intro", HeadingLevel.HEADING_3),
  field("Intro heading", "Display heading directly under the hero."),
  field("Intro body", "Supporting paragraph."),

  h("Why work with us", HeadingLevel.HEADING_3),
  field("Section heading", "Eyebrow above the list."),
  field("Items", "Each — title + body."),
  field("Why-work-with-us CTA label", "Default \"See open roles →\"."),
  field("Why-work-with-us CTA link", "e.g. #jobs."),

  h("Culture", HeadingLevel.HEADING_3),
  field("Section label", "Default \"Culture\"."),
  field("Heading", "Display heading."),
  field("Body", "Multi-paragraph copy."),
  field("Image", "Editorial team / studio photograph."),
  field("CTA label", "Default \"Meet the team →\"."),
  field("CTA link", "e.g. /about."),
  field("CTA destination label", "Page name shown briefly during the page-transition. e.g. \"About\"."),

  h("Vacancies list", HeadingLevel.HEADING_3),
  field("Vacancies list heading", "Default \"Open positions\"."),
  field("Empty-state message", "Shown when there are no vacancies. Sets the tone for someone who clicks through and finds nothing."),
  field("Apply button label", "On each vacancy row. Default \"Apply now →\"."),

  h("Speculative block", HeadingLevel.HEADING_3),
  p("The closing \"Send us a CV anyway\" block at the foot of the page."),
  field("Section label", "Default \"Speculative\"."),
  field("Heading", "Display heading. Default \"Send us a CV anyway.\"."),
  field("Body", "Multi-paragraph copy."),
  field("Image", "Editorial photograph."),
  field("CTA label / link / destination label", "Typically links to /contact."),

  h("Apply modal", HeadingLevel.HEADING_3),
  p(
    "The form that opens when someone clicks \"Apply now\" on a vacancy. All field labels and supporting copy are editable. Defaults are sensible — only edit if you want to reword.",
  ),
  field("Eyebrow label", "Caption above the role title in the modal. Default \"Apply for\"."),
  field("Close button label / Close — accessible description", ""),
  field("Field labels", "First name, Last name, Email, Phone, LinkedIn / portfolio, Work experience, Upload CV."),
  field("File picker placeholder", "Default \"Choose a file (PDF or Word)\"."),
  field("File clear button label", "Default \"Clear\"."),
  field("Submit / Submitting button labels", ""),
  field("Legal microcopy", "Small print under the submit button. The default consent / data-use note is GDPR-aligned — only change if you have legal advice to."),
  field("Sent heading / Sent body", "Confirmation copy after submission."),
  field("Sent close label", ""),

  h("SEO", HeadingLevel.HEADING_3),
  field("Browser tab title", ""),
  field("Meta description", ""),
];

const sustainabilityPage = [
  h("Sustainability Page", HeadingLevel.HEADING_2),
  p("Tabs: Hero · Intro · Stats · Feature image · Legacy projects · Commitment · Principles · Certifications · SEO."),
  h("Hero", HeadingLevel.HEADING_3),
  field("Hero title", "Display heading."),
  field("CTA label", "Default \"Our principles\"."),
  field("CTA link", "In-page anchor (e.g. #principles) or path. Defaults to #principles."),
  field("Hero image — left / centre / right", "Three-image scroll-driven hero. The centre image expands from ~50% width to full-bleed as the user scrolls."),
  h("Intro", HeadingLevel.HEADING_3),
  field("Intro heading", ""),
  field("Intro body", "Multi-paragraph. Blank line splits."),
  h("Stats", HeadingLevel.HEADING_3),
  field("Section label", "Eyebrow above the stats. Default \"Impact\"."),
  field("Heading", "Statement above the stats."),
  field("Stats", "Up to 6 stat cards — value (\"78%\", \"12 tonnes\", \"£1.2m\") + label + optional footnote."),
  h("Feature image", HeadingLevel.HEADING_3),
  field("Section label", "Eyebrow. Default \"On site\"."),
  field("Heading", "Display heading."),
  field("Body", "Long-form copy. Blank line splits paragraphs."),
  field("Image", "Large editorial photograph — site, materials or completed work."),
  field("CTA label / link / destination label", "Default link points to /services with destination label \"Services\"."),
  h("Legacy projects", HeadingLevel.HEADING_3),
  field("Section label", "Default \"Recent work\"."),
  field("Items", "References to Project documents — up to 6. Each item has:"),
  subBullet(bold("Project"), " — pick from the Projects collection."),
  subBullet(bold("Image override (optional)"), " — use a specific image; otherwise falls back to the project's featured image."),
  subBullet(bold("Year label override (optional)"), " — free-text override (e.g. \"2024\", \"In progress\"). Falls back to the project's year if empty."),
  h("Commitment", HeadingLevel.HEADING_3),
  field("Section label", "Default \"Our commitment\"."),
  field("Heading", "Display heading."),
  field("Pillars", "Up to 6 short text blocks — title + body each. Renders as a multi-column grid."),
  h("Principles", HeadingLevel.HEADING_3),
  field("Section label", "Default \"Principles\"."),
  field("Heading", "Display heading."),
  field("Intro paragraph", "Optional supporting paragraph beneath the heading."),
  field("Items", "The principles themselves — title + body each."),
  h("Certifications", HeadingLevel.HEADING_3),
  field("Section label", "Default \"Frameworks we follow\"."),
  field("Items", "Standards / frameworks shown as a wrapping tag list — e.g. BREEAM, NABERS UK, RICS Whole Life Carbon."),
  h("SEO", HeadingLevel.HEADING_3),
  field("Browser tab title", ""),
  field("Meta description", ""),
];

const contactPage = [
  h("Contact Page", HeadingLevel.HEADING_2),
  p("Tabs: Content · Form · Sent state · SEO."),
  h("Content", HeadingLevel.HEADING_3),
  field("Page heading", "Big heading at the top of the page. e.g. \"Tell us about the brief.\""),
  field("Section label", "Small caps. Default \"Contact\"."),
  field("Intro paragraph", "Editorial copy beside the form — sets expectations on reply window."),
  h("Form", HeadingLevel.HEADING_3),
  field("First name field / Last name field / Email field / Organisation field / Project type field / Subject field / Message field", "Each has a Visible label and (where the design uses one) a Placeholder. Default labels are the field names; only edit if you want to rename."),
  field("Project type options", "Dropdown options. Drag to reorder, add / remove freely."),
  field("Subject options", "Dropdown options."),
  field("Submit button label", "Default \"Send message →\"."),
  field("Submitting button label", "Default \"Sending…\"."),
  h("Sent state", HeadingLevel.HEADING_3),
  field("Sent heading", "Default \"Thanks — we'll be in touch.\""),
  field("Sent body", "Confirms the reply window."),
  h("SEO", HeadingLevel.HEADING_3),
  field("Browser tab title", ""),
  field("Meta description", ""),
];

const legalPages = [
  h("Legal Pages", HeadingLevel.HEADING_2),
  p(
    "These are the Privacy Policy and Terms & Conditions pages. They live under \"Pages → Legal Pages\". You can add more legal pages by clicking ",
    bold("+ Create"),
    " inside the Legal Pages list.",
  ),
  h("Header", HeadingLevel.HEADING_3),
  field("Page title", "The big display heading at the top, e.g. \"Privacy Policy\"."),
  field("Page URL", "The path on the site after /legal/. Lowercase + hyphens, e.g. \"privacy-policy\"."),
  field("Eyebrow label", "Small caps label above the title. Default \"Legal\"."),
  field("Last updated date", "Update this whenever you change the policy. Shown beneath the title."),
  field("Introduction", "Short paragraph displayed above the table of contents."),
  h("Content", HeadingLevel.HEADING_3),
  field("Table of contents heading", "Default \"Contents\"."),
  field("Sections", "Ordered list of sections. Each section has:"),
  subBullet(bold("Section heading"), " — appears as the heading on the page and as the link in the table of contents."),
  subBullet(bold("Anchor link ID"), " — auto-generated from the heading. Used in the URL when someone clicks a TOC link. You can override it if you want a cleaner URL fragment."),
  subBullet(bold("Section content"), " — rich text. Supports paragraph, sub-heading, small sub-heading, quote, bullet list, numbered list, links, bold, italic, underline."),
  callout(
    "Editing rich text",
    "Highlight text and use the toolbar to add bold, italic, links, etc. To make a paragraph a sub-heading, click into it and pick \"Sub-heading\" from the style dropdown.",
  ),
  h("SEO", HeadingLevel.HEADING_3),
  field("Browser tab title", "Defaults to the page title if blank."),
  field("Meta description", "Search snippet. Under 160 chars."),
];

/* Section: Sections */
const sectionsBlock = [];

/* Collections */
const collections = [
  h("Collections — repeatable content", HeadingLevel.HEADING_1),
  lead(
    "Each collection is a list. Add as many entries as you want — the site lists them automatically.",
  ),

  h("Projects", HeadingLevel.HEADING_2),
  p("Tabs on each project: Overview · Images · Project Stats · Client · Testimonials."),
  callout(
    "How display order works (drag-and-drop)",
    "The Projects list in the sidebar is drag-and-drop. The order you set there is the order projects appear in three places: the /projects archive, the Featured Projects strip on the home page (top 6), and the Featured Projects column in the footer (top 5). To re-order: open Projects, hover over a row, grab the handle on the left, and drag it up or down. Order saves immediately.",
  ),
  spacer(),
  videoCallout(
    "Video — re-ordering projects",
    "How to drag rows to change the order on the site, including the knock-on effect on the home page and footer.",
    VIDEOS.projectOrder,
  ),
  h("Overview", HeadingLevel.HEADING_3),
  field("Project title", "Project name. Required."),
  field("Slug", "URL path after /projects/. Lowercase + hyphens. Click \"Generate\" to derive it from the title. Required."),
  field("Category", "Reference to a Project Category — used as a filter chip on /projects. Required."),
  field("Short description", "1–2 sentence summary shown on the listing card and below the title on the project page. Required."),
  field("Location", "City or area, e.g. \"London, Mayfair\". Required."),
  field("Year completed", "Year the project was completed, e.g. 2024. Required."),
  field("Tags", "Keywords for filtering / search. Optional."),
  h("Images", HeadingLevel.HEADING_3),
  field("Featured image", "The cover image — used on the listing card, the project hero, and the first slide of the lightbox. Use \"Pick from library\" and pick by tag for speed."),
  field("Additional images", "Gallery images. Drag to reorder; the lightbox shows the featured image first, then these in order."),
  h("Project Stats", HeadingLevel.HEADING_3),
  field("Expertise Provided", "References to Expertise documents. Lists the disciplines used on this project."),
  field("Team Members", "References to Team Member documents. Shows their tiles in the Project team grid."),
  field("Project stats", "Flexible stat rows shown as a grid at the top of the project page. Each row — label + value. e.g. \"Square Footage\" / \"42,000 sq ft\", \"Project Cost\" / \"£2.4M\"."),
  h("Client", HeadingLevel.HEADING_3),
  field("Client objective", "What the client asked for — long-form copy."),
  field("Client feedback", "Quote / paragraph from the client about working with Box 3."),
  h("Testimonials", HeadingLevel.HEADING_3),
  field("Testimonials section", "Optional — pick one or more testimonials to show in a band on the project page. Leave empty to hide the section."),

  pageBreak(),

  h("Project Categories", HeadingLevel.HEADING_2),
  p("Used as filter chips on the /projects archive. Keep this list small — too many chips makes the filter row overwhelming."),
  field("Category name", "Display name, e.g. \"Cat A\", \"Cat B\", \"Commercial\", \"Residential\". Required."),
  field("Slug", "URL-friendly version of the title — auto-generated when you click Generate. Required."),

  h("Expertise", HeadingLevel.HEADING_2),
  p("Tag-style documents referenced from each project, listed in the project's right-column stats. e.g. Category A Fit-Out, Lighting Design, M&E coordination."),
  field("Title", "Expertise name. Required."),

  h("Team Members", HeadingLevel.HEADING_2),
  p("Everyone shown on the About page team grid + each project's team grid."),
  field("Full Name", "Required."),
  field("Role / Job Title", "What they do at Box 3. Required."),
  field(
    "Category / Group",
    "Dropdown — pick from: Leadership, Project Management, Commercial, Technical, Site Team, Design, Business Development, Health & Safety, Bid + Marketing. Controls which group they appear under on the About page.",
  ),
  field("Qualifications", "Professional qualifications displayed above the role, e.g. \"OAQ, OAA, AAA, AIBC\". Optional."),
  field("LinkedIn URL", "Full LinkedIn profile URL. If filled, a small LinkedIn icon appears on their tile."),
  field("Photo", "Professional headshot — square crop reads best. Has a hotspot for cropping."),
  field("Display Order", "Number controlling sort order within their group. Lower = earlier. Same order is used on About + project team grids."),

  h("Partners", HeadingLevel.HEADING_2),
  p("Brand / company documents. Logos appear in the marquee at the foot of every page (in the order you drag them), and beside testimonials when a testimonial links to a partner."),
  callout(
    "How display order works (drag-and-drop)",
    "The Partners list in the sidebar is drag-and-drop — the order set there is the order logos appear in the site-wide marquee. To re-order: open Partners, hover over a row, grab the handle on the left, and drag it up or down. Order saves immediately. The marquee heading shown above the logos (e.g. \"Trusted By\") lives in Site Settings → Partners marquee.",
  ),
  field("Partner name", "Brand or company name, e.g. \"Hugo Boss\", \"Meta\". Required."),
  field("Slug", "URL-friendly version — auto-generated. Used internally only."),
  field(
    "Partner logo (SVG)",
    "Upload an SVG file. The logo displays in the current theme colour — make sure the SVG uses currentColor for fill and stroke (any single-colour SVG works once you've swapped its colour values out for currentColor in a text editor or via your designer).",
  ),

  h("Testimonials", HeadingLevel.HEADING_2),
  p("Reusable client quotes — one testimonial can appear on the home page, on a project detail page, and anywhere else. Pick which testimonials show where from the host document (Home Page → Testimonials, Project → Testimonials)."),
  field("Quote", "The client's words in full. Required — at least 20 characters."),
  field("Author", "Person who gave the quote, e.g. \"Jane Doe\". Required."),
  field("Job title", "Author's role, e.g. \"Head of Workplace\". Required."),
  field("Partner (company)", "Reference to a Partner document — the partner's logo will appear next to the quote. Optional but recommended."),

  pageBreak(),

  h("Vacancies", HeadingLevel.HEADING_2),
  p("Open roles listed on the Careers page."),
  field("Role title", "e.g. \"Senior Interior Designer\". Required."),
  field("Discipline", "Dropdown — Design / Build / Project Management / Operations / Studio. Used as a chip on the listing. Required."),
  field("Location", "City + region. Default \"London, UK\". Required."),
  field("Employment type", "Full-time / Part-time / Contract / Internship. Required."),
  field("Salary — minimum / maximum", "Numbers in GBP. Optional — leave blank if you don't want to publish a band."),
  field("Summary", "1–2 line role summary shown beneath the title."),
  field("Apply URL", "External application link — Workable, Greenhouse, mailto:, etc. Leave empty to hide the apply button."),
  field("Published date", "Used for ordering — newest roles surface first. Required."),
  field("Open", "Toggle off to hide the role without deleting it."),
];

/* Tips & gotchas */
const tipsGotchas = [
  pageBreak(),
  h("Tips & gotchas", HeadingLevel.HEADING_1),
  lead("Things that surprise people. Quick reference."),

  h("Yellow \"Unknown field\" warning", HeadingLevel.HEADING_2),
  p(
    "If you see a yellow box on a document, it usually means a field was renamed in an update and the old value is still on the doc. You can ignore it (the live site doesn't use that field), or click the field menu and remove it.",
  ),

  h("Required fields & why publish is greyed out", HeadingLevel.HEADING_2),
  p(
    "Look for a red strip at the top of the document. It'll list every required field that's empty. Fill them in and the green Publish button comes back.",
  ),

  h("Slugs", HeadingLevel.HEADING_2),
  p(
    "Slugs are the URL-friendly part — what appears in the address bar after the page name. Use lowercase, hyphens for spaces, no special characters. Most slug fields have a ",
    bold("Generate"),
    " button — clicking it derives the slug from the title automatically.",
  ),

  h("Drafts left around", HeadingLevel.HEADING_2),
  p(
    "If you start an edit and don't publish, it stays as a draft on the document. The next time you open the doc, you'll see a yellow ",
    bold("Draft"),
    " badge. Either publish it or click the three dots → Discard changes.",
  ),

  h("Re-ordering lists", HeadingLevel.HEADING_2),
  p(
    "On any list of items (services, why-work-with-us items, partners, etc.), grab the handle on the left of the row and drag it up or down. Order preserves on publish.",
  ),

  h("Image cropping", HeadingLevel.HEADING_2),
  p(
    "When the same image is shown at different aspect ratios across the site (square on the team grid, 16:9 on the project hero, etc.), Sanity's hotspot tool decides which part of the image stays in frame as the image is cropped. To set it: click the image, click ",
    bold("Edit"),
    ", drag the round target to the most important part of the photo, and save. The site uses that hotspot whenever it crops the image.",
  ),
  spacer(),
  videoCallout(
    "Video — setting an image hotspot",
    "Quick demo on a portrait that's used at three different crops — shows what changes when you move the hotspot.",
    VIDEOS.hotspotCropping,
  ),

  h("If something goes wrong", HeadingLevel.HEADING_2),
  p(
    "Sanity has full version history — every published version is stored. Open the document, click the clock icon top-right, find a previous version, click ",
    bold("Restore"),
    ". You can always get back to where you were.",
  ),
  spacer(),
  videoCallout(
    "Video — rolling back a version",
    "If you publish something you didn't mean to, here's how to find the previous version and restore it in under a minute.",
    VIDEOS.versionRollback,
  ),

  h("Who to ask", HeadingLevel.HEADING_2),
  p(
    "If you can't find a field, can't publish, or something on the live site looks wrong even after publishing, get in touch with Autara Studio and we'll take a look.",
  ),
];

/* ── Assemble document ──────────────────────────────────────── */

const allChildren = [
  ...cover,
  ...gettingStarted,
  ...studioOverview,
  ...publishing,
  ...mediaLibrary,
  ...siteSettings,
  ...pagesIntro,
  ...homePage,
  pageBreak(),
  ...aboutPage,
  pageBreak(),
  ...servicesPage,
  pageBreak(),
  ...projectsPage,
  pageBreak(),
  ...careersPage,
  pageBreak(),
  ...sustainabilityPage,
  pageBreak(),
  ...contactPage,
  pageBreak(),
  ...legalPages,
  pageBreak(),
  ...sectionsBlock,
  ...collections,
  ...tipsGotchas,
];

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 44, bold: true, font: "Arial", color: "111111" },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 },
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: "111111" },
        paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: 1 },
      },
      {
        id: "Heading3",
        name: "Heading 3",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: BLUE },
        paragraph: { spacing: { before: 220, after: 100 }, outlineLevel: 2 },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: "•",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 360, hanging: 240 } } },
          },
          {
            level: 1,
            format: LevelFormat.BULLET,
            text: "◦",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 240 } } },
          },
        ],
      },
      {
        reference: "numbers",
        levels: [
          {
            level: 0,
            format: LevelFormat.DECIMAL,
            text: "%1.",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 360, hanging: 240 } } },
          },
        ],
      },
      {
        reference: "fields",
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: "›",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 360, hanging: 240 } } },
          },
        ],
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 },
        },
      },
      children: allChildren,
    },
  ],
});

/* Write to the canonical path by default. If that path is locked
   (e.g. you have the doc open in Word), fall through to a -v<N>
   sibling so the run still succeeds — the canonical file is only
   overwritten when nothing's holding it open. */
const outDir = path.resolve(process.cwd());
const canonical = path.join(outDir, "box-3-sanity-editing-guide.docx");

const pickWritablePath = () => {
  try {
    fs.closeSync(fs.openSync(canonical, "a"));
    return canonical;
  } catch (err) {
    if (err.code !== "EBUSY" && err.code !== "EPERM") throw err;
  }
  for (let n = 2; n < 20; n++) {
    const candidate = path.join(outDir, `box-3-sanity-editing-guide-v${n}.docx`);
    try {
      fs.closeSync(fs.openSync(candidate, "a"));
      return candidate;
    } catch (err) {
      if (err.code !== "EBUSY" && err.code !== "EPERM") throw err;
    }
  }
  throw new Error("Could not find a writable output path.");
};

const outPath = pickWritablePath();
const buffer = await Packer.toBuffer(doc);
fs.writeFileSync(outPath, buffer);
console.log(`\nWrote ${outPath} (${buffer.length} bytes)`);
if (outPath !== canonical) {
  console.log(
    `(${path.basename(canonical)} appears to be open — wrote a sibling instead. ` +
      `Close Word and re-run to overwrite the canonical file.)`,
  );
}
