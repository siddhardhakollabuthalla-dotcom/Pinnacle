import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Swords,
  Plus,
  CheckCircle2,
  Trash2,
  Flame,
  ShieldAlert,
  ShieldCheck,
  ExternalLink,
  AlertCircle,
  Clock,
  Play,
  RotateCcw
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';
import type { Quest, Attribute, QuestHistory } from '../../types';
import { soundEngine } from '../../utils/soundEngine';

export const DIFFICULTY_CONFIG: Record<string, { label: string; color: string; badgeClass: string; xp: number; stars: string }> = {
  trivial: { label: 'EASY', color: '#10b981', badgeClass: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10', xp: 5, stars: '★☆☆☆☆' },
  easy: { label: 'EASY', color: '#10b981', badgeClass: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10', xp: 15, stars: '★★☆☆☆' },
  medium: { label: 'MEDIUM', color: '#3b82f6', badgeClass: 'border-blue-500/40 text-blue-400 bg-blue-500/10', xp: 30, stars: '★★★☆☆' },
  hard: { label: 'HARD', color: '#f59e0b', badgeClass: 'border-amber-500/40 text-amber-400 bg-amber-500/10', xp: 60, stars: '★★★★☆' },
  epic: { label: 'EPIC', color: '#a855f7', badgeClass: 'border-purple-500/40 text-purple-400 bg-purple-500/10', xp: 120, stars: '★★★★★' },
  legendary: { label: 'LEGENDARY', color: '#eab308', badgeClass: 'border-yellow-400/60 text-yellow-300 bg-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.3)]', xp: 250, stars: '★★★★★' }
};

export const getProofGuidance = (quest: Quest) => {
  const attrKey = quest.attribute?.key?.toLowerCase() || '';
  const titleLower = quest.title.toLowerCase();

  if (attrKey.includes('str') || titleLower.includes('workout') || titleLower.includes('gym') || titleLower.includes('pushup') || titleLower.includes('run')) {
    return {
      category: 'STRENGTH & PHYSICAL INTEGRITY',
      colorBadge: 'border-rose-500/50 text-rose-400 bg-rose-500/10 shadow-[0_0_15px_rgba(244,63,94,0.2)]',
      prompt: 'Document physical workout execution (exercises, sets, reps, weight, distance, or Strava activity).',
      placeholder: 'e.g. 5x5 barbell squats @ 90kg, 4x10 pull-ups, completed 5km endurance run in 23m 40s.',
      linkPlaceholder: 'https://strava.com/activities/... or workout log URL (optional)',
      linkHint: 'Strava / Garmin / Apple Fitness / Workout Log'
    };
  }
  if (attrKey.includes('int') || titleLower.includes('read') || titleLower.includes('study') || titleLower.includes('code') || titleLower.includes('learn')) {
    return {
      category: 'INTELLIGENCE & MASTERY',
      colorBadge: 'border-blue-500/50 text-blue-400 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.2)]',
      prompt: 'Summarize key concepts mastered, chapter summaries, problem solutions, or repository commits.',
      placeholder: 'e.g. Completed Chapter 7 of System Design; solved 3 LeetCode Medium dynamic programming problems.',
      linkPlaceholder: 'https://github.com/... or PR / Notion notes URL (optional)',
      linkHint: 'GitHub PR / Commit / Notion / LeetCode link'
    };
  }
  if (attrKey.includes('disc') || titleLower.includes('routine') || titleLower.includes('habit') || titleLower.includes('wake')) {
    return {
      category: 'DISCIPLINE & HABIT EXECUTION',
      colorBadge: 'border-amber-500/50 text-amber-400 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
      prompt: 'Specify exact timestamps, checklist adherence, and streak consistency details.',
      placeholder: 'e.g. Awoke at 06:00, completed 15min mindfulness meditation, made bed, zero phone usage before 9 AM.',
      linkPlaceholder: 'Optional habit tracking link or daily journal log',
      linkHint: 'Habit tracker / Daily journal reference'
    };
  }
  if (attrKey.includes('creat') || titleLower.includes('design') || titleLower.includes('art') || titleLower.includes('music') || titleLower.includes('write')) {
    return {
      category: 'CREATIVITY & CRAFTSMANSHIP',
      colorBadge: 'border-purple-500/50 text-purple-400 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.2)]',
      prompt: 'Describe creative output, design artifacts, or project milestones achieved.',
      placeholder: 'e.g. Drafted complete cyberpunk UI design system in Figma with 12 reusable chamfered card components.',
      linkPlaceholder: 'https://figma.com/file/... or Dribbble / portfolio URL (optional)',
      linkHint: 'Figma / CodeSandbox / Dribbble / Portfolio link'
    };
  }
  if (attrKey.includes('vit') || titleLower.includes('sleep') || titleLower.includes('water') || titleLower.includes('diet') || titleLower.includes('health')) {
    return {
      category: 'VITALITY & BIOMETRIC RECOVERY',
      colorBadge: 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]',
      prompt: 'Log recovery biometrics, sleep duration, hydration target reached, or clean nutrition notes.',
      placeholder: 'e.g. Slept 8.2 hours (92% sleep quality score on tracker), drank 3.5L of water, hit all macro targets.',
      linkPlaceholder: 'Optional health app screenshot or tracking log URL',
      linkHint: 'Sleep tracker / Health app / Nutrition log'
    };
  }
  if (attrKey.includes('foc') || titleLower.includes('deep') || titleLower.includes('pomodoro')) {
    return {
      category: 'FOCUS & DEEP COGNITION',
      colorBadge: 'border-cyan-500/50 text-cyan-400 bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.2)]',
      prompt: 'Log uninterrupted Pomodoro blocks, time spent without distraction, and tasks completed.',
      placeholder: 'e.g. Completed two 90-minute hyperfocus blocks with airplane mode enabled; shipped new API endpoints.',
      linkPlaceholder: 'Optional session report or time tracking URL',
      linkHint: 'Toggl / Forest / Session summary link'
    };
  }
  if (attrKey.includes('conf') || titleLower.includes('speak') || titleLower.includes('lead') || titleLower.includes('pitch')) {
    return {
      category: 'CONFIDENCE & COURAGE',
      colorBadge: 'border-orange-500/50 text-orange-400 bg-orange-500/10 shadow-[0_0_15px_rgba(249,115,22,0.2)]',
      prompt: 'Reflect on stepping out of comfort zone, leadership initiative, or public speaking event.',
      placeholder: 'e.g. Gave a 20-minute technical talk in team demo meeting and answered unscripted questions.',
      linkPlaceholder: 'Optional presentation slides or recording link',
      linkHint: 'Slides / Recording / Meeting notes link'
    };
  }
  return {
    category: 'MISSION VERIFICATION & AUDIT',
    colorBadge: 'border-amber-500/50 text-amber-400 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
    prompt: 'Provide verifiable summary notes or evidence demonstrating authentic completion of this mission.',
    placeholder: 'e.g. Fully accomplished all mission objectives, verified edge conditions, and fulfilled deliverables.',
    linkPlaceholder: 'https://... or documentation reference link (optional)',
    linkHint: 'Documentation / PR / External evidence link'
  };
};

export const QuestBoard: React.FC<{
  quests: Quest[];
  attributes: Attribute[];
  onCreateQuest: (data: any) => Promise<void>;
  onCompleteQuest: (
    questId: string,
    proof: { proof_text: string; proof_link?: string },
    event?: React.MouseEvent
  ) => Promise<void>;
  onDeleteQuest: (questId: string) => Promise<void>;
}> = ({ quests, attributes, onCreateQuest, onCompleteQuest, onDeleteQuest }) => {
  const [showModal, setShowModal] = useState(false);
  const [questForProof, setQuestForProof] = useState<Quest | null>(null);
  const [proofText, setProofText] = useState('');
  const [proofLink, setProofLink] = useState('');
  const [proofError, setProofError] = useState('');
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [proofTriggerEvent, setProofTriggerEvent] = useState<React.MouseEvent | undefined>(undefined);

  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number | ''>('');
  const [activeTimers, setActiveTimers] = useState<Record<string, { startTime: number; durationSeconds: number; elapsedSeconds: number }>>({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [filterTab, setFilterTab] = useState<'active' | 'completed'>('active');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [attributeId, setAttributeId] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  // Load saved timer state from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem('pinnacle_quest_timers');
    if (saved) {
      try {
        setActiveTimers(JSON.parse(saved));
      } catch {
        // ignore JSON errors
      }
    }
  }, []);

  // Save activeTimers to localStorage
  React.useEffect(() => {
    localStorage.setItem('pinnacle_quest_timers', JSON.stringify(activeTimers));
  }, [activeTimers]);

  // Interval timer tick
  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveTimers((prev) => {
        const next = { ...prev };
        let updated = false;
        Object.keys(next).forEach((questId) => {
          const timer = next[questId];
          const now = Math.floor(Date.now() / 1000);
          const elapsed = now - timer.startTime;
          if (elapsed !== timer.elapsedSeconds) {
            next[questId] = { ...timer, elapsedSeconds: elapsed };
            updated = true;
          }
        });
        return updated ? next : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleStartQuestTimer = (questId: string, durationMins?: number) => {
    if (!durationMins || durationMins <= 0) return;
    soundEngine.play('click');
    const now = Math.floor(Date.now() / 1000);
    const durationSec = durationMins * 60;
    setActiveTimers((prev) => ({
      ...prev,
      [questId]: {
        startTime: now,
        durationSeconds: durationSec,
        elapsedSeconds: 0,
      },
    }));
  };

  const handlePauseOrResetTimer = (questId: string) => {
    soundEngine.play('click');
    setActiveTimers((prev) => {
      const next = { ...prev };
      delete next[questId];
      return next;
    });
  };

  const DAYS_OF_WEEK = [
    { key: 'Mon', label: 'M' },
    { key: 'Tue', label: 'T' },
    { key: 'Wed', label: 'W' },
    { key: 'Thu', label: 'T' },
    { key: 'Fri', label: 'F' },
    { key: 'Sat', label: 'S' },
    { key: 'Sun', label: 'S' },
  ];

  const toggleDay = (dayKey: string) => {
    soundEngine.play('click');
    setSelectedDays((prev) =>
      prev.includes(dayKey) ? prev.filter((d) => d !== dayKey) : [...prev, dayKey]
    );
  };

  const { data: history = [] } = useQuery<QuestHistory[]>({
    queryKey: ['history'],
    queryFn: api.getHistory,
  });

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

  const handleOpenProofModal = (quest: Quest, e?: React.MouseEvent) => {
    soundEngine.play('click');
    setQuestForProof(quest);
    setProofText('');
    setProofLink('');
    setProofError('');
    setProofTriggerEvent(e);
  };

  const handleVerifyAndComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questForProof) return;
    const trimmed = proofText.trim();
    if (trimmed.length < 5) {
      setProofError('Proof description must be at least 5 characters to verify.');
      return;
    }
    soundEngine.play('click');
    setShowConfirmDialog(true);
  };

  const handleConfirmCompletion = async () => {
    if (!questForProof) return;
    const trimmed = proofText.trim();
    setIsSubmittingProof(true);
    setProofError('');
    setShowConfirmDialog(false);
    try {
      const cleanLink = proofLink.trim();
      await onCompleteQuest(
        questForProof.id,
        {
          proof_text: trimmed,
          proof_link: cleanLink ? cleanLink : undefined,
        },
        proofTriggerEvent
      );
      setQuestForProof(null);
      setProofText('');
      setProofLink('');
    } catch (err: any) {
      setProofError(err?.message || 'Failed to complete quest');
    } finally {
      setIsSubmittingProof(false);
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
      is_recurring: isRecurring || selectedDays.length > 0,
      recurring_days: selectedDays.length > 0 ? selectedDays : undefined,
    };

    // Close modal and reset form immediately for instant response
    setTitle('');
    setDescription('');
    setAttributeId('');
    setIsRecurring(false);
    setSelectedDays([]);
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
                        onClick={(e) => handleOpenProofModal(quest, e)}
                        className="mt-0.5 w-10 h-10 rounded-xl border-2 border-amber-500/50 hover:border-amber-400 bg-amber-500/10 flex items-center justify-center text-amber-400 hover:scale-110 transition-transform shadow-[0_0_15px_rgba(245,158,11,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Submit Proof & Complete Quest"
                      >
                        <CheckCircle2 className="w-6 h-6" />
                      </button>
                    )}

                    <div className="space-y-1 flex-1">
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
                        {quest.recurring_days && quest.recurring_days.length > 0 && (
                          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border border-cyan-500/40 text-cyan-300 bg-cyan-500/10 flex items-center gap-1 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                            <span>🔁 REPEATS:</span>
                            <span className="text-white font-extrabold">{quest.recurring_days.join(', ')}</span>
                          </span>
                        )}
                      </div>
                      {quest.description && (
                        <p className="text-xs text-zinc-400 font-sans">{quest.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs font-mono text-amber-300 pt-1">
                        <span>REWARD: <strong className="text-amber-400">+{diffConfig.xp} XP</strong></span>
                        <span>•</span>
                        <span>+50 COINS</span>
                        <span>•</span>
                        <span className="text-yellow-300 font-bold">🏆 +1 TROPHY</span>
                        {quest.attribute && (
                          <>
                            <span>•</span>
                            <span className="text-cyan-400">+{quest.attribute.display_name} STAT</span>
                          </>
                        )}
                      </div>

                      {/* Verified Proof Evidence in History */}
                      {isCompleted && (() => {
                        const rec = history.find((h) => h.quest_id === quest.id);
                        if (!rec?.proof_text) return null;
                        return (
                          <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs font-mono space-y-1">
                            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[10px] uppercase tracking-wider">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Verified Proof Evidence:</span>
                            </div>
                            <p className="text-zinc-300 font-sans text-xs">
                              "{rec.proof_text}"
                            </p>
                            {rec.proof_link && (
                              <a
                                href={rec.proof_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 hover:underline text-[11px] font-mono mt-0.5 truncate max-w-full"
                              >
                                <ExternalLink className="w-3 h-3 shrink-0" />
                                <span className="truncate">{rec.proof_link}</span>
                              </a>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-white/10 flex-wrap">
                    {!isCompleted && (() => {
                      const activeTimer = activeTimers[quest.id];
                      if (activeTimer) {
                        const remaining = Math.max(0, activeTimer.durationSeconds - activeTimer.elapsedSeconds);
                        const isExpired = remaining <= 0;
                        const mins = Math.floor(remaining / 60);
                        const secs = remaining % 60;
                        const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

                        return (
                          <div className="flex items-center gap-2">
                            <div
                              className={`px-3 py-1.5 rounded-xl border font-mono text-xs font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.3)] ${
                                isExpired
                                  ? 'bg-rose-500/20 border-rose-500/60 text-rose-400 animate-pulse'
                                  : 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                              }`}
                            >
                              <Clock className={`w-3.5 h-3.5 ${isExpired ? 'text-rose-400' : 'text-amber-400 animate-spin'}`} />
                              <span>{isExpired ? 'TIME EXPIRED ⏰' : `COUNTDOWN: ${timeStr}`}</span>
                            </div>
                            <button
                              onClick={() => handlePauseOrResetTimer(quest.id)}
                              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white"
                              title="Reset Timer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      }

                      // Optional timer start: Only if user explicitly entered a time limit for this quest or session
                      if (timeLimitMinutes && timeLimitMinutes > 0) {
                        return (
                          <button
                            onClick={() => handleStartQuestTimer(quest.id, Number(timeLimitMinutes))}
                            className="px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-bold transition-all flex items-center gap-1.5 group"
                          >
                            <Play className="w-3.5 h-3.5 fill-cyan-400 group-hover:scale-110 transition-transform" />
                            <span>START {timeLimitMinutes}M TIMER</span>
                          </button>
                        );
                      }

                      return null;
                    })()}

                    {!isCompleted && (
                      <button
                        disabled={isBusy}
                        onClick={(e) => handleOpenProofModal(quest, e)}
                        className="btn-game-primary py-2.5 px-4 text-xs font-bold uppercase tracking-wider rounded-xl shadow flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ShieldCheck className="w-4 h-4" /> [ COMPLETE MISSION ]
                      </button>
                    )}

                    {isCompleted && (
                      <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" /> ✓ VERIFIED
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

              <div className="grid grid-cols-3 gap-4">
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

                <div>
                  <label className="block text-xs font-mono text-amber-400 uppercase mb-1 flex items-center gap-1 font-bold">
                    <Clock className="w-3.5 h-3.5" /> Time Limit (Mins)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1440"
                    value={timeLimitMinutes}
                    onChange={(e) => setTimeLimitMinutes(e.target.value ? Number(e.target.value) : '')}
                    placeholder="e.g. 30"
                    className="w-full bg-black/60 border border-amber-500/30 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Alarm Style Weekly Recurring Selector */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <span>🔁 REPEATS WEEKLY ON SPECIFIC DAYS</span>
                  </label>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {selectedDays.length === 7
                      ? 'Every Day'
                      : selectedDays.length > 0
                      ? `${selectedDays.length} days/week (${selectedDays.join(', ')})`
                      : 'One-Time Quest'}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 font-mono">
                  Selected days will automatically re-add this quest every week. Reward is only issued when completed.
                </p>

                <div className="flex items-center justify-between gap-1.5 pt-1">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = selectedDays.includes(day.key);
                    return (
                      <button
                        key={day.key}
                        type="button"
                        onClick={() => toggleDay(day.key)}
                        className={`w-10 h-10 rounded-xl font-mono text-xs font-bold transition-all flex flex-col items-center justify-center border ${
                          isSelected
                            ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-black border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-105'
                            : 'bg-black/60 text-zinc-400 border-white/10 hover:border-amber-500/50 hover:text-white'
                        }`}
                        title={`Toggle ${day.key}`}
                      >
                        <span>{day.label}</span>
                        <span className="text-[8px] opacity-75 font-normal">{day.key}</span>
                      </button>
                    );
                  })}
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

      {/* Proof Submission & Verification Modal */}
      {questForProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg game-panel-gold rounded-3xl p-6 border-2 border-amber-500/60 shadow-[0_0_50px_rgba(245,158,11,0.3)] text-white space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
                  <ShieldCheck className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-game-title text-amber-400">
                    MISSION COMPLETION AUDIT
                  </h3>
                  <p className="text-[10px] font-mono text-zinc-400 tracking-wider">
                    PINNACLE ANTI-CHEAT VERIFICATION PROTOCOL
                  </p>
                </div>
              </div>
              <button
                onClick={() => setQuestForProof(null)}
                className="text-zinc-400 hover:text-white font-mono text-sm p-1"
              >
                ✕
              </button>
            </div>

            {/* Quest Overview Badge */}
            <div className="bg-black/60 border border-white/10 rounded-2xl p-3.5 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono text-zinc-400 uppercase font-bold">Target Mission:</span>
                <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${(DIFFICULTY_CONFIG[questForProof.difficulty] || DIFFICULTY_CONFIG.medium).badgeClass}`}>
                  {(DIFFICULTY_CONFIG[questForProof.difficulty] || DIFFICULTY_CONFIG.medium).stars} {(DIFFICULTY_CONFIG[questForProof.difficulty] || DIFFICULTY_CONFIG.medium).label}
                </span>
              </div>
              <h4 className="text-base font-bold font-game-title text-white">
                {questForProof.title}
              </h4>
              {questForProof.description && (
                <p className="text-xs text-zinc-400 font-sans">{questForProof.description}</p>
              )}
            </div>

            {/* Dynamic Attribute Specific Proof Guidelines */}
            {(() => {
              const guidance = getProofGuidance(questForProof);
              return (
                <form onSubmit={handleVerifyAndComplete} className="space-y-4">
                  <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${guidance.colorBadge}`}>
                        {guidance.category}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 font-sans">
                      {guidance.prompt}
                    </p>
                  </div>

                  {proofError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-mono text-red-400 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{proofError}</span>
                    </div>
                  )}

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-mono text-amber-300 uppercase font-bold">
                        Proof & Verification Summary *
                      </label>
                      <span className={`text-[10px] font-mono ${proofText.trim().length >= 5 ? 'text-emerald-400' : 'text-zinc-500'}`}>
                        {proofText.trim().length}/1000 (min 5 chars)
                      </span>
                    </div>
                    <textarea
                      required
                      value={proofText}
                      onChange={(e) => setProofText(e.target.value)}
                      placeholder={guidance.placeholder}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 h-24 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-zinc-400 uppercase mb-1 flex items-center justify-between">
                      <span>External Verification Link (Optional)</span>
                      <span className="text-[10px] text-zinc-500 lowercase">{guidance.linkHint}</span>
                    </label>
                    <input
                      type="text"
                      value={proofLink}
                      onChange={(e) => setProofLink(e.target.value)}
                      placeholder={guidance.linkPlaceholder}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                    <button
                      type="button"
                      disabled={isSubmittingProof}
                      onClick={() => setQuestForProof(null)}
                      className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-mono font-bold text-zinc-400 hover:text-white transition-colors"
                    >
                      CANCEL
                    </button>
                    <button
                      type="submit"
                      disabled={proofText.trim().length < 5 || isSubmittingProof}
                      className="btn-game-primary py-2.5 px-6 text-xs tracking-wider rounded-xl shadow flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      {isSubmittingProof ? 'VERIFYING...' : '[ ✓ VERIFY & COMPLETE MISSION ]'}
                    </button>
                  </div>
                </form>
              );
            })()}
          </motion.div>
        </div>
      )}

      {/* Confirmation Dialog Box */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-zinc-950 border-2 border-amber-500/80 rounded-3xl p-6 shadow-[0_0_60px_rgba(245,158,11,0.4)] text-center space-y-5"
          >
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-400 mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <ShieldAlert className="w-8 h-8 text-amber-400" />
            </div>

            <div>
              <h3 className="text-xl font-black font-cinzel text-amber-300">
                DID YOU REALLY COMPLETE THE TASK?
              </h3>
              <p className="text-xs font-mono text-zinc-300 mt-2 leading-relaxed">
                Pinnacle Anti-Cheat Protocol requires absolute honesty. Confirm that your proof details are truthful and complete before issuing rewards.
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-300 font-mono text-xs font-bold transition-all"
              >
                NOT TRUE (CANCEL)
              </button>
              <button
                onClick={handleConfirmCompletion}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 font-black font-mono text-xs shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all"
              >
                TRUE (OK)
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
