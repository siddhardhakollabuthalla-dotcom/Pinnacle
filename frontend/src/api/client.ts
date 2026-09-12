import type { User, Character, Quest, QuestCompletionResult, Item, InventoryItem, QuestHistory } from '../types';

// Use relative '/api' endpoint so Vite proxies directly to FastAPI backend, resolving cross-origin HTTPS -> HTTP browser blocks
const API_BASE = '/api';

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
    return handleResponse<User>(res);
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
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  },

  getMe: async (): Promise<User> => {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders(false), credentials: 'include' });
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
  }): Promise<Quest> => {
    const res = await fetch(`${API_BASE}/quests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(quest),
    });
    return handleResponse<Quest>(res);
  },

  completeQuest: async (questId: string): Promise<QuestCompletionResult> => {
    const res = await fetch(`${API_BASE}/quests/${questId}/complete`, {
      method: 'POST',
      credentials: 'include',
    });
    return handleResponse<QuestCompletionResult>(res);
  },

  deleteQuest: async (questId: string): Promise<{ status: string }> => {
    const res = await fetch(`${API_BASE}/quests/${questId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return handleResponse<{ status: string }>(res);
  },

  // Shop & Inventory
  getShopItems: async (): Promise<Item[]> => {
    const res = await fetch(`${API_BASE}/shop/items`, { credentials: 'include' });
    return handleResponse<Item[]>(res);
  },

  getInventory: async (): Promise<InventoryItem[]> => {
    const res = await fetch(`${API_BASE}/shop/inventory`, { credentials: 'include' });
    return handleResponse<InventoryItem[]>(res);
  },

  purchaseItem: async (itemId: string): Promise<{ status: string; remaining_gold: number; item: Item }> => {
    const res = await fetch(`${API_BASE}/shop/purchase/${itemId}`, {
      method: 'POST',
      credentials: 'include',
    });
    return handleResponse<{ status: string; remaining_gold: number; item: Item }>(res);
  },

  equipItem: async (itemId: string): Promise<{ status: string; item_id: string }> => {
    const res = await fetch(`${API_BASE}/shop/equip/${itemId}`, {
      method: 'POST',
      credentials: 'include',
    });
    return handleResponse<{ status: string; item_id: string }>(res);
  },

  // History
  getHistory: async (): Promise<QuestHistory[]> => {
    const res = await fetch(`${API_BASE}/history`, { credentials: 'include' });
    return handleResponse<QuestHistory[]>(res);
  },
};
