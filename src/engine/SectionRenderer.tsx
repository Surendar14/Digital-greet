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
 *   3. wrap it in its data-driven reveal motion
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

  const backdrop = useMemo(
    () =>
      resolveContent(section.style?.background, {
        fields: engine.fields,
        asset: engine.pkg.asset,
      }),
    [section.style?.background, engine.fields, engine.pkg.asset]
  );

  const Comp = getSectionComponent(section.type);
  return (
    <Reveal entry={section.animation} className="section-frame">
      {backdrop ? <SectionBackdrop bg={backdrop as BackdropConfig | string} /> : null}
      {Comp ? (
        <Comp
          section={section}
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
  );
}