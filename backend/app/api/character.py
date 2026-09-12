from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.models import User, Character, CharacterAttribute, Attribute
from app.schemas.schemas import CharacterOut, CharacterAttributeOut, AttributeOut, LeaderboardUserOut
from app.services.progression import xp_to_next_level, attribute_xp_to_next_level

router = APIRouter(prefix="/character", tags=["character"])

@router.get("", response_model=CharacterOut)
async def get_character(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Character)
        .filter(Character.user_id == current_user.id)
    )
    character = result.scalars().first()
    if not character:
        character = Character(user_id=current_user.id)
        db.add(character)
        await db.commit()
        await db.refresh(character)

        # Initialize attributes for newly fallback-created character
        attrs_result = await db.execute(select(Attribute))
        attrs = attrs_result.scalars().all()
        for attr in attrs:
            char_attr = CharacterAttribute(character_id=character.id, attribute_id=attr.id)
            db.add(char_attr)
        await db.commit()

    # Fetch attributes
    char_attrs_result = await db.execute(
        select(CharacterAttribute)
        .filter(CharacterAttribute.character_id == character.id)
    )
    char_attrs = char_attrs_result.scalars().all()

    # If character existed but attributes were empty, auto-seed them
    if not char_attrs:
        attrs_result = await db.execute(select(Attribute))
        attrs = attrs_result.scalars().all()
        for attr in attrs:
            char_attr = CharacterAttribute(character_id=character.id, attribute_id=attr.id)
            db.add(char_attr)
        await db.commit()
        char_attrs_result = await db.execute(
            select(CharacterAttribute)
            .filter(CharacterAttribute.character_id == character.id)
        )
        char_attrs = char_attrs_result.scalars().all()

    # Load attribute details
    attrs_out = []
    for ca in char_attrs:
        attr_res = await db.execute(select(Attribute).filter(Attribute.id == ca.attribute_id))
        attr_obj = attr_res.scalars().first()
        if attr_obj:
            attrs_out.append(
                CharacterAttributeOut(
                    attribute=AttributeOut.model_validate(attr_obj),
                    level=ca.level,
                    xp=ca.xp,
                    next_level_xp=attribute_xp_to_next_level(ca.level)
                )
            )

    return CharacterOut(
        id=character.id,
        level=character.level,
        current_xp=character.current_xp,
        next_level_xp=xp_to_next_level(character.level),
        total_xp=character.total_xp,
        gold=character.gold,
        gems=getattr(character, "gems", 10),
        current_streak=character.current_streak,
        longest_streak=character.longest_streak,
        last_completion_date=character.last_completion_date,
        attributes=attrs_out
    )

@router.get("/leaderboard", response_model=List[LeaderboardUserOut])
async def get_leaderboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Fetch all real users with their characters
    result = await db.execute(
        select(User, Character)
        .join(Character, Character.user_id == User.id)
    )
    user_char_pairs = result.all()

    all_players = []
    for user, character in user_char_pairs:
        all_players.append({
            "name": user.username,
            "level": character.level,
            "xp": character.total_xp,
            "streak": character.current_streak,
            "is_current": (user.id == current_user.id)
        })

    # Sort descending by XP, then level, then streak
    all_players.sort(key=lambda p: (p["xp"], p["level"], p["streak"]), reverse=True)

    # Assign ranks
    out = []
    for idx, p in enumerate(all_players[:50], start=1):
        out.append(LeaderboardUserOut(
            rank=idx,
            name=p["name"],
            level=p["level"],
            xp=p["xp"],
            streak=p["streak"],
            is_current=p["is_current"]
        ))

    return out
