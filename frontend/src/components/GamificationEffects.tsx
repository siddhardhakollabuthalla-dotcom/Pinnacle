import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Flame, Trophy, Sparkles, X } from 'lucide-react';
import { useUIStore } from '../store/useUIStore';

export const XPBar: React.FC<{ currentXp: number; nextLevelXp: number; level: number }> = ({
  currentXp,
  nextLevelXp,
  level,
}) => {
  const percentage = Math.min(100, Math.max(0, (currentXp / nextLevelXp) * 100));

  return (
    <div className="w-full bg-black/40 border border-white/10 rounded-xl p-3 backdrop-blur-md shadow-lg">
      <div className="flex justify-between items-center mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> LEVEL {level} ARCHETYPE
        </span>
        <span className="font-mono text-amber-300">
          {currentXp} / {nextLevelXp} XP ({Math.round(percentage)}%)
        </span>
      </div>
      <div className="w-full h-3.5 bg-gray-950 rounded-full overflow-hidden p-0.5 border border-white/5 relative">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 rounded-full shadow-[0_0_12px_rgba(251,191,36,0.6)]"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: 'spring', stiffness: 90, damping: 15 }}
        />
      </div>
    </div>
  );
};

export const FloatingXPList: React.FC = () => {
  const { floatingXpList, removeFloatingXp } = useUIStore();

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {floatingXpList.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: item.y, x: item.x, scale: 0.6 }}
            animate={{ opacity: 1, y: item.y - 70, scale: 1.2 }}
            exit={{ opacity: 0, y: item.y - 120 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            onAnimationComplete={() => removeFloatingXp(item.id)}
            className="absolute font-mono font-extrabold text-amber-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] text-xl pointer-events-none select-none flex items-center gap-1"
          >
            <Sparkles className="w-5 h-5 text-yellow-300 animate-spin" />
            {item.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export const LevelUpModal: React.FC = () => {
  const { levelUpModal, hideLevelUp } = useUIStore();

  useEffect(() => {
    if (levelUpModal?.show) {
      // Trigger canvas confetti celebration
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#00f0ff', '#ffd700', '#ff0055', '#00ff66'],
      });
    }
  }, [levelUpModal]);

  if (!levelUpModal?.show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.7, opacity: 0 }}
        className="relative w-full max-w-md bg-gradient-to-b from-gray-900 via-gray-950 to-black border-2 border-amber-500/50 rounded-2xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.3)] text-center text-white"
      >
        <button
          onClick={hideLevelUp}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <motion.div
          animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 2 }}
          className="inline-flex p-4 rounded-full bg-amber-500/20 text-amber-400 mb-4 border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.5)]"
        >
          <Trophy className="w-12 h-12" />
        </motion.div>

        <h2 className="text-3xl font-extrabold tracking-wider bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 bg-clip-text text-transparent mb-1">
          LEVEL UP!
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          You have achieved <span className="text-amber-400 font-bold">Level {levelUpModal.level}</span>! Gold bonus & stats updated.
        </p>

        <button
          onClick={hideLevelUp}
          className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black tracking-wide shadow-lg transition-transform active:scale-95"
        >
          CLAIM REWARDS
        </button>
      </motion.div>
    </div>
  );
};

export const StreakFlame: React.FC<{ streak: number }> = ({ streak }) => {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 font-mono text-xs font-bold shadow-[0_0_10px_rgba(249,115,22,0.2)]">
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
      </motion.div>
      <span>{streak} DAY STREAK</span>
    </div>
  );
};
