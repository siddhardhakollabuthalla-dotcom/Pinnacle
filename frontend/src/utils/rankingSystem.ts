export interface RankTier {
  id: number; // 1 to 24
  material: 'Copper' | 'Iron' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Mithril' | 'Orichalcum';
  tierNumber: 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | 'VII' | 'VIII';
  subRank: 'III' | 'II' | 'I';
  fullName: string; // e.g. "Copper III", "Platinum I"
  icon: string; // Emoji e.g. 🟤, 🔮
  powerLevel: string; // Stars e.g. ⭐, ⭐⭐⭐⭐⭐⭐
  color: string; // Hex color for glow / styling
  badgeClass: string; // Tailwind styling class
  minRatingScore: number;
}

export const RANK_TIERS: RankTier[] = [
  // 1. Copper (Tier I)
  { id: 1, material: 'Copper', tierNumber: 'I', subRank: 'III', fullName: 'Copper III', icon: '🟤', powerLevel: '⭐', color: '#b87333', badgeClass: 'border-[rgba(184,115,51,0.5)] text-[#d99b66] bg-[rgba(184,115,51,0.12)]', minRatingScore: 0 },
  { id: 2, material: 'Copper', tierNumber: 'I', subRank: 'II', fullName: 'Copper II', icon: '🟤', powerLevel: '⭐', color: '#c47d3d', badgeClass: 'border-[rgba(196,125,61,0.5)] text-[#e0a373] bg-[rgba(196,125,61,0.15)]', minRatingScore: 100 },
  { id: 3, material: 'Copper', tierNumber: 'I', subRank: 'I', fullName: 'Copper I', icon: '🟤', powerLevel: '⭐', color: '#d18847', badgeClass: 'border-[rgba(209,136,71,0.6)] text-[#eba87f] bg-[rgba(209,136,71,0.18)]', minRatingScore: 250 },

  // 2. Iron (Tier II)
  { id: 4, material: 'Iron', tierNumber: 'II', subRank: 'III', fullName: 'Iron III', icon: '⚫', powerLevel: '⭐⭐', color: '#71717a', badgeClass: 'border-zinc-500/50 text-zinc-300 bg-zinc-500/15', minRatingScore: 450 },
  { id: 5, material: 'Iron', tierNumber: 'II', subRank: 'II', fullName: 'Iron II', icon: '⚫', powerLevel: '⭐⭐', color: '#a1a1aa', badgeClass: 'border-zinc-400/50 text-zinc-200 bg-zinc-400/18', minRatingScore: 700 },
  { id: 6, material: 'Iron', tierNumber: 'II', subRank: 'I', fullName: 'Iron I', icon: '⚫', powerLevel: '⭐⭐', color: '#d4d4d8', badgeClass: 'border-zinc-300/60 text-white bg-zinc-300/20 shadow-[0_0_10px_rgba(212,212,216,0.2)]', minRatingScore: 1000 },

  // 3. Bronze (Tier III)
  { id: 7, material: 'Bronze', tierNumber: 'III', subRank: 'III', fullName: 'Bronze III', icon: '🥉', powerLevel: '⭐⭐⭐', color: '#cd7f32', badgeClass: 'border-amber-700/50 text-amber-500 bg-amber-700/15', minRatingScore: 1400 },
  { id: 8, material: 'Bronze', tierNumber: 'III', subRank: 'II', fullName: 'Bronze II', icon: '🥉', powerLevel: '⭐⭐⭐', color: '#d98c40', badgeClass: 'border-amber-600/50 text-amber-400 bg-amber-600/18', minRatingScore: 1900 },
  { id: 9, material: 'Bronze', tierNumber: 'III', subRank: 'I', fullName: 'Bronze I', icon: '🥉', powerLevel: '⭐⭐⭐', color: '#e6994d', badgeClass: 'border-amber-500/60 text-amber-300 bg-amber-500/20 shadow-[0_0_12px_rgba(217,140,64,0.25)]', minRatingScore: 2500 },

  // 4. Silver (Tier IV)
  { id: 10, material: 'Silver', tierNumber: 'IV', subRank: 'III', fullName: 'Silver III', icon: '🥈', powerLevel: '⭐⭐⭐⭐', color: '#94a3b8', badgeClass: 'border-slate-400/50 text-slate-300 bg-slate-400/15', minRatingScore: 3200 },
  { id: 11, material: 'Silver', tierNumber: 'IV', subRank: 'II', fullName: 'Silver II', icon: '🥈', powerLevel: '⭐⭐⭐⭐', color: '#cbd5e1', badgeClass: 'border-slate-300/50 text-slate-200 bg-slate-300/18', minRatingScore: 4000 },
  { id: 12, material: 'Silver', tierNumber: 'IV', subRank: 'I', fullName: 'Silver I', icon: '🥈', powerLevel: '⭐⭐⭐⭐', color: '#f1f5f9', badgeClass: 'border-slate-200/60 text-white bg-slate-200/20 shadow-[0_0_12px_rgba(241,245,249,0.3)]', minRatingScore: 5000 },

  // 5. Gold (Tier V)
  { id: 13, material: 'Gold', tierNumber: 'V', subRank: 'III', fullName: 'Gold III', icon: '🥇', powerLevel: '⭐⭐⭐⭐⭐', color: '#eab308', badgeClass: 'border-yellow-500/50 text-yellow-400 bg-yellow-500/15', minRatingScore: 6200 },
  { id: 14, material: 'Gold', tierNumber: 'V', subRank: 'II', fullName: 'Gold II', icon: '🥇', powerLevel: '⭐⭐⭐⭐⭐', color: '#facc15', badgeClass: 'border-yellow-400/60 text-yellow-300 bg-yellow-400/20 shadow-[0_0_12px_rgba(250,204,21,0.25)]', minRatingScore: 7500 },
  { id: 15, material: 'Gold', tierNumber: 'V', subRank: 'I', fullName: 'Gold I', icon: '🥇', powerLevel: '⭐⭐⭐⭐⭐', color: '#fef08a', badgeClass: 'border-yellow-300/70 text-yellow-200 bg-yellow-300/25 shadow-[0_0_15px_rgba(254,240,138,0.35)]', minRatingScore: 9000 },

  // 6. Platinum (Tier VI)
  { id: 16, material: 'Platinum', tierNumber: 'VI', subRank: 'III', fullName: 'Platinum III', icon: '💠', powerLevel: '⭐⭐⭐⭐⭐⭐', color: '#06b6d4', badgeClass: 'border-cyan-500/50 text-cyan-400 bg-cyan-500/15', minRatingScore: 11000 },
  { id: 17, material: 'Platinum', tierNumber: 'VI', subRank: 'II', fullName: 'Platinum II', icon: '💠', powerLevel: '⭐⭐⭐⭐⭐⭐', color: '#22d3ee', badgeClass: 'border-cyan-400/60 text-cyan-300 bg-cyan-400/20 shadow-[0_0_15px_rgba(34,211,238,0.3)]', minRatingScore: 13500 },
  { id: 18, material: 'Platinum', tierNumber: 'VI', subRank: 'I', fullName: 'Platinum I', icon: '💠', powerLevel: '⭐⭐⭐⭐⭐⭐', color: '#67e8f9', badgeClass: 'border-cyan-300/70 text-cyan-200 bg-cyan-300/25 shadow-[0_0_18px_rgba(103,232,249,0.4)]', minRatingScore: 16500 },

  // 7. Mithril (Tier VII)
  { id: 19, material: 'Mithril', tierNumber: 'VII', subRank: 'III', fullName: 'Mithril III', icon: '🔷', powerLevel: '⭐⭐⭐⭐⭐⭐⭐', color: '#3b82f6', badgeClass: 'border-blue-500/60 text-blue-400 bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.35)]', minRatingScore: 20000 },
  { id: 20, material: 'Mithril', tierNumber: 'VII', subRank: 'II', fullName: 'Mithril II', icon: '🔷', powerLevel: '⭐⭐⭐⭐⭐⭐⭐', color: '#60a5fa', badgeClass: 'border-blue-400/70 text-blue-300 bg-blue-400/25 shadow-[0_0_20px_rgba(96,165,250,0.45)]', minRatingScore: 24500 },
  { id: 21, material: 'Mithril', tierNumber: 'VII', subRank: 'I', fullName: 'Mithril I', icon: '🔷', powerLevel: '⭐⭐⭐⭐⭐⭐⭐', color: '#93c5fd', badgeClass: 'border-blue-300/80 text-blue-200 bg-blue-300/30 shadow-[0_0_25px_rgba(147,197,253,0.55)]', minRatingScore: 30000 },

  // 8. Orichalcum (Tier VIII)
  { id: 22, material: 'Orichalcum', tierNumber: 'VIII', subRank: 'III', fullName: 'Orichalcum III', icon: '🔮', powerLevel: '⭐⭐⭐⭐⭐⭐⭐⭐', color: '#a855f7', badgeClass: 'border-purple-500/70 text-purple-400 bg-purple-500/25 shadow-[0_0_20px_rgba(168,85,247,0.4)]', minRatingScore: 37000 },
  { id: 23, material: 'Orichalcum', tierNumber: 'VIII', subRank: 'II', fullName: 'Orichalcum II', icon: '🔮', powerLevel: '⭐⭐⭐⭐⭐⭐⭐⭐', color: '#c084fc', badgeClass: 'border-purple-400/80 text-purple-300 bg-purple-400/30 shadow-[0_0_25px_rgba(192,132,252,0.5)]', minRatingScore: 45000 },
  { id: 24, material: 'Orichalcum', tierNumber: 'VIII', subRank: 'I', fullName: 'Orichalcum I', icon: '🔮', powerLevel: '⭐⭐⭐⭐⭐⭐⭐⭐', color: '#e9d5ff', badgeClass: 'border-purple-300/90 text-purple-100 bg-purple-300/35 shadow-[0_0_30px_rgba(233,213,255,0.7)] animate-pulse', minRatingScore: 55000 }
];

