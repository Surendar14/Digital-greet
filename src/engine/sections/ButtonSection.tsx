import type { SectionProps } from "../types";
import { SectionShell } from "../components/SectionShell";
import { Button } from "../components/Button";

interface ButtonContent {
  label?: string;
  /** "#section-id" scrolls to a section; http(s) links open. */
  target?: string;
  variant?: "primary" | "secondary" | "ghost";
}

/** Standalone CTA. */
export function ButtonSection(props: SectionProps) {
  const c = (props.content ?? {}) as ButtonContent;
  if (!c.label) return null;

  const onClick = () => {
    if (!c.target) return;
    if (c.target.startsWith("#")) props.scrollToSection(c.target.slice(1));
    else if (/^https?:/.test(c.target)) window.open(c.target, "_blank", "noopener,noreferrer");
  };

  return (
    <SectionShell section={props.section} className="cta-shell">
      <Button label={c.label} variant={c.variant ?? "primary"} size="lg" onClick={onClick} />
    </SectionShell>
  );
}