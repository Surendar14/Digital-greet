/**
 * Global lightbox — gallery/video/memory images open here.
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
  type ReactNode
} from "react";
import type { LightboxApi, LightboxImage } from "../types";
import { Icon } from "../components/Icon";

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
  const [zoom, setZoom] = useState(1);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const pinchRef = useRef<{ base: number; dist: number } | null>(null);
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());

  const openLightbox = useCallback((imgs: LightboxImage[], startIndex = 0) => {
    triggerRef.current = document.activeElement as HTMLElement | null;
    setImages(imgs);
    setIndex(Math.max(0, Math.min(startIndex, imgs.length - 1)));
    setZoom(1);
    setOpen(true);
  }, []);

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

  /** Pinch-zoom with two pointers. */
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointersRef.current.size === 2) {
      const pts = Array.from(pointersRef.current.values());
      pinchRef.current = {
        base: zoom,
        dist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
      };
    }
  }, [zoom]);

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

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) pinchRef.current = null;
  }, []);

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
  }, [open]);

  const value: LightboxApi = useMemo(() => ({ open: openLightbox, close }), [openLightbox, close]);

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
          <div
            className="lightbox__stage"
            ref={panelRef}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => {
              setZoom((z) => Math.min(4, Math.max(1, z - e.deltaY * 0.0016)));
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <img
              className="lightbox__img"
              src={images[index].src}
              alt={images[index].caption ?? "Enlarged image"}
              style={{ transform: `scale(${zoom})` }}
              draggable={false}
            />
            {images[index].caption && (
              <figcaption className="lightbox__caption">{images[index].caption}</figcaption>
            )}
          </div>

          <button
            type="button"
            className="lightbox__btn lightbox__btn--close"
            onClick={close}
            aria-label="Close image viewer"
          >
            <Icon name="x" size={20} />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                className="lightbox__btn lightbox__btn--prev"
                onClick={() => step(-1)}
                aria-label="Previous image"
              >
                <Icon name="chevronLeft" size={22} />
              </button>
              <button
                type="button"
                className="lightbox__btn lightbox__btn--next"
                onClick={() => step(1)}
                aria-label="Next image"
              >
                <Icon name="chevronRight" size={22} />
              </button>
              <div className="lightbox__count" aria-hidden="true">
                {index + 1} / {images.length}
              </div>
            </>
          )}
        </div>
      )}
    </LightboxContext.Provider>
  );
}