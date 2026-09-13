import React, { useState, Suspense, lazy } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api/client';
import type { User, Character, Quest, Item, InventoryItem } from './types';
import { AuthModal } from './features/AuthModal';
import { GameHUD } from './components/game/GameHUD';
import { BottomNavigation, type NavTab } from './components/game/BottomNavigation';
import { GameBackground } from './components/game/GameBackground';
import { GameLobby } from './features/Lobby/GameLobby';
import { FloatingXPList, LevelUpModal } from './components/GamificationEffects';
import { useUIStore } from './store/useUIStore';

// Lazy load non-initial tabs for fast first paint and smooth code splitting
const QuestBoard = lazy(() => import('./features/Quests/QuestBoard').then(m => ({ default: m.QuestBoard })));
const CharacterDashboard = lazy(() => import('./features/CharacterDashboard').then(m => ({ default: m.CharacterDashboard })));
const BattlePass = lazy(() => import('./features/BattlePass/BattlePass').then(m => ({ default: m.BattlePass })));
const ShopView = lazy(() => import('./features/ShopView').then(m => ({ default: m.ShopView })));
const Achievements = lazy(() => import('./features/Achievements/Achievements').then(m => ({ default: m.Achievements })));
const Leaderboard = lazy(() => import('./features/Leaderboard/Leaderboard').then(m => ({ default: m.Leaderboard })));

