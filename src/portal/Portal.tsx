import { useCallback, useEffect, useMemo, useState } from "react";
import manifest from "../templates/love/manifest.json";
import { getOverrides, setOverrides, clearOverrides, buildShareUrl, readUrlOverrides } from "./storage";
import "./Portal.css";

/* ── Types ────────────────────────────────────────────────────────── */

interface FieldDef {
  key: string;
  label: string;
  type: "text" | "textarea" | "date" | "select" | "array-text" | "array-reasons" | "array-timeline" | "array-photos";
  options?: string[];
}

interface FieldGroup {
  id: string;
  title: string;
  fields: FieldDef[];
}

/* ── Field definitions ────────────────────────────────────────────── */

const GROUPS: FieldGroup[] = [
  {
    id: "opening",
    title: "Opening",
    fields: [
      { key: "recipient_name", label: "Recipient name", type: "text" },
      { key: "sender_name", label: "Sender name", type: "text" },
      { key: "headline", label: "Hero headline", type: "text" },
      { key: "subtitle", label: "Hero subtitle", type: "text" },
      { key: "welcome_kicker", label: "Welcome kicker", type: "text" },
      { key: "welcome_title", label: "Welcome title", type: "text" },
      { key: "welcome_prompt", label: "Welcome prompt", type: "text" },
      { key: "cta_primary", label: "CTA button", type: "text" },
      { key: "badge", label: "Badge text", type: "text" },
    ],
  },
  {
    id: "story",
    title: "Story",
    fields: [
      { key: "story_kicker", label: "Kicker", type: "text" },
      { key: "story_title", label: "Title", type: "text" },
      { key: "story_paragraphs", label: "Paragraphs (separate with blank lines)", type: "array-text" },
      { key: "story_signature", label: "Signature", type: "text" },
    ],
  },
  {
    id: "quote",
    title: "Quote",
    fields: [
      { key: "quote_kicker", label: "Kicker", type: "text" },
      { key: "quote_text", label: "Quote text", type: "textarea" },
      { key: "quote_source", label: "Source", type: "text" },
    ],
  },
  {
    id: "gallery",
    title: "Gallery",
    fields: [
      { key: "gallery_kicker", label: "Kicker", type: "text" },
      { key: "gallery_title", label: "Title", type: "text" },
      { key: "gallery_subtitle", label: "Subtitle", type: "text" },
      { key: "gallery_mode", label: "Layout mode", type: "select", options: ["masonry", "grid", "carousel"] },
      { key: "photos", label: "Photos", type: "array-photos" },
    ],
  },
  {
    id: "video",
    title: "Video",
    fields: [
      { key: "video_title", label: "Title", type: "text" },
      { key: "video_subtitle", label: "Subtitle", type: "text" },
      { key: "video_caption", label: "Caption", type: "text" },
    ],
  },
  {
    id: "message",
    title: "Message",
    fields: [
      { key: "message_kicker", label: "Kicker", type: "text" },
      { key: "message_title", label: "Title", type: "text" },
      { key: "special_message", label: "Letter body (separate with blank lines)", type: "array-text" },
    ],
  },
  {
    id: "music",
    title: "Music",
    fields: [
      { key: "music_meta.title", label: "Track title", type: "text" },
      { key: "music_meta.artist", label: "Artist", type: "text" },
      { key: "music_title", label: "Section title", type: "text" },
      { key: "music_note", label: "Note", type: "text" },
    ],
  },
  {
    id: "countdown",
    title: "Countdown",
    fields: [
      { key: "countdown_title", label: "Title", type: "text" },
      { key: "countdown_subtitle", label: "Subtitle", type: "text" },
      { key: "event_date", label: "Event date", type: "date" },
      { key: "countdown_label", label: "Label", type: "text" },
    ],
  },
  {
    id: "reasons",
    title: "Reasons",
    fields: [
      { key: "reasons_kicker", label: "Kicker", type: "text" },
      { key: "reasons_title", label: "Title", type: "text" },
      { key: "reasons_subtitle", label: "Subtitle", type: "text" },
      { key: "reasons", label: "Reasons", type: "array-reasons" },
    ],
  },
  {
    id: "timeline",
    title: "Timeline",
    fields: [
      { key: "timeline_title", label: "Title", type: "text" },
      { key: "timeline_subtitle", label: "Subtitle", type: "text" },
      { key: "timeline", label: "Entries", type: "array-timeline" },
    ],
  },
  {
    id: "surprise",
    title: "Surprise",
    fields: [
      { key: "surprise_kicker", label: "Kicker", type: "text" },
      { key: "surprise_title", label: "Title", type: "text" },
      { key: "surprise_button", label: "Button label", type: "text" },
      { key: "surprise_after_title", label: "Reveal title", type: "text" },
      { key: "surprise_message", label: "Reveal message", type: "textarea" },
    ],
  },
  {
    id: "footer",
    title: "Footer",
    fields: [
      { key: "footer_kicker", label: "Kicker", type: "text" },
      { key: "closing_message", label: "Closing message", type: "text" },
      { key: "closing_date", label: "Date", type: "text" },
      { key: "footer_note", label: "Note", type: "text" },
    ],
  },
];

