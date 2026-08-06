import { motion } from "framer-motion";
import type { SectionProps } from "../types";
import { SectionShell, SectionHeading } from "../components/SectionShell";
import { useEngine } from "../contexts/EngineContext";
import { getSetting } from "../utils/resolve";

interface CardItem {
  title?: string;
  text?: string;
  number?: string | number;
}

interface CardsContent {
  kicker?: string;
  title?: string;
  subtitle?: string;
  cards?: CardItem[];
}

/** Themed animated cards (Reasons I Love You, highlightsâ€¦). */
export function CardsSection(props: SectionProps) {
  const engine = useEngine();
  const c = (props.content ?? {}) as CardsContent;
  const cards = c.cards ?? [];
  if (cards.length === 0) return null;

  const settings = props.section.settings ?? {};
  const columns = getSetting(settings, "columns", 3);
  const numbers = getSetting(settings, "numbers", true);
  const st = engine.staggerFor(props.section.animation ?? { preset: "fadeUp", stagger: 0.08 });
  const item = st.item;

  return (
    <SectionShell section={props.section}>
      <SectionHeading kicker={c.kicker} title={c.title} subtitle={c.subtitle} />

      <motion.div
        className="cards"
        style={{ "--cards-col": columns } as React.CSSProperties}
        {...st.container}
      >
        {cards.map((card, i) => (
          <motion.article
            key={i}
            className="cards__card"
            variants={item.variants}
            whileHover={{ y: -6 }}
          >
            {numbers && (
              <span className="cards__num" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
            )}
            {card.title && <h3 className="cards__title">{card.title}</h3>}
            {card.text && <p className="cards__text">{card.text}</p>}
          </motion.article>
        ))}
      </motion.div>
    </SectionShell>
  );
}