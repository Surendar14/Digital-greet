import { useMemo } from "react";
import { getSectionComponent } from "./sections/registry";
import { Reveal } from "./components/Reveal";
import { SectionBackdrop } from "./components/SectionBackdrop";
import { resolveContent } from "./utils/resolve";
import type { EngineApi, SectionBackdrop as BackdropConfig, SectionConfig } from "./types";

/**
 * The render loop's per-section step:
 *   1. resolve the section's JSON content (fields + asset URLs)
 *   2. look up the component by type
 *   3. reveal the content without fading the section backdrop itself.
 *
 * Keeping the backdrop mounted and visible while copy enters prevents a
 * momentary empty/dark band when two adjacent sections are animating.
 */
export function SectionRenderer({
  engine,
  section,
  index,
  total
}: {
  engine: EngineApi;
  section: SectionConfig;
  index: number;
  total: number;
}) {
  const content = useMemo(
    () => resolveContent(section.content, { fields: engine.fields, asset: engine.pkg.asset }),
    [section.content, engine.fields, engine.pkg.asset]
  );

  // Components consume settings and layout style directly from their section.
  // Resolve those values here as well so template references such as
  // `"@gallery_mode"` behave exactly like references in section content.
  const resolvedSection = useMemo(
    () => ({
      ...section,
      settings: resolveContent(section.settings, {
        fields: engine.fields,
        asset: engine.pkg.asset,
      }) as SectionConfig["settings"],
      style: resolveContent(section.style, {
        fields: engine.fields,
        asset: engine.pkg.asset,
      }) as SectionConfig["style"],
    }),
    [section, engine.fields, engine.pkg.asset]
  );

  const backdrop = useMemo(
    () =>
      resolveContent(resolvedSection.style?.background, {
        fields: engine.fields,
        asset: engine.pkg.asset,
      }),
    [resolvedSection.style?.background, engine.fields, engine.pkg.asset]
  );

  const Comp = getSectionComponent(section.type);
  return (
    <section className="section-frame">
      {backdrop ? <SectionBackdrop bg={backdrop as BackdropConfig | string} /> : null}
      <Reveal entry={section.animation} className="section-frame__content">
        {Comp ? (
          <Comp
            section={resolvedSection}
            content={content}
            fields={engine.fields}
            index={index}
            total={total}
            scrollToSection={engine.scrollToSection}
          />
        ) : (
          <div className="section section--unknown" data-section-type={section.type}>
            <p className="section-unknown-hint">
              Unknown section type: <code>{section.type}</code>
            </p>
          </div>
        )}
      </Reveal>
    </section>
  );
}
