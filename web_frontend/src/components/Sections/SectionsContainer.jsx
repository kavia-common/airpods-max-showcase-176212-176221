import React, { useEffect, useRef } from 'react';
import Section from './Section';
import { sectionsData } from './SectionsConfig';
import { createMasterTimeline } from '../../animation/scrollTimelines';

/**
 * PUBLIC_INTERFACE
 * SectionsContainer stacks the configured sections vertically.
 * It uses semantic main/section structure and keeps the Three.js canvas pinned behind.
 * Also wires up the GSAP master timeline synchronized to section labels.
 */
// PUBLIC_INTERFACE
export default function SectionsContainer() {
  const cleanupRef = useRef(null);

  useEffect(() => {
    // Defer timeline creation until after mount to ensure DOM elements exist.
    // The Three API is accessed via a window-shared reference set by ThreeCanvas.
    // This avoids prop drilling and keeps the API decoupled.
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReduced) {
      const threeApi = window.__threeAirpodsApi || null;
      cleanupRef.current = createMasterTimeline({ threeApi });
    }

    return () => {
      if (cleanupRef.current) {
        try {
          cleanupRef.current();
        } catch (_e) {
          // ignore
        }
        cleanupRef.current = null;
      }
    };
  }, []);

  return (
    <main className="sections" role="main" aria-label="AirPods Max showcase sections">
      {/* Hero-like first section may use h1 for the page; handled inside Section via title and aria */}
      {sectionsData.map((s) => {
        const ctas =
          Array.isArray(s.cta) && s.cta.length
            ? (
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }} role="group" aria-label={`${s.title} actions`}>
                {s.cta.map((c, idx) => {
                  const content = (
                    <span>
                      {c.label}
                    </span>
                  );
                  const className = c.type === 'primary' ? 'btn btn-primary' : 'btn';
                  if (c.href) {
                    return (
                      <a
                        key={`${s.id}-cta-${idx}`}
                        className={className}
                        href={c.href}
                        target={c.external ? '_blank' : undefined}
                        rel={c.external ? 'noreferrer' : undefined}
                        aria-label={c.external ? `${c.label} (opens in a new tab)` : c.label}
                      >
                        {content}
                      </a>
                    );
                  }
                  return (
                    <button
                      key={`${s.id}-cta-${idx}`}
                      className={className}
                      type="button"
                      aria-label={c.label}
                    >
                      {content}
                    </button>
                  );
                })}
              </div>
            )
            : null;

        // For the very first section, promote the title to h1 semantics for accessibility.
        const isFirst = s.id === sectionsData[0].id;

        return (
          <Section
            key={s.id}
            id={s.id}
            label={s.label}
            eyebrow={s.eyebrow}
            title={
              isFirst ? (
                // eslint-disable-next-line jsx-a11y/heading-has-content
                <h1 className="headline" id={`${s.id}-title`}>
                  {s.title}
                </h1>
              ) : (
                s.title
              )
            }
            subtitle={s.subtitle}
            ctaArea={ctas}
            tone={s.tone}
            as="section"
          />
        );
      })}
      <div className="spacer-xxl" />
    </main>
  );
}
