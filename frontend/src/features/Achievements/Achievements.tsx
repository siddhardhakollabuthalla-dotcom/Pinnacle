import React from 'react';
import { Award, Lock, Trophy, Flame, Zap, Crown } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  reward: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress: string;
}

export const Achievements: React.FC = () => {
  const achievementsList: Achievement[] = [
    { id: '1', title: 'FIRST QUEST', description: 'Complete your first real-world RPG quest.', reward: '+100 XP, +50 Coins', icon: <Trophy className="w-6 h-6 text-amber-400" />, unlocked: true, progress: '1/1' },
    { id: '2', title: '7 DAY WARRIOR', description: 'Maintain a 7-day habit streak without breaking.', reward: '+300 XP, +100 Coins, Title: "Warrior"', icon: <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />, unlocked: false, progress: '1/7' },
    { id: '3', title: 'CODE WARRIOR', description: 'Complete 50 coding and technical mastery quests.', reward: '+500 XP, +15 Gems', icon: <Zap className="w-6 h-6 text-cyan-400" />, unlocked: false, progress: '3/50' },
    { id: '4', title: 'KNOWLEDGE SEEKER', description: 'Study or read for 100 total logged hours.', reward: '+600 XP, Scholar Crown Badge', icon: <Crown className="w-6 h-6 text-yellow-300" />, unlocked: false, progress: '12/100' },
    { id: '5', title: 'SPEEDRUNNER', description: 'Complete 10 quests in a single calendar day.', reward: '+1000 XP, Speedrunner Title', icon: <Award className="w-6 h-6 text-purple-400" />, unlocked: false, progress: '1/10' },
  ];

  return (
    <div className="space-y-6">
      <div className="game-panel-gold rounded-3xl p-6 relative overflow-hidden">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-amber-400" />
          <div>
            <h3 className="text-2xl font-black font-game-title tracking-wider text-white">HALL OF ACHIEVEMENTS</h3>
            <p className="text-xs font-mono text-zinc-400">Unlock trophies by completing real-world milestones and consistency challenges.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievementsList.map((ach) => (
          <div
            key={ach.id}
            className={`game-panel rounded-2xl p-5 border transition-all flex items-start gap-4 ${
              ach.unlocked
                ? 'border-amber-500/50 game-panel-gold shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                : 'border-white/10 opacity-75'
            }`}
          >
            <div className={`p-3 rounded-2xl border ${ach.unlocked ? 'bg-amber-500/20 border-amber-500/40' : 'bg-zinc-900 border-white/10 text-zinc-600'}`}>
              {ach.unlocked ? ach.icon : <Lock className="w-6 h-6 text-zinc-600" />}
            </div>

            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-game-title font-bold text-base text-white">{ach.title}</h4>
                <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  {ach.progress}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-sans">{ach.description}</p>
              <div className="text-[11px] font-mono text-cyan-400 pt-1">REWARD: {ach.reward}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
