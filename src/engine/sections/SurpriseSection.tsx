import { useState } from "react";
import { motion } from "framer-motion";
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

/** The finale — confetti, a big message, and a replay button. */
export function SurpriseSection(props: SectionProps) {
  const engine = useEngine();
  const c = (props.content ?? {}) as SurpriseContent;
  const [revealed, setRevealed] = useState(false);
  const [burst, setBurst] = useState(0);

  const reveal = () => {
    setRevealed(true);
    setBurst((b) => b + 1);
  };

  return (
    <SectionShell section={props.section} className="surprise-shell">
      {revealed && <Confetti key={burst} theme={engine.theme} duration={burst > 1 ? 2600 : 4200} />}

      <div className="surprise">
        {!revealed ? (
          <div className="surprise__pre">
            {c.kicker && <p className="surprise__kicker">{c.kicker}</p>}
            {c.title && <h2 className="surprise__title">{c.title}</h2>}
            <Button size="lg" label={c.buttonLabel ?? "Reveal the surprise"} onClick={reveal} />
          </div>
        ) : (
          <motion.div
            className="surprise__revealed"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            {c.image && (
              <img className="surprise__image" src={c.image} alt="" loading="lazy" />
            )}
            {c.afterTitle && <h2 className="surprise__reveal-title">{c.afterTitle}</h2>}
            {c.message && <p className="surprise__message">{c.message}</p>}
            <Button
              variant="ghost"
              label={c.replayLabel ?? "Replay the magic"}
              onClick={() => setRevealed(false)}
            />
          </motion.div>
        )}
      </div>
    </SectionShell>
  );
}