/**
 * Calculates a player's composite Rating Power Score based on:
 * - Lifetime EXP (1 Score per EXP point)
 * - Current & Longest Streak (150 Rating Points per streak day)
 */
export function calculateRatingScore(totalXp: number = 0, currentStreak: number = 0, longestStreak: number = 0): number {
  const streakBonus = Math.max(currentStreak, longestStreak) * 150;
  return Math.max(0, totalXp + streakBonus);
}

/**
 * Computes the complete Rank info (Copper III to Orichalcum I) for a player.
 */
export function getRankInfo(totalXp: number = 0, currentStreak: number = 0, longestStreak: number = 0) {
  const ratingScore = calculateRatingScore(totalXp, currentStreak, longestStreak);
  
  let currentRank = RANK_TIERS[0];
  let nextRank: RankTier | null = RANK_TIERS[1];

  for (let i = 0; i < RANK_TIERS.length; i++) {
    if (ratingScore >= RANK_TIERS[i].minRatingScore) {
      currentRank = RANK_TIERS[i];
      nextRank = RANK_TIERS[i + 1] || null;
    } else {
      break;
    }
  }

  let progressPct = 100;
  let scoreToNext = 0;

  if (nextRank) {
    const range = nextRank.minRatingScore - currentRank.minRatingScore;
    const earned = ratingScore - currentRank.minRatingScore;
    progressPct = Math.min(100, Math.max(0, Math.round((earned / range) * 100)));
    scoreToNext = nextRank.minRatingScore - ratingScore;
  }

  return {
    ratingScore,
    currentRank,
    nextRank,
    progressPct,
    scoreToNext
  };
}
