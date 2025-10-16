import { render } from '@testing-library/react';
import React from 'react';
import App from '../App';

// We need fine-grained control over gsap timeline to assert label registration.
// Mock gsap and ScrollTrigger to capture calls.
// Define spies inside the mock factory to satisfy Jest's scope rules.
let addLabelSpyRef;
let scrollTriggerCreateSpyRef;

// Create the spies that will be assigned to refs
const mockAddLabelSpy = jest.fn();
const mockScrollTriggerCreateSpy = jest.fn(() => ({ kill: jest.fn(), trigger: null }));

jest.mock('gsap', () => {
  const timelineSpy = jest.fn(() => ({
    addLabel: mockAddLabelSpy,
    fromTo: jest.fn(),
    to: jest.fn(),
    eventCallback: jest.fn(),
    kill: jest.fn(),
    scrollTrigger: { kill: jest.fn() },
  }));

  const matchMediaObj = {
    add: jest.fn((_conds, cb) => {
      // Call the callback with desktop conditions
      const cleanup = cb({ conditions: { isDesktop: true, isTablet: false, isPhone: false } });
      return cleanup || (() => {});
    }),
    kill: jest.fn(),
  };

  const gsap = {
    core: { globals: () => ({}) },
    registerPlugin: jest.fn(),
    set: jest.fn(),
    to: jest.fn(),
    timeline: timelineSpy,
    matchMedia: jest.fn(() => matchMediaObj),
  };
  
  return gsap;
});

jest.mock('gsap/ScrollTrigger', () => {
  const st = {
    create: mockScrollTriggerCreateSpy,
    getAll: jest.fn(() => []),
    refresh: jest.fn(),
  };
  
  return { ScrollTrigger: st, default: st };
});

// Assign the refs after mocks are defined
addLabelSpyRef = mockAddLabelSpy;
scrollTriggerCreateSpyRef = mockScrollTriggerCreateSpy;

// Mock Three hook to avoid WebGL and provide a stubbed camera/scene used by timelines
jest.mock('../three/useThreeAirpods', () => {
  return {
    useThreeAirpods: () => ({
      isReady: true,
      renderer: null,
      camera: {
        position: { x: 0.5, y: 0.35, z: 2.2 },
        isPerspectiveCamera: true,
        lookAt: jest.fn(),
      },
      scene: { children: [] },
      requestRender: jest.fn(),
    }),
  };
});

// Ensure matchMedia exists and returns non-reduced motion
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

afterEach(() => {
  addLabelSpyRef?.mockClear?.();
  scrollTriggerCreateSpyRef?.mockClear?.();
});

test('registers scroll timeline labels for each configured section', () => {
  render(<App />);

  // SectionsConfig defines labels: intro, design, performance, timing, features, cta
  // We expect addLabel to be called with these labels at least once
  const expectedLabels = ['intro', 'design', 'performance', 'timing', 'features', 'cta'];

  // Collect first args of addLabel calls
  const calls = (addLabelSpyRef?.mock?.calls || []).map((c) => c[0]);

  expectedLabels.forEach((label) => {
    expect(calls).toContain(label);
  });

  // Ensure the pin ScrollTrigger was created for container pinning
  expect(scrollTriggerCreateSpyRef).toHaveBeenCalled();
});
