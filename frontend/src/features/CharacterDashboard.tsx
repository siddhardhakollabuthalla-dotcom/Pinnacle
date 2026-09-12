import React from 'react';
import { Shield, Sparkles, Dumbbell, Brain, ShieldCheck, Palette, HeartPulse, Crown, Zap } from 'lucide-react';
import type { Character } from '../types';
import { XPBar, StreakFlame } from '../components/GamificationEffects';

const ATTRIBUTE_ICONS: Record<string, React.ReactNode> = {
  Dumbbell: <Dumbbell className="w-5 h-5 text-amber-400" />,
  Brain: <Brain className="w-5 h-5 text-cyan-400" />,
  ShieldCheck: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
  Palette: <Palette className="w-5 h-5 text-purple-400" />,
  HeartPulse: <HeartPulse className="w-5 h-5 text-rose-400" />,
  Zap: <Zap className="w-5 h-5 text-yellow-400" />,
  Crown: <Crown className="w-5 h-5 text-amber-300" />,
};

export const CharacterDashboard: React.FC<{ character: Character }> = ({ character }) => {
  return (
    <div className="space-y-8">
      {/* Hero Character Card - Epic Chronos RPG Profile Banner */}
      <div className="relative overflow-hidden glass-card rounded-3xl p-8 border border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.15)]">
        {/* Ambient Glowing Orbs */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-amber-500/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Avatar & Character Meta */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 p-1 shadow-[0_0_30px_rgba(245,158,11,0.4)]">
                <div className="w-full h-full bg-zinc-950 rounded-[22px] flex items-center justify-center text-amber-400 relative overflow-hidden">
                  <Shield className="w-12 h-12 text-amber-400 animate-pulse" />
                  <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none" />
                </div>
              </div>
              <span className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-950 font-black text-xs font-mono px-3 py-1 rounded-full border border-zinc-950 shadow-lg flex items-center gap-1">
                <Crown className="w-3 h-3 fill-zinc-950" /> LVL {character.level}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                  CHRONOS PALADIN
                </span>
                <StreakFlame streak={character.current_streak} />
              </div>
              <h2 className="text-3xl font-black font-cinzel text-white tracking-wide mt-1">
                CHRONOS GUARDIAN
              </h2>
              <p className="text-xs text-zinc-400 font-mono mt-1 flex items-center gap-2">
                <span>Longest Streak: <strong className="text-amber-400">{character.longest_streak} DAYS</strong></span>
                <span>•</span>
                <span>Gold Wallet: <strong className="text-amber-300 font-bold">{character.gold} 🪙</strong></span>
              </p>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="flex items-center gap-4 bg-zinc-950/60 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
            <div className="text-center px-4 border-r border-white/10">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">LEVEL</span>
              <span className="text-2xl font-black font-mono text-amber-400">{character.level}</span>
            </div>
            <div className="text-center px-4 border-r border-white/10">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">LIFETIME XP</span>
              <span className="text-2xl font-black font-mono text-white">{character.total_xp}</span>
            </div>
            <div className="text-center px-4">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">STREAK</span>
              <span className="text-2xl font-black font-mono text-orange-400 flex items-center justify-center gap-1">
                {character.current_streak}🔥
              </span>
            </div>
          </div>
        </div>

        {/* XP Bar */}
        <div className="mt-8">
          <XPBar
            currentXp={character.current_xp}
            nextLevelXp={character.next_level_xp}
            level={character.level}
          />
        </div>
      </div>

      {/* Core RPG Attributes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold font-cinzel tracking-widest text-amber-400 uppercase flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" /> STAT TREE & ATTRIBUTES
          </h3>
          <span className="text-xs font-mono text-zinc-500">{character.attributes.length} ACTIVE STATS</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {character.attributes.map((ca) => {
            const attrPct = Math.min(100, Math.round((ca.xp / ca.next_level_xp) * 100));
            return (
              <div
                key={ca.attribute.id}
                className="glass-card hover:border-amber-500/40 transition-all rounded-2xl p-5 group relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-amber-400 group-hover:border-amber-500/50 transition-colors">
                      {ATTRIBUTE_ICONS[ca.attribute.icon] || <Sparkles className="w-5 h-5 text-zinc-400" />}
                    </div>
                    <div>
                      <h4 className="text-base font-bold font-cinzel text-white group-hover:text-amber-300 transition-colors">
                        {ca.attribute.display_name}
                      </h4>
                      <span className="text-[10px] font-mono text-zinc-400">{ca.attribute.description}</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-black text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
                    LVL {ca.level}
                  </span>
                </div>

                <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-white/5 p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 rounded-full transition-all duration-500"
                    style={{ width: `${attrPct}%` }}
                  />
                </div>

                <div className="flex justify-between items-center mt-2 text-[11px] font-mono text-zinc-400">
                  <span className="text-zinc-500">PROGRESS</span>
                  <span className="text-amber-300 font-bold">{ca.xp} / {ca.next_level_xp} XP ({attrPct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
