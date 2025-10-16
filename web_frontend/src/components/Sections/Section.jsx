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
                background: 'rgba(255,255,255,0.88)',
                backdropFilter: 'saturate(180%) blur(6px)',
              }
            : {}),
        }}
      >
        <header>
          {eyebrow ? (
            <p className="badge" aria-label="section eyebrow">
              {eyebrow}
            </p>
          ) : null}
          {title ? (
            <h2 id={id ? `${id}-title` : undefined} className="title">
              {title}
            </h2>
          ) : null}
          {subtitle ? <p className="subtitle">{subtitle}</p> : null}
        </header>

        {children ? <div className="section-body">{children}</div> : null}

        {ctaArea ? (
          <div className="section-cta" role="group" aria-label="section actions">
            {ctaArea}
          </div>
        ) : null}
      </div>
    </Tag>
  );
}
