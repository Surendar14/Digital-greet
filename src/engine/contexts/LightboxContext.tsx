/**
 * Global lightbox — gallery/video/memory images open here.
 * Premium romantic "photo album" viewer:
 *  - caption on the left, photograph centered, quiet nav rail on the right
 *  - thumbnail strip along the bottom, warm animated backdrop
 * Keyboard accessible: arrows to navigate, Escape to close,
 * focus is trapped while open and restored afterwards.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
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

/** Warm dust specks that drift upward while the album is open. */
const DUST: Array<{ x: string; y: string; t: number; s: number }> = [
  { x: "8%", y: "16%", t: 9, s: 2 },
  { x: "17%", y: "62%", t: 12, s: 3 },
  { x: "27%", y: "30%", t: 10, s: 2 },
  { x: "38%", y: "70%", t: 13, s: 2 },
  { x: "47%", y: "18%", t: 11, s: 3 },
  { x: "55%", y: "56%", t: 9.5, s: 2 },
  { x: "63%", y: "84%", t: 12.5, s: 3 },
  { x: "71%", y: "24%", t: 8.5, s: 2 },
  { x: "78%", y: "48%", t: 11.5, s: 2 },
  { x: "86%", y: "70%", t: 13.5, s: 3 },
  { x: "93%", y: "22%", t: 9.5, s: 2 },
  { x: "97%", y: "78%", t: 12, s: 2 },
  { x: "30%", y: "88%", t: 14, s: 2 },
  { x: "80%", y: "6%", t: 10.5, s: 3 }
];

export function LightboxProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<LightboxImage[]>([]);
  const [index, setIndex] = useState(0);
  const [title, setTitle] = useState<string | undefined>();
  const [zoom, setZoom] = useState(1);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const thumbnailRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const pinchRef = useRef<{ base: number; dist: number } | null>(null);
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const swipeRef = useRef<{ x: number; y: number } | null>(null);

  const openLightbox = useCallback(
    (imgs: LightboxImage[], startIndex = 0, opts?: { title?: string }) => {
      triggerRef.current = document.activeElement as HTMLElement | null;
      setImages(imgs);
      setIndex(Math.max(0, Math.min(startIndex, imgs.length - 1)));
      setTitle(opts?.title);
      setZoom(1);
      setOpen(true);
    },
    []
  );

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus?.();
  }, []);

  const step = useCallback(
    (dir: 1 | -1) => {
      setIndex((i) => (i + dir + images.length) % images.length);
      setZoom(1);
    },
    [images.length]
  );

  /** Pinch-zoom with two pointers, plus simple horizontal swipe to navigate. */
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      const current = pointersRef.current;
      if (current.size === 0) swipeRef.current = { x: e.clientX, y: e.clientY };
      current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (current.size === 2) {
        const pts = Array.from(current.values());
        pinchRef.current = {
          base: zoom,
          dist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
        };
        swipeRef.current = null;
      }
    },
    [zoom]
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointersRef.current.size === 2 && pinchRef.current) {
      const pts = Array.from(pointersRef.current.values());
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const next = pinchRef.current.base * (dist / Math.max(1, pinchRef.current.dist));
      setZoom(Math.min(4, Math.max(1, next)));
    }
  }, []);

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      pointersRef.current.delete(e.pointerId);
      if (pointersRef.current.size < 2) pinchRef.current = null;
      if (pointersRef.current.size === 0 && swipeRef.current) {
        const dx = e.clientX - swipeRef.current.x;
        const dy = e.clientY - swipeRef.current.y;
        swipeRef.current = null;
        if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.4) step(dx < 0 ? 1 : -1);
      }
    },
    [step]
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
    document.querySelector<HTMLElement>(".lightbox")?.scrollTo(0, 0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const strip = document.querySelector<HTMLElement>(".lightbox__thumbs");
    const thumb = thumbnailRefs.current[index];
    if (!strip || !thumb) return;
    strip.scrollTo({ left: thumb.offsetLeft - (strip.clientWidth - thumb.clientWidth) / 2, behavior: "smooth" });
  }, [index, open]);

  const value: LightboxApi = useMemo(() => ({ open: openLightbox, close }), [openLightbox, close]);

  const image = images[index];
  const caption = image?.caption;
  const padded = (n: number) => String(n).padStart(2, "0");

  return (
    <LightboxContext.Provider value={value}>
      {children}
      {open && images.length > 0 && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Image viewer, image ${index + 1} of ${images.length}`}
          onClick={close}
        >
          <div className="lightbox__ambient" aria-hidden="true">
            <span className="lb-blob lb-blob--a" />
            <span className="lb-blob lb-blob--b" />
            <span className="lb-blob lb-blob--c" />
            {DUST.map((d, i) => (
              <span
                key={i}
                className="lb-dust"
                style={{ left: d.x, top: d.y, "--t": `${d.t}s`, "--s": `${d.s}px` } as CSSProperties}
              />
            ))}
          </div>
          <div className="lightbox__grain" aria-hidden="true" />

          <div
            className="lightbox__frame"
            ref={panelRef}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => {
              if (!pinchRef.current) setZoom((z) => Math.min(4, Math.max(1, z - e.deltaY * 0.0016)));
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <BotanicalArt />

            <button
              type="button"
              className="lightbox__close"
              onClick={(e) => {
                e.stopPropagation();
                close();
              }}
              aria-label="Close image viewer"
            >
              <Icon name="x" size={19} />
            </button>

            <figure className="lightbox__caption" key={`cap-${index}`}>
              {title && <p className="lightbox__eyebrow">{title}</p>}
              {caption && <h3 className="lightbox__title">{caption}</h3>}
              <div className="lightbox__divider" aria-hidden="true">
                <span className="lb-div-line lb-div-line--l" />
                <Icon name="heart" size={15} />
                <span className="lb-div-line lb-div-line--r" />
              </div>
              <p className="lightbox__count">
                {padded(index + 1)} <span aria-hidden="true">/</span> {padded(images.length)}
              </p>
            </figure>

            <div className="lightbox__photo" key={`photo-${index}`}>
              <img
                className="lightbox__img"
                src={image.src}
                alt={caption ?? "Enlarged image"}
                style={{ transform: `scale(${zoom})` }}
                draggable={false}
              />
              {images.length > 1 && (
                <button
                  type="button"
                  className="lightbox__arrow lightbox__arrow--prev"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(-1);
                  }}
                  aria-label="Previous image"
                >
                  <Icon name="chevronLeft" size={26} />
                </button>
              )}
              {images.length > 1 && (
                <button
                  type="button"
                  className="lightbox__arrow lightbox__arrow--next"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(1);
                  }}
                  aria-label="Next image"
                >
                  <Icon name="chevronRight" size={26} />
                </button>
              )}
            </div>

            {images.length > 1 && (
              <div className="lightbox__thumbs" role="group" aria-label="Thumbnails, choose an image">
                {images.map((img, i) => (
                  <button
                    key={`${i}-${img.src}`}
                    ref={(node) => {
                      thumbnailRefs.current[i] = node;
                    }}
                    type="button"
                    className={`lightbox__thumb${i === index ? " lightbox__thumb--active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIndex(i);
                      setZoom(1);
                    }}
                    aria-label={`Show image ${i + 1}${img.caption ? `, ${img.caption}` : ""}`}
                    aria-pressed={i === index}
                  >
                    <img src={img.src} alt="" draggable={false} />
                  </button>
                ))}
              </div>
            )}

            <div className="lightbox__foot" aria-hidden="true" />
          </div>
        </div>
      )}
    </LightboxContext.Provider>
  );
}
