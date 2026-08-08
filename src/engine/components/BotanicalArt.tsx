/**
 * Subtle fine-line botanical decorations for the lightbox (per reference).
 * Asymmetric editorial framing: a small sprig top-left, a larger botanical
 * bottom-left, and a delicate sprig bottom-right. Low opacity, muted copper
 * strokes with dusty-rose accents — line art, not filled flowers.
 */

interface LeafProps {
  d: string;
}

function Leaf({ d }: LeafProps) {
  return <path className="botanical__leaf" d={d} />;
}

/** Small fine-line sprig — sits in the top-left corner. */
function Sprig() {
  return (
    <svg viewBox="0 0 110 120" aria-hidden="true">
      <path className="botanical__stem" d="M 96 114 C 84 104 74 94 66 82 C 58 70 50 58 42 46 C 36 37 30 29 22 22" />
      <Leaf d="M 88 96 C 72 94 60 100 58 112 C 72 112 82 106 88 96 Z" />
      <Leaf d="M 70 78 C 54 73 42 76 39 87 C 52 91 63 88 70 78 Z" />
      <Leaf d="M 50 58 C 38 55 28 59 26 68 C 36 70 44 66 50 58 Z" />
      <circle className="botanical__bud botanical__bud--1" cx="30" cy="35" r="4.5" />
      <circle className="botanical__bud botanical__bud--2" cx="44" cy="42" r="3" />
    </svg>
  );
}

/** Larger botanical cluster — sits in the bottom-left corner. */
function Bloom() {
  return (
    <svg viewBox="0 0 150 160" aria-hidden="true">
      <path className="botanical__stem" d="M 24 150 C 44 138 58 118 66 96 C 72 79 82 62 94 50" />
      <path className="botanical__stem" d="M 54 148 C 62 128 76 108 92 92" />
      <path className="botanical__stem" d="M 84 140 C 96 126 106 112 118 96" />
      <Leaf d="M 84 118 C 66 118 52 126 50 140 C 66 140 80 132 84 118 Z" />
      <Leaf d="M 116 108 C 104 106 96 112 96 123 C 106 124 112 120 116 108 Z" />
      <Leaf d="M 56 108 C 44 104 34 110 34 122 C 46 124 54 120 56 108 Z" />
      <Leaf d="M 78 74 C 66 70 56 75 54 87 C 66 90 76 84 78 74 Z" />
      <path className="botanical__petal" d="M 96 44 C 92 36 98 28 108 28 C 112 36 108 44 104 50 C 100 50 98 48 96 44 Z" />
      <path className="botanical__petal" d="M 96 44 C 86 44 80 50 82 60 C 90 62 98 58 100 52 C 100 48 98 46 96 44 Z" />
      <path className="botanical__petal" d="M 96 44 C 100 36 108 34 112 42 C 112 50 104 54 96 44 Z" />
      <path className="botanical__petal" d="M 96 44 C 104 52 106 62 98 66 C 90 62 92 52 96 44 Z" />
      <circle className="botanical__core" cx="96" cy="46" r="6" />
      <circle className="bot__bud botanical__bud--" cx="120" cy="62" r="5" />
    </svg>
  );
}

/** Delicate sprig — sits in the bottom-right corner. */
function SprigRight() {
  return (
    <svg viewBox="0 0 120 110" aria-hidden="true">
      <path className="botanical__stem" d="M 14 100 C 30 78 48 58 70 38 C 82 28 92 20 102 12" />
      <Leaf d="M 66 66 C 52 62 42 68 42 80 C 54 84 62 78 66 66 Z" />
      <Leaf d="M 46 40 C 34 36 24 42 24 54 C 34 58 44 50 46 40 Z" />
      <circle className="bot__bud botanical__bud--seed" cx="94" cy="28" r="4" />
    </svg>
  );
}

/** Asymmetric botanical decoration set for the lightbox frame. */
export function BotanicalArt() {
  return (
    <>
      <div className="botanical botanical--tl">
        <Sprig />
      </div>
      <div className="botanical botanical--bl">
        <Bloom />
      </div>
      <div className="botanical botanical--br">
        <SprigRight />
      </div>
    </>
  );
}