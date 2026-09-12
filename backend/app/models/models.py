import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Integer, Boolean, DateTime, ForeignKey, Text, CheckConstraint, UniqueConstraint, Date, JSON
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

def generate_uuid():
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    last_active_at = Column(DateTime(timezone=True), default=utc_now)

    character = relationship("Character", back_populates="user", uselist=False, cascade="all, delete-orphan")
    quests = relationship("Quest", back_populates="user", cascade="all, delete-orphan")
    inventory = relationship("Inventory", back_populates="user", cascade="all, delete-orphan")


class Character(Base):
    __tablename__ = "characters"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    level = Column(Integer, default=1, nullable=False)
    current_xp = Column(Integer, default=0, nullable=False)
    total_xp = Column(Integer, default=0, nullable=False)
    gold = Column(Integer, default=0, nullable=False)
    gems = Column(Integer, default=10, nullable=False)
    current_streak = Column(Integer, default=0, nullable=False)
    longest_streak = Column(Integer, default=0, nullable=False)
    last_completion_date = Column(String, nullable=True)  # YYYY-MM-DD
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="character")
    character_attributes = relationship("CharacterAttribute", back_populates="character", cascade="all, delete-orphan")


class Attribute(Base):
    __tablename__ = "attributes"

    id = Column(String, primary_key=True, default=generate_uuid)
    key = Column(String, unique=True, nullable=False, index=True)  # 'strength', 'intellect', etc.
    display_name = Column(String, nullable=False)
    icon = Column(String, nullable=False)
    description = Column(String, nullable=True)


class CharacterAttribute(Base):
    __tablename__ = "character_attributes"

    character_id = Column(String, ForeignKey("characters.id", ondelete="CASCADE"), primary_key=True)
    attribute_id = Column(String, ForeignKey("attributes.id", ondelete="CASCADE"), primary_key=True)
    level = Column(Integer, default=1, nullable=False)
    xp = Column(Integer, default=0, nullable=False)

    character = relationship("Character", back_populates="character_attributes")
    attribute = relationship("Attribute")


class Quest(Base):
    __tablename__ = "quests"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    attribute_id = Column(String, ForeignKey("attributes.id", ondelete="SET NULL"), nullable=True)
    difficulty = Column(String, default="medium", nullable=False)  # trivial, easy, medium, hard, epic
    is_recurring = Column(Boolean, default=False, nullable=False)
    recurrence_rule = Column(String, nullable=True)  # 'daily', 'weekly'
    status = Column(String, default="active", nullable=False, index=True)  # active, completed, archived
    due_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    user = relationship("User", back_populates="quests")
    attribute = relationship("Attribute")
    completions = relationship("QuestCompletion", back_populates="quest", cascade="all, delete-orphan")


class QuestCompletion(Base):
    __tablename__ = "quest_completions"

    id = Column(String, primary_key=True, default=generate_uuid)
    quest_id = Column(String, ForeignKey("quests.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    completed_at = Column(DateTime(timezone=True), default=utc_now, index=True)
    xp_awarded = Column(Integer, nullable=False)
    gold_awarded = Column(Integer, nullable=False)
    attribute_id = Column(String, nullable=True)
    streak_at_completion = Column(Integer, default=0, nullable=False)

    quest = relationship("Quest", back_populates="completions")


class Item(Base):
    __tablename__ = "items"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    cost = Column(Integer, nullable=False)
    type = Column(String, nullable=False)  # theme, badge, avatar_item, consumable
    metadata_json = Column(JSON, nullable=True)


class Inventory(Base):
    __tablename__ = "inventory"

    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    item_id = Column(String, ForeignKey("items.id", ondelete="CASCADE"), primary_key=True)
    acquired_at = Column(DateTime(timezone=True), default=utc_now)
    equipped = Column(Boolean, default=False, nullable=False)

    user = relationship("User", back_populates="inventory")
    item = relationship("Item")


class GoldTransaction(Base):
    __tablename__ = "gold_transactions"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    amount = Column(Integer, nullable=False)  # signed: + earn, - spend
    reason = Column(String, nullable=False)  # quest_reward, shop_purchase, streak_bonus
    reference_id = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
