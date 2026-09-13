import React from 'react';
import { Home, Swords, User, Gift, Award, Trophy, ShoppingBag } from 'lucide-react';
import { soundEngine } from '../../utils/soundEngine';

export type NavTab = 'lobby' | 'quests' | 'character' | 'battlepass' | 'inventory' | 'achievements' | 'leaderboard';

export const BottomNavigation: React.FC<{
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}> = ({ activeTab, onSelectTab }) => {
  const tabs: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'lobby', label: 'HOME', icon: <Home className="w-5 h-5" /> },
    { id: 'quests', label: 'QUESTS', icon: <Swords className="w-5 h-5" /> },
    { id: 'character', label: 'PROFILE', icon: <User className="w-5 h-5" /> },
    { id: 'battlepass', label: 'PASS', icon: <Gift className="w-5 h-5" /> },
    { id: 'inventory', label: 'ARMORY', icon: <ShoppingBag className="w-5 h-5" /> },
    { id: 'achievements', label: 'TROPHY', icon: <Award className="w-5 h-5" /> },
    { id: 'leaderboard', label: 'RANK', icon: <Trophy className="w-5 h-5" /> },
  ];

  const handleTabClick = (tab: NavTab) => {
    soundEngine.play('click');
    onSelectTab(tab);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#07080d]/95 border-t border-cyan-500/30 backdrop-blur-2xl px-2 py-2 shadow-[0_-4px_30px_rgba(0,0,0,0.9)]">
      <div className="max-w-4xl mx-auto flex items-center justify-around">
        {tabs.map((t) => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => handleTabClick(t.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all relative ${
                isActive
                  ? 'text-amber-400 scale-105 font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {isActive && (
                <span className="absolute -top-2 w-8 h-1 bg-amber-400 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
              )}
              {t.icon}
              <span className="text-[10px] font-game-title tracking-wider">{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
