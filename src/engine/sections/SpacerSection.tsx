import type { SectionProps } from "../types";
import { getSetting } from "../utils/resolve";

/** Breathing room between sections. */
export function SpacerSection(props: SectionProps) {
  const settings = props.section.settings ?? {};
  const height = getSetting(settings, "height", null);
  const style: React.CSSProperties = height
    ? { height: typeof height === "number" ? `${height}px` : height }
    : {};

  return <div className="spacer" style={style} aria-hidden="true" />;
}