import asyncio
from sqlalchemy.future import select
from app.core.database import AsyncSessionLocal, init_db
from app.models.models import Attribute, Item, User, Character, CharacterAttribute
from app.core.security import get_password_hash

DEFAULT_ATTRIBUTES = [
    {"key": "strength", "display_name": "Strength", "icon": "Dumbbell", "description": "Physical workout & endurance"},
    {"key": "intelligence", "display_name": "Intelligence", "icon": "Brain", "description": "Coding, reading & analytical mastery"},
    {"key": "discipline", "display_name": "Discipline", "icon": "ShieldCheck", "description": "Consistency, focus & anti-procrastination"},
    {"key": "creativity", "display_name": "Creativity", "icon": "Palette", "description": "Art, design & problem solving"},
    {"key": "vitality", "display_name": "Vitality", "icon": "HeartPulse", "description": "Sleep quality, nutrition & energy"},
    {"key": "focus", "display_name": "Focus", "icon": "Zap", "description": "Deep work sessions & concentration"},
    {"key": "confidence", "display_name": "Confidence", "icon": "Crown", "description": "Public speaking & mindset growth"}
]

DEFAULT_SHOP_ITEMS = [
    {
        "name": "Cyberpunk Neon Theme",
        "description": "Electric cyan and magenta high-contrast theme for matrix runners.",
        "cost": 50,
        "type": "theme",
        "metadata_json": {"theme_key": "cyberpunk", "primary_color": "#00f0ff", "bg_color": "#0a0a12"}
    },
    {
        "name": "16-Bit Dungeon Theme",
        "description": "Classic RPG parchment & gold aesthetic for retro adventurers.",
        "cost": 100,
        "type": "theme",
        "metadata_json": {"theme_key": "dungeon", "primary_color": "#e2b041", "bg_color": "#1a1612"}
    },
    {
        "name": "Cozy Lo-Fi Study Room Theme",
        "description": "Warm ambient pastel aesthetic for relaxed productivity sessions.",
        "cost": 75,
        "type": "theme",
        "metadata_json": {"theme_key": "lofi", "primary_color": "#e0a96d", "bg_color": "#1c1b22"}
    },
    {
        "name": "Flame Master Badge",
        "description": "Badge of honor for maintaining legendary habit streaks.",
        "cost": 150,
        "type": "badge",
        "metadata_json": {"icon": "Flame", "color": "#ff5500"}
    },
    {
        "name": "Scholar Crown Badge",
        "description": "Granted to master intellectuals and constant learners.",
        "cost": 200,
        "type": "badge",
        "metadata_json": {"icon": "Crown", "color": "#ffd700"}
    }
]

async def seed_data(session: AsyncSession = None):
    if session is not None:
        await _perform_seed(session)
    else:
        await init_db()
        async with AsyncSessionLocal() as db_session:
            await _perform_seed(db_session)

async def _perform_seed(session: AsyncSession):
    # Seed Attributes
    for attr_data in DEFAULT_ATTRIBUTES:
        res = await session.execute(select(Attribute).filter(Attribute.key == attr_data["key"]))
        if not res.scalars().first():
            session.add(Attribute(**attr_data))

    # Seed Items
    for item_data in DEFAULT_SHOP_ITEMS:
        res = await session.execute(select(Item).filter(Item.name == item_data["name"]))
        if not res.scalars().first():
            session.add(Item(**item_data))

    await session.commit()

    # Seed Default Demo User (hero123 / password123)
    user_res = await session.execute(select(User).filter(User.username == "hero123"))
    if not user_res.scalars().first():
        demo_user = User(
            email="hero@liferpg.com",
            username="hero123",
            password_hash=get_password_hash("password123")
        )
        session.add(demo_user)
        await session.commit()
        await session.refresh(demo_user)

        character = Character(user_id=demo_user.id, gold=100)
        session.add(character)
        await session.commit()
        await session.refresh(character)

        attrs_res = await session.execute(select(Attribute))
        attrs = attrs_res.scalars().all()
        for attr in attrs:
            char_attr = CharacterAttribute(character_id=character.id, attribute_id=attr.id)
            session.add(char_attr)
        await session.commit()

    print("Database successfully seeded with Attributes, Shop Items, and Demo User!")

if __name__ == "__main__":
    asyncio.run(seed_data())
