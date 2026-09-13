import React from 'react';
import { Swords, Shield, Trophy, Sparkles, ArrowRight, Zap, Crown, Dumbbell, Brain, HeartPulse, Palette } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

export const LandingOverview: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  const handleStart = () => {
    soundEngine.play('click');
    onGetStarted();
  };

  return (
    <div className="min-h-screen bg-[#07080d] text-zinc-100 font-sans relative overflow-x-hidden">
      {/* Background Cyber Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-0 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none" />

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

        <button
          onClick={handleStart}
          className="px-5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-400 hover:bg-amber-500 hover:text-zinc-950 font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]"
        >
          LOG IN
        </button>
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

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={handleStart}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 font-black font-mono text-sm tracking-wider uppercase shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:shadow-[0_0_40px_rgba(245,158,11,0.6)] transition-all flex items-center justify-center gap-3 group"
            >
              <span>GET STARTED NOW</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={handleStart}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/40 text-zinc-300 hover:text-white font-mono text-sm font-bold tracking-wider uppercase transition-all"
            >
              LET'S BEGIN
            </button>
          </div>
        </div>

        {/* Core Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card-gold rounded-3xl p-8 border border-amber-500/30 space-y-4">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 w-fit text-amber-400">
              <Swords className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-cinzel text-white">Dynamic Quests</h3>
            <p className="text-xs font-mono text-zinc-400 leading-relaxed">
              Create single or recurring quests across 5 difficulty ranks. Complete tasks with proof verification to earn XP and Gold.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-8 border border-cyan-500/30 space-y-4">
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 w-fit text-cyan-400">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-cinzel text-white">Attribute Mastery</h3>
            <p className="text-xs font-mono text-zinc-400 leading-relaxed">
              Bind your real-world tasks to stats like Strength, Intelligence, Discipline, Vitality, and Focus. Watch your attributes level up in real time!
            </p>
          </div>

          <div className="glass-card rounded-3xl p-8 border border-purple-500/30 space-y-4">
            <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 w-fit text-purple-400">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-cinzel text-white">Leaderboards & Badges</h3>
            <p className="text-xs font-mono text-zinc-400 leading-relaxed">
              Compete against other players on global rank leaderboards, maintain streaks, and purchase themes or cosmetic badges from the Armory.
            </p>
          </div>
        </div>

        {/* Attribute Tree Showcase */}
        <div className="glass-card rounded-3xl p-8 border border-white/10 text-center space-y-6">
          <h2 className="text-2xl font-bold font-cinzel text-white">DEVELOP YOUR REAL-WORLD ATTRIBUTES</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {[
              { label: 'Strength', icon: <Dumbbell className="w-5 h-5 text-amber-400" /> },
              { label: 'Intelligence', icon: <Brain className="w-5 h-5 text-cyan-400" /> },
              { label: 'Discipline', icon: <Shield className="w-5 h-5 text-emerald-400" /> },
              { label: 'Creativity', icon: <Palette className="w-5 h-5 text-purple-400" /> },
              { label: 'Vitality', icon: <HeartPulse className="w-5 h-5 text-rose-400" /> },
              { label: 'Focus', icon: <Crown className="w-5 h-5 text-yellow-400" /> },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-2xl bg-zinc-950/60 border border-white/10 flex flex-col items-center gap-2">
                <div className="p-2 rounded-xl bg-white/5">{stat.icon}</div>
                <span className="text-xs font-bold font-mono text-zinc-200">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
