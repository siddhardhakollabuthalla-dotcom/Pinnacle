export interface User {
  id: string;
  email: string;
  username: string;
  created_at: string;
}

export interface Attribute {
  id: string;
  key: string;
  display_name: string;
  icon: string;
  description?: string;
}

export interface CharacterAttribute {
  attribute: Attribute;
  level: number;
  xp: number;
  next_level_xp: number;
}

export interface Character {
  id: string;
  level: number;
  current_xp: number;
  next_level_xp: number;
  total_xp: number;
  gold: number;
  gems?: number;
  current_streak: number;
  longest_streak: number;
  last_completion_date?: string;
  attributes: CharacterAttribute[];
}

export interface Quest {
  id: string;
  title: string;
  description?: string;
  attribute_id?: string;
  attribute?: Attribute;
  difficulty: 'trivial' | 'easy' | 'medium' | 'hard' | 'epic' | 'legendary';
  is_recurring: boolean;
  recurrence_rule?: string;
  status: 'active' | 'completed' | 'archived';
  due_at?: string;
  created_at: string;
}

export interface QuestCompletionResult {
  quest_id: string;
  xp_awarded: number;
  gold_awarded: number;
  leveled_up: boolean;
  new_level: number;
  current_streak: number;
  attribute_leveled_up: boolean;
  new_attribute_level?: number;
  proof_text?: string;
  proof_link?: string;
}

export interface Item {
  id: string;
  name: string;
  description?: string;
  cost: number;
  type: 'theme' | 'badge' | 'avatar_item' | 'consumable';
  metadata_json?: any;
}

export interface InventoryItem {
  item: Item;
  acquired_at: string;
  equipped: boolean;
}

export interface QuestHistory {
  id: string;
  quest_id: string;
  completed_at: string;
  xp_awarded: number;
  gold_awarded: number;
  streak_at_completion: number;
  quest_title?: string;
  proof_text?: string;
  proof_link?: string;
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  level: number;
  xp: number;
  streak: number;
  is_current?: boolean;
}
