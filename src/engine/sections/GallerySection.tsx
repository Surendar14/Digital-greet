import { useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
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
  photos?: Array<
    string | { src: string; title?: string; description?: string; ratio?: string; objectPosition?: string }
  >;
}

interface CloneOffset { x: number; y: number; }

export function GallerySection(props: SectionProps) {
  const c = (props.content ?? {}) as GalleryContent;
  const lightbox = useLightbox();
  const settings = props.section.settings ?? {};
  const mode = getSetting<string>(settings, "mode", "masonry");
  const carouselRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [cloneOffsets, setCloneOffsets] = useState<Record<number, CloneOffset>>({});

  const photos = (c.photos ?? []).map((p, i) =>
    typeof p === "string"
      ? { src: p, title: undefined, description: undefined, ratio: undefined, objectPosition: undefined, key: i }
      : { ...p, key: i }
  );

  useLayoutEffect(() => {
    const updateOffsets = () => {
      const source = cardRefs.current[0];
      if (!source) return;
      const sourceRect = source.getBoundingClientRect();
      const nextOffsets: Record<number, CloneOffset> = {};
      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        const rect = card.getBoundingClientRect();
        nextOffsets[index] = { x: sourceRect.left - rect.left, y: sourceRect.top - rect.top };
      });
      setCloneOffsets(nextOffsets);
    };

    updateOffsets();
    window.addEventListener("resize", updateOffsets, { passive: true });
    return () => window.removeEventListener("resize", updateOffsets);
  }, [mode, photos.length]);

  if (photos.length === 0) return null;

  const openAt = (i: number) => {
    lightbox.open(
      photos.map((p) => ({
        src: p.src,
        title: p.title,
        description: p.description,
        objectPosition: p.objectPosition
      })),
      i,
      { subtitle: c.subtitle }
    );
  };

  const scrollCarousel = (dir: 1 | -1) => {
    const el = carouselRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  const cloneMotion = (index: number) => {
    const offset = cloneOffsets[index] ?? { x: 0, y: 0 };
    return {
      initial: { opacity: 0, x: offset.x, y: offset.y, scale: 0.72 },
      whileInView: { opacity: 1, x: 0, y: 0, scale: 1 },
      viewport: { once: true, amount: 0.16 },
      transition: { type: "spring" as const, stiffness: 105, damping: 20, delay: index * 0.1 }
    };
  };

  return (
    <SectionShell section={props.section}>
      <SectionHeading kicker={c.kicker} title={c.title} subtitle={c.subtitle} />

      {mode === "carousel" ? (
        <div className="gallery-carousel-wrap">
          <div className="gallery-carousel" ref={carouselRef}>
            {photos.map((p, index) => (
              <motion.div key={p.key} ref={(node) => { cardRefs.current[index] = node; }} {...cloneMotion(index)}>
                <LazyImage
                  src={p.src}
                  alt={p.title ?? `Gallery photo ${p.key + 1}`}
                  className="gallery-carousel__item"
                  onClick={() => openAt(p.key)}
                  caption={p.title}
                />
              </motion.div>
            ))}
          </div>
          <button type="button" className="gallery-nav gallery-nav--prev" onClick={() => scrollCarousel(-1)} aria-label="Scroll gallery left">
            <Icon name="chevronLeft" size={20} />
          </button>
          <button type="button" className="gallery-nav gallery-nav--next" onClick={() => scrollCarousel(1)} aria-label="Scroll gallery right">
            <Icon name="chevronRight" size={20} />
          </button>
        </div>
      ) : (
        <div className={mode === "masonry" ? "gallery masonry" : "gallery grid"}>
          {photos.map((p, index) => (
            <motion.div key={p.key} ref={(node) => { cardRefs.current[index] = node; }} {...cloneMotion(index)}>
              <LazyImage
                src={p.src}
                alt={p.title ?? `Gallery photo ${p.key + 1}`}
                className="gallery__item"
                aspectRatio={mode === "masonry" ? p.ratio ?? "3/4" : "1/1"}
                onClick={() => openAt(p.key)}
                caption={p.title}
              />
            </motion.div>
          ))}
        </div>
      )}
    </SectionShell>
  );
}
