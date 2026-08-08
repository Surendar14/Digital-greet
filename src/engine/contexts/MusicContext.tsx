/**
 * Persistent music engine.
 *
 * One shared <audio> lives at the top of the tree so music keeps
 * playing naturally while the user scrolls between sections.
 * Play/pause, volume, mute — all keyboard accessible.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import type { MusicTrack } from "../types";
import { Icon } from "../components/Icon";

export interface MusicState {
  track: MusicTrack | null;
  ready: boolean;
  playing: boolean;
  muted: boolean;
  volume: number;
  /** True once a user gesture allowed playback to start. */
  interacted: boolean;
  togglePlay: () => void;
  play: () => void;
  pause: () => void;
  setMuted: (m: boolean) => void;
  setVolume: (v: number) => void;
}

const MusicContext = createContext<MusicState | null>(null);

export function useMusic(): MusicState {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error("useMusic must be used inside <MusicProvider>");
  return ctx;
}

export function MusicProvider({ track, children }: { track: MusicTrack | null; children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMutedState] = useState(false);
  const [volume, setVolumeState] = useState(0.7);
  const [interacted, setInteracted] = useState(false);

  const trackRef = useRef(track);
  trackRef.current = track;

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
    audioRef.current.muted = muted;
  }, [volume, muted]);

  const play = useCallback(() => {
    setInteracted(true);
    const audio = audioRef.current;
    if (!audio || !trackRef.current) return;
    audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (playing) pause();
    else play();
  }, [playing, play, pause]);

  const setMuted = useCallback((m: boolean) => setMutedState(m), []);
  const setVolume = useCallback((v: number) => setVolumeState(Math.min(1, Math.max(0, v))), []);

  /** Browser autoplay policies: attach a one-time gesture listener. */
  useEffect(() => {
    if (!trackRef.current || trackRef.current.youtubeId) return;
    const attempt = () => {
      setInteracted(true);
      if (trackRef.current?.autoplay) {
        const audio = audioRef.current;
        if (audio) audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
      }
    };
    window.addEventListener("pointerdown", attempt, { once: true });
    return () => window.removeEventListener("pointerdown", attempt);
  }, []);

  const value = useMemo<MusicState>(
    () => ({ track, ready, playing, muted, volume, interacted, togglePlay, play, pause, setMuted, setVolume }),
    [track, ready, playing, muted, volume, interacted, togglePlay, play, pause, setMuted, setVolume]
  );

  return (
    <MusicContext.Provider value={value}>
      {track?.src && !track.youtubeId ? (
        <audio
          ref={(el) => {
            audioRef.current = el;
            if (el) setReady(true);
          }}
          src={track.src}
          loop={track.loop ?? true}
          preload="auto"
          onEnded={() => setPlaying(false)}
          onPause={() => setPlaying(false)}
          onPlay={() => setPlaying(true)}
        />
      ) : null}
      {children}
    </MusicContext.Provider>
  );
}

/** Floating persistent player (engine-level, template-agnostic). */
export function FloatingMusicPlayer() {
  const music = useMusic();
  // YouTube tracks are played from the section's own embed — no floating bed.
  if (!music.track || music.track.youtubeId) return null;

  return (
    <div className="music-dock" role="region" aria-label="Background music player">
      <button
        type="button"
        className="music-dock__toggle"
        onClick={music.togglePlay}
        aria-label={music.playing ? "Pause background music" : "Play background music"}
        aria-pressed={music.playing}
      >
        {music.playing ? <Icon name="pause" size={16} /> : <Icon name="play" size={16} />}
      </button>
      <div className="music-dock__meta">
        <span className="music-dock__title">
          {music.playing ? (
            <span className="music-dock__eq" aria-hidden="true">
              <i /><i /><i />
            </span>
          ) : (
            <Icon name="music" size={12} />
          )}
          {music.track.title || "Background music"}
        </span>
        <input
          className="music-dock__volume"
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
      <button
        type="button"
        className="music-dock__toggle"
        onClick={() => music.setMuted(!music.muted)}
        aria-label={music.muted ? "Unmute music" : "Mute music"}
        aria-pressed={music.muted}
      >
        <Icon name={music.muted ? "mute" : "volume"} size={16} />
      </button>
    </div>
  );
}