export const App: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<NavTab>('lobby');
  const { addFloatingXp, showLevelUp, setTheme } = useUIStore();

  // 1. Auth query
  const { data: user, isLoading: userLoading, error: userError } = useQuery<User | null>({
    queryKey: ['me'],
    queryFn: api.getMe,
    retry: false,
  });

  // 2. Character query
  const { data: character } = useQuery<Character>({
    queryKey: ['character'],
    queryFn: api.getCharacter,
    enabled: !!user,
  });

  // 3. Quests query (fetch all quests so client can toggle between active and completed tabs)
  const { data: quests = [] } = useQuery<Quest[]>({
    queryKey: ['quests', 'all'],
    queryFn: () => api.getQuests('all'),
    enabled: !!user,
  });

  // 4. Shop & Inventory queries (Lazy loaded when inventory tab is active to speed up home load)
  const { data: shopItems = [] } = useQuery<Item[]>({
    queryKey: ['shopItems'],
    queryFn: api.getShopItems,
    enabled: !!user && activeTab === 'inventory',
  });

  const { data: inventory = [] } = useQuery<InventoryItem[]>({
    queryKey: ['inventory'],
    queryFn: api.getInventory,
    enabled: !!user,
  });

  // Automatically sync equipped theme from inventory
  React.useEffect(() => {
    const equippedTheme = inventory.find((inv) => inv.equipped && inv.item.type === 'theme');
    if (equippedTheme?.item.metadata_json?.theme_key) {
      setTheme(equippedTheme.item.metadata_json.theme_key);
    }
  }, [inventory, setTheme]);

  // Complete Quest Mutation
  const completeMutation = useMutation({
    mutationFn: ({ questId, proof }: { questId: string; proof: { proof_text: string; proof_link?: string } }) =>
      api.completeQuest(questId, proof),
    onMutate: async ({ questId }) => {
      await queryClient.cancelQueries({ queryKey: ['quests'] });
      const previousQuests = queryClient.getQueryData<Quest[]>(['quests', 'all']);

      queryClient.setQueryData<Quest[]>(['quests', 'all'], (old = []) =>
        old.map((q) => (q.id === questId ? { ...q, status: 'completed' } : q))
      );

      return { previousQuests };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousQuests) {
        queryClient.setQueryData(['quests', 'all'], context.previousQuests);
      }
    },
    onSettled: (result) => {
      if (result?.leveled_up) {
        showLevelUp(result.new_level);
      }
      queryClient.invalidateQueries({ queryKey: ['character'] });
      queryClient.invalidateQueries({ queryKey: ['quests'] });
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });

  // Create Quest Mutation with Optimistic UI Update
  const createMutation = useMutation({
    mutationFn: (data: any) => api.createQuest(data),
    onMutate: async (newQuestData) => {
      await queryClient.cancelQueries({ queryKey: ['quests'] });
      const previousQuests = queryClient.getQueryData<Quest[]>(['quests', 'all']);

      const tempQuest: Quest = {
        id: `temp-${Date.now()}`,
        title: newQuestData.title,
        description: newQuestData.description,
        attribute_id: newQuestData.attribute_id,
        difficulty: newQuestData.difficulty || 'medium',
        is_recurring: !!newQuestData.is_recurring,
        recurrence_rule: newQuestData.recurrence_rule,
        status: 'active',
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData<Quest[]>(['quests', 'all'], (old = []) => [tempQuest, ...old]);
      return { previousQuests };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousQuests) {
        queryClient.setQueryData(['quests', 'all'], context.previousQuests);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] });
    },
  });

  // Delete Quest Mutation with Optimistic UI Update
  const deleteMutation = useMutation({
    mutationFn: (questId: string) => api.deleteQuest(questId),
    onMutate: async (questId) => {
      await queryClient.cancelQueries({ queryKey: ['quests'] });
      const previousQuests = queryClient.getQueryData<Quest[]>(['quests', 'all']);

      queryClient.setQueryData<Quest[]>(['quests', 'all'], (old = []) =>
        old.filter((q) => q.id !== questId)
      );

      return { previousQuests };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousQuests) {
        queryClient.setQueryData(['quests', 'all'], context.previousQuests);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] });
    },
  });

  // Purchase Item Mutation
  const purchaseMutation = useMutation({
    mutationFn: (itemId: string) => api.purchaseItem(itemId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['character'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });

  // Equip Item Mutation
  const equipMutation = useMutation({
    mutationFn: (itemId: string) => api.equipItem(itemId),
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: ['inventory'] });
      const previousInventory = queryClient.getQueryData<InventoryItem[]>(['inventory']);

      queryClient.setQueryData<InventoryItem[]>(['inventory'], (old = []) => {
        const targetItem = old.find((inv) => inv.item.id === itemId);
        if (!targetItem) return old;
        return old.map((inv) => ({
          ...inv,
          equipped: inv.item.type === targetItem.item.type ? inv.item.id === itemId : inv.equipped,
        }));
      });

      return { previousInventory };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousInventory) {
        queryClient.setQueryData(['inventory'], context.previousInventory);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });

  const handleCompleteQuest = async (
    questId: string,
    proof: { proof_text: string; proof_link?: string },
    e?: React.MouseEvent
  ) => {
    const targetQuest = quests.find((q) => q.id === questId);
    const xpMap: Record<string, number> = {
      trivial: 5,
      easy: 15,
      medium: 30,
      hard: 60,
      epic: 120,
      legendary: 250,
    };
    const xpGain = targetQuest ? (xpMap[targetQuest.difficulty] || 30) : 30;
    if (e) {
      addFloatingXp(`+${xpGain} XP`, e.clientX, e.clientY);
      addFloatingXp(`🏆 +1 TROPHY`, e.clientX + 30, e.clientY - 25);
    } else {
      addFloatingXp(`+${xpGain} XP`, window.innerWidth / 2, window.innerHeight / 2);
      addFloatingXp(`🏆 +1 TROPHY`, window.innerWidth / 2 + 30, window.innerHeight / 2 - 25);
    }
    await completeMutation.mutateAsync({ questId, proof });
  };

  const handleCreateQuest = async (data: any) => {
    await createMutation.mutateAsync(data);
  };

  const handleDeleteQuest = async (questId: string) => {
    deleteMutation.mutate(questId);
  };

  const handlePurchase = async (itemId: string) => {
    await purchaseMutation.mutateAsync(itemId);
  };

  const handleEquip = async (itemId: string) => {
    equipMutation.mutate(itemId);
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-[#050609] flex items-center justify-center text-amber-400 font-game-title text-sm tracking-widest">
        INITIALIZING PINNACLE GAME ENGINE...
      </div>
    );
  }

  if (userError || !user) {
    return <AuthModal onAuthSuccess={() => queryClient.invalidateQueries({ queryKey: ['me'] })} />;
  }

  return (
    <div className="min-h-screen text-zinc-100 font-sans relative pb-20 overflow-x-hidden">
      {/* Cybernetic Parallax Canvas & Background */}
      <GameBackground />

      {/* FX Modals */}
      <FloatingXPList />
      <LevelUpModal />

      {/* Top Game Player HUD */}
      <GameHUD user={user} character={character} />

      {/* Main Game Screen Router */}
      <main className="max-w-6xl mx-auto px-4 py-6 relative z-10">
        <Suspense fallback={
          <div className="flex items-center justify-center py-20 text-xs font-mono font-bold text-amber-400 animate-pulse tracking-widest">
            LOADING GAME SECTOR...
          </div>
        }>
          {activeTab === 'lobby' && character && (
            <GameLobby
              user={user}
              character={character}
              activeQuests={quests.filter((q) => q.status === 'active')}
              onStartQuest={() => setActiveTab('quests')}
              onViewCharacter={() => setActiveTab('character')}
              onViewBattlePass={() => setActiveTab('battlepass')}
            />
          )}

          {activeTab === 'quests' && (
            <QuestBoard
              quests={quests}
              attributes={character?.attributes.map((ca) => ca.attribute) || []}
              onCreateQuest={handleCreateQuest}
              onCompleteQuest={handleCompleteQuest}
              onDeleteQuest={handleDeleteQuest}
            />
          )}

          {activeTab === 'character' && character && (
            <CharacterDashboard character={character} quests={quests} />
          )}

          {activeTab === 'battlepass' && character && (
            <BattlePass character={character} />
          )}

          {activeTab === 'inventory' && character && (
            <ShopView
              items={shopItems}
              inventory={inventory}
              userGold={character.gold}
              onPurchase={handlePurchase}
              onEquip={handleEquip}
            />
          )}

          {activeTab === 'achievements' && <Achievements character={character} quests={quests} />}

          {activeTab === 'leaderboard' && (
            <Leaderboard currentCharacter={character} currentUser={user} />
          )}
        </Suspense>
      </main>

      {/* Persistent AAA Mobile Bottom Navigation Bar */}
      <BottomNavigation activeTab={activeTab} onSelectTab={setActiveTab} />
    </div>
  );
};
