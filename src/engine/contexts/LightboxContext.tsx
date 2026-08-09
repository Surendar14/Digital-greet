/**
 * Global lightbox — premium editorial photo viewer.
 * Photo-dominant layout: caption+nav (left) | photograph (center) | nav+botanical (right)
 * Keyboard accessible: arrows to navigate, Escape to close.
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
import type { LightboxApi, LightboxImage } from "../types";
import { Icon } from "../components/Icon";
import { BotanicalArt } from "../components/BotanicalArt";

const LightboxContext = createContext<LightboxApi | null>(null);

export function useLightbox(): LightboxApi {
  const ctx = useContext(LightboxContext);
  if (!ctx) throw new Error("useLightbox must be used inside <LightboxProvider>");
  return ctx;
}

export function LightboxProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<LightboxImage[]>([]);
  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [entering, setEntering] = useState(false);
  const [galleryTitle, setGalleryTitle] = useState<string | undefined>();
  const [subtitle, setSubtitle] = useState<string | undefined>();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openLightbox = useCallback(
    (imgs: LightboxImage[], startIndex = 0, opts?: { title?: string; subtitle?: string }) => {
      triggerRef.current = document.activeElement as HTMLElement | null;
      setImages(imgs);
      setIndex(Math.max(0, Math.min(startIndex, imgs.length - 1)));
      setGalleryTitle(opts?.title);
      setSubtitle(opts?.subtitle);
      setPrevIndex(null);
      setEntering(true);
      setOpen(true);
    },
    []
  );

  const close = useCallback(() => {
    setOpen(false);
    setPrevIndex(null);
    setEntering(false);
    triggerRef.current?.focus?.();
  }, []);

  const step = useCallback(
    (dir: 1 | -1) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setPrevIndex(index);
      setIndex((i) => (i + dir + images.length) % images.length);
      setEntering(true);
      timerRef.current = setTimeout(() => {
        setPrevIndex(null);
        setEntering(false);
      }, 500);
    },
    [index, images.length]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step, close]);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const value: LightboxApi = useMemo(() => ({ open: openLightbox, close }), [openLightbox, close]);

  const image = images[index];
  const title = image?.title;
  const description = image?.description;
  const padded = (n: number) => String(n).padStart(2, "0");

  /** Render the title with "with" in italic script for visual contrast. */
  const renderTitle = (t: string) => {
    const lines = t.split("\n");
    return lines.map((line, li) => {
      const parts = line.split(/\b(with)\b/);
      const rendered = parts.map((part, pi) =>
        part.toLowerCase() === "with" ? (
          <span key={pi} className="lb-title-script">{part}</span>
        ) : (
          part
        )
      );
      return (
        <span key={li} className="lb-title-line">
          {rendered}
        </span>
      );
    });
  };

  return (
    <LightboxContext.Provider value={value}>
      {children}
      {open && images.length > 0 && (
        <div className="lb" role="dialog" aria-modal="true" aria-label="Image viewer" onClick={close}>
          <div className="lb__bg" aria-hidden="true" />
          <div className="lb__grain" aria-hidden="true" />

          <div className="lb__frame" ref={panelRef} tabIndex={-1} onClick={(e) => e.stopPropagation()}>
            {/* Left: caption + prev navigation */}
            <div className="lb__left">
              <div className="lb__caption">
                <span className="lb__leaf" aria-hidden="true">
                  <svg viewBox="0 0 60 90" fill="none">
                    <g stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M 30 85 C 28 65 26 42 32 10" />
                      <path d="M 29 70 C 22 65 14 66 10 72 C 16 74 24 74 29 70 Z" />
                      <path d="M 30 52 C 37 48 44 49 48 54 C 42 56 34 55 30 52 Z" />
                      <path d="M 31 35 C 24 31 16 32 12 37 C 18 40 26 39 31 35 Z" />
                      <path d="M 32 20 C 38 17 44 18 47 22 C 42 24 35 23 32 20 Z" />
                      <path d="M 33 8 C 35 5 37 3 39 2" />
                    </g>
                  </svg>
                </span>
                {subtitle && <p className="lb__kicker">{subtitle}</p>}
                {title && <h3 className="lb__title">{renderTitle(title)}</h3>}
                {description && <p className="lb__desc">{description}</p>}
                <div className="lb__divider" aria-hidden="true">
                  <span className="lb__divider-line" />
                  <Icon name="heart" size={12} />
                  <span className="lb__divider-line" />
                </div>
                <p className="lb__count">
                  {padded(index + 1)} <span aria-hidden="true">/</span> {padded(images.length)}
                </p>
              </div>
              {images.length > 1 && (
                <button
                  type="button"
                  className="lb__arrow lb__arrow--prev"
                  onClick={(e) => { e.stopPropagation(); step(-1); }}
                  aria-label="Previous image"
                >
                  <Icon name="chevronLeft" size={18} />
                </button>
              )}
            </div>

            {/* Center: photo in fixed portrait frame with crossfade */}
            <div className="lb__photo">
              <div className="lb__photo-frame">
                {prevIndex !== null && (
                  <img
                    className="lb__img lb__img--exit"
                    src={images[prevIndex].src}
                    alt={images[prevIndex].title ?? "Previous image"}
                    style={images[prevIndex].objectPosition ? { objectPosition: images[prevIndex].objectPosition } : undefined}
                    draggable={false}
                  />
                )}
                <img
                  className={`lb__img ${entering ? "lb__img--enter" : ""}`}
                  src={image.src}
                  alt={title ?? "Enlarged image"}
                  style={image.objectPosition ? { objectPosition: image.objectPosition } : undefined}
                  draggable={false}
                />
              </div>
            </div>

            {/* Right: next navigation + botanical art */}
            <div className="lb__right">
              {images.length > 1 && (
                <button
                  type="button"
                  className="lb__arrow lb__arrow--next"
                  onClick={(e) => { e.stopPropagation(); step(1); }}
                  aria-label="Next image"
                >
                  <Icon name="chevronRight" size={18} />
                </button>
              )}
              <div className="lb__botanical">
                <BotanicalArt />
              </div>
            </div>

            {/* Close button */}
            <button
              type="button"
              className="lb__close"
              onClick={(e) => { e.stopPropagation(); close(); }}
              aria-label="Close image viewer"
            >
              <Icon name="x" size={16} />
            </button>
          </div>
        </div>
      )}
    </LightboxContext.Provider>
  );
}
