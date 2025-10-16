//
// PUBLIC_INTERFACE
/**
 * Registers GSAP plugins used across the app in a single place.
 * Currently registers ScrollTrigger. Import and call once at app bootstrap.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// PUBLIC_INTERFACE
export function registerGsapPlugins() {
  /** Register GSAP plugins safely (idempotent). */
  if (!gsap.core?.globals()?.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }
  return { gsap, ScrollTrigger };
}
