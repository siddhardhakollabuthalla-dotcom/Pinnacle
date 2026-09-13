import React, { useState } from 'react';
import { Coins, Gem, Flame, Trophy, Bell, Volume2, VolumeX, X, CheckCheck, Sparkles, Shield } from 'lucide-react';
import type { User, Character, GameNotification } from '../../types';
import { soundEngine } from '../../utils/soundEngine';
import { getRankInfo } from '../../utils/rankingSystem';
import { RankBadgeIcon } from './RankBadgeIcon';

export const GameHUD: React.FC<{
  user: User;
  character?: Character;
  onOpenProfile?: () => void;
}> = ({ user, character, onOpenProfile }) => {
  const [soundOn, setSoundOn] = useState(soundEngine.isEnabled());
  const [showNotifications, setShowNotifications] = useState(false);

  const [notifications, setNotifications] = useState<GameNotification[]>([
    {
      id: 'n1',
      title: 'Welcome to Pinnacle RPG!',
      message: `Welcome back, ${user.username}. Prepare to conquer daily quests and level up your life.`,
      timestamp: 'Just now',
      type: 'system',
      read: false,
    },
    {
      id: 'n2',
      title: 'Daily Streak Bonus Active',
      message: `You are currently on a ${character?.current_streak || 1} day streak! Keep it up to earn XP bonus multipliers.`,
      timestamp: '2 hours ago',
      type: 'streak',
      read: false,
    },
    {
      id: 'n3',
      title: 'Rank Progress Updated',
      message: `Current Power Rating Level: ${character?.level || 1}. Complete quests to climb the global Leaderboard!`,
      timestamp: '5 hours ago',
      type: 'level_up',
      read: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleToggleSound = () => {
    const newState = soundEngine.toggleSound();
    setSoundOn(newState);
    if (newState) soundEngine.play('click');
  };

  const handleToggleNotifications = () => {
    soundEngine.play('click');
    setShowNotifications((prev) => !prev);
  };

  const handleMarkAllRead = () => {
    soundEngine.play('click');
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearNotifications = () => {
    soundEngine.play('click');
    setNotifications([]);
  };

  const level = character?.level || 1;
  const currentXp = character?.current_xp || 0;
  const nextXp = character?.next_level_xp || 50;
  const xpPct = Math.min(100, Math.round((currentXp / nextXp) * 100));

  const rankInfo = getRankInfo(character?.total_xp || 0, character?.current_streak || 0, character?.longest_streak || 0);

  return (
    <header className="sticky top-0 z-40 bg-[#07080d]/90 border-b border-cyan-500/20 backdrop-blur-2xl px-4 py-2.5 shadow-[0_4px_25px_rgba(0,0,0,0.8)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Top-Left: PLAYER AVATAR & LEVEL HUD (Click to view Profile) */}
        <button
          type="button"
          onClick={() => {
            if (onOpenProfile) {
              soundEngine.play('click');
              onOpenProfile();
            }
          }}
          className="flex items-center gap-3 cursor-pointer group transition-all p-1.5 rounded-2xl hover:bg-amber-500/10 border border-transparent hover:border-amber-500/40 text-left focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          title="Click to open Player Profile"
        >
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-yellow-700 p-0.5 shadow-[0_0_15px_rgba(245,158,11,0.4)] group-hover:shadow-[0_0_25px_rgba(245,158,11,0.8)] group-hover:scale-105 transition-all">
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
              <span className="font-game-title font-bold text-sm tracking-wider text-white uppercase group-hover:text-amber-400 transition-colors">{user.username}</span>
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
        </button>

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

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={handleToggleNotifications}
              className={`p-2 rounded-xl border transition-all relative ${
                showNotifications
                  ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                  : 'bg-white/5 border-white/10 text-zinc-400 hover:text-amber-400 hover:border-amber-500/40'
              }`}
              title="System Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-zinc-950 font-mono font-black text-[10px] flex items-center justify-center border border-zinc-950 shadow">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Popover Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 glass-card-gold rounded-2xl border border-amber-500/40 p-4 shadow-[0_10px_40px_rgba(0,0,0,0.9)] z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-400" />
                    <h4 className="font-cinzel font-bold text-sm text-white uppercase tracking-wider">
                      SYSTEM NOTIFICATIONS
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[10px] font-mono text-amber-400 hover:underline flex items-center gap-1"
                      >
                        <CheckCheck className="w-3 h-3" /> READ ALL
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs font-mono text-zinc-500">
                    NO NEW NOTIFICATIONS
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          setNotifications((prev) =>
                            prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
                          );
                        }}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          notif.read
                            ? 'bg-zinc-900/40 border-white/5 text-zinc-400'
                            : 'bg-amber-500/10 border-amber-500/30 text-zinc-100 shadow-[0_0_10px_rgba(245,158,11,0.08)]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="font-bold text-xs font-cinzel text-amber-300 flex items-center gap-1.5">
                            {notif.type === 'streak' && <Flame className="w-3.5 h-3.5 text-orange-400" />}
                            {notif.type === 'level_up' && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                            {notif.type === 'system' && <Shield className="w-3.5 h-3.5 text-cyan-400" />}
                            <span>{notif.title}</span>
                          </h5>
                          <span className="text-[9px] font-mono text-zinc-500 whitespace-nowrap">
                            {notif.timestamp}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-zinc-300 mt-1 leading-snug">
                          {notif.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {notifications.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-amber-500/20 text-center">
                    <button
                      onClick={handleClearNotifications}
                      className="text-[10px] font-mono text-zinc-500 hover:text-rose-400 transition-colors"
                    >
                      CLEAR ALL NOTIFICATIONS
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

