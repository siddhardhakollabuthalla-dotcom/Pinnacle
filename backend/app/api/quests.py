from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime, timezone, timedelta, time

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.models import User, Character, Quest, QuestCompletion, Attribute, CharacterAttribute, GoldTransaction
from app.schemas.schemas import QuestCreate, QuestUpdate, QuestOut, QuestCompletionResult, AttributeOut, QuestCompleteRequest
from app.services.progression import (
    calculate_rewards, update_streak, award_xp_and_gold, award_attribute_xp
)

router = APIRouter(prefix="/quests", tags=["quests"])

def _parse_recurring_days(recurrence_rule: Optional[str]) -> Optional[List[str]]:
    if not recurrence_rule:
        return None
    if recurrence_rule.startswith("days:"):
        return [d.strip() for d in recurrence_rule[5:].split(",") if d.strip()]
    return None

def _format_recurrence_rule(is_recurring: bool, recurrence_rule: Optional[str], recurring_days: Optional[List[str]]) -> Optional[str]:
    if not is_recurring:
        return None
    if recurring_days and len(recurring_days) > 0:
        return f"days:{','.join(recurring_days)}"
    return recurrence_rule or "daily"

def _get_current_4am_reset_boundary(now: datetime) -> datetime:
    """Calculates the most recent 4:00 AM boundary timestamp."""
    four_am_today = datetime.combine(now.date(), time(4, 0, 0), tzinfo=timezone.utc)
    if now >= four_am_today:
        return four_am_today
    else:
        return four_am_today - timedelta(days=1)

@router.get("", response_model=List[QuestOut])
async def get_quests(
    status_filter: Optional[str] = "active",
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    now = datetime.now(timezone.utc)
    reset_boundary = _get_current_4am_reset_boundary(now)

    query = select(Quest).filter(Quest.user_id == current_user.id)
    result = await db.execute(query.order_by(Quest.created_at.desc()))
    quests = result.scalars().all()

    quests_out = []
    for q in quests:
        # Check last completion for recurring quests to evaluate if reset at 4:00 AM has passed
        q_status = q.status
        if q.is_recurring:
            comp_res = await db.execute(
                select(QuestCompletion)
                .filter(QuestCompletion.quest_id == q.id, QuestCompletion.user_id == current_user.id)
                .order_by(QuestCompletion.completed_at.desc())
            )
            latest_completion = comp_res.scalars().first()

            if latest_completion:
                comp_time = latest_completion.completed_at
                if comp_time.tzinfo is None:
                    comp_time = comp_time.replace(tzinfo=timezone.utc)

                # If completed after the most recent 4:00 AM reset, keep status as completed
                if comp_time >= reset_boundary:
                    q_status = "completed"
                else:
                    q_status = "active"

        # Apply status filter
        if status_filter and status_filter.lower() != "all" and q_status != status_filter.lower():
            continue

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
            recurring_days=_parse_recurring_days(q.recurrence_rule),
            status=q_status,
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

    rec_rule = _format_recurrence_rule(quest_in.is_recurring, quest_in.recurrence_rule, quest_in.recurring_days)

    new_quest = Quest(
        user_id=current_user.id,
        title=quest_in.title,
        description=quest_in.description,
        attribute_id=quest_in.attribute_id,
        difficulty=quest_in.difficulty,
        is_recurring=quest_in.is_recurring or bool(quest_in.recurring_days),
        recurrence_rule=rec_rule,
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
        recurring_days=_parse_recurring_days(new_quest.recurrence_rule),
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
        recurring_days=_parse_recurring_days(quest.recurrence_rule),
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
    complete_in: Optional[QuestCompleteRequest] = None,
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

    # Check if recurring quest was already completed in the current 4:00 AM cycle
    if quest.is_recurring:
        now = datetime.now(timezone.utc)
        reset_boundary = _get_current_4am_reset_boundary(now)
        comp_res = await db.execute(
            select(QuestCompletion)
            .filter(QuestCompletion.quest_id == quest.id, QuestCompletion.user_id == current_user.id)
            .order_by(QuestCompletion.completed_at.desc())
        )
        latest_comp = comp_res.scalars().first()
        if latest_comp:
            comp_time = latest_comp.completed_at
            if comp_time.tzinfo is None:
                comp_time = comp_time.replace(tzinfo=timezone.utc)
            if comp_time >= reset_boundary:
                raise HTTPException(status_code=400, detail="This quest was already completed for today. It will reset after 4:00 AM.")

    # Anti-cheat proof verification
    if not complete_in or not complete_in.proof_text or len(complete_in.proof_text.strip()) < 5:
        raise HTTPException(
            status_code=400,
            detail="Verification proof is required to complete this quest (minimum 5 characters)."
        )

    proof_text = complete_in.proof_text.strip()
    proof_link = complete_in.proof_link.strip() if complete_in.proof_link else None

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

    # 7. Record Completion Audit Log with Verifiable Proof
    completion = QuestCompletion(
        quest_id=quest.id,
        user_id=current_user.id,
        completed_at=datetime.now(timezone.utc),
        xp_awarded=xp_awarded,
        gold_awarded=gold_awarded,
        attribute_id=quest.attribute_id,
        streak_at_completion=current_streak,
        proof_text=proof_text,
        proof_link=proof_link
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
        trophies_awarded=1,
        total_trophies=character.trophies or 0,
        leveled_up=leveled_up,
        new_level=new_level,
        current_streak=current_streak,
        attribute_leveled_up=attr_leveled_up,
        new_attribute_level=new_attr_level,
        proof_text=proof_text,
        proof_link=proof_link
    )
