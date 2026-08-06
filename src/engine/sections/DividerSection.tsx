import type { SectionProps } from "../types";
import { getSetting } from "../utils/resolve";

interface DividerContent {
  symbol?: string;
}

/** Ornamental or hairline divider. */
export function DividerSection(props: SectionProps) {
  const c = (props.content ?? {}) as DividerContent;
  const settings = props.section.settings ?? {};
  const variant = getSetting<string>(settings, "variant", "ornament");

  if (variant === "line") {
    return <hr className="divider divider--line" aria-hidden="true" />;
  }

  return (
    <div className="divider" role="separator" aria-hidden="true">
      <span className="divider__line" />
      <span className="divider__glyph">{c.symbol ?? "âœ¦"}</span>
      <span className="divider__line" />
    </div>
  );
}