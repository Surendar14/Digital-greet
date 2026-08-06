/**
 * Section Registry
 *
 * Maps `section.type` → React component. Registering a new section type
 * is one line: `registerSection("type", Component)`. The render loop is
 * untouched when new types arrive — this is the entire extensibility story.
 */

import type { ComponentType } from "react";
import type { EngineApi, SectionProps } from "../types";

const registry = new Map<string, ComponentType<SectionProps>>();

export function registerSection(type: string, component: ComponentType<SectionProps>): void {
  registry.set(type, component);
}

export function getSectionComponent(type: string): ComponentType<SectionProps> | undefined {
  return registry.get(type);
}

export function hasSectionType(type: string): boolean {
  return registry.has(type);
}

export const listRegisteredTypes = (): string[] => Array.from(registry.keys());

export interface RegistryApi {
  register: (type: string, component: ComponentType<SectionProps>) => void;
}

export function createSectionRegistryApi(): RegistryApi {
  return { register: registerSection };
}

/** Default fallback rendered when a config references an unknown type. */
export function UnknownSection(props: SectionProps): JSX.Element | null {
  return (
    <div className="section section--unknown" data-section-type={props.section.type}>
      <p className="section-unknown-hint">
        Unknown section type: <code>{props.section.type}</code>
      </p>
    </div>
  );
}