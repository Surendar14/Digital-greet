import { useState } from "react";
import type { SectionProps } from "../types";
import { SectionShell, SectionHeading } from "../components/SectionShell";
import { getSetting } from "../utils/resolve";
import { Icon } from "../components/Icon";

interface VideoContent {
  kicker?: string;
  title?: string;
  subtitle?: string;
  src?: string;
  poster?: string;
  caption?: string;
}

/** Embedded/uploaded video with muted & autoplay toggles (data-driven). */
export function VideoSection(props: SectionProps) {
  const c = (props.content ?? {}) as VideoContent;
  const settings = props.section.settings ?? {};
  const muted = getSetting(settings, "muted", true);
  const autoplay = getSetting(settings, "autoplay", false);
  const controls = getSetting(settings, "controls", true);
  const rounded = getSetting(settings, "rounded", true);
  const mock = getSetting(settings, "mock", true);
  const [playing, setPlaying] = useState(false);

  return (
    <SectionShell section={props.section}>
      <SectionHeading kicker={c.kicker} title={c.title} subtitle={c.subtitle} />

      <figure className={`video ${rounded ? "video--rounded" : ""}`}>
        {c.src ? (
          <video
            src={c.src}
            poster={c.poster}
            controls={controls}
            muted={muted}
            autoPlay={autoplay}
            loop={autoplay}
            playsInline
            preload="none"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            aria-label={c.title ?? "Video"}
          />
        ) : mock ? (
          <div className="video__placeholder" role="img" aria-label={c.caption ?? "Video placeholder"}>
            <img src={c.poster} alt="" loading="lazy" />
            <button
              type="button"
              className="video__play"
              aria-label={playing ? "Pause video" : "Play video"}
              onClick={() => setPlaying((v) => !v)}
            >
              {playing ? <Icon name="pause" size={26} /> : <Icon name="play" size={26} />}
            </button>
            <p className="video__hint">A cinematic moment goes here — add your own clip.</p>
          </div>
        ) : null}
        {c.caption && <figcaption className="video__caption">{c.caption}</figcaption>}
      </figure>
    </SectionShell>
  );
}