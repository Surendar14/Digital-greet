import { motion } from "framer-motion";
import type { SectionProps } from "../types";
import { useEngine } from "../contexts/EngineContext";
import { getSetting } from "../utils/resolve";
import { Button } from "../components/Button";
import { Particles } from "../components/Particles";
import { Icon } from "../components/Icon";

interface HeroContent {
  kicker?: string;
  title?: string;
  subtitle?: string;
  image?: string;
  video?: string;
  badge?: string;
  cta?: { label: string; to: string };
  cta2?: { label: string; to: string };
  scrollHint?: string;
}

/** Full-bleed cinematic opening band. */
export function HeroSection(props: SectionProps) {
  const engine = useEngine();
  const c = (props.content ?? {}) as HeroContent;
  const s = props.section.settings ?? {};
  const bgType = getSetting<string>(s, "background", "auto");
  const overlay = getSetting(s, "overlay", "rgba(8,6,12,0.55)");
  const fullHeight = getSetting(s, "fullHeight", true);

  const st = engine.staggerFor(props.section.animation ?? { preset: "fadeUp", stagger: 0.12, staggerDelay: 0.15 });
  const item = st.item;

  return (
    <section
      className="hero"
      style={{ minHeight: fullHeight ? "100svh" : "auto" }}
      aria-label={props.section.label ?? c.kicker ?? "Hero"}
    >
      {(bgType === "image" || bgType === "auto") && c.image && (
        <div className="hero__bg" aria-hidden="true">
          <img src={c.image} alt="" />
          <div className="hero__bg-overlay" style={{ background: overlay }} />
        </div>
      )}
      {(bgType === "video" || bgType === "auto") && c.video && (
        <div className="hero__bg" aria-hidden="true">
          <video src={c.video} autoPlay muted loop playsInline poster={c.image} />
          <div className="hero__bg-overlay" style={{ background: overlay }} />
        </div>
      )}
      {bgType === "particles" && (
        <div className="hero__particles" aria-hidden="true">
          <Particles
            settings={{
              count: 90,
              maxOpacity: 0.55,
              speed: 0.2,
              colors: engine.theme.background?.particles?.colors ?? [[232, 182, 166], [255, 255, 255]]
            }}
          />
          <div className="hero__bg-overlay" style={{ background: overlay }} />
        </div>
      )}

      <motion.div className="hero__inner" {...st.container}>
        {c.badge && (
          <motion.p className="hero__badge" variants={item.variants}>
            <Icon name="heartSpark" size={13} />
            {c.badge}
          </motion.p>
        )}
        {c.kicker && (
          <motion.p className="hero__kicker" variants={item.variants}>
            {c.kicker}
          </motion.p>
        )}
        {c.title && (
          <motion.h1 className="hero__title" variants={item.variants}>
            {c.title}
          </motion.h1>
        )}
        {c.subtitle && (
          <motion.p className="hero__subtitle" variants={item.variants}>
            {c.subtitle}
          </motion.p>
        )}
        {(c.cta || c.cta2) && (
          <motion.div className="hero__cta" variants={item.variants}>
            {c.cta && (
              <Button label={c.cta.label} size="lg" onClick={() => props.scrollToSection(c.cta!.to)} />
            )}
            {c.cta2 && (
              <Button
                variant="ghost"
                size="lg"
                label={c.cta2.label}
                onClick={() => props.scrollToSection(c.cta2!.to)}
              />
            )}
          </motion.div>
        )}
      </motion.div>

      {c.scrollHint && (
        <motion.button
          type="button"
          className="hero__hint"
          onClick={() => props.scrollToSection(c.cta?.to ?? "story")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 1 }}
          aria-label={c.scrollHint}
        >
          <span>{c.scrollHint}</span>
          <motion.span
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          >
            <Icon name="chevronDown" size={18} />
          </motion.span>
        </motion.button>
      )}
    </section>
  );
}