/* ── Helpers ──────────────────────────────────────────────────────── */

function getByPath(obj: Record<string, unknown>, path: string): unknown {
  let current: unknown = obj;
  for (const part of path.split(".")) {
    if (current && typeof current === "object" && part in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return current;
}

function setByPath(obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const parts = path.split(".");
  const result = { ...obj };
  let current: Record<string, unknown> = result;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    const existing = current[part];
    current[part] = typeof existing === "object" && existing !== null ? { ...(existing as Record<string, unknown>) } : {};
    current = current[part] as Record<string, unknown>;
  }
  current[parts[parts.length - 1]] = value;
  return result;
}

const defaults = manifest.fields as Record<string, unknown>;

/* ── Inline structured editors ────────────────────────────────────── */

function ReasonsEditor({ value, onChange }: { value: unknown; onChange: (v: unknown) => void }) {
  const items = Array.isArray(value) ? (value as Array<Record<string, string>>) : [];
  const update = (next: typeof items) => onChange(next);
  return (
    <div className="p-list">
      {items.map((item, i) => (
        <div className="p-list__item" key={i}>
          <div className="p-list__fields">
            <input
              placeholder="Title"
              value={item.title ?? ""}
              onChange={(e) => {
                const copy = [...items];
                copy[i] = { ...copy[i], title: e.target.value };
                update(copy);
              }}
            />
            <textarea
              placeholder="Text"
              value={item.text ?? ""}
              rows={2}
              onChange={(e) => {
                const copy = [...items];
                copy[i] = { ...copy[i], text: e.target.value };
                update(copy);
              }}
            />
          </div>
          <button
            type="button"
            className="p-list__remove"
            onClick={() => update(items.filter((_, j) => j !== i))}
            aria-label="Remove"
          >
            &times;
          </button>
        </div>
      ))}
      <button
        type="button"
        className="p-list__add"
        onClick={() => update([...items, { title: "", text: "" }])}
      >
        + Add reason
      </button>
    </div>
  );
}

function TimelineEditor({ value, onChange }: { value: unknown; onChange: (v: unknown) => void }) {
  const items = Array.isArray(value) ? (value as Array<Record<string, string>>) : [];
  const update = (next: typeof items) => onChange(next);
  return (
    <div className="p-list">
      {items.map((item, i) => (
        <div className="p-list__item" key={i}>
          <div className="p-list__fields">
            <input
              placeholder="Date label"
              value={item.date ?? ""}
              onChange={(e) => {
                const copy = [...items];
                copy[i] = { ...copy[i], date: e.target.value };
                update(copy);
              }}
            />
            <input
              placeholder="Title"
              value={item.title ?? ""}
              onChange={(e) => {
                const copy = [...items];
                copy[i] = { ...copy[i], title: e.target.value };
                update(copy);
              }}
            />
            <textarea
              placeholder="Text"
              value={item.text ?? ""}
              rows={2}
              onChange={(e) => {
                const copy = [...items];
                copy[i] = { ...copy[i], text: e.target.value };
                update(copy);
              }}
            />
            <input
              placeholder="Photo path (e.g. assets/gallery-pins/pin-02.jpg)"
              value={item.photo ?? ""}
              onChange={(e) => {
                const copy = [...items];
                copy[i] = { ...copy[i], photo: e.target.value };
                update(copy);
              }}
            />
          </div>
          <button
            type="button"
            className="p-list__remove"
            onClick={() => update(items.filter((_, j) => j !== i))}
            aria-label="Remove"
          >
            &times;
          </button>
        </div>
      ))}
      <button
        type="button"
        className="p-list__add"
        onClick={() => update([...items, { date: "", title: "", text: "", photo: "" }])}
      >
        + Add entry
      </button>
    </div>
  );
}

function PhotosEditor({ value, onChange }: { value: unknown; onChange: (v: unknown) => void }) {
  const items = Array.isArray(value) ? (value as Array<Record<string, string>>) : [];
  const update = (next: typeof items) => onChange(next);
  return (
    <div className="p-list">
      {items.map((item, i) => (
        <div className="p-list__item" key={i}>
          <div className="p-list__fields">
            <input
              placeholder="Image path (e.g. assets/gallery-pins/pin-01.jpg)"
              value={item.src ?? ""}
              onChange={(e) => {
                const copy = [...items];
                copy[i] = { ...copy[i], src: e.target.value };
                update(copy);
              }}
            />
            <input
              placeholder="Title"
              value={item.title ?? ""}
              onChange={(e) => {
                const copy = [...items];
                copy[i] = { ...copy[i], title: e.target.value };
                update(copy);
              }}
            />
            <input
              placeholder="Description"
              value={item.description ?? ""}
              onChange={(e) => {
                const copy = [...items];
                copy[i] = { ...copy[i], description: e.target.value };
                update(copy);
              }}
            />
          </div>
          <button
            type="button"
            className="p-list__remove"
            onClick={() => update(items.filter((_, j) => j !== i))}
            aria-label="Remove"
          >
            &times;
          </button>
        </div>
      ))}
      <button
        type="button"
        className="p-list__add"
        onClick={() => update([...items, { src: "", title: "", description: "" }])}
      >
        + Add photo
      </button>
    </div>
  );
}

/* ── Field renderer ───────────────────────────────────────────────── */

function FieldInput({
  field,
  fields,
  onChange,
}: {
  field: FieldDef;
  fields: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}) {
  const val = getByPath(fields, field.key);

  switch (field.type) {
    case "text":
    case "date":
      return (
        <input
          type={field.type === "date" ? "datetime-local" : "text"}
          value={typeof val === "string" ? val : String(val ?? "")}
          onChange={(e) => onChange(field.key, e.target.value)}
        />
      );
    case "textarea":
      return (
        <textarea
          value={typeof val === "string" ? val : String(val ?? "")}
          rows={3}
          onChange={(e) => onChange(field.key, e.target.value)}
        />
      );
    case "select":
      return (
        <select
          value={typeof val === "string" ? val : String(val ?? "")}
          onChange={(e) => onChange(field.key, e.target.value)}
        >
          {(field.options ?? []).map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    case "array-text": {
      const arr = Array.isArray(val) ? (val as string[]) : [];
      return (
        <textarea
          value={arr.join("\n\n")}
          rows={Math.max(3, arr.length * 2)}
          onChange={(e) => onChange(field.key, e.target.value.split(/\n{2,}/))}
        />
      );
    }
    case "array-reasons":
      return <ReasonsEditor value={val} onChange={(v) => onChange(field.key, v)} />;
    case "array-timeline":
      return <TimelineEditor value={val} onChange={(v) => onChange(field.key, v)} />;
    case "array-photos":
      return <PhotosEditor value={val} onChange={(v) => onChange(field.key, v)} />;
    default:
      return null;
  }
}

/* ── Main Portal ──────────────────────────────────────────────────── */

export default function Portal() {
  const merged = useMemo(() => {
    const urlOverrides = readUrlOverrides();
    const stored = getOverrides();
    // URL overrides take precedence (for shared links), then localStorage, then manifest defaults
    return { ...defaults, ...stored, ...(urlOverrides ?? {}) } as Record<string, unknown>;
  }, []);

  const [fields, setFields] = useState<Record<string, unknown>>(merged);
  const [activeGroup, setActiveGroup] = useState(GROUPS[0].id);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  // Persist to localStorage on every change
  const handleChange = useCallback((key: string, value: unknown) => {
    setFields((prev) => {
      const next = setByPath(prev, key, value);
      setOverrides(next);
      return next;
    });
  }, []);

  // Import from URL on first load if present
  useEffect(() => {
    const urlOverrides = readUrlOverrides();
    if (urlOverrides) {
      setOverrides({ ...getOverrides(), ...urlOverrides });
      // Clean the URL param so it doesn't persist on refresh
      window.history.replaceState(null, "", window.location.pathname + "#/portal");
    }
  }, []);

  const handlePreview = () => {
    window.location.hash = "/";
  };

  const handleShare = async () => {
    const url = buildShareUrl(fields);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      prompt("Copy this link:", url);
    }
  };

  const handleExport = () => {
    const json = JSON.stringify({ ...manifest, fields }, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "greeting-config.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result as string);
          const importedFields = parsed.fields ?? parsed;
          setFields(importedFields);
          setOverrides(importedFields);
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        } catch {
          alert("Invalid JSON file");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleReset = () => {
    if (!confirm("Reset all fields to defaults? This clears your saved changes.")) return;
    clearOverrides();
    setFields({ ...defaults });
  };

  const scrollTo = (id: string) => {
    setActiveGroup(id);
    document.getElementById(`group-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="portal">
      {/* Top bar */}
      <header className="portal__bar">
        <div className="portal__bar-left">
          <h1 className="portal__logo">Greeting Portal</h1>
          <span className="portal__badge">Editor</span>
        </div>
        <div className="portal__actions">
          <button type="button" className="portal__btn portal__btn--primary" onClick={handlePreview}>
            Preview
          </button>
          <button type="button" className="portal__btn" onClick={handleShare}>
            {copied ? "Copied!" : "Share Link"}
          </button>
          <button type="button" className="portal__btn" onClick={handleExport}>
            Export JSON
          </button>
          <button type="button" className="portal__btn" onClick={handleImport}>
            Import
          </button>
          <button type="button" className="portal__btn portal__btn--danger" onClick={handleReset}>
            Reset
          </button>
        </div>
      </header>

      <div className="portal__layout">
        {/* Sidebar nav */}
        <nav className="portal__nav">
          {GROUPS.map((g) => (
            <button
              key={g.id}
              type="button"
              className={`portal__nav-item${activeGroup === g.id ? " portal__nav-item--active" : ""}`}
              onClick={() => scrollTo(g.id)}
            >
              {g.title}
            </button>
          ))}
        </nav>

        {/* Content */}
        <main className="portal__content">
          {GROUPS.map((group) => (
            <section key={group.id} id={`group-${group.id}`} className="portal__group">
              <h2 className="portal__group-title">{group.title}</h2>
              <div className="portal__fields">
                {group.fields.map((field) => (
                  <div key={field.key} className="portal__field">
                    <label className="portal__label">{field.label}</label>
                    <FieldInput field={field} fields={fields} onChange={handleChange} />
                  </div>
                ))}
              </div>
            </section>
          ))}

          <div className="portal__footer">
            <p>Changes save automatically. Press <strong>Preview</strong> to see your greeting.</p>
            {saved && <p className="portal__toast">Imported successfully</p>}
          </div>
        </main>
      </div>
    </div>
  );
}
