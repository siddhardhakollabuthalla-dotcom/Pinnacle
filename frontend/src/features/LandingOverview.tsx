import React, { useState } from 'react';
import {
  Swords,
  Shield,
  Trophy,
  Sparkles,
  ArrowRight,
  Zap,
  Crown,
  Dumbbell,
  Brain,
  HeartPulse,
  Palette,
  UserPlus,
  LogIn,
  CheckCircle2
} from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

export const LandingOverview: React.FC<{
  onGetStarted: () => void;
  onCreateAccount: () => void;
}> = ({ onGetStarted, onCreateAccount }) => {
  const [activeTab, setActiveTab] = useState<'quests' | 'attributes' | 'rewards'>('quests');
  const [activeAttrIndex, setActiveAttrIndex] = useState(0);

  const handleStartLogin = () => {
    soundEngine.play('click');
    onGetStarted();
  };

  const handleStartSignup = () => {
    soundEngine.play('click');
    onCreateAccount();
  };

  const ATTRIBUTES = [
    { label: 'Strength', key: 'STR', color: 'rose', icon: <Dumbbell className="w-6 h-6 text-rose-400" />, desc: 'Physical workouts, endurance & strength training.' },
    { label: 'Intelligence', key: 'INT', color: 'cyan', icon: <Brain className="w-6 h-6 text-cyan-400" />, desc: 'Reading, coding, studying & deep learning.' },
    { label: 'Discipline', key: 'DISC', color: 'emerald', icon: <Shield className="w-6 h-6 text-emerald-400" />, desc: 'Early wake-ups, habit tracking & routine adherence.' },
    { label: 'Creativity', key: 'CREAT', color: 'purple', icon: <Palette className="w-6 h-6 text-purple-400" />, desc: 'UI design, music, writing & artistic projects.' },
    { label: 'Vitality', key: 'VIT', color: 'amber', icon: <HeartPulse className="w-6 h-6 text-amber-400" />, desc: 'Sleep optimization, nutrition & hydration.' },
    { label: 'Focus', key: 'FOC', color: 'yellow', icon: <Crown className="w-6 h-6 text-yellow-400" />, desc: 'Deep focus sessions & distraction-free Pomodoro.' },
  ];

  return (
    <div className="min-h-screen bg-[#07080d] text-zinc-100 font-sans relative overflow-x-hidden">
      {/* Dynamic Cyber Glow Atmosphere */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-0 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Hero Navbar */}
      <header className="relative z-20 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 p-1 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <img src="/logo.png" alt="Pinnacle Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-cinzel font-black text-xl tracking-widest bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 bg-clip-text text-transparent">
            PINNACLE
          </span>
        </div>

        {/* Action Buttons: CREATE ONE at the left of LOG IN */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleStartSignup}
            className="px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(245,158,11,0.15)] flex items-center gap-2"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>CREATE ONE</span>
          </button>

          <button
            onClick={handleStartLogin}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 font-mono text-xs font-black transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center gap-2"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>LOG IN</span>
          </button>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24 space-y-24">
        <div className="text-center max-w-3xl mx-auto space-y-6 pt-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Sparkles className="w-3.5 h-3.5" /> REAL-LIFE GAMIFICATION ENGINE
          </div>

          <h1 className="text-4xl sm:text-6xl font-black font-cinzel tracking-tight text-white leading-tight">
            TURN YOUR REAL LIFE INTO AN <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">EPIC RPG</span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 font-mono leading-relaxed">
            Gamify your daily routines, habits, and personal goals. Complete real-world missions to earn XP, accumulate Gold, maintain daily streak multipliers, unlock items, and level up your character stats.
          </p>

          <div className="flex justify-center pt-4">
            <button
              onClick={handleStartLogin}
              className="px-9 py-4.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 font-black font-mono text-sm tracking-wider uppercase shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:shadow-[0_0_45px_rgba(245,158,11,0.7)] transition-all flex items-center justify-center gap-3 group"
            >
              <span>GET STARTED NOW</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Interactive Game Engine Feature Selector */}
        <div className="glass-card-gold rounded-3xl p-8 border border-amber-500/30 space-y-8 shadow-[0_0_50px_rgba(245,158,11,0.1)]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-amber-500/20 pb-6">
            <div>
              <h2 className="text-2xl font-black font-cinzel text-white">INTERACTIVE GAME SYSTEM OVERVIEW</h2>
              <p className="text-xs font-mono text-zinc-400 mt-1">Explore how Pinnacle transforms daily productivity into role-playing progression.</p>
            </div>

            <div className="flex items-center gap-2 bg-black/60 p-1.5 rounded-2xl border border-white/10">
              {(['quests', 'attributes', 'rewards'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    soundEngine.play('click');
                    setActiveTab(tab);
                  }}
                  className={`px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase transition-all ${
                    activeTab === tab
                      ? 'bg-amber-500 text-zinc-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Feature Demo Panel */}
          {activeTab === 'quests' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Swords className="w-4 h-4" /> DYNAMIC QUEST LOG & VERIFICATION
                </span>
                <h3 className="text-2xl font-bold font-cinzel text-white">Accept Quests & Submit Verification Proof</h3>
                <p className="text-xs font-mono text-zinc-400 leading-relaxed">
                  Choose from 5 difficulty ranks (Easy, Medium, Hard, Epic, Legendary). Complete tasks with mandatory proof verification notes to keep your daily streak alive and prevent cheating.
                </p>
                <ul className="space-y-2 text-xs font-mono text-zinc-300">
                  <li className="flex items-center gap-2 text-amber-300">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" /> Server-side XP & Gold calculations
                  </li>
                  <li className="flex items-center gap-2 text-cyan-300">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" /> Built-in Pomodoro countdown timer
                  </li>
                  <li className="flex items-center gap-2 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Weekly alarm-style recurring routines
                  </li>
                </ul>
              </div>

              <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-amber-400 font-bold">★ EASY (15 XP)</span>
                  <span className="text-[10px] font-mono text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded bg-cyan-500/10">ACTIVE COUNTDOWN: 24:59</span>
                </div>
                <h4 className="text-lg font-bold font-cinzel text-white">Morning 5km Endurance Run</h4>
                <p className="text-xs font-mono text-zinc-400">Complete morning cardio session before 08:00 AM.</p>
                <div className="pt-2 border-t border-white/10 flex justify-between text-xs font-mono text-amber-300 font-bold">
                  <span>+15 XP • +50 COINS • 🏆 +1 TROPHY</span>
                  <span className="text-emerald-400 flex items-center gap-1">✓ VERIFIED</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attributes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Zap className="w-4 h-4" /> STAT TREE & RPG CHARACTER LEVELING
                </span>
                <h3 className="text-2xl font-bold font-cinzel text-white">6 Core Real-World Attributes</h3>
                <p className="text-xs font-mono text-zinc-400 leading-relaxed">
                  Bind missions to your RPG attributes. Click any attribute card on your Profile to inspect completed quests and level up individual stats!
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {ATTRIBUTES.map((attr, idx) => (
                    <button
                      key={attr.label}
                      onClick={() => {
                        soundEngine.play('click');
                        setActiveAttrIndex(idx);
                      }}
                      className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                        activeAttrIndex === idx
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                          : 'bg-black/40 border-white/10 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div className="p-1.5 rounded-lg bg-black/60">{attr.icon}</div>
                      <div>
                        <span className="text-xs font-bold font-mono block">{attr.label}</span>
                        <span className="text-[9px] font-mono text-zinc-500">{attr.key}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="glass-card rounded-2xl p-6 border border-amber-500/40 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40">
                    {ATTRIBUTES[activeAttrIndex].icon}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold font-cinzel text-white">{ATTRIBUTES[activeAttrIndex].label} Mastery</h4>
                    <span className="text-xs font-mono text-amber-400">LVL 4 • 240 / 300 XP</span>
                  </div>
                </div>
                <p className="text-xs font-mono text-zinc-300">{ATTRIBUTES[activeAttrIndex].desc}</p>
                <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden border border-white/10 p-0.5">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full w-4/5" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rewards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-xs font-mono text-purple-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Trophy className="w-4 h-4" /> SHOP ARMORY & GLOBAL LEADERBOARD
                </span>
                <h3 className="text-2xl font-bold font-cinzel text-white">Spend Gold & Climb Global Ranks</h3>
                <p className="text-xs font-mono text-zinc-400 leading-relaxed">
                  Earn Gold to unlock custom HUD themes (Cyberpunk, 16-Bit Dungeon, Cozy Lo-Fi) and cosmetic badges. Compete with players worldwide on the live leaderboard!
                </p>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold">
                    🪙 GOLD WALLET
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 font-mono text-xs font-bold">
                    🔥 STREAK MULTIPLIERS
                  </span>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-6 border border-purple-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-purple-400 font-bold">RANK #1 • GRANDMASTER</span>
                  <span className="text-xs font-mono text-amber-400 font-bold">LVL 42</span>
                </div>
                <div className="p-3 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between">
                  <span className="text-sm font-bold font-cinzel text-white">Cyberpunk HUD Theme</span>
                  <span className="text-xs font-mono text-amber-300 font-bold">EQUIPPED ✓</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Core Attributes Showcase Cards */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-black font-cinzel text-white">DEVELOP YOUR REAL-WORLD ATTRIBUTES</h2>
            <p className="text-xs font-mono text-zinc-400 mt-1">Every quest levels up specific core stats.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {ATTRIBUTES.map((stat) => (
              <div key={stat.label} className="p-4 rounded-2xl glass-card border border-white/10 hover:border-amber-500/40 flex flex-col items-center text-center gap-2 transition-all hover:scale-105">
                <div className="p-2.5 rounded-xl bg-white/5">{stat.icon}</div>
                <span className="text-xs font-bold font-mono text-zinc-200">{stat.label}</span>
                <span className="text-[9px] font-mono text-zinc-500">{stat.key}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
