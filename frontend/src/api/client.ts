import type { User, Character, Quest, QuestCompletionResult, Item, InventoryItem, QuestHistory, LeaderboardUser } from '../types';

// Set backend API URL. Uses VITE_API_URL if provided, defaults to relative '/api' in local dev proxy, or directly to Vercel backend URL in production
const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'https://backend-liart-ten-64.vercel.app');

function getHeaders(contentType = true): Record<string, string> {
  const headers: Record<string, string> = {};
  if (contentType) headers['Content-Type'] = 'application/json';
  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: res.statusText }));
    let message = 'API request failed';
    if (typeof errorData.detail === 'string') {
      message = errorData.detail;
    } else if (Array.isArray(errorData.detail)) {
      message = errorData.detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ');
    } else if (errorData.message) {
      message = errorData.message;
    }
    throw new Error(message);
  }
  return res.json();
}

export const api = {
  // Auth
  signup: async (data: { email: string; username: string; password: string }): Promise<User> => {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const result = await handleResponse<any>(res);
    if (result.token) {
      localStorage.setItem('token', result.token);
    }
    return result.user || result;
  },

  login: async (data: { username_or_email: string; password: string }): Promise<{ token: string; user: User }> => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const result = await handleResponse<{ token: string; user: User }>(res);
    if (result.token) {
      localStorage.setItem('token', result.token);
    }
    return result;
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('token');
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  },

  getMe: async (): Promise<User | null> => {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders(false), credentials: 'include' });
    if (res.status === 401) {
      return null;
    }
    return handleResponse<User>(res);
  },

  // Character
  getCharacter: async (): Promise<Character> => {
    const res = await fetch(`${API_BASE}/character`, { headers: getHeaders(false), credentials: 'include' });
    return handleResponse<Character>(res);
  },

  // Quests
  getQuests: async (statusFilter = 'active'): Promise<Quest[]> => {
    const res = await fetch(`${API_BASE}/quests?status_filter=${statusFilter}`, { headers: getHeaders(false), credentials: 'include' });
    return handleResponse<Quest[]>(res);
  },

  createQuest: async (quest: {
    title: string;
    description?: string;
    attribute_id?: string;
    difficulty: string;
    is_recurring?: boolean;
    recurring_days?: string[];
  }): Promise<Quest> => {
    const res = await fetch(`${API_BASE}/quests`, {
      method: 'POST',
      headers: getHeaders(true),
      credentials: 'include',
      body: JSON.stringify(quest),
    });
    return handleResponse<Quest>(res);
  },

  completeQuest: async (
    questId: string,
    proof?: { proof_text: string; proof_link?: string }
  ): Promise<QuestCompletionResult> => {
    const res = await fetch(`${API_BASE}/quests/${questId}/complete`, {
      method: 'POST',
      headers: getHeaders(true),
      credentials: 'include',
      body: JSON.stringify(proof || {}),
    });
    return handleResponse<QuestCompletionResult>(res);
  },

  deleteQuest: async (questId: string): Promise<{ status: string }> => {
    const res = await fetch(`${API_BASE}/quests/${questId}`, {
      method: 'DELETE',
      headers: getHeaders(false),
      credentials: 'include',
    });
    return handleResponse<{ status: string }>(res);
  },

  // Shop & Inventory
  getShopItems: async (): Promise<Item[]> => {
    const res = await fetch(`${API_BASE}/shop/items`, { headers: getHeaders(false), credentials: 'include' });
    return handleResponse<Item[]>(res);
  },

  getInventory: async (): Promise<InventoryItem[]> => {
    const res = await fetch(`${API_BASE}/shop/inventory`, { headers: getHeaders(false), credentials: 'include' });
    return handleResponse<InventoryItem[]>(res);
  },

  purchaseItem: async (itemId: string): Promise<{ status: string; remaining_gold: number; item: Item }> => {
    const res = await fetch(`${API_BASE}/shop/purchase/${itemId}`, {
      method: 'POST',
      headers: getHeaders(false),
      credentials: 'include',
    });
    return handleResponse<{ status: string; remaining_gold: number; item: Item }>(res);
  },

  equipItem: async (itemId: string): Promise<{ status: string; item_id: string }> => {
    const res = await fetch(`${API_BASE}/shop/equip/${itemId}`, {
      method: 'POST',
      headers: getHeaders(false),
      credentials: 'include',
    });
    return handleResponse<{ status: string; item_id: string }>(res);
  },

  // History
  getHistory: async (): Promise<QuestHistory[]> => {
    const res = await fetch(`${API_BASE}/history`, { headers: getHeaders(false), credentials: 'include' });
    return handleResponse<QuestHistory[]>(res);
  },

  // Leaderboard
  getLeaderboard: async (): Promise<LeaderboardUser[]> => {
    const res = await fetch(`${API_BASE}/character/leaderboard`, { headers: getHeaders(false), credentials: 'include' });
    return handleResponse<LeaderboardUser[]>(res);
  },
};
