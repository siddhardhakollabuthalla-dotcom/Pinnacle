import React from 'react';
import { Gift, Lock, CheckCircle2, Sparkles } from 'lucide-react';
import type { Character } from '../../types';
import { soundEngine } from '../../utils/soundEngine';

interface Tier {
  level: number;
  freeReward: string;
  premiumReward: string;
  icon: string;
  isUnlocked: boolean;
}

export const BattlePass: React.FC<{ character: Character }> = ({ character }) => {
  const currentLevel = character.level;

  const tiers: Tier[] = [
    { level: 1, freeReward: '100 COINS', premiumReward: '5 GEMS', icon: '🪙', isUnlocked: currentLevel >= 1 },
    { level: 5, freeReward: '150 COINS', premiumReward: 'TITLE: "THE CONSISTENT"', icon: '👑', isUnlocked: currentLevel >= 5 },
    { level: 10, freeReward: '200 COINS', premiumReward: 'CYBERPUNK NEON THEME', icon: '🎨', isUnlocked: currentLevel >= 10 },
    { level: 15, freeReward: '300 COINS', premiumReward: 'FLAME MASTER BADGE', icon: '🔥', isUnlocked: currentLevel >= 15 },
    { level: 20, freeReward: '500 COINS', premiumReward: '25 GEMS', icon: '💎', isUnlocked: currentLevel >= 20 },
    { level: 25, freeReward: '750 COINS', premiumReward: 'LEGENDARY AVATAR FRAME', icon: '🏆', isUnlocked: currentLevel >= 25 },
    { level: 30, freeReward: '1000 COINS', premiumReward: 'CROWN OF THE GRIND', icon: '👑', isUnlocked: currentLevel >= 30 },
  ];

  return (
    <div className="space-y-6">
      {/* Battle Pass Season Header */}
      <div className="game-panel-purple rounded-3xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Gift className="w-6 h-6 text-purple-400" />
              <h3 className="text-2xl font-black font-game-title tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-400 to-amber-300">
                SEASON 01: "RISE OF THE GRIND"
              </h3>
            </div>
            <p className="text-xs font-mono text-zinc-400">Level up your avatar in real life to unlock exclusive rewards on the Battle Pass track!</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-purple-300 bg-purple-500/20 px-3 py-1.5 rounded-xl border border-purple-500/40">
              CURRENT TIER: LVL {currentLevel}
            </span>
          </div>
        </div>
      </div>

      {/* Battle Pass Horizontal Reward Progression Track */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400" /> HORIZONTAL BATTLE PASS PROGRESSION TRACK
        </h4>

        <div className="game-panel rounded-3xl p-6 border border-white/10 overflow-x-auto">
          <div className="flex items-center gap-6 min-w-[750px] pb-4">
            {tiers.map((tier, idx) => (
              <div key={tier.level} className="flex-1 flex flex-col items-center relative">
                {/* Level Tag Header */}
                <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full mb-3 border ${
                  tier.isUnlocked ? 'bg-amber-500 text-black border-black shadow-[0_0_12px_rgba(245,158,11,0.6)]' : 'bg-zinc-800 text-zinc-400 border-white/10'
                }`}>
                  LVL {tier.level}
                </span>

                {/* Reward Card */}
                <div className={`w-36 p-4 rounded-2xl border text-center space-y-2 transition-all ${
                  tier.isUnlocked
                    ? 'game-panel-gold border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                    : 'bg-black/40 border-white/10 opacity-70'
                }`}>
                  <div className="text-3xl my-1">{tier.icon}</div>
                  <div className="text-[10px] font-mono text-zinc-400 uppercase font-bold">FREE</div>
                  <div className="text-xs font-bold text-white line-clamp-1">{tier.freeReward}</div>
                  
                  <div className="pt-2 border-t border-white/10">
                    <div className="text-[10px] font-mono text-purple-400 uppercase font-bold">PREMIUM</div>
                    <div className="text-[11px] font-bold text-purple-300 line-clamp-1">{tier.premiumReward}</div>
                  </div>

                  {tier.isUnlocked ? (
                    <button
                      onClick={() => soundEngine.play('reward_claim')}
                      className="w-full py-1.5 rounded-lg bg-amber-500 text-black font-mono font-bold text-[10px] uppercase flex items-center justify-center gap-1 shadow"
                    >
                      <CheckCircle2 className="w-3 h-3" /> CLAIMED
                    </button>
                  ) : (
                    <div className="w-full py-1 rounded-lg bg-zinc-800 text-zinc-500 font-mono text-[10px] flex items-center justify-center gap-1">
                      <Lock className="w-3 h-3" /> LOCKED
                    </div>
                  )}
                </div>

                {/* Connecting Track Line */}
                {idx < tiers.length - 1 && (
                  <div className="absolute top-4 -right-3 w-6 h-0.5 bg-zinc-700 pointer-events-none" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
