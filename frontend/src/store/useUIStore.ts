import { create } from 'zustand';

export type ThemeKey = 'cyberpunk' | 'dungeon' | 'lofi';

interface UIState {
  currentTheme: ThemeKey;
  setTheme: (theme: ThemeKey) => void;
  // Floating XP indicator state
  floatingXpList: { id: string; text: string; x: number; y: number }[];
  addFloatingXp: (text: string, x: number, y: number) => void;
  removeFloatingXp: (id: string) => void;
  // Celebration modal
  levelUpModal: { show: boolean; level: number } | null;
  showLevelUp: (level: number) => void;
  hideLevelUp: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  currentTheme: 'cyberpunk',
  setTheme: (theme) => set({ currentTheme: theme }),

  floatingXpList: [],
  addFloatingXp: (text, x, y) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      floatingXpList: [...state.floatingXpList, { id, text, x, y }],
    }));
  },
  removeFloatingXp: (id) =>
    set((state) => ({
      floatingXpList: state.floatingXpList.filter((item) => item.id !== id),
    })),

  levelUpModal: null,
  showLevelUp: (level) => set({ levelUpModal: { show: true, level } }),
  hideLevelUp: () => set({ levelUpModal: null }),
}));
