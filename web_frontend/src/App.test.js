import { render, screen } from '@testing-library/react';
import App from './App';

// Mock Three.js heavy modules used by useThreeAirpods to avoid WebGL in tests
jest.mock('./three/useThreeAirpods', () => {
  return {
    useThreeAirpods: () => ({
      isReady: true,
      renderer: null,
      camera: { position: { x: 0.5, y: 0.35, z: 2.2 }, isPerspectiveCamera: true, lookAt: jest.fn() },
      scene: { children: [] },
      requestRender: jest.fn(),
    }),
  };
});

// Mock gsap core and ScrollTrigger used across app to avoid DOM/RAF complexity
jest.mock('gsap', () => {
  const matchMediaObj = {
    add: jest.fn((_conds, cb) => {
      // Directly call the callback with fake conditions similar to desktop by default
      const cleanup = cb({ conditions: { isDesktop: true, isTablet: false, isPhone: false } });
      return cleanup || (() => {});
    }),
    kill: jest.fn(),
  };

  const timelineObj = {
    addLabel: jest.fn(),
    fromTo: jest.fn(),
    to: jest.fn(),
    eventCallback: jest.fn(),
    kill: jest.fn(),
    scrollTrigger: { kill: jest.fn() },
  };

  const gsap = {
    core: { globals: () => ({}) },
    registerPlugin: jest.fn(),
    set: jest.fn(),
    to: jest.fn(),
    timeline: jest.fn(() => timelineObj),
    matchMedia: jest.fn(() => matchMediaObj),
  };
  return gsap;
});

jest.mock('gsap/ScrollTrigger', () => {
  const st = {
    create: jest.fn(() => ({ kill: jest.fn(), trigger: null })),
    getAll: jest.fn(() => []),
    refresh: jest.fn(),
  };
  // Module exports ScrollTrigger named export in real impl; here default export must be object exposing same
  return {
    ScrollTrigger: st,
    default: st,
  };
});

// Minor helper: force reduced motion off to exercise main timeline path in tests
beforeAll(() => {
  const mockMatch = (query) => ({
    matches: query.includes('prefers-reduced-motion') ? false : true,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    onchange: null,
    dispatchEvent: jest.fn(),
  });
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(mockMatch),
  });
});

test('App renders without crashing and mounts key layers', () => {
  render(<App />);

  // Canvas layer present
  const canvasLayer = document.querySelector('.canvas-layer');
  expect(canvasLayer).toBeInTheDocument();

  // Three canvas element rendered inside layer
  const canvas = canvasLayer.querySelector('canvas');
  expect(canvas).toBeInTheDocument();

  // Sections container present
  const sections = document.querySelector('.sections');
  expect(sections).toBeInTheDocument();

  // At least one configured section by aria labels or titles exists (from SectionsConfig)
  expect(screen.getByRole('main', { name: /AirPods Max showcase sections/i })).toBeInTheDocument();

  // The hero headline "AirPods Max" should be present
  expect(screen.getByRole('heading', { name: /AirPods Max/i, level: 1 })).toBeInTheDocument();
});
