/** Fine-line botanical rose — whisper-thin, barely there. */
export function BotanicalArt() {
  return (
    <div className="botanical" aria-hidden="true">
      <svg viewBox="0 0 180 380" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g stroke="currentColor" strokeWidth="0.55" strokeLinecap="round" strokeLinejoin="round">
          {/* Stem */}
          <path d="M 90 370 C 88 340 86 300 87 260 C 88 220 90 180 89 140 C 88 110 89 85 90 60" />

          {/* Leaves — lower */}
          <path d="M 88 310 C 68 298 44 300 30 316 C 44 322 64 318 88 310 Z" />
          <path d="M 54 314 L 44 306" strokeWidth="0.35" />
          <path d="M 72 311 L 66 304" strokeWidth="0.35" />

          <path d="M 90 280 C 112 268 134 270 148 286 C 134 292 114 288 90 280 Z" />
          <path d="M 120 284 L 130 276" strokeWidth="0.35" />

          {/* Leaves — middle */}
          <path d="M 88 240 C 64 228 40 230 26 248 C 42 254 62 250 88 240 Z" />
          <path d="M 50 246 L 40 238" strokeWidth="0.35" />

          <path d="M 90 215 C 114 203 136 205 150 222 C 136 228 116 224 90 215 Z" />

          {/* Leaves — upper */}
          <path d="M 89 180 C 70 170 52 172 42 184 C 54 188 70 186 89 180 Z" />
          <path d="M 90 158 C 108 148 124 150 134 162 C 122 166 108 164 90 158 Z" />

          {/* Thorns */}
          <path d="M 87 330 L 82 326" strokeWidth="0.4" />
          <path d="M 89 260 L 94 256" strokeWidth="0.4" />

          {/* Rose bloom */}
          <path d="M 90 60 C 78 44 68 28 72 14 C 75 6 82 0 90 -2 C 98 0 105 6 108 14 C 112 28 102 44 90 60 Z" />
          <path d="M 82 32 C 78 22 80 12 90 4 C 84 16 82 24 82 32 Z" strokeWidth="0.4" />
          <path d="M 98 32 C 102 22 100 12 90 4 C 96 16 98 24 98 32 Z" strokeWidth="0.4" />

          {/* Sepals */}
          <path d="M 76 58 C 66 54 58 56 52 64 C 60 66 70 64 76 58 Z" strokeWidth="0.4" />
          <path d="M 104 58 C 114 54 122 56 128 64 C 120 66 110 64 104 58 Z" strokeWidth="0.4" />
        </g>

        {/* Sparkle — just one, very faint */}
        <g fill="currentColor" opacity="0.3">
          <polygon points="138,30 139.5,35 144,35 140.5,38 142,43 138,40 134,43 135.5,38 132,35 136.5,35" />
        </g>
      </svg>
    </div>
  );
}
