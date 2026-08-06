/**
 * TemplateHost — the single runtime that renders ANY template package.
 * It applies the theme, resolves the ordered section list, and mounts
 * the global engine services (music, lightbox). No template specifics here.
 */

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { MotionConfig } from "framer-motion";
import type { MusicTrack, SectionConfig, TemplatePackage, ThemeConfig } from "./types";
import { EngineProvider, useEngineApi } from "./contexts/EngineContext";
import { MusicProvider, FloatingMusicPlayer } from "./contexts/MusicContext";
import { LightboxProvider } from "./contexts/LightboxContext";
import { SectionRenderer } from "./SectionRenderer";
import { Particles } from "./components/Particles";
import { Inspector } from "./components/Inspector";

/** Map theme.json onto CSS custom properties. Changing theme = restyle. */
export function themeVars(theme: ThemeConfig): Record<string, string> {
  return {
    "--c-primary": theme.colors.primary,
    "--c-primary-soft": theme.colors.primarySoft,
    "--c-primary-deep": theme.colors.primaryDeep,
    "--c-secondary": theme.colors.secondary,
    "--c-accent": theme.colors.accent,
    "--c-bg": theme.colors.background,
    "--c-surface": theme.colors.surface,
    "--c-surface2": theme.colors.surface2,
    "--c-text": theme.colors.text,
    "--c-text-muted": theme.colors.textMuted,
    "--c-border": theme.colors.border,
    "--c-on-primary": theme.colors.textOnPrimary,
    "--gradient-text": theme.colors.gradientText,
    "--font-display": theme.fonts.display,
    "--font-body": theme.fonts.body,
    "--font-script": theme.fonts.script,
    "--r-sm": theme.radius?.sm ?? "10px",
    "--r-md": theme.radius?.md ?? "18px",
    "--r-lg": theme.radius?.lg ?? "28px",
    "--r-xl": theme.radius?.xl ?? "44px",
    "--r-pill": theme.radius?.pill ?? "999px",
    "--sh-sm": theme.shadows?.sm ?? "0 2px 14px rgba(0,0,0,.28)",
    "--sh-md": theme.shadows?.md ?? "0 10px 40px rgba(0,0,0,.35)",
    "--sh-lg": theme.shadows?.lg ?? "0 24px 80px rgba(0,0,0,.5)",
    "--sh-glow": theme.shadows?.glow ?? "0 0 60px rgba(232,182,166,.25)",
    "--space-section": theme.spacing?.section ?? "7.5rem",
    "--space-section-mobile": theme.spacing?.sectionMobile ?? "4.5rem",
    "--space-gap": theme.spacing?.gap ?? "1.25rem",
    "--btn-radius": theme.buttons?.radius ?? "999px",
    "--btn-px": theme.buttons?.paddingX ?? "2.1rem",
    "--btn-py": theme.buttons?.paddingY ?? "0.9rem",
    "--btn-ls": theme.buttons?.letterSpacing ?? "0.14em",
    "--btn-tt": theme.buttons?.textTransform ?? "uppercase",
    "--step-h1": theme.typography?.stepH1 ?? "clamp(2.9rem, 9vw, 6rem)",
    "--step-h2": theme.typography?.stepH2 ?? "clamp(1.9rem, 5.5vw, 3.2rem)",
    "--step-h3": theme.typography?.stepH3 ?? "clamp(1.2rem, 3vw, 1.7rem)",
    "--step-body": theme.typography?.stepBody ?? "1.05rem",
    "--ls-wide": theme.typography?.letterSpacingWide ?? "0.22em"
  };
}

function sortAndFilter(sections: SectionConfig[]): SectionConfig[] {
  return sections
    .filter((s) => s.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function TemplateHost({ pkg }: { pkg: TemplatePackage }) {
  const [sections, setSections] = useState<SectionConfig[]>(pkg.sections);
  const [fieldPatch, setFieldPatch] = useState<Record<string, unknown>>({});
  const [inspectOpen, setInspectOpen] = useState(false);

  useEffect(() => {
    setSections(pkg.sections);
    setFieldPatch({});
  }, [pkg]);

  const fields = useMemo(
    () => ({ ...pkg.fields, ...fieldPatch }),
    [pkg.fields, fieldPatch]
  );

  const effectiveSections = useMemo(() => sortAndFilter(sections), [sections]);

  const runtimePkg = useMemo<TemplatePackage>(
    () => ({ ...pkg, fields, sections: effectiveSections }),
    [pkg, fields, effectiveSections]
  );

  const engine = useEngineApi(runtimePkg);
  const theme = pkg.theme;

  const track = useMemo<MusicTrack | null>(() => {
    const src = typeof fields.background_music === "string" ? fields.background_music : null;
    if (!src) return null;
    const meta = (fields.music_meta as Record<string, unknown>) ?? {};
    return {
      src,
      title: typeof meta.title === "string" ? meta.title : undefined,
      artist: typeof meta.artist === "string" ? meta.artist : undefined,
      autoplay: meta.autoplay === true
    };
  }, [fields.background_music, fields.music_meta]);

  useEffect(() => {
    document.title = `${pkg.manifest.name ?? pkg.name} — A Digital Greeting`;
    document.documentElement.dataset.mode = theme.mode;
    document.documentElement.style.setProperty("--c-bg-root", theme.colors.background);
  }, [pkg, theme]);

  const vars = useMemo(() => themeVars(theme), [theme]);

  return (
    <MotionConfig reducedMotion="user">
      <LightboxProvider>
        <MusicProvider track={track}>
          <EngineProvider api={engine}>
            <div className="tpl" style={vars as CSSProperties} data-template={pkg.id}>
              <GlobalBackground theme={theme} />

              <main id="tpl-main" className="tpl-main">
                {effectiveSections.map((section, index) => (
                  <SectionRenderer
                    key={section.id}
                    engine={engine}
                    section={section}
                    index={index}
                    total={effectiveSections.length}
                  />
                ))}
              </main>

              <FloatingMusicPlayer />
              <Inspector
                sections={sections}
                fields={fields}
                open={inspectOpen}
                onToggle={() => setInspectOpen((v) => !v)}
                onSectionsChange={setSections}
                onFieldChange={(key, value) =>
                  setFieldPatch((prev) => ({ ...prev, [key]: value }))
                }
                theme={theme}
              />
            </div>
          </EngineProvider>
        </MusicProvider>
      </LightboxProvider>
    </MotionConfig>
  );
}

/** Theme-driven ambient background: gradient, image, particles, grain. */
function GlobalBackground({ theme }: { theme: ThemeConfig }) {
  const bg = theme.background ?? {};
  const particlesOn = bg.particles?.enabled !== false && theme.motion?.particles !== false;
  return (
    <div className="tpl-bg" aria-hidden="true">
      {bg.gradient && <div className="tpl-bg__gradient" style={{ background: bg.gradient }} />}
      {bg.image && <img className="tpl-bg__image" src={bg.image} alt="" />}
      {bg.video && <video className="tpl-bg__video" src={bg.video} autoPlay muted loop playsInline />}
      {particlesOn && <Particles settings={bg.particles} className="tpl-bg__particles" />}
      {bg.grain && <div className="tpl-bg__grain" />}
      {bg.vignette && <div className="tpl-bg__vignette" />}
    </div>
  );
}