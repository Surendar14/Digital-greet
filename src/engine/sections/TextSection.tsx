import type { SectionProps } from "../types";
import { SectionShell, SectionHeading } from "../components/SectionShell";
import { getSetting } from "../utils/resolve";

interface TextContent {
  kicker?: string;
  title?: string;
  subtitle?: string;
  /** Paragraphs â€” a string is split on blank lines. */
  body?: string | string[];
  signature?: string;
}

/** Editorial long-form text block (Our Story, Special Messageâ€¦). */
export function TextSection(props: SectionProps) {
  const c = (props.content ?? {}) as TextContent;
  const settings = props.section.settings ?? {};
  const dropcap = getSetting(settings, "dropcap", true);
  const paragraphs = Array.isArray(c.body)
    ? c.body
    : typeof c.body === "string"
      ? c.body.split(/\n{2,}/)
      : [];

  return (
    <SectionShell section={props.section}>
      <SectionHeading
        kicker={c.kicker}
        title={c.title}
        subtitle={c.subtitle}
        align={props.section.style?.align ?? "center"}
      />
      {paragraphs.length > 0 && (
        <div className={dropcap ? "text-body text-body--dropcap" : "text-body"}>
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      )}
      {c.signature && <p className="text-signature">{c.signature}</p>}
    </SectionShell>
  );
}