import React from 'react';

export const DASTNAY_LOGO_URL = 'https://i.postimg.cc/3x2bhxWh/dastanay-weburllogo.png';

interface DastnayLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero';
  showText?: boolean;
  className?: string;
  variant?: 'badge' | 'tile' | 'full' | 'text-only' | 'icon' | 'receipt';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  subtitle?: string;
}

/**
 * Direct reference to the Dastnay brand logo asset using external hosted URL:
 * https://i.postimg.cc/3x2bhxWh/dastanay-weburllogo.png
 */
export const DastnaySvgTile: React.FC<{
  className?: string;
  roundedClass?: string;
}> = ({ className = 'w-full h-full', roundedClass = 'rounded-xl' }) => {
  return (
    <div className={`relative overflow-hidden aspect-square ${roundedClass} ${className} shadow-xs select-none bg-[#364FAB]`}>
      <img
        src={DASTNAY_LOGO_URL}
        alt="Dastnay Logo"
        className="w-full h-full object-contain block select-none pointer-events-none"
        referrerPolicy="no-referrer"
      />
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

  // Variant: Standalone full square tile
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
        <span className="font-black text-xs tracking-tight uppercase text-[#22336F] dark:text-[#E8ECFB] font-mono">
          DASTNAY
        </span>
        <span className="text-[9px] text-[#687078] font-mono tracking-widest">
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

      {/* Brand Wordmark & Tagline */}
      {showText && variant !== 'text-only' && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1">
            <span
              className={`font-black tracking-tight ${currentSize.text} text-[#202124] dark:text-[#F7F8FA]`}
              style={{ letterSpacing: '-0.035em' }}
            >
              dastnay
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#364FAB] inline-block self-center mb-0.5" />
          </div>
          {subtitle && (
            <span className={`${currentSize.sub} font-semibold text-[#687078] dark:text-[#E8ECFB]/70 tracking-wider mt-0.5`}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

