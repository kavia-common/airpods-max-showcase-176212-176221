//
// PUBLIC_INTERFACE
/**
 * Data configuration for scrollytelling sections.
 * Keep copy minimal and aligned with the Ocean Professional theme.
 * Each section includes an id (for anchors), a GSAP label, and content strings.
 */
export const sectionsData = [
  {
    id: 'intro',
    label: 'intro',
    eyebrow: 'Ocean Professional',
    title: 'AirPods Max',
    subtitle:
      'A premium, scroll‑driven showcase with a high‑fidelity 3D model pinned behind content.',
    tone: 'glass',
    cta: [
      { type: 'primary', label: 'Get Started', href: '#features' },
      { type: 'default', label: 'GSAP Docs', href: 'https://greensock.com/scrolltrigger/', external: true },
    ],
  },
  {
    id: 'design',
    label: 'design',
    eyebrow: 'Design',
    title: 'Minimal. Precise.',
    subtitle: 'Clean typography and spacious layout inspired by Apple’s product pages.',
    tone: 'surface',
  },
  {
    id: 'performance',
    label: 'performance',
    eyebrow: 'Performance',
    title: 'Smooth and responsive.',
    subtitle: 'Optimized Three.js renderer with capped device pixel ratio for clarity and speed.',
    tone: 'glass',
  },
  {
    id: 'timing',
    label: 'timing',
    eyebrow: 'Scroll Timing',
    title: 'Scrollytelling ready.',
    subtitle: 'Prepared labels and structure for GSAP ScrollTrigger timelines.',
    tone: 'surface',
  },
  {
    id: 'features',
    label: 'features',
    eyebrow: 'Highlights',
    title: 'Built to extend.',
    subtitle: 'Add chapters, bind animations, and refine the art direction with ease.',
    tone: 'glass',
  },
  {
    id: 'cta',
    label: 'cta',
    eyebrow: 'Next',
    title: 'Start exploring.',
    subtitle: 'Scroll to see more or jump into the code and connect animations.',
    tone: 'surface',
    cta: [
      { type: 'primary', label: 'View Code', href: 'https://greensock.com', external: true },
    ],
  },
];
