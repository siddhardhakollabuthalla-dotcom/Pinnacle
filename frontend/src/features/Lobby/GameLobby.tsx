import React from 'react';
import { motion } from 'framer-motion';
import { Swords, Zap, Shield, Crown, Flame, Sparkles } from 'lucide-react';
import type { Character, User, Quest } from '../../types';
import { soundEngine } from '../../utils/soundEngine';

export const GameLobby: React.FC<{
  user: User;
  character: Character;
  activeQuests: Quest[];
  onStartQuest: () => void;
  onViewCharacter: () => void;
  onViewBattlePass: () => void;
}> = ({ user, character, activeQuests, onStartQuest, onViewCharacter, onViewBattlePass }) => {
  const currentXp = character.current_xp;
  const nextXp = character.next_level_xp;
  const xpPct = Math.min(100, Math.round((currentXp / nextXp) * 100));

  return (
    <div className="relative min-h-[calc(100vh-140px)] flex flex-col justify-between py-6">
      {/* Top Banner Tagline */}
      <div className="text-center space-y-1">
        <h2 className="text-4xl md:text-5xl font-black font-game-title tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 drop-shadow-[0_0_20px_rgba(245,158,11,0.4)]">
          LEVEL_up
        </h2>
        <p className="text-xs font-mono uppercase tracking-widest text-cyan-400">
          WELCOME HERO {user.username} • "Your Life. Your Character. Your Game."
        </p>
      </div>

      {/* Main Free-Fire Style Game Lobby Character Viewport */}
      <div className="my-8 flex flex-col items-center justify-center relative">
        {/* Background Radial Glow */}
        <div className="absolute w-96 h-96 bg-gradient-to-tr from-amber-500/20 via-cyan-500/10 to-transparent rounded-full blur-[120px] pointer-events-none" />

        {/* 3D-like Character Model Frame */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative group cursor-pointer"
          onClick={onViewCharacter}
        >
          {/* Level Header Badge */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black font-black font-game-title text-sm px-4 py-1 rounded-full border border-black shadow-[0_0_20px_rgba(245,158,11,0.6)] flex items-center gap-1.5 uppercase">
            <Crown className="w-4 h-4 fill-black" /> LEVEL {character.level}
          </div>

          {/* Hero Avatar Card */}
          <div className="w-64 h-80 md:w-72 md:h-96 game-panel rounded-3xl border-2 border-amber-500/50 p-6 flex flex-col items-center justify-between relative overflow-hidden group-hover:border-amber-400 transition-all shadow-[0_0_50px_rgba(245,158,11,0.2)]">
            {/* Holographic grid scanline */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(6,182,212,0.05)_50%,transparent_100%)] pointer-events-none animate-pulse" />

            <div className="w-full flex justify-between items-center z-10 text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-1"><Shield className="w-4 h-4 text-amber-400" /> CLASS: PALADIN</span>
              <span className="text-orange-400 font-bold flex items-center gap-0.5"><Flame className="w-3.5 h-3.5 fill-orange-500" /> {character.current_streak}d</span>
            </div>

            {/* Avatar Emblem Icon */}
            <div className="my-auto relative">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-tr from-amber-500/30 via-cyan-500/20 to-purple-500/30 p-1 shadow-[0_0_40px_rgba(245,158,11,0.3)] flex items-center justify-center"
              >
                <div className="w-full h-full rounded-full bg-[#080a12] flex items-center justify-center border border-white/10">
                  <Shield className="w-20 h-20 md:w-24 md:h-24 text-amber-400" />
                </div>
              </motion.div>
            </div>

            {/* Character XP Bar readout */}
            <div className="w-full space-y-1.5 z-10">
              <div className="flex justify-between text-[11px] font-mono font-bold text-zinc-300">
                <span className="text-amber-400">XP PROGRESS</span>
                <span>{currentXp} / {nextXp}</span>
              </div>
              <div className="w-full h-3 bg-black/80 rounded-full overflow-hidden border border-white/10 p-0.5">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.8)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPct}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Action Lobby Controls */}
      <div className="max-w-xl mx-auto w-full space-y-3 px-4">
        <button
          onClick={() => {
            soundEngine.play('quest_accept');
            onStartQuest();
          }}
          className="w-full py-4 rounded-2xl btn-game-primary text-base md:text-lg tracking-widest flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(245,158,11,0.4)]"
        >
          <Swords className="w-6 h-6" /> [ START DAILY QUEST ({activeQuests.length} ACTIVE) ]
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              soundEngine.play('click');
              onViewCharacter();
            }}
            className="py-3 px-4 rounded-xl game-panel hover:border-cyan-500/50 text-cyan-400 font-game-title font-bold text-xs tracking-wider flex items-center justify-center gap-2 transition-all"
          >
            <Zap className="w-4 h-4 text-cyan-400" /> [ CHARACTER TREE ]
          </button>
          <button
            onClick={() => {
              soundEngine.play('click');
              onViewBattlePass();
            }}
            className="py-3 px-4 rounded-xl game-panel hover:border-purple-500/50 text-purple-400 font-game-title font-bold text-xs tracking-wider flex items-center justify-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4 text-purple-400" /> [ BATTLE PASS ]
          </button>
        </div>
      </div>
    </div>
  );
};
