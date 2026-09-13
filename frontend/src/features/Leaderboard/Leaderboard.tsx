import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Crown, Shield, Award, Sparkles } from 'lucide-react';
import type { User, Character } from '../../types';
import { api } from '../../api/client';
import { getRankInfo, RANK_TIERS } from '../../utils/rankingSystem';

export const Leaderboard: React.FC<{ currentCharacter?: Character; currentUser: User }> = ({ currentCharacter, currentUser }) => {
  const [showTierGuide, setShowTierGuide] = useState(false);

  const { data: serverLeaderboard = [] } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: api.getLeaderboard,
  });

  const playerRankInfo = getRankInfo(
    currentCharacter?.total_xp || 0,
    currentCharacter?.current_streak || 0,
    currentCharacter?.longest_streak || 0
  );

  const leaderboardUsers = serverLeaderboard.map((u, i) => {
    const uRankInfo = getRankInfo(u.xp || 0, u.streak || 0, u.streak || 0);
    return {
      ...u,
      rank: u.rank ?? i + 1,
      rankInfo: uRankInfo,
      isCurrent: u.is_current ?? (u.name.toLowerCase() === currentUser.username.toLowerCase()),
    };
  });

  const player1 = leaderboardUsers[0];
  const player2 = leaderboardUsers[1];
  const player3 = leaderboardUsers[2];

  return (
    <div className="space-y-6">
      {/* Current Player Rank Banner */}
      <div className="game-panel-gold rounded-3xl p-6 relative overflow-hidden border-2 border-amber-500/60 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-black/60 border-2 border-amber-400 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              {playerRankInfo.currentRank.icon}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">CURRENT RANK TIER:</span>
                <span className={`text-xs font-mono font-black uppercase px-2.5 py-0.5 rounded border ${playerRankInfo.currentRank.badgeClass}`}>
                  {playerRankInfo.currentRank.powerLevel} {playerRankInfo.currentRank.fullName}
                </span>
              </div>
              <h3 className="text-xl font-black font-game-title tracking-wider text-white mt-0.5">
                TIER {playerRankInfo.currentRank.tierNumber}: {playerRankInfo.currentRank.material.toUpperCase()}
              </h3>
              <p className="text-xs font-mono text-zinc-300">
                Power Rating Score: <strong className="text-amber-400">{playerRankInfo.ratingScore} PTS</strong> (XP + Streak Bonus)
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowTierGuide(!showTierGuide)}
            className="btn-game-primary py-2.5 px-4 text-xs font-bold tracking-wider rounded-xl shadow flex items-center justify-center gap-1.5"
          >
            <Award className="w-4 h-4" /> [ 🏆 VIEW 24-TIER RANK SYSTEM ]
          </button>
        </div>

        {/* Rank Progression Bar */}
        <div className="mt-5 space-y-1.5 pt-4 border-t border-white/10">
          <div className="flex justify-between text-xs font-mono font-bold">
            <span className="text-amber-300 flex items-center gap-1">
              <span>PROGRESS TO NEXT SUB-RANK</span>
              {playerRankInfo.nextRank && <span className="text-zinc-400">({playerRankInfo.nextRank.fullName})</span>}
            </span>
            <span className="text-white">
              {playerRankInfo.nextRank ? `${playerRankInfo.scoreToNext} PTS NEEDED (${playerRankInfo.progressPct}%)` : 'MAX RANK ACHIEVED!'}
            </span>
          </div>
          <div className="w-full h-3 bg-black/80 rounded-full overflow-hidden border border-white/10 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-cyan-400 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]"
              style={{ width: `${playerRankInfo.progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* 24-Tier Rank System Progression Guide Modal / Drawer */}
      {showTierGuide && (
        <div className="game-panel rounded-3xl p-6 border border-amber-500/40 space-y-4 bg-black/90">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h4 className="text-base font-bold font-game-title text-amber-300">24-TIER COMPETITIVE RANKING SYSTEM</h4>
            </div>
            <button onClick={() => setShowTierGuide(false)} className="text-zinc-400 hover:text-white font-mono text-sm">✕</button>
          </div>

          <p className="text-xs font-mono text-zinc-400">
            Ranks are calculated dynamically using your total lifetime XP plus your active habit streak bonus (<strong>+150 Rating Points per streak day</strong>).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {RANK_TIERS.map((tier) => {
              const isCurrent = playerRankInfo.currentRank.id === tier.id;
              return (
                <div
                  key={tier.id}
                  className={`p-3 rounded-2xl border transition-all text-xs font-mono ${
                    isCurrent
                      ? 'border-amber-400 bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.3)] scale-[1.02]'
                      : 'border-white/10 bg-black/50 text-zinc-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-lg">{tier.icon}</span>
                    <span className="text-[10px] text-amber-400 font-bold">{tier.powerLevel}</span>
                  </div>
                  <div className="font-bold text-white font-game-title text-sm">{tier.fullName}</div>
                  <div className="text-[10px] text-zinc-400 mt-1">Tier {tier.tierNumber} • {tier.material}</div>
                  <div className="text-[10px] text-amber-300 font-bold mt-1">REQ: {tier.minRatingScore} PTS</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Podium Top 3 */}
      {leaderboardUsers.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center my-4">
          {/* Rank 2 */}
          {player2 ? (
            <div className="game-panel rounded-2xl p-4 border border-white/10 flex flex-col items-center justify-end">
              <span className="text-2xl mb-1">🥈</span>
              <span className="font-game-title font-bold text-xs text-white truncate w-full">{player2.name}</span>
              <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 mt-1 rounded border ${player2.rankInfo.currentRank.badgeClass}`}>
                {player2.rankInfo.currentRank.icon} {player2.rankInfo.currentRank.fullName}
              </span>
            </div>
          ) : (
            <div className="hidden sm:block" />
          )}

          {/* Rank 1 */}
          {player1 && (
            <div className="game-panel-gold rounded-2xl p-4 border-2 border-amber-500/60 flex flex-col items-center justify-end sm:scale-105 shadow-[0_0_25px_rgba(245,158,11,0.25)]">
              <Crown className="w-6 h-6 text-amber-400 fill-amber-400 mb-1" />
              <span className="font-game-title font-bold text-sm text-amber-300 truncate w-full">{player1.name}</span>
              <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 mt-1 rounded border ${player1.rankInfo.currentRank.badgeClass}`}>
                {player1.rankInfo.currentRank.icon} {player1.rankInfo.currentRank.fullName}
              </span>
            </div>
          )}

          {/* Rank 3 */}
          {player3 ? (
            <div className="game-panel rounded-2xl p-4 border border-white/10 flex flex-col items-center justify-end">
              <span className="text-2xl mb-1">🥉</span>
              <span className="font-game-title font-bold text-xs text-white truncate w-full">{player3.name}</span>
              <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 mt-1 rounded border ${player3.rankInfo.currentRank.badgeClass}`}>
                {player3.rankInfo.currentRank.icon} {player3.rankInfo.currentRank.fullName}
              </span>
            </div>
          ) : (
            <div className="hidden sm:block" />
          )}
        </div>
      )}

      {/* Full Leaderboard Table */}
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
                <th className="pb-3">RANK TIER</th>
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
                  <td className="py-3.5">
                    <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${u.rankInfo.currentRank.badgeClass}`}>
                      {u.rankInfo.currentRank.icon} {u.rankInfo.currentRank.fullName}
                    </span>
                  </td>
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
