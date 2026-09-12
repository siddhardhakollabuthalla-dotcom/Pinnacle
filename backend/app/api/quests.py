from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime, timezone

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.models import User, Character, Quest, QuestCompletion, Attribute, CharacterAttribute, GoldTransaction
from app.schemas.schemas import QuestCreate, QuestUpdate, QuestOut, QuestCompletionResult, AttributeOut
from app.services.progression import (
    calculate_rewards, update_streak, award_xp_and_gold, award_attribute_xp
)

router = APIRouter(prefix="/quests", tags=["quests"])

@router.get("", response_model=List[QuestOut])
async def get_quests(
    status_filter: Optional[str] = "active",
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(Quest).filter(Quest.user_id == current_user.id)
    if status_filter and status_filter.lower() != "all":
        query = query.filter(Quest.status == status_filter)

    result = await db.execute(query.order_by(Quest.created_at.desc()))
    quests = result.scalars().all()

    quests_out = []
    for q in quests:
        attr_obj = None
        if q.attribute_id:
            attr_res = await db.execute(select(Attribute).filter(Attribute.id == q.attribute_id))
            attr_obj = attr_res.scalars().first()
        
        q_out = QuestOut(
            id=q.id,
            title=q.title,
            description=q.description,
            attribute_id=q.attribute_id,
            attribute=AttributeOut.model_validate(attr_obj) if attr_obj else None,
            difficulty=q.difficulty,
            is_recurring=q.is_recurring,
            recurrence_rule=q.recurrence_rule,
            status=q.status,
            due_at=q.due_at,
            created_at=q.created_at
        )
        quests_out.append(q_out)

    return quests_out

@router.post("", response_model=QuestOut)
async def create_quest(
    quest_in: QuestCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if quest_in.attribute_id:
        attr_check = await db.execute(select(Attribute).filter(Attribute.id == quest_in.attribute_id))
        if not attr_check.scalars().first():
            raise HTTPException(status_code=400, detail="Invalid attribute ID")

    new_quest = Quest(
        user_id=current_user.id,
        title=quest_in.title,
        description=quest_in.description,
        attribute_id=quest_in.attribute_id,
        difficulty=quest_in.difficulty,
        is_recurring=quest_in.is_recurring,
        recurrence_rule=quest_in.recurrence_rule,
        due_at=quest_in.due_at,
        status="active"
    )
    db.add(new_quest)
    await db.commit()
    await db.refresh(new_quest)

    attr_obj = None
    if new_quest.attribute_id:
        attr_res = await db.execute(select(Attribute).filter(Attribute.id == new_quest.attribute_id))
        attr_obj = attr_res.scalars().first()

    return QuestOut(
        id=new_quest.id,
        title=new_quest.title,
        description=new_quest.description,
        attribute_id=new_quest.attribute_id,
        attribute=AttributeOut.model_validate(attr_obj) if attr_obj else None,
        difficulty=new_quest.difficulty,
        is_recurring=new_quest.is_recurring,
        recurrence_rule=new_quest.recurrence_rule,
        status=new_quest.status,
        due_at=new_quest.due_at,
        created_at=new_quest.created_at
    )

@router.patch("/{quest_id}", response_model=QuestOut)
async def update_quest(
    quest_id: str,
    quest_in: QuestUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Quest).filter(Quest.id == quest_id, Quest.user_id == current_user.id)
    )
    quest = result.scalars().first()
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found")

    update_data = quest_in.model_dump(exclude_unset=True)
    if "attribute_id" in update_data and update_data["attribute_id"] is not None:
        attr_check = await db.execute(select(Attribute).filter(Attribute.id == update_data["attribute_id"]))
        if not attr_check.scalars().first():
            raise HTTPException(status_code=400, detail="Invalid attribute ID")

    for field, value in update_data.items():
        setattr(quest, field, value)

    await db.commit()
    await db.refresh(quest)

    attr_obj = None
    if quest.attribute_id:
        attr_res = await db.execute(select(Attribute).filter(Attribute.id == quest.attribute_id))
        attr_obj = attr_res.scalars().first()

    return QuestOut(
        id=quest.id,
        title=quest.title,
        description=quest.description,
        attribute_id=quest.attribute_id,
        attribute=AttributeOut.model_validate(attr_obj) if attr_obj else None,
        difficulty=quest.difficulty,
        is_recurring=quest.is_recurring,
        recurrence_rule=quest.recurrence_rule,
        status=quest.status,
        due_at=quest.due_at,
        created_at=quest.created_at
    )

@router.delete("/{quest_id}")
async def delete_quest(
    quest_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Quest).filter(Quest.id == quest_id, Quest.user_id == current_user.id)
    )
    quest = result.scalars().first()
    if not quest:
        # Idempotent delete: if quest is already deleted, return success
        return {"status": "deleted", "id": quest_id}

    await db.delete(quest)
    await db.commit()
    return {"status": "deleted", "id": quest_id}

