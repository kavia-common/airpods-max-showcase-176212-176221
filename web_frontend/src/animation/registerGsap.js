import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * PUBLIC_INTERFACE
 * Registers GSAP and ScrollTrigger once and returns references.
 * Use this helper anywhere timelines are created to avoid duplicate plugin registration.
 */
// PUBLIC_INTERFACE
export function registerGsap() {
  /** Idempotent GSAP plugin registration returning gsap and ScrollTrigger. */
  if (!gsap.core?.globals()?.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }
  return { gsap, ScrollTrigger };
}
