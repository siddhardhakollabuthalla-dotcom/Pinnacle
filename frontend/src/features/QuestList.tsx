import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Plus, Sparkles, Trash2, ShieldAlert } from 'lucide-react';
import type { Quest, Attribute } from '../types';

const DIFFICULTY_COLORS: Record<string, string> = {
  trivial: 'text-gray-400 border-gray-600 bg-gray-500/10',
  easy: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  medium: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
  hard: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  epic: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
};

export const QuestList: React.FC<{
  quests: Quest[];
  attributes: Attribute[];
  onCreateQuest: (data: any) => Promise<void>;
  onCompleteQuest: (questId: string, event: React.MouseEvent) => Promise<void>;
  onDeleteQuest: (questId: string) => Promise<void>;
}> = ({ quests, attributes, onCreateQuest, onCompleteQuest, onDeleteQuest }) => {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [attributeId, setAttributeId] = useState('');
  const [isRecurring] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await onCreateQuest({
      title,
      description,
      difficulty,
      attribute_id: attributeId || undefined,
      is_recurring: isRecurring,
    });
    setTitle('');
    setDescription('');
    setShowModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" /> ACTIVE MISSIONS & QUESTS
        </h3>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold text-xs uppercase tracking-wider shadow-lg transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" /> NEW QUEST
        </button>
      </div>

      {/* Quest Grid */}
      {quests.length === 0 ? (
        <div className="text-center py-12 bg-black/20 border border-white/5 rounded-2xl p-6">
          <ShieldAlert className="w-10 h-10 text-gray-500 mx-auto mb-2 opacity-60" />
          <p className="text-gray-400 font-mono text-sm">No active quests found. Create one to begin earning XP!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          <AnimatePresence>
            {quests.map((quest) => (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative flex items-center justify-between p-4 bg-gray-900/60 border border-white/10 hover:border-amber-500/40 rounded-xl backdrop-blur-md transition-all shadow-md"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-4">
                  {/* Checkbox button */}
                  <button
                    onClick={(e) => onCompleteQuest(quest.id, e)}
                    className="w-8 h-8 rounded-lg border-2 border-amber-500/40 hover:border-amber-400 flex items-center justify-center text-amber-400 hover:bg-amber-500/20 transition-transform active:scale-90"
                    title="Complete Quest"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <h4 className="font-semibold text-white text-base truncate">{quest.title}</h4>
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                          DIFFICULTY_COLORS[quest.difficulty] || 'text-gray-400 border-gray-600'
                        }`}
                      >
                        {quest.difficulty}
                      </span>
                      {quest.attribute && (
                        <span className="text-[10px] font-mono text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                          +{quest.attribute.display_name}
                        </span>
                      )}
                    </div>
                    {quest.description && (
                      <p className="text-xs text-gray-400 line-clamp-1">{quest.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onDeleteQuest(quest.id)}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl p-6 shadow-2xl text-white"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> CREATE NEW QUEST
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-400 uppercase mb-1">Quest Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Read 20 pages of technical docs"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 uppercase mb-1">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Additional context or milestone steps..."
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 h-20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-gray-400 uppercase mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="trivial">Trivial (5 XP)</option>
                    <option value="easy">Easy (15 XP)</option>
                    <option value="medium">Medium (30 XP)</option>
                    <option value="hard">Hard (60 XP)</option>
                    <option value="epic">Epic (120 XP)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-400 uppercase mb-1">Attribute Stat</label>
                  <select
                    value={attributeId}
                    onChange={(e) => setAttributeId(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">None (General XP)</option>
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
                  className="px-4 py-2 rounded-xl border border-white/10 text-xs font-bold text-gray-400 hover:text-white"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider"
                >
                  ADD QUEST
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
