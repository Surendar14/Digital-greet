/**
 * Config Inspector — an opt-in developer tool (`?inspect=1`) that
 * demonstrates the data-driven engine: edit fields, toggle sections
 * on/off, reorder sections — all live, with no code changes.
 */

import type { SectionConfig, ThemeConfig } from "../types";
import { cx } from "../utils/resolve";
import { Icon } from "./Icon";

const EDITABLE_FIELDS = [
  "recipient_name",
  "sender_name",
  "headline",
  "subtitle",
  "welcome_kicker",
  "welcome_title",
  "story_title",
  "quote_text",
  "quote_source",
  "message_title",
  "countdown_title",
  "surprise_title",
  "closing_message",
  "event_date",
  "cta_primary",
  "cta_secondary"
];

export function Inspector({
  open,
  sections,
  fields,
  onToggle,
  onSectionsChange,
  onFieldChange,
  theme
}: {
  open: boolean;
  sections: SectionConfig[];
  fields: Record<string, unknown>;
  onToggle: () => void;
  onSectionsChange: (sections: SectionConfig[]) => void;
  onFieldChange: (key: string, value: unknown) => void;
  theme: ThemeConfig;
}) {
  const isInspect =
    typeof window !== "undefined" && new URLSearchParams(window.location.search).has("inspect");

  if (!isInspect) return null;

  if (!open) {
    return (
      <button type="button" className="inspect-fab" onClick={onToggle} aria-label="Open config inspector">
        <Icon name="sparkle" size={16} /> Config
      </button>
    );
  }

  const toggleEnabled = (id: string) => {
    onSectionsChange(
      sections.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const move = (id: string, dir: -1 | 1) => {
    const copy = [...sections];
    const from = copy.findIndex((s) => s.id === id);
    const to = from + dir;
    if (from < 0 || to < 0 || to >= copy.length) return;
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item);
    onSectionsChange(copy.map((s, i) => ({ ...s, order: i + 1 })));
  };

  const ordered = [...sections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <aside className="inspector" role="region" aria-label="Template config inspector">
      <header className="inspector__head">
        <span>
          Config Inspector
          <em>{theme.id}.json</em>
        </span>
        <button type="button" onClick={onToggle} aria-label="Close inspector">
          <Icon name="x" size={16} />
        </button>
      </header>

      <div className="inspector__body">
        <section className="inspector__group">
          <h4>Editable fields</h4>
          {EDITABLE_FIELDS.map((key) => {
            const value = fields[key];
            if (typeof value !== "string" && typeof value !== "number") return null;
            return (
              <label key={key} className="inspector__field">
                <span>{key}</span>
                <input
                  type="text"
                  value={String(value)}
                  onChange={(e) => onFieldChange(key, e.target.value)}
                />
              </label>
            );
          })}
        </section>

        <section className="inspector__group">
          <h4>Sections ({ordered.length})</h4>
          {ordered.map((s, i) => (
            <div key={s.id} className={cx("inspector__row", !s.enabled && "is-off")}>
              <input
                type="checkbox"
                checked={s.enabled !== false}
                onChange={() => toggleEnabled(s.id)}
                aria-label={`Enable section ${s.id}`}
              />
              <div className="inspector__row-name">
                <span>{s.id}</span>
                <code>{s.type}</code>
              </div>
              <div className="inspector__row-tools">
                <button
                  type="button"
                  disabled={i === 0}
                  onClick={() => move(s.id, -1)}
                  aria-label={`Move ${s.id} up`}
                >
                  <Icon name="chevronUp" size={13} />
                </button>
                <button
                  type="button"
                  disabled={i === ordered.length - 1}
                  onClick={() => move(s.id, 1)}
                  aria-label={`Move ${s.id} down`}
                >
                  <Icon name="chevronDown" size={13} />
                </button>
              </div>
            </div>
          ))}
        </section>
      </div>
    </aside>
  );
}