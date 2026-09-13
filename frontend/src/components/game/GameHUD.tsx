import React, { useState } from 'react';
import { Coins, Gem, Flame, Trophy, Bell, Volume2, VolumeX } from 'lucide-react';
import type { User, Character } from '../../types';
import { soundEngine } from '../../utils/soundEngine';
import { getRankInfo } from '../../utils/rankingSystem';
import { RankBadgeIcon } from './RankBadgeIcon';

export const GameHUD: React.FC<{ user: User; character?: Character }> = ({ user, character }) => {
  const [soundOn, setSoundOn] = useState(soundEngine.isEnabled());

  const handleToggleSound = () => {
    const newState = soundEngine.toggleSound();
    setSoundOn(newState);
    if (newState) soundEngine.play('click');
  };

  const level = character?.level || 1;
  const currentXp = character?.current_xp || 0;
  const nextXp = character?.next_level_xp || 50;
  const xpPct = Math.min(100, Math.round((currentXp / nextXp) * 100));

  const rankInfo = getRankInfo(character?.total_xp || 0, character?.current_streak || 0, character?.longest_streak || 0);

  return (
    <header className="sticky top-0 z-40 bg-[#07080d]/90 border-b border-cyan-500/20 backdrop-blur-2xl px-4 py-2.5 shadow-[0_4px_25px_rgba(0,0,0,0.8)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Top-Left: PLAYER AVATAR & LEVEL HUD */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-yellow-700 p-0.5 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              <div className="w-full h-full bg-[#090b14] rounded-[10px] flex items-center justify-center text-amber-400 font-bold">
                <RankBadgeIcon material={rankInfo.currentRank.material} subRank={rankInfo.currentRank.subRank} size="sm" />
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 bg-amber-500 text-black font-black font-mono text-[10px] px-1.5 py-0.2 rounded border border-black shadow">
              {level}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-game-title font-bold text-sm tracking-wider text-white uppercase">{user.username}</span>
              <span
                className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border flex items-center gap-1.5 ${rankInfo.currentRank.badgeClass}`}
                title={`Power Rating Score: ${rankInfo.ratingScore} (${rankInfo.currentRank.powerLevel})`}
              >
                <RankBadgeIcon material={rankInfo.currentRank.material} subRank={rankInfo.currentRank.subRank} size="xs" showGlow={false} />
                <span>{rankInfo.currentRank.fullName}</span>
              </span>
            </div>

            {/* XP Mini Bar */}
            <div className="flex items-center gap-2 mt-1 w-44">
              <div className="flex-1 h-2 bg-black/60 rounded-full overflow-hidden border border-white/10 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-amber-400 rounded-full transition-all duration-300"
                  style={{ width: `${xpPct}%` }}
                />
              </div>
              <span className="text-[9px] font-mono text-amber-300 font-bold">{xpPct}%</span>
            </div>
          </div>
        </div>

        {/* Top-Right: TROPHIES 🏆, COINS 🪙, GEMS 💎, STREAK 🔥 HUD */}
        <div className="flex items-center gap-3">
          {/* Trophies */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/40 text-yellow-300 font-mono text-xs font-bold shadow-[0_0_12px_rgba(234,179,8,0.2)]">
            <Trophy className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-pulse" />
            <span>{character?.trophies || 0}</span>
          </div>

          {/* Coins */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold shadow-[0_0_12px_rgba(245,158,11,0.15)]">
            <Coins className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>{character?.gold || 0}</span>
          </div>

          {/* Gems */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-bold shadow-[0_0_12px_rgba(6,182,212,0.15)]">
            <Gem className="w-4 h-4 text-cyan-400" />
            <span>{character?.gems || 10}</span>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 font-mono text-xs font-bold shadow-[0_0_12px_rgba(249,115,22,0.15)]">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-bounce" />
            <span>{character?.current_streak || 0}d</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-colors"
            title={soundOn ? 'Sound FX On' : 'Sound FX Muted'}
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
          </button>

          {/* Notifications */}
          <button className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-amber-400 transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
          </button>
        </div>
      </div>
    </header>
  );
};
