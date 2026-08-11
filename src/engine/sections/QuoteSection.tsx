import type { SectionProps } from "../types";
import { SectionShell } from "../components/SectionShell";
import { Icon } from "../components/Icon";

interface QuoteContent {
  kicker?: string;
  quote?: string;
  source?: string;
}

/** Pull-quote with decorative mark. */
export function QuoteSection(props: SectionProps) {
  const c = (props.content ?? {}) as QuoteContent;
  if (!c.quote && !c.source) return null;

  return (
    <SectionShell section={props.section} className="quote-shell">
      <figure className="quote">
        <Icon name="quote" size={34} className="quote__mark" />
        <blockquote className="quote__text">{c.quote}</blockquote>
        {c.source && <figcaption className="quote__source">— {c.source}</figcaption>}
      </figure>
    </SectionShell>
  );
}