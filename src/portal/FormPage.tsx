import { useCallback, useState } from "react";
import { encodeShareData } from "./storage";
import "./Portal.css";

/* ── Field groups for the user form ──────────────────────────────── */

interface FormGroup {
  id: string;
  title: string;
  description: string;
  fields: { key: string; label: string; type: "text" | "textarea" | "date"; placeholder?: string }[];
}

const GROUPS: FormGroup[] = [
  {
    id: "names",
    title: "Names",
    description: "Who is this greeting for?",
    fields: [
      { key: "recipient_name", label: "Recipient's name", type: "text", placeholder: "Sarah" },
      { key: "sender_name", label: "Your name", type: "text", placeholder: "Alex" },
    ],
  },
  {
    id: "opening",
    title: "Opening",
    description: "The first thing they see",
    fields: [
      { key: "headline", label: "Hero headline", type: "text", placeholder: "For you, who holds my heart" },
      { key: "subtitle", label: "Subtitle", type: "text", placeholder: "A small universe of moments we share" },
      { key: "welcome_kicker", label: "Welcome line", type: "text", placeholder: "You have a letter" },
      { key: "welcome_title", label: "Welcome title", type: "text", placeholder: "A love letter, in the quiet" },
      { key: "cta_primary", label: "Button text", type: "text", placeholder: "Begin our story" },
    ],
  },
  {
    id: "story",
    title: "Your Story",
    description: "Tell your story — each paragraph becomes a separate block",
    fields: [
      { key: "story_kicker", label: "Section label", type: "text", placeholder: "once upon a run, really" },
      { key: "story_title", label: "Section title", type: "text", placeholder: "How we became us" },
      { key: "story_paragraphs", label: "Story paragraphs (separate with blank lines)", type: "textarea", placeholder: "It began in an ordinary room...\n\nSince then, every everyday has earned its gold edge..." },
      { key: "story_signature", label: "Signature", type: "text", placeholder: "— first days, remembered kindly" },
    ],
  },
  {
    id: "quote",
    title: "Quote",
    description: "A quiet truth",
    fields: [
      { key: "quote_text", label: "Quote", type: "textarea", placeholder: "I have loved you the way a candle loves the night it warms..." },
      { key: "quote_source", label: "Source", type: "text", placeholder: "written by me, for you" },
    ],
  },
  {
    id: "message",
    title: "Letter",
    description: "Your personal message — the heart of the greeting",
    fields: [
      { key: "message_kicker", label: "Section label", type: "text", placeholder: "read me slowly" },
      { key: "message_title", label: "Section title", type: "text", placeholder: "A message, kept just for you" },
      { key: "special_message", label: "Letter body (separate paragraphs with blank lines)", type: "textarea", placeholder: "I have written this letter a thousand times..." },
    ],
  },
  {
    id: "surprise",
    title: "Finale",
    description: "The final reveal",
    fields: [
      { key: "surprise_kicker", label: "Section label", type: "text", placeholder: "one last thing" },
      { key: "surprise_title", label: "Section title", type: "text", placeholder: "Before you go" },
      { key: "surprise_button", label: "Button text", type: "text", placeholder: "Show me the surprise" },
      { key: "surprise_after_title", label: "Reveal title", type: "text", placeholder: "Forever starts now" },
      { key: "surprise_message", label: "Reveal message", type: "textarea", placeholder: "Will you keep writing this story with me?" },
    ],
  },
  {
    id: "footer",
    title: "Closing",
    description: "How it ends",
    fields: [
      { key: "footer_kicker", label: "Closing label", type: "text", placeholder: "faithfully yours" },
      { key: "closing_message", label: "Closing message", type: "text", placeholder: "Whatever this letter becomes, it was written true." },
      { key: "closing_date", label: "Date", type: "text", placeholder: "Valentine's, 2026" },
    ],
  },
];

/* ── Main Form Page ──────────────────────────────────────────────── */

export default function FormPage() {
  const [fields, setFields] = useState<Record<string, string>>({});
  const [activeGroup, setActiveGroup] = useState(GROUPS[0].id);
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = useCallback((key: string, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  }, []);

  const filledFields = Object.fromEntries(
    Object.entries(fields).filter(([, v]) => v.trim() !== "")
  );

  const buildConfig = () => {
    const config: Record<string, unknown> = { ...filledFields };
    // Convert story_paragraphs and special_message from textarea to array
    if (config.story_paragraphs && typeof config.story_paragraphs === "string") {
      config.story_paragraphs = (config.story_paragraphs as string).split(/\n{2,}/).filter(Boolean);
    }
    if (config.special_message && typeof config.special_message === "string") {
      config.special_message = (config.special_message as string).split(/\n{2,}/).filter(Boolean);
    }
    return config;
  };

  const handlePreview = () => {
    const config = buildConfig();
    const data = encodeShareData(config);
    window.location.href = `${window.location.origin}${window.location.pathname}?data=${data}#/`;
  };

  const handleShareLink = async () => {
    const config = buildConfig();
    const data = encodeShareData(config);
    const url = `${window.location.origin}${window.location.pathname}?data=${data}#/`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      prompt("Copy this link:", url);
    }
  };

  const handleExport = () => {
    const config = buildConfig();
    const json = JSON.stringify(config, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "greeting-config.json";
    a.click();
    URL.revokeObjectURL(url);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const scrollTo = (id: string) => {
    setActiveGroup(id);
    document.getElementById(`form-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="portal">
      {/* Top bar */}
      <header className="portal__bar">
        <div className="portal__bar-left">
          <h1 className="portal__logo">Customize Your Greeting</h1>
          <span className="portal__badge">Form</span>
        </div>
        <div className="portal__actions">
          <button type="button" className="portal__btn portal__btn--primary" onClick={handlePreview}>
            Preview
          </button>
          <button type="button" className="portal__btn" onClick={handleShareLink}>
            {copied ? "Link Copied!" : "Share Link"}
          </button>
          <button type="button" className="portal__btn" onClick={handleExport}>
            {submitted ? "Downloaded!" : "Export JSON"}
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
          <div className="portal__intro">
            <p>Fill in the fields below to personalize your digital greeting. Leave any field blank to use the default. When you're done, click <strong>Preview</strong> to see it, or <strong>Share Link</strong> to send it.</p>
          </div>

          {GROUPS.map((group) => (
            <section key={group.id} id={`form-${group.id}`} className="portal__group">
              <h2 className="portal__group-title">{group.title}</h2>
              <p className="portal__group-desc">{group.description}</p>
              <div className="portal__fields">
                {group.fields.map((field) => (
                  <div key={field.key} className="portal__field">
                    <label className="portal__label">{field.label}</label>
                    {field.type === "textarea" ? (
                      <textarea
                        placeholder={field.placeholder}
                        value={fields[field.key] ?? ""}
                        rows={4}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                      />
                    ) : (
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={fields[field.key] ?? ""}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}

          <div className="portal__footer">
            <p>Fill in as many or as few fields as you like. Blank fields use the default values.</p>
            <p>Click <strong>Preview</strong> to see your greeting, or <strong>Share Link</strong> to copy a URL you can send.</p>
          </div>
        </main>
      </div>
    </div>
  );
}
