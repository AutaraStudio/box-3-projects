/**
 * animations.config.ts
 * Centralised GSAP easing & timing configuration.
 * Never hardcode a GSAP ease string or duration in a component.
 * Always import from here.
 */

export const ease = {
  brand:      "power3.inOut",
  entrance:   "power3.out",
  exit:       "power3.in",
  smooth:     "expo.out",
  cinematic:  "expo.inOut",
  gentle:     "sine.inOut",
  snap:       "power1.out",
  expressive: "back.out(1.4)",
  bounce:     "elastic.out(1, 0.5)",
  splitText:  "power4.out",
  parallax:   "none",
} as const;

export const duration = {
  instant:  0.1,
  fast:     0.2,
  normal:   0.4,
  moderate: 0.6,
  slow:     0.9,
  slower:   1.2,
  slowest:  1.8,
} as const;

export const stagger = {
  tight:    0.04,
  normal:   0.08,
  moderate: 0.12,
  relaxed:  0.18,
  slow:     0.25,
} as const;

export const scrollTrigger = {
  default: {
    start:         "top 88%",
    end:           "top 20%",
    toggleActions: "play none none none",
  },
  eager: {
    start:         "top 95%",
    end:           "top 20%",
    toggleActions: "play none none none",
  },
  scrub: {
    start: "top bottom",
    end:   "bottom top",
    scrub: 1.2,
  },
  scrubPanel: {
    start: "top bottom",
    end:   "bottom top",
    scrub: 1.8,
  },
  pin: {
    start: "top top",
    end:   "+=100%",
    pin:   true,
    scrub: 1,
  },
} as const;

export const fromPresets = {
  fadeUp: {
    opacity:  0,
    y:        40,
    duration: duration.slow,
    ease:     ease.entrance,
  },
  fadeUpSubtle: {
    opacity:  0,
    y:        20,
    duration: duration.moderate,
    ease:     ease.entrance,
  },
  fadeIn: {
    opacity:  0,
    duration: duration.moderate,
    ease:     ease.gentle,
  },
  fadeDown: {
    opacity:  0,
    y:        -30,
    duration: duration.slow,
    ease:     ease.entrance,
  },
  slideLeft: {
    opacity:  0,
    x:        -60,
    duration: duration.slow,
    ease:     ease.entrance,
  },
  slideRight: {
    opacity:  0,
    x:        60,
    duration: duration.slow,
    ease:     ease.entrance,
  },
  scaleReveal: {
    opacity:  0,
    scale:    0.94,
    duration: duration.slow,
    ease:     ease.entrance,
  },
  clipReveal: {
    clipPath: "inset(0 100% 0 0)",
    duration: duration.slower,
    ease:     ease.cinematic,
  },
  splitLine: {
    opacity:  0,
    y:        "110%",
    duration: duration.slow,
    ease:     ease.splitText,
  },
  splitWord: {
    opacity:  0,
    y:        30,
    duration: duration.moderate,
    ease:     ease.splitText,
  },
  splitChar: {
    opacity:  0,
    y:        20,
    rotateX:  20,
    duration: duration.normal,
    ease:     ease.splitText,
  },
} as const;

export type EaseKey     = keyof typeof ease;
export type DurationKey = keyof typeof duration;
export type StaggerKey  = keyof typeof stagger;
export type PresetKey   = keyof typeof fromPresets;