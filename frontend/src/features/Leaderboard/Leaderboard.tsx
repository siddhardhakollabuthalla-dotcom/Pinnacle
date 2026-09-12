import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Crown, Shield } from 'lucide-react';
import type { User, Character } from '../../types';
import { api } from '../../api/client';

export const Leaderboard: React.FC<{ currentCharacter?: Character; currentUser: User }> = ({ currentUser }) => {
  const { data: serverLeaderboard = [] } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: api.getLeaderboard,
  });

  const leaderboardUsers = serverLeaderboard.map((u, i) => ({
    ...u,
    rank: u.rank ?? i + 1,
    isCurrent: u.is_current ?? (u.name.toLowerCase() === currentUser.username.toLowerCase()),
  }));

  const player1 = leaderboardUsers[0];
  const player2 = leaderboardUsers[1];
  const player3 = leaderboardUsers[2];

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

      {/* Podium Top 3 (if players exist) */}
      {leaderboardUsers.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center my-4">
          {/* Rank 2 */}
          {player2 ? (
            <div className="game-panel rounded-2xl p-4 border border-white/10 flex flex-col items-center justify-end">
              <span className="text-2xl mb-1">🥈</span>
              <span className="font-game-title font-bold text-xs text-white truncate w-full">{player2.name}</span>
              <span className="text-[10px] font-mono text-amber-400 font-bold">LVL {player2.level}</span>
            </div>
          ) : (
            <div className="hidden sm:block" />
          )}

          {/* Rank 1 */}
          {player1 && (
            <div className="game-panel-gold rounded-2xl p-4 border-2 border-amber-500/60 flex flex-col items-center justify-end sm:scale-105 shadow-[0_0_25px_rgba(245,158,11,0.25)]">
              <Crown className="w-6 h-6 text-amber-400 fill-amber-400 mb-1" />
              <span className="font-game-title font-bold text-sm text-amber-300 truncate w-full">{player1.name}</span>
              <span className="text-xs font-mono text-amber-400 font-bold">LVL {player1.level}</span>
            </div>
          )}

          {/* Rank 3 */}
          {player3 ? (
            <div className="game-panel rounded-2xl p-4 border border-white/10 flex flex-col items-center justify-end">
              <span className="text-2xl mb-1">🥉</span>
              <span className="font-game-title font-bold text-xs text-white truncate w-full">{player3.name}</span>
              <span className="text-[10px] font-mono text-amber-400 font-bold">LVL {player3.level}</span>
            </div>
          ) : (
            <div className="hidden sm:block" />
          )}
        </div>
      )}

      {/* Full Leaderboard Table or Empty State */}
      {leaderboardUsers.length === 0 ? (
        <div className="game-panel rounded-3xl p-12 text-center border border-white/10 space-y-2">
          <Trophy className="w-12 h-12 text-zinc-600 mx-auto mb-2 opacity-60" />
          <h4 className="text-lg font-bold font-game-title text-zinc-300">NO LEADERBOARD PLAYERS YET</h4>
          <p className="text-xs font-mono text-zinc-500">
            Be the first hero to complete quests, level up, and conquer the global leaderboard!
          </p>
        </div>
      ) : (
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
      )}
    </div>
  );
};
