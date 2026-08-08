import { useRef } from "react";
import type { SectionProps } from "../types";
import { SectionShell, SectionHeading } from "../components/SectionShell";
import { LazyImage } from "../components/LazyImage";
import { useLightbox } from "../contexts/LightboxContext";
import { getSetting } from "../utils/resolve";
import { Icon } from "../components/Icon";

interface GalleryContent {
  kicker?: string;
  title?: string;
  subtitle?: string;
  /** Either plain strings (src) or {src, caption?, ratio?} objects. */
  photos?: Array<string | { src: string; caption?: string; ratio?: string }>;
}

export function GallerySection(props: SectionProps) {
  const c = (props.content ?? {}) as GalleryContent;
  const lightbox = useLightbox();
  const settings = props.section.settings ?? {};
  const mode = getSetting<string>(settings, "mode", "masonry");
  const lightboxEnabled = getSetting(settings, "lightbox", true);
  const carouselRef = useRef<HTMLDivElement>(null);

  const photos = (c.photos ?? []).map((p, i) =>
    typeof p === "string" ? { src: p, caption: undefined, ratio: undefined, key: i } : { ...p, key: i }
  );
  if (photos.length === 0) return null;

  const openAt = (i: number) => {
    if (!lightboxEnabled) return;
    lightbox.open(
      photos.map((p) => ({ src: p.src, caption: p.caption })),
      i,
      { title: c.title }
    );
  };

  const scrollCarousel = (dir: 1 | -1) => {
    const el = carouselRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <SectionShell section={props.section}>
      <SectionHeading kicker={c.kicker} title={c.title} subtitle={c.subtitle} />

      {mode === "carousel" ? (
        <div className="gallery-carousel-wrap">
          <div className="gallery-carousel" ref={carouselRef}>
            {photos.map((p) => (
              <LazyImage
                key={p.key}
                src={p.src}
                alt={p.caption ?? `Gallery photo ${p.key + 1}`}
                className="gallery-carousel__item"
                onClick={() => openAt(p.key)}
                caption={p.caption}
              />
            ))}
          </div>
          <button
            type="button"
            className="gallery-nav gallery-nav--prev"
            onClick={() => scrollCarousel(-1)}
            aria-label="Scroll gallery left"
          >
            <Icon name="chevronLeft" size={20} />
          </button>
          <button
            type="button"
            className="gallery-nav gallery-nav--next"
            onClick={() => scrollCarousel(1)}
            aria-label="Scroll gallery right"
          >
            <Icon name="chevronRight" size={20} />
          </button>
        </div>
      ) : (
        <div className={mode === "masonry" ? "gallery masonry" : "gallery grid"}>
          {photos.map((p) => (
            <LazyImage
              key={p.key}
              src={p.src}
              alt={p.caption ?? `Gallery photo ${p.key + 1}`}
              className="gallery__item"
              aspectRatio={mode === "masonry" ? p.ratio ?? "3/4" : "1/1"}
              onClick={() => openAt(p.key)}
              caption={p.caption}
            />
          ))}
        </div>
      )}
    </SectionShell>
  );
}