import { motion } from "framer-motion";
import type { SectionProps } from "../types";
import { SectionShell, SectionHeading } from "../components/SectionShell";
import { LazyImage } from "../components/LazyImage";
import { useEngine } from "../contexts/EngineContext";
import { getSetting } from "../utils/resolve";

interface TimelineItem {
  date?: string;
  title?: string;
  text?: string;
  photo?: string;
  caption?: string;
}

interface TimelineContent {
  kicker?: string;
  title?: string;
  subtitle?: string;
  items?: TimelineItem[];
}

/** Vertical memory timeline with alternating cards on desktop. */
export function TimelineSection(props: SectionProps) {
  const engine = useEngine();
  const c = (props.content ?? {}) as TimelineContent;
  const items = c.items ?? [];
  if (items.length === 0) return null;

  const settings = props.section.settings ?? {};
  const photosEnabled = getSetting(settings, "photos", true);
  const st = engine.staggerFor(props.section.animation ?? { preset: "fadeUp", stagger: 0.1 });
  const item = st.item;

  return (
    <SectionShell section={props.section}>
      <SectionHeading kicker={c.kicker} title={c.title} subtitle={c.subtitle} />

      <motion.ol className="timeline" {...st.container}>
        {items.map((it, i) => (
          <motion.li
            key={i}
            className="timeline__entry"
            variants={item.variants}
            data-side={i % 2 === 0 ? "left" : "right"}
          >
            <span className="timeline__dot" aria-hidden="true" />
            <div className="timeline__card">
              {photosEnabled && it.photo && (
                <LazyImage
                  src={it.photo}
                  alt={it.caption ?? it.title ?? `Memory ${i + 1}`}
                  aspectRatio="16/10"
                  className="timeline__photo"
                  caption={it.caption}
                />
              )}
              <div className="timeline__copy">
                {it.date && <time className="timeline__date">{it.date}</time>}
                {it.title && <h3 className="timeline__title">{it.title}</h3>}
                {it.text && <p className="timeline__text">{it.text}</p>}
              </div>
            </div>
          </motion.li>
        ))}
      </motion.ol>
    </SectionShell>
  );
}