import React from 'react';

interface DastnayLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero';
  showText?: boolean;
  className?: string;
  variant?: 'badge' | 'tile' | 'full' | 'text-only' | 'icon' | 'receipt';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  subtitle?: string;
}

/**
 * Pure SVG vector of the Dastnay wordmark & gradient
 * Exactly matching the official Dastnay brand mark
 */
export const DastnaySvgTile: React.FC<{
  className?: string;
  roundedClass?: string;
}> = ({ className = 'w-full h-full', roundedClass = 'rounded-xl' }) => {
  return (
    <div className={`relative overflow-hidden aspect-square ${roundedClass} ${className} shadow-sm select-none`}>
      <svg
        viewBox="0 0 500 500"
        className="w-full h-full block"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="dastnayTileGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7E2721" />
            <stop offset="25%" stopColor="#9C341E" />
            <stop offset="50%" stopColor="#C6691E" />
            <stop offset="78%" stopColor="#DD9723" />
            <stop offset="100%" stopColor="#E5A625" />
          </linearGradient>
        </defs>

        {/* Brand Gradient Background */}
        <rect width="500" height="500" fill="url(#dastnayTileGrad)" />

        {/* Exact Geometric "dastnay" wordmark */}
        <g fill="#FEE158">
          {/* d */}
          <path d="M 94 172 L 94 209 C 87 199 77 194 63 194 C 40 194 23 212 23 237 C 23 263 40 281 63 281 C 77 281 87 275 94 265 L 94 279 L 114 279 L 114 172 Z M 69 263 C 55 263 44 251 44 237 C 44 223 55 212 69 212 C 82 212 94 223 94 237 C 94 251 82 263 69 263 Z" />

          {/* a */}
          <path d="M 156 194 C 135 194 121 206 118 223 L 138 225 C 140 217 147 212 156 212 C 167 212 173 217 173 226 L 173 231 C 168 229 159 227 149 227 C 128 227 115 238 115 254 C 115 270 127 281 145 281 C 159 281 168 274 173 264 L 173 279 L 193 279 L 193 226 C 193 206 179 194 156 194 Z M 154 264 C 144 264 136 259 136 253 C 136 245 143 241 154 241 C 161 241 168 243 173 245 C 172 256 164 264 154 264 Z" />

          {/* s */}
          <path d="M 236 217 C 231 213 224 211 216 211 C 207 211 202 215 202 221 C 202 227 207 230 218 233 L 226 235 C 241 239 248 247 248 258 C 248 272 235 281 217 281 C 204 281 194 277 187 270 L 197 255 C 203 261 210 264 217 264 C 225 264 229 260 229 255 C 229 249 224 246 213 243 L 205 241 C 190 237 183 229 183 218 C 183 204 196 194 215 194 C 225 194 234 197 243 203 Z" />

          {/* t with signature notched angled top */}
          <path d="M 272 181 L 291 171 L 291 196 L 306 196 L 306 214 L 291 214 L 291 257 C 291 263 294 265 300 265 L 306 265 L 306 279 C 301 280 295 281 288 281 C 275 281 271 273 271 259 L 271 214 L 257 214 L 257 196 L 272 196 Z" />

          {/* n */}
          <path d="M 316 196 L 335 196 L 335 209 C 341 199 351 194 364 194 C 382 194 392 205 392 224 L 392 279 L 372 279 L 372 228 C 372 217 366 212 355 212 C 343 212 336 221 336 233 L 336 279 L 316 279 Z" />

          {/* a */}
          <path d="M 426 194 C 405 194 391 206 388 223 L 408 225 C 410 217 417 212 426 212 C 437 212 443 217 443 226 L 443 231 C 438 229 429 227 419 227 C 398 227 385 238 385 254 C 385 270 397 281 415 281 C 429 281 438 274 443 264 L 443 279 L 463 279 L 463 226 C 463 206 449 194 426 194 Z M 424 264 C 414 264 406 259 406 253 C 406 245 413 241 424 241 C 431 241 438 243 443 245 C 442 256 434 264 424 264 Z" />

          {/* y */}
          <path d="M 470 196 L 491 196 L 453 285 C 446 302 437 309 423 309 C 415 309 407 306 402 302 L 410 286 C 414 289 419 291 424 291 C 430 291 434 287 437 280 L 440 272 L 414 196 L 435 196 L 450 247 Z" />
        </g>
      </svg>
    </div>
  );
};

export const DastnayLogo: React.FC<DastnayLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  variant = 'badge',
  rounded = 'xl',
  subtitle = 'دسترخوان • Restaurant OS',
}) => {
  const roundedClassMap: Record<string, string> = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
  };

  const sizeMap = {
    xs: { icon: 'w-6 h-6', text: 'text-sm', sub: 'text-[8px]', gap: 'gap-1.5' },
    sm: { icon: 'w-8 h-8', text: 'text-base', sub: 'text-[9px]', gap: 'gap-2' },
    md: { icon: 'w-10 h-10', text: 'text-lg', sub: 'text-[10px]', gap: 'gap-2.5' },
    lg: { icon: 'w-13 h-13', text: 'text-2xl', sub: 'text-xs', gap: 'gap-3' },
    xl: { icon: 'w-20 h-20', text: 'text-3xl', sub: 'text-sm', gap: 'gap-4' },
    '2xl': { icon: 'w-28 h-28', text: 'text-4xl', sub: 'text-base', gap: 'gap-4' },
    hero: { icon: 'w-36 h-36', text: 'text-5xl', sub: 'text-lg', gap: 'gap-5' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const roundedClass = roundedClassMap[rounded] || 'rounded-xl';

  // Variant: Standalone full square tile (matching dastnay.png)
  if (variant === 'tile' || variant === 'icon') {
    return (
      <div className={`inline-block ${currentSize.icon} ${className}`}>
        <DastnaySvgTile roundedClass={roundedClass} />
      </div>
    );
  }

  // Variant: Thermal Print / Receipt Monochrome or Mini
  if (variant === 'receipt') {
    return (
      <div className={`flex flex-col items-center justify-center text-center ${className}`}>
        <div className="w-10 h-10 mx-auto mb-1">
          <DastnaySvgTile roundedClass="rounded-lg" />
        </div>
        <span className="font-black text-xs tracking-tight uppercase text-black font-mono">
          DASTNAY
        </span>
        <span className="text-[9px] text-stone-600 font-mono tracking-widest">
          PAKISTAN FOOD ECOSYSTEM
        </span>
      </div>
    );
  }

  // Variant: Standard brand lockup (Tile icon + Custom typography)
  return (
    <div className={`inline-flex items-center ${currentSize.gap} select-none ${className}`}>
      {/* Exact Brand Logo SVG Tile */}
      <div className={`${currentSize.icon} shrink-0`}>
        <DastnaySvgTile roundedClass={roundedClass} />
      </div>

      {/* Brand Wordmark & Tagline - Hidden on mobile screens so it fits without dragging */}
      {showText && variant !== 'text-only' && (
        <div className="hidden sm:flex flex-col leading-none">
          <div className="flex items-center gap-1">
            <span
              className={`font-black tracking-tight ${currentSize.text} text-stone-900 dark:text-stone-50`}
              style={{ letterSpacing: '-0.035em' }}
            >
              dastnay
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#E5A324] inline-block self-center mb-0.5" />
          </div>
          {subtitle && (
            <span className={`${currentSize.sub} font-semibold text-stone-500 dark:text-stone-400 tracking-wider mt-0.5`}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
