import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Crown, Shield } from 'lucide-react';
import type { User, Character } from '../../types';
import { api } from '../../api/client';

export const Leaderboard: React.FC<{ currentCharacter?: Character; currentUser: User }> = ({ currentCharacter, currentUser }) => {
  const { data: serverLeaderboard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: api.getLeaderboard,
  });

  const benchmarkUsers = [
    { rank: 1, name: 'VORTEX_SHADOW', level: 42, xp: 14250, streak: 28, isCurrent: false },
    { rank: 2, name: 'CYBER_HERO', level: 38, xp: 11820, streak: 19, isCurrent: false },
    { rank: 3, name: currentUser.username, level: currentCharacter?.level || 1, xp: currentCharacter?.total_xp || 0, streak: currentCharacter?.current_streak || 0, isCurrent: true },
    { rank: 4, name: 'NEON_KNIGHT', level: 22, xp: 6450, streak: 12, isCurrent: false },
    { rank: 5, name: 'TITAN_GRIND', level: 19, xp: 5120, streak: 8, isCurrent: false },
  ];

  // If server leaderboard is available, use it; otherwise compute dynamic XP sorted ranking
  const rawList = serverLeaderboard && serverLeaderboard.length >= 3
    ? serverLeaderboard.map((u) => ({
        ...u,
        isCurrent: u.is_current ?? (u.name.toLowerCase() === currentUser.username.toLowerCase()),
      }))
    : benchmarkUsers;

  const sortedList = [...rawList].sort((a, b) => b.xp - a.xp);
  const leaderboardUsers = sortedList.map((u, i) => ({
    ...u,
    rank: i + 1,
  }));

  return (
    <div className="space-y-6">
      <div className="game-panel-cyan rounded-3xl p-6 relative overflow-hidden">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-cyan-400" />
          <div>
            <h3 className="text-2xl font-black font-game-title tracking-wider text-white">GLOBAL COMPETITIVE LEADERBOARD</h3>
            <p className="text-xs font-mono text-zinc-400">Compete with global players on lifetime XP, levels, and streak consistency.</p>
          </div>
        </div>
      </div>

      {/* Podium Top 3 */}
      <div className="grid grid-cols-3 gap-3 text-center my-4">
        {/* Rank 2 */}
        <div className="game-panel rounded-2xl p-4 border border-white/10 flex flex-col items-center justify-end">
          <span className="text-2xl mb-1">🥈</span>
          <span className="font-game-title font-bold text-xs text-white truncate w-full">{leaderboardUsers[1].name}</span>
          <span className="text-[10px] font-mono text-amber-400 font-bold">LVL {leaderboardUsers[1].level}</span>
        </div>
        {/* Rank 1 */}
        <div className="game-panel-gold rounded-2xl p-4 border-2 border-amber-500/60 flex flex-col items-center justify-end scale-105 shadow-[0_0_25px_rgba(245,158,11,0.25)]">
          <Crown className="w-6 h-6 text-amber-400 fill-amber-400 mb-1" />
          <span className="font-game-title font-bold text-sm text-amber-300 truncate w-full">{leaderboardUsers[0].name}</span>
          <span className="text-xs font-mono text-amber-400 font-bold">LVL {leaderboardUsers[0].level}</span>
        </div>
        {/* Rank 3 */}
        <div className="game-panel rounded-2xl p-4 border border-white/10 flex flex-col items-center justify-end">
          <span className="text-2xl mb-1">🥉</span>
          <span className="font-game-title font-bold text-xs text-white truncate w-full">{leaderboardUsers[2].name}</span>
          <span className="text-[10px] font-mono text-amber-400 font-bold">LVL {leaderboardUsers[2].level}</span>
        </div>
      </div>

      {/* Full Leaderboard Table */}
      <div className="game-panel rounded-3xl p-4 border border-white/10 overflow-hidden">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="text-zinc-400 border-b border-white/10 pb-3">
              <th className="pb-3 pl-2">RANK</th>
              <th className="pb-3">PLAYER HERO</th>
              <th className="pb-3">LEVEL</th>
              <th className="pb-3">LIFETIME XP</th>
              <th className="pb-3 pr-2">STREAK</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {leaderboardUsers.map((u) => (
              <tr
                key={u.name}
                className={`transition-colors ${
                  u.isCurrent ? 'bg-amber-500/20 text-amber-300 font-bold border-l-4 border-l-amber-500' : 'hover:bg-white/5 text-zinc-300'
                }`}
              >
                <td className="py-3.5 pl-3 font-bold font-game-title">
                  {u.rank === 1 ? '🥇 #1' : u.rank === 2 ? '🥈 #2' : u.rank === 3 ? '🥉 #3' : `#${u.rank}`}
                </td>
                <td className="py-3.5 font-sans font-bold flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyan-400" /> {u.name} {u.isCurrent && '(YOU)'}
                </td>
                <td className="py-3.5 text-amber-400 font-bold">LVL {u.level}</td>
                <td className="py-3.5 text-white">{u.xp} XP</td>
                <td className="py-3.5 text-orange-400 font-bold pr-2">{u.streak}d 🔥</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
