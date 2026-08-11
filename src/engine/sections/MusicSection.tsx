import type { SectionProps } from "../types";
import { SectionShell, SectionHeading } from "../components/SectionShell";
import { useMusic } from "../contexts/MusicContext";
import { getSetting } from "../utils/resolve";
import { Icon } from "../components/Icon";

interface MusicContent {
  kicker?: string;
  title?: string;
  subtitle?: string;
  note?: string;
  trackTitle?: string;
  artist?: string;
}

/**
 * Dedicated "music player" block. The same shared audio the
 * floating dock controls â€” one source, both UIs stay in sync.
 */
export function MusicSection(props: SectionProps) {
  const music = useMusic();
  const c = (props.content ?? {}) as MusicContent;
  const settings = props.section.settings ?? {};
  const showVolume = getSetting(settings, "volume", true);

  if (!music.track && !c.trackTitle) return null;

  const title = c.trackTitle || music.track?.title || "Our song";
  const artist = c.artist || music.track?.artist || c.subtitle;

  // YouTube tracks: replace the stylized player with an embed (no autoplay —
  // the listener taps their own play; the section keeps heading + note).
  if (music.track?.youtubeId) {
    const embedUrl = `https://www.youtube-nocookie.com/embed/${music.track.youtubeId}?rel=0&modestbranding=1&playsinline=1`;
    return (
      <SectionShell section={props.section} className="music-shell">
        <SectionHeading kicker={c.kicker} title={c.title} subtitle={c.subtitle} />
        <div className="music-embed">
          <iframe
            src={embedUrl}
            title={`${title}${artist ? ` — ${artist}` : ""}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            loading="lazy"
          />
        </div>
        {c.note && <p className="music-card__note music-embed__note">{c.note}</p>}
      </SectionShell>
    );
  }

  return (
    <SectionShell section={props.section} className="music-shell">
      <SectionHeading kicker={c.kicker} title={c.title} subtitle={c.subtitle} />

      <div className="music-card">
        <div className="music-card__art" aria-hidden="true">
          <div className={`music-card__disc${music.playing ? " music-card__disc--playing" : ""}`}>
            <span className="music-card__spin" />
          </div>
        </div>

        <div className="music-card__info">
          <p className="music-card__title">{c.title ?? "The soundtrack"}</p>
          <p className="music-card__track">
            {title}
            {artist ? <em>· {artist}</em> : null}
          </p>

          <div className="music-card__controls">
            <button
              type="button"
              className="music-card__play"
              onClick={music.togglePlay}
              aria-label={music.playing ? "Pause music" : "Play music"}
              aria-pressed={music.playing}
            >
              {music.playing ? (
                <Icon name="pause" size={22} />
              ) : (
                <Icon name="play" size={22} />
              )}
            </button>

            {showVolume && (
              <div className="music-card__volume">
                <button
                  type="button"
                  onClick={music.toggleMute}
                  aria-label={music.muted ? "Unmute music" : "Mute music"}
                  aria-pressed={music.muted}
                >
                  <Icon name={music.muted ? "mute" : "volume"} size={17} />
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.02}
                  value={music.muted ? 0 : music.volume}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    music.setVolume(v);
                    music.setMuted(v === 0);
                  }}
                  aria-label="Music volume"
                />
              </div>
            )}
          </div>

          {c.note && <p className="music-card__note">{c.note}</p>}
        </div>
      </div>
    </SectionShell>
  );
}