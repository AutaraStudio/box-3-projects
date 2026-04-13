/**
 * General Utilities
 * =================
 * Shared helper functions used across the entire application.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names with Tailwind-aware conflict resolution.
 * Combines clsx (conditional classes) with tailwind-merge
 * (deduplicates and resolves Tailwind utility conflicts).
 *
 * Usage:
 *   cn("px-4 py-2", isActive && "bg-theme-accent", className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
