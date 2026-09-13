import React from 'react';

export type RankMaterial = 'Copper' | 'Iron' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Mithril' | 'Orichalcum';
export type RankSubRank = 'III' | 'II' | 'I';

interface RankBadgeIconProps {
  material: RankMaterial;
  subRank?: RankSubRank;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showGlow?: boolean;
}

const PALETTES: Record<RankMaterial, { primary: string; secondary: string; dark: string; glow: string; text: string }> = {
  Copper: {
    primary: '#d97736',
    secondary: '#f0aa73',
    dark: '#54260d',
    glow: 'rgba(217, 119, 54, 0.6)',
    text: '#fbdcc4'
  },
  Iron: {
    primary: '#808f9f',
    secondary: '#d1dbe5',
    dark: '#2c3540',
    glow: 'rgba(176, 185, 198, 0.5)',
    text: '#eef3f8'
  },
  Bronze: {
    primary: '#d96c1e',
    secondary: '#fba954',
    dark: '#592403',
    glow: 'rgba(240, 130, 40, 0.65)',
    text: '#ffe2c7'
  },
  Silver: {
    primary: '#94a3b8',
    secondary: '#f1f5f9',
    dark: '#334155',
    glow: 'rgba(226, 232, 240, 0.6)',
    text: '#ffffff'
  },
  Gold: {
    primary: '#eab308',
    secondary: '#fef08a',
    dark: '#713f12',
    glow: 'rgba(250, 204, 21, 0.75)',
    text: '#fffbeb'
  },
  Platinum: {
    primary: '#06b6d4',
    secondary: '#a5f3fc',
    dark: '#164e63',
    glow: 'rgba(34, 211, 238, 0.8)',
    text: '#ecfeff'
  },
  Mithril: {
    primary: '#2563eb',
    secondary: '#93c5fd',
    dark: '#1e3a8a',
    glow: 'rgba(59, 130, 246, 0.85)',
    text: '#eff6ff'
  },
  Orichalcum: {
    primary: '#a855f7',
    secondary: '#f0abfc',
    dark: '#4c1d95',
    glow: 'rgba(192, 132, 252, 0.9)',
    text: '#faf5ff'
  }
};

const SIZES = {
  xs: 'w-5 h-5',
  sm: 'w-7 h-7',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24'
};

export const RankBadgeIcon: React.FC<RankBadgeIconProps> = ({
  material,
  subRank = 'III',
  size = 'md',
  className = '',
  showGlow = true
}) => {
  const p = PALETTES[material] || PALETTES.Copper;
  const gradientId = `rank-grad-${material.toLowerCase()}-${subRank}`;
  const glowId = `rank-glow-${material.toLowerCase()}-${subRank}`;

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${SIZES[size]} ${className}`}>
      <svg
        viewBox="0 0 100 115"
        className="w-full h-full drop-shadow-md overflow-visible"
        style={{
          filter: showGlow ? `drop-shadow(0px 0px 8px ${p.glow})` : undefined
        }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={p.secondary} />
            <stop offset="50%" stopColor={p.primary} />
            <stop offset="100%" stopColor={p.dark} />
          </linearGradient>

          <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={p.secondary} stopOpacity="0.8" />
            <stop offset="100%" stopColor={p.primary} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Hexagonal Outer Metallic Shield Frame */}
        <polygon
          points="50,4 92,26 92,74 50,96 8,74 8,26"
          fill={`url(#${gradientId})`}
          stroke={p.secondary}
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Inner Shield Inset */}
        <polygon
          points="50,12 84,30 84,70 50,88 16,70 16,30"
          fill="#090b12"
          stroke={p.primary}
          strokeWidth="2"
          opacity="0.95"
        />

        {/* Center Crystal Gem / Emblem */}
        <polygon points="50,22 72,50 50,78 28,50" fill={`url(#${glowId})`} opacity="0.6" />
        <polygon points="50,28 66,50 50,72 34,50" fill={`url(#${gradientId})`} stroke={p.secondary} strokeWidth="1.5" />
        <polygon points="50,34 60,50 50,66 40,50" fill={p.secondary} opacity="0.85" />

        {/* Roman Numeral Header Badge (III / II / I) */}
        <rect x="36" y="8" width="28" height="14" rx="4" fill="#040508" stroke={p.secondary} strokeWidth="1.5" />
        <text
          x="50"
          y="18.5"
          textAnchor="middle"
          fill={p.text}
          fontSize="9.5"
          fontWeight="900"
          fontFamily="monospace"
        >
          {subRank}
        </text>

        {/* Stars Accent */}
        <circle cx="28" cy="80" r="3" fill={p.secondary} />
        <circle cx="50" cy="84" r="4" fill={p.secondary} />
        <circle cx="72" cy="80" r="3" fill={p.secondary} />
      </svg>
    </div>
  );
};
