/**
 * Master GSAP timelines for scrollytelling.
 * - Pins the canvas layer while scrolling the overlay sections.
 * - Creates a scrubbed timeline with labels mapped to section ids.
 * - Controls camera and model parts via a provided Three controls API.
 * - Supports responsive variants via gsap.matchMedia and respects prefers-reduced-motion.
 */
import { registerGsap } from "./registerGsap";

/**
 * INTERNAL: Utility to get sections and labels from DOM dataset.
 */
function collectChapters() {
  const sections = Array.from(document.querySelectorAll('[data-chapter]'));
  return sections.map((el) => ({
    id: el.getAttribute('data-chapter'),
    label: el.getAttribute('data-section-label') || el.getAttribute('data-chapter'),
    el,
  }));
}

/**
 * INTERNAL: Build placeholder groups if real model parts aren't available yet.
 * This allows the timeline to run without errors and animate a no-op group.
 */
function ensureModelPart(obj, scene) {
  if (obj) return obj;
  // Create a placeholder object3D attached to scene so transforms apply
  const placeholder = { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } };
  return placeholder;
}

/**
 * PUBLIC_INTERFACE
 * Creates a master ScrollTrigger-driven timeline and returns cleanup.
 * The threeApi param should expose:
 *  - camera: THREE.PerspectiveCamera
 *  - scene: THREE.Scene
 *  - getModelParts?: () => { headband?: Object3D, cups?: Object3D|{left?:Object3D,right?:Object3D}, frame?:Object3D, root?:Object3D }
 *  - requestRender(): void // to force render on update if needed
 */
// PUBLIC_INTERFACE
export function createMasterTimeline({ threeApi, pinTargetSelector = ".canvas-layer", containerSelector = ".sections" }) {
  /**
   * Creates the master timeline and ScrollTrigger pinning.
   * Returns a function to kill the timeline and media queries on cleanup.
   */
  // Lazy-load GSAP on demand to reduce initial bundle/parse cost
  const { gsap, ScrollTrigger } = registerGsap();

  const chapters = collectChapters();
  const container = document.querySelector(containerSelector);
  const pinTarget = document.querySelector(pinTargetSelector);

  // Guard: if DOM not ready or missing targets, do nothing
  if (!container || !pinTarget || !chapters.length) {
    return () => {};
  }

  // Prefer reduced motion: disable heavy 3D timelines and pinning but keep gentle content fades
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) {
    chapters.forEach((c) => {
      gsap.set(c.el, { opacity: 0, y: 16 });
      ScrollTrigger.create({
        trigger: c.el,
        start: "top 80%",
        end: "top 20%",
        onEnter: () => gsap.to(c.el, { opacity: 1, y: 0, duration: 0.4, ease: "power1.out" }),
        onEnterBack: () => gsap.to(c.el, { opacity: 1, y: 0, duration: 0.4, ease: "power1.out" }),
      });
    });
    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (chapters.find((c) => c.el === st.trigger)) st.kill();
      });
    };
  }

  // Prepare Three objects and fallback placeholders
  const camera = threeApi?.camera || null;
  const scene = threeApi?.scene || null;
  const modelParts = typeof threeApi?.getModelParts === 'function' ? threeApi.getModelParts() : {};
  const root = ensureModelPart(modelParts?.root, scene);
  const headband = ensureModelPart(modelParts?.headband, scene);
  const cupsGroup = modelParts?.cups || {};
  const leftCup = ensureModelPart(cupsGroup?.left || cupsGroup, scene);
  const rightCup = ensureModelPart(cupsGroup?.right || cupsGroup, scene);
  const frame = ensureModelPart(modelParts?.frame, scene);

  // Master timeline
  const mm = gsap.matchMedia();
  let ctxCleanup = () => {};

  mm.add(
    {
      isDesktop: "(min-width: 1024px)",
      isTablet: "(min-width: 640px) and (max-width: 1023px)",
      isPhone: "(max-width: 639px)",
    },
    (context) => {
      const { isDesktop, isTablet } = context.conditions;

      const sectionHeightFactor = isDesktop ? 120 : isTablet ? 110 : 100;

      const pinST = ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: () => `+=${chapters.length * sectionHeightFactor}vh`,
        pin: pinTarget,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: () => `+=${chapters.length * sectionHeightFactor}vh`,
          scrub: 1,
          invalidateOnRefresh: true,
        },
        onUpdate: () => {
          if (typeof threeApi?.requestRender === "function") threeApi.requestRender();
        },
      });

      chapters.forEach((c, idx) => {
        tl.addLabel(c.label || c.id || `chapter-${idx}`);
      });

      const cam = camera;
      if (cam) {
        tl.fromTo(
          cam.position,
          { x: cam.position.x, y: cam.position.y, z: cam.position.z },
          { x: 0.4, y: 0.3, z: 2.0, duration: 1 },
          "intro"
        );
      }

      const explodeOffset = isDesktop ? 0.6 : isTablet ? 0.5 : 0.4;
      tl.to(
        headband.position,
        { y: headband.position.y + explodeOffset, duration: 1 },
        "design"
      );
      tl.to(
        leftCup.position,
        { x: (leftCup.position.x || 0) - explodeOffset, z: (leftCup.position.z || 0) + explodeOffset, duration: 1 },
        "design"
      );
      tl.to(
        rightCup.position,
        { x: (rightCup.position.x || 0) + explodeOffset, z: (rightCup.position.z || 0) + explodeOffset, duration: 1 },
        "design"
      );
      tl.to(
        frame.position,
        { y: frame.position.y - explodeOffset * 0.5, duration: 1 },
        "design"
      );

      const rotAmt = isDesktop ? 0.6 : isTablet ? 0.5 : 0.4;
      tl.to(
        root.rotation,
        { y: "+=" + rotAmt, x: "+=" + rotAmt * 0.25, duration: 1 },
        "performance"
      );

      if (cam) {
        tl.to(
          cam.position,
          { x: 0.2, y: 0.25, z: 1.6, duration: 1 },
          "timing"
        );
      }

      tl.to(
        leftCup.scale,
        { x: 1.15, y: 1.15, z: 1.15, duration: 1 },
        "features"
      );
      tl.to(
        rightCup.scale,
        { x: 0.95, y: 0.95, z: 0.95, duration: 1 },
        "features"
      );

      tl.to(
        [headband.position, leftCup.position, rightCup.position, frame.position],
        { x: 0, y: 0, z: 0, duration: 1 },
        "cta"
      );
      tl.to(
        [leftCup.scale, rightCup.scale],
        { x: 1, y: 1, z: 1, duration: 1 },
        "cta"
      );
      if (cam) {
        tl.to(
          cam.position,
          { x: 0.5, y: 0.35, z: 2.2, duration: 1 },
          "cta"
        );
      }

      if (cam) {
        tl.eventCallback("onUpdate", () => {
          try {
            cam.lookAt(0, 0, 0);
          } catch (_) {}
          if (typeof threeApi?.requestRender === "function") threeApi.requestRender();
        });
      }

      ctxCleanup = () => {
        tl.scrollTrigger?.kill();
        tl.kill();
        pinST?.kill();
      };

      return () => {
        ctxCleanup?.();
      };
    }
  );

  return () => {
    try {
      mm.kill();
      ctxCleanup?.();
    } catch (_e) {}
  };
}
