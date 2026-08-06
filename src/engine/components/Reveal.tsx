import { motion } from "framer-motion";
import type { ReactNode } from "react";
import type { AnimationEntry, RevealProps } from "../types";
import { useEngine } from "../contexts/EngineContext";
import { cx } from "../utils/resolve";

/**
 * `<Reveal>` — engine-level scroll animation wrapper. Every section
 * animates purely from its JSON `animation` config; nothing is
 * hardcoded in the components.
 */
export function Reveal({
  entry,
  className,
  children,
  as = "div",
  delay
}: {
  entry?: AnimationEntry | string;
  className?: string;
  children?: ReactNode;
  as?: "div" | "section" | "header" | "article";
  delay?: number;
}) {
  const engine = useEngine();
  const props: RevealProps = engine.revealFor(entry);
  if (delay !== undefined) props.transition = { ...props.transition, delay };
  const Tag = motion[as];
  return (
    <Tag className={cx("reveal", className)} {...props}>
      {children}
    </Tag>
  );
}