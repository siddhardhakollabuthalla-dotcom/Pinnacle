from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Any
from datetime import datetime

# Auth Schemas
class UserCreate(BaseModel):
    email: str
    username: str
    password: str

class UserLogin(BaseModel):
    username_or_email: str
    password: str

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    email: str
    username: str
    created_at: datetime

# Attribute Schemas
class AttributeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    key: str
    display_name: str
    icon: str
    description: Optional[str] = None

class CharacterAttributeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    attribute: AttributeOut
    level: int
    xp: int
    next_level_xp: int

# Character Schemas
class CharacterOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    level: int
    current_xp: int
    next_level_xp: int
    total_xp: int
    gold: int
    gems: int = 10
    current_streak: int
    longest_streak: int
    last_completion_date: Optional[str] = None
    attributes: List[CharacterAttributeOut] = []

# Quest Schemas
class QuestCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    attribute_id: Optional[str] = None
    difficulty: str = Field("medium", pattern="^(trivial|easy|medium|hard|epic)$")
    is_recurring: bool = False
    recurrence_rule: Optional[str] = None
    due_at: Optional[datetime] = None

class QuestUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    attribute_id: Optional[str] = None
    difficulty: Optional[str] = None
    is_recurring: Optional[bool] = None
    recurrence_rule: Optional[str] = None
    due_at: Optional[datetime] = None
    status: Optional[str] = None

class QuestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    description: Optional[str]
    attribute_id: Optional[str]
    attribute: Optional[AttributeOut] = None
    difficulty: str
    is_recurring: bool
    recurrence_rule: Optional[str]
    status: str
    due_at: Optional[datetime]
    created_at: datetime

class QuestCompletionResult(BaseModel):
    quest_id: str
    xp_awarded: int
    gold_awarded: int
    leveled_up: bool
    new_level: int
    current_streak: int
    attribute_leveled_up: bool = False
    new_attribute_level: Optional[int] = None

# Shop & Inventory Schemas
class ItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    description: Optional[str]
    cost: int
    type: str
    metadata_json: Optional[Any] = None

class InventoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    item: ItemOut
    acquired_at: datetime
    equipped: bool

class HistoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    quest_id: str
    completed_at: datetime
    xp_awarded: int
    gold_awarded: int
    streak_at_completion: int
    quest_title: Optional[str] = None
