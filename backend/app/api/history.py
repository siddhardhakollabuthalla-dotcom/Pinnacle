from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.models import User, QuestCompletion, Quest
from app.schemas.schemas import HistoryOut

router = APIRouter(prefix="/history", tags=["history"])

@router.get("", response_model=List[HistoryOut])
async def get_history(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(QuestCompletion)
        .filter(QuestCompletion.user_id == current_user.id)
        .order_by(QuestCompletion.completed_at.desc())
        .limit(limit)
    )
    completions = result.scalars().all()

    out = []
    for c in completions:
        q_res = await db.execute(select(Quest).filter(Quest.id == c.quest_id))
        q = q_res.scalars().first()
        out.append(
            HistoryOut(
                id=c.id,
                quest_id=c.quest_id,
                completed_at=c.completed_at,
                xp_awarded=c.xp_awarded,
                gold_awarded=c.gold_awarded,
                streak_at_completion=c.streak_at_completion,
                quest_title=q.title if q else "Archived Quest",
                proof_text=c.proof_text,
                proof_link=c.proof_link
            )
        )
    return out
