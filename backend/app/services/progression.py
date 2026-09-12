import math
from datetime import datetime, timezone, timedelta
from app.models.models import Character, CharacterAttribute, QuestCompletion, GoldTransaction

# Base reward lookup
DIFFICULTY_REWARDS = {
    "trivial": {"xp": 5, "gold": 1},
    "easy": {"xp": 15, "gold": 3},
    "medium": {"xp": 30, "gold": 7},
    "hard": {"xp": 60, "gold": 15},
    "epic": {"xp": 120, "gold": 35},
}

def xp_to_next_level(level: int) -> int:
    """Calculates XP required to pass the current level."""
    # xp_to_reach_level(n) = floor(50 * (n ** 1.6))
    return math.floor(50 * (level ** 1.6))

def attribute_xp_to_next_level(level: int) -> int:
    """Calculates XP required for per-attribute level up (gentler curve)."""
    return math.floor(30 * (level ** 1.4))

def calculate_rewards(difficulty: str, current_streak: int):
    base = DIFFICULTY_REWARDS.get(difficulty.lower(), DIFFICULTY_REWARDS["medium"])
    # Multiplier: 1 + min(streak, 30) * 0.02
    streak_mult = 1.0 + min(current_streak, 30) * 0.02
    
    final_xp = math.floor(base["xp"] * streak_mult)
    final_gold = math.floor(base["gold"] * streak_mult)
    return final_xp, final_gold

def update_streak(character: Character) -> int:
    """Updates user streak based on UTC date comparison."""
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    yesterday_str = (datetime.now(timezone.utc) - timedelta(days=1)).strftime("%Y-%m-%d")

    if character.last_completion_date == today_str:
        # Already completed a quest today; streak unchanged
        return character.current_streak

    if character.last_completion_date == yesterday_str:
        character.current_streak += 1
    else:
        character.current_streak = 1

    if character.current_streak > character.longest_streak:
        character.longest_streak = character.current_streak

    character.last_completion_date = today_str
    return character.current_streak

def award_xp_and_gold(character: Character, xp_amount: int, gold_amount: int):
    character.current_xp += xp_amount
    character.total_xp += xp_amount
    character.gold += gold_amount

    leveled_up = False
    new_level = character.level

    while character.current_xp >= xp_to_next_level(character.level):
        character.current_xp -= xp_to_next_level(character.level)
        character.level += 1
        new_level = character.level
        leveled_up = True
        # Level up gold bonus
        character.gold += character.level * 10

    return leveled_up, new_level

def award_attribute_xp(char_attr: CharacterAttribute, xp_amount: int):
    char_attr.xp += xp_amount
    attr_leveled_up = False
    
    while char_attr.xp >= attribute_xp_to_next_level(char_attr.level):
        char_attr.xp -= attribute_xp_to_next_level(char_attr.level)
        char_attr.level += 1
        attr_leveled_up = True

    return attr_leveled_up, char_attr.level
