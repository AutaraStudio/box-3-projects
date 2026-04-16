# Spacing System

## Philosophy

- All spacing values in **rem** — never px
- The Osmo fluid scaling system (`--size-font` on html + body) handles all responsive scaling automatically
- Never use `clamp()` or `vw` for spacing values
- One consistent scale used across the entire site — no arbitrary values
- Section spacing is separate from component spacing for clarity
- At the 1440px design width, **1rem = 16px**

## Base Scale

General-purpose spacing for margins, padding, and layout within components.
The mid-to-large rungs (4–12) were intentionally tightened ~20–30% from the original scale so the site reads as more refined and compact. Steps 1–3 were left untouched — the micro rungs already read correctly.

| Token        | rem     | px at 1440 | Tailwind class    |
|--------------|---------|------------|-------------------|
| `--space-1`  | 0.5rem  | 8px        | `p-space-1`, etc. |
| `--space-2`  | 0.75rem | 12px       | `p-space-2`, etc. |
| `--space-3`  | 1rem    | 16px       | `p-space-3`, etc. |
| `--space-4`  | 1.25rem | 20px       | `p-space-4`, etc. |
| `--space-5`  | 1.5rem  | 24px       | `p-space-5`, etc. |
| `--space-6`  | 2rem    | 32px       | `p-space-6`, etc. |
| `--space-7`  | 2.5rem  | 40px       | `p-space-7`, etc. |
| `--space-8`  | 3rem    | 48px       | `p-space-8`, etc. |
| `--space-9`  | 4rem    | 64px       | `p-space-9`, etc. |
| `--space-10` | 5rem    | 80px       | `p-space-10`, etc.|
| `--space-11` | 5.5rem  | 88px       | `p-space-11`, etc.|
| `--space-12` | 6.5rem  | 104px      | `p-space-12`, etc.|

Works with all Tailwind spacing utilities: `p-`, `m-`, `px-`, `py-`, `mt-`, `mb-`, `ml-`, `mr-`, etc.

## Section Spacing

Vertical padding for page sections. Tightened ~30% from the original scale — the single biggest lever on perceived whitespace site-wide.

| Token                   | rem    | px at 1440 | Tailwind class    | When to use                                        |
|-------------------------|--------|------------|-------------------|----------------------------------------------------|
| `--section-space-none`  | 0rem   | 0px        | `py-section-none` | Removing spacing entirely                          |
| `--section-space-xs`    | 2rem   | 32px       | `py-section-xs`   | Tight sections, small gaps between related content |
| `--section-space-sm`    | 3.5rem | 56px       | `py-section-sm`   | Standard tight section padding                     |
| `--section-space-md`    | 5rem   | 80px       | `py-section-md`   | Standard section padding — most common             |
| `--section-space-lg`    | 7rem   | 112px      | `py-section-lg`   | Spacious sections, feature areas                   |
| `--section-space-xl`    | 9rem   | 144px      | `py-section-xl`   | Page top padding (accounts for nav height)         |

## Gap Scale

For grid column gaps, flex gaps, and layout spacing between sibling elements. Mirrors the base scale — mid-to-large rungs tightened, steps 1–3 unchanged.

| Token     | rem     | px at 1440 | Tailwind class    |
|-----------|---------|------------|-------------------|
| `--gap-1` | 0.5rem  | 8px        | `gap-gap-1`, etc. |
| `--gap-2` | 0.75rem | 12px       | `gap-gap-2`, etc. |
| `--gap-3` | 1rem    | 16px       | `gap-gap-3`, etc. |
| `--gap-4` | 1.25rem | 20px       | `gap-gap-4`, etc. |
| `--gap-5` | 1.5rem  | 24px       | `gap-gap-5`, etc. |
| `--gap-6` | 2rem    | 32px       | `gap-gap-6`, etc. |
| `--gap-7` | 2.5rem  | 40px       | `gap-gap-7`, etc. |
| `--gap-8` | 3rem    | 48px       | `gap-gap-8`, etc. |

Works with `gap-`, `gap-x-`, and `gap-y-` Tailwind utilities.

## Container Padding

| Token                | Desktop | Mobile Portrait |
|----------------------|---------|-----------------|
| `--container-padding`| 2rem    | 1rem            |

Horizontal padding applied to all `.container` elements. Automatically reduces to 1rem on mobile portrait (max-width: 479px).

## Usage Rules

1. **Always use a token** — never hardcode a spacing value in components
2. **Section padding** uses `--section-space-*` tokens (`py-section-md`, etc.)
3. **Component internal spacing** uses `--space-*` tokens (`p-space-4`, `mb-space-2`, etc.)
4. **Grid and flex gaps** use `--gap-*` tokens (`gap-gap-4`, `gap-x-gap-6`, etc.)
5. All rem values **scale automatically** with the Osmo system across breakpoints
6. No `clamp()` or `vw` — Osmo handles all fluid behaviour

## Conversion Reference

To convert any Figma px value to a rem token:

```
rem = px / 16
```

| Figma px | rem     | Nearest token               |
|----------|---------|-----------------------------|
| 8px      | 0.5rem  | `--space-1` / `--gap-1`     |
| 12px     | 0.75rem | `--space-2` / `--gap-2`     |
| 16px     | 1rem    | `--space-3` / `--gap-3`     |
| 20px     | 1.25rem | `--space-4` / `--gap-4`     |
| 24px     | 1.5rem  | `--space-5` / `--gap-5`     |
| 32px     | 2rem    | `--space-6` / `--gap-6` / `--section-space-xs` |
| 40px     | 2.5rem  | `--space-7` / `--gap-7`     |
| 48px     | 3rem    | `--space-8` / `--gap-8`     |
| 56px     | 3.5rem  | `--section-space-sm`        |
| 64px     | 4rem    | `--space-9`                 |
| 80px     | 5rem    | `--space-10` / `--section-space-md` |
| 88px     | 5.5rem  | `--space-11`                |
| 104px    | 6.5rem  | `--space-12`                |
| 112px    | 7rem    | `--section-space-lg`        |
| 144px    | 9rem    | `--section-space-xl`        |
