/**
 * Tailwind CSS Configuration
 * ==========================
 * All color, easing, and duration values reference CSS custom properties
 * defined in src/app/globals.css. This ensures a single source of truth
 * for the entire design token system.
 *
 * RULES:
 * - NEVER add hardcoded hex, rgb, or hsl values here
 * - All colors use var(--color-*) or var(--theme-*) references
 * - All animation tokens use var(--ease-*) and var(--duration-*) references
 * - This config EXTENDS the default Tailwind theme — it does not replace it
 */

import type { Config } from "tailwindcss";

/* --------------------------------------------------------------------------
   Helpers
   -------------------------------------------------------------------------- */

/** Generate a 100–900 scale referencing --color-{family}-{step} variables. */
function createPrimitiveScale(family: string): Record<string, string> {
  const scale: Record<string, string> = {};
  for (let step = 100; step <= 900; step += 100) {
    scale[step] = `var(--color-${family}-${step})`;
  }
  return scale;
}

/* --------------------------------------------------------------------------
   Configuration
   -------------------------------------------------------------------------- */

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/styles/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    /* -----------------------------------------------------------------------
       Screens — match the fluid scaling breakpoints in globals.css
       ----------------------------------------------------------------------- */
    screens: {
      sm: "480px",
      md: "768px",
      lg: "992px",
      xl: "1440px",
      "2xl": "1920px",
    },

    extend: {
      /* --------------------------------------------------------------------
         Colors
         Primitive palette (--color-*) and semantic theme tokens (--theme-*).
         Components should prefer semantic tokens; primitives are available
         for edge cases that genuinely need them.
         -------------------------------------------------------------------- */
      colors: {
        /* --- Primitive Palette --- */
        pink: createPrimitiveScale("pink"),
        white: createPrimitiveScale("white"),
        cream: createPrimitiveScale("cream"),
        charcoal: createPrimitiveScale("charcoal"),
        grey: createPrimitiveScale("grey"),
        black: createPrimitiveScale("black"),
        brown: createPrimitiveScale("brown"),
        rose: createPrimitiveScale("rose"),
        dusty: createPrimitiveScale("dusty"),
        mauve: createPrimitiveScale("mauve"),
        sage: createPrimitiveScale("sage"),
        sand: createPrimitiveScale("sand"),

        /* --- Semantic Theme Tokens --- */

        /* Backgrounds */
        "theme-bg": "var(--theme-bg)",
        "theme-bg-2": "var(--theme-bg-2)",
        "theme-bg-3": "var(--theme-bg-3)",
        "theme-bg-4": "var(--theme-bg-4)",
        "theme-bg-card": "var(--theme-bg-card)",
        "theme-bg-card-hover": "var(--theme-bg-card-hover)",

        /* Text */
        "theme-text": "var(--theme-text)",
        "theme-text-muted": "var(--theme-text-muted)",
        "theme-text-subtle": "var(--theme-text-subtle)",
        "theme-text-inverse": "var(--theme-text-inverse)",
        "theme-text-accent": "var(--theme-text-accent)",

        /* Borders */
        "theme-border": "var(--theme-border)",
        "theme-border-strong": "var(--theme-border-strong)",
        "theme-border-subtle": "var(--theme-border-subtle)",

        /* Accent */
        "theme-accent": "var(--theme-accent)",
        "theme-accent-hover": "var(--theme-accent-hover)",
        "theme-accent-subtle": "var(--theme-accent-subtle)",

        /* SVG */
        "theme-svg": "var(--theme-svg)",
        "theme-svg-hover": "var(--theme-svg-hover)",
        "theme-svg-muted": "var(--theme-svg-muted)",

        /* Button — Primary */
        "theme-btn-primary-text": "var(--theme-btn-primary-text)",
        "theme-btn-primary-text-hover": "var(--theme-btn-primary-text-hover)",
        "theme-btn-primary-bg": "var(--theme-btn-primary-bg)",
        "theme-btn-primary-bg-hover": "var(--theme-btn-primary-bg-hover)",
        "theme-btn-primary-border": "var(--theme-btn-primary-border)",
        "theme-btn-primary-border-hover": "var(--theme-btn-primary-border-hover)",

        /* Button — Secondary */
        "theme-btn-secondary-text": "var(--theme-btn-secondary-text)",
        "theme-btn-secondary-text-hover": "var(--theme-btn-secondary-text-hover)",
        "theme-btn-secondary-bg": "var(--theme-btn-secondary-bg)",
        "theme-btn-secondary-bg-hover": "var(--theme-btn-secondary-bg-hover)",
        "theme-btn-secondary-border": "var(--theme-btn-secondary-border)",
        "theme-btn-secondary-border-hover": "var(--theme-btn-secondary-border-hover)",

        /* Links */
        "theme-link-text": "var(--theme-link-text)",
        "theme-link-border": "var(--theme-link-border)",
        "theme-link-text-hover": "var(--theme-link-text-hover)",
        "theme-link-border-hover": "var(--theme-link-border-hover)",

        /* Inputs */
        "theme-input-bg": "var(--theme-input-bg)",
        "theme-input-border": "var(--theme-input-border)",
        "theme-input-border-focus": "var(--theme-input-border-focus)",
        "theme-input-text": "var(--theme-input-text)",
        "theme-input-placeholder": "var(--theme-input-placeholder)",

        /* Misc */
        "theme-overlay": "var(--theme-overlay)",
        "theme-shadow": "var(--theme-shadow)",
        "theme-focus": "var(--theme-focus)",

        /* Nav */
        "theme-nav-bg": "var(--theme-nav-bg)",
        "theme-nav-text": "var(--theme-nav-text)",
        "theme-nav-border": "var(--theme-nav-border)",

        /* Tags */
        "theme-tag-bg": "var(--theme-tag-bg)",
        "theme-tag-border": "var(--theme-tag-border)",
        "theme-tag-text": "var(--theme-tag-text)",

        /* Selection */
        "theme-selection-bg": "var(--theme-selection-bg)",
        "theme-selection-text": "var(--theme-selection-text)",
      },

      /* --------------------------------------------------------------------
         Typography — Font Families
         Primary: Satoshi (headings, display, UI)
         Secondary: Instrument Sans (body, captions, labels)
         -------------------------------------------------------------------- */
      fontFamily: {
        primary: "var(--font-primary)",
        secondary: "var(--font-secondary)",
      },

      /* --------------------------------------------------------------------
         Typography — Font Sizes
         All reference CSS variable tokens. Osmo handles fluid scaling.
         Usage: className="text-h1" or "text-display"
         -------------------------------------------------------------------- */
      fontSize: {
        display: "var(--font-size-display)",
        h1: "var(--font-size-h1)",
        h2: "var(--font-size-h2)",
        h3: "var(--font-size-h3)",
        h4: "var(--font-size-h4)",
        h5: "var(--font-size-h5)",
        h6: "var(--font-size-h6)",
        "text-lg": "var(--font-size-text-lg)",
        "text-md": "var(--font-size-text-md)",
        "text-sm": "var(--font-size-text-sm)",
        "text-xs": "var(--font-size-text-xs)",
        "text-xxs": "var(--font-size-text-xxs)",
      },

      /* --------------------------------------------------------------------
         Typography — Font Weights
         Usage: className="font-light" or "font-semibold"
         -------------------------------------------------------------------- */
      fontWeight: {
        light: "var(--font-weight-light)",
        regular: "var(--font-weight-regular)",
        medium: "var(--font-weight-medium)",
        semibold: "var(--font-weight-semibold)",
        bold: "var(--font-weight-bold)",
      },

      /* --------------------------------------------------------------------
         Typography — Line Heights
         Usage: className="leading-tight" or "leading-relaxed"
         -------------------------------------------------------------------- */
      lineHeight: {
        none: "var(--line-height-none)",
        tight: "var(--line-height-tight)",
        snug: "var(--line-height-snug)",
        normal: "var(--line-height-normal)",
        relaxed: "var(--line-height-relaxed)",
        loose: "var(--line-height-loose)",
      },

      /* --------------------------------------------------------------------
         Typography — Letter Spacing
         Usage: className="tracking-tight" or "tracking-wide"
         -------------------------------------------------------------------- */
      letterSpacing: {
        display: "var(--letter-spacing-display)",
        tight: "var(--letter-spacing-tight)",
        snug: "var(--letter-spacing-snug)",
        normal: "var(--letter-spacing-normal)",
        wide: "var(--letter-spacing-wide)",
        wider: "var(--letter-spacing-wider)",
      },

      /* --------------------------------------------------------------------
         Border Radius
         Usage: className="rounded-sm" or "rounded-full"
         -------------------------------------------------------------------- */
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        full: "var(--radius-full)",
      },

      /* --------------------------------------------------------------------
         Border Width
         Usage: className="border-main"
         -------------------------------------------------------------------- */
      borderWidth: {
        main: "var(--border-width)",
      },

      /* --------------------------------------------------------------------
         Spacing
         Base scale (space-*), section scale (section-*), and container
         padding. Tailwind defaults are preserved alongside these tokens.
         Usage: className="p-space-4" or "py-section-md"
         -------------------------------------------------------------------- */
      spacing: {
        "space-1": "var(--space-1)",
        "space-2": "var(--space-2)",
        "space-3": "var(--space-3)",
        "space-4": "var(--space-4)",
        "space-5": "var(--space-5)",
        "space-6": "var(--space-6)",
        "space-7": "var(--space-7)",
        "space-8": "var(--space-8)",
        "space-9": "var(--space-9)",
        "space-10": "var(--space-10)",
        "space-11": "var(--space-11)",
        "space-12": "var(--space-12)",
        "section-none": "var(--section-space-none)",
        "section-xs": "var(--section-space-xs)",
        "section-sm": "var(--section-space-sm)",
        "section-md": "var(--section-space-md)",
        "section-lg": "var(--section-space-lg)",
        "section-xl": "var(--section-space-xl)",
        "container-padding": "var(--container-padding)",
      },

      /* --------------------------------------------------------------------
         Gap
         Grid and flex gap tokens. Extends Tailwind's gap utilities.
         Usage: className="gap-gap-4" or "gap-x-gap-6"
         -------------------------------------------------------------------- */
      gap: {
        "gap-1": "var(--gap-1)",
        "gap-2": "var(--gap-2)",
        "gap-3": "var(--gap-3)",
        "gap-4": "var(--gap-4)",
        "gap-5": "var(--gap-5)",
        "gap-6": "var(--gap-6)",
        "gap-7": "var(--gap-7)",
        "gap-8": "var(--gap-8)",
      },

      /* --------------------------------------------------------------------
         Transition Timing Functions
         Map our easing CSS variables into Tailwind's ease-* utilities.
         Usage: className="ease-brand" or "ease-gentle"
         -------------------------------------------------------------------- */
      transitionTimingFunction: {
        brand: "var(--ease-brand)",
        "smooth-out": "var(--ease-out)",
        "smooth-in": "var(--ease-in)",
        "smooth-in-out": "var(--ease-in-out)",
        gentle: "var(--ease-gentle)",
        expressive: "var(--ease-expressive)",
        snappy: "var(--ease-snappy)",
        bounce: "var(--ease-bounce)",
      },

      /* --------------------------------------------------------------------
         Transition Duration
         Map our duration CSS variables into Tailwind's duration-* utilities.
         Usage: className="duration-fast" or "duration-slow"
         -------------------------------------------------------------------- */
      transitionDuration: {
        instant: "var(--duration-instant)",
        fast: "var(--duration-fast)",
        normal: "var(--duration-normal)",
        moderate: "var(--duration-moderate)",
        slow: "var(--duration-slow)",
        slower: "var(--duration-slower)",
        slowest: "var(--duration-slowest)",
      },
    },
  },

  plugins: [],
};

export default config;
