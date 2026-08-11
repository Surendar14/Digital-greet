import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { SectionProps } from "../types";
import { SectionShell } from "../components/SectionShell";
import { Confetti } from "../components/Confetti";
import { Button } from "../components/Button";
import { useEngine } from "../contexts/EngineContext";

interface SurpriseContent {
  kicker?: string;
  title?: string;
  buttonLabel?: string;
  afterTitle?: string;
  message?: string;
  image?: string;
  replayLabel?: string;
}

/** The finale â€” confetti, a big message, and a replay button. */
export function SurpriseSection(props: SectionProps) {
  const engine = useEngine();
  const c = (props.content ?? {}) as SurpriseContent;
  const [revealed, setRevealed] = useState(false);
  const [burst, setBurst] = useState(0);

  const reveal = () => {
    setRevealed(true);
    setBurst((b) => b + 1);
  };

  const st = engine.staggerFor(props.section.animation ?? { preset: "zoom", stagger: 0.12 });
  const item = st.item;

  return (
    <SectionShell section={props.section} className="surprise-shell">
      {revealed && <Confetti key={burst} theme={engine.theme} duration={burst > 1 ? 2600 : 4200} />}

      <motion.div className="surprise" {...st.container}>
        {!revealed ? (
          <>
            {c.kicker && (
              <motion.p className="surprise__kicker" variants={item.variants}>
                {c.kicker}
              </motion.p>
            )}
            {c.title && (
              <motion.h2 className="surprise__title" variants={item.variants}>
                {c.title}
              </motion.h2>
            )}
            <motion.div variants={item.variants}>
              <Button size="lg" label={c.buttonLabel ?? "Reveal the surprise"} onClick={reveal} />
            </motion.div>
          </>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key="revealed"
              className="surprise__revealed"
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            >
              {c.image && (
                <img
                  className="surprise__image"
                  src={c.image}
                  alt=""
                  loading="lazy"
                />
              )}
              {c.afterTitle && <h2 className="surprise__reveal-title">{c.afterTitle}</h2>}
              {c.message && <p className="surprise__message">{c.message}</p>}
              <Button
                variant="ghost"
                label={c.replayLabel ?? "Replay"}
                onClick={() => setRevealed(false)}
              />
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>
    </SectionShell>
  );
}