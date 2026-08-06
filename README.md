# Digital Greeting — Template Engine

A reusable **template engine** for building cinematic, mobile-first digital greeting
experiences. The engine knows nothing about "Love", "Birthday", or "Proposal" — it only
knows how to render **sections from configuration**.

The first template, **Love**, ships as a complete package that
demonstrates the pattern: a rose-gold, on-midnight love letter with music, gallery,
timeline, countdown, and a surprise ending.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
```

| Command        | What it does                                    |
| -------------- | ----------------------------------------------- |
| `npm run dev`  | Dev server (Vite)                               |
| `npm run build`| Type-check + production build to `dist/`        |
| `npm run typecheck` | Run the TypeScript compiler only           |

> **Try the live config inspector:** open the app with `?inspect=1`. A small "Config"
> button appears. It lets you edit every editable field, toggle sections on/off, and
> reorder sections — which is exactly what you would do in the JSON files, just live.

---

## One sentence philosophy

> `render(theme, sections, fields)` — every decision a component makes comes from
> configuration; nothing is hardcoded into the engine.

---

## Folder layout

```
src/
├── engine/                  ← 100% template-agnostic
│   ├── types.ts             ← SectionConfig, ThemeConfig, TemplatePackage…
│   ├── TemplateHost.tsx     ← renders ANY package: theme vars, services, section loop
│   ├── SectionRenderer.tsx  ← resolve content → look up type → wrap in animation
│   ├── sections/            ← built-in section type registry
│   │   ├── registry.tsx     ← registerSection(type, Component) — one-line extensibility
│   │   └── Hero, Text, Quote, Gallery, Video, Music, Cards, Timeline, Countdown,
│   │       Surprise, Footer, Divider, Spacer, Button
│   ├── components/          ← Reveal, Particles, LazyImage, Lightbox, Music, Confetti, Icon
│   ├── contexts/            ← EngineContext, MusicContext (persistent audio), LightboxContext
│   ├── motion/              ← data-driven animation presets
│   ├── pkg/builder.ts       ← template package factory
│   └── styles/global.css    ← design system (reads theme.json CSS variables)
│
└── templates/
    ├── registry.ts          ← auto-discovers `*/template.ts`
    └── love/                ← the first template package
        ├── template.ts      ← wires manifest + theme + sections + assets (only file to touch)
        ├── manifest.json    ← every editable field lives here
        ├── theme.json       ← colors, fonts, spacing, radius, shadows, background
        ├── animations/animations.json ← named animation presets
        ├── sections/*.json  ← one file per section: type, enabled, order, animation, content
        ├── assets/          ← SVG placeholders, ambient.wav, preview.png
        └── preview.png
```

**Adding a future template (`birthday/`, `proposal/`, `wedding/`…)** requires zero
engine changes:

1. `cp -r templates/love templates/birthday`
2. Edit `manifest.json` (`fields`), `theme.json`, and the `sections/*.json` files.
3. Done. The engine auto-discovers it via `import.meta.glob`.

---

## How a template is rendered

```
manifest.json  ──►  theme.json  ──►  sections/*.json  ──►  animations.json
      │                 │                  │                    │
      └──── fields      └── CSS variables   └── sort by order    └── resolve preset names
                 │                              │
                 ▼                              ▼
        resolveContent()                 SectionRenderer
     (“@name” → value,                   (registry.lookup(type))
      “assets/x” → bundled URL)
                                              │
                                              ▼
                                     Hamiltonian, animated Reveal
```

The universal section contract — `id, type, enabled, order, animation, content,
style, settings` — is the only thing the renderer needs. The section loop is:

```ts
const visible = sections
  .filter(s => s.enabled !== false)
  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
```

---

## Demo: the whole thing is JSON

`src/templates/love/sections/` is one JSON file per section. Reorder, disable, or edit
any of it and refresh:

```jsonc
// sections/quote.json — a section you can turn off in seconds
{
  "id": "quote",
  "type": "quote",
  "enabled": true,          // ← flip to false to hide it
  "order": 5,               // ← change the number to move it
  "animation": { "preset": "zoom", "duration": 1.1 },
  "content": {
    "kicker": "@quote_kicker",
    "quote": "@quote_text",
    "source": "@quote_source"
  }
}
```

Editable copy/media all lives in `manifest.json → fields`:

```json
{
  "recipient_name": "Sarah",
  "sender_name": "Alex",
  "headline": "For you, who holds my heart",
  "subtitle": "A small universe of moments we share — written here, for you.",
  "event_date": "2027-02-14T20:00:00",
  "background_music": "assets/ambient.wav",     // ← resolved to a bundled URL by the engine
  "photos": [ { "src": "assets/photo-1.svg", "caption": "Golden hour" } ]
}
```

Wherever a section needs a field, it references it with `@field` (or `@nested.path`).
The engine resolves those references as it renders — rename `Sarah` to anything and
the entire experience updates.

### Sections ships disabled — flip them on

Two configs are deliberately shipped `"enabled": false`:

- `sections/second-note.json` — a bonus paragraph
- `sections/rsvp.json` — a hidden call-to-action

Flip either to `true` and refresh. They appear in their `order` position. This is the
whole story of the extensibility model.

---

## Section reference

Every section is built from any subset of `type`, `style`, `settings`, `animation`,
`content`. `content` may be literal values, `@field` references, or `assets/…` paths.

| Type | Renders | Notable `settings` |
| --- | --- | --- |
| `hero` | full-bleed opener (image/video/gradient/particles), CTA, scroll hint | `background`, `overlay`, `fullHeight` |
| `text` | editorial paragraphs (supports drop-cap) | `dropcap` |
| `quote` | decorative pull-quote | — |
| `gallery` | `masonry`/`grid`/`carousel`, lightbox, pinch zoom, fullscreen | `mode`, `lightbox` |
| `video` | uploaded/embedded video, poster, autoplay & muted toggles | `mock`, `muted`, `autoplay`, `rounded` |
| `music` | dedicated player card driving the persistent track | `volume` |
| `cards` | animated numbered cards (Reasons I Love You…) | `columns`, `numbers` |
| `timeline` | vertical memory timeline with photos | `photos` |
| `countdown` | live D:H:M:S to `event_date` | — |
| `surprise` | finale: confetti + reveal + replay | — |
| `footer` | closing message, signature, credits | — |
| `divider`, `spacer`, `button` | layout helpers / standalone CTA | `variant`, `height`, `target` |

**Add a new type** in one line:

```ts
registerSection("polaroid", PolaroidSection);
```

Register it in the built-in block `src/engine/sections/index.ts`, or return it from a
template's own `template.ts` via `pkg.register` — the engine loop is untouched.

---

## Theme system

`theme.json` feeds CSS custom properties via `themeVars()` in `TemplateHost.tsx`.
Every component reads `var(--c-primary)`, `var(--font-display)`, `var(--radius-lg)`,
`var(--gradient-text)` etc. Changing `Love`'s palette in one JSON file re-themes the
entire experience — and a second template can ship a completely different theme
file without touching components.

```json
{
  "colors":      { "primary": "#E8B8A5", "background": "#0B0A12", "gradientText": "…" },
  "fonts":       { "display": "", "body": "", "script": "" },
  "radius":      { "lg": "26px", "pill": "999px" },
  "shadows":     { "glow": "0 0 60px rgba(232,184,165,0.18)" },
  "background":  { "gradient": "…", "particles": { "enabled": true, "count": 70 } },
  "motion":      { "duration": 1 }
}
```

## Animations

Framer Motion powers all motion. Sections declare `animation: { preset, delay,
duration, ease, stagger }`. Presets are named entries in `animations/animations.json`
(falling back to built-ins), so even the choreography is data. `MotionConfig reducedMotion="user"`
plus a `prefers-reduced-motion` CSS block keep it accessible.

## Music

One shared `<audio>` lives at the top (`MusicContext.tsx`), so music continues
seamlessly while scrolling. Play/pause, volume, mute, and autoplay respect browser
gesture policies (a one-time `pointerdown` listener attempts autoplay where allowed).
The **Music section** and the **floating dock** are two UIs on the same state.

## Performance & accessibility

- `loading="lazy"` images with a shimmer placeholder; video `preload="none"`
- Particles pause when off-screen (`IntersectionObserver`) and honor reduced motion
- Canvas effects capped and devicePixelRatio-aware (60 FPS class anims)
- Manual chunks: `react`, `framer-motion`; SVG placeholders stay tiny
- Keyboard: lightbox arrows/Escape, all controls are real `<button>`s with
  `aria-label`/`aria-pressed`, focus returns on close
- Semantic landmarks (`main`, `section`, `article`, `footer`) and `aria-label`s
- Mobile-first responsive: Android / iOS / tablet / desktop

---

## Roadmap

- Template gallery app screen selection
- Upload pipeline (photos, video, music) feeding the same JSON shape
- Per-template custom section overrides registered from `template.ts`
- Shareable deep-links + prune-time build target per template