@router.post("/{quest_id}/complete", response_model=QuestCompletionResult)
async def complete_quest(
    quest_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # 1. Fetch quest with user ownership check
    result = await db.execute(
        select(Quest).filter(Quest.id == quest_id, Quest.user_id == current_user.id)
    )
    quest = result.scalars().first()
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found")

    if quest.status == "completed" and not quest.is_recurring:
        raise HTTPException(status_code=400, detail="Quest already completed")

    # 2. Fetch character state
    char_result = await db.execute(
        select(Character).filter(Character.user_id == current_user.id)
    )
    character = char_result.scalars().first()
    if not character:
        character = Character(user_id=current_user.id)
        db.add(character)
        await db.commit()
        await db.refresh(character)

    # 3. Update streak
    current_streak = update_streak(character)

    # 4. Compute rewards server-side (Anti-cheat core principle)
    xp_awarded, gold_awarded = calculate_rewards(quest.difficulty, current_streak)

    # 5. Apply XP and Gold to Character
    leveled_up, new_level = award_xp_and_gold(character, xp_awarded, gold_awarded)

    # 6. Apply Attribute XP if bound to attribute
    attr_leveled_up = False
    new_attr_level = None
    if quest.attribute_id:
        ca_res = await db.execute(
            select(CharacterAttribute).filter(
                CharacterAttribute.character_id == character.id,
                CharacterAttribute.attribute_id == quest.attribute_id
            )
        )
        char_attr = ca_res.scalars().first()
        if not char_attr:
            char_attr = CharacterAttribute(character_id=character.id, attribute_id=quest.attribute_id)
            db.add(char_attr)
        
        attr_leveled_up, new_attr_level = award_attribute_xp(char_attr, xp_awarded)

    # 7. Record Completion Audit Log
    completion = QuestCompletion(
        quest_id=quest.id,
        user_id=current_user.id,
        completed_at=datetime.now(timezone.utc),
        xp_awarded=xp_awarded,
        gold_awarded=gold_awarded,
        attribute_id=quest.attribute_id,
        streak_at_completion=current_streak
    )
    db.add(completion)

    # 8. Record Gold Transaction Ledger
    gold_tx = GoldTransaction(
        user_id=current_user.id,
        amount=gold_awarded,
        reason="quest_reward",
        reference_id=quest.id
    )
    db.add(gold_tx)

    # 9. Update Quest Status
    if quest.is_recurring:
        # Reset recurring quest for active list, update due date if applicable
        quest.status = "active"
    else:
        quest.status = "completed"

    await db.commit()

    return QuestCompletionResult(
        quest_id=quest.id,
        xp_awarded=xp_awarded,
        gold_awarded=gold_awarded,
        leveled_up=leveled_up,
        new_level=new_level,
        current_streak=current_streak,
        attribute_leveled_up=attr_leveled_up,
        new_attribute_level=new_attr_level
    )
