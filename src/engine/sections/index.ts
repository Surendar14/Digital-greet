/**
 * Built-in section type registration.
 *
 * The engine ships a rich set of generic types — adding a template
 * never requires touching these. New types = registerSection once.
 */

import { registerSection } from "./registry";
import { HeroSection } from "./HeroSection";
import { TextSection } from "./TextSection";
import { QuoteSection } from "./QuoteSection";
import { GallerySection } from "./GallerySection";
import { VideoSection } from "./VideoSection";
import { MusicSection } from "./MusicSection";
import { CardsSection } from "./CardsSection";
import { TimelineSection } from "./TimelineSection";
import { CountdownSection } from "./CountdownSection";
import { SurpriseSection } from "./SurpriseSection";
import { FooterSection } from "./FooterSection";
import { DividerSection } from "./DividerSection";
import { SpacerSection } from "./SpacerSection";
import { ButtonSection } from "./ButtonSection";

export function registerBuiltinSections(): void {
  registerSection("hero", HeroSection);
  registerSection("text", TextSection);
  registerSection("quote", QuoteSection);
  registerSection("gallery", GallerySection);
  registerSection("video", VideoSection);
  registerSection("music", MusicSection);
  registerSection("cards", CardsSection);
  registerSection("timeline", TimelineSection);
  registerSection("countdown", CountdownSection);
  registerSection("surprise", SurpriseSection);
  registerSection("footer", FooterSection);
  registerSection("divider", DividerSection);
  registerSection("spacer", SpacerSection);
  registerSection("button", ButtonSection);
}