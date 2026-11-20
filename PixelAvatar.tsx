import React, { useMemo } from 'react';
import { PixelAvatarConfig, buildPixelLayers, DEFAULT_AVATAR } from '../data/pixelParts';

interface PixelAvatarProps {
  config?: PixelAvatarConfig;
  /** height in px (width auto = height * 0.75) */
  size?: number;
  animate?: boolean;
  isMoving?: boolean;
  facing?: 'up' | 'down' | 'left' | 'right';
  showAura?: boolean;
  auraOverride?: string;
  shadow?: boolean;
  /** full body, bust or head portrait */
  crop?: 'full' | 'bust' | 'head';
  className?: string;
}

const VIEWBOX: Record<'full' | 'bust' | 'head', { box: string; ratio: number }> = {
  full: { box: '0 0 24 32', ratio: 0.75 },
  bust: { box: '3 0 18 20', ratio: 0.9 },
  head: { box: '4 0 16 16', ratio: 1 }
};

export const PixelAvatar: React.FC<PixelAvatarProps> = ({
  config,
  size = 96,
  animate = true,
  isMoving = false,
  facing = 'down',
  showAura = true,
  auraOverride,
  shadow = false,
  crop = 'full',
  className = ''
}) => {
  const cfg = config || DEFAULT_AVATAR;
  const rects = useMemo(() => buildPixelLayers(cfg), [cfg]);

  const view = VIEWBOX[crop];
  const width = size * view.ratio;
  const aura = auraOverride || cfg.auraColor;
  const flip = facing === 'left';
  const backView = facing === 'up';

  return (
    <div
      className={`relative inline-flex items-end justify-center select-none pointer-events-none ${className}`}
      style={{ width, height: size }}
    >
      {showAura && (
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl opacity-60 transition-colors duration-700"
          style={{
            width: width * 1.5,
            height: width * 1.5,
            background: `radial-gradient(circle, ${aura}CC 0%, ${aura}22 60%, transparent 75%)`
          }}
        />
      )}

      {shadow && (
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-[50%] bg-slate-900/20 blur-[2px]"
          style={{ width: width * 0.62, height: size * 0.06 }}
        />
      )}

      <div
        className="relative z-10"
        style={{ transform: flip ? 'scaleX(-1)' : undefined, lineHeight: 0 }}
      >
        <svg
          viewBox={view.box}
          width={width}
          height={size}
          shapeRendering="crispEdges"
          className={animate ? (isMoving ? 'sk-walk' : 'sk-idle') : ''}
          style={{ imageRendering: 'pixelated', display: 'block' }}
        >
          {rects.map((r, i) => (
            <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} fill={r.c} />
          ))}

          {/* back view: cover the face with hair/hood colour */}
          {backView && (
            <rect x={8} y={6} width={8} height={9} fill={cfg.cloak === 'hood' ? cfg.cloakColor : cfg.hairColor} />
          )}
        </svg>
      </div>
    </div>
  );
};
