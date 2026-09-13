import React, { useState } from 'react';
import { Sparkles, Dumbbell, Brain, ShieldCheck, Palette, HeartPulse, Crown, Zap, ChevronRight, Swords, X, LogOut } from 'lucide-react';
import type { Character, Quest, User } from '../types';
import { XPBar, StreakFlame } from '../components/GamificationEffects';
import { getRankInfo } from '../utils/rankingSystem';
import { RankBadgeIcon } from '../components/game/RankBadgeIcon';
import { soundEngine } from '../utils/soundEngine';

const ATTRIBUTE_ICONS: Record<string, React.ReactNode> = {
  Dumbbell: <Dumbbell className="w-5 h-5 text-amber-400" />,
  Brain: <Brain className="w-5 h-5 text-cyan-400" />,
  ShieldCheck: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
  Palette: <Palette className="w-5 h-5 text-purple-400" />,
  HeartPulse: <HeartPulse className="w-5 h-5 text-rose-400" />,
  Zap: <Zap className="w-5 h-5 text-yellow-400" />,
  Crown: <Crown className="w-5 h-5 text-amber-300" />,
};

export const CharacterDashboard: React.FC<{
  character: Character;
  user?: User;
  quests?: Quest[];
  onLogout?: () => void;
}> = ({ character, user, quests = [], onLogout }) => {
  const rankInfo = getRankInfo(character?.total_xp || 0, character?.current_streak || 0, character?.longest_streak || 0);
  const [selectedAttributeId, setSelectedAttributeId] = useState<string | null>(null);

  const selectedCharAttr = character.attributes.find((ca) => ca.attribute.id === selectedAttributeId);
  
  // Filter quests associated with selected attribute
  const selectedQuests = selectedAttributeId
    ? quests.filter((q) => q.attribute_id === selectedAttributeId || q.attribute?.id === selectedAttributeId)
    : [];

  const handleOpenAttributeModal = (attrId: string) => {
    soundEngine.play('click');
    setSelectedAttributeId(attrId);
  };

  return (
    <div className="space-y-8">
      {/* Profile Character Card - Epic Chronos RPG Profile Banner */}
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
                  <RankBadgeIcon material={rankInfo.currentRank.material} subRank={rankInfo.currentRank.subRank} size="xl" />
                  <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none" />
                </div>
              </div>
              <span className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-950 font-black text-xs font-mono px-3 py-1 rounded-full border border-zinc-950 shadow-lg flex items-center gap-1">
                <Crown className="w-3 h-3 fill-zinc-950" /> LVL {character.level}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono font-bold uppercase px-3 py-1 rounded-full border flex items-center gap-1.5 ${rankInfo.currentRank.badgeClass}`}>
                  <RankBadgeIcon material={rankInfo.currentRank.material} subRank={rankInfo.currentRank.subRank} size="xs" showGlow={false} />
                  <span>{rankInfo.currentRank.fullName}</span>
                </span>
                <StreakFlame streak={character.current_streak} />
              </div>
              <h2 className="text-3xl font-black font-cinzel text-white tracking-wide mt-1">
                PLAYER PROFILE
              </h2>
              <p className="text-xs text-zinc-400 font-mono mt-1 flex flex-wrap items-center gap-2">
                {user && <span className="text-amber-400 font-bold font-mono">@{user.username} ({user.email})</span>}
                {user && <span>•</span>}
                <span>Longest Streak: <strong className="text-amber-400">{character.longest_streak} DAYS</strong></span>
                <span>•</span>
                <span>Gold Wallet: <strong className="text-amber-300 font-bold">{character.gold} 🪙</strong></span>
              </p>
            </div>
          </div>

          {/* Quick Stats Grid & Account Action */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
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

            {/* Logout Button */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/60 text-rose-400 font-mono text-xs font-bold transition-all shadow-lg hover:shadow-rose-500/20 group w-full sm:w-auto"
                title="Log Out of Account"
              >
                <LogOut className="w-4 h-4 text-rose-400 group-hover:-translate-x-0.5 transition-transform" />
                <span>LOG OUT</span>
              </button>
            )}
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
            <Sparkles className="w-4 h-4 text-amber-400" /> STAT TREE & ATTRIBUTES (CLICK CARD TO VIEW QUESTS)
          </h3>
          <span className="text-xs font-mono text-zinc-500">{character.attributes.length} ACTIVE STATS</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {character.attributes.map((ca) => {
            const attrPct = Math.min(100, Math.round((ca.xp / ca.next_level_xp) * 100));
            return (
              <div
                key={ca.attribute.id}
                onClick={() => handleOpenAttributeModal(ca.attribute.id)}
                className="glass-card hover:border-amber-500/60 hover:scale-[1.02] cursor-pointer transition-all rounded-2xl p-5 group relative overflow-hidden shadow-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-amber-400 group-hover:border-amber-500/50 transition-colors">
                      {ATTRIBUTE_ICONS[ca.attribute.icon] || <Sparkles className="w-5 h-5 text-zinc-400" />}
                    </div>
                    <div>
                      <h4 className="text-base font-bold font-cinzel text-white group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                        <span>{ca.attribute.display_name}</span>
                        <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
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
                  <span className="text-zinc-500">CLICK TO VIEW QUESTS</span>
                  <span className="text-amber-300 font-bold">{ca.xp} / {ca.next_level_xp} XP ({attrPct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Attribute Quests Modal */}
      {selectedCharAttr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-2xl game-panel-gold rounded-3xl p-6 border-2 border-amber-500/60 shadow-[0_0_50px_rgba(245,158,11,0.3)] text-white space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-zinc-900 border border-amber-500/40 text-amber-400">
                  {ATTRIBUTE_ICONS[selectedCharAttr.attribute.icon] || <Sparkles className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold font-game-title text-amber-300 flex items-center gap-2">
                    <span>{selectedCharAttr.attribute.display_name.toUpperCase()} QUEST LOG</span>
                    <span className="text-xs font-mono font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                      LVL {selectedCharAttr.level}
                    </span>
                  </h3>
                  <p className="text-xs font-mono text-zinc-400">{selectedCharAttr.attribute.description}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAttributeId(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg border border-white/10 hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quests List */}
            <div className="overflow-y-auto space-y-3 pr-1 flex-1">
              {selectedQuests.length === 0 ? (
                <div className="text-center py-10 game-panel rounded-2xl p-6 border border-white/10 space-y-2">
                  <Swords className="w-10 h-10 text-zinc-600 mx-auto opacity-50" />
                  <h4 className="text-sm font-bold font-game-title text-zinc-400">NO QUESTS BOUND TO THIS STAT YET</h4>
                  <p className="text-xs font-mono text-zinc-500">
                    Accept or create quests with target stat "{selectedCharAttr.attribute.display_name}" to train this attribute.
                  </p>
                </div>
              ) : (
                selectedQuests.map((q) => {
                  const isDone = q.status === 'completed';
                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                        isDone
                          ? 'bg-emerald-950/20 border-emerald-500/30'
                          : 'bg-black/50 border-white/10'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                            isDone
                              ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                              : 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                          }`}>
                            {isDone ? '✓ COMPLETED' : '⚔ ACTIVE'}
                          </span>
                          <h4 className={`text-sm font-bold font-game-title ${isDone ? 'line-through text-zinc-400' : 'text-white'}`}>
                            {q.title}
                          </h4>
                        </div>
                        {q.description && (
                          <p className="text-xs text-zinc-400 font-sans">{q.description}</p>
                        )}
                        {q.recurring_days && q.recurring_days.length > 0 && (
                          <div className="text-[10px] font-mono text-cyan-400">
                            🔁 Repeats on: {q.recurring_days.join(', ')}
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono text-amber-400 font-bold block">
                          +{q.difficulty === 'easy' ? 15 : q.difficulty === 'medium' ? 30 : q.difficulty === 'hard' ? 60 : 120} XP
                        </span>
                        <span className="text-[10px] font-mono text-cyan-300 font-bold uppercase">
                          +{selectedCharAttr.attribute.display_name}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setSelectedAttributeId(null)}
                className="btn-game-primary py-2 px-5 text-xs tracking-wider rounded-xl shadow"
              >
                [ CLOSE STAT LOG ]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
