import type { SectionProps } from "../types";
import { SectionShell } from "../components/SectionShell";
import { Icon } from "../components/Icon";

interface FooterContent {
  kicker?: string;
  message?: string;
  signature?: string;
  sender?: string;
  date?: string;
  note?: string;
}

/** Closing band: final message, signature, credits. */
export function FooterSection(props: SectionProps) {
  const c = (props.content ?? {}) as FooterContent;

  return (
    <SectionShell section={props.section} className="footer-shell">
      <footer className="footer" role="contentinfo">
        {c.kicker && <p className="footer__kicker">{c.kicker}</p>}
        {c.message && <h2 className="footer__message">{c.message}</h2>}
        {c.signature && <p className="footer__signature">{c.signature}</p>}
        {(c.sender || c.date) && (
          <p className="footer__meta">
            {c.sender}
            {c.sender && c.date ? " Â· " : ""}
            {c.date}
          </p>
        )}
        <div className="footer__heart" aria-hidden="true">
          <Icon name="heart" size={16} />
        </div>
        {c.note && <p className="footer__note">{c.note}</p>}
      </footer>
    </SectionShell>
  );
}