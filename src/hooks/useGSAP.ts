/**
 * useGSAP Hook
 * ============
 * Typed wrapper around @gsap/react's useGSAP for safe GSAP usage
 * within React components. Automatically creates a GSAP context
 * scoped to a ref and cleans up all animations on unmount.
 *
 * Usage:
 *   const containerRef = useRef<HTMLDivElement>(null);
 *   useGSAP(() => {
 *     gsap.from("[data-animate]", { opacity: 0 });
 *   }, { scope: containerRef, dependencies: [] });
 */

export { useGSAP } from "@gsap/react";
