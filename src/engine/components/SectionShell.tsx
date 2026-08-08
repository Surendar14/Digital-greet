import type { CSSProperties, ReactNode } from "react";
import type { SectionConfig } from "../types";
import { cx, px } from "../utils/resolve";

/**
 * Uniform section scaffolding: vertical rhythm (density), centered
 * content column (maxWidth), optional band background.
 * Fully driven by `section.style`.
 */
export function SectionShell({
  section,
  className,
  children,
  id
}: {
  section: SectionConfig;
  className?: string;
  children: ReactNode;
  id?: string;
}) {
  const style = section.style ?? {};
  const density = style.density ?? "default";
  const styleObj: CSSProperties = {
    "--maxw": style.maxWidth ?? "680px",
    paddingBlock: style.paddingBlock,
    minHeight: style.fullHeight ? "100svh" : style.minHeight,
    color: style.textColor
  } as CSSProperties;

  return (
    <div
      className={cx("section-shell", `section-shell--${density}`, className)}
      style={styleObj}
      id={id ? `section-${id}` : `section-${section.id}`}
      data-section={section.id}
    >
      <div
        className={cx(
          "section-shell__inner",
          style.align && `section-shell--align-${style.align}`
        )}
      >
        {children}
      </div>
    </div>
  );
}

/** Section heading block shared by most sections. */
export function SectionHeading({
  kicker,
  title,
  subtitle,
  align
}: {
  kicker?: string;
  title?: string;
  subtitle?: string;
  align?: "center" | "left" | "right";
}) {
  return (
    <header className={cx("section-heading", align && `section-heading--${align}`)}>
      {kicker && <p className="section-heading__kicker">{kicker}</p>}
      {title && <h2 className="section-heading__title">{title}</h2>}
      {subtitle && <p className="section-heading__subtitle">{subtitle}</p>}
    </header>
  );
}