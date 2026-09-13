import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Crown, Shield, Award, Sparkles } from 'lucide-react';
import type { User, Character } from '../../types';
import { api } from '../../api/client';
import { getRankInfo, RANK_TIERS } from '../../utils/rankingSystem';
import { RankBadgeIcon } from '../../components/game/RankBadgeIcon';

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Current Rank Details */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-black/80 border-2 border-amber-400 flex items-center justify-center p-1.5 shadow-[0_0_25px_rgba(245,158,11,0.35)] relative group">
              <RankBadgeIcon material={playerRankInfo.currentRank.material} subRank={playerRankInfo.currentRank.subRank} size="xl" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  CURRENT RANK
                </span>
                <span className={`text-xs font-mono font-black uppercase px-2.5 py-0.5 rounded border flex items-center gap-1.5 ${playerRankInfo.currentRank.badgeClass}`}>
                  <RankBadgeIcon material={playerRankInfo.currentRank.material} subRank={playerRankInfo.currentRank.subRank} size="xs" showGlow={false} />
                  <span>{playerRankInfo.currentRank.fullName}</span>
                </span>
              </div>
              <h3 className="text-2xl font-black font-game-title tracking-wider text-white mt-1">
                TIER {playerRankInfo.currentRank.tierNumber}: {playerRankInfo.currentRank.material.toUpperCase()}
              </h3>
              <p className="text-xs font-mono text-zinc-300 mt-0.5">
                Current Rating Score: <strong className="text-amber-400 font-bold text-sm">{playerRankInfo.ratingScore} PTS</strong> (Lifetime XP + Streak Bonus)
              </p>
            </div>
          </div>

          {/* Next Rank Ascension Target Card */}
          {playerRankInfo.nextRank ? (
            <div className="bg-black/60 border border-amber-500/30 rounded-2xl p-4 flex items-center gap-3.5 shadow-inner">
              <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-amber-400/50 flex items-center justify-center p-1">
                <RankBadgeIcon material={playerRankInfo.nextRank.material} subRank={playerRankInfo.nextRank.subRank} size="md" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider block">NEXT ASCENSION TARGET</span>
                <div className="text-sm font-black font-game-title text-white">{playerRankInfo.nextRank.fullName}</div>
                <div className="text-xs font-mono text-cyan-300 font-bold mt-0.5">
                  Need <span className="text-amber-400 font-black">{playerRankInfo.scoreToNext} PTS</span> to Ascend
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-500/20 border border-amber-400/40 rounded-2xl p-4 text-center">
              <Sparkles className="w-6 h-6 text-amber-300 mx-auto mb-1 animate-spin" />
              <span className="text-xs font-black font-game-title text-amber-300">MAX RANK ACHIEVED!</span>
              <p className="text-[10px] font-mono text-zinc-300">You are at the pinnacle of Orichalcum I</p>
            </div>
          )}
        </div>

        {/* Ascension Progress Bar & Detailed Breakdown */}
        <div className="mt-6 space-y-2 pt-4 border-t border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono font-bold gap-1">
            <span className="text-amber-300 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>ASCENSION PROGRESS</span>
              {playerRankInfo.nextRank && <span className="text-zinc-400">({playerRankInfo.currentRank.fullName} ➔ {playerRankInfo.nextRank.fullName})</span>}
            </span>
            <span className="text-white">
              {playerRankInfo.nextRank ? (
                <>
                  <span className="text-amber-400 font-bold">{playerRankInfo.ratingScore}</span> / {playerRankInfo.nextRank.minRatingScore} PTS ({playerRankInfo.progressPct}%)
                </>
              ) : (
                'MAX RANK ACHIEVED!'
              )}
            </span>
          </div>

          <div className="w-full h-4 bg-black/80 rounded-full overflow-hidden border border-white/10 p-0.5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-cyan-400 rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(245,158,11,0.7)]"
              style={{ width: `${playerRankInfo.progressPct}%` }}
            />
          </div>

          {playerRankInfo.nextRank && (
            <p className="text-[11px] font-mono text-zinc-400 text-right">
              Complete quests or build your daily habit streak to gain <strong className="text-amber-300">{playerRankInfo.scoreToNext} more PTS</strong> and ascend to <strong>{playerRankInfo.nextRank.fullName}</strong>!
            </p>
          )}
        </div>
      </div>

      {/* 24-Tier Competitive Ranking System Drawer */}
      <div className="game-panel rounded-3xl p-6 border border-amber-500/40 space-y-4 bg-black/90">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h4 className="text-base font-bold font-game-title text-amber-300">24-TIER COMPETITIVE RANK LADDER</h4>
          </div>
          <button
            onClick={() => setShowTierGuide(!showTierGuide)}
            className="text-xs font-mono font-bold text-amber-400 hover:text-amber-300 border border-amber-400/30 px-3 py-1 rounded-lg bg-amber-400/10"
          >
            {showTierGuide ? '[ HIDE LADDER ]' : '[ SHOW ALL 24 RANKS ]'}
          </button>
        </div>

        <p className="text-xs font-mono text-zinc-400">
          Rank Rating Score = <strong>Lifetime XP</strong> + (<strong>Streak Days × 150 PTS</strong>). Your current rank is <strong className="text-amber-400">{playerRankInfo.currentRank.fullName}</strong>.
        </p>

        {showTierGuide && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {RANK_TIERS.map((tier) => {
              const isCurrent = playerRankInfo.currentRank.id === tier.id;
              const isUnlocked = playerRankInfo.ratingScore >= tier.minRatingScore;
              const ptsNeeded = tier.minRatingScore - playerRankInfo.ratingScore;

              return (
                <div
                  key={tier.id}
                  className={`p-3.5 rounded-2xl border transition-all text-xs font-mono flex flex-col items-center text-center relative ${
                    isCurrent
                      ? 'border-amber-400 bg-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.4)] scale-[1.03] z-10'
                      : isUnlocked
                      ? 'border-emerald-500/40 bg-emerald-950/20 text-zinc-200'
                      : 'border-white/10 bg-black/60 text-zinc-500 opacity-85'
                  }`}
                >
                  {/* Status Badge */}
                  <div className="mb-1">
                    {isCurrent ? (
                      <span className="bg-amber-400 text-black font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                        👑 CURRENT RANK
                      </span>
                    ) : isUnlocked ? (
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-[9px] px-2 py-0.5 rounded-full uppercase">
                        ✓ UNLOCKED
                      </span>
                    ) : (
                      <span className="bg-zinc-800 text-zinc-400 border border-zinc-700 font-bold text-[9px] px-2 py-0.5 rounded-full uppercase">
                        🔒 LOCKED
                      </span>
                    )}
                  </div>

                  <div className="my-1.5">
                    <RankBadgeIcon material={tier.material} subRank={tier.subRank} size="md" />
                  </div>

                  <div className="font-bold text-white font-game-title text-sm">{tier.fullName}</div>
                  <div className="text-[10px] text-amber-400 font-bold mt-0.5">{tier.powerLevel}</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">Tier {tier.tierNumber} • {tier.material}</div>
                  
                  <div className="mt-2 w-full pt-1.5 border-t border-white/10 text-[10px]">
                    <div className="text-zinc-300 font-mono">REQ: <strong className="text-amber-300">{tier.minRatingScore} PTS</strong></div>
                    {!isUnlocked && (
                      <div className="text-cyan-400 font-bold text-[9.5px] mt-0.5">
                        +{ptsNeeded} PTS needed
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Podium Top 3 */}
      {leaderboardUsers.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center my-4">
          {/* Rank 2 */}
          {player2 ? (
            <div className="game-panel rounded-2xl p-4 border border-white/10 flex flex-col items-center justify-end">
              <span className="text-2xl mb-1">🥈</span>
              <span className="font-game-title font-bold text-xs text-white truncate w-full">{player2.name}</span>
              <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 mt-1 rounded border flex items-center gap-1 ${player2.rankInfo.currentRank.badgeClass}`}>
                <RankBadgeIcon material={player2.rankInfo.currentRank.material} subRank={player2.rankInfo.currentRank.subRank} size="xs" showGlow={false} />
                <span>{player2.rankInfo.currentRank.fullName}</span>
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
              <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 mt-1 rounded border flex items-center gap-1 ${player1.rankInfo.currentRank.badgeClass}`}>
                <RankBadgeIcon material={player1.rankInfo.currentRank.material} subRank={player1.rankInfo.currentRank.subRank} size="xs" showGlow={false} />
                <span>{player1.rankInfo.currentRank.fullName}</span>
              </span>
            </div>
          )}

          {/* Rank 3 */}
          {player3 ? (
            <div className="game-panel rounded-2xl p-4 border border-white/10 flex flex-col items-center justify-end">
              <span className="text-2xl mb-1">🥉</span>
              <span className="font-game-title font-bold text-xs text-white truncate w-full">{player3.name}</span>
              <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 mt-1 rounded border flex items-center gap-1 ${player3.rankInfo.currentRank.badgeClass}`}>
                <RankBadgeIcon material={player3.rankInfo.currentRank.material} subRank={player3.rankInfo.currentRank.subRank} size="xs" showGlow={false} />
                <span>{player3.rankInfo.currentRank.fullName}</span>
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
                    <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border inline-flex items-center gap-1.5 ${u.rankInfo.currentRank.badgeClass}`}>
                      <RankBadgeIcon material={u.rankInfo.currentRank.material} subRank={u.rankInfo.currentRank.subRank} size="xs" showGlow={false} />
                      <span>{u.rankInfo.currentRank.fullName}</span>
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
