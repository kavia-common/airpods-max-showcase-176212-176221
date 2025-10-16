import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Section component for scrollytelling chapters.
 * Renders a semantic section with optional eyebrow (badge), title, subtitle, and CTA area.
 * Includes data attributes for GSAP timeline labels and an id for anchor navigation.
 */
// PUBLIC_INTERFACE
export default function Section({
  id,
  label,
  eyebrow,
  title,
  subtitle,
  children,
  ctaArea = null,
  tone = 'surface', // 'surface' | 'glass'
  as = 'section',
}) {
  const Tag = as;

  return (
    <Tag
      className="section"
      id={id}
      aria-labelledby={id ? `${id}-title` : undefined}
      data-section-label={label}
      data-chapter={id}
    >
      <div
        className="card container"
        data-tone={tone}
        style={{
          ...(tone === 'glass'
            ? {
                background: 'rgba(255,255,255,0.92)',
                backdropFilter: 'saturate(180%) blur(8px)',
                WebkitBackdropFilter: 'saturate(180%) blur(8px)',
              }
            : {}),
        }}
      >
        <header aria-describedby={subtitle ? `${id}-subtitle` : undefined}>
          {eyebrow ? (
            <p className="badge" aria-label="Section category">
              {eyebrow}
            </p>
          ) : null}
          {title ? (
            // If title is a string/number, render as h2; if it's a React node (e.g., h1), render directly
            typeof title === 'string' || typeof title === 'number' ? (
              <h2 id={id ? `${id}-title` : undefined} className="title">
                {title}
              </h2>
            ) : (
              title
            )
          ) : null}
          {subtitle ? <p className="subtitle" id={`${id}-subtitle`}>{subtitle}</p> : null}
        </header>

        {children ? <div className="section-body">{children}</div> : null}

        {ctaArea ? (
          <div className="section-cta" role="group" aria-label="Section actions">
            {ctaArea}
          </div>
        ) : null}
      </div>
    </Tag>
  );
}
