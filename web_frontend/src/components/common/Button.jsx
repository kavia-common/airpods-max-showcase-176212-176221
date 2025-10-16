import React from "react";

/**
 * PUBLIC_INTERFACE
 * Minimal button/link component aligned with Ocean Professional theme.
 * Renders an anchor if href is provided, otherwise a button element.
 */
// PUBLIC_INTERFACE
export default function Button({
  children,
  variant = "default", // "default" | "primary"
  href,
  external = false,
  className = "",
  ...rest
}) {
  const classes = ["btn", variant === "primary" ? "btn-primary" : "", className]
    .filter(Boolean)
    .join(" ");

  if (href) {
    return (
      <a
        className={classes}
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  );
}
