import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Plus, CheckCircle2, Trash2, Flame, ShieldAlert } from 'lucide-react';
import type { Quest, Attribute } from '../../types';
import { soundEngine } from '../../utils/soundEngine';

export const DIFFICULTY_CONFIG: Record<string, { label: string; color: string; badgeClass: string; xp: number; stars: string }> = {
  trivial: { label: 'EASY', color: '#10b981', badgeClass: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10', xp: 5, stars: '★☆☆☆☆' },
  easy: { label: 'EASY', color: '#10b981', badgeClass: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10', xp: 15, stars: '★★☆☆☆' },
  medium: { label: 'MEDIUM', color: '#3b82f6', badgeClass: 'border-blue-500/40 text-blue-400 bg-blue-500/10', xp: 30, stars: '★★★☆☆' },
  hard: { label: 'HARD', color: '#f59e0b', badgeClass: 'border-amber-500/40 text-amber-400 bg-amber-500/10', xp: 60, stars: '★★★★☆' },
  epic: { label: 'EPIC', color: '#a855f7', badgeClass: 'border-purple-500/40 text-purple-400 bg-purple-500/10', xp: 120, stars: '★★★★★' },
  legendary: { label: 'LEGENDARY', color: '#eab308', badgeClass: 'border-yellow-400/60 text-yellow-300 bg-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.3)]', xp: 250, stars: '★★★★★' }
};

export const QuestBoard: React.FC<{
  quests: Quest[];
  attributes: Attribute[];
  onCreateQuest: (data: any) => Promise<void>;
  onCompleteQuest: (questId: string, event: React.MouseEvent) => Promise<void>;
  onDeleteQuest: (questId: string) => Promise<void>;
}> = ({ quests, attributes, onCreateQuest, onCompleteQuest, onDeleteQuest }) => {
  const [showModal, setShowModal] = useState(false);
  const [filterTab, setFilterTab] = useState<'active' | 'completed'>('active');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [attributeId, setAttributeId] = useState('');
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const handleAction = async (questId: string, action: () => Promise<void>) => {
    if (processingIds.has(questId)) return;
    setProcessingIds((prev) => new Set(prev).add(questId));
    try {
      await action();
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(questId);
        return next;
      });
    }
  };

  const activeQuests = quests.filter((q) => q.status === 'active');
  const completedQuests = quests.filter((q) => q.status === 'completed');
  const displayedQuests = filterTab === 'active' ? activeQuests : completedQuests;

  const completedCount = completedQuests.length;
  const totalCount = quests.length || 1;
  const completionPct = Math.round((completedCount / totalCount) * 100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    soundEngine.play('quest_accept');

    const questData = {
      title,
      description,
      difficulty,
      attribute_id: attributeId || undefined,
    };

    // Close modal and reset form immediately for instant response
    setTitle('');
    setDescription('');
    setAttributeId('');
    setShowModal(false);

    // Fire creation request
    onCreateQuest(questData);
  };

  return (
    <div className="space-y-6">
      {/* Daily Objectives Banner */}
      <div className="game-panel-cyan rounded-3xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-pulse" />
              <h3 className="text-xl font-black font-game-title tracking-wider text-white">DAILY OBJECTIVES & QUEST BOARD</h3>
            </div>
            <p className="text-xs font-mono text-zinc-400">Complete quests to gain XP, unlock Coins, and maintain your streak chain.</p>
          </div>

          <button
            onClick={() => {
              soundEngine.play('click');
              setShowModal(true);
            }}
            className="btn-game-primary py-3 px-5 text-xs tracking-wider flex items-center justify-center gap-2 rounded-xl shadow-lg"
          >
            <Plus className="w-4 h-4" /> [ ⚔ ACCEPT NEW QUEST ]
          </button>
        </div>

        {/* Daily Completion Progress Bar */}
        <div className="mt-6 space-y-1.5">
          <div className="flex justify-between text-xs font-mono font-bold">
            <span className="text-cyan-400">DAILY MISSION REWARD PROGRESS</span>
            <span className="text-white">{completedCount} / {quests.length} COMPLETED ({completionPct}%)</span>
          </div>
          <div className="w-full h-3 bg-black/80 rounded-full overflow-hidden border border-white/10 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-amber-400 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(6,182,212,0.6)]"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quest Filter Tabs */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-3">
        <button
          onClick={() => {
            soundEngine.play('click');
            setFilterTab('active');
          }}
          className={`py-2 px-4 rounded-xl text-xs font-mono font-bold tracking-wider transition-all flex items-center gap-2 ${
            filterTab === 'active'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
              : 'text-zinc-400 hover:text-white border border-transparent'
          }`}
        >
          ⚔ ACTIVE MISSIONS ({activeQuests.length})
        </button>

        <button
          onClick={() => {
            soundEngine.play('click');
            setFilterTab('completed');
          }}
          className={`py-2 px-4 rounded-xl text-xs font-mono font-bold tracking-wider transition-all flex items-center gap-2 ${
            filterTab === 'completed'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
              : 'text-zinc-400 hover:text-white border border-transparent'
          }`}
        >
          🏆 COMPLETED TASKS ({completedQuests.length})
        </button>
      </div>

      {/* Quest Cards Grid */}
      {displayedQuests.length === 0 ? (
        <div className="text-center py-16 game-panel rounded-3xl p-8 border border-white/10">
          <ShieldAlert className="w-12 h-12 text-zinc-600 mx-auto mb-3 opacity-70" />
          <h4 className="text-lg font-bold font-game-title text-zinc-400">
            {filterTab === 'active' ? 'NO ACTIVE MISSIONS IN QUEST LOG' : 'NO COMPLETED TASKS YET'}
          </h4>
          <p className="text-xs font-mono text-zinc-500 mt-1">
            {filterTab === 'active'
              ? 'Accept a quest above to earn XP and level up your avatar.'
              : 'Complete your active quests to see your victory records here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {displayedQuests.map((quest) => {
              const diffConfig = DIFFICULTY_CONFIG[quest.difficulty] || DIFFICULTY_CONFIG.medium;
              const isBusy = processingIds.has(quest.id);
              const isCompleted = quest.status === 'completed';

              return (
                <motion.div
                  key={quest.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: isBusy ? 0.5 : 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`game-panel rounded-2xl p-5 border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group relative overflow-hidden ${
                    isCompleted
                      ? 'border-emerald-500/30 bg-emerald-950/10 hover:border-emerald-500/50'
                      : 'border-white/10 hover:border-amber-500/50'
                  }`}
                >
                  <div className="flex items-start gap-4 flex-1">
                    {isCompleted ? (
                      <div className="mt-0.5 w-10 h-10 rounded-xl border-2 border-emerald-500/60 bg-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                    ) : (
                      <button
                        disabled={isBusy}
                        onClick={(e) => {
                          handleAction(quest.id, async () => {
                            soundEngine.play('quest_complete');
                            await onCompleteQuest(quest.id, e);
                          });
                        }}
                        className="mt-0.5 w-10 h-10 rounded-xl border-2 border-amber-500/50 hover:border-amber-400 bg-amber-500/10 flex items-center justify-center text-amber-400 hover:scale-110 transition-transform shadow-[0_0_15px_rgba(245,158,11,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Complete Quest"
                      >
                        <CheckCircle2 className="w-6 h-6" />
                      </button>
                    )}

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-zinc-500 font-bold uppercase tracking-wider">
                          {isCompleted ? '🏆 COMPLETED' : '⚔ QUEST'}
                        </span>
                        <h4 className={`text-lg font-bold font-game-title tracking-wide ${isCompleted ? 'line-through text-zinc-400' : 'text-white'}`}>
                          {quest.title}
                        </h4>
                        <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded border ${diffConfig.badgeClass}`}>
                          {diffConfig.stars} {diffConfig.label}
                        </span>
                      </div>
                      {quest.description && (
                        <p className="text-xs text-zinc-400 font-sans">{quest.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs font-mono text-amber-300 pt-1">
                        <span>REWARD: <strong className="text-amber-400">+{diffConfig.xp} XP</strong></span>
                        <span>•</span>
                        <span>+50 COINS</span>
                        {quest.attribute && (
                          <>
                            <span>•</span>
                            <span className="text-cyan-400">+{quest.attribute.display_name} STAT</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-white/10">
                    {!isCompleted && (
                      <button
                        disabled={isBusy}
                        onClick={(e) => {
                          handleAction(quest.id, async () => {
                            soundEngine.play('quest_complete');
                            await onCompleteQuest(quest.id, e);
                          });
                        }}
                        className="btn-game-primary py-2.5 px-4 text-xs font-bold uppercase tracking-wider rounded-xl shadow flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        [ ✓ COMPLETE QUEST ]
                      </button>
                    )}

                    {isCompleted && (
                      <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider flex items-center gap-1">
                        ✓ COMPLETED
                      </span>
                    )}

                    <button
                      disabled={isBusy}
                      onClick={() => {
                        handleAction(quest.id, async () => {
                          await onDeleteQuest(quest.id);
                        });
                      }}
                      className="p-2.5 rounded-xl border border-white/10 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Archive / Remove Quest"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Quest Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg game-panel-gold rounded-3xl p-6 border-2 border-amber-500/60 shadow-[0_0_50px_rgba(245,158,11,0.3)] text-white space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xl font-bold font-game-title text-amber-400 flex items-center gap-2">
                <Swords className="w-6 h-6 text-amber-400" /> CREATE NEW RPG QUEST
              </h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white font-mono text-sm">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">Quest Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Master Java OOP Concepts"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">Mission Objective Details</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Specific milestone steps to complete..."
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 h-20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">Difficulty Rank</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="easy">EASY (15 XP)</option>
                    <option value="medium">MEDIUM (30 XP)</option>
                    <option value="hard">HARD (60 XP)</option>
                    <option value="epic">EPIC (120 XP)</option>
                    <option value="legendary">LEGENDARY (250 XP)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">Attribute Target</label>
                  <select
                    value={attributeId}
                    onChange={(e) => setAttributeId(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">General XP</option>
                    {attributes.map((attr) => (
                      <option key={attr.id} value={attr.id}>
                        {attr.display_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-mono font-bold text-zinc-400 hover:text-white"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="btn-game-primary py-2.5 px-6 text-xs tracking-wider rounded-xl shadow"
                >
                  [ ⚔ ACCEPT QUEST ]
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
