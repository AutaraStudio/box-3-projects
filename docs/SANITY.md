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
