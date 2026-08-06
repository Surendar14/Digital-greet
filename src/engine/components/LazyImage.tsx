import { useState } from "react";
import { cx } from "../utils/resolve";

/** Lazy-loaded image with a soft shimmer placeholder while loading. */
export interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
  eager?: boolean;
  onClick?: () => void;
  caption?: string;
}

export function LazyImage({ src, alt, className, aspectRatio, eager, onClick, caption }: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <figure
      className={cx("lazyimg", loaded && "is-loaded", className)}
      style={aspectRatio ? { aspectRatio } : undefined}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `View larger: ${alt}` : undefined}
    >
      <img
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        draggable={false}
      />
      {!loaded && <span className="lazyimg__shimmer" aria-hidden="true" />}
      {caption && <figcaption className="lazyimg__caption">{caption}</figcaption>}
    </figure>
  );
}