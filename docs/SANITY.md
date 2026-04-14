# Sanity CMS

## Philosophy
- Every piece of text on the site comes from Sanity — no hardcoded strings
- All images stored and served via Sanity asset pipeline
- Schema is folder-based and intuitive for non-technical clients
- Field names and descriptions written in plain English
- When schema structure is uncertain — ask before building

## Structure
Schemas organised into logical folders inside `/src/sanity/schemas/`:

| Folder          | Contents                                                          |
|-----------------|-------------------------------------------------------------------|
| `/pages`        | Individual page documents (home, about, services, contact, etc.)  |
| `/sections`     | Reusable section schemas (hero, cta, testimonials, etc.)          |
| `/collections`  | Repeatable content types (blog posts, projects, case studies, etc.)|
| `/globals`      | Site-wide content (navigation, footer, site settings, SEO defaults)|
| `/components`   | Shared component schemas (buttons, links, images, etc.)           |

## Conventions
- Schema type names in camelCase: `heroSection`, `blogPost`, `siteSettings`
- Field names descriptive and plain English
- Use `fieldsets` to group related fields and keep Studio clean
- Every schema has a `preview` defined for Studio usability
- All image fields include `alt` text as a required field
- Rich text uses Portable Text (block content)

## Queries
- All GROQ queries live in `/src/sanity/queries/`
- One file per content type or page
- Queries exported as named constants

```ts
// Example
export const HOME_PAGE_QUERY = groq`*[_type == "homePage"][0] { ... }`
```

## Client Config
- Sanity client configured in `/src/sanity/lib/client.ts`
- Image URL builder in `/src/sanity/lib/image.ts`

### Environment Variables

| Variable                          | Purpose                        |
|-----------------------------------|--------------------------------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID`   | Identifies the Sanity project  |
| `NEXT_PUBLIC_SANITY_DATASET`      | Target dataset (e.g. production)|
| `NEXT_PUBLIC_SANITY_API_VERSION`  | API version date string        |

## Content Flow

```
Sanity → GROQ query → Next.js page/component → props → render
```

- Components never fetch directly — data always passed via props
- Page-level components (in `/app`) own all data fetching
- All data is typed end-to-end with TypeScript interfaces in `/src/types/`

## Studio Structure

### Philosophy
The Studio sidebar is a client-facing product. It must be organised,
labelled, and predictable — never a raw alphabetical list of
document types.

### Layout
The custom desk structure lives at `src/sanity/lib/structure.ts`
and groups content into three top-level sections:

- **Pages** — one item per page document (Home Page, etc.)
- **Reusable Sections** — section documents used across pages
- **Site Settings** — singletons for Navigation and Footer

Each item opens **directly into its document** — there are no
intermediate lists for singletons.

### Singletons
Any document type that should exist exactly once in the dataset is
a singleton. Singleton handling is centralised in two places:

- `src/sanity/lib/structure.ts` — the `SINGLETONS` array and the
  corresponding `S.listItem().child(S.document().documentId(...))`
  entry in the sidebar
- `src/sanity/lib/studio.ts` — the `SINGLETON_TYPES` set, which
  filters out `duplicate`, `delete`, and `unpublish` actions and
  hides the type from the global "+ Create" menu

Every singleton document is stored at a **fixed `_id` equal to its
schema type name** (e.g. `homePage`, `siteNav`). This guarantees
the Studio deep-link and the seed script resolve to the same
document forever.

### Field Groups
Every document with more than ~4 fields declares `groups` so the
Studio renders a tabbed UI:

```ts
groups: [
  { name: "links",   title: "Links", default: true },
  { name: "contact", title: "Contact Details" },
  { name: "form",    title: "Contact Form" },
],
```

Every field then sets `group: "..."` to assign itself to a tab.

### Field Titles & Descriptions
- Titles are short, capitalised, and written for a non-technical
  client (e.g. "Main Nav Links", not "primaryLinks")
- Every field has a `description` explaining exactly where the
  value appears on the site
- Descriptions use real examples (e.g. "e.g. +44 20 0000 0000")

## Seeding

### Philosophy
Every schema type must have a corresponding document in the dataset.
Sanity Studio must never show "No documents of this type" after a
build task is complete. The client should be able to log in and
edit real content immediately after any session.

### How It Works
- Seed script lives at: `scripts/seed-sanity.ts`
- Run with: `npm run seed`
- Uses `SANITY_API_TOKEN` (Editor permissions) from `.env.local`
- Idempotent — checks if the fixed-ID document exists before creating
- Cleans up any legacy auto-ID duplicates of the same type in the
  same pass
- Safe to run multiple times without creating duplicates

### When to Run
- After initial project setup
- After adding any new schema type
- After adding required new fields to an existing schema

### What Gets Seeded
- All text, string, array, and object fields — with real content
- Link hrefs — with correct paths
- Arrays — with 2–3 representative items minimum
- Singletons — with a fixed `_id` matching the schema type name

### What Does NOT Get Seeded
- `image` fields — client uploads via Studio
- `file` fields (SVG logos etc.) — client uploads via Studio
- These fields must NOT have `validation: (rule) => rule.required()`
  in the schema, otherwise documents cannot be created without them
- Add a description to each: "Upload via Studio after initial setup"

### Adding a New Singleton Document to the Seed Script

Follow this pattern exactly. Note the fixed `_id`, the legacy
cleanup, and the idempotent check against the fixed ID:

```ts
{
  _id: "myDocumentType",
  _type: "myDocumentType",
  fieldOne: "Default value",
  fieldTwo: "Default value",
}
```

The seed loop in `scripts/seed-sanity.ts` handles the rest:

```ts
// 1. Remove any legacy auto-ID documents of this type
const legacyIds = await client.fetch<string[]>(
  `*[_type == $type && _id != $id && _id != $draftId]._id`,
  { type: _type, id: _id, draftId: `drafts.${_id}` },
);
await Promise.all(legacyIds.map((id) => client.delete(id)));

// 2. Skip if the fixed-ID document already exists
const existing = await client.fetch(
  `*[_id == $id][0]{_id}`,
  { id: _id },
);
if (existing) return;

// 3. Otherwise create with the fixed ID
await client.create(doc);
```

### Modifying an Existing Singleton

When adding new fields to an existing schema, patch the existing
singleton by its fixed `_id` rather than creating a new document:

```ts
await client
  .patch("myDocumentType")
  .setIfMissing({ newField: "Default value" })
  .commit();
```

`setIfMissing` ensures existing content is never overwritten.

### Getting a Write Token
1. Go to sanity.io/manage
2. Select the `box-3-projects` project
3. Go to API → Tokens
4. Create a new token with Editor permissions
5. Add to `.env.local` as `SANITY_API_TOKEN=your-token-here`
6. Never commit this token to